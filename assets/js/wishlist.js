/* Wishlist page */
document.addEventListener("DOMContentLoaded", function () {
  var grid = document.getElementById("wish-grid");
  var emptyEl = document.getElementById("wish-empty");

  function render() {
    var ids = window.Lume.getWishlist();
    var items = ids.map(window.findProduct).filter(Boolean);
    if (!items.length) {
      grid.innerHTML = "";
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;
    window.renderProducts(grid, items);
  }

  // Re-render after a heart toggle so removed items drop off this page.
  grid.addEventListener("click", function (e) {
    if (e.target.closest(".card-wish")) setTimeout(render, 60);
  });

  render();
});
