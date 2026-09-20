const toggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#mobile-nav');
function closeMenu() {
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Open navigation');
  menu.hidden = true;
}
toggle.addEventListener('click', () => {
  const opening = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(opening));
  toggle.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
  menu.hidden = !opening;
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !menu.hidden) { closeMenu(); toggle.focus(); }
});
document.addEventListener('click', event => {
  if (!menu.hidden && !event.target.closest('.site-header')) closeMenu();
});
const desktop = window.matchMedia('(min-width: 1001px)');
desktop.addEventListener('change', event => { if (event.matches) closeMenu(); });
const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(pointer: fine)');
const hero = document.querySelector('.hero');
const root = document.documentElement;
const motionButton = document.querySelector('.motion-toggle');
const crewArt = document.querySelector('.crew-art');
const guestCards = [...document.querySelectorAll('[data-depth]')];
let userPaused = false;
try { userPaused = localStorage.getItem('ilead-motion-paused') === 'true'; } catch {}
const canAnimate = () => !motion.matches && !userPaused && !document.hidden;
function resetDepth() {
  hero.style.setProperty('--pointer-x', '0px');
  hero.style.setProperty('--pointer-y', '0px');
  hero.style.setProperty('--scroll-depth', '0px');
  crewArt.style.setProperty('--art-depth', '0px');
  guestCards.forEach(card => {
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  });
}
function updateMotion() {
  const enabled = canAnimate();
  root.classList.toggle('motion-enabled', enabled);
  root.classList.toggle('motion-paused', !enabled);
  motionButton.hidden = false;
  motionButton.disabled = motion.matches;
  motionButton.setAttribute('aria-pressed', String(userPaused || motion.matches));
  motionButton.querySelector('.motion-label').textContent = motion.matches ? 'Motion reduced' : userPaused ? 'Enable motion' : 'Pause motion';
  motionButton.querySelector('.motion-icon').textContent = motion.matches || userPaused ? '▷' : 'Ⅱ';
  if (!enabled) resetDepth();
}
motionButton.addEventListener('click', () => {
  userPaused = !userPaused;
  try { localStorage.setItem('ilead-motion-paused', String(userPaused)); } catch {}
  updateMotion();
});
motion.addEventListener('change', updateMotion);
document.addEventListener('visibilitychange', updateMotion);
const animatedSections = [hero, document.querySelector('.guests')];
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('motion-visible', entry.isIntersecting));
  }, { threshold: 0.05 });
  animatedSections.forEach(section => observer.observe(section));
} else {
  animatedSections.forEach(section => section.classList.add('motion-visible'));
}
updateMotion();
hero.addEventListener('pointermove', event => {
  if (!canAnimate() || !finePointer.matches) return;
  const bounds = hero.getBoundingClientRect();
  hero.style.setProperty('--pointer-x', `${((event.clientX - bounds.left) / bounds.width - .5) * 14}px`);
  hero.style.setProperty('--pointer-y', `${((event.clientY - bounds.top) / bounds.height - .5) * 8}px`);
}, { passive: true });
hero.addEventListener('pointerleave', () => {
  hero.style.setProperty('--pointer-x', '0px');
  hero.style.setProperty('--pointer-y', '0px');
});
guestCards.forEach(card => {
  card.addEventListener('pointermove', event => {
    if (!canAnimate() || !finePointer.matches) return;
    const bounds = card.getBoundingClientRect();
    const x = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
    const y = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
    card.style.setProperty('--tilt-x', `${-y * 5}deg`);
    card.style.setProperty('--tilt-y', `${x * 6}deg`);
  }, { passive: true });
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  });
});
const winnersTrack = document.querySelector('.winners-track');
const winnersTabs = [...document.querySelectorAll('.winners-year')];
if (winnersTrack && winnersTabs.length) {
  const winnersPanels = [...winnersTrack.children];
  function setActiveWinnersTab(index) {
    winnersTabs.forEach((tab, i) => {
      const active = i === index;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', String(active));
    });
  }
  winnersTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      winnersPanels[index]?.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
      setActiveWinnersTab(index);
    });
  });
  if ('IntersectionObserver' in window) {
    const winnersObserver = new IntersectionObserver(entries => {
      const visible = entries.find(entry => entry.isIntersecting);
      if (visible) setActiveWinnersTab(winnersPanels.indexOf(visible.target));
    }, { root: winnersTrack, threshold: 0.6 });
    winnersPanels.forEach(panel => winnersObserver.observe(panel));
  }
}
const countUps = [...document.querySelectorAll('[data-count-to]')];
if (countUps.length && 'IntersectionObserver' in window) {
  const countObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      countObserver.unobserve(entry.target);
      const el = entry.target;
      const target = parseInt(el.dataset.countTo, 10);
      if (motion.matches) { el.textContent = target; return; }
      const duration = 1200;
      const start = performance.now();
      function step(now) {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  countUps.forEach(el => countObserver.observe(el));
}
const lightbox = document.getElementById('lightbox');
const momentsPhotos = [...document.querySelectorAll('.moments-grid figure:not(.moments-video) img')];
if (lightbox && momentsPhotos.length) {
  const lbImg = lightbox.querySelector('.lightbox-img');
  let lbIndex = 0;
  function renderLightbox() {
    const img = momentsPhotos[lbIndex];
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
  }
  function openLightbox(index) {
    lbIndex = index;
    renderLightbox();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
  }
  function closeLightbox() {
    lightbox.hidden = true;
    document.body.style.overflow = '';
  }
  function stepLightbox(delta) {
    lbIndex = (lbIndex + delta + momentsPhotos.length) % momentsPhotos.length;
    renderLightbox();
  }
  momentsPhotos.forEach((img, i) => img.addEventListener('click', () => openLightbox(i)));
  lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => stepLightbox(-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => stepLightbox(1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', event => {
    if (lightbox.hidden) return;
    if (event.key === 'Escape') closeLightbox();
    else if (event.key === 'ArrowLeft') stepLightbox(-1);
    else if (event.key === 'ArrowRight') stepLightbox(1);
  });
}
const countdown = document.querySelector('.countdown');
if (countdown) {
  const target = new Date('2026-10-01T09:00:00+05:30').getTime();
  const cd = {
    d: countdown.querySelector('[data-cd="d"]'),
    h: countdown.querySelector('[data-cd="h"]'),
    m: countdown.querySelector('[data-cd="m"]'),
    s: countdown.querySelector('[data-cd="s"]'),
  };
  function pad(n) { return String(n).padStart(2, '0'); }
  function tickCountdown() {
    const diff = target - Date.now();
    if (diff <= 0) {
      cd.d.textContent = cd.h.textContent = cd.m.textContent = cd.s.textContent = '00';
      clearInterval(countdownTimer);
      return;
    }
    const totalSeconds = Math.floor(diff / 1000);
    cd.d.textContent = pad(Math.floor(totalSeconds / 86400));
    cd.h.textContent = pad(Math.floor((totalSeconds % 86400) / 3600));
    cd.m.textContent = pad(Math.floor((totalSeconds % 3600) / 60));
    cd.s.textContent = pad(totalSeconds % 60);
  }
  tickCountdown();
  const countdownTimer = setInterval(tickCountdown, 1000);
}
let scrollFrame = 0;
window.addEventListener('scroll', () => {
  if (!canAnimate() || scrollFrame) return;
  scrollFrame = requestAnimationFrame(() => {
    scrollFrame = 0;
    if (!canAnimate()) return;
    const heroBounds = hero.getBoundingClientRect();
    if (heroBounds.bottom > 0 && heroBounds.top < window.innerHeight) {
      hero.style.setProperty('--scroll-depth', `${Math.min(35, Math.max(0, -heroBounds.top * .055))}px`);
    }
    const bounds = crewArt.getBoundingClientRect();
    if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
      const depth = (window.innerHeight / 2 - bounds.top - bounds.height / 2) * .025;
      crewArt.style.setProperty('--art-depth', `${Math.max(-8, Math.min(8, depth))}px`);
    }
  });
}, { passive: true });
