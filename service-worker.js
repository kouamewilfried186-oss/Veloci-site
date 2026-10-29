"use strict";

var CACHE_NAME = "veloci-pwa-v1";
var CACHE_PREFIX = "veloci-pwa-";
var OFFLINE_URL = "./offline.html";
var APP_SHELL = [
  "./index.html",
  "./velos.html",
  "./tarifs.html",
  "./fonctionnement.html",
  "./randonnee.html",
  "./apropos.html",
  "./faq.html",
  "./contact.html",
  OFFLINE_URL,
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/script.js",
  "./images/icon-192.png",
  "./images/icon-512.png",
  "./images/0image.jpg",
  "./images/image.jpg",
  "./images/imageRand1jpg.jpeg",
  "./images/imageV5.jpg",
  "./images/imageV6.jpg",
  "./images/imageV7.jpg",
  "./images/imageV8.jpg.jpeg",
  "./images/imagerande2.jpg",
  "./images/imagev1.jpg",
  "./images/imagev2.jpg",
  "./images/imagev3.jpg",
  "./images/imagev4.jpg",
  "./images/randonne.jpg.jpeg",
  "./images/velociPR0.jpeg"
];

function cacheResponse(request, response) {
  return caches.open(CACHE_NAME)
    .then(function (cache) {
      return cache.put(request, response);
    })
    .catch(function (error) {
      console.error("Impossible de mettre en cache une ressource Véloçi.", error);
    });
}

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(APP_SHELL);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (cacheNames) {
        return Promise.all(
          cacheNames.map(function (cacheName) {
            if (cacheName.indexOf(CACHE_PREFIX) === 0 && cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
            return Promise.resolve();
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET") return;

  var requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then(function (response) {
          if (response.ok) {
            return cacheResponse(request, response.clone()).then(function () {
              return response;
            });
          }
          return response;
        })
        .catch(function () {
          return caches.match(request).then(function (cachedPage) {
            return cachedPage || caches.match(OFFLINE_URL);
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(function (cachedResponse) {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then(function (response) {
        if (response.ok) {
          return cacheResponse(request, response.clone()).then(function () {
            return response;
          });
        }
        return response;
      });
    })
  );
});
