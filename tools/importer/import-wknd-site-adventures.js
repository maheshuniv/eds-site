/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroWkndParser from "./parsers/hero-wknd.js";
import cardsWkndAdventureParser from "./parsers/cards-wknd-adventure.js";

// TRANSFORMER IMPORTS
import cleanupTransformer from "./transformers/wknd-site-cleanup.js";
import sectionsTransformer from "./transformers/wknd-site-sections.js";

// PARSER REGISTRY
const parsers = {
  "hero-wknd": heroWkndParser,
  "cards-wknd-adventure": cardsWkndAdventureParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "wknd-site-adventures",
  "description": "WKND (wknd.site) adventures landing: page title, full-width hero teaser, Current Adventures category-filtered grid",
  "urls": [
    "https://wknd.site/us/en/adventures.html"
  ],
  "blocks": [
    {
      "name": "hero-wknd",
      "instances": [
        "main .teaser.cmp-teaser--hero"
      ]
    },
    {
      "name": "cards-wknd-adventure",
      "instances": [
        "main .tabs.panelcontainer"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "page-title",
      "selector": [
        "main > .cmp-container > .aem-Grid > .container:first-child"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".cmp-title__text"
      ]
    },
    {
      "id": "2",
      "name": "hero",
      "selector": [
        "main > .cmp-container > .aem-Grid > .teaser.cmp-teaser--hero"
      ],
      "style": null,
      "blocks": [
        "hero-wknd"
      ],
      "defaultContent": []
    },
    {
      "id": "3",
      "name": "current-adventures",
      "selector": [
        "main > .cmp-container > .aem-Grid > .container:has(.tabs.panelcontainer)"
      ],
      "style": null,
      "blocks": [
        "cards-wknd-adventure"
      ],
      "defaultContent": [
        ".title.cmp-title--underline .cmp-title__text"
      ]
    },
    {
      "id": "4",
      "name": "end-divider",
      "selector": [
        "main > .cmp-container > .aem-Grid > .container .separator"
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
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
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
