(() => {
  // Only explicitly confirmed addresses gain mail and copy actions.
  const src = document.querySelector('[data-email-confirmed="true"][data-u][data-d]');
  if (src && src.dataset.u && src.dataset.d) {
    const addr = `${src.dataset.u}@${src.dataset.d}`;
    document.querySelectorAll('.js-mail').forEach((el) => {
      el.href = `mailto:${addr}`;
      el.hidden = false;
    });
    const out = document.getElementById('email-text');
    const btn = document.getElementById('copy-btn');
    const status = document.getElementById('copy-status');
    if (out && btn && status) {
      out.textContent = addr;
      const lbl = btn.querySelector('.lbl');
      if (lbl) {
        btn.hidden = false;
        let busy = false;
        let resetTimer;
        const reset = () => {
          btn.classList.remove('is-done');
          lbl.textContent = 'Copy';
          btn.setAttribute('aria-label', 'Copy email address');
        };
        btn.addEventListener('click', async () => {
          if (busy) return;
          busy = true;
          clearTimeout(resetTimer);
          reset();
          status.textContent = '';
          btn.setAttribute('aria-busy', 'true');
          try {
            if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
            await navigator.clipboard.writeText(addr);
            status.textContent = 'Email copied.';
            lbl.textContent = 'Copied';
            btn.classList.add('is-done');
            btn.setAttribute('aria-label', 'Email copied');
            resetTimer = setTimeout(reset, 2000);
          } catch {
            status.textContent = 'Copy unavailable. Select the email address to copy it manually.';
            // Selection assists manual copying; keep keyboard focus on the button.
            try {
              const selection = window.getSelection();
              if (selection) {
                const range = document.createRange();
                range.selectNodeContents(out);
                selection.removeAllRanges();
                selection.addRange(range);
              }
            } catch { /* The visible address remains available for manual selection. */ }
          } finally {
            btn.removeAttribute('aria-busy');
            busy = false;
          }
        });
      }
    }
  }
  // Mobile menu: Esc, link click and outside click close it; focus returns to the toggle.
  const tog = document.querySelector('.menu-btn'), menu = document.getElementById('mobile-menu');
  if (!tog || !menu) return;
  const setOpen = (open, refocus) => {
    menu.hidden = !open; tog.setAttribute('aria-expanded', String(open));
    tog.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) menu.querySelector('a').focus(); else if (refocus) tog.focus();
  };
  tog.addEventListener('click', () => setOpen(menu.hidden, true));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false, false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setOpen(false, true); });
  document.addEventListener('click', (e) => { if (!menu.hidden && !menu.contains(e.target) && !tog.contains(e.target)) setOpen(false, false); });
})();
