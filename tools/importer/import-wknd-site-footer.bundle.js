/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
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

  // tools/importer/import-wknd-site-footer.js
  var import_wknd_site_footer_exports = {};
  __export(import_wknd_site_footer_exports, {
    default: () => import_wknd_site_footer_default
  });
  var SOURCE_ORIGIN = "https://wknd.site";
  function toHref(href) {
    if (!href) return href;
    if (href.startsWith("#")) return href;
    let url;
    try {
      url = new URL(href, SOURCE_ORIGIN);
    } catch (e) {
      return href;
    }
    if (url.origin === SOURCE_ORIGIN && /^\/us\/en(\/.*)?\.html$/.test(url.pathname)) {
      return `${url.pathname.replace(/\.html$/, "")}${url.search}${url.hash}`;
    }
    return url.href;
  }
  function text(el2) {
    return el2 ? el2.textContent.replace(/\s+/g, " ").trim() : "";
  }
  function el(document, tag, ...children) {
    const node = document.createElement(tag);
    children.filter(Boolean).forEach((c) => node.append(typeof c === "string" ? document.createTextNode(c) : c));
    return node;
  }
  function link(document, a, label) {
    const anchor = el(document, "a", label === void 0 ? text(a) : label);
    anchor.setAttribute("href", toHref(a.getAttribute("href")));
    return anchor;
  }
  function buildList(document, group) {
    const ul = el(document, "ul");
    group.querySelectorAll(":scope > .cmp-navigation__item").forEach((item) => {
      const li = el(document, "li", link(document, item.querySelector(":scope > a")));
      const sub = item.querySelector(":scope > .cmp-navigation__group");
      if (sub) li.append(buildList(document, sub));
      ul.append(li);
    });
    return ul;
  }
  function buildBrand(document, footer) {
    const section = el(document, "div");
    const logo = footer.querySelector(".cmp-image--logo");
    if (logo) {
      const src = logo.querySelector("img");
      const img = document.createElement("img");
      img.setAttribute("src", new URL(src.getAttribute("src"), SOURCE_ORIGIN).href);
      img.setAttribute("alt", src.getAttribute("alt") || "WKND");
      const a = logo.querySelector("a");
      const anchor = a ? link(document, a, "") : el(document, "span");
      anchor.append(img);
      section.append(el(document, "p", anchor));
    }
    const group = footer.querySelector(".cmp-navigation--footer .cmp-navigation > .cmp-navigation__group");
    if (group) section.append(buildList(document, group));
    return section;
  }
  function buildSocial(document, footer) {
    const section = el(document, "div");
    const title = footer.querySelector(".cmp-title__text");
    if (title) section.append(el(document, "h4", text(title)));
    const ul = el(document, "ul");
    footer.querySelectorAll(".cmp-buildingblock--btn-list a.cmp-button").forEach((a) => {
      ul.append(el(document, "li", link(document, a, text(a.querySelector(".cmp-button__text")) || a.getAttribute("aria-label"))));
    });
    if (ul.children.length) section.append(ul);
    return section;
  }
  function buildLegal(document, footer) {
    const section = el(document, "div");
    footer.querySelectorAll(".cmp-text p").forEach((p) => {
      const out = el(document, "p");
      p.childNodes.forEach((node) => {
        if (node.nodeType === 1 && node.tagName === "A") out.append(link(document, node));
        else out.append(document.createTextNode(node.textContent.replace(/[ \t\r\n]+/g, " ")));
      });
      out.normalize();
      if (out.firstChild && out.firstChild.nodeType === 3) out.firstChild.textContent = out.firstChild.textContent.replace(/^[ \t\r\n]+/, "");
      if (out.lastChild && out.lastChild.nodeType === 3) out.lastChild.textContent = out.lastChild.textContent.replace(/[ \t\r\n]+$/, "");
      section.append(out);
    });
    return section;
  }
  var import_wknd_site_footer_default = {
    transform: (payload) => {
      const { document } = payload;
      const footer = document.querySelector(".cmp-experiencefragment--footer");
      const main = document.createElement("main");
      if (footer) {
        [buildBrand, buildSocial, buildLegal].forEach((build, i) => {
          if (i > 0) main.append(document.createElement("hr"));
          main.append(...build(document, footer).childNodes);
        });
      }
      document.body.replaceChildren(main);
      return [{
        element: main,
        path: "/us/en/footer",
        report: { title: "wknd.site footer", links: main.querySelectorAll("a").length }
      }];
    }
  };
  return __toCommonJS(import_wknd_site_footer_exports);
})();
