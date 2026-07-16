(function () {
  var root = document.documentElement;
  var savedTheme;

  root.classList.add("js");

  try {
    savedTheme = localStorage.getItem("theme");
  } catch (error) {
    savedTheme = null;
  }

  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  root.dataset.theme = savedTheme || (prefersDark ? "dark" : "light");

  function initializeSite() {
    var button = document.querySelector(".theme-toggle");

    function setTheme(theme) {
      root.dataset.theme = theme;

      try {
        localStorage.setItem("theme", theme);
      } catch (error) {
        // The selected theme still applies when storage is unavailable.
      }

      if (button) {
        button.setAttribute("aria-label", "Switch to " + (theme === "dark" ? "light" : "dark") + " mode");
        button.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
      }
    }

    if (button) {
      button.addEventListener("click", function () {
        setTheme(root.dataset.theme === "dark" ? "light" : "dark");
      });
      setTheme(root.dataset.theme || "light");
    }

    var navLinks = Array.prototype.slice.call(document.querySelectorAll('nav a[href^="#"]'));
    var sections = navLinks
      .map(function (link) {
        return document.querySelector(link.getAttribute("href"));
      })
      .filter(Boolean);

    if (!navLinks.length || !sections.length) {
      return;
    }

    function updateCurrentSection() {
      var current = sections[0];

      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= 130) {
          current = section;
        }
      });

      navLinks.forEach(function (link) {
        if (link.getAttribute("href") === "#" + current.id) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    }

    window.addEventListener("scroll", updateCurrentSection, { passive: true });
    window.addEventListener("resize", updateCurrentSection);
    updateCurrentSection();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeSite);
  } else {
    initializeSite();
  }
})();
