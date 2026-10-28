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

  // tools/importer/import-wknd-site-adventures.js
  var import_wknd_site_adventures_exports = {};
  __export(import_wknd_site_adventures_exports, {
    default: () => import_wknd_site_adventures_default
  });

  // tools/importer/parsers/hero-wknd.js
  function parse(element, { document: document2 }) {
    const image = element.querySelector(".cmp-teaser__image img, .cmp-image img, img");
    const heading = element.querySelector(".cmp-teaser__title, h1, h2, h3");
    const descWrap = element.querySelector(".cmp-teaser__description");
    const pretitle = element.querySelector(".cmp-teaser__pretitle");
    const textCell = [];
    if (pretitle && pretitle.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = pretitle.textContent.trim();
      textCell.push(p);
    }
    if (heading) {
      const h = document2.createElement("h2");
      h.textContent = heading.textContent.trim();
      textCell.push(h);
    }
    if (descWrap) {
      const paras = [...descWrap.querySelectorAll("p")];
      if (paras.length) textCell.push(...paras);
      else if (descWrap.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = descWrap.textContent.trim();
        textCell.push(p);
      }
    }
    element.querySelectorAll(".cmp-teaser__action-link").forEach((a) => textCell.push(a));
    if (!image && !textCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) cells.push([image]);
    if (textCell.length) cells.push([textCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-wknd", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-wknd-adventure.js
  var ORIGIN = "https://wknd.site";
  function absoluteUrl(href) {
    if (!href) return "";
    const raw = href.trim();
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("//")) return `https:${raw}`;
    try {
      return new URL(raw, `${ORIGIN}/us/en/adventures.html`).href;
    } catch (e) {
      return raw;
    }
  }
  function hrefKey(href) {
    const abs = absoluteUrl(href);
    try {
      const u = new URL(abs);
      return u.pathname.replace(/\/$/, "").toLowerCase();
    } catch (e) {
      return abs.toLowerCase();
    }
  }
  function itemHref(item) {
    const a = item.querySelector("a.cmp-image-list__item-title-link[href], a.cmp-image-list__item-image-link[href]") || item.querySelector("a[href]");
    return a ? a.getAttribute("href") : "";
  }
  function panelItems(panel) {
    return [...panel.querySelectorAll("li.cmp-image-list__item, .cmp-image-list > li")].filter((li, i, arr) => arr.indexOf(li) === i).filter((li) => li.closest('.cmp-tabs__tabpanel, [role="tabpanel"]') === panel);
  }
  function parse2(element, { document: document2 }) {
    const tabs = [...element.querySelectorAll('.cmp-tabs__tablist .cmp-tabs__tab, ol[role="tablist"] > li')].filter((t, i, arr) => arr.indexOf(t) === i);
    const panels = [...element.querySelectorAll(".cmp-tabs__tabpanel")];
    const pairs = tabs.map((tab, i) => {
      const label = tab.textContent.replace(/\s+/g, " ").trim();
      let panel = null;
      const controls = tab.getAttribute("aria-controls");
      if (controls) panel = panels.find((p) => p.id === controls) || null;
      if (!panel && tab.id && tab.id.endsWith("-tab")) {
        const pid = `${tab.id.slice(0, -4)}-tabpanel`;
        panel = panels.find((p) => p.id === pid) || null;
      }
      if (!panel) panel = panels[i] || null;
      return { label, panel };
    });
    let allPair = pairs.find((p) => /^all$/i.test(p.label));
    if (!allPair && pairs.length) [allPair] = pairs;
    const categoryPairs = pairs.filter((p) => p !== allPair && p.panel);
    const categoriesByHref = /* @__PURE__ */ new Map();
    categoryPairs.forEach(({ label, panel }) => {
      panelItems(panel).forEach((li) => {
        const key = hrefKey(itemHref(li));
        if (!key) return;
        if (!categoriesByHref.has(key)) categoriesByHref.set(key, []);
        const list = categoriesByHref.get(key);
        if (!list.includes(label)) list.push(label);
      });
    });
    let sourceItems = allPair && allPair.panel ? panelItems(allPair.panel) : [];
    if (!sourceItems.length) sourceItems = [...element.querySelectorAll("li.cmp-image-list__item")];
    const seen = /* @__PURE__ */ new Set();
    const cells = [];
    sourceItems.forEach((li) => {
      const rawHref = itemHref(li);
      const key = hrefKey(rawHref) || li.textContent.trim();
      if (seen.has(key)) return;
      seen.add(key);
      const img = li.querySelector(".cmp-image-list__item-image img, img");
      const titleEl = li.querySelector(".cmp-image-list__item-title, .cmp-image-list__item-title-link");
      const descEl = li.querySelector(".cmp-image-list__item-description");
      const title = titleEl ? titleEl.textContent.replace(/\s+/g, " ").trim() : "";
      const desc = descEl ? descEl.textContent.replace(/\s+/g, " ").trim() : "";
      if (!img && !title && !desc) return;
      const textCell = [];
      if (title) {
        const p = document2.createElement("p");
        if (rawHref) {
          const a = document2.createElement("a");
          a.href = absoluteUrl(rawHref);
          a.textContent = title;
          p.append(a);
        } else {
          p.textContent = title;
        }
        textCell.push(p);
      }
      if (desc) {
        const p = document2.createElement("p");
        p.textContent = desc;
        textCell.push(p);
      }
      const categories = (categoriesByHref.get(hrefKey(rawHref)) || []).join(", ");
      cells.push([img || "", textCell.length ? textCell : "", categories]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-wknd-adventure", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-site-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var SOURCE_ORIGIN = "https://wknd.site";
  var DEFAULT_BASE = `${SOURCE_ORIGIN}/us/en/magazine.html`;
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
      return url.origin === SOURCE_ORIGIN ? url.href : `${SOURCE_ORIGIN}${url.pathname}${url.search}`;
    } catch (e) {
      return DEFAULT_BASE;
    }
  }
  function toAbsolute(value, baseUrl) {
    try {
      const resolved = new URL(value, baseUrl);
      if (resolved.origin === new URL(baseUrl).origin || /^(?:localhost|127\.0\.0\.1)$/.test(resolved.hostname)) {
        return `${SOURCE_ORIGIN}${resolved.pathname}${resolved.search}${resolved.hash}`;
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
        url = new URL(href, SOURCE_ORIGIN);
      } catch (e) {
        return;
      }
      if (url.origin !== SOURCE_ORIGIN || !/^\/us\/en(\/.*)?\.html$/.test(url.pathname)) return;
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

  // tools/importer/import-wknd-site-adventures.js
  var parsers = {
    "hero-wknd": parse,
    "cards-wknd-adventure": parse2
  };
  var PAGE_TEMPLATE = {
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
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
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
  var import_wknd_site_adventures_default = {
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
  return __toCommonJS(import_wknd_site_adventures_exports);
})();
