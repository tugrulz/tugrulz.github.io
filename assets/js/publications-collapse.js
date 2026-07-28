/**
 * publications-collapse.js
 * Shows the most recent publications and hides the rest behind a toggle,
 * so the homepage stays short without burying the newest work.
 *
 * Runs after abstract-expand.js so it operates on the finished list.
 */
(function () {
  const VISIBLE = 8;

  function collapse() {
    const list = document.querySelector('#publications + ul');
    if (!list) return;

    const items = Array.from(list.children).filter(el => el.tagName === 'LI');
    if (items.length <= VISIBLE) return;

    const hidden = items.slice(VISIBLE);
    hidden.forEach(li => { li.hidden = true; });

    const toggle = document.createElement('button');
    toggle.className = 'pub-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-expanded', 'false');

    function render(expanded) {
      toggle.innerHTML = expanded
        ? '<span>Show fewer publications</span><i class="fas fa-chevron-up"></i>'
        : '<span>Show all ' + items.length + ' publications</span><i class="fas fa-chevron-down"></i>';
    }
    render(false);

    toggle.addEventListener('click', function () {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      hidden.forEach(li => { li.hidden = expanded; });
      toggle.setAttribute('aria-expanded', String(!expanded));
      render(!expanded);
      if (expanded) {
        document.getElementById('publications')
          .scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });

    list.insertAdjacentElement('afterend', toggle);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', collapse);
  } else {
    collapse();
  }
}());
