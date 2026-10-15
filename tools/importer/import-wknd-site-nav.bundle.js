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

  // tools/importer/import-wknd-site-nav.js
  var import_wknd_site_nav_exports = {};
  __export(import_wknd_site_nav_exports, {
    default: () => import_wknd_site_nav_default
  });
  var SOURCE_ORIGIN = "https://wknd.site";
  function toHref(href) {
    if (!href) return href;
    let url;
    try {
      url = new URL(href, SOURCE_ORIGIN);
    } catch (e) {
      return href;
    }
    if (url.origin === SOURCE_ORIGIN && /^\/us\/en(\/.*)?\.html$/.test(url.pathname)) {
      return `${url.pathname.replace(/\.html$/, "")}${url.search}${url.hash}`;
    }
    if (url.origin === SOURCE_ORIGIN && href.startsWith("#")) return href;
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
    ["title", "hreflang"].forEach((attr) => {
      if (a.getAttribute(attr)) anchor.setAttribute(attr, a.getAttribute(attr));
    });
    return anchor;
  }
  function buildUtility(document, header) {
    const section = el(document, "div");
    const signIn = header.querySelector(".wknd-sign-in-buttons__button--sign-in");
    if (signIn) section.append(el(document, "p", link(document, signIn)));
    const countries = header.querySelectorAll(".cmp-languagenavigation--header .cmp-languagenavigation__item--level-0");
    if (countries.length) {
      const ul = el(document, "ul");
      countries.forEach((country) => {
        const langs = el(document, "ul");
        country.querySelectorAll(".cmp-languagenavigation__item-link").forEach((a) => langs.append(el(document, "li", link(document, a))));
        ul.append(el(document, "li", el(document, "p", text(country.querySelector(".cmp-languagenavigation__item-title"))), langs));
      });
      section.append(ul);
    }
    return section;
  }
  function buildBrand(document, header) {
    const logo = header.querySelector(".cmp-layoutcontainer--header .cmp-image--logo");
    const section = el(document, "div");
    if (!logo) return section;
    const a = logo.querySelector("a");
    const src = logo.querySelector("img");
    const img = document.createElement("img");
    img.setAttribute("src", new URL(src.getAttribute("src"), SOURCE_ORIGIN).href);
    img.setAttribute("alt", src.getAttribute("alt") || "WKND");
    const anchor = a ? link(document, a, "") : el(document, "span");
    anchor.append(img);
    section.append(el(document, "p", anchor));
    return section;
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
  function buildSections(document, header) {
    const group = header.querySelector(".cmp-navigation--header .cmp-navigation > .cmp-navigation__group");
    return el(document, "div", group ? buildList(document, group) : null);
  }
  function buildTools(document, header) {
    const section = el(document, "div");
    header.querySelectorAll(".cmp-button--header-search a").forEach((a) => {
      section.append(el(document, "p", link(document, a, a.getAttribute("aria-label") || a.getAttribute("title") || "Search")));
    });
    return section;
  }
  var import_wknd_site_nav_default = {
    transform: (payload) => {
      const { document } = payload;
      const header = document.querySelector(".cmp-experiencefragment--header");
      const main = document.createElement("main");
      if (header) {
        [buildUtility, buildBrand, buildSections, buildTools].forEach((build, i) => {
          if (i > 0) main.append(document.createElement("hr"));
          main.append(...build(document, header).childNodes);
        });
      }
      document.body.replaceChildren(main);
      return [{
        element: main,
        path: "/us/en/nav",
        report: { title: "wknd.site nav", links: main.querySelectorAll("a").length }
      }];
    }
  };
  return __toCommonJS(import_wknd_site_nav_exports);
})();
