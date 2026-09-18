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
