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

  // tools/importer/import-blog.js
  var import_blog_exports = {};
  __export(import_blog_exports, {
    default: () => import_blog_default
  });

  // tools/importer/parsers/hero-blog.js
  function parse(element, { document: document2 }) {
    const content = element.querySelector(".hero-content") || element;
    const bgImage = element.querySelector(".hero-bg img") || [...element.querySelectorAll("img")].find((img) => !img.closest(".article-byline, .avatar"));
    const tagEl = content.querySelector(".tag");
    const heading = content.querySelector("h1") || content.querySelector("h2");
    const byline = content.querySelector(".article-byline");
    const avatar = (byline || content).querySelector(".avatar img");
    const nameEl = (byline || content).querySelector(".article-byline-name");
    const metaEl = (byline || content).querySelector(".article-byline-meta");
    if (!heading && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const toParagraph = (el) => {
      if (!el) return null;
      if (el.tagName === "P") return el;
      const p = document2.createElement("p");
      p.textContent = el.textContent.replace(/\s+/g, " ").trim();
      return p.textContent ? p : null;
    };
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    const contentCell = [];
    const tagP = toParagraph(tagEl);
    if (tagP) contentCell.push(tagP);
    if (heading) contentCell.push(heading);
    if (avatar) contentCell.push(avatar);
    const nameP = toParagraph(nameEl);
    if (nameP) contentCell.push(nameP);
    const metaP = toParagraph(metaEl);
    if (metaP) contentCell.push(metaP);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-blog", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-aside.js
  function parse2(element, { document: document2 }) {
    const children = [...element.children];
    const quoteCol = element.querySelector(":scope > .span-2") || children.find((c) => c.querySelector(".pull-quote, blockquote"));
    const detailCol = children.find((c) => c !== quoteCol && c.querySelector("h1, h2, h3, h4, h5, h6, ul, ol")) || children.find((c) => c !== quoteCol);
    const leftCell = [];
    if (detailCol) {
      [...detailCol.children].forEach((el) => {
        if (el.textContent.trim() || el.querySelector("img")) leftCell.push(el);
      });
    }
    const rightCell = [];
    if (quoteCol) {
      const pull = quoteCol.querySelector(".pull-quote") || quoteCol.querySelector("blockquote") || quoteCol;
      const attributionEl = pull.querySelector(".pull-quote-attribution") || pull.querySelector("cite");
      let bodies = [...pull.querySelectorAll(".pull-quote-body")];
      if (!bodies.length) bodies = [...pull.querySelectorAll("p")].filter((p) => !p.contains(attributionEl));
      if (bodies.length) {
        const blockquote = document2.createElement("blockquote");
        bodies.forEach((b) => {
          const p = document2.createElement("p");
          p.innerHTML = b.innerHTML;
          blockquote.append(p);
        });
        rightCell.push(blockquote);
      }
      if (attributionEl) {
        const text = attributionEl.textContent.replace(/\s+/g, " ").trim();
        if (text) {
          const p = document2.createElement("p");
          p.textContent = /^[—–-]/.test(text) ? text : `\u2014 ${text}`;
          rightCell.push(p);
        }
      }
    }
    if (!leftCell.length && !rightCell.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[leftCell.length ? leftCell : "", rightCell.length ? rightCell : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-aside", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/gallery-adventure.js
  function parse3(element, { document: document2 }) {
    let gridImages = [...element.querySelectorAll(":scope > img")];
    if (!gridImages.length) gridImages = [...element.querySelectorAll("img")];
    const wideRows = [];
    const next = element.nextElementSibling;
    if (next && next.matches(".utility-margin-top-lg") && next.querySelector("img") && !next.textContent.trim()) {
      const wideImages = [...next.querySelectorAll("img")];
      wideRows.push(wideImages);
      next.remove();
    }
    if (!gridImages.length && !wideRows.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const rows = [];
    if (gridImages.length) rows.push(gridImages);
    rows.push(...wideRows);
    const width = Math.max(...rows.map((r) => r.length));
    const cells = rows.map((r) => {
      const row = [...r];
      while (row.length < width) row.push("");
      return row;
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "gallery-adventure", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function parse4(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".article-card-body")].map((body) => {
      var _a;
      let image = null;
      let sib = body.previousElementSibling;
      while (sib && !image) {
        image = sib.matches("img") ? sib : sib.querySelector("img");
        sib = sib.previousElementSibling;
      }
      return { body, image, href: (_a = body.closest("a")) == null ? void 0 : _a.getAttribute("href") };
    });
    if (!items.length) {
      items = [...element.querySelectorAll(":scope > a, :scope > .card, :scope > article")].map((card) => {
        var _a;
        return {
          body: card,
          image: card.querySelector("img"),
          href: card.getAttribute("href") || ((_a = card.querySelector("a")) == null ? void 0 : _a.getAttribute("href"))
        };
      });
    }
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const text = [];
      const tagEl = item.body.querySelector(".tag");
      if (tagEl && tagEl.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = tagEl.textContent.trim();
        text.push(p);
      }
      const headingSrc = item.body.querySelector("h3, h2, h4, h5, h6");
      if (headingSrc) {
        const h3 = document2.createElement("h3");
        const title = headingSrc.textContent.trim();
        if (item.href) {
          const a = document2.createElement("a");
          a.href = item.href;
          a.textContent = title;
          h3.append(a);
        } else {
          h3.textContent = title;
        }
        text.push(h3);
      }
      item.body.querySelectorAll("p").forEach((p) => {
        if (!p.closest(".article-card-meta") && p.textContent.trim()) text.push(p);
      });
      cells.push([item.image || "", text.length ? text : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-adventures-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  var ABSOLUTE_OR_SPECIAL = /^(?:[a-z][a-z0-9+.-]*:|\/|#)/i;
  function toEdsPath(url) {
    const pathname = url.pathname.replace(/\.html?$/, "").replace(/\/index$/, "/") || "/";
    return `${pathname}${url.search}${url.hash}`;
  }
  function resolveRelativeUrls(element, baseUrl) {
    if (!baseUrl) return;
    const { origin } = new URL(baseUrl);
    element.querySelectorAll("img[src]").forEach((img) => {
      const src = img.getAttribute("src");
      if (src && !ABSOLUTE_OR_SPECIAL.test(src)) img.setAttribute("src", new URL(src, baseUrl).href);
    });
    element.querySelectorAll("a[href]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || /^(?:mailto|tel):/i.test(href)) return;
      const resolved = new URL(href, baseUrl);
      if (resolved.origin !== origin) return;
      a.setAttribute("href", toEdsPath(resolved));
    });
  }
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      resolveRelativeUrls(element, payload.params && payload.params.originalURL || payload.url);
      element.querySelectorAll("#main-content figure").forEach((figure) => {
        const img = figure.querySelector("img");
        if (!img) return;
        const doc = figure.ownerDocument;
        const imgP = doc.createElement("p");
        imgP.append(img);
        const parts = [imgP];
        const caption = figure.querySelector("figcaption");
        const text = caption ? caption.textContent.replace(/\s+/g, " ").trim() : "";
        if (text) {
          const capP = doc.createElement("p");
          const em = doc.createElement("em");
          em.textContent = text;
          capP.append(em);
          parts.push(capP);
        }
        figure.replaceWith(...parts);
      });
      WebImporter.DOMUtils.remove(element, [
        "a.skip-link",
        "div.navbar",
        ".nav-megamenu",
        "footer.footer.inverse-footer",
        "script",
        "noscript"
      ]);
      element.querySelectorAll(".button-group a").forEach((a) => {
        const labels = [...a.querySelectorAll(":scope > .button-label")];
        if (labels.length < 2) return;
        let after = a;
        labels.slice(1).forEach((label) => {
          const extra = a.ownerDocument.createElement("a");
          extra.setAttribute("href", a.getAttribute("href"));
          extra.className = "button--ghost";
          extra.append(label);
          after.after(extra);
          after = extra;
        });
      });
      element.querySelectorAll(".button-group a.button, .button-group a.button--ghost, .button-group a.accent-button").forEach((a) => {
        const label = a.querySelector(".button-label");
        if (label) a.textContent = label.textContent.trim();
        const p = document.createElement("p");
        a.replaceWith(p);
        let inner = p;
        if (a.classList.contains("accent-button")) {
          const strong = document.createElement("strong");
          p.append(strong);
          inner = strong;
        }
        const wrap = document.createElement(a.classList.contains("button--ghost") ? "em" : inner === p ? "strong" : "em");
        inner.append(wrap);
        wrap.append(a);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "a.skip-link",
        "div.navbar",
        "footer.footer.inverse-footer",
        "script",
        "noscript",
        "link",
        "style",
        "iframe"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        ["onclick", "onload", "data-track", "data-analytics"].forEach((attr) => {
          if (el.hasAttribute(attr)) el.removeAttribute(attr);
        });
      });
    }
  }

  // tools/importer/transformers/wknd-adventures-sections.js
  var SECTION_STYLE_ATTR = "data-excat-section-style";
  var SECTION_CLASS_STYLES = [
    ["accent-section", "accent"],
    ["secondary-section", "secondary"],
    ["inverse-section", "dark"],
    // blog posts: the article body section (narrow reading column + article typography)
    ["blog-article-section", "narrow"],
    ["blog-article-section", "article"]
  ];
  var CONTAINER_CLASS_STYLES = [
    ["container--narrow", "narrow"],
    ["utility-text-align-center", "centered"]
  ];
  function sectionStyle(section) {
    const styles = SECTION_CLASS_STYLES.filter(([cls]) => section.classList.contains(cls)).map(([, style]) => style);
    const container = section.querySelector(":scope > .container");
    if (container) {
      CONTAINER_CLASS_STYLES.filter(([cls]) => container.classList.contains(cls)).forEach(([, style]) => styles.push(style));
      const heading = container.querySelector(":scope > .section-heading");
      const next = heading && heading.nextElementSibling;
      if (next && ["P", "UL", "OL", "H3", "H4"].includes(next.tagName)) styles.push("spaced-heading");
      const first = container.firstElementChild;
      if (first && first.matches("p.tag")) styles.push("eyebrow");
    }
    return styles.join(", ");
  }
  function transform2(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      const sections = [...element.querySelectorAll("#main-content > section, main > section, #main-content > .ticker-strip")].filter((s, i, all) => all.indexOf(s) === i);
      if (sections.length < 2) return;
      sections.forEach((section, i) => {
        const style = sectionStyle(section);
        if (i === 0 && !style) return;
        const hr = document.createElement("hr");
        if (style) hr.setAttribute(SECTION_STYLE_ATTR, style);
        if (i === 0) hr.setAttribute("data-excat-first-section", "");
        section.before(hr);
      });
    }
    if (hookName === "afterTransform") {
      element.querySelectorAll(`[${SECTION_STYLE_ATTR}]`).forEach((marker) => {
        const style = marker.getAttribute(SECTION_STYLE_ATTR);
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style }
        });
        marker.after(metadataBlock);
        marker.removeAttribute(SECTION_STYLE_ATTR);
        if (marker.hasAttribute("data-excat-first-section")) marker.remove();
      });
    }
  }

  // tools/importer/import-blog.js
  var parsers = {
    "hero-blog": parse,
    "columns-aside": parse2,
    "gallery-adventure": parse3,
    "cards-article": parse4
  };
  var PAGE_TEMPLATE = {
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
  var import_blog_default = {
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
  return __toCommonJS(import_blog_exports);
})();
