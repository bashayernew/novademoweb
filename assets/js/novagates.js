/* Lumé Beauty — Novagates SDK integration (shared across ALL pages)
   ---------------------------------------------------------------------------
   Single source of truth for the Novagates Virtual Try-On wiring. Exposes:
     window.NovagatesTryOn.open(product, opts)   // opts: { label, state }
     window.NovagatesTryOn.openById(id)
     window.NovagatesTryOn.canTryOn(product)     // is this product try-on-able?
     window.NovagatesTryOn.labelFor(product)
   The real try-on engine streams from cdn.novagates.com; this just gates it,
   mints a token, and mounts it in a modal. */
(function () {
  "use strict";

  /* ── Config (single source of truth) ─────────────────────────── */
  window.NOVAGATES_CONFIG = window.NOVAGATES_CONFIG || {
    sdkBase: "https://cdn.novagates.com/sdk/novagates-sdk.js",
    sessionToken: "",
    apiKey: "pk_3b5f9c910f25d414aa97dca4551914b8",
    // localProxy=true: the shim intercepts the SDK's hardcoded *.novagates.com/api/*
    //   calls and redirects them — to `apiBase` if set (the real dashboard), else
    //   to THIS origin (the local /api stubs).
    localProxy: true,
    // Real backend base. When set, the SDK's /api/* calls go to the LIVE dashboard
    //   instead of this origin's stubs, so brand-features/usage are real and tracked.
    apiBase: "https://staging.novagates.com",
    // Fetch a fresh sessionToken from here on each try-on (never goes stale).
    tokenEndpoint: "/api/sdk-token",
    defaultModule: "virtual-try-on-makeups",
    // "product" = the try-on shows only the opened product's shades (matches the
    //   product page). "all" = the SDK rail shows your whole catalog (browsing).
    productsScope: "product",
    // DIAGNOSTIC: true = feed Novagates' own demo catalog instead of ours.
    useDemoCatalog: false,
    moduleByType: {
      skincare: "skin-analysis",
      // Hair, lenses, and nails live in the FULL canvas module (not makeup-only,
      // not accessories) — confirmed by Novagates' own hub pages.
      hair_color: "virtual-try-on",
      eye_lenses: "virtual-try-on",
      nail_polish: "virtual-try-on",
      press_on_nails: "virtual-try-on",
      // 3D accessories (need .glb models)
      rings: "virtual-try-on-accessories",
      bracelets: "virtual-try-on-accessories",
      bangles: "virtual-try-on-accessories",
      watches: "virtual-try-on-accessories",
      earrings: "virtual-try-on-accessories",
      necklace: "virtual-try-on-accessories",
      sunglasses: "virtual-try-on-accessories",
      headbands: "virtual-try-on-accessories",
      tiaras: "virtual-try-on-accessories"
    }
  };

  /* product_type -> human label. Also the allowlist of try-on-able types. */
  var TRYON_LABELS = {
    lip_color: "Lip Colour Virtual Try-On", lip_liner: "Lip Liner Virtual Try-On",
    lip_plump: "Lip Plumper Virtual Try-On",
    eyeshadow: "Eyeshadow Virtual Try-On", foundation: "Foundation Try-On",
    blush: "Blush Virtual Try-On", blusher: "Blush Virtual Try-On",
    highlighter: "Highlighter Virtual Try-On", contour: "Contour Virtual Try-On",
    bronzer: "Bronzer Virtual Try-On", concealer: "Concealer Try-On",
    mascara: "Mascara Virtual Try-On", eyeliner: "Eyeliner Virtual Try-On",
    eyebrows: "Eyebrow Virtual Try-On", lashes: "Lashes Virtual Try-On",
    nail_polish: "Nail Polish Virtual Try-On", press_on_nails: "Press-On Nails Virtual Try-On",
    eye_lenses: "Eye Colour Try-On", hair_color: "Hair Colour Virtual Try-On",
    rings: "Rings Virtual Try-On", bracelets: "Bracelets Virtual Try-On",
    bangles: "Bangles Virtual Try-On", watches: "Watches Virtual Try-On",
    headbands: "Headbands Virtual Try-On", tiaras: "Tiara Virtual Try-On",
    sunglasses: "Sunglasses Virtual Try-On", earrings: "Earrings Virtual Try-On",
    necklace: "Necklace Virtual Try-On", skincare: "Skin Analysis",
    shop_the_look: "Shop The Look — Try On"
  };

  function cfg() { return window.NOVAGATES_CONFIG || {}; }
  function types(p) {
    return Array.isArray(p.product_types) ? p.product_types : (p.product_types ? [p.product_types] : []);
  }

  /* ── fetch / XHR shim (rewrites the SDK's hardcoded API host) ──── */
  (function installShim() {
    if (!cfg().localProxy) return;
    if (window.__ngShimInstalled) return;
    window.__ngShimInstalled = true;
    var origin = location.origin;
    // Where the SDK's *.novagates.com/api/* calls get redirected: the real
    // dashboard (apiBase) if configured, otherwise this origin's local stubs.
    var apiTarget = String(cfg().apiBase || origin).replace(/\/+$/, "");
    function rewrite(u) {
      try {
        var url = new URL(u, origin);
        if (/(^|\.)novagates\.com$/.test(url.hostname) && url.pathname.indexOf("/api/") === 0) {
          return apiTarget + url.pathname + url.search;
        }
      } catch (e) {}
      return u;
    }
    var of = window.fetch;
    if (of) {
      window.fetch = function (input, init) {
        try {
          if (typeof input === "string") input = rewrite(input);
          else if (input && input.url) { var nu = rewrite(input.url); if (nu !== input.url) input = new Request(nu, input); }
        } catch (e) {}
        return of.call(this, input, init);
      };
    }
    var oo = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (m, u, a, us, pw) {
      return oo.call(this, m, rewrite(u), a === undefined ? true : a, us, pw);
    };
  })();

  /* ── Camera release ───────────────────────────────────────────────
     The SDK opens the webcam but doesn't always stop the stream on close,
     which leaves the camera busy for the next try-on. We wrap getUserMedia
     to keep references, then stop all tracks when the modal closes. */
  (function trackCameras() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return;
    if (navigator.mediaDevices.__ngWrapped) return;
    navigator.mediaDevices.__ngWrapped = true;
    window.__ngStreams = [];
    var ogum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = function (constraints) {
      return ogum(constraints).then(function (stream) {
        try { window.__ngStreams.push(stream); } catch (e) {}
        return stream;
      });
    };
  })();

  function stopCameras() {
    try {
      (window.__ngStreams || []).forEach(function (s) {
        try { s.getTracks().forEach(function (t) { t.stop(); }); } catch (e) {}
      });
      window.__ngStreams = [];
    } catch (e) {}
  }

  /* ── Helpers ──────────────────────────────────────────────────── */
  function canTryOn(p) {
    if (!p) return false;
    var t = types(p);
    for (var i = 0; i < t.length; i++) if (TRYON_LABELS[t[i]]) return true;
    return false;
  }
  function labelFor(p) {
    var t = types(p);
    for (var i = 0; i < t.length; i++) if (TRYON_LABELS[t[i]]) return TRYON_LABELS[t[i]];
    return "Virtual Try-On";
  }
  function moduleForProduct(p) {
    var c = cfg(), map = c.moduleByType || {}, t = types(p);
    for (var i = 0; i < t.length; i++) if (map[t[i]]) return map[t[i]];
    return c.module || c.defaultModule || "virtual-try-on-makeups";
  }
  function defaultHex(p) {
    if (p.optionType === "shade" && p.options && p.options[0] && typeof p.options[0] === "object" && p.options[0].hex) {
      return p.options[0].hex;
    }
    return (p.grad && p.grad[0]) || "#cccccc";
  }
  function defaultOption(p) {
    if (p.options && p.options[0]) { var o = p.options[0]; return typeof o === "object" ? o.name : o; }
    return p.name || "";
  }
  function buildProductData(p, state) {
    var hex = (state && state.hex) ? state.hex : defaultHex(p);
    var option = (state && state.option) ? state.option : defaultOption(p);
    var img = p.image || "";
    return {
      id: p.id, name: p.name, color: option, hexacode: hex, is_product_try_on: 1,
      swatch_image: img, image: { url: img }, thumbnail: { url: img },
      price: { regularPrice: { amount: { currency: "USD", value: Number(p.price) || 0 } } },
      product_types: types(p)[0] || "", category: p.category || ""
    };
  }

  /* ── Build the SDK product feed (productsSource) from OUR catalog ──
     One entry per shade so the in-panel rail + colours are Lumé's, not the
     SDK's demo data. Schema matches cdn.novagates.com/sdk/demo-catalog.json. */
  var PT_MAP = { eyeshadow: "eye_shadow", lip_plump: "lip_plumper", blusher: "blush" };
  // True 3D-accessory types (use the accessories module + .glb). Hair/lenses/
  // nails are NOT here — they ride the makeup pipeline in the full canvas.
  var ACCESSORY_TYPES = {
    rings: 1, bracelets: 1, bangles: 1, watches: 1, earrings: 1, glasses: 1,
    sunglasses: 1, headbands: 1, tiaras: 1, crowns: 1, caps: 1, hats: 1,
    chokers: 1, necklace: 1, scarves: 1, pendants: 1
  };

  function colorFamily(hex) {
    hex = (hex || "").replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
    var r = parseInt(hex.substr(0, 2), 16) || 0, g = parseInt(hex.substr(2, 2), 16) || 0, b = parseInt(hex.substr(4, 2), 16) || 0;
    var max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    var l = (max + min) / 510;
    var h = 0;
    if (d) {
      if (max === r) h = ((g - b) / d) % 6;
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    if (d < 24) return l > 0.7 ? "beige" : (l < 0.32 ? "brown" : "nude");
    if (h < 15 || h >= 345) return "red";
    if (h < 45) return l < 0.45 ? "brown" : "orange";
    if (h < 70) return "bronze";
    if (h < 170) return "nude";
    if (h < 320) return "purple";
    return "pink";
  }

  function catalogEntry(p, shade, idx) {
    var ourType = types(p)[0] || "";
    var sdkType = PT_MAP[ourType] || ourType;
    var isAcc = !!ACCESSORY_TYPES[ourType];
    var hex = (shade && shade.hex) ? shade.hex : ((p.grad && p.grad[0]) || "#cccccc");
    var nm = p.name + (shade && shade.name ? (" — " + shade.name) : "");
    var img = p.image || "";
    return {
      id: 900000 + idx, uid: String(900000 + idx), sku: "LUME-" + p.id + "-" + idx, type_id: "simple",
      name: nm, brand: "Lumé", manufacturer: "Lumé", category: "cosmetic-product",
      product_types: sdkType,
      color: colorFamily(hex), hexacode: hex, sub_color: shade && shade.name ? shade.name : null,
      texture: "matte", is_product_try_on: 1, asset_url: null,
      technologies: isAcc ? "virtual_try_on_accessories" : "virtual_try_on|virtual_try_on_makeups",
      image: { url: img }, swatch_image: { url: img }, thumbnail: { url: img },
      price: { regularPrice: { amount: { currency: "USD", value: Number(p.price) || 0 } } }
    };
  }

  function buildCatalog() {
    var list = [], src = window.PRODUCTS || [], idx = 0;
    for (var i = 0; i < src.length; i++) {
      var p = src[i];
      if (!canTryOn(p)) continue;
      var shades = (p.optionType === "shade" && p.options && p.options.length) ? p.options : [null];
      for (var j = 0; j < shades.length; j++) {
        var o = shades[j];
        list.push(catalogEntry(p, (o && typeof o === "object") ? o : null, idx++));
      }
    }
    return list;
  }

  /* Just the opened product's shades — so the try-on shows exactly the colours
     the product offers (matches the product page swatches). */
  function buildProductCatalog(p) {
    var shades = (p.optionType === "shade" && p.options && p.options.length) ? p.options : [null];
    var list = [];
    for (var j = 0; j < shades.length; j++) {
      var o = shades[j];
      list.push(catalogEntry(p, (o && typeof o === "object") ? o : null, j));
    }
    return list;
  }

  function resolveSessionToken(cb) {
    var c = cfg();
    if (c.tokenEndpoint) {
      fetch(c.tokenEndpoint, { method: "GET" })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { cb((d && (d.sessionToken || d.access_token)) || c.sessionToken || ""); })
        .catch(function () { cb(c.sessionToken || ""); });
    } else { cb(c.sessionToken || ""); }
  }

  function loadSdk(moduleName, token, cb) {
    if (window.Novagates) { cb(true); return; }
    if (window.__ngSdkLoading) { window.__ngSdkLoadQueue.push(cb); return; }
    window.__ngSdkLoading = true;
    window.__ngSdkLoadQueue = [cb];
    var c = cfg();
    var base = c.sdkBase || "https://cdn.novagates.com/sdk/novagates-sdk.js";
    var auth = token ? "&sessionToken=" + encodeURIComponent(token)
                     : "&apiKey=" + encodeURIComponent(c.apiKey || "");
    var url = base + "?module=" + encodeURIComponent(moduleName || c.defaultModule || "virtual-try-on-makeups") + auth;
    var s = document.createElement("script");
    s.src = url; s.async = true;
    function done(ok) { window.__ngSdkLoadQueue.forEach(function (f) { f(ok && !!window.Novagates); }); window.__ngSdkLoadQueue = []; }
    s.onload = function () { done(true); };
    s.onerror = function () { done(false); };
    document.head.appendChild(s);
  }

  /* ── Modal ────────────────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById("ng-tryon-style")) return;
    var st = document.createElement("style");
    st.id = "ng-tryon-style";
    st.textContent =
      "#ng-tryon-modal{position:fixed;inset:0;z-index:9999;display:none;align-items:center;justify-content:center;background:rgba(20,12,16,.55);backdrop-filter:blur(3px)}" +
      "#ng-tryon-modal.active{display:flex}" +
      ".ng-modal-card{position:relative;width:min(960px,94vw);height:min(86vh,820px);background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.35);display:flex;flex-direction:column}" +
      ".ng-modal-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid #eee;flex:0 0 auto}" +
      ".ng-modal-head strong{font-family:'Cormorant Garamond',serif;font-size:20px}" +
      ".ng-modal-close{width:36px;height:36px;border:none;border-radius:50%;background:#f3f0f1;font-size:22px;line-height:1;cursor:pointer}" +
      ".ng-modal-close:hover{background:#e7e2e4}" +
      "#novagates-container{position:relative;flex:1 1 auto;width:100%;height:100%;min-height:520px;overflow:hidden;background:#000}" +
      ".ng-modal-fallback{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:100%;padding:24px;text-align:center;color:#cfc5c8;font-size:14px;line-height:1.7;max-width:520px}" +
      /* card try-on button */
      ".card-tryon{position:absolute;bottom:10px;right:10px;z-index:3;border:none;cursor:pointer;" +
      "background:rgba(20,12,16,.82);color:#fff;font:600 12px/1 Inter,sans-serif;letter-spacing:.02em;" +
      "padding:8px 12px;border-radius:999px;display:inline-flex;align-items:center;gap:6px;backdrop-filter:blur(2px);transition:.18s}" +
      ".card-tryon:hover{background:#1c1216;transform:translateY(-1px)}" +
      ".card-tryon::before{content:'\\2726';color:#e7b86b}";
    document.head.appendChild(st);
  }

  function ensureModal() {
    var existing = document.getElementById("ng-tryon-modal");
    if (existing) return existing;
    injectStyles();
    var modal = document.createElement("div");
    modal.id = "ng-tryon-modal";
    modal.innerHTML =
      '<div class="ng-modal-card">' +
        '<div class="ng-modal-head">' +
          '<strong id="ng-modal-title">Virtual Try-On</strong>' +
          '<button class="ng-modal-close" id="ng-modal-close" aria-label="Close">×</button>' +
        '</div>' +
        '<div id="novagates-container"></div>' +
      '</div>';
    document.body.appendChild(modal);

    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    var x = modal.querySelector("#ng-modal-close");
    if (x) x.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var m = document.getElementById("ng-tryon-modal");
        if (m && m.classList.contains("active")) close();
      }
    });
    return modal;
  }

  function setContainer(html) {
    var c = document.getElementById("novagates-container");
    if (c) c.innerHTML = html ? '<div class="ng-modal-fallback">' + html + "</div>" : "";
  }

  function close() {
    var modal = document.getElementById("ng-tryon-modal");
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "";
    if (window.Novagates && window.Novagates.detach) { try { window.Novagates.detach(); } catch (e) {} }
    window.__ngAttached = false;
    stopCameras();   // release the webcam so the next try-on can use it
  }

  /* SDK -> store cart/wishlist events (bind once) */
  if (!window.__ngCartBound) {
    window.__ngCartBound = true;
    window.addEventListener("sdk:addToCart", function (ev) {
      var d = ev.detail || {};
      if (window.Lume && window.Lume.addToCart) {
        window.Lume.addToCart(d.id || (window.productData && window.productData.id), d.color || "", d.quantity || 1);
        window.Lume.toast((d.name || (window.productData && window.productData.name) || "Product") + " added to your bag ✓");
      }
    });
    window.addEventListener("sdk:addToWishlist", function (ev) {
      var d = ev.detail || {};
      if (window.Lume && window.Lume.toggleWishlist) {
        window.Lume.toggleWishlist(d.id || (window.productData && window.productData.id));
        window.Lume.toast("Saved to wishlist ♡");
      }
    });
  }

  function open(p, opts) {
    if (!p) return;
    opts = opts || {};
    var modal = ensureModal();
    var title = document.getElementById("ng-modal-title");
    if (title) title.textContent = opts.label || labelFor(p);

    window.productData = buildProductData(p, opts.state);

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    setContainer("Loading the Novagates try-on…");

    resolveSessionToken(function (token) {
      loadSdk(moduleForProduct(p), token, function (ok) {
        if (!ok || typeof window.Novagates === "undefined") {
          setContainer(
            "The Novagates SDK couldn’t load.<br>" +
            "Check your connection to the SDK host, then try again."
          );
          return;
        }
        setContainer("");
        try {
          var catalog = cfg().useDemoCatalog
            ? "https://cdn.novagates.com/sdk/demo-catalog.json"
            : ((cfg().productsScope === "all") ? buildCatalog() : buildProductCatalog(p));
          if (window.__ngInitedFor !== p.id) {
            // First open, or a different product: (re)initialize. immediate:true
            // ATTACHES automatically — we must NOT also call attach() or the SDK
            // throws "Cannot reattach: already attached" and never starts the camera.
            if (window.__ngAttached) { try { window.Novagates.detach(); } catch (e) {} }
            window.Novagates.init({
              rootId: "novagates-container",
              mode: "client",
              immediate: true,
              productsSource: catalog   // this product's shades (or whole catalog if scope:"all")
            });
            window.__ngInitedFor = p.id;
            window.__ngAttached = true;
          } else {
            // Same product re-opened after a close (we detached on close): re-attach only.
            setTimeout(function () { try { window.Novagates.attach(); window.__ngAttached = true; } catch (e) {} }, 60);
          }
        } catch (e) {
          setContainer("The try-on failed to start: " + (e && e.message ? e.message : "unknown error"));
        }
      });
    });
  }

  function openById(id) {
    var p = window.findProduct ? window.findProduct(id) : null;
    if (p) open(p);
  }

  window.NovagatesTryOn = {
    open: open, openById: openById, close: close,
    canTryOn: canTryOn, labelFor: labelFor, moduleForProduct: moduleForProduct
  };
})();
