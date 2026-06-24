/* Product detail page */
function initProductPage() {
  var id = window.readProductId();
  var root = document.getElementById("pdp");
  if (!root) return;

  var p = window.findProduct(id);
  if (!p) {
    root.innerHTML =
      '<div style="padding:80px 0;text-align:center">' +
        '<h2>Product not found</h2>' +
        '<p class="muted" style="margin:12px 0 20px">' +
          (id ? 'We couldn\u2019t find a product matching \u201c' + id + '\u201d.' : 'No product was selected.') +
        '</p>' +
        '<a class="btn btn-primary" href="shop.html">Back to shop</a>' +
      '</div>';
    return;
  }

  try { sessionStorage.setItem("lume_product_id", p.id); } catch (e) {}

  document.title = p.name + " — Lumé Beauty";
  var crumb = document.getElementById("crumb-name");
  if (crumb) crumb.textContent = p.name;

  /* ── Try-on label ─────────────────────────────── */
  var TRYON_LABELS = {
    lip_color:"Lip Colour Virtual Try-On", lip_liner:"Lip Liner Virtual Try-On",
    eyeshadow:"Eyeshadow Virtual Try-On", foundation:"Foundation Try-On",
    blush:"Blush Virtual Try-On", highlighter:"Highlighter Virtual Try-On",
    mascara:"Mascara Virtual Try-On", eyeliner:"Eyeliner Virtual Try-On",
    eyebrows:"Eyebrow Virtual Try-On", nail_polish:"Nail Polish Virtual Try-On",
    press_on_nails:"Press-On Nails Virtual Try-On", eye_lenses:"Eye Colour Try-On",
    hair_color:"Hair Colour Virtual Try-On", rings:"Rings Virtual Try-On",
    bracelets:"Bracelets Virtual Try-On", bangles:"Bangles Virtual Try-On",
    watches:"Watches Virtual Try-On", headbands:"Headbands Virtual Try-On",
    tiaras:"Tiara Virtual Try-On", sunglasses:"Sunglasses Virtual Try-On",
    earrings:"Earrings Virtual Try-On", necklace:"Necklace Virtual Try-On",
    skincare:"Skin Analysis", shop_the_look:"Shop The Look — Try On"
  };
  var tryonLabel = "";
  var types = p.product_types ? (Array.isArray(p.product_types) ? p.product_types : [p.product_types]) : [];
  for (var ti = 0; ti < types.length; ti++) {
    if (TRYON_LABELS[types[ti]]) { tryonLabel = TRYON_LABELS[types[ti]]; break; }
  }

  /* ── Stars ────────────────────────────────────── */
  function starsHTML(n) {
    var s = "";
    for (var i = 0; i < 5; i++) s += i < Math.floor(n) ? "★" : (i === Math.floor(n) && n % 1 >= 0.5 ? "½" : "☆");
    return s;
  }

  /* ── Options ──────────────────────────────────── */
  var hasOptions = p.options && p.options.length > 0;
  var isShade = p.optionType === "shade";
  var optionsHTML = "";
  if (hasOptions) {
    var firstName = typeof p.options[0] === "object" ? p.options[0].name : p.options[0];
    var items = p.options.map(function(o, idx) {
      var label = typeof o === "object" ? o.name : o;
      var hex   = (typeof o === "object" && o.hex) ? o.hex : null;
      if (isShade && hex) {
        return '<button class="shade' + (idx === 0 ? " selected" : "") + '" data-idx="' + idx + '" title="' + label + '">' +
          '<span class="dot" style="background:' + hex + '"></span>' + label + '</button>';
      }
      return '<button class="variant' + (idx === 0 ? " selected" : "") + '" data-idx="' + idx + '">' + label + '</button>';
    }).join("");
    optionsHTML =
      '<span class="option-label">' + (isShade ? "Shade" : "Option") + ': <strong id="opt-label">' + firstName + '</strong></span>' +
      '<div class="' + (isShade ? "shade-row" : "variant-row") + '" id="opt-row">' + items + '</div>';
  }

  /* ── Try-on strip ─────────────────────────────── */
  var tryonHTML = tryonLabel
    ? '<div class="tryon-strip">' +
        '<div class="tryon-strip-icon">✦</div>' +
        '<div class="tryon-strip-text">' +
          '<strong>' + tryonLabel + '</strong>' +
          '<span>See it on you before you buy — powered by AR &amp; AI.</span>' +
        '</div>' +
        '<button class="btn-tryon" id="btn-tryon">Try It On</button>' +
      '</div>'
    : "";

  /* ── Initial accent colour for art ───────────── */
  var initialHex = (isShade && p.options[0] && typeof p.options[0] === "object" && p.options[0].hex)
    ? p.options[0].hex : null;

  /* ── Shop-the-Look: resolve component products ── */
  var lookItems = Array.isArray(p.products)
    ? p.products.map(function (id) { return window.findProduct(id); }).filter(Boolean)
    : [];
  var isLook = lookItems.length > 0;
  var HOTSPOT_POS = [
    { top: "20%", left: "32%" }, { top: "34%", left: "66%" }, { top: "52%", left: "26%" },
    { top: "64%", left: "60%" }, { top: "28%", left: "50%" }, { top: "46%", left: "42%" },
    { top: "78%", left: "38%" }, { top: "16%", left: "62%" }
  ];
  var hotspotById = {};
  (p.hotspots || []).forEach(function (h) { hotspotById[h.id] = h; });
  var hotspotsHTML = isLook
    ? '<div class="look-hotspots">' + lookItems.map(function (it, i) {
        var pos = hotspotById[it.id] || HOTSPOT_POS[i % HOTSPOT_POS.length];
        return '<button class="hotspot" data-idx="' + i + '" style="top:' + pos.top + ';left:' + pos.left + '" aria-label="' + it.name + '">' + (i + 1) + '</button>';
      }).join("") + '</div>'
    : "";

  /* ── Render ───────────────────────────────────── */
  root.innerHTML =
    '<div class="pdp-wrap">' +

      /* Full-width image hero */
      '<div class="pdp-img-hero' + (p.image && isLook ? ' pdp-img-hero--photo' : '') + '" style="background:linear-gradient(135deg,' + p.grad[0] + ',' + p.grad[1] + ')">' +
        (p.image && isLook
          ? '<img class="pdp-look-img" src="' + p.image + '" alt="' + p.name + '"' + (p.fallbackImage ? ' onerror="this.onerror=null;this.src=\'' + p.fallbackImage + '\'"' : '') + ' />'
          : (p.image
              ? '<div id="pdp-art-wrap">' + window.productArt(p, initialHex) + '</div><img class="pdp-photo-overlay" src="' + p.image + '" alt="' + p.name + '" onerror="this.remove()" />'
              : '<div id="pdp-art-wrap">' + window.productArt(p, initialHex) + '</div>')) +
        hotspotsHTML +
      '</div>' +

      '<div class="pdp-body">' +
      '<div class="pdp-info">' +
        (p.badge ? '<div style="margin-bottom:10px"><span class="badge">' + p.badge + '</span></div>' : '') +
        '<p class="pdp-cat">' + window.categoryLabel(p.category) + '</p>' +
        '<h1>' + p.name + '</h1>' +
        (p.rating
          ? '<div style="color:var(--gold);font-size:16px;margin-bottom:4px">' + starsHTML(p.rating) +
              ' <span style="color:var(--ink-soft);font-size:13px">(' + (p.reviewCount || Math.floor(p.rating * 18 + 12)) + ' reviews)</span></div>'
          : '') +
        '<div class="pdp-price">$' + Number(p.price).toFixed(2) + '</div>' +
        (p.desc ? '<p class="pdp-desc">' + p.desc + '</p>' : '') +
        optionsHTML +
        '<div class="pdp-actions">' +
          '<div class="qty">' +
            '<button id="qty-dec">−</button>' +
            '<span id="qty-val">1</span>' +
            '<button id="qty-inc">+</button>' +
          '</div>' +
          '<button class="btn btn-primary" id="btn-cart" style="flex:1">Add to Bag</button>' +
          '<button id="btn-wish" aria-label="Wishlist" style="width:46px;height:46px;border:1.5px solid var(--line);border-radius:10px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:.2s;flex-shrink:0">' +
            window.ICON_HEART +
          '</button>' +
        '</div>' +
        tryonHTML +
        (p.details
          ? '<div class="pdp-meta"><ul>' +
              p.details.split(/\n|·/).filter(Boolean).map(function(d){ return '<li>' + d.trim() + '</li>'; }).join('') +
            '</ul></div>'
          : '') +
      '</div>' +
      '</div>' +   /* close pdp-body */

    '</div>';   /* close pdp-wrap */

  /* ── Interactions ─────────────────────────────── */
  var state = {
    qty: 1,
    option: hasOptions ? (typeof p.options[0] === "object" ? p.options[0].name : p.options[0]) : "",
    hex: initialHex
  };

  var artWrap = document.getElementById("pdp-art-wrap");
  var optRow  = document.getElementById("opt-row");
  var optLabel = document.getElementById("opt-label");

  /* Option / shade buttons */
  if (optRow) {
    optRow.querySelectorAll("[data-idx]").forEach(function(btn) {
      btn.addEventListener("click", function() {
        var idx = parseInt(btn.getAttribute("data-idx"), 10);
        var o = p.options[idx];
        state.option = typeof o === "object" ? o.name : o;
        state.hex    = (typeof o === "object" && o.hex) ? o.hex : null;

        /* update label */
        if (optLabel) optLabel.textContent = state.option;

        /* update selected state */
        optRow.querySelectorAll("[data-idx]").forEach(function(b) { b.classList.remove("selected"); });
        btn.classList.add("selected");

        /* update product illustration colour */
        if (artWrap) artWrap.innerHTML = window.productArt(p, state.hex);
      });
    });
  }

  /* Qty */
  var qtyEl = document.getElementById("qty-val");
  document.getElementById("qty-dec").addEventListener("click", function() {
    if (state.qty > 1) { state.qty--; qtyEl.textContent = state.qty; }
  });
  document.getElementById("qty-inc").addEventListener("click", function() {
    state.qty++; qtyEl.textContent = state.qty;
  });

  /* Add to cart */
  document.getElementById("btn-cart").addEventListener("click", function() {
    window.Lume.addToCart(p.id, state.option, state.qty);
    window.Lume.toast(p.name + (state.option ? " — " + state.option : "") + " added to your bag ✓");
  });

  /* Wishlist */
  var btnWish = document.getElementById("btn-wish");
  function refreshWish() {
    var on = window.Lume.isWished(p.id);
    btnWish.style.background  = on ? "#f9edf0" : "#fff";
    btnWish.style.borderColor = on ? "var(--rose-deep)" : "var(--line)";
    btnWish.style.color       = on ? "var(--rose-deep)" : "";
  }
  btnWish.addEventListener("click", function() {
    var added = window.Lume.toggleWishlist(p.id);
    window.Lume.toast(added ? "Saved to wishlist ♡" : "Removed from wishlist");
    refreshWish();
  });
  refreshWish();

  /* Try-on (Novagates SDK — shared module in novagates.js) */
  var btnTryon = document.getElementById("btn-tryon");
  if (btnTryon && window.NovagatesTryOn) {
    btnTryon.addEventListener("click", function () {
      window.NovagatesTryOn.open(p, { label: tryonLabel, state: state });
    });
  }

  /* ── Shop the Look ────────────────────────────── */
  function defaultOption(it) {
    if (!it.options || !it.options.length) return "";
    var o = it.options[0];
    return typeof o === "object" ? o.name : o;
  }
  if (isLook) {
    var lookSection = document.getElementById("look-section");
    var lookShop = document.getElementById("look-shop");
    var lookTotal = lookItems.reduce(function (s, it) { return s + it.price; }, 0);
    if (lookSection && lookShop) {
      lookShop.innerHTML =
        '<div class="look-shop-head">' +
          '<div><h2>Shop the Look</h2><p class="muted">' + lookItems.length + ' pieces — tap a number on the image to find each one.</p></div>' +
          '<button class="btn btn-primary" id="look-add-all">Add all to bag · ' + window.Lume.money(lookTotal) + '</button>' +
        '</div>' +
        '<div class="look-items">' +
          lookItems.map(function (it, i) {
            return '<div class="look-item" id="look-item-' + i + '">' +
              '<a class="look-item-media" href="product?id=' + encodeURIComponent(it.id) + '" style="background:linear-gradient(135deg,' + it.grad[0] + ',' + it.grad[1] + ')">' +
                '<span class="look-item-num">' + (i + 1) + '</span>' + window.productMedia(it) +
              '</a>' +
              '<div class="look-item-info">' +
                '<span class="look-item-cat">' + window.categoryLabel(it.category) + '</span>' +
                '<a class="look-item-name" href="product?id=' + encodeURIComponent(it.id) + '">' + it.name + '</a>' +
                '<div class="look-item-price">' + window.Lume.money(it.price) + '</div>' +
              '</div>' +
              '<button class="btn btn-line look-add" data-id="' + it.id + '" data-idx="' + i + '">Add</button>' +
            '</div>';
          }).join("") +
        '</div>';
      lookSection.hidden = false;

      /* highlight helper */
      function flashItem(i) {
        var card = document.getElementById("look-item-" + i);
        if (!card) return;
        card.scrollIntoView({ behavior: "smooth", block: "center" });
        card.classList.add("flash");
        setTimeout(function () { card.classList.remove("flash"); }, 1200);
      }

      /* hotspots → highlight the matching item */
      document.querySelectorAll(".look-hotspots .hotspot").forEach(function (hs) {
        hs.addEventListener("click", function () {
          flashItem(parseInt(hs.getAttribute("data-idx"), 10));
        });
      });

      /* per-item add */
      lookShop.querySelectorAll(".look-add").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var it = window.findProduct(btn.getAttribute("data-id"));
          if (!it) return;
          window.Lume.addToCart(it.id, defaultOption(it), 1);
          window.Lume.toast(it.name + " added to your bag ✓");
        });
      });

      /* add all */
      var addAll = document.getElementById("look-add-all");
      if (addAll) {
        addAll.addEventListener("click", function () {
          lookItems.forEach(function (it) { window.Lume.addToCart(it.id, defaultOption(it), 1); });
          window.Lume.toast("All " + lookItems.length + " pieces added to your bag ✓");
        });
      }
    }
  }

  /* Related products */
  var related = window.PRODUCTS.filter(function(q) { return q.category === p.category && q.id !== p.id; }).slice(0, 4);
  var relSection = document.getElementById("related-section");
  var relGrid = document.getElementById("related");
  if (related.length && relSection && relGrid) {
    relSection.hidden = false;
    window.renderProducts(relGrid, related);
  }
}

