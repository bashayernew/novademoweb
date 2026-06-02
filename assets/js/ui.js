/* Lumé Beauty — shared UI rendering helpers */
(function () {
  function media(grad) {
    return "background:linear-gradient(135deg," + grad[0] + "," + grad[1] + ")";
  }
  window.mediaStyle = media;

  function stars(n) {
    n = n || 4;
    var s = "";
    for (var i = 0; i < 5; i++) s += i < n ? "★" : "☆";
    return '<div class="stars" aria-label="' + n + ' out of 5 stars">' + s + "</div>";
  }
  window.starsHTML = stars;

  function swatches(p) {
    if (p.optionType !== "shade" || !p.options.length) return "";
    var dots = p.options.slice(0, 6).map(function (o) {
      return '<span class="swatch" style="background:' + (o.hex || "#ccc") + '" title="' + o.name + '"></span>';
    }).join("");
    return '<div class="swatches">' + dots + "</div>";
  }

  window.productCardHTML = function (p) {
    var href = "product?id=" + encodeURIComponent(p.id) + "#" + encodeURIComponent(p.id);
    var badge = p.badge ? '<span class="card-badge">' + p.badge + "</span>" : "";
    return (
      '<article class="card" data-id="' + p.id + '">' +
        '<a class="card-link" href="' + href + '">' +
          '<div class="card-media" style="' + media(p.grad) + '">' +
            window.productMedia(p) +
            (p.image ? '<img class="card-photo" src="' + p.image + '" alt="" loading="lazy" onerror="this.remove()" />' : '') +
            badge +
          "</div>" +
          '<div class="card-body">' +
            '<span class="card-cat">' + window.categoryLabel(p.category) + "</span>" +
            '<h3 class="card-title">' + p.name + "</h3>" +
            stars(p.rating) +
            '<div class="card-price">' + window.Lume.money(p.price) + "</div>" +
            swatches(p) +
          "</div>" +
        "</a>" +
        '<button class="card-wish" data-id="' + p.id + '" aria-label="Add to wishlist">' + window.ICON_HEART + "</button>" +
      "</article>"
    );
  };

  // Render a list of products into a container and wire wishlist buttons.
  window.renderProducts = function (container, products) {
    container.innerHTML = products.map(window.productCardHTML).join("");
    container.querySelectorAll(".card").forEach(function (card) {
      var id = card.getAttribute("data-id");
      card.addEventListener("click", function (e) {
        if (e.target.closest(".card-wish")) return;
        try { sessionStorage.setItem("lume_product_id", id); } catch (err) {}
      });
    });
    container.querySelectorAll(".card-wish").forEach(function (btn) {
      var id = btn.getAttribute("data-id");
      if (window.Lume.isWished(id)) btn.classList.add("active");
      btn.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        var added = window.Lume.toggleWishlist(id);
        btn.classList.toggle("active", added);
        window.Lume.toast(added ? "Added to wishlist" : "Removed from wishlist");
      });
    });
  };
})();
