(function () {
  "use strict";
  var root = document.documentElement;
  var savedTheme;
  try {
    savedTheme = localStorage.getItem("theme");
  } catch (_) {
    /* Storage is optional. */
  }
  root.dataset.theme = savedTheme === "dark" ? "dark" : "light";

  function initializeSite() {
    var toggle = document.querySelector(".theme-toggle");
    function setTheme(theme) {
      root.dataset.theme = theme;
      if (toggle) {
        toggle.setAttribute(
          "aria-pressed",
          theme === "light" ? "true" : "false",
        );
        toggle.setAttribute(
          "aria-label",
          "Switch to " + (theme === "dark" ? "light" : "dark") + " mode",
        );
      }
      try {
        localStorage.setItem("theme", theme);
      } catch (_) {
        /* Theme still works without storage. */
      }
    }
    if (toggle) {
      toggle.hidden = false;
      toggle.addEventListener("click", function () {
        setTheme(root.dataset.theme === "dark" ? "light" : "dark");
      });
      setTheme(root.dataset.theme);
    }

    var figure = document.querySelector(".system-figure");
    var caption = document.getElementById("stage-caption");
    var captions = {
      align: "Align people and priorities around a shared direction.",
      build: "Connect strategy to platforms, tools, and working systems.",
      deliver: "Turn launch readiness and adoption into lasting progress.",
    };
    if (figure && caption) {
      var controls = figure.querySelector(".stage-controls");
      var buttons = Array.from(controls.querySelectorAll("button"));
      controls.hidden = false;
      buttons.forEach(function (button) {
        button.addEventListener("click", function () {
          var stage = button.dataset.stage;
          if (!Object.prototype.hasOwnProperty.call(captions, stage)) return;
          figure.dataset.stage = stage;
          caption.textContent = captions[stage];
          buttons.forEach(function (other) {
            other.setAttribute("aria-pressed", String(other === button));
          });
        });
      });
    }

    var isHome = document.body.classList.contains("home-page");
    document.querySelectorAll(".site-header nav a").forEach(function (link) {
      var url = new URL(link.href);
      if (isHome && url.hash) link.setAttribute("href", url.hash);
    });
    if (!isHome) return;
    var navLinks = Array.from(
      document.querySelectorAll('.site-header nav a[href^="#"]'),
    );
    var entries = navLinks
      .map(function (link) {
        return {
          link: link,
          section: document.getElementById(link.hash.slice(1)),
        };
      })
      .filter(function (entry) {
        return entry.section;
      });
    var scheduled = false;
    function updateNavigation() {
      scheduled = false;
      var current;
      entries.forEach(function (entry) {
        if (entry.section.getBoundingClientRect().top <= 180) current = entry;
      });
      entries.forEach(function (entry) {
        if (entry === current)
          entry.link.setAttribute("aria-current", "location");
        else entry.link.removeAttribute("aria-current");
      });
    }
    function scheduleNavigation() {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(updateNavigation);
      }
    }
    window.addEventListener("scroll", scheduleNavigation, { passive: true });
    window.addEventListener("resize", scheduleNavigation);
    updateNavigation();
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", initializeSite);
  else initializeSite();
})();
