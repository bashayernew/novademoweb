/* Checkout page (mock — no real payment) */
document.addEventListener("DOMContentLoaded", function () {
  var root = document.getElementById("checkout-root");
  var SHIP_THRESHOLD = 50, SHIP_COST = 5;

  var items = window.Lume.cartDetailed();
  if (!items.length) {
    root.innerHTML =
      '<div class="empty"><div class="mono">lumé</div><h2>Your bag is empty</h2>' +
      '<p class="muted">Add a few favourites before checking out.</p>' +
      '<a class="btn btn-primary" href="shop.html" style="margin-top:18px">Go to shop</a></div>';
    return;
  }

  var subtotal = window.Lume.cartSubtotal();
  var shipping = subtotal >= SHIP_THRESHOLD ? 0 : SHIP_COST;
  var total = subtotal + shipping;

  var summaryItems = items.map(function (l) {
    return (
      '<div class="cart-item" style="grid-template-columns:60px 1fr auto;padding:14px 0">' +
        '<div class="cart-thumb" style="width:60px;height:72px;' + window.mediaStyle(l.product.grad) + '">' + window.productMedia(l.product) + "</div>" +
        "<div><h4 style='font-size:16px'>" + l.product.name + "</h4>" +
          (l.option ? '<div class="opt">' + l.option + "</div>" : "") +
          '<div class="opt">Qty ' + l.qty + "</div></div>" +
        '<div style="font-weight:600">' + window.Lume.money(l.lineTotal) + "</div>" +
      "</div>"
    );
  }).join("");

  root.innerHTML =
    '<div class="cart-layout">' +
      "<form id=checkout-form novalidate>" +
        '<h3 style="font-family:var(--serif);font-size:24px;margin:0 0 16px">Contact</h3>' +
        '<div class="field full"><label>Email</label><input type="email" required placeholder="you@email.com"></div>' +
        '<h3 style="font-family:var(--serif);font-size:24px;margin:16px 0 16px">Shipping address</h3>' +
        '<div class="form-grid">' +
          '<div class="field"><label>First name</label><input required placeholder="First"></div>' +
          '<div class="field"><label>Last name</label><input required placeholder="Last"></div>' +
          '<div class="field full"><label>Address</label><input required placeholder="Street address"></div>' +
          '<div class="field"><label>City</label><input required placeholder="City"></div>' +
          '<div class="field"><label>Postal code</label><input required placeholder="ZIP"></div>' +
          '<div class="field full"><label>Country</label><select required><option value="">Select…</option><option>United States</option><option>United Kingdom</option><option>Canada</option><option>Australia</option></select></div>' +
        "</div>" +
        '<h3 style="font-family:var(--serif);font-size:24px;margin:16px 0 16px">Payment</h3>' +
        '<div class="form-grid">' +
          '<div class="field full"><label>Card number</label><input required placeholder="1234 5678 9012 3456" inputmode="numeric"></div>' +
          '<div class="field"><label>Expiry</label><input required placeholder="MM / YY"></div>' +
          '<div class="field"><label>CVC</label><input required placeholder="123" inputmode="numeric"></div>' +
        "</div>" +
        '<p class="muted" style="font-size:12.5px;margin-top:4px">Demo checkout — no card is charged and no data is stored.</p>' +
        '<button class="btn btn-primary btn-block" type="submit" style="margin-top:18px">Place order · ' + window.Lume.money(total) + "</button>" +
      "</form>" +
      '<aside class="summary"><h3>Order summary</h3>' + summaryItems +
        '<div class="summary-row"><span>Subtotal</span><span>' + window.Lume.money(subtotal) + "</span></div>" +
        '<div class="summary-row"><span>Shipping</span><span>' + (shipping === 0 ? "Free" : window.Lume.money(shipping)) + "</span></div>" +
        '<div class="summary-row total"><span>Total</span><span>' + window.Lume.money(total) + "</span></div>" +
      "</aside>" +
    "</div>";

  document.getElementById("checkout-form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (!this.checkValidity()) { this.reportValidity(); return; }
    var orderNo = "LUME-" + Math.floor(100000 + Math.random() * 900000);
    window.Lume.clearCart();
    root.innerHTML =
      '<div class="empty"><div class="mono" style="color:#6f8c72">✓</div>' +
      "<h2>Thank you for your order</h2>" +
      '<p class="muted">Order <strong>' + orderNo + '</strong> is confirmed. A receipt is on its way to your inbox.</p>' +
      '<a class="btn btn-primary" href="index.html" style="margin-top:18px">Back to home</a></div>';
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
