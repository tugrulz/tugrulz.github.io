/**
 * abstract-expand.js
 * Injects TL;DR + click-to-expand abstract into project card paper lists.
 * Depends on window.__PAPERS__ loaded from papers-data.js.
 */
(function () {
  const ARXIV_ID_RE = /arxiv\.org\/(?:abs|pdf)\/([\d]{4}\.[\d]{4,5})/;

  function arxivIdFromUrl(url) {
    const m = url.match(ARXIV_ID_RE);
    return m ? m[1].replace(/v\d+$/, '') : null;
  }

  function enhance() {
    const papers = window.__PAPERS__;
    if (!papers) return;

    const selector = [
      '.project-card__papers li',
      '#publications + ul > li',
      '#preprints + ul > li',
    ].join(', ');

    document.querySelectorAll(selector).forEach(li => {
      // Find the first arXiv link anywhere in the li (handles [PDF] links on homepage)
      let id = null;
      for (const a of li.querySelectorAll('a')) {
        id = arxivIdFromUrl(a.href);
        if (id) break;
      }
      const data = id && papers[id];
      if (!data) return;

      // --- TL;DR line ---
      if (data.tldr) {
        const tldr = document.createElement('p');
        tldr.className = 'paper-tldr';
        tldr.textContent = 'TL;DR: ' + data.tldr;
        li.appendChild(tldr);
      }

      // --- Expandable abstract ---
      if (data.abstract) {
        const toggle = document.createElement('button');
        toggle.className = 'paper-abstract-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<span>Abstract</span><i class="fas fa-chevron-down"></i>';

        const panel = document.createElement('p');
        panel.className = 'paper-abstract';
        panel.textContent = data.abstract;
        panel.hidden = true;

        toggle.addEventListener('click', function (e) {
          e.preventDefault();
          const expanded = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', String(!expanded));
          panel.hidden = expanded;
          toggle.querySelector('i').style.transform = expanded ? '' : 'rotate(180deg)';
        });

        li.appendChild(toggle);
        li.appendChild(panel);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhance);
  } else {
    enhance();
  }
})();
