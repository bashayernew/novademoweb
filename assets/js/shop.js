/* Shop / product listing page */
document.addEventListener("DOMContentLoaded", function () {
  var params = new URLSearchParams(location.search);
  var state = {
    cat: params.get("cat") || "all",
    search: "",
    sort: "featured",
  };

  var grid = document.getElementById("shop-grid");
  var emptyEl = document.getElementById("shop-empty");
  var chipsEl = document.getElementById("chips");
  var searchEl = document.getElementById("search");
  var sortEl = document.getElementById("sort");
  var titleEl = document.getElementById("shop-title");
  var subEl = document.getElementById("shop-sub");
  var crumbEl = document.getElementById("crumb-cat");

  var SUBTITLES = {
    all: "Clean makeup, skincare, accessories and more — all in one place.",
    makeup: "Lips, eyes and complexion, in shades made for real light.",
    skincare: "Glow-getters and barrier-lovers for every routine.",
    accessories: "The finishing pieces — eyewear, gold, silk and more.",
    nails: "Polish shades, textures and press-on styles — virtually try them all.",
    hair: "Permanent and semi-permanent colour — preview every shade with AR.",
    lenses: "Natural, vivid and statement contact lenses — try any colour on your eyes.",
    looks: "Curated edits that pull a whole look together.",
  };

  // Build chips
  var cats = [{ key: "all", label: "All" }].concat(window.CATEGORIES);
  chipsEl.innerHTML = cats.map(function (c) {
    return '<button class="chip' + (c.key === state.cat ? " active" : "") + '" data-cat="' + c.key + '">' + c.label + "</button>";
  }).join("");
  chipsEl.querySelectorAll(".chip").forEach(function (chip) {
    chip.addEventListener("click", function () {
      state.cat = chip.getAttribute("data-cat");
      chipsEl.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      var url = state.cat === "all" ? "shop.html" : "shop.html?cat=" + state.cat;
      history.replaceState({}, "", url);
      apply();
    });
  });

  if (searchEl) searchEl.addEventListener("input", function () { state.search = searchEl.value.trim().toLowerCase(); apply(); });
  if (sortEl) sortEl.addEventListener("change", function () { state.sort = sortEl.value; apply(); });

  function apply() {
    var label = state.cat === "all" ? "Shop All" : window.categoryLabel(state.cat);
    if (titleEl) titleEl.textContent = label;
    if (crumbEl) crumbEl.textContent = label;
    if (subEl) subEl.textContent = SUBTITLES[state.cat] || SUBTITLES.all;

    var list = window.PRODUCTS.filter(function (p) {
      var okCat = state.cat === "all" || p.category === state.cat;
      var okSearch = !state.search || p.name.toLowerCase().indexOf(state.search) !== -1;
      return okCat && okSearch;
    });

    if (state.sort === "price-asc") list.sort(function (a, b) { return a.price - b.price; });
    else if (state.sort === "price-desc") list.sort(function (a, b) { return b.price - a.price; });
    else if (state.sort === "rating") list.sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });

    if (!list.length) { if (grid) grid.innerHTML = ""; if (emptyEl) emptyEl.hidden = false; return; }
    if (emptyEl) emptyEl.hidden = true;
    window.renderProducts(grid, list);
  }

  apply();
});
