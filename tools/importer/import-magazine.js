/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import columnsMagazineParser from "./parsers/columns-magazine.js";
import cardsMagazineParser from "./parsers/cards-magazine.js";
import cardsMagazineSecureParser from "./parsers/cards-magazine-secure.js";

// TRANSFORMER IMPORTS
import cleanupTransformer from "./transformers/wknd-site-cleanup.js";
import sectionsTransformer from "./transformers/wknd-site-sections.js";

// PARSER REGISTRY
const parsers = {
  "columns-magazine": columnsMagazineParser,
  "cards-magazine": cardsMagazineParser,
  "cards-magazine-secure": cardsMagazineSecureParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "magazine",
  "description": "WKND (wknd.site) magazine landing: page title + featured teaser, All Articles image-list grid, Members Only intro, gated teasers",
  "urls": [
    "https://wknd.site/us/en/magazine.html"
  ],
  "blocks": [
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
      "name": "cards-magazine-secure",
      "instances": [
        "main .teaser.cmp-teaser--secure"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "featured",
      "selector": [
        "main .aem-Grid > .title:not(.cmp-title--underline)"
      ],
      "style": null,
      "blocks": [
        "columns-magazine"
      ],
      "defaultContent": [
        "main .aem-Grid > .title:not(.cmp-title--underline) h1"
      ]
    },
    {
      "id": "2",
      "name": "all-articles",
      "selector": [
        "main .aem-Grid > .title.cmp-title--underline:has(+ .image-list)"
      ],
      "style": null,
      "blocks": [
        "cards-magazine"
      ],
      "defaultContent": [
        ".cmp-title__text"
      ]
    },
    {
      "id": "3",
      "name": "members-intro",
      "selector": [
        "main .aem-Grid > .title.cmp-title--underline:has(+ .text)"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".cmp-title__text",
        "main .aem-Grid > .text p"
      ]
    },
    {
      "id": "4",
      "name": "members-teasers",
      "selector": [
        "main .aem-Grid > .separator"
      ],
      "style": "wknd-divider",
      "blocks": [
        "cards-magazine-secure"
      ],
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
