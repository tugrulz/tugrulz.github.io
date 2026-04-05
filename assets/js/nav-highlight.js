(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    var sidebar   = document.getElementById('sidebar');
    var overlay   = document.getElementById('sidebar-overlay');
    var toggle    = document.getElementById('mobile-toggle');
    var navLinks  = document.querySelectorAll('.nav-link');

    // ── Mobile sidebar toggle ──────────────────────────────────────────────
    function openSidebar() {
      sidebar.classList.add('open');
      overlay.classList.add('visible');
      document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
      document.body.style.overflow = '';
    }

    if (toggle) {
      toggle.addEventListener('click', function (e) {
        e.stopPropagation();
        sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
      });
    }

    if (overlay) {
      overlay.addEventListener('click', closeSidebar);
    }

    // Close sidebar on nav link click (mobile)
    navLinks.forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 900) closeSidebar();
      });
    });

    // ── Active section highlighting ────────────────────────────────────────
    var sectionIds = ['about', 'team', 'alumni', 'publications', 'preprints',
                      'talks', 'teaching', 'services', 'media', 'misc'];

    var sections = sectionIds.map(function (id) {
      return document.getElementById(id);
    }).filter(Boolean);

    if (!sections.length || !navLinks.length) return;

    function setActive(id) {
      navLinks.forEach(function (link) {
        var target = link.getAttribute('data-section') || link.getAttribute('href').replace('#', '');
        link.classList.toggle('active', target === id);
      });
    }

    // Default: "about" is active on load
    setActive('about');

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    }, {
      rootMargin: '-15% 0px -75% 0px',
      threshold: 0
    });

    sections.forEach(function (el) { observer.observe(el); });
  });
}());
