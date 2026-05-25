/* Home page */
document.addEventListener("DOMContentLoaded", function () {
  // Category tiles
  var cg = document.getElementById("cat-grid");
  if (cg) {
    cg.innerHTML = window.CATEGORIES.map(function (c) {
      return (
        '<a class="cat-tile" href="shop.html?cat=' + c.key + '" ' +
        'style="background:linear-gradient(135deg,' + c.grad[0] + "," + c.grad[1] + ')">' +
          '<div class="cat-body"><h3>' + c.label + "</h3>" +
          '<div class="cat-link">Shop now →</div></div>' +
        "</a>"
      );
    }).join("");
  }

  // Bestsellers (badge = Bestseller, fallback to first few)
  var best = window.PRODUCTS.filter(function (p) { return p.badge === "Bestseller"; });
  var pool = window.PRODUCTS.filter(function (p) { return best.indexOf(p) === -1; });
  while (best.length < 4 && pool.length) best.push(pool.shift());
  var bsEl = document.getElementById("bestsellers");
  if (bsEl) window.renderProducts(bsEl, best.slice(0, 4));

  // New arrivals (badge = New, then looks)
  var fresh = window.PRODUCTS.filter(function (p) { return p.badge === "New" || p.badge === "Set"; });
  var naEl = document.getElementById("new-arrivals");
  if (naEl) window.renderProducts(naEl, fresh.slice(0, 4));
});
