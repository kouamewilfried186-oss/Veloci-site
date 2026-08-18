/* ==========================================================================
   VÉLOÇI — script principal
   ========================================================================== */

(function () {
  "use strict";

  var WHATSAPP_NUMBER = "22571993266"; // Numéro WhatsApp Véloçi
  var DEFAULT_MESSAGE =
    "Bonjour Véloçi, je souhaite louer un vélo. Je voudrais avoir plus d'informations sur les vélos disponibles et les tarifs.";

  function waLink(message) {
    var text = encodeURIComponent(message || DEFAULT_MESSAGE);
    return "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + text;
  }

  function initWhatsappLinks() {
    var links = document.querySelectorAll("[data-wa]");
    links.forEach(function (link) {
      var custom = link.getAttribute("data-wa-message");
      link.setAttribute("href", waLink(custom));
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
    });
  }

  function initNav() {
    var nav = document.querySelector(".nav");
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".nav-links");
    var scrim = document.querySelector(".nav-scrim");

    function onScroll() {
      if (!nav) return;
      if (window.scrollY > 12) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    function closeMenu() {
      links && links.classList.remove("open");
      scrim && scrim.classList.remove("open");
      toggle && toggle.setAttribute("aria-expanded", "false");
    }
    function openMenu() {
      links && links.classList.add("open");
      scrim && scrim.classList.add("open");
      toggle && toggle.setAttribute("aria-expanded", "true");
    }

    if (toggle) {
      toggle.addEventListener("click", function () {
        var isOpen = links && links.classList.contains("open");
        isOpen ? closeMenu() : openMenu();
      });
    }
    if (scrim) scrim.addEventListener("click", closeMenu);
    if (links) {
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", closeMenu);
      });
    }
  }

  function initFaq() {
    var items = document.querySelectorAll(".faq-item");
    items.forEach(function (item) {
      var q = item.querySelector(".faq-q");
      if (!q) return;
      q.addEventListener("click", function () {
        var wasOpen = item.classList.contains("open");
        items.forEach(function (i) {
          i.classList.remove("open");
          var btn = i.querySelector(".faq-q");
          btn && btn.setAttribute("aria-expanded", "false");
        });
        if (!wasOpen) {
          item.classList.add("open");
          q.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var obs = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach(function (el) { obs.observe(el); });
  }

  function initForm() {
    var form = document.getElementById("rental-form");
    if (!form) return;
    var success = document.getElementById("form-success");

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      var data = new FormData(form);
      var nom = (data.get("nom") || "").toString().trim();
      var tel = (data.get("telephone") || "").toString().trim();
      var whatsapp = (data.get("whatsapp") || "").toString().trim();
      var quartier = (data.get("quartier") || "").toString().trim();
      var velo = (data.get("velo") || "").toString().trim();
      var duree = (data.get("duree") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();

      var recap =
        "Bonjour Véloçi, je souhaite louer un vélo.\n" +
        "Nom : " + nom + "\n" +
        "Téléphone : " + tel + "\n" +
        (whatsapp ? "WhatsApp : " + whatsapp + "\n" : "") +
        (quartier ? "Quartier : " + quartier + "\n" : "") +
        (velo ? "Vélo souhaité : " + velo + "\n" : "") +
        (duree ? "Durée : " + duree + "\n" : "") +
        (message ? "Message : " + message : "");

      if (success) {
        success.classList.add("show");
        success.textContent =
          "Merci " + (nom || "à vous") + " ! Votre demande est prête. Ouvrez WhatsApp pour l'envoyer à Véloçi.";
      }

      window.open(waLink(recap), "_blank", "noopener");
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initWhatsappLinks();
    initNav();
    initFaq();
    initReveal();
    initForm();
  });
})();
