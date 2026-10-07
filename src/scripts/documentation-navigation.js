// Native anchors remain responsible for scrolling, hashes and browser history.
const shell = document.querySelector('.documentation');
if (shell) {
  const links = [...shell.querySelectorAll('.documentation-nav a')];
  const sections = [...new Set(links.map((link) => link.hash.slice(1)))]
    .map((id) => document.getElementById(id))
    .filter(Boolean);

  const markActive = (id) => {
    links.forEach((link) => {
      if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  };

  const updateActive = () => {
    if (!sections.length) return;
    const readingLine = window.innerHeight * .25;
    let active = sections[0];
    for (const section of sections) {
      const heading = section.querySelector('h1, h2') || section;
      if (heading.getBoundingClientRect().top <= readingLine) active = section;
    }
    // A short Contact section may never cross the reading line.
    const page = document.documentElement;
    if (page.scrollHeight > window.innerHeight &&
        window.scrollY + window.innerHeight >= page.scrollHeight - 2) {
      active = sections[sections.length - 1];
    }
    markActive(active.id);
  };

  let queued = false;
  const scheduleUpdate = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      updateActive();
    });
  };

  shell.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest('a[href^="#"]');
    if (!link || event.defaultPrevented || event.button !== 0 ||
        event.ctrlKey || event.metaKey || event.shiftKey || event.altKey ||
        link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    if (sections.includes(target)) markActive(target.id);
    // Wait for the ordinary anchor action, then ensure keyboard focus follows it.
    // Passive scroll/hash/history updates never take focus or change the hash.
    requestAnimationFrame(() => {
      if (!event.defaultPrevented) target.focus({ preventScroll: true });
    });
  });

  const updateHash = () => {
    const target = sections.find((section) => `#${section.id}` === location.hash);
    if (target) markActive(target.id);
    scheduleUpdate();
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  window.addEventListener('hashchange', updateHash);
  window.addEventListener('pageshow', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);
  // Details, responsive reflow and loaded fonts can move headings without scroll.
  shell.addEventListener('toggle', scheduleUpdate, true);
  if ('ResizeObserver' in window) new ResizeObserver(scheduleUpdate).observe(shell);
  updateHash();
}