/* ─────────────────────────────────────────────────────────
   Novagates SDK integration
   ───────────────────────────────────────────────────────── */

/* Pick the SDK module (technology) for a given product. */
function moduleForProduct(p) {
  var cfg = window.NOVAGATES_CONFIG || {};
  var map = cfg.moduleByType || {};
  var types = Array.isArray(p.product_types)
    ? p.product_types
    : (p.product_types ? [p.product_types] : []);
  for (var i = 0; i < types.length; i++) {
    if (map[types[i]]) return map[types[i]];
  }
  return cfg.module || cfg.defaultModule || "virtual-try-on-makeups";
}

/* Resolve a sessionToken: fetch a fresh one from tokenEndpoint if configured,
   otherwise use the static token in NOVAGATES_CONFIG. */
function resolveSessionToken(cb) {
  var cfg = window.NOVAGATES_CONFIG || {};
  if (cfg.tokenEndpoint) {
    fetch(cfg.tokenEndpoint, { method: "GET" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) { cb((d && (d.sessionToken || d.access_token)) || cfg.sessionToken || ""); })
      .catch(function () { cb(cfg.sessionToken || ""); });
  } else {
    cb(cfg.sessionToken || "");
  }
}

/* Lazy-load the SDK script (only on first Try-On click, so an
   offline SDK host never blocks page load). The chosen module + token are
   baked into the script URL — the demo is multi-page, so each
   product page loads the SDK fresh with its own module. */
