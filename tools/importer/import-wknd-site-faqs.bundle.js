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

  // tools/importer/import-wknd-site-faqs.js
  var import_wknd_site_faqs_exports = {};
  __export(import_wknd_site_faqs_exports, {
    default: () => import_wknd_site_faqs_default
  });

  // tools/importer/parsers/accordion-wknd.js
  var SITE_ORIGIN = "https://wknd.site";
  var NBSP_RUN = /[ \t\r\n]*\u00a0[\u00a0 \t\r\n]*/g;
  var MEDIA = "img, picture, video, iframe, svg";
  function collapseNbsp(root, document2) {
    const walker = document2.createTreeWalker(
      root,
      4
      /* NodeFilter.SHOW_TEXT */
    );
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((t) => {
      if (t.nodeValue.includes("\xA0")) t.nodeValue = t.nodeValue.replace(NBSP_RUN, " ");
    });
  }
  function isEmpty(el) {
    return !el.textContent.replace(/[\s\u00a0]+/g, "") && !el.querySelector(MEDIA) && !el.matches(MEDIA);
  }
  function collectContent(node, out) {
    [...node.children].forEach((child) => {
      const tag = child.tagName.toLowerCase();
      if (tag === "div" || tag === "section" || tag === "article") {
        collectContent(child, out);
      } else if (tag !== "script" && tag !== "style" && tag !== "button") {
        out.push(child);
      }
    });
    return out;
  }
  function absolutizeLinks(root) {
    root.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href").trim();
      if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) return;
      try {
        const url = new URL(href, SITE_ORIGIN);
        if (/^\//.test(href) || /(^|\.)wknd\.site$/i.test(url.hostname) || /^(localhost|127\.0\.0\.1)$/.test(url.hostname)) {
          a.setAttribute("href", `${SITE_ORIGIN}${url.pathname}${url.search}${url.hash}`);
        }
      } catch (e) {
      }
    });
  }
  function parse(element, { document: document2 }) {
    const root = element.matches(".cmp-accordion") ? element : element.querySelector(".cmp-accordion") || element;
    let items = [...root.querySelectorAll(":scope > .cmp-accordion__item")];
    if (!items.length) items = [...root.querySelectorAll('.cmp-accordion__item, [data-cmp-hook-accordion="item"]')];
    const cells = [];
    items.forEach((item) => {
      const titleEl = item.querySelector(".cmp-accordion__title") || item.querySelector(".cmp-accordion__button, .cmp-accordion__header, h2, h3, h4");
      const question = titleEl ? titleEl.textContent.replace(/[\s\u00a0]+/g, " ").trim() : "";
      const panel = item.querySelector(":scope > .cmp-accordion__panel") || item.querySelector('.cmp-accordion__panel, [data-cmp-hook-accordion="panel"], [role="region"]');
      const answer = [];
      if (panel) {
        collectContent(panel, []).forEach((el) => {
          collapseNbsp(el, document2);
          el.querySelectorAll("h1, h2, h3, h4, h5, h6, p").forEach((inner) => {
            if (isEmpty(inner)) inner.remove();
          });
          if (isEmpty(el)) return;
          absolutizeLinks(el);
          answer.push(el);
        });
      }
      if (!question && !answer.length) return;
      cells.push([question, answer.length ? answer : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-wknd", cells });
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

  // tools/importer/import-wknd-site-faqs.js
  var parsers = {
    "accordion-wknd": parse
  };
  var PAGE_TEMPLATE = {
    "name": "wknd-site-faqs",
    "description": "WKND (wknd.site) FAQs: two-column section (main: title, photo, intro, FAQ accordion; sidebar: Need more help? contact)",
    "urls": [
      "https://wknd.site/us/en/faqs.html"
    ],
    "blocks": [
      {
        "name": "accordion-wknd",
        "instances": [
          "main .accordion.panelcontainer"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "faqs",
        "selector": [
          "main > .cmp-container > .aem-Grid > .container:first-child"
        ],
        "style": "wknd-sidebar, wknd-underline-title",
        "blocks": [
          "accordion-wknd"
        ],
        "defaultContent": [
          ".cmp-title__text",
          ".cmp-image",
          ".text p"
        ]
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
  var import_wknd_site_faqs_default = {
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
  return __toCommonJS(import_wknd_site_faqs_exports);
})();
