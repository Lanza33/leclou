(function () {
  var header = document.getElementById('header');
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  var solidAlways = document.body.classList.contains('page-legal');

  // Header: transparent über dem Hero, danach hell
  function onScroll() {
    header.classList.toggle('is-solid', solidAlways || window.scrollY > 60);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile Navigation
  function closeNav() {
    document.body.classList.remove('nav-open');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('click', function () {
    var open = document.body.classList.toggle('nav-open');
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });

  // Einblenden beim Scrollen
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Galerie-Lightbox
  var gallery = document.getElementById('gallery');
  var box = document.getElementById('lightbox');
  if (gallery && box) {
    var buttons = Array.prototype.slice.call(gallery.querySelectorAll('button'));
    var img = box.querySelector('img');
    var current = 0;
    var show = function (i) {
      current = (i + buttons.length) % buttons.length;
      var b = buttons[current];
      img.src = b.dataset.full;
      img.alt = b.querySelector('img').alt;
    };
    var close = function () { box.classList.remove('is-open'); buttons[current].focus(); };
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () {
        show(i);
        box.classList.add('is-open');
        box.querySelector('.lightbox__close').focus();
      });
    });
    box.querySelector('.lightbox__close').addEventListener('click', close);
    box.querySelector('.lightbox__prev').addEventListener('click', function () { show(current - 1); });
    box.querySelector('.lightbox__next').addEventListener('click', function () { show(current + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });
  }

  // Slideshow (Startseite)
  document.querySelectorAll('[data-slider]').forEach(function (el) {
    var slides = el.querySelectorAll('.slider__frame figure');
    var count = el.querySelector('.slider__count b');
    var bar = el.querySelector('.slider__progress i');
    var i = 0, timer, delay = 5500;
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function go(n) {
      slides[i].classList.remove('is-active');
      i = (n + slides.length) % slides.length;
      slides[i].classList.add('is-active');
      count.textContent = (i < 9 ? '0' : '') + (i + 1);
      restart();
    }
    function restart() {
      clearTimeout(timer);
      bar.style.transition = 'none'; bar.style.width = '0';
      if (still) return;
      bar.offsetWidth;
      bar.style.transition = 'width ' + delay + 'ms linear'; bar.style.width = '100%';
      timer = setTimeout(function () { go(i + 1); }, delay);
    }
    el.querySelector('[data-prev]').addEventListener('click', function () { go(i - 1); });
    el.querySelector('[data-next]').addEventListener('click', function () { go(i + 1); });
    var x0 = null;
    el.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    restart();
  });

  // Behandlungen: Karussell mit Kategorien
  document.querySelectorAll('[data-tcar]').forEach(function (el) {
    var track = el.querySelector('.tcar__track');
    var slides = el.querySelectorAll('.tcar__slide');
    var tabs = el.querySelectorAll('.tcar__tab');
    var i = 0;
    function fit() { track.style.height = slides[i].offsetHeight + 'px'; }
    // Anker-Sprünge (#massagen) scrollen den Container selbst – zurücksetzen, wir verschieben per transform
    track.addEventListener('scroll', function () { track.scrollLeft = 0; });
    function go(n, scroll) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        s.style.transform = 'translateX(' + (-100 * i) + '%)';
        s.classList.toggle('is-active', k === i);
        s.inert = k !== i;
        s.setAttribute('aria-hidden', k === i ? 'false' : 'true');
      });
      tabs.forEach(function (t, k) { t.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      track.scrollLeft = 0;
      fit();
      if (scroll && el.getBoundingClientRect().top < 0) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { go(+t.dataset.go); }); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') go(i + 1);
      if (e.key === 'ArrowLeft') go(i - 1);
    });
    var x0 = null, y0 = null;
    track.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(i + (dx < 0 ? 1 : -1));
      x0 = null;
    });
    window.addEventListener('resize', fit);
    window.addEventListener('load', fit);
    var start = 0;
    slides.forEach(function (s, k) { if ('#' + s.id === location.hash) start = k; });
    go(start);
    if (start) window.addEventListener('load', function () { el.scrollIntoView({ block: 'start' }); });
  });

  // Kontakt: Google Maps erst nach Klick laden (keine Daten an Google ohne Zustimmung)
  document.querySelectorAll('[data-map]').forEach(function (el) {
    el.querySelector('[data-map-load]').addEventListener('click', function () {
      var f = document.createElement('iframe');
      f.src = el.dataset.map;
      f.title = 'Google Maps: Le Clou, Unterrainerstraße 21/B, St. Pauls';
      f.referrerPolicy = 'no-referrer-when-downgrade';
      el.innerHTML = '';
      el.appendChild(f);
      el.classList.add('is-loaded');
    });
  });

  // Kontaktformular: öffnet das E-Mail-Programm mit der fertigen Nachricht
  var form = document.getElementById('cform');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var err = document.getElementById('cform-error');
      var ok = form.checkValidity();
      err.hidden = ok;
      if (!ok) return;
      var v = function (n) { return form.elements[n].value.trim(); };
      var subject = 'Anfrage' + (v('anliegen') ? ': ' + v('anliegen') : '') + ', ' + v('name');
      var body = v('nachricht') + '\n\n' + v('name') + '\n' + v('email') + (v('telefon') ? '\n' + v('telefon') : '');
      window.location.href = 'mailto:info@leclou.bz?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Steps carousel (mobile only): dots follow the scroll position
  document.querySelectorAll('.steps--carousel').forEach(function (list) {
    var items = list.children;
    var dots = document.createElement('div');
    dots.className = 'steps-dots';
    dots.setAttribute('aria-hidden', 'true');
    for (var n = 0; n < items.length; n++) {
      (function (k) {
        var d = document.createElement('button');
        d.type = 'button'; d.tabIndex = -1;
        d.addEventListener('click', function () {
          list.scrollTo({ left: items[k].offsetLeft - list.offsetLeft - (list.clientWidth - items[k].offsetWidth) / 2, behavior: 'smooth' });
        });
        dots.appendChild(d);
      })(n);
    }
    list.parentNode.insertBefore(dots, list.nextSibling);
    function update() {
      var mid = list.scrollLeft + list.clientWidth / 2, best = 0, bd = Infinity;
      for (var k = 0; k < items.length; k++) {
        var c = items[k].offsetLeft - list.offsetLeft + items[k].offsetWidth / 2, dd = Math.abs(c - mid);
        if (dd < bd) { bd = dd; best = k; }
      }
      for (var j = 0; j < dots.children.length; j++) dots.children[j].classList.toggle('is-active', j === best);
    }
    list.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });
})();
