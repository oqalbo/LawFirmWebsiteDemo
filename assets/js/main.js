/* Header state, scroll reveals and the mobile drawer. Content works without it. */
(function () {
  "use strict";

  var doc = document.documentElement;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------------------------------------------------------------- header */

  var header = document.querySelector("[data-site-header]");
  var ticking = false;

  function updateHeader() {
    if (!header) return;
    header.classList.toggle("is-stuck", window.scrollY > 6);
    ticking = false;
  }

  if (header) {
    window.addEventListener(
      "scroll",
      function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(updateHeader);
      },
      { passive: true }
    );
    updateHeader();
  }

  /* ---------------------------------------------------------------- reveals */

  var revealItems = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));

  function revealAll() {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  if (!revealItems.length) {
    /* nothing to observe */
  } else if (reduced.matches || !("IntersectionObserver" in window)) {
    revealAll();
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  }

  /* ---------------------------------------------------------------- drawer */

  var toggle = document.querySelector("[data-menu-toggle]");
  var drawer = document.querySelector("[data-drawer]");
  if (!toggle || !drawer) return;

  var closeBtn = drawer.querySelector("[data-menu-close]");
  var scrim = drawer.querySelector("[data-drawer-scrim]");
  var lastFocus = null;
  var closeTimer = 0;
  var label = toggle.querySelector(".visually-hidden");

  function focusable() {
    return Array.prototype.slice
      .call(drawer.querySelectorAll("a[href], button:not([disabled])"))
      .filter(function (element) {
        return element.offsetParent !== null;
      });
  }

  function onKeydown(event) {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    var items = focusable();
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function open() {
    window.clearTimeout(closeTimer);
    lastFocus = document.activeElement;
    drawer.hidden = false;
    drawer.classList.remove("is-open");
    doc.classList.add("nav-open");
    toggle.setAttribute("aria-expanded", "true");
    if (label) label.textContent = "بستن منو";
    document.addEventListener("keydown", onKeydown);
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        drawer.classList.add("is-open");
      });
    });
    var items = focusable();
    if (items.length) items[0].focus();
  }

  function close() {
    if (drawer.hidden) return;
    drawer.classList.remove("is-open");
    doc.classList.remove("nav-open");
    toggle.setAttribute("aria-expanded", "false");
    if (label) label.textContent = "باز کردن منو";
    document.removeEventListener("keydown", onKeydown);
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    closeTimer = window.setTimeout(function () {
      if (!drawer.classList.contains("is-open")) drawer.hidden = true;
    }, reduced.matches ? 0 : 420);
  }

  toggle.addEventListener("click", function () {
    if (drawer.hidden) open();
    else close();
  });
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (scrim) scrim.addEventListener("click", close);

  drawer.querySelectorAll("a[href]").forEach(function (link) {
    link.addEventListener("click", function () {
      if (link.getAttribute("href").charAt(0) === "#") close();
    });
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 840 && !drawer.hidden) close();
  });
})();
