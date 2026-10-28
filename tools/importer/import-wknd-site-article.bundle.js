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

  // tools/importer/import-wknd-site-article.js
  var import_wknd_site_article_exports = {};
  __export(import_wknd_site_article_exports, {
    default: () => import_wknd_site_article_default
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
      const text2 = clean(nameEl.textContent) || clean(item.textContent);
      if (!text2) return;
      const li = document2.createElement("li");
      if (link && !isLast && !item.classList.contains("cmp-breadcrumb__item--active")) {
        const a = document2.createElement("a");
        a.href = absoluteHref(link.getAttribute("href"));
        a.textContent = text2;
        li.append(a);
      } else {
        li.textContent = text2;
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

  // tools/importer/parsers/quote-wknd.js
  function stripUnderline(el) {
    el.querySelectorAll("u").forEach((u) => u.replaceWith(...u.childNodes));
    return el;
  }
  function normaliseBold(el, document2) {
    el.querySelectorAll("b b, b strong, strong b, strong strong").forEach((inner) => inner.replaceWith(...inner.childNodes));
    el.querySelectorAll("b, strong").forEach((bold) => {
      if (!bold.querySelector("br")) return;
      const frag = document2.createDocumentFragment();
      let run = document2.createElement(bold.tagName.toLowerCase());
      const flush = () => {
        const text2 = run.textContent.replace(/ /g, " ");
        if (text2.trim()) {
          if (run.firstChild && run.firstChild.nodeType === 3) {
            run.firstChild.textContent = run.firstChild.textContent.replace(/^[\s ]+/, "");
          }
          if (run.lastChild && run.lastChild.nodeType === 3) {
            run.lastChild.textContent = run.lastChild.textContent.replace(/[\s ]+$/, "");
          }
          frag.append(run);
        }
        run = document2.createElement(bold.tagName.toLowerCase());
      };
      [...bold.childNodes].forEach((n) => {
        if (n.nodeName === "BR") {
          flush();
          frag.append(document2.createElement("br"));
        } else {
          run.append(n);
        }
      });
      flush();
      bold.replaceWith(frag);
    });
    return el;
  }
  function toParagraphs(node, document2) {
    const clone = normaliseBold(stripUnderline(node.cloneNode(true)), document2);
    const blockKids = [...clone.children].filter((c) => /^(P|DIV)$/.test(c.tagName));
    const sources = blockKids.length ? blockKids : [clone];
    return sources.map((src) => {
      const p = document2.createElement("p");
      p.innerHTML = src.innerHTML.trim();
      return p;
    }).filter((p) => p.textContent.replace(/ /g, " ").trim());
  }
  function parse2(element, { document: document2 }) {
    const body = element.querySelector(".cmp-text") || element;
    const quoteEl = body.querySelector(":scope > blockquote") || body.querySelector("blockquote");
    const quotation = [];
    const attribution = [];
    if (quoteEl) {
      quotation.push(...toParagraphs(quoteEl, document2));
      [...body.children].filter((c) => c !== quoteEl && !c.contains(quoteEl) && quoteEl.compareDocumentPosition(c) & Node.DOCUMENT_POSITION_FOLLOWING).forEach((c) => attribution.push(...toParagraphs(c, document2)));
    } else {
      const paras = [...body.querySelectorAll(":scope > p")];
      if (paras[0]) quotation.push(...toParagraphs(paras[0], document2));
      paras.slice(1).forEach((p) => attribution.push(...toParagraphs(p, document2)));
    }
    if (!quotation.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[quotation]];
    if (attribution.length) cells.push([attribution]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "quote-wknd", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-wknd-author.js
  var SITE_ORIGIN2 = "https://wknd.site";
  function absoluteUrl(src) {
    const raw = (src || "").trim();
    if (!raw || /^data:/i.test(raw)) return "";
    try {
      const url = new URL(raw, SITE_ORIGIN2);
      if (/^\//.test(raw) || /(^|\.)wknd\.site$/i.test(url.hostname) || /^(localhost|127\.0\.0\.1)$/.test(url.hostname)) {
        return `${SITE_ORIGIN2}${url.pathname}${url.search}${url.hash}`;
      }
      return url.href;
    } catch (e) {
      return raw;
    }
  }
  var clean2 = (t) => (t || "").replace(/[\s ]+/g, " ").trim();
  function parse3(element, { document: document2 }) {
    const byline = element.querySelector(".cmp-byline") || element;
    let photo = null;
    const srcImg = byline.querySelector(".cmp-byline__image img, img.cmp-image__image, img");
    let src = srcImg ? srcImg.getAttribute("src") : "";
    if (!src || /^data:/i.test(src)) {
      const lazy = byline.querySelector("[data-cmp-src]");
      if (lazy) src = lazy.getAttribute("data-cmp-src").replace("{.width}", "");
    }
    if (src) {
      photo = document2.createElement("img");
      photo.src = absoluteUrl(src);
      photo.alt = srcImg && srcImg.getAttribute("alt") || "";
    }
    const nameSrc = byline.querySelector(".cmp-byline__name, h1, h2, h3, h4");
    const name = nameSrc ? clean2(nameSrc.textContent) : "";
    const rolesSrc = byline.querySelector(".cmp-byline__occupations") || [...byline.querySelectorAll("p")].find((p) => clean2(p.textContent));
    const roles = rolesSrc ? clean2(rolesSrc.textContent) : "";
    let socialSrc = [...element.querySelectorAll(".cmp-buildingblock--btn-list a.cmp-button")];
    if (!socialSrc.length) socialSrc = [...element.querySelectorAll("a.cmp-button, .button a[href]")];
    const socialP = document2.createElement("p");
    socialSrc.forEach((a) => {
      var _a;
      const label = clean2((_a = a.querySelector(".cmp-button__text")) == null ? void 0 : _a.textContent) || clean2(a.getAttribute("aria-label")) || clean2(a.textContent);
      if (!label) return;
      const link = document2.createElement("a");
      link.href = a.getAttribute("href") || "#";
      link.textContent = label;
      if (socialP.childNodes.length) socialP.append(document2.createTextNode(" | "));
      socialP.append(link);
    });
    if (!name && !photo) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const text2 = [];
    if (name) {
      const h = document2.createElement("h2");
      h.textContent = name;
      text2.push(h);
    }
    if (roles) {
      const p = document2.createElement("p");
      p.textContent = roles;
      text2.push(p);
    }
    if (socialP.childNodes.length) text2.push(socialP);
    const cells = [[photo || "", text2]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-wknd-author", cells });
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

  // tools/importer/transformers/wknd-site-article.js
  var TransformHook2 = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var SOURCE_ORIGIN2 = "https://wknd.site";
  var HIDDEN_SELECTORS = [
    "h3.cmp-contentfragment__title",
    ".separator.cmp-separator--hidden"
  ];
  function absolute(href) {
    if (!href) return href;
    try {
      const url = new URL(href, SOURCE_ORIGIN2);
      if (url.origin === SOURCE_ORIGIN2 || /^(?:localhost|127\.0\.0\.1)$/.test(url.hostname)) {
        return `${SOURCE_ORIGIN2}${url.pathname}${url.search}${url.hash}`;
      }
      return url.href;
    } catch (e) {
      return href;
    }
  }
  function pdfUrl(href) {
    return absolute(href).replace(/(\.pdf)\.coredownload\.pdf(?=$|[?#])/i, "$1");
  }
  function text(el) {
    return el ? el.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function isHidden(el) {
    if (el.hasAttribute("hidden") || el.getAttribute("aria-hidden") === "true") return true;
    if (/display\s*:\s*none/i.test(el.getAttribute("style") || "")) return true;
    try {
      const view = el.ownerDocument && el.ownerDocument.defaultView;
      if (view && view.getComputedStyle && el.isConnected) {
        const cs = view.getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden") return true;
      }
    } catch (e) {
    }
    return false;
  }
  function removeHidden(element) {
    WebImporter.DOMUtils.remove(element, HIDDEN_SELECTORS);
    element.querySelectorAll(".download").forEach((d) => {
      if (!d.querySelector(".cmp-download, a[href], h1, h2, h3, h4, h5, h6, p") && !text(d)) d.remove();
    });
  }
  function convertCaptions(element, doc) {
    element.querySelectorAll(".cmp-image > .cmp-image__title").forEach((span) => {
      const caption = text(span);
      const hidden = isHidden(span);
      const image = span.closest(".image") || span.parentElement;
      span.remove();
      if (!caption || hidden || !image) return;
      const p = doc.createElement("p");
      const em = doc.createElement("em");
      em.textContent = caption;
      p.append(em);
      image.after(p);
    });
  }
  function rewriteUpNext(element, doc) {
    element.querySelectorAll(".list.cmp-list--upnext ul.cmp-list > li").forEach((li) => {
      const link = li.querySelector("a.cmp-list__item-link") || li.querySelector("a[href]");
      if (!link) return;
      const title = text(link.querySelector(".cmp-list__item-title")) || text(link);
      const date = text(link.querySelector(".cmp-list__item-date"));
      const a = doc.createElement("a");
      a.setAttribute("href", absolute(link.getAttribute("href")));
      a.textContent = title;
      li.replaceChildren(a);
      if (date) li.append(doc.createElement("br"), doc.createTextNode(date));
    });
  }
  function rewriteDownload(element, doc) {
    element.querySelectorAll(".download .cmp-download").forEach((dl) => {
      const action = dl.querySelector("a.cmp-download__action");
      const titleLink = dl.querySelector(".cmp-download__title-link");
      const href = action && action.getAttribute("href") || titleLink && titleLink.getAttribute("href");
      if (!href) return;
      const url = pdfUrl(href);
      const out = [];
      const titleEl = dl.querySelector(".cmp-download__title");
      if (text(titleEl)) {
        const h3 = doc.createElement("h3");
        const a2 = doc.createElement("a");
        a2.setAttribute("href", url);
        a2.textContent = text(titleEl);
        h3.append(a2);
        out.push(h3);
      }
      const desc = dl.querySelector(".cmp-download__description");
      if (desc) {
        const ps = desc.querySelectorAll("p");
        (ps.length ? [...ps] : [desc]).forEach((src) => {
          if (!text(src)) return;
          const p2 = doc.createElement("p");
          p2.textContent = text(src);
          out.push(p2);
        });
      }
      const props = [...dl.querySelectorAll(".cmp-download__property-content")].map(text).filter(Boolean);
      if (props.length) {
        const p2 = doc.createElement("p");
        props.forEach((v, i) => {
          if (i) p2.append(doc.createElement("br"));
          p2.append(doc.createTextNode(v));
        });
        out.push(p2);
      }
      const label = text(action && (action.querySelector(".cmp-download__action-text") || action)) || "Download";
      const p = doc.createElement("p");
      const strong = doc.createElement("strong");
      const a = doc.createElement("a");
      a.setAttribute("href", url);
      a.textContent = label;
      strong.append(a);
      p.append(strong);
      out.push(p);
      dl.replaceWith(...out);
    });
  }
  function transform3(hookName, element, payload) {
    const doc = element.ownerDocument || document;
    if (hookName === TransformHook2.beforeTransform) {
      convertCaptions(element, doc);
      removeHidden(element);
      rewriteUpNext(element, doc);
      rewriteDownload(element, doc);
    }
    if (hookName === TransformHook2.afterTransform) {
      removeHidden(element);
      convertCaptions(element, doc);
    }
  }

  // tools/importer/import-wknd-site-article.js
  var parsers = {
    "breadcrumb-wknd": parse,
    "quote-wknd": parse2,
    "columns-wknd-author": parse3
  };
  var PAGE_TEMPLATE = {
    "name": "wknd-site-article",
    "description": "WKND (wknd.site) magazine article (all /us/en/magazine/*.html): container-width hero photo + breadcrumb, then article (title, byline, body, pull quotes, author bio) with right sidebar (download teaser, up-next list)",
    "urls": [
      "https://wknd.site/us/en/magazine/arctic-surfing.html",
      "https://wknd.site/us/en/magazine/guide-la-skateparks.html",
      "https://wknd.site/us/en/magazine/san-diego-surf.html",
      "https://wknd.site/us/en/magazine/ski-touring.html",
      "https://wknd.site/us/en/magazine/western-australia.html"
    ],
    "blocks": [
      {
        "name": "breadcrumb-wknd",
        "instances": [
          "main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > .breadcrumb"
        ]
      },
      {
        "name": "quote-wknd",
        "instances": [
          "main.cmp-layout-container--fixed main article.cmp-contentfragment .text.cmp-text--quote"
        ]
      },
      {
        "name": "columns-wknd-author",
        "instances": [
          "main.cmp-layout-container--fixed main > .cmp-container > .experiencefragment"
        ]
      }
    ],
    "sections": [
      {
        "id": "1",
        "name": "hero",
        "selector": [
          "main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > .image"
        ],
        "style": null,
        "blocks": [
          "breadcrumb-wknd"
        ],
        "defaultContent": [
          ".cmp-image"
        ]
      },
      {
        "id": "2",
        "name": "article",
        "selector": [
          "main.cmp-layout-container--fixed > .cmp-container > .aem-Grid > main.container"
        ],
        "style": "wknd-article",
        "blocks": [
          "quote-wknd",
          "columns-wknd-author"
        ],
        "defaultContent": [
          ".title",
          ".cmp-contentfragment__elements",
          "aside.cmp-layoutcontainer--sidebar .download",
          ".list.cmp-list--upnext"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    transform3,
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
  var import_wknd_site_article_default = {
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
        ["template", "wknd-site"].forEach((text2) => {
          const cell = document2.createElement("td");
          cell.textContent = text2;
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
  return __toCommonJS(import_wknd_site_article_exports);
})();
