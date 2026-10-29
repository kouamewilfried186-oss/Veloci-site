/* ==========================================================================
   VÉLOÇI — script principal
   ========================================================================== */

(function () {
  "use strict";

  var WHATSAPP_NUMBER = "22571993266"; // Numéro WhatsApp Véloçi
  var DEFAULT_MESSAGE =
    "Bonjour Véloçi, je souhaite louer un vélo. " +
    "Je voudrais avoir plus d'informations sur les vélos disponibles et les tarifs.";

  // WhatsApp
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

  // Demande de location
  function initRentalRequest() {
    var triggers = document.querySelectorAll("[data-rental-request]");
    if (!triggers.length) return;

    var dialog = document.createElement("dialog");
    dialog.className = "rental-dialog";
    dialog.setAttribute("aria-labelledby", "rental-dialog-title");
    dialog.innerHTML =
      '<div class="rental-dialog-head">' +
      '<div><span class="eyebrow">Demande de location</span>' +
      '<h2 id="rental-dialog-title">Votre vélo, vos dates</h2></div>' +
      '<button type="button" class="rental-dialog-close" aria-label="Fermer">&times;</button>' +
      '</div>' +
      '<form class="rental-request-form">' +
      '<div class="form-grid">' +
      '<div class="form-field">' +
      '<label for="request-name">Nom complet *</label>' +
      '<input id="request-name" name="nom" type="text" autocomplete="name" required>' +
      '</div>' +
      '<div class="form-field">' +
      '<label for="request-phone">Téléphone *</label>' +
      '<input id="request-phone" name="telephone" type="tel" autocomplete="tel" ' +
      'placeholder="+225 XX XX XX XX XX" required>' +
      '</div>' +
      '<div class="form-field full">' +
      '<label for="request-bike">Vélo choisi</label>' +
      '<input id="request-bike" name="velo" type="text" readonly>' +
      '</div>' +
      '<div class="form-field full">' +
      '<label for="request-location">Localisation / quartier</label>' +
      '<input id="request-location" name="localisation" type="text" ' +
      'autocomplete="address-level2" placeholder="Quartier ou lien Google Maps">' +
      '<button type="button" class="btn btn-outline btn-block" id="request-location-button">' +
      'Partager ma position GPS</button>' +
      '<p class="form-note" id="request-location-status" role="status" aria-live="polite"></p>' +
      '</div>' +
      '<div class="form-field">' +
      '<label for="request-plan">Formule *</label>' +
      '<select id="request-plan" name="formule" required>' +
      '<option value="">Choisir une formule</option>' +
      '<option>Journalière</option><option>Hebdomadaire</option>' +
      '<option>Mensuelle</option><option>Partenaire</option>' +
      '</select>' +
      '</div>' +
      '<div class="form-field">' +
      '<label for="request-start">Date de début *</label>' +
      '<input id="request-start" name="dateDebut" type="date" required>' +
      '</div>' +
      '<div class="form-field full">' +
      '<label for="request-duration">Durée souhaitée (en jours) *</label>' +
      '<input id="request-duration" name="duree" type="number" min="1" step="1" ' +
      'placeholder="Ex. 7" required>' +
      '</div>' +
      '</div>' +
      '<button type="submit" class="btn btn-primary btn-block">Continuer sur WhatsApp</button>' +
      '<p class="form-note">Votre message sera préparé dans WhatsApp. ' +
      'Vous pourrez le vérifier avant de l’envoyer.</p>' +
      '</form>';
    document.body.appendChild(dialog);

    var form = dialog.querySelector("form");
    var bikeInput = dialog.querySelector("[name=velo]");
    var locationInput = dialog.querySelector("[name=localisation]");
    var locationStatus = dialog.querySelector("#request-location-status");
    var startInput = dialog.querySelector("[name=dateDebut]");
    var today = new Date();
    startInput.min = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0")
    ].join("-");

    triggers.forEach(function (trigger) {
      trigger.addEventListener("click", function (event) {
        event.preventDefault();
        var card = trigger.closest(".bike-card");
        var title = card && card.querySelector("h3");
        bikeInput.value = title ? title.textContent.trim() : "Vélo à confirmer";
        dialog.showModal();
        dialog.querySelector("[name=nom]").focus();
      });
    });

    dialog.querySelector(".rental-dialog-close").addEventListener("click", function () {
      dialog.close();
    });

    dialog.querySelector("#request-location-button").addEventListener("click", function () {
      if (!navigator.geolocation) {
        locationStatus.textContent =
          "La géolocalisation n’est pas disponible. Vous pouvez saisir " +
          "un quartier ou coller un lien Google Maps.";
        return;
      }

      locationStatus.textContent = "Recherche de votre position…";
      navigator.geolocation.getCurrentPosition(
        function (position) {
          var coordinates =
            position.coords.latitude + "," + position.coords.longitude;
          locationInput.value = "https://maps.google.com/?q=" + coordinates;
          locationStatus.textContent = "Position ajoutée au lien Google Maps.";
        },
        function () {
          locationStatus.textContent =
            "Position non récupérée. Autorisez l’accès GPS ou saisissez " +
            "un quartier ou un lien Google Maps.";
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (!form.reportValidity()) return;

      var data = new FormData(form);
      var message =
        "Bonjour Véloçi, je souhaite faire une demande de location.\n" +
        "Nom : " + data.get("nom") + "\n" +
        "Téléphone : " + data.get("telephone") + "\n" +
        "Vélo : " + data.get("velo") + "\n" +
        (data.get("localisation")
          ? "Localisation : " + data.get("localisation") + "\n"
          : "") +
        "Formule : " + data.get("formule") + "\n" +
        "Date de début : " + data.get("dateDebut") + "\n" +
        "Durée souhaitée : " + data.get("duree") + " jour(s)";
      window.open(waLink(message), "_blank", "noopener");
      dialog.close();
      form.reset();
    });
  }

  // Navigation
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

  // FAQ
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

  // Animations au défilement
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || els.length === 0) {
      els.forEach(function (el) {
        el.classList.add("in");
      });
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
    els.forEach(function (el) {
      obs.observe(el);
    });
  }

  // Formulaire de contact
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
          "Merci " + (nom || "à vous") +
          " ! Votre demande est prête. Ouvrez WhatsApp pour l'envoyer à Véloçi.";
      }

      window.open(waLink(recap), "_blank", "noopener");
      form.reset();
    });
  }

  // Application hors ligne
  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("./service-worker.js")
      .catch(function (error) {
        console.error("Impossible d’enregistrer le service worker Véloçi.", error);
      });
  }

  // Initialisation
  document.addEventListener("DOMContentLoaded", function () {
    registerServiceWorker();
    initWhatsappLinks();
    initRentalRequest();
    initNav();
    initFaq();
    initReveal();
    initForm();
  });
})();
