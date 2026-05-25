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
      '</div>' +
      '<div id="novagates-container"></div>'
    : "";

  /* ── Initial accent colour for art ───────────── */
  var initialHex = (isShade && p.options[0] && typeof p.options[0] === "object" && p.options[0].hex)
    ? p.options[0].hex : null;

  /* ── Render ───────────────────────────────────── */
  root.innerHTML =
    '<div class="pdp-wrap">' +

      /* Full-width image hero */
      '<div class="pdp-img-hero" style="background:linear-gradient(135deg,' + p.grad[0] + ',' + p.grad[1] + ')">' +
        '<div id="pdp-art-wrap">' + window.productArt(p, initialHex) + '</div>' +
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

  /* Try-on */
  var btnTryon = document.getElementById("btn-tryon");
  if (btnTryon) {
    btnTryon.addEventListener("click", function() {
      window.Lume.toast("Virtual try-on launching — SDK integration coming soon.");
    });
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

document.addEventListener("DOMContentLoaded", initProductPage);
window.addEventListener("pageshow", function (e) {
  if (e.persisted) initProductPage();
});
