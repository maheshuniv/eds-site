/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import breadcrumbWkndParser from "./parsers/breadcrumb-wknd.js";
import carouselWkndParser from "./parsers/carousel-wknd.js";
import columnsWkndDetailsParser from "./parsers/columns-wknd-details.js";
import tabsWkndParser from "./parsers/tabs-wknd.js";

// TRANSFORMER IMPORTS
import cleanupTransformer from "./transformers/wknd-site-cleanup.js";
import sectionsTransformer from "./transformers/wknd-site-sections.js";

// PARSER REGISTRY
const parsers = {
  "breadcrumb-wknd": breadcrumbWkndParser,
  "carousel-wknd": carouselWkndParser,
  "columns-wknd-details": columnsWkndDetailsParser,
  "tabs-wknd": tabsWkndParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "wknd-site-adventure-detail",
  "description": "WKND (wknd.site) adventure detail (shared by all /us/en/adventures/*.html): breadcrumb, full-width image carousel, underlined title, details list (left 3/12) + Overview/Itinerary/What to Bring tabs (right 9/12)",
  "urls": [
    "https://wknd.site/us/en/adventures/bali-surf-camp.html"
  ],
  "blocks": [
    {
      "name": "breadcrumb-wknd",
      "instances": [
        "main .breadcrumb.cmp-breadcrumb--fixed"
      ]
    },
    {
      "name": "carousel-wknd",
      "instances": [
        "main .carousel.panelcontainer.cmp-carousel--mini"
      ]
    },
    {
      "name": "columns-wknd-details",
      "instances": [
        "main .contentfragment.cmp-contentfragment--elements"
      ]
    },
    {
      "name": "tabs-wknd",
      "instances": [
        "main .cmp-layout-container--fixed .tabs.panelcontainer"
      ]
    }
  ],
  "sections": [
    {
      "id": "1",
      "name": "breadcrumb",
      "selector": [
        "main .breadcrumb.cmp-breadcrumb--fixed"
      ],
      "style": null,
      "blocks": [
        "breadcrumb-wknd"
      ],
      "defaultContent": []
    },
    {
      "id": "2",
      "name": "carousel",
      "selector": [
        "main .carousel.panelcontainer.cmp-carousel--mini"
      ],
      "style": null,
      "blocks": [
        "carousel-wknd"
      ],
      "defaultContent": []
    },
    {
      "id": "3",
      "name": "title",
      "selector": [
        "main .cmp-layout-container--fixed > .cmp-container > .aem-Grid > .title.cmp-title--underline"
      ],
      "style": "wknd-underline-title",
      "blocks": [],
      "defaultContent": [
        ".cmp-title__text"
      ]
    },
    {
      "id": "4",
      "name": "details",
      "selector": [
        "main .cmp-layout-container--fixed > .cmp-container > .aem-Grid > .container:has(.contentfragment)"
      ],
      "style": "wknd-adventure-details",
      "blocks": [
        "columns-wknd-details",
        "tabs-wknd"
      ],
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
    // older adventure pages lay their fixed-width content container out without the outer AEM grid, so it keeps
    // its own 14px gutter (content inset twice); flag them with the "wknd-inset" theme (styled in templates/wknd-site)
    const titleContainer = [...document.querySelectorAll(".cmp-title__text")]
      .map((t) => t.closest(".cmp-layout-container--fixed"))
      .find((c) => c && !c.closest(".experiencefragment, .cmp-experiencefragment"));
    const inset = !!titleContainer && !titleContainer.classList.contains("aem-GridColumn");

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
      const rows = [["template", "wknd-site"]];
      if (inset) rows.push(["theme", "wknd-inset"]);
      rows.forEach((cells) => {
        const row = document.createElement("tr");
        cells.forEach((text) => {
          const cell = document.createElement("td");
          cell.textContent = text;
          row.append(cell);
        });
        (metadataTable.querySelector("tbody") || metadataTable).append(row);
      });
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