function loadNovagatesSdk(moduleName, token, cb) {
  if (window.Novagates) { cb(true); return; }
  if (window.__ngSdkLoading) { window.__ngSdkLoadQueue.push(cb); return; }
  window.__ngSdkLoading = true;
  window.__ngSdkLoadQueue = [cb];

  var cfg = window.NOVAGATES_CONFIG || {};
  var base = cfg.sdkBase || "https://cdn.novagates.com/sdk/novagates-sdk.js";
  // The current SDK authenticates with a sessionToken (JWT). Prefer it;
  // fall back to the legacy apiKey param only if no token is available.
  var auth = token
    ? "&sessionToken=" + encodeURIComponent(token)
    : "&apiKey=" + encodeURIComponent(cfg.apiKey || "");
  var url = base +
    "?module=" + encodeURIComponent(moduleName || cfg.defaultModule || "virtual-try-on-makeups") +
    auth;

  var s = document.createElement("script");
  s.src = url;
  s.async = true;
  function done(ok) { window.__ngSdkLoadQueue.forEach(function (f) { f(ok && !!window.Novagates); }); window.__ngSdkLoadQueue = []; }
  s.onload  = function () { done(true); };
  s.onerror = function () { done(false); };
  document.head.appendChild(s);
}

/* Map a Lumé product into the shape the Novagates SDK expects. */
function buildNovagatesProductData(p, state) {
  var hex  = (state && state.hex) ? state.hex : (p.grad && p.grad[0]) || "#cccccc";
  var type = Array.isArray(p.product_types) ? p.product_types[0] : (p.product_types || "");
  var img  = p.image || "";
  return {
    id: p.id,
    name: p.name,
    color: (state && state.option) ? state.option : (p.name || ""),
    hexacode: hex,
    is_product_try_on: 1,
    swatch_image: img,
    image: { url: img },
    thumbnail: { url: img },
    price: { regularPrice: { amount: { currency: "USD", value: Number(p.price) || 0 } } },
    product_types: type,
    category: p.category || ""
  };
}

