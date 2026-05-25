/* Cart page */
document.addEventListener("DOMContentLoaded", function () {
  var root = document.getElementById("cart-root");
  var SHIP_THRESHOLD = 50;
  var SHIP_COST = 5;

  function render() {
    var items = window.Lume.cartDetailed();
    if (!items.length) {
      root.innerHTML =
        '<div class="empty"><div class="mono">lumé</div><h2>Your bag is empty</h2>' +
        '<p class="muted">Discover something you\'ll love.</p>' +
        '<a class="btn btn-primary" href="shop.html" style="margin-top:18px">Start shopping</a></div>';
      return;
    }

    var subtotal = window.Lume.cartSubtotal();
    var shipping = subtotal >= SHIP_THRESHOLD ? 0 : SHIP_COST;
    var total = subtotal + shipping;

    var itemsHTML = items.map(function (l) {
      var p = l.product;
      return (
        '<div class="cart-item" data-id="' + p.id + '" data-opt="' + l.option + '">' +
          '<div class="cart-thumb" style="' + window.mediaStyle(p.grad) + '">' + window.productMedia(p) + "</div>" +
          "<div>" +
            "<h4>" + p.name + "</h4>" +
            (l.option ? '<div class="opt">' + l.option + "</div>" : "") +
            '<div class="opt">' + window.Lume.money(p.price) + " each</div>" +
            '<button class="link-danger" data-remove>Remove</button>' +
          "</div>" +
          '<div style="text-align:right">' +
            '<div class="qty" style="margin-bottom:8px"><button data-dec aria-label="Decrease">−</button><span>' + l.qty + '</span><button data-inc aria-label="Increase">+</button></div>' +
            '<div style="font-weight:600">' + window.Lume.money(l.lineTotal) + "</div>" +
          "</div>" +
        "</div>"
      );
    }).join("");

    var shipLine = shipping === 0
      ? '<span style="color:#6f8c72">Free</span>'
      : window.Lume.money(shipping);
    var freeHint = shipping === 0 ? "" :
      '<p class="muted" style="font-size:13px;margin-top:8px">Add ' + window.Lume.money(SHIP_THRESHOLD - subtotal) + " more for free shipping.</p>";

    root.innerHTML =
      '<div class="cart-layout"><div>' + itemsHTML + "</div>" +
      '<aside class="summary"><h3>Order summary</h3>' +
        '<div class="summary-row"><span>Subtotal</span><span>' + window.Lume.money(subtotal) + "</span></div>" +
        '<div class="summary-row"><span>Shipping</span><span>' + shipLine + "</span></div>" +
        '<div class="summary-row total"><span>Total</span><span>' + window.Lume.money(total) + "</span></div>" +
        freeHint +
        '<a class="btn btn-primary btn-block" href="checkout.html" style="margin-top:18px">Checkout</a>' +
        '<a class="btn btn-outline btn-block" href="shop.html" style="margin-top:10px">Continue shopping</a>' +
      "</aside></div>";

    // wire controls
    root.querySelectorAll(".cart-item").forEach(function (row) {
      var id = row.getAttribute("data-id");
      var opt = row.getAttribute("data-opt");
      var cur = window.Lume.cartDetailed().find(function (l) { return l.product.id === id && l.option === opt; });
      row.querySelector("[data-dec]").addEventListener("click", function () {
        window.Lume.setQty(id, opt, (cur ? cur.qty : 1) - 1); render();
      });
      row.querySelector("[data-inc]").addEventListener("click", function () {
        window.Lume.setQty(id, opt, (cur ? cur.qty : 1) + 1); render();
      });
      row.querySelector("[data-remove]").addEventListener("click", function () {
        window.Lume.removeFromCart(id, opt); window.Lume.toast("Removed from bag"); render();
      });
    });
  }

  render();
});
