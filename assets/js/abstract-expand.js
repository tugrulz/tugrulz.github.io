/**
 * abstract-expand.js
 * Adds Abstract toggle + TL;DR to homepage publication list items.
 * Depends on window.__PAPERS__ loaded from papers-data.js.
 *
 * Per publication, the final rendered order is:
 *   Title (linked to arXiv) / Authors / Conference  Full Paper
 *   [PDF] [Code] [Abstract ↓]
 *   Abstract text (expands inline)
 *   TL;DR: …
 *
 * Interactions:
 *   - Click title          → open arXiv page
 *   - Click card body      → toggle abstract (skip if target is a/button)
 *   - Click Abstract button → toggle abstract
 */
(function () {
  const ARXIV_ID_RE = /arxiv\.org\/(?:abs|pdf)\/([\d]{4}\.[\d]{4,5})/;

  function arxivIdFromUrl(url) {
    const m = url.match(ARXIV_ID_RE);
    return m ? m[1].replace(/v\d+$/, '') : null;
  }

  function toggleAbstract(toggle, panel) {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    panel.hidden = expanded;
    toggle.querySelector('i').style.transform = expanded ? '' : 'rotate(180deg)';
  }

  function enhance() {
    const papers = window.__PAPERS__;
    if (!papers) return;

    document.querySelectorAll('#publications + ul > li').forEach(li => {
      if (li.querySelector('.paper-abstract-toggle')) return;

      // Find arXiv ID from first arXiv link
      let id = null;
      let arxivLink = null;
      for (const a of li.querySelectorAll('a')) {
        const aid = arxivIdFromUrl(a.href);
        if (aid) { id = aid; arxivLink = a; break; }
      }
      if (!id || !arxivLink) return;

      const data = papers[id];
      if (!data) return;

      // Mark the title strong for CSS sizing
      const titleStrong = li.querySelector('strong:first-of-type');
      if (titleStrong) titleStrong.classList.add('paper-title');

      let toggle, panel;

      if (data.abstract) {
        toggle = document.createElement('button');
        toggle.className = 'paper-abstract-toggle';
        toggle.setAttribute('aria-expanded', 'false');
        toggle.innerHTML = '<span>Abstract</span><i class="fas fa-chevron-down"></i>';

        panel = document.createElement('div');
        panel.className = 'paper-abstract';
        panel.textContent = data.abstract;
        panel.hidden = true;

        toggle.addEventListener('click', function (e) {
          e.preventDefault();
          e.stopPropagation();
          toggleAbstract(toggle, panel);
        });

        arxivLink.insertAdjacentElement('afterend', toggle);

        let anchor = toggle;
        while (anchor.parentNode && anchor.parentNode !== li) {
          anchor = anchor.parentNode;
        }
        anchor.insertAdjacentElement('afterend', panel);

        // --- Card-level click → toggle abstract ---
        li.style.cursor = 'pointer';
        li.addEventListener('click', function (e) {
          // Ignore clicks on links or buttons
          if (e.target.closest('a') || e.target.closest('button')) return;
          toggleAbstract(toggle, panel);
        });
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