/* Build (once) the modal that hosts #novagates-container. */
function ensureNovagatesModal() {
  var existing = document.getElementById("ng-tryon-modal");
  if (existing) return existing;

  if (!document.getElementById("ng-tryon-style")) {
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
      "#novagates-container{flex:1 1 auto;width:100%;overflow:auto;display:flex;align-items:center;justify-content:center}" +
      ".ng-modal-fallback{padding:40px;text-align:center;color:#7a6e72;font-size:14px;line-height:1.7;max-width:520px}";
    document.head.appendChild(st);
  }

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
  return modal;
}

function ngSetContainer(html) {
  var c = document.getElementById("novagates-container");
  if (!c) return;
  c.innerHTML = html ? '<div class="ng-modal-fallback">' + html + '</div>' : "";
}

/* Wire the Try-On button to the SDK modal. */
function setupNovagatesTryOn(p, state, label) {
  var btn = document.getElementById("btn-tryon");
  if (!btn) return;

  function close() {
    var modal = document.getElementById("ng-tryon-modal");
    if (modal) modal.classList.remove("active");
    document.body.style.overflow = "";
    if (window.Novagates && window.Novagates.detach) {
      try { window.Novagates.detach(); } catch (e) {}
    }
  }

  function open() {
    var modal = ensureNovagatesModal();
    var title = document.getElementById("ng-modal-title");
    if (title) title.textContent = label || "Virtual Try-On";

    /* expose product data for the SDK (resolves the SDK's bare `productData`) */
    window.productData = buildNovagatesProductData(p, state);

    modal.classList.add("active");
    document.body.style.overflow = "hidden";
    ngSetContainer("Loading the Novagates try-on…");

    resolveSessionToken(function (token) {
    loadNovagatesSdk(moduleForProduct(p), token, function (ok) {
      if (!ok || typeof window.Novagates === "undefined") {
        ngSetContainer(
          "The Novagates SDK couldn’t load.<br>" +
          "Its host (<code>novagates.com</code>) may be offline or unreachable from here.<br><br>" +
          "The integration is wired correctly — the live try-on will appear here automatically once the SDK host is reachable, or point <code>NOVAGATES_CONFIG.sdkBase</code> at a local SDK URL."
        );
        return;
      }
      ngSetContainer("");
      try {
        if (!window.__ngInited) {
          window.Novagates.init({ rootId: "novagates-container" });
          window.__ngInited = true;
        }
        setTimeout(function () {
          try { window.Novagates.attach(); } catch (e) {}
        }, 100);
      } catch (e) {
        ngSetContainer("The try-on failed to start: " + (e && e.message ? e.message : "unknown error"));
      }
    });
    });
  }

  btn.addEventListener("click", open);

  /* bind close handlers once per modal */
  var modal = ensureNovagatesModal();
  if (!modal.__ngBound) {
    modal.__ngBound = true;
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    var x = document.getElementById("ng-modal-close");
    if (x) x.addEventListener("click", close);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        var m = document.getElementById("ng-tryon-modal");
        if (m && m.classList.contains("active")) close();
      }
    });
  }

  /* route SDK cart / wishlist events into the Lumé store (bind once) */
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
}

document.addEventListener("DOMContentLoaded", initProductPage);
window.addEventListener("pageshow", function (e) {
  if (e.persisted) initProductPage();
});
