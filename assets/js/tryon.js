/* Full-page Virtual Try-On host.
   Reads ?id=<product> from the URL and mounts the Novagates SDK directly into
   the page (no popup) — same brand experience, opened as a normal page.
   Auth + entitlements use the same session-token flow as the rest of the site
   (NOVAGATES_CONFIG from novagates.js, which also installs the staging shim). */
(function () {
  "use strict";

  function cfg() { return window.NOVAGATES_CONFIG || {}; }
  function productId() { return new URLSearchParams(location.search).get("id") || ""; }
  function types(p) {
    return Array.isArray(p.product_types) ? p.product_types : (p.product_types ? [p.product_types] : []);
  }

  var TRYON_LABELS = {
    lip_color: "Lip Colour Virtual Try-On", lip_liner: "Lip Liner Virtual Try-On",
    lip_plump: "Lip Plumper Virtual Try-On", eyeshadow: "Eyeshadow Virtual Try-On",
    foundation: "Foundation Try-On", blush: "Blush Virtual Try-On", blusher: "Blush Virtual Try-On",
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
  function buildProductData(p) {
    var hex = (p.grad && p.grad[0]) || "#cccccc";
    var img = p.image || "";
    return {
      id: p.id, name: p.name, color: p.name || "", hexacode: hex, is_product_try_on: 1,
      swatch_image: img, image: { url: img }, thumbnail: { url: img },
      price: { regularPrice: { amount: { currency: "USD", value: Number(p.price) || 0 } } },
      product_types: types(p)[0] || "", category: p.category || ""
    };
  }

  function setMsg(html) {
    var c = document.getElementById("novagates-container");
    if (c) c.innerHTML = html ? '<div class="tryon-msg">' + html + "</div>" : "";
  }

  function resolveToken(cb) {
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
    var c = cfg();
    var base = c.sdkBase || "https://cdn.novagates.com/sdk/novagates-sdk.js";
    var auth = token ? "&sessionToken=" + encodeURIComponent(token)
                     : "&apiKey=" + encodeURIComponent(c.apiKey || "");
    var url = base + "?module=" + encodeURIComponent(moduleName || c.defaultModule || "virtual-try-on-makeups") + auth;
    var s = document.createElement("script");
    s.src = url; s.async = true;
    s.onload = function () { cb(!!window.Novagates); };
    s.onerror = function () { cb(false); };
    document.head.appendChild(s);
  }

  function start() {
    var id = productId();
    var p = window.findProduct ? window.findProduct(id) : null;
    var titleEl = document.getElementById("tryon-title");
    var backEl = document.getElementById("tryon-back");

    if (!p) {
      if (titleEl) titleEl.textContent = "Product not found";
      setMsg('We couldn’t find that product. <a href="shop.html">Back to shop</a>.');
      return;
    }

    document.title = labelFor(p) + " — Lumé Beauty";
    if (titleEl) titleEl.textContent = labelFor(p);
    if (backEl) backEl.setAttribute("href", "product.html?id=" + encodeURIComponent(p.id));

    window.productData = buildProductData(p);
    setMsg("Loading the try-on…");

    resolveToken(function (token) {
      loadSdk(moduleForProduct(p), token, function (ok) {
        if (!ok || typeof window.Novagates === "undefined") {
          setMsg("The Novagates try-on couldn’t load right now. It will appear here automatically once the SDK host is reachable.");
          return;
        }
        setMsg("");
        try {
          if (!window.__ngInited) {
            window.Novagates.init({ rootId: "novagates-container" });
            window.__ngInited = true;
          }
          setTimeout(function () { try { window.Novagates.attach(); } catch (e) {} }, 100);
        } catch (e) {
          setMsg("The try-on failed to start: " + (e && e.message ? e.message : "unknown error"));
        }
      });
    });

    // Route SDK cart / wishlist events into the Lumé store.
    window.addEventListener("sdk:addToCart", function (ev) {
      var d = ev.detail || {};
      if (window.Lume && window.Lume.addToCart) {
        window.Lume.addToCart(d.id || p.id, d.color || "", d.quantity || 1);
        window.Lume.toast((d.name || p.name || "Product") + " added to your bag ✓");
      }
    });
    window.addEventListener("sdk:addToWishlist", function (ev) {
      var d = ev.detail || {};
      if (window.Lume && window.Lume.toggleWishlist) {
        window.Lume.toggleWishlist(d.id || p.id);
        window.Lume.toast("Saved to wishlist ♡");
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
