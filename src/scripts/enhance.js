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
      btn.hidden = false;
      let busy = false;
      let resetTimer;
      const reset = () => {
        btn.classList.remove('is-done');
        btn.textContent = 'Copy email';
        status.textContent = '';
      };
      btn.addEventListener('click', async () => {
        if (busy) return;
        busy = true;
        clearTimeout(resetTimer);
        reset();
        btn.setAttribute('aria-busy', 'true');
        try {
          if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
          await navigator.clipboard.writeText(addr);
          status.textContent = 'Email copied.';
          btn.textContent = 'Copied';
          btn.classList.add('is-done');
          resetTimer = setTimeout(reset, 1800);
        } catch {
          status.textContent = 'Copy unavailable. Select the visible email address above, then copy it manually.';
          // Select the visible text to make the manual fallback immediate. Focus stays on the button.
          try {
            const selection = window.getSelection();
            if (selection && out.isConnected) {
              const range = document.createRange();
              range.selectNodeContents(out);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          } catch { /* The visible address remains selectable with pointer or keyboard. */ }
        } finally {
          btn.removeAttribute('aria-busy');
          busy = false;
        }
      });
    }
  }
  const disclosure = document.querySelector('.nav-disclosure');
  const summary = disclosure?.querySelector('summary');
  const header = document.querySelector('.site-head');
  const mobile = matchMedia('(max-width: 767.98px)');
  if (!disclosure || !summary || !header) return;
  const setMode = () => { disclosure.open = !mobile.matches; };
  setMode();
  mobile.addEventListener('change', setMode);
  const close = (refocus = false) => {
    if (!mobile.matches) return;
    disclosure.open = false;
    if (refocus) summary.focus();
  };
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobile.matches && disclosure.open) close(true);
  });
  document.addEventListener('click', (event) => {
    if (!disclosure.contains(event.target)) close();
  });
  document.addEventListener('focusin', (event) => {
    if (!disclosure.contains(event.target)) close();
  });
  const links = [...document.querySelectorAll('.nav-links a')];
  const sections = [...document.querySelectorAll('main > [id]:not(#main)')];
  const activate = (id) => links.forEach(link => {
    if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href^="#"]');
    const target = link && document.getElementById(link.hash.slice(1));
    if (!target) return;
    close();
    target.focus({ preventScroll: true });
    activate(target.id);
  });
  const fromHash = () => {
    const target = document.getElementById(location.hash.slice(1));
    if (target) { target.focus({ preventScroll: true }); activate(target.id); }
  };
  window.addEventListener('hashchange', fromHash);
  const update = () => {
    const height = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--header-offset', `${height + 16}px`);
    const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    const current = atPageEnd ? sections.at(-1) : sections.filter(section => section.getBoundingClientRect().top <= height + 80).at(-1) || sections[0];
    if (current) activate(current.id);
  };
  new ResizeObserver(update).observe(header);
  window.addEventListener('scroll', update, { passive: true });
  fromHash();
  update();
})();
