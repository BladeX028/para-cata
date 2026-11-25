/* ============================================================
   Para Cata — comportamiento
   1) Aparición de elementos al hacer scroll (bajando y subiendo)
   2) Foto ampliada al tocar una imagen
   ============================================================ */
(function () {
  'use strict';

  /* ---------- 1) Aparición al hacer scroll ---------- */
  var items = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  // Escalonado: cada elemento dentro de un mismo grupo entra con un pequeño retraso
  items.forEach(function (el) {
    var parent = el.parentElement;
    var siblings = parent ? Array.prototype.filter.call(parent.children, function (c) {
      return c.classList.contains('reveal');
    }) : [];
    var i = Math.max(0, siblings.indexOf(el));
    el.style.setProperty('--delay', Math.min(i * 90, 450) + 'ms');
  });

  if (!('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        if (entry.isIntersecting) {
          el.classList.add('in');
        } else {
          // Al salir, queda listo para volver a aparecer.
          // Si salió por arriba (el usuario bajó), al subir entra desde arriba.
          if (entry.boundingClientRect.top < 0) { el.classList.add('from-top'); }
          else { el.classList.remove('from-top'); }
          el.classList.remove('in');
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    items.forEach(function (el) { io.observe(el); });
  }

  /* ---------- 2) Foto ampliada ---------- */
  var lightbox = document.getElementById('lightbox');
  var lbImg = lightbox.querySelector('img');
  var lbCap = lightbox.querySelector('figcaption');
  var photos = Array.prototype.slice.call(document.querySelectorAll('.photo:not(.video) img'));
  var current = -1;

  function show(i) {
    if (!photos.length) return;
    current = (i + photos.length) % photos.length;
    var img = photos[current];
    var cap = img.parentElement.querySelector('figcaption');
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = cap ? cap.textContent : '';
    lbCap.style.display = cap ? '' : 'none';
  }
  function open(i) {
    show(i);
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.hidden = true;
    lbImg.removeAttribute('src');
    document.body.style.overflow = '';
  }

  photos.forEach(function (img, i) {
    img.addEventListener('click', function () { open(i); });
  });
  lightbox.querySelector('.lb-close').addEventListener('click', close);
  lightbox.querySelector('.lb-prev').addEventListener('click', function () { show(current - 1); });
  lightbox.querySelector('.lb-next').addEventListener('click', function () { show(current + 1); });
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target.tagName === 'FIGURE') close();
  });
  document.addEventListener('keydown', function (e) {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(current - 1);
    else if (e.key === 'ArrowRight') show(current + 1);
  });

  // Deslizar con el dedo en el celular
  var startX = null;
  lightbox.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
  lightbox.addEventListener('touchend', function (e) {
    if (startX === null) return;
    var dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
    startX = null;
  }, { passive: true });
})();
