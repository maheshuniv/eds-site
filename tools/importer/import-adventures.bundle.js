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

  // tools/importer/import-adventures.js
  var import_adventures_exports = {};
  __export(import_adventures_exports, {
    default: () => import_adventures_default
  });

  // tools/importer/parsers/hero-adventure.js
  function parse(element, { document: document2 }) {
    const bgImage = element.querySelector(".hero-bg img, :scope > img, picture img");
    const content = element.querySelector(".hero-content-inner, .hero-content") || element;
    const tag = content.querySelector("p.tag, .tag");
    const heading = content.querySelector("h1, h2");
    const lead = content.querySelector('p.hero-lead, p[class*="paragraph-xl"]');
    const extras = [...content.querySelectorAll("p, a.button")].filter(
      (el) => el !== tag && el !== lead && !el.closest("p.tag") && !(el.tagName === "A" && el.closest("p"))
    );
    if (!heading && !lead && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) cells.push([bgImage]);
    const contentCell = [];
    if (tag) contentCell.push(tag);
    if (heading) contentCell.push(heading);
    if (lead) contentCell.push(lead);
    extras.forEach((el) => {
      if (!contentCell.includes(el)) contentCell.push(el);
    });
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-adventure", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-feature.js
  function parse2(element, { document: document2 }) {
    const imageWrap = element.querySelector(':scope > .featured-article-image, :scope > [class*="image"]');
    const image = (imageWrap || element).querySelector("picture, img");
    const textCol = [...element.querySelectorAll(":scope > div")].find((d) => d !== imageWrap) || element;
    const tag = textCol.querySelector("p.tag, .tag");
    const heading = textCol.querySelector("h2, h1, h3");
    const paragraphs = [...textCol.querySelectorAll("p")].filter((p) => p !== tag && !p.closest(".featured-article-footer"));
    const ctas = [...textCol.querySelectorAll(".featured-article-footer a, a.button")].filter((a, i, arr) => arr.indexOf(a) === i);
    if (!heading && !paragraphs.length && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const textCell = [];
    if (tag) textCell.push(tag);
    if (heading) textCell.push(heading);
    textCell.push(...paragraphs);
    ctas.forEach((a) => {
      const label = a.querySelector(".button-label");
      const link = document2.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = (label || a).textContent.trim();
      const strong = document2.createElement("strong");
      strong.append(link);
      const p = document2.createElement("p");
      p.append(strong);
      textCell.push(p);
    });
    const cells = [[image || "", textCell]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-feature", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-activity.js
  function getItems(pane) {
    let items = [...pane.querySelectorAll(".article-card-body")].map((body) => {
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
      items = [...pane.querySelectorAll("a.article-card, .card, article")].map((card) => {
        var _a;
        return {
          body: card,
          image: card.querySelector("img"),
          href: card.getAttribute("href") || ((_a = card.querySelector("a")) == null ? void 0 : _a.getAttribute("href"))
        };
      });
    }
    return items;
  }
  function buildItemContent(item, document2) {
    const out = [];
    if (item.image) out.push(item.image);
    const tagEl = item.body.querySelector(".tag");
    if (tagEl && tagEl.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = tagEl.textContent.trim();
      out.push(p);
    }
    const headingSrc = item.body.querySelector("h3, h2, h4, h5, h6");
    if (headingSrc) {
      const h3 = document2.createElement("h3");
      const text = headingSrc.textContent.trim();
      if (item.href) {
        const a = document2.createElement("a");
        a.href = item.href;
        a.textContent = text;
        h3.append(a);
      } else {
        h3.textContent = text;
      }
      out.push(h3);
    }
    item.body.querySelectorAll("p").forEach((p) => {
      if (!p.closest(".article-card-meta") && p.textContent.trim()) out.push(p);
    });
    return out;
  }
  function parse3(element, { document: document2 }) {
    const labels = [...element.querySelectorAll('.tab-menu button, .tab-menu .tab-menu-link:not(button), [role="tab"]')].filter((el, i, arr) => arr.indexOf(el) === i);
    const panes = [...element.querySelectorAll('.tab-pane, [role="tabpanel"]')].filter((el) => !el.parentElement.closest('.tab-pane, [role="tabpanel"]'));
    if (!panes.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    panes.forEach((pane, i) => {
      var _a;
      let label = (_a = labels[i]) == null ? void 0 : _a.textContent.trim();
      if (!label && pane.id) {
        label = pane.id.replace(/^tab-/, "").replace(/-/g, " ");
        label = label.charAt(0).toUpperCase() + label.slice(1);
      }
      const content = [];
      getItems(pane).forEach((item) => content.push(...buildItemContent(item, document2)));
      cells.push([label || `Tab ${i + 1}`, content.length ? content : ""]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-activity", cells });
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

  // tools/importer/parsers/cards-index.js
  function parse5(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .editorial-index-item")];
    if (!items.length) items = [...element.querySelectorAll(".editorial-index-item, :scope > div")];
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const content = [];
      const num = item.querySelector('.editorial-index-number, [class*="number"]');
      if (num && num.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = num.textContent.trim();
        content.push(p);
      }
      const heading = item.querySelector("h3, h2, h4");
      if (heading) content.push(heading);
      item.querySelectorAll("p").forEach((p) => {
        if (p !== num && p.textContent.trim()) content.push(p);
      });
      item.querySelectorAll("a").forEach((a) => {
        if (!a.closest("p, h1, h2, h3, h4, h5, h6")) {
          const p = document2.createElement("p");
          const link = document2.createElement("a");
          link.href = a.getAttribute("href");
          link.textContent = a.textContent.trim();
          p.append(link);
          content.push(p);
        }
      });
      if (content.length) cells.push([content]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-index", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-promo.js
  function parse6(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .card")];
    if (!items.length) items = [...element.querySelectorAll(":scope > div, :scope > article")];
    if (!items.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const content = [];
      const tag = item.querySelector("p.tag, .tag");
      if (tag && tag.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = tag.textContent.trim();
        content.push(p);
      }
      const heading = item.querySelector("h3, h2, h4");
      if (heading) content.push(heading);
      item.querySelectorAll("p").forEach((p) => {
        if (p !== tag && p.textContent.trim()) content.push(p);
      });
      item.querySelectorAll("a").forEach((a) => {
        if (a.closest("p, h1, h2, h3, h4, h5, h6")) return;
        const label = a.querySelector(".button-label");
        const p = document2.createElement("p");
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = (label || a).textContent.trim();
        const em = document2.createElement("em");
        em.append(link);
        p.append(em);
        content.push(p);
      });
      if (content.length) cells.push([content]);
    });
    const compact = items.some((item) => item.querySelector(".h4-heading"));
    const name = compact ? "cards-promo (compact)" : "cards-promo";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse7(element, { document: document2 }) {
    let items = [...element.querySelectorAll(":scope > .faq-item")];
    if (!items.length) items = [...element.querySelectorAll(":scope > div, :scope > details")];
    const cells = [];
    items.forEach((item) => {
      const question = item.querySelector(".faq-question, summary, button, h3, h4");
      const answer = item.querySelector(".faq-answer") || [...item.children].find((c) => c !== question);
      const title = question ? question.textContent.replace(/\s+/g, " ").trim() : "";
      if (!title) return;
      const content = [];
      if (answer) {
        const hasBlockChildren = [...answer.children].some((c) => /^(P|UL|OL|DIV|H\d)$/.test(c.tagName));
        if (hasBlockChildren) {
          content.push(...answer.childNodes);
        } else if (answer.textContent.trim()) {
          const p = document2.createElement("p");
          p.append(...answer.childNodes);
          content.push(p);
        }
      }
      cells.push([title, content]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/ticker.js
  function parse8(element, { document: document2 }) {
    const track = element.querySelector(".ticker-track") || element;
    const seps = [...track.querySelectorAll(".ticker-sep")].map((s) => s.textContent.trim()).filter(Boolean);
    const sep = seps[0] || "\xB7";
    const words = track.textContent.split(sep).map((w) => w.replace(/\s+/g, " ").trim()).filter(Boolean);
    let unique = words;
    for (let len = 1; len <= words.length / 2; len += 1) {
      if (words.length % len === 0 && words.every((w, i) => w === words[i % len])) {
        unique = words.slice(0, len);
        break;
      }
    }
    if (!unique.length) {
      element.remove();
      return;
    }
    const p = document2.createElement("p");
    p.textContent = unique.join(" \xB7 ");
    const block = WebImporter.Blocks.createBlock(document2, { name: "ticker", cells: [[p]] });
    element.replaceWith(block);
  }

  // tools/importer/parsers/gallery-adventure.js
  function parse9(element, { document: document2 }) {
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

  // tools/importer/parsers/columns-story.js
  function parse10(element, { document: document2 }) {
    const children = [...element.children];
    let image = element.querySelector(":scope > img.gallery-img--wide, :scope > img");
    if (!image) {
      const imgWrap = children.find((c) => c.querySelector("img") && !c.textContent.trim());
      image = imgWrap ? imgWrap.querySelector("img") : element.querySelector("img.gallery-img--wide");
    }
    const textCol = children.find((c) => c !== image && c.textContent.trim()) || element;
    const textCell = [];
    const heading = textCol.querySelector(".section-heading h2, .section-heading h3, h2, h3");
    if (heading) textCell.push(heading);
    [...textCol.querySelectorAll("p")].forEach((p) => {
      if (p.textContent.trim() && !(heading && heading.contains(p))) textCell.push(p);
    });
    [...textCol.querySelectorAll("a")].forEach((a) => {
      if (!textCell.some((n) => n.contains(a))) textCell.push(a);
    });
    if (!textCell.length && !image) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[textCell.length ? textCell : "", image || ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-story", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-team.js
  function collectPanes(element) {
    let panes = [...element.querySelectorAll('.tab-pane, [role="tabpanel"]')];
    if (panes.length) return panes;
    panes = [];
    let sib = element.nextElementSibling;
    while (sib && sib.matches('.tab-pane, [role="tabpanel"]')) {
      panes.push(sib);
      sib = sib.nextElementSibling;
    }
    return panes;
  }
  function labelFromPane(pane) {
    if (!pane.id) return "";
    const text = pane.id.replace(/^tab-/, "").replace(/-/g, " ").trim();
    return text ? text.charAt(0).toUpperCase() + text.slice(1) : "";
  }
  function buildProfile(pane, document2) {
    const content = [];
    const photo = pane.querySelector(".profile-circle img, .team-profile-col img, img");
    if (photo) content.push(photo);
    const nameEl = pane.querySelector(".profile-name, .team-profile-col h3, .team-profile-col h4, .team-profile-col h5");
    if (nameEl) {
      const name = document2.createElement("p");
      name.textContent = nameEl.textContent.trim();
      content.push(name);
      let roleEl = nameEl.nextElementSibling;
      while (roleEl) {
        if (roleEl.textContent.trim() && !roleEl.querySelector("img")) {
          const role = document2.createElement("p");
          role.textContent = roleEl.textContent.trim();
          content.push(role);
        }
        roleEl = roleEl.nextElementSibling;
      }
    }
    let bio = pane.querySelector(".team-profile-bio");
    let bioParas = bio ? [...bio.querySelectorAll("p, h3, h4, ul, ol")] : [];
    if (!bioParas.length) {
      bioParas = [...pane.querySelectorAll("p")].filter((p) => !p.closest(".team-profile-col") && p !== nameEl);
    }
    bioParas.forEach((p) => {
      if (p.textContent.trim() && !content.some((n) => n.contains(p))) content.push(p);
    });
    return content;
  }
  function parse11(element, { document: document2 }) {
    const labels = [...element.querySelectorAll('button, .tab-menu-link, [role="tab"]')].filter((el, i, arr) => !arr.some((o) => o !== el && o.contains(el)));
    const panes = collectPanes(element);
    if (!panes.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    panes.forEach((pane, i) => {
      var _a;
      const label = ((_a = labels[i]) == null ? void 0 : _a.textContent.trim()) || labelFromPane(pane) || `Tab ${i + 1}`;
      const profile = buildProfile(pane, document2);
      cells.push([label, profile.length ? profile : ""]);
    });
    panes.forEach((pane) => {
      if (!element.contains(pane)) pane.remove();
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-team", cells });
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
    ["inverse-section", "dark"]
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

  // tools/importer/import-adventures.js
  var parsers = {
    "hero-adventure": parse,
    "columns-feature": parse2,
    "tabs-activity": parse3,
    "cards-article": parse4,
    "cards-index": parse5,
    "cards-promo": parse6,
    "accordion-faq": parse7,
    "ticker": parse8,
    "gallery-adventure": parse9,
    "columns-story": parse10,
    "tabs-team": parse11
  };
  var PAGE_TEMPLATE = {
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
          "main section.section > .container > .grid-layout.desktop-3-column:has(.article-card)"
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
          ".grid-layout--2col",
          "main section.section > .container > .grid-layout.desktop-3-column:has(> .card)"
        ]
      },
      {
        "name": "accordion-faq",
        "instances": [
          ".faq-list"
        ]
      },
      {
        "name": "ticker",
        "instances": [
          ".ticker-strip"
        ]
      },
      {
        "name": "gallery-adventure",
        "instances": [
          ".grid-layout.grid-images"
        ]
      },
      {
        "name": "columns-story",
        "instances": [
          ".grid-layout.tablet-1-column"
        ]
      },
      {
        "name": "tabs-team",
        "instances": [
          "#main-content > section > .container > .tab-menu"
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
  var import_adventures_default = {
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
  return __toCommonJS(import_adventures_exports);
})();
