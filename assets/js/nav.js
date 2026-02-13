// nav.js — fetches nav-fragment.html and injects aside + header into the page
(function () {
  async function loadNav() {
    try {
      if (document.querySelector('aside') && document.querySelector('header')) return; // already present
      const res = await fetch('nav-fragment.html');
      if (!res.ok) throw new Error('Failed to fetch nav-fragment');
      const text = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      const aside = doc.querySelector('aside');
      const header = doc.querySelector('header');
      const overlay = doc.getElementById('sidebar-overlay');

      // Insert aside before the first <main> if present, otherwise at body start
      const main = document.querySelector('main');
      if (aside) {
        if (main) document.body.insertBefore(aside, main);
        else document.body.insertBefore(aside, document.body.firstChild);
      }

      // Insert overlay (if not already present) as first child of body
      if (overlay && !document.getElementById('sidebar-overlay')) {
        document.body.insertBefore(overlay, document.body.firstChild);
      }

      // Insert header as first child of main (preferred) otherwise after aside
      if (header) {
        if (main) main.insertBefore(header, main.firstChild);
        else if (aside && aside.nextSibling) document.body.insertBefore(header, aside.nextSibling);
        else document.body.appendChild(header);
      }

      // Wire mobile menu toggle and overlay
      function wireToggle() {
        const btn = document.getElementById('mobile-menu-btn');
        const sidebar = document.querySelector('aside');
        const overlayEl = document.getElementById('sidebar-overlay');
        if (btn) btn.addEventListener('click', function () {
          sidebar?.classList.toggle('hidden');
          overlayEl?.classList.toggle('hidden');
        });
        if (overlayEl) overlayEl.addEventListener('click', function () {
          sidebar?.classList.add('hidden');
          overlayEl.classList.add('hidden');
        });
      }

      // Small delay to ensure nodes are in document
      setTimeout(wireToggle, 20);
    } catch (err) {
      console.error('nav.js error:', err);
    }
  }

  // Load on DOMContentLoaded if still not loaded
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', loadNav);
  else loadNav();
})();
