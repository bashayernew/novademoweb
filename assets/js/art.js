/* Lumé Beauty — per-product SVG illustrations (offline, scalable, shade-tinted) */
(function () {
  var ACCENT = {
    makeup: "#b4536b", skincare: "#6f8c72", accessories: "#c8a04a",
    looks: "#6c4a6e", nails: "#c0446e", hair: "#8b5e3c", lenses: "#3a7ab5"
  };

  // Which illustration each product uses.
  var ART_TYPE = {
    // Makeup
    "lip-velvet-matte": "lipstick",
    "lip-gloss-shine": "gloss",
    "lip-liner-define": "pencil",
    "eyeshadow-silk": "palette",
    "foundation-luminous": "foundation",
    "blush-rosy": "blush",
    "highlighter-glow": "compact",
    "cheek-tint": "tint",
    "eyeliner-liquid": "eyeliner",
    "mascara-volume": "mascara",
    "brow-define": "pencil",
    // Skincare
    "serum-vitc": "serum",
    "moisturizer-hydra": "jar",
    "cleanser-gentle": "tube",
    "retinol-night": "jar",
    "mist-hyaluronic": "mist",
    "spf-daily": "pump",
    // Accessories
    "sunglasses-oversized": "sunglasses",
    "earrings-hoop": "hoops",
    "earrings-stud": "studs",
    "necklace-pendant": "necklace",
    "scarf-silk": "scarf",
    "hat-sun": "hat",
    "ring-gold-solitaire": "ring",
    "ring-stacking": "ring",
    "bracelet-pearl": "bracelet",
    "bracelet-tennis": "bracelet",
    "bangle-gold": "bangle",
    "bangle-set": "bangle",
    "watch-classic": "watch",
    "watch-minimal": "watch",
    "headband-satin": "headband",
    "headband-embellished": "headband",
    "tiara-crystal": "tiara",
    // Nails
    "nail-polish-crimson": "nailpolish",
    "nail-polish-nude": "nailpolish",
    "nail-polish-neon": "nailpolish",
    "nail-polish-classic": "nailpolish",
    "press-on-almond": "presson",
    "press-on-coffin": "presson",
    // Hair
    "hair-dye-auburn": "haircolor",
    "hair-dye-blonde": "haircolor",
    "hair-dye-pastel": "haircolor",
    "hair-dye-dark": "haircolor",
    // Lenses
    "lens-hazel": "lens",
    "lens-blue": "lens",
    "lens-green": "lens",
    "lens-grey": "lens",
    "lens-violet": "lens",
    // Looks
    "look-soft-glam": "set",
    "look-sun-kissed": "set",
    "look-evening": "set",
    "look-power-day": "set",
    "look-bridal": "set",
    "look-festival": "set",
  };

  function shape(type, a) {
    switch (type) {
      case "lipstick": return `
        <rect x="104" y="92" width="32" height="36" rx="13" fill="${a}"/>
        <path d="M104 100 L136 90 L136 99 L104 109 Z" fill="rgba(255,255,255,.32)"/>
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <rect x="100" y="124" width="40" height="74" rx="9"/><line x1="100" y1="142" x2="140" y2="142"/>
        </g>`;
      case "gloss": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <rect x="106" y="76" width="28" height="110" rx="12" fill="${a}" fill-opacity="0.5"/>
          <rect x="110" y="58" width="20" height="18" rx="6"/>
        </g>
        <ellipse cx="120" cy="108" rx="8" ry="14" fill="rgba(255,255,255,0.3)"/>`;
      case "palette": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round">
          <rect x="56" y="86" width="128" height="76" rx="10"/><line x1="56" y1="106" x2="184" y2="106"/>
        </g>
        <circle cx="86" cy="134" r="12" fill="${a}"/><circle cx="120" cy="134" r="12" fill="#fff"/><circle cx="154" cy="134" r="12" fill="${a}"/>`;
      case "blush": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round">
          <rect x="72" y="100" width="96" height="70" rx="14"/>
        </g>
        <circle cx="103" cy="135" r="18" fill="${a}" fill-opacity="0.7"/>
        <circle cx="147" cy="135" r="18" fill="${a}" fill-opacity="0.4"/>`;
      case "compact": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round">
          <rect x="76" y="96" width="88" height="58" rx="16"/>
          <line x1="76" y1="116" x2="164" y2="116"/>
        </g>
        <circle cx="120" cy="138" r="14" fill="${a}" fill-opacity="0.8"/>
        <circle cx="115" cy="133" r="5" fill="rgba(255,255,255,0.5)"/>`;
      case "mascara": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <rect x="109" y="100" width="22" height="96" rx="11" fill="${a}" fill-opacity="0.5"/>
          <rect x="113" y="66" width="14" height="34" rx="5"/>
        </g>
        <g stroke="${a}" stroke-width="3" stroke-linecap="round">
          <line x1="120" y1="62" x2="108" y2="48"/><line x1="120" y1="62" x2="120" y2="44"/>
          <line x1="120" y1="62" x2="132" y2="48"/>
        </g>`;
      case "foundation": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <rect x="94" y="106" width="52" height="90" rx="10" fill="${a}" fill-opacity="0.5"/>
          <rect x="108" y="80" width="24" height="14" rx="3" fill="none"/>
          <rect x="100" y="64" width="40" height="16" rx="5"/><line x1="106" y1="150" x2="134" y2="150"/>
        </g>`;
      case "tint": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round">
          <rect x="104" y="108" width="32" height="86" rx="15" fill="${a}" fill-opacity="0.5"/>
          <rect x="110" y="74" width="20" height="18" rx="4"/>
        </g>`;
      case "eyeliner": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <rect x="110" y="62" width="20" height="98" rx="9"/><line x1="110" y1="92" x2="130" y2="92"/>
        </g>
        <path d="M110 160 L130 160 L120 194 Z" fill="${a}"/>`;
      case "pencil": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round">
          <rect x="108" y="58" width="24" height="102" rx="4"/><line x1="120" y1="58" x2="120" y2="160"/>
        </g>
        <path d="M108 160 L132 160 L120 196 Z" fill="${a}"/>
        <rect x="106" y="52" width="28" height="9" rx="3" fill="rgba(255,255,255,.5)"/>`;
      case "serum": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <rect x="96" y="112" width="48" height="82" rx="10" fill="${a}" fill-opacity="0.5"/>
          <rect x="110" y="92" width="20" height="20" rx="3"/>
          <rect x="100" y="56" width="40" height="20" rx="9"/><line x1="120" y1="76" x2="120" y2="150"/>
        </g>`;
      case "jar": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round">
          <rect x="84" y="118" width="72" height="58" rx="12"/>
          <rect x="78" y="96" width="84" height="26" rx="10" fill="${a}" fill-opacity="0.5"/>
        </g>`;
      case "tube": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <rect x="104" y="92" width="32" height="104" rx="10"/>
          <path d="M104 104 l8 -8 l8 8 l8 -8 l8 8"/>
          <rect x="112" y="60" width="16" height="32" rx="4" fill="${a}" fill-opacity="0.5"/>
        </g>`;
      case "pump": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <rect x="98" y="104" width="44" height="92" rx="10" fill="${a}" fill-opacity="0.5"/>
          <rect x="112" y="84" width="16" height="20" rx="3"/>
          <path d="M112 90 h-18 a6 6 0 0 0 0 12 h6"/>
          <rect x="104" y="62" width="32" height="14" rx="5"/>
        </g>`;
      case "mist": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <rect x="100" y="112" width="40" height="82" rx="10" fill="${a}" fill-opacity="0.5"/>
          <rect x="112" y="92" width="16" height="20" rx="3"/><rect x="104" y="74" width="32" height="18" rx="5"/>
        </g>
        <g fill="#fff"><circle cx="152" cy="80" r="3"/><circle cx="164" cy="72" r="2.5"/><circle cx="159" cy="92" r="2"/></g>`;
      case "sunglasses": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <path d="M58 112 q0 26 28 26 q28 0 28 -26 Z" fill="${a}" fill-opacity="0.5"/>
          <path d="M126 112 q0 26 28 26 q28 0 28 -26 Z" fill="${a}" fill-opacity="0.5"/>
          <line x1="114" y1="115" x2="126" y2="115"/><line x1="58" y1="114" x2="40" y2="104"/><line x1="182" y1="114" x2="200" y2="104"/>
        </g>`;
      case "hoops": return `
        <g fill="none" stroke="${a}" stroke-width="8"><circle cx="100" cy="126" r="34"/><circle cx="150" cy="126" r="34"/></g>
        <g fill="#fff"><circle cx="100" cy="90" r="5"/><circle cx="150" cy="90" r="5"/></g>`;
      case "studs": return `
        <g><circle cx="98" cy="122" r="16" fill="${a}"/><circle cx="150" cy="122" r="16" fill="${a}"/>
          <circle cx="93" cy="117" r="5" fill="rgba(255,255,255,.75)"/><circle cx="145" cy="117" r="5" fill="rgba(255,255,255,.75)"/></g>
        <g stroke="#fff" stroke-width="3" stroke-linecap="round"><line x1="124" y1="86" x2="124" y2="98"/><line x1="118" y1="92" x2="130" y2="92"/></g>`;
      case "necklace": return `
        <path d="M62 86 Q120 200 178 86" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
        <circle cx="120" cy="156" r="13" fill="${a}"/><circle cx="120" cy="156" r="4" fill="#fff"/>`;
      case "scarf": return `
        <rect x="78" y="78" width="84" height="84" rx="10" transform="rotate(45 120 120)" fill="${a}" fill-opacity="0.45" stroke="#fff" stroke-width="5"/>
        <g fill="none" stroke="#fff" stroke-width="3" stroke-opacity="0.8"><line x1="120" y1="80" x2="120" y2="160"/><line x1="80" y1="120" x2="160" y2="120"/></g>`;
      case "hat": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <ellipse cx="120" cy="152" rx="74" ry="20"/>
          <path d="M86 152 q0 -56 34 -56 q34 0 34 56" fill="${a}" fill-opacity="0.4"/>
          <path d="M88 146 q32 16 64 0"/>
        </g>`;
      case "ring": return `
        <circle cx="120" cy="130" r="38" fill="none" stroke="${a}" stroke-width="10"/>
        <circle cx="120" cy="130" r="38" fill="none" stroke="#fff" stroke-width="3" stroke-dasharray="6 6"/>
        <circle cx="120" cy="90" r="12" fill="${a}"/>
        <circle cx="116" cy="86" r="4" fill="rgba(255,255,255,0.7)"/>`;
      case "bracelet": return `
        <ellipse cx="120" cy="130" rx="56" ry="28" fill="none" stroke="${a}" stroke-width="10"/>
        <ellipse cx="120" cy="130" rx="56" ry="28" fill="none" stroke="#fff" stroke-width="2" stroke-dasharray="4 8"/>
        <circle cx="120" cy="102" r="9" fill="${a}"/>
        <circle cx="116" cy="98" r="3" fill="rgba(255,255,255,0.7)"/>`;
      case "bangle": return `
        <circle cx="120" cy="128" r="44" fill="none" stroke="${a}" stroke-width="12"/>
        <circle cx="120" cy="128" r="44" fill="none" stroke="rgba(255,255,255,0.25)" stroke-width="4"/>
        <g stroke="#fff" stroke-width="2" fill="none">
          <circle cx="120" cy="128" r="50"/><circle cx="120" cy="128" r="38"/>
        </g>`;
      case "watch": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round">
          <rect x="90" y="100" width="60" height="60" rx="14" fill="${a}" fill-opacity="0.4"/>
          <line x1="90" y1="100" x2="76" y2="88"/><line x1="150" y1="100" x2="164" y2="88"/>
          <line x1="90" y1="160" x2="76" y2="172"/><line x1="150" y1="160" x2="164" y2="172"/>
          <line x1="76" y1="84" x2="164" y2="84" stroke-linecap="round"/>
          <line x1="76" y1="176" x2="164" y2="176" stroke-linecap="round"/>
        </g>
        <line x1="120" y1="122" x2="120" y2="130" stroke="${a}" stroke-width="4" stroke-linecap="round"/>
        <line x1="120" y1="130" x2="132" y2="140" stroke="${a}" stroke-width="3" stroke-linecap="round"/>`;
      case "headband": return `
        <path d="M58 148 Q70 72 120 68 Q170 72 182 148" fill="none" stroke="${a}" stroke-width="16" stroke-linecap="round"/>
        <path d="M58 148 Q70 72 120 68 Q170 72 182 148" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="4" stroke-linecap="round"/>
        <circle cx="120" cy="68" r="8" fill="#fff"/>`;
      case "tiara": return `
        <path d="M52 152 Q68 108 88 92 L100 130 L120 72 L140 130 L152 92 Q172 108 188 152" fill="none" stroke="${a}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"/>
        <g fill="${a}">
          <circle cx="120" cy="72" r="7"/><circle cx="100" cy="130" r="5"/>
          <circle cx="140" cy="130" r="5"/><circle cx="88" cy="92" r="4"/><circle cx="152" cy="92" r="4"/>
        </g>
        <g fill="rgba(255,255,255,0.8)">
          <circle cx="120" cy="70" r="3"/><circle cx="100" cy="128" r="2"/><circle cx="140" cy="128" r="2"/>
        </g>`;
      case "nailpolish": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <rect x="100" y="118" width="40" height="72" rx="8" fill="${a}" fill-opacity="0.7"/>
          <rect x="108" y="94" width="24" height="24" rx="5"/>
          <line x1="112" y1="82" x2="128" y2="82"/>
        </g>
        <path d="M108 94 L108 86 Q120 78 132 86 L132 94 Z" fill="${a}" fill-opacity="0.5"/>`;
      case "presson": return `
        <g fill="${a}" fill-opacity="0.8">
          <ellipse cx="84" cy="130" rx="16" ry="22" transform="rotate(-10 84 130)"/>
          <ellipse cx="106" cy="118" rx="16" ry="24" transform="rotate(-4 106 118)"/>
          <ellipse cx="130" cy="116" rx="16" ry="24" transform="rotate(2 130 116)"/>
          <ellipse cx="154" cy="120" rx="14" ry="22" transform="rotate(8 154 120)"/>
          <ellipse cx="174" cy="132" rx="12" ry="18" transform="rotate(14 174 132)"/>
        </g>
        <g fill="rgba(255,255,255,0.35)">
          <ellipse cx="81" cy="120" rx="5" ry="8" transform="rotate(-10 81 120)"/>
          <ellipse cx="103" cy="108" rx="5" ry="9" transform="rotate(-4 103 108)"/>
          <ellipse cx="127" cy="107" rx="5" ry="9" transform="rotate(2 127 107)"/>
        </g>`;
      case "haircolor": return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <rect x="96" y="96" width="48" height="96" rx="10" fill="${a}" fill-opacity="0.5"/>
          <rect x="104" y="68" width="32" height="28" rx="6"/>
          <line x1="104" y1="138" x2="144" y2="138"/>
        </g>
        <path d="M108 68 Q120 54 132 68" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`;
      case "lens": return `
        <circle cx="120" cy="122" r="56" fill="none" stroke="#fff" stroke-width="5"/>
        <circle cx="120" cy="122" r="40" fill="${a}" fill-opacity="0.55"/>
        <circle cx="120" cy="122" r="20" fill="rgba(0,0,0,0.5)"/>
        <circle cx="108" cy="110" r="8" fill="rgba(255,255,255,0.4)"/>
        <circle cx="120" cy="122" r="56" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" stroke-dasharray="4 6"/>`;
      case "set": default: return `
        <g fill="none" stroke="#fff" stroke-width="5" stroke-linejoin="round" stroke-linecap="round">
          <path d="M84 110 L156 110 L150 194 L90 194 Z" fill="${a}" fill-opacity="0.4"/>
          <path d="M100 110 q0 -26 20 -26 q20 0 20 26"/>
        </g>
        <path d="M110 138 q10 -12 10 0 q0 -12 10 0 q-10 10 -10 0 q0 10 -10 0 Z" fill="#fff"/>`;
    }
  }

  window.productArt = function (p, override) {
    var accent = override
      || (p.optionType === "shade" && p.options[0] && p.options[0].hex)
      || ACCENT[p.category] || "#ffffff";
    var type = ART_TYPE[p.id] || "set";
    return '<svg class="art" viewBox="0 0 240 240" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' +
      p.name + '"><circle cx="120" cy="120" r="84" fill="rgba(255,255,255,0.13)"/>' + shape(type, accent) + "</svg>";
  };

  // Keyword used to fetch a matching real photo per product.
  var PHOTO_KW = {
    // Makeup
    "lip-velvet-matte": "lipstick",
    "lip-gloss-shine": "lip gloss",
    "lip-liner-define": "lip liner",
    "eyeshadow-silk": "eyeshadow",
    "foundation-luminous": "foundation,makeup",
    "blush-rosy": "blush,makeup",
    "highlighter-glow": "highlighter,makeup",
    "cheek-tint": "blush,makeup",
    "eyeliner-liquid": "eyeliner",
    "mascara-volume": "mascara",
    "brow-define": "makeup,brush",
    // Skincare
    "serum-vitc": "serum,skincare",
    "moisturizer-hydra": "moisturizer,cream",
    "cleanser-gentle": "skincare,bottle",
    "retinol-night": "cream,skincare",
    "mist-hyaluronic": "skincare,spray",
    "spf-daily": "sunscreen",
    // Accessories
    "sunglasses-oversized": "sunglasses",
    "earrings-hoop": "earrings,gold",
    "earrings-stud": "earrings,diamond",
    "necklace-pendant": "necklace,jewelry",
    "scarf-silk": "scarf,silk",
    "hat-sun": "hat,straw",
    "ring-gold-solitaire": "gold ring,jewelry",
    "ring-stacking": "stacking rings",
    "bracelet-pearl": "pearl bracelet",
    "bracelet-tennis": "tennis bracelet,diamond",
    "bangle-gold": "gold bangle",
    "bangle-set": "bangle bracelet",
    "watch-classic": "luxury watch",
    "watch-minimal": "rose gold watch",
    "headband-satin": "satin headband",
    "headband-embellished": "embellished headband",
    "tiara-crystal": "crystal tiara,bridal",
    // Nails
    "nail-polish-crimson": "nail polish,red",
    "nail-polish-nude": "nail polish,nude",
    "nail-polish-neon": "neon nails",
    "nail-polish-classic": "nail polish",
    "press-on-almond": "press on nails,almond",
    "press-on-coffin": "coffin nails",
    // Hair
    "hair-dye-auburn": "auburn hair,color",
    "hair-dye-blonde": "blonde hair,color",
    "hair-dye-pastel": "pastel hair,color",
    "hair-dye-dark": "dark hair,brunette",
    // Lenses
    "lens-hazel": "contact lenses,hazel eyes",
    "lens-blue": "blue eyes,contact lenses",
    "lens-green": "green eyes",
    "lens-grey": "grey eyes",
    "lens-violet": "violet eyes,contact lenses",
    // Looks
    "look-soft-glam": "makeup,cosmetics",
    "look-sun-kissed": "summer makeup,beauty",
    "look-evening": "evening makeup,glamour",
    "look-power-day": "professional makeup",
    "look-bridal": "bridal makeup,wedding",
    "look-festival": "festival makeup,colorful",
  };

  // Stable per-product seed so each product always shows the same photo.
  function seed(id) { var s = 0; for (var i = 0; i < id.length; i++) s = (s + id.charCodeAt(i) * (i + 1)) % 977; return s + 1; }

  // Real photo URL (keyword-matched, deterministic) from a public stock service.
  window.productPhoto = function (p) {
    var kw = PHOTO_KW[p.id] || "cosmetics";
    return "https://loremflickr.com/600/750/" + encodeURIComponent(kw) + "?lock=" + seed(p.id);
  };

  // Media block: SVG illustration only — consistent, brand-aligned, no external images.
  window.productMedia = function (p) {
    return '<div class="media-fallback">' + window.productArt(p) + "</div>";
  };
})();
