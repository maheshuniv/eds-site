/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselWkndHeroParser from "./parsers/carousel-wknd-hero.js";
import columnsMagazineParser from "./parsers/columns-magazine.js";
import cardsMagazineParser from "./parsers/cards-magazine.js";
import heroWkndTeaserParser from "./parsers/hero-wknd-teaser.js";

// TRANSFORMER IMPORTS
import cleanupTransformer from "./transformers/wknd-site-cleanup.js";
import sectionsTransformer from "./transformers/wknd-site-sections.js";

// PARSER REGISTRY
const parsers = {
  "carousel-wknd-hero": carouselWkndHeroParser,
  "columns-magazine": columnsMagazineParser,
  "cards-magazine": cardsMagazineParser,
  "hero-wknd-teaser": heroWkndTeaserParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "wknd-site-home",
  "description": "WKND (wknd.site) home: hero carousel, featured article + recent articles, next adventures teaser, where-to-go tiles",
  "urls": [
    "https://wknd.site/us/en.html"
  ],
  "blocks": [
    {
      "name": "carousel-wknd-hero",
      "instances": [
        "main .carousel.panelcontainer.cmp-carousel--hero"
      ]
    },
    {
      "name": "columns-magazine",
      "instances": [
        "main .teaser.cmp-teaser--featured"
      ]
    },
    {
      "name": "cards-magazine",
      "instances": [
        "main .image-list"
      ]
    },
    {
      "name": "hero-wknd-teaser",
      "instances": [
        "main .teaser.cmp-teaser--hero.cmp-teaser--imagebottom"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "hero-carousel",
      "selector": [
        "main .carousel.panelcontainer.cmp-carousel--hero"
      ],
      "style": null,
      "blocks": [
        "carousel-wknd-hero"
      ],
      "defaultContent": []
    },
    {
      "id": "2",
      "name": "featured-recent",
      "selector": [
        "main.cmp-layout-container--fixed:nth-of-type(1)"
      ],
      "style": null,
      "blocks": [
        "columns-magazine",
        "cards-magazine"
      ],
      "defaultContent": [
        ".title.cmp-title--underline",
        ".button.cmp-button--primary"
      ]
    },
    {
      "id": "3",
      "name": "next-adventures",
      "selector": [
        "main.cmp-layout-container--fixed:nth-of-type(1) .separator:not(.cmp-separator--hidden)"
      ],
      "style": "wknd-divider-large",
      "blocks": [],
      "defaultContent": [
        ".title.cmp-title--underline"
      ]
    },
    {
      "id": "4",
      "name": "teaser",
      "selector": [
        "main .teaser.cmp-teaser--hero.cmp-teaser--imagebottom"
      ],
      "style": null,
      "blocks": [
        "hero-wknd-teaser"
      ],
      "defaultContent": []
    },
    {
      "id": "5",
      "name": "where-to-go",
      "selector": [
        "main.cmp-layout-container--fixed:nth-of-type(2)"
      ],
      "style": null,
      "blocks": [
        "cards-magazine"
      ],
      "defaultContent": [
        ".title .cmp-title__text",
        ".button.cmp-button--primary"
      ]
    },
    {
      "id": "6",
      "name": "end-divider",
      "selector": [
        "main.cmp-layout-container--fixed:nth-of-type(2) .separator:not(.cmp-separator--hidden)"
      ],
      "style": "wknd-divider-large",
      "blocks": [],
      "defaultContent": []
    }
  ]
};

// TRANSFORMER REGISTRY - cleanup first, then sections (only when the template has 2+ sections)
const transformers = [
  cleanupTransformer,
  // sections transformer when there are 2+ sections, or a single section with a style
  ...(PAGE_TEMPLATE.sections && (PAGE_TEMPLATE.sections.length > 1 || PAGE_TEMPLATE.sections.some((s) => s.style)) ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - "beforeTransform" or "afterTransform"
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Initial cleanup + section break markers
    executeTransformers("beforeTransform", main, payload);

    // 2. Find blocks using the embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup + section metadata
    executeTransformers("afterTransform", main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement("hr");
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    // page template -> body.wknd-site, so the wknd.site styles stay scoped to these pages
    const metadataTable = [...main.querySelectorAll("table")].reverse()
      .find((t) => t.textContent.trim().toLowerCase().startsWith("metadata"));
    if (metadataTable) {
      const row = document.createElement("tr");
      ["template", "wknd-site"].forEach((text) => {
        const cell = document.createElement("td");
        cell.textContent = text;
        row.append(cell);
      });
      (metadataTable.querySelector("tbody") || metadataTable).append(row);
    }
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path; the root URL maps to /index
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, "")
      .replace(/\.html?$/, "");
    const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
