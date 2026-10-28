/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-wknd-site-home.js
  var import_wknd_site_home_exports = {};
  __export(import_wknd_site_home_exports, {
    default: () => import_wknd_site_home_default
  });

  // tools/importer/parsers/carousel-wknd-hero.js
  var ORIGIN = "https://wknd.site";
  function absUrl(href) {
    if (!href) return href;
    try {
      return new URL(href, ORIGIN).href;
    } catch (e) {
      return href;
    }
  }
  function buildSlide(item, document2) {
    const image = item.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    const pretitle = item.querySelector(".cmp-teaser__pretitle");
    const heading = item.querySelector(".cmp-teaser__title, h1, h2, h3, h4");
    const descWrap = item.querySelector(".cmp-teaser__description");
    const ctas = [...item.querySelectorAll(".cmp-teaser__action-link")];
    const text = [];
    if (pretitle && pretitle.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = pretitle.textContent.trim();
      text.push(p);
    }
    if (heading && heading.textContent.trim()) {
      const h = document2.createElement("h2");
      h.textContent = heading.textContent.trim();
      text.push(h);
    }
    if (descWrap) {
      const paras = [...descWrap.querySelectorAll("p")].filter((p) => p.textContent.trim());
      if (paras.length) {
        paras.forEach((para) => {
          const p = document2.createElement("p");
          p.textContent = para.textContent.trim();
          text.push(p);
        });
      } else if (descWrap.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = descWrap.textContent.trim();
        text.push(p);
      }
    }
    ctas.forEach((link) => {
      const label = link.textContent.trim();
      if (!label) return;
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      const a = document2.createElement("a");
      a.href = absUrl(link.getAttribute("href"));
      a.textContent = label;
      strong.append(a);
      p.append(strong);
      text.push(p);
    });
    if (!image && !text.length) return null;
    return [image || "", text.length ? text : ""];
  }
  function parse(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".cmp-carousel__content > .cmp-carousel__item")];
    if (!items.length) items = [...element.querySelectorAll(".cmp-carousel__item")];
    if (!items.length) items = [...element.querySelectorAll(".cmp-teaser")];
    const cells = [];
    items.forEach((item) => {
      const row = buildSlide(item, document2);
      if (row) cells.push(row);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-wknd-hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-magazine.js
  var SOURCE_ORIGIN = "https://wknd.site";
  function absoluteHref(href) {
    if (!href) return href;
    if (/^(mailto:|tel:|#|javascript:)/i.test(href)) return href;
    try {
      const url = new URL(href, SOURCE_ORIGIN);
      if (/^https?:$/.test(url.protocol) && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
        return `${SOURCE_ORIGIN}${url.pathname}${url.search}${url.hash}`;
      }
      return url.href;
    } catch (e) {
      return href;
    }
  }
  function parse2(element, { document: document2 }) {
    const teaser = element.querySelector(".cmp-teaser") || element;
    const pretitle = teaser.querySelector(".cmp-teaser__pretitle");
    const heading = teaser.querySelector(".cmp-teaser__title, h1, h2, h3, h4");
    const description = teaser.querySelector(".cmp-teaser__description");
    const ctas = [...teaser.querySelectorAll(".cmp-teaser__action-link")];
    if (!ctas.length) {
      const fallback = teaser.querySelector(".cmp-teaser__action-container a, .cmp-teaser__content a[href]");
      if (fallback) ctas.push(fallback);
    }
    const image = teaser.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    if (!heading && !description && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const imageCell = [];
    if (image) imageCell.push(image);
    const textCell = [];
    if (pretitle && pretitle.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = pretitle.textContent.trim();
      textCell.push(p);
    }
    if (heading) {
      const h = document2.createElement(/^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : "h2");
      h.textContent = heading.textContent.trim();
      textCell.push(h);
    }
    if (description) {
      const paras = [...description.querySelectorAll("p")].filter((p) => p.textContent.trim());
      if (paras.length) {
        textCell.push(...paras);
      } else if (description.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = description.textContent.trim();
        textCell.push(p);
      }
    }
    ctas.forEach((a) => {
      const label = a.textContent.trim();
      if (!label) return;
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      const link = document2.createElement("a");
      link.href = absoluteHref(a.getAttribute("href"));
      link.textContent = label;
      strong.append(link);
      p.append(strong);
      textCell.push(p);
    });
    const cells = [[imageCell.length ? imageCell : "", textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-magazine", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-magazine.js
  var SOURCE_ORIGIN2 = "https://wknd.site";
  function absoluteHref2(href) {
    if (!href) return href;
    if (/^(mailto:|tel:|#|javascript:)/i.test(href)) return href;
    try {
      const url = new URL(href, SOURCE_ORIGIN2);
      if (/^https?:$/.test(url.protocol) && (url.hostname === "localhost" || url.hostname === "127.0.0.1")) {
        return `${SOURCE_ORIGIN2}${url.pathname}${url.search}${url.hash}`;
      }
      return url.href;
    } catch (e) {
      return href;
    }
  }
  function parse3(element, { document: document2 }) {
    let items = [...element.querySelectorAll("li.cmp-image-list__item")];
    if (!items.length) items = [...element.querySelectorAll("article, li")];
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      var _a;
      const image = item.querySelector(".cmp-image-list__item-image img, img");
      const titleEl = item.querySelector(".cmp-image-list__item-title, h2, h3, h4");
      const titleLink = item.querySelector("a.cmp-image-list__item-title-link") || (titleEl == null ? void 0 : titleEl.closest("a")) || item.querySelector("a[href]");
      const descEl = item.querySelector(".cmp-image-list__item-description");
      const titleText = (_a = titleEl || titleLink) == null ? void 0 : _a.textContent.trim();
      const descText = descEl == null ? void 0 : descEl.textContent.trim();
      if (!image && !titleText && !descText) return;
      const textCell = [];
      if (titleText) {
        const p = document2.createElement("p");
        const href = titleLink == null ? void 0 : titleLink.getAttribute("href");
        if (href) {
          const a = document2.createElement("a");
          a.href = absoluteHref2(href);
          a.textContent = titleText;
          p.append(a);
        } else {
          p.textContent = titleText;
        }
        textCell.push(p);
      }
      if (descText) {
        const p = document2.createElement("p");
        p.textContent = descText;
        textCell.push(p);
      }
      cells.push([image || "", textCell.length ? textCell : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-magazine", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-wknd-teaser.js
  var ORIGIN2 = "https://wknd.site";
  function absUrl2(href) {
    if (!href) return href;
    try {
      return new URL(href, ORIGIN2).href;
    } catch (e) {
      return href;
    }
  }
  function parse4(element, { document: document2 }) {
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    const pretitle = element.querySelector(".cmp-teaser__pretitle");
    const heading = element.querySelector(".cmp-teaser__title, h1, h2, h3, h4");
    const descWrap = element.querySelector(".cmp-teaser__description");
    const ctas = [...element.querySelectorAll(".cmp-teaser__action-link")];
    const text = [];
    if (pretitle && pretitle.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = pretitle.textContent.trim();
      text.push(p);
    }
    if (heading && heading.textContent.trim()) {
      const h = document2.createElement("h2");
      h.textContent = heading.textContent.trim();
      text.push(h);
    }
    if (descWrap) {
      const paras = [...descWrap.querySelectorAll("p")].filter((p) => p.textContent.trim());
      if (paras.length) {
        paras.forEach((para) => {
          const p = document2.createElement("p");
          p.textContent = para.textContent.trim();
          text.push(p);
        });
      } else if (descWrap.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = descWrap.textContent.trim();
        text.push(p);
      }
    }
    ctas.forEach((link) => {
      const label = link.textContent.trim();
      if (!label) return;
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      const a = document2.createElement("a");
      a.href = absUrl2(link.getAttribute("href"));
      a.textContent = label;
      strong.append(a);
      p.append(strong);
      text.push(p);
    });
    if (!image && !text.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[image || "", text.length ? text : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-wknd-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-site-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var SOURCE_ORIGIN3 = "https://wknd.site";
  var DEFAULT_BASE = `${SOURCE_ORIGIN3}/us/en/magazine.html`;
  var CHROME_SELECTORS = [
    "header.cmp-experiencefragment--header",
    ".cmp-experiencefragment--header",
    "footer.cmp-experiencefragment--footer",
    ".cmp-experiencefragment--footer",
    ".sign-in-buttons",
    ".languagenavigation",
    ".cmp-navigation--header",
    ".cmp-search--header",
    "#toggleNav",
    "#mobileNav",
    ".cmp-navigation--mobile",
    // adventure pages: third-party "Share this Adventure" widget (script-driven) and its heading
    ".title:has(+ .sharing)",
    ".sharing",
    "iframe",
    "script",
    "noscript",
    "style",
    "link"
  ];
  function getBaseUrl(payload) {
    const candidate = payload && (payload.params && payload.params.originalURL || payload.url) || "";
    try {
      const url = new URL(candidate);
      return url.origin === SOURCE_ORIGIN3 ? url.href : `${SOURCE_ORIGIN3}${url.pathname}${url.search}`;
    } catch (e) {
      return DEFAULT_BASE;
    }
  }
  function toAbsolute(value, baseUrl) {
    try {
      const resolved = new URL(value, baseUrl);
      if (resolved.origin === new URL(baseUrl).origin || /^(?:localhost|127\.0\.0\.1)$/.test(resolved.hostname)) {
        return `${SOURCE_ORIGIN3}${resolved.pathname}${resolved.search}${resolved.hash}`;
      }
      return resolved.href;
    } catch (e) {
      return value;
    }
  }
  function isSkippable(value) {
    return !value || value.startsWith("#") || /^(?:mailto|tel|javascript|data):/i.test(value);
  }
  function resolveUrls(element, baseUrl) {
    element.querySelectorAll("img").forEach((img) => {
      let src = img.getAttribute("src");
      if (!src || /^data:/i.test(src)) {
        const lazy = img.getAttribute("data-cmp-src") || img.getAttribute("data-src");
        if (lazy) src = lazy.replace("{.width}", "");
      }
      if (src && !/^data:/i.test(src)) img.setAttribute("src", toAbsolute(src, baseUrl));
      if (img.hasAttribute("srcset")) img.removeAttribute("srcset");
    });
    element.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href").trim();
      if (isSkippable(href)) return;
      a.setAttribute("href", toAbsolute(href, baseUrl));
    });
  }
  function localizePageLinks(element) {
    element.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href").trim();
      let url;
      try {
        url = new URL(href, SOURCE_ORIGIN3);
      } catch (e) {
        return;
      }
      if (url.origin !== SOURCE_ORIGIN3 || !/^\/us\/en(\/.*)?\.html$/.test(url.pathname)) return;
      a.setAttribute("href", `${url.pathname.replace(/\.html$/, "")}${url.search}${url.hash}`);
    });
  }
  function removeSkipLinks(element) {
    element.querySelectorAll('a[href^="#"]').forEach((a) => {
      if (/^\s*skip\s+to\b/i.test(a.textContent)) a.remove();
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, CHROME_SELECTORS);
      removeSkipLinks(element);
      element.querySelectorAll(".cmp-image meta").forEach((m) => m.remove());
      resolveUrls(element, getBaseUrl(payload));
      element.querySelectorAll(".button > a.cmp-button").forEach((a) => {
        if (a.closest(".experiencefragment, .cmp-experiencefragment")) return;
        const label = (a.textContent || "").replace(/\s+/g, " ").trim();
        const href = a.getAttribute("href");
        if (!label || !href) return;
        const doc = a.ownerDocument;
        const p = doc.createElement("p");
        const strong = doc.createElement("strong");
        const link = doc.createElement("a");
        link.setAttribute("href", href);
        link.textContent = label;
        strong.append(link);
        p.append(strong);
        a.replaceWith(p);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, CHROME_SELECTORS);
      removeSkipLinks(element);
      resolveUrls(element, getBaseUrl(payload));
      localizePageLinks(element);
      element.querySelectorAll("*").forEach((el) => {
        ["onclick", "onload", "data-cmp-data-layer", "data-cmp-clickable"].forEach((attr) => {
          if (el.hasAttribute(attr)) el.removeAttribute(attr);
        });
      });
    }
  }

  // tools/importer/transformers/wknd-site-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (!sections.length || sections.length < 2 && !sections[0].style) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        if (i > 0 && sectionEl.classList.contains("separator")) {
          sectionEl.replaceWith(hr);
        } else {
          sectionEl.before(hr);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
      element.querySelectorAll("main .separator, .cmp-separator").forEach((el) => el.remove());
    }
  }

  // tools/importer/import-wknd-site-home.js
  var parsers = {
    "carousel-wknd-hero": parse,
    "columns-magazine": parse2,
    "cards-magazine": parse3,
    "hero-wknd-teaser": parse4
  };
  var PAGE_TEMPLATE = {
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
  var transformers = [
    transform,
    // sections transformer when there are 2+ sections, or a single section with a style
    ...PAGE_TEMPLATE.sections && (PAGE_TEMPLATE.sections.length > 1 || PAGE_TEMPLATE.sections.some((s) => s.style)) ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_wknd_site_home_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      const metadataTable = [...main.querySelectorAll("table")].reverse().find((t) => t.textContent.trim().toLowerCase().startsWith("metadata"));
      if (metadataTable) {
        const row = document2.createElement("tr");
        ["template", "wknd-site"].forEach((text) => {
          const cell = document2.createElement("td");
          cell.textContent = text;
          row.append(cell);
        });
        (metadataTable.querySelector("tbody") || metadataTable).append(row);
      }
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_wknd_site_home_exports);
})();
