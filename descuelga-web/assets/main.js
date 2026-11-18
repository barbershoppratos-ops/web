/* Language switch (es / ca / fr). Spanish is written in the HTML; Catalan and French
   come from window.I18N (assets/i18n.js). Legal pages hold one <article data-lang> per
   language and CSS shows the one matching <html lang>. The choice is remembered in
   localStorage (a preference only; the site works without it). */
(function () {
  "use strict";
  var LANGS = ["es", "ca", "fr"];
  var DICT = window.I18N || {};
  var originals = new Map();
  var attrOriginals = new Map();

  function stored() {
    try { return localStorage.getItem("lang"); } catch (e) { return null; }
  }
  function remember(lang) {
    try { localStorage.setItem("lang", lang); } catch (e) { /* private mode: fine */ }
  }
  function detect() {
    var q = new URLSearchParams(location.search).get("lang");
    if (LANGS.indexOf(q) >= 0) return q;
    var s = stored();
    if (LANGS.indexOf(s) >= 0) return s;
    var n = (navigator.language || "es").slice(0, 2).toLowerCase();
    return LANGS.indexOf(n) >= 0 ? n : "es";
  }

  function apply(lang) {
    var table = DICT[lang] || {};
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      if (!originals.has(el)) originals.set(el, el.innerHTML);
      var key = el.getAttribute("data-i18n");
      el.innerHTML = lang !== "es" && table[key] != null ? table[key] : originals.get(el);
    });

    // attributes: data-i18n-attr="content:meta.desc;aria-label:nav.label"
    document.querySelectorAll("[data-i18n-attr]").forEach(function (el) {
      if (!attrOriginals.has(el)) attrOriginals.set(el, {});
      var saved = attrOriginals.get(el);
      el.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var parts = pair.split(":");
        var attr = parts[0], key = parts[1];
        if (!(attr in saved)) saved[attr] = el.getAttribute(attr) || "";
        el.setAttribute(attr, lang !== "es" && table[key] != null ? table[key] : saved[attr]);
      });
    });

    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-lang") === lang));
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    apply(detect());
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.addEventListener("click", function () {
        var lang = b.getAttribute("data-lang");
        remember(lang);
        apply(lang);
      });
    });
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = String(new Date().getFullYear());
    });
  });
})();
