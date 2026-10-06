/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroAdventureParser from "./parsers/hero-adventure.js";
import columnsFeatureParser from "./parsers/columns-feature.js";
import tabsActivityParser from "./parsers/tabs-activity.js";
import cardsArticleParser from "./parsers/cards-article.js";
import cardsIndexParser from "./parsers/cards-index.js";
import cardsPromoParser from "./parsers/cards-promo.js";

// TRANSFORMER IMPORTS
import cleanupTransformer from "./transformers/wknd-adventures-cleanup.js";
import sectionsTransformer from "./transformers/wknd-adventures-sections.js";

// PARSER REGISTRY
const parsers = {
  "hero-adventure": heroAdventureParser,
  "columns-feature": columnsFeatureParser,
  "tabs-activity": tabsActivityParser,
  "cards-article": cardsArticleParser,
  "cards-index": cardsIndexParser,
  "cards-promo": cardsPromoParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "adventures",
  "description": "Adventures landing page: full-bleed hero, featured article, activity tabs with article tiles, recent reports grid, skill-level index and promo tiles, dark CTA band",
  "urls": [
    "https://wknd-adventures.com/adventures.html"
  ],
  "blocks": [
    {
      "name": "hero-adventure",
      "instances": [
        "main section.hero-section"
      ]
    },
    {
      "name": "columns-feature",
      "instances": [
        ".featured-article"
      ]
    },
    {
      "name": "tabs-activity",
      "instances": [
        ".tab-container"
      ]
    },
    {
      "name": "cards-article",
      "instances": [
        "main section.section > .container > .grid-layout.desktop-3-column"
      ]
    },
    {
      "name": "cards-index",
      "instances": [
        ".editorial-index"
      ]
    },
    {
      "name": "cards-promo",
      "instances": [
        ".grid-layout--2col"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "hero",
      "selector": [
        "main section.hero-section"
      ],
      "style": null,
      "blocks": [
        "hero-adventure"
      ],
      "defaultContent": []
    },
    {
      "id": "2",
      "name": "intro-band",
      "selector": [
        "main section.accent-section"
      ],
      "style": "accent, narrow",
      "blocks": [],
      "defaultContent": [
        "main section.accent-section h2",
        "main section.accent-section p"
      ]
    },
    {
      "id": "3",
      "name": "featured-article",
      "selector": [
        "main section.secondary-section:has(.featured-article)"
      ],
      "style": "secondary",
      "blocks": [
        "columns-feature"
      ],
      "defaultContent": []
    },
    {
      "id": "4",
      "name": "browse-by-activity",
      "selector": [
        "main section.section:has(.tab-container)"
      ],
      "style": null,
      "blocks": [
        "tabs-activity"
      ],
      "defaultContent": [
        ".section-heading h2"
      ]
    },
    {
      "id": "5",
      "name": "choosing-your-adventure",
      "selector": [
        "main section.secondary-section:not(:has(.featured-article)):not(:has(.section-heading))"
      ],
      "style": "secondary, narrow",
      "blocks": [],
      "defaultContent": [
        "h2",
        "p"
      ]
    },
    {
      "id": "6",
      "name": "recent-reports",
      "selector": [
        "main section.section:not(.secondary-section):has(> .container > .grid-layout.desktop-3-column)"
      ],
      "style": null,
      "blocks": [
        "cards-article"
      ],
      "defaultContent": [
        ".section-heading h2"
      ]
    },
    {
      "id": "7",
      "name": "skill-level",
      "selector": [
        "main section.secondary-section:has(.editorial-index)"
      ],
      "style": "secondary, narrow",
      "blocks": [
        "cards-index",
        "cards-promo"
      ],
      "defaultContent": [
        ".section-heading h2"
      ]
    },
    {
      "id": "8",
      "name": "gear-cta",
      "selector": [
        "main section.inverse-section"
      ],
      "style": "dark, centered",
      "blocks": [],
      "defaultContent": [
        "h2",
        "p",
        ".button-group a"
      ]
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
