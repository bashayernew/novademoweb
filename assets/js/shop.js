/* Shop / product listing page */
document.addEventListener("DOMContentLoaded", function () {
  var params = new URLSearchParams(location.search);
  var state = {
    cat: params.get("cat") || "all",
    group: params.get("group") || "all",
    // facet fields (each defaults to "all")
    subtype: params.get("type") || "all",
    texture: params.get("texture") || "all",
    color: params.get("color") || "all",
    shape: params.get("shape") || "all",
    application: params.get("application") || "all",
    style: params.get("style") || "all",
    intensity: params.get("intensity") || "all",
    shade: params.get("shade") || "all",
    placement: params.get("placement") || "all",
    mood: params.get("mood") || "all",
    looktype: params.get("looktype") || "all",
    search: "",
    sort: "featured",
  };

  var grid = document.getElementById("shop-grid");
  var emptyEl = document.getElementById("shop-empty");
  var subChipsWrap = document.getElementById("subchips-wrap");
  var subChipsLabel = document.getElementById("subchips-label");
  var subChipsEl = document.getElementById("subchips");
  // Two extra facet rows (used by accessories subtype + nails texture/colour/shape)
  var facetRows = [
    { wrap: document.getElementById("subsubchips-wrap"), label: document.getElementById("subsubchips-label"), el: document.getElementById("subsubchips") },
    { wrap: document.getElementById("subsub2chips-wrap"), label: document.getElementById("subsub2chips-label"), el: document.getElementById("subsub2chips") },
    { wrap: document.getElementById("subsub3chips-wrap"), label: document.getElementById("subsub3chips-label"), el: document.getElementById("subsub3chips") },
  ];
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
    fragrances: "Eau de parfum and toilette for women and men — find your mood.",
    house: "Furniture, wall & ceiling and décor — everything for the home.",
  };

  // First-level sub-filter: which items the top sub-chip row shows.
  function subFilterItems() {
    if (state.cat === "accessories") return window.ACCESSORY_GROUPS || [];
    if (state.cat === "skincare") return window.SKIN_CONCERNS || [];
    if (state.cat === "hair") return window.HAIR_COLORS || [];
    if (state.cat === "nails") return window.NAIL_KINDS || [];
    if (state.cat === "lenses") return window.LENS_RINGS || [];
    if (state.cat === "makeup") return window.MAKEUP_GROUPS || [];
    if (state.cat === "fragrances") return window.FRAGRANCE_GENDERS || [];
    if (state.cat === "looks") return window.LOOK_GENDERS || [];
    if (state.cat === "house") return window.HOUSE_GROUPS || [];
    return null;
  }

  var SUBCHIP_LABELS = {
    skincare: "Filter by skin concern",
    accessories: "Shop by area",
    hair: "Choose a colour",
    nails: "Polish or press-on",
    lenses: "Limbal ring",
    makeup: "Lip products",
    fragrances: "For",
    looks: "For",
    house: "Shop by area",
  };

  // The 0–2 facet rows shown beneath the sub-filter, depending on cat + group.
  // Each facet: { field, label, items:[{key,label,hex?}], match(product,value) }
  function extraFacets() {
    if (state.cat === "accessories" && state.group !== "all") {
      var g = (window.ACCESSORY_GROUPS || []).find(function (x) { return x.key === state.group; });
      return [{
        field: "subtype",
        label: (g ? g.label : "") + " — type",
        items: window.accessorySubtypes(state.group),
        match: function (p, v) { return p.product_types === v; },
      }];
    }
    if (state.cat === "nails" && state.group === "polish") {
      return [
        { field: "texture", label: "Texture", items: window.NAIL_TEXTURES || [],
          match: function (p, v) { return p.texture === v; } },
        { field: "color", label: "Colour", items: window.NAIL_COLORS || [],
          match: function (p, v) { return window.productHasColor(p, v); } },
      ];
    }
    if (state.cat === "nails" && state.group === "press_on") {
      return [
        { field: "color", label: "Colour", items: window.NAIL_COLORS || [],
          match: function (p, v) { return window.productHasColor(p, v); } },
        { field: "shape", label: "Shape", items: window.NAIL_SHAPES || [],
          match: function (p, v) { return p.shape === v; } },
      ];
    }
    if (state.cat === "lenses") {
      // Colour row is always shown for lenses, regardless of the ring choice.
      return [
        { field: "color", label: "Colour", items: window.LENS_COLORS || [],
          match: function (p, v) { return window.productHasColor(p, v); } },
      ];
    }
    if (state.cat === "makeup") {
      var colourFacet = function (items) {
        return { field: "color", label: "Colour", items: items || [],
          match: function (p, v) { return window.productHasColor(p, v); } };
      };
      var lipTexture = { field: "texture", label: "Texture", items: window.LIP_TEXTURES || [],
        match: function (p, v) { return p.texture === v; } };
      // --- Lip groups ---
      if (state.group === "lip_shade") {
        return [lipTexture, colourFacet(window.LIP_COLORS),
          { field: "application", label: "Application", items: window.LIP_APPLICATIONS || [],
            match: function (p, v) { return p.application === v; } }];
      }
      if (state.group === "lip_contour") {
        return [colourFacet(window.LIP_COLORS),
          { field: "shape", label: "Shape", items: window.LIP_SHAPES || [],
            match: function (p, v) { return p.shape === v; } }];
      }
      if (state.group === "lip_plump") {
        return [lipTexture, colourFacet(window.LIP_COLORS)];
      }
      // --- Eye groups ---
      if (state.group === "eyeshadow") {
        return [
          colourFacet(window.eyeColors(window.EYESHADOW_COLORS_KEYS)),
          { field: "texture", label: "Texture", items: window.EYESHADOW_TEXTURES || [],
            match: function (p, v) { return p.texture === v; } },
          { field: "application", label: "Application", items: window.EYESHADOW_APPLICATIONS || [],
            match: function (p, v) { return p.application === v; } },
        ];
      }
      if (state.group === "eyeliner") {
        return [
          colourFacet(window.eyeColors(window.EYELINER_COLORS_KEYS)),
          { field: "style", label: "Style", items: window.EYELINER_STYLES || [],
            match: function (p, v) { return p.style === v; } },
        ];
      }
      if (state.group === "mascara") {
        return [colourFacet(window.eyeColors(window.MASCARA_COLORS_KEYS))];
      }
      if (state.group === "lashes") {
        return [
          colourFacet(window.eyeColors(window.LASH_COLORS_KEYS)),
          { field: "style", label: "Style", items: window.LASH_STYLES || [],
            match: function (p, v) { return p.style === v; } },
        ];
      }
      if (state.group === "eyebrows") {
        return [
          colourFacet(window.eyeColors(window.BROW_COLORS_KEYS)),
          { field: "shape", label: "Shape", items: window.BROW_SHAPES || [],
            match: function (p, v) { return p.shape === v; } },
          { field: "intensity", label: "Intensity", items: window.BROW_INTENSITIES || [],
            match: function (p, v) { return p.intensity === v; } },
        ];
      }
      // --- Face / complexion groups ---
      var shadeFacet = { field: "shade", label: "Shade", items: window.SKIN_TONES || [],
        match: function (p, v) { return window.productHasShade(p, v); } };
      if (state.group === "foundation" || state.group === "concealer") {
        return [shadeFacet];
      }
      var faceColour = colourFacet(window.FACE_COLORS);
      if (state.group === "blusher") {
        return [faceColour,
          { field: "texture", label: "Texture", items: window.BLUSH_TEXTURES || [],
            match: function (p, v) { return p.texture === v; } },
          { field: "placement", label: "Application", items: window.BLUSH_PLACEMENTS || [],
            match: function (p, v) { return p.placement === v; } }];
      }
      if (state.group === "contour") {
        return [faceColour,
          { field: "placement", label: "Placement", items: window.CONTOUR_PLACEMENTS || [],
            match: function (p, v) { return p.placement === v; } }];
      }
      if (state.group === "highlighter") {
        return [faceColour,
          { field: "texture", label: "Texture", items: window.HLBR_TEXTURES || [],
            match: function (p, v) { return p.texture === v; } },
          { field: "placement", label: "Application", items: window.HL_PLACEMENTS || [],
            match: function (p, v) { return p.placement === v; } }];
      }
      if (state.group === "bronzer") {
        return [faceColour,
          { field: "texture", label: "Texture", items: window.HLBR_TEXTURES || [],
            match: function (p, v) { return p.texture === v; } },
          { field: "placement", label: "Application", items: window.BR_PLACEMENTS || [],
            match: function (p, v) { return p.placement === v; } }];
      }
    }
    if (state.cat === "fragrances" && state.group !== "all") {
      return [{
        field: "mood", label: "Mood",
        items: window.fragranceMoodsFor(state.group),
        match: function (p, v) { return p.mood === v; },
      }];
    }
    if (state.cat === "looks" && state.group !== "all") {
      return [{
        field: "looktype", label: "Type",
        items: window.lookTypesFor(state.group),
        match: function (p, v) { return p.look_type === v; },
      }];
    }
    return [];
  }

  // facet field -> URL param name
  var FACET_PARAM = { subtype: "type", texture: "texture", color: "color", shape: "shape", application: "application", style: "style", intensity: "intensity", shade: "shade", placement: "placement", mood: "mood", looktype: "looktype" };

  function syncUrl() {
    var url = "shop";
    var qs = [];
    if (state.cat && state.cat !== "all") qs.push("cat=" + encodeURIComponent(state.cat));
    if (state.group && state.group !== "all") qs.push("group=" + encodeURIComponent(state.group));
    Object.keys(FACET_PARAM).forEach(function (field) {
      if (state[field] && state[field] !== "all") qs.push(FACET_PARAM[field] + "=" + encodeURIComponent(state[field]));
    });
    if (qs.length) url += "?" + qs.join("&");
    history.replaceState({}, "", url);
  }

  function resetFacets() {
    Object.keys(FACET_PARAM).forEach(function (field) { state[field] = "all"; });
  }

  function chipHTML(item, activeKey, dataAttr) {
    var dot = item.hex ? '<span class="chip-dot" style="background:' + item.hex + '"></span>' : "";
    return '<button class="chip' + (item.hex ? " chip-swatch" : "") + (item.key === activeKey ? " active" : "") +
      '" ' + dataAttr + '="' + item.key + '">' + dot + item.label + "</button>";
  }

  // Build the first-level sub-filter chip row.
  function renderSubChips() {
    var items = subFilterItems();
    if (!subChipsEl || !subChipsWrap) return;
    if (!items) {
      subChipsWrap.hidden = true;
      subChipsEl.innerHTML = "";
      if (subChipsLabel) subChipsLabel.textContent = "";
      return;
    }
    if (subChipsLabel) subChipsLabel.textContent = SUBCHIP_LABELS[state.cat] || "Filter";
    var groups = [{ key: "all", label: "All" }].concat(items);
    subChipsEl.innerHTML = groups.map(function (g) { return chipHTML(g, state.group, "data-group"); }).join("");
    subChipsWrap.hidden = false;
    subChipsEl.querySelectorAll(".chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.group = chip.getAttribute("data-group");
        resetFacets(); // changing the group clears any facet selections
        subChipsEl.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
        chip.classList.add("active");
        renderExtraFacets();
        syncUrl();
        apply();
      });
    });
  }

  // Render the 0–2 facet rows.
  function renderExtraFacets() {
    var facets = extraFacets();
    facetRows.forEach(function (row, i) {
      if (!row.el || !row.wrap) return;
      var facet = facets[i];
      if (!facet || !facet.items || !facet.items.length) {
        row.wrap.hidden = true;
        row.el.innerHTML = "";
        if (row.label) row.label.textContent = "";
        return;
      }
      if (row.label) row.label.textContent = facet.label;
      var items = [{ key: "all", label: "All" }].concat(facet.items);
      row.el.innerHTML = items.map(function (it) { return chipHTML(it, state[facet.field], "data-val"); }).join("");
      row.wrap.hidden = false;
      row.el.querySelectorAll(".chip").forEach(function (chip) {
        chip.addEventListener("click", function () {
          state[facet.field] = chip.getAttribute("data-val");
          row.el.querySelectorAll(".chip").forEach(function (c) { c.classList.remove("active"); });
          chip.classList.add("active");
          syncUrl();
          apply();
        });
      });
    });
  }

  renderSubChips();
  renderExtraFacets();

  if (searchEl) searchEl.addEventListener("input", function () { state.search = searchEl.value.trim().toLowerCase(); apply(); });
  if (sortEl) sortEl.addEventListener("change", function () { state.sort = sortEl.value; apply(); });

  function apply() {
    var label = state.cat === "all" ? "Shop All" : window.categoryLabel(state.cat);
    if (titleEl) titleEl.textContent = label;
    if (crumbEl) crumbEl.textContent = label;
    if (subEl) subEl.textContent = SUBTITLES[state.cat] || SUBTITLES.all;

    var facets = extraFacets();
    var list = window.PRODUCTS.filter(function (p) {
      var okCat = state.cat === "all" || p.category === state.cat;
      var okGroup = true;
      if (state.group !== "all") {
        if (state.cat === "accessories") okGroup = window.accessoryGroupOf(p) === state.group;
        else if (state.cat === "skincare") okGroup = window.productTreats(p, state.group);
        else if (state.cat === "hair") okGroup = window.hairColorOf(p) === state.group;
        else if (state.cat === "nails") okGroup = window.nailKindOf(p) === state.group;
        else if (state.cat === "lenses") okGroup = window.lensRingOf(p) === state.group;
        else if (state.cat === "makeup") okGroup = window.makeupGroupOf(p) === state.group;
        else if (state.cat === "fragrances") okGroup = window.fragranceGenderOf(p) === state.group;
        else if (state.cat === "looks") okGroup = window.lookGenderOf(p) === state.group;
        else if (state.cat === "house") okGroup = window.houseGroupOf(p) === state.group;
      }
      var okFacets = facets.every(function (f) {
        var v = state[f.field];
        return !v || v === "all" || f.match(p, v);
      });
      var okSearch = !state.search || p.name.toLowerCase().indexOf(state.search) !== -1;
      return okCat && okGroup && okFacets && okSearch;
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
