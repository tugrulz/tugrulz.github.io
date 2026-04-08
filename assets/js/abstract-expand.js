/**
 * abstract-expand.js
 * Adds Abstract toggle + TL;DR to homepage publication list items.
 * Depends on window.__PAPERS__ loaded from papers-data.js.
 *
 * Per publication, the final rendered order is:
 *   Title / Authors / Conference  Full Paper      ← from markdown
 *   [PDF] [Code] [Abstract ↓]                     ← toggle injected after last link
 *   Abstract text (expands inline)
 *   TL;DR: …
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

    document.querySelectorAll('#publications + ul > li').forEach(li => {
      // Guard: already enhanced
      if (li.querySelector('.paper-abstract-toggle')) return;

      // Find arXiv ID
      let id = null;
      let lastLink = null;
      for (const a of li.querySelectorAll('a')) {
        const aid = arxivIdFromUrl(a.href);
        if (aid) { id = aid; lastLink = a; break; }
      }
      if (!id || !lastLink) return;

      const data = papers[id];
      if (!data) return;

      if (data.abstract) {
        const toggle = document.createElement('button');
        toggle.className = 'paper-abstract-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<span>Abstract</span><i class="fas fa-chevron-down"></i>';

        const panel = document.createElement('div');
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

        // Insert toggle inline right after the arXiv link
        lastLink.insertAdjacentElement('afterend', toggle);

        // Abstract panel: find the direct li-child that contains the toggle, insert after it
        let anchor = toggle;
        while (anchor.parentNode && anchor.parentNode !== li) {
          anchor = anchor.parentNode;
        }
        anchor.insertAdjacentElement('afterend', panel);
      }

      if (data.tldr) {
        const tldr = document.createElement('p');
        tldr.className = 'paper-tldr';
        tldr.textContent = 'TL;DR: ' + data.tldr;
        li.appendChild(tldr);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhance);
  } else {
    enhance();
  }
})();
