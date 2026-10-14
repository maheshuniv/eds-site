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

  // tools/importer/import-wknd-site-adventure-detail.js
  var import_wknd_site_adventure_detail_exports = {};
  __export(import_wknd_site_adventure_detail_exports, {
    default: () => import_wknd_site_adventure_detail_default
  });

  // tools/importer/parsers/breadcrumb-wknd.js
  var SITE_ORIGIN = "https://wknd.site";
  function absoluteHref(href) {
    const raw = (href || "").trim();
    if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) return raw;
    try {
      const url = new URL(raw, SITE_ORIGIN);
      if (/^\//.test(raw) || /(^|\.)wknd\.site$/i.test(url.hostname) || /^(localhost|127\.0\.0\.1)$/.test(url.hostname)) {
        return `${SITE_ORIGIN}${url.pathname}${url.search}${url.hash}`;
      }
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  var clean = (t) => (t || "").replace(/[\s ]+/g, " ").trim();
  function parse(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".cmp-breadcrumb__list > .cmp-breadcrumb__item")];
    if (!items.length) items = [...element.querySelectorAll(".cmp-breadcrumb__item, nav ol > li, nav ul > li")];
    const ul = document2.createElement("ul");
    items.forEach((item, idx) => {
      const isLast = idx === items.length - 1;
      const link = item.querySelector("a[href]");
      const nameEl = item.querySelector('[itemprop="name"], span') || link || item;
      const text = clean(nameEl.textContent) || clean(item.textContent);
      if (!text) return;
      const li = document2.createElement("li");
      if (link && !isLast && !item.classList.contains("cmp-breadcrumb__item--active")) {
        const a = document2.createElement("a");
        a.href = absoluteHref(link.getAttribute("href"));
        a.textContent = text;
        li.append(a);
      } else {
        li.textContent = text;
      }
      ul.append(li);
    });
    if (!ul.children.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[ul]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "breadcrumb-wknd", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel-wknd.js
  var SITE_ORIGIN2 = "https://wknd.site";
  function absoluteSrc(src) {
    const raw = (src || "").trim();
    if (!raw || /^data:/i.test(raw)) return raw;
    try {
      const url = new URL(raw, SITE_ORIGIN2);
      if (/^\//.test(raw) || /(^|\.)wknd\.site$/i.test(url.hostname) || /^(localhost|127\.0\.0\.1)$/.test(url.hostname)) {
        return `${SITE_ORIGIN2}${url.pathname}${url.search}`;
      }
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  function buildImage(slide, document2) {
    const src = slide.querySelector("img.cmp-image__image") || slide.querySelector("img");
    let url = src ? src.getAttribute("src") || "" : "";
    if (!url || /^data:/i.test(url)) {
      const holder = slide.querySelector("[data-cmp-src]");
      if (holder) url = holder.getAttribute("data-cmp-src").replace("{.width}", "");
    }
    if (!url) return null;
    const img = document2.createElement("img");
    img.src = absoluteSrc(url);
    const alt = src && (src.getAttribute("alt") || src.getAttribute("title")) || "";
    img.alt = alt.trim();
    return img;
  }
  function parse2(element, { document: document2 }) {
    let slides = [...element.querySelectorAll(".cmp-carousel__content > .cmp-carousel__item")];
    if (!slides.length) slides = [...element.querySelectorAll('.cmp-carousel__item, [data-cmp-hook-carousel="item"]')];
    if (!slides.length) {
      slides = [...element.querySelectorAll(".cmp-image")];
    }
    const cells = [];
    slides.forEach((slide) => {
      const img = buildImage(slide, document2);
      if (img) cells.push([img]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel-wknd", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-wknd-details.js
  var clean2 = (t) => (t || "").replace(/[\s ]+/g, " ").trim();
  function parse3(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".cmp-contentfragment__elements > .cmp-contentfragment__element")];
    if (!items.length) items = [...element.querySelectorAll(".cmp-contentfragment__element")];
    const cells = [];
    items.forEach((item) => {
      const labelEl = item.querySelector(".cmp-contentfragment__element-title") || item.querySelector("dt");
      const valueEl = item.querySelector(".cmp-contentfragment__element-value") || item.querySelector("dd");
      const label = clean2(labelEl && labelEl.textContent);
      const value = clean2(valueEl && valueEl.textContent);
      if (!label && !value) return;
      cells.push([label, value]);
    });
    if (!cells.length) {
      const dts = [...element.querySelectorAll("dt")];
      dts.forEach((dt) => {
        const dd = dt.nextElementSibling && dt.nextElementSibling.matches("dd") ? dt.nextElementSibling : null;
        const label = clean2(dt.textContent);
        const value = clean2(dd && dd.textContent);
        if (label || value) cells.push([label, value]);
      });
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const narrow = /aem-GridColumn--(phone|tablet)--\d+/.test(element.className || "");
    const block = WebImporter.Blocks.createBlock(document2, { name: narrow ? "columns-wknd-details (narrow)" : "columns-wknd-details", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-wknd.js
  var SITE_ORIGIN3 = "https://wknd.site";
  var CONTENT_TAGS = /* @__PURE__ */ new Set(["P", "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "BLOCKQUOTE", "TABLE", "PRE", "HR"]);
  var SKIP_TAGS = /* @__PURE__ */ new Set(["SCRIPT", "STYLE", "META", "NOSCRIPT", "BUTTON", "TEMPLATE"]);
  var clean3 = (t) => (t || "").replace(/[\s ]+/g, " ").trim();
  function absoluteUrl(raw, keepHash) {
    const v = (raw || "").trim();
    if (!v || /^(#|mailto:|tel:|javascript:|data:)/i.test(v)) return v;
    try {
      const url = new URL(v, SITE_ORIGIN3);
      if (/^\//.test(v) || /(^|\.)wknd\.site$/i.test(url.hostname) || /^(localhost|127\.0\.0\.1)$/.test(url.hostname)) {
        return `${SITE_ORIGIN3}${url.pathname}${url.search}${keepHash ? url.hash : ""}`;
      }
      return url.href;
    } catch (e) {
      return v;
    }
  }
  function buildImage2(img, document2) {
    let src = img.getAttribute("src") || "";
    if (!src || /^data:/i.test(src)) {
      const holder = img.closest("[data-cmp-src]");
      if (holder) src = holder.getAttribute("data-cmp-src").replace("{.width}", "");
    }
    if (!src) return null;
    const out = document2.createElement("img");
    out.src = absoluteUrl(src, false);
    out.alt = clean3(img.getAttribute("alt") || img.getAttribute("title") || "");
    return out;
  }
  function tidy(el, document2) {
    const walker = document2.createTreeWalker(
      el,
      4
      /* SHOW_TEXT */
    );
    const texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach((t) => {
      if (t.nodeValue.includes(" ")) t.nodeValue = t.nodeValue.replace(/ /g, " ");
    });
    el.querySelectorAll("a[href]").forEach((a) => a.setAttribute("href", absoluteUrl(a.getAttribute("href"), true)));
    el.querySelectorAll("img").forEach((img) => {
      const n = buildImage2(img, document2);
      if (n) img.replaceWith(n);
      else img.remove();
    });
    el.querySelectorAll("meta, script, style").forEach((n) => n.remove());
    return el;
  }
  function collectContent(node, out, document2) {
    [...node.childNodes].forEach((child) => {
      if (child.nodeType === 3) {
        const text = clean3(child.nodeValue);
        if (text) {
          const p = document2.createElement("p");
          p.textContent = text;
          out.push(p);
        }
        return;
      }
      if (child.nodeType !== 1) return;
      const tag = child.tagName;
      if (SKIP_TAGS.has(tag)) return;
      if (child.matches(".cmp-contentfragment__title")) return;
      if (tag === "IMG") {
        const img = buildImage2(child, document2);
        if (img) out.push(img);
        return;
      }
      if (tag === "PICTURE") {
        const img = child.querySelector("img");
        const built = img && buildImage2(img, document2);
        if (built) out.push(built);
        return;
      }
      if (CONTENT_TAGS.has(tag)) {
        tidy(child, document2);
        if (tag !== "HR" && !clean3(child.textContent) && !child.querySelector("img")) return;
        out.push(child);
        return;
      }
      if (child.matches(".cmp-image__title")) {
        const text = clean3(child.textContent);
        if (!text) return;
        const p = document2.createElement("p");
        const em = document2.createElement("em");
        em.textContent = text;
        p.append(em);
        out.push(p);
        return;
      }
      if (["B", "STRONG", "I", "EM", "A", "SPAN", "U"].includes(tag)) {
        tidy(child, document2);
        if (!clean3(child.textContent)) return;
        const p = document2.createElement("p");
        p.append(child);
        out.push(p);
        return;
      }
      collectContent(child, out, document2);
    });
    return out;
  }
  function parse4(element, { document: document2 }) {
    const root = element.querySelector(".cmp-tabs") || element;
    root.querySelectorAll(".cmp-image__title").forEach((caption) => {
      const view = caption.ownerDocument && caption.ownerDocument.defaultView || null;
      if (view && view.getComputedStyle(caption).display === "none") caption.remove();
    });
    let tabs = [...root.querySelectorAll(":scope > .cmp-tabs__tablist > .cmp-tabs__tab")];
    if (!tabs.length) tabs = [...root.querySelectorAll('.cmp-tabs__tab, [role="tab"]')];
    let panels = [...root.querySelectorAll(":scope > .cmp-tabs__tabpanel")];
    if (!panels.length) panels = [...root.querySelectorAll('.cmp-tabs__tabpanel, [role="tabpanel"]')];
    const cells = [];
    const used = /* @__PURE__ */ new Set();
    const count = Math.max(tabs.length, panels.length);
    for (let i = 0; i < count; i += 1) {
      const tab = tabs[i];
      let panel = null;
      if (tab) {
        const ctrl = tab.getAttribute("aria-controls") || (tab.id ? `${tab.id}panel` : "");
        panel = panels.find((p) => !used.has(p) && p.id && (p.id === ctrl || p.getAttribute("aria-labelledby") === tab.id)) || null;
      }
      if (!panel) panel = panels.find((p) => !used.has(p)) || null;
      if (panel) used.add(panel);
      const label = clean3(tab && tab.textContent) || `Tab ${i + 1}`;
      let content = [];
      if (panel) {
        const scope = panel.querySelector(".cmp-contentfragment__elements") || panel;
        content = collectContent(scope, [], document2);
      }
      if (!clean3(tab && tab.textContent) && !content.length) continue;
      cells.push([label, content.length ? content : ""]);
    }
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-wknd", cells });
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

  // tools/importer/import-wknd-site-adventure-detail.js
  var parsers = {
    "breadcrumb-wknd": parse,
    "carousel-wknd": parse2,
    "columns-wknd-details": parse3,
    "tabs-wknd": parse4
  };
  var PAGE_TEMPLATE = {
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
  var import_wknd_site_adventure_detail_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      const titleContainer = [...document2.querySelectorAll(".cmp-title__text")].map((t) => t.closest(".cmp-layout-container--fixed")).find((c) => c && !c.closest(".experiencefragment, .cmp-experiencefragment"));
      const inset = !!titleContainer && !titleContainer.classList.contains("aem-GridColumn");
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
        const rows = [["template", "wknd-site"]];
        if (inset) rows.push(["theme", "wknd-inset"]);
        rows.forEach((cells) => {
          const row = document2.createElement("tr");
          cells.forEach((text) => {
            const cell = document2.createElement("td");
            cell.textContent = text;
            row.append(cell);
          });
          (metadataTable.querySelector("tbody") || metadataTable).append(row);
        });
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
  return __toCommonJS(import_wknd_site_adventure_detail_exports);
})();
