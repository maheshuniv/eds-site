/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroBlogParser from "./parsers/hero-blog.js";
import columnsAsideParser from "./parsers/columns-aside.js";
import galleryAdventureParser from "./parsers/gallery-adventure.js";
import cardsArticleParser from "./parsers/cards-article.js";

// TRANSFORMER IMPORTS
import cleanupTransformer from "./transformers/wknd-adventures-cleanup.js";
import sectionsTransformer from "./transformers/wknd-adventures-sections.js";

// PARSER REGISTRY
const parsers = {
  "hero-blog": heroBlogParser,
  "columns-aside": columnsAsideParser,
  "gallery-adventure": galleryAdventureParser,
  "cards-article": cardsArticleParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
// sections are class-driven (wknd-adventures-sections.js); the placeholder entries only enable that transformer
const PAGE_TEMPLATE = {
  "name": "blog",
  "description": "WKND Adventures blog post (all /blog/*.html): blog hero with byline, article body (narrow, article), aside (packing list + pull quote), In the Field gallery, More Stories cards",
  "urls": [
    "https://wknd-adventures.com/blog/alpine-cycling.html",
    "https://wknd-adventures.com/blog/desert-survival-guide.html",
    "https://wknd-adventures.com/blog/kayaking-norway.html",
    "https://wknd-adventures.com/blog/mountain-photography.html",
    "https://wknd-adventures.com/blog/patagonia-trek.html",
    "https://wknd-adventures.com/blog/surfing-costa-rica.html",
    "https://wknd-adventures.com/blog/ultralight-backpacking.html",
    "https://wknd-adventures.com/blog/wild-swimming-guide.html",
    "https://wknd-adventures.com/blog/winter-mountaineering.html",
    "https://wknd-adventures.com/blog/yosemite-rock-climbing.html"
  ],
  "blocks": [
    {
      "name": "hero-blog",
      "instances": [
        "main section.hero-section:not(.hero-section--full)"
      ]
    },
    {
      "name": "columns-aside",
      "instances": [
        "main section.secondary-section > .container > .grid-layout.desktop-3-column:has(> .span-2):has(.pull-quote)"
      ]
    },
    {
      "name": "gallery-adventure",
      "instances": [
        ".grid-layout.grid-images"
      ]
    },
    {
      "name": "cards-article",
      "instances": [
        "main section.section > .container > .grid-layout.desktop-3-column:has(.article-card)"
      ]
    }
  ],
  "sections": [
    {
      "id": "class-driven",
      "name": "class-driven",
      "selector": [
        "#main-content > section"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": []
    },
    {
      "id": "class-driven-2",
      "name": "class-driven",
      "selector": [
        "#main-content > section"
      ],
      "style": null,
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
