/* Lumé Beauty — shared storefront logic (cart, wishlist, chrome) */
(function () {
  var CART_KEY = "lume_cart";
  var WISH_KEY = "lume_wishlist";

  function read(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch (e) { return []; } }
  function write(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
  function getCart() { return read(CART_KEY); }
  function getWishlist() { return read(WISH_KEY); }
  function money(n) { return "$" + Number(n).toFixed(2); }

  function lineKey(id, option) { return id + "::" + (option || ""); }

  function addToCart(id, option, qty) {
    qty = qty || 1;
    var cart = getCart();
    var key = lineKey(id, option);
    var existing = cart.find(function (l) { return lineKey(l.id, l.option) === key; });
    if (existing) existing.qty += qty;
    else cart.push({ id: id, option: option || "", qty: qty });
    write(CART_KEY, cart);
    updateCounts();
  }
  function setQty(id, option, qty) {
    var cart = getCart();
    var key = lineKey(id, option);
    cart = cart.map(function (l) { if (lineKey(l.id, l.option) === key) l.qty = qty; return l; })
               .filter(function (l) { return l.qty > 0; });
    write(CART_KEY, cart);
    updateCounts();
  }
  function removeFromCart(id, option) {
    var key = lineKey(id, option);
    write(CART_KEY, getCart().filter(function (l) { return lineKey(l.id, l.option) !== key; }));
    updateCounts();
  }
  function clearCart() { write(CART_KEY, []); updateCounts(); }
  function cartCount() { return getCart().reduce(function (s, l) { return s + l.qty; }, 0); }
  function cartDetailed() {
    return getCart().map(function (l) {
      var p = window.findProduct(l.id);
      return p ? { product: p, option: l.option, qty: l.qty, lineTotal: p.price * l.qty } : null;
    }).filter(Boolean);
  }
  function cartSubtotal() { return cartDetailed().reduce(function (s, l) { return s + l.lineTotal; }, 0); }

  function isWished(id) { return getWishlist().indexOf(id) !== -1; }
  function toggleWishlist(id) {
    var w = getWishlist();
    var i = w.indexOf(id);
    if (i === -1) w.push(id); else w.splice(i, 1);
    write(WISH_KEY, w);
    updateCounts();
    return i === -1;
  }
  function wishlistCount() { return getWishlist().length; }

  var ICON_BAG  = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>';
  var ICON_HEART= '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s-7-4.5-9.5-9A4.7 4.7 0 0 1 12 6a4.7 4.7 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/></svg>';
  var ICON_MENU = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="24" height="24"><path d="M4 7h16M4 12h16M4 17h16"/></svg>';
  window.ICON_HEART = ICON_HEART;

  function renderHeader(active) {
    var el = document.getElementById("site-header");
    if (!el) return;
    el.innerHTML =
      '<div class="announce">Complimentary shipping on orders over $50 — always cruelty-free</div>' +
      '<header class="site-header"><div class="container header-inner">' +
        '<button class="menu-toggle" aria-label="Menu">' + ICON_MENU + '</button>' +
        '<a class="brand" href="index.html">lumé<span>.</span></a>' +
        '<nav class="nav">' +
          link("index.html",              "Home",          active === "home") +
          link("shop.html",               "Shop All",      active === "shop") +
          link("shop.html?cat=makeup",    "Makeup",        false) +
          link("shop.html?cat=skincare",  "Skincare",      false) +
          link("shop.html?cat=accessories","Accessories",  false) +
          link("shop.html?cat=nails",     "Nails",         false) +
          link("shop.html?cat=hair",      "Hair",          false) +
          link("shop.html?cat=lenses",    "Lenses",        false) +
          link("experience.html",         "✦ Experiences", active === "experience") +
          link("about.html",              "About",         active === "about") +
        '</nav>' +
        '<div class="header-actions">' +
          '<a class="icon-btn" href="wishlist.html" aria-label="Wishlist">' + ICON_HEART + '<span class="count-badge" id="wish-count" hidden>0</span></a>' +
          '<a class="icon-btn" href="cart.html" aria-label="Cart">' + ICON_BAG + '<span class="count-badge" id="cart-count" hidden>0</span></a>' +
        '</div>' +
      '</div></header>';

    var toggle = el.querySelector(".menu-toggle");
    if (toggle) toggle.addEventListener("click", function () {
      var nav = el.querySelector(".nav");
      nav.style.display = (nav.style.display === "flex") ? "none" : "flex";
      nav.style.position = "absolute"; nav.style.flexDirection = "column";
      nav.style.background = "#fbf7f4"; nav.style.padding = "16px 22px";
      nav.style.top = "100%"; nav.style.left = "0"; nav.style.right = "0";
      nav.style.borderBottom = "1px solid #ece4e1"; nav.style.zIndex = "100";
    });
    updateCounts();
  }

  function link(href, label, isActive) {
    return '<a href="' + href + '"' + (isActive ? ' class="active"' : '') + '>' + label + '</a>';
  }

  function renderFooter() {
    var el = document.getElementById("site-footer");
    if (!el) return;
    el.innerHTML =
      '<footer class="site-footer"><div class="container">' +
        '<div class="footer-grid">' +
          '<div><div class="brand">lumé<span>.</span></div>' +
            '<p style="margin-top:12px;max-width:260px">Modern beauty made with clean formulas and a little bit of magic. Designed in California.</p></div>' +
          '<div><h4>Shop</h4>' +
            '<a href="shop.html?cat=makeup">Makeup</a>' +
            '<a href="shop.html?cat=skincare">Skincare</a>' +
            '<a href="shop.html?cat=accessories">Accessories</a>' +
            '<a href="shop.html?cat=nails">Nails</a>' +
            '<a href="shop.html?cat=hair">Hair Colour</a>' +
            '<a href="shop.html?cat=lenses">Eye Lenses</a>' +
            '<a href="shop.html?cat=looks">Curated Looks</a></div>' +
          '<div><h4>Explore</h4>' +
            '<a href="experience.html">Beauty Experiences</a>' +
            '<a href="virtual-tour.html">Virtual Store Tour</a>' +
            '<a href="about.html">Our Story</a>' +
            '<a href="#">Shipping &amp; Returns</a>' +
            '<a href="#">Contact</a></div>' +
          '<div><h4>Join the list</h4><p>Early access to drops &amp; 10% off your first order.</p>' +
            '<form class="newsletter" onsubmit="return Lume.subscribe(event)">' +
              '<input type="email" placeholder="Email address" required>' +
              '<button class="btn btn-primary" type="submit" style="padding:11px 18px">Join</button>' +
            '</form></div>' +
        '</div>' +
        '<div class="footer-bottom">© ' + new Date().getFullYear() + ' Lumé Beauty Co. · This is a demonstration storefront.</div>' +
      '</div></footer>';
  }

  function updateCounts() {
    var c = document.getElementById("cart-count");
    var w = document.getElementById("wish-count");
    if (c) { var n = cartCount(); c.textContent = n; c.hidden = n === 0; }
    if (w) { var m = wishlistCount(); w.textContent = m; w.hidden = m === 0; }
  }

  function toast(msg) {
    var wrap = document.querySelector(".toast-wrap");
    if (!wrap) { wrap = document.createElement("div"); wrap.className = "toast-wrap"; document.body.appendChild(wrap); }
    var t = document.createElement("div");
    t.className = "toast"; t.textContent = msg;
    wrap.appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; t.style.transition = "opacity .3s"; }, 2200);
    setTimeout(function () { t.remove(); }, 2600);
  }

  function subscribe(e) { e.preventDefault(); e.target.reset(); toast("Thanks — you're on the list!"); return false; }

  window.Lume = {
    money: money,
    addToCart: addToCart, setQty: setQty, removeFromCart: removeFromCart, clearCart: clearCart,
    cartCount: cartCount, cartDetailed: cartDetailed, cartSubtotal: cartSubtotal,
    isWished: isWished, toggleWishlist: toggleWishlist, wishlistCount: wishlistCount,
    getWishlist: getWishlist,
    toast: toast, subscribe: subscribe, updateCounts: updateCounts,
  };

  document.addEventListener("DOMContentLoaded", function () {
    renderHeader(document.body.getAttribute("data-page") || "");
    renderFooter();
  });
})();
