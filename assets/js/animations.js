// Animations: Lottie (JSON) players + GSAP intro and scroll reveals.
// Every part checks that its library loaded, so the page still works without them.

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// --- Lottie ---------------------------------------------------------------
// Any element with data-lottie="path/to/file.json" becomes a player.
// Optional attributes: data-loop, data-autoplay="false".
const players = [];

if (window.lottie) {
  document.querySelectorAll('[data-lottie]').forEach((el) => {
    const player = lottie.loadAnimation({
      container: el,
      renderer: 'svg',
      path: el.dataset.lottie,
      loop: el.hasAttribute('data-loop'),
      autoplay: !reduceMotion && el.dataset.autoplay !== 'false',
    });
    players.push(player);
  });
}

// --- Preloader ------------------------------------------------------------
const preloader = document.querySelector('.preloader');

let preloaderDone = false;

function hidePreloader() {
  if (!preloader || preloaderDone) return;
  preloaderDone = true;
  preloader.classList.add('hidden');
  // Stop the loader animation once it is out of sight.
  const loader = players.find((p) => preloader.contains(p.wrapper));
  setTimeout(() => {
    if (loader) loader.destroy();
    preloader.remove();
  }, 500);
}

window.addEventListener('load', hidePreloader);
// Safety net in case an asset hangs.
setTimeout(hidePreloader, 4000);

// --- GSAP -----------------------------------------------------------------
if (window.gsap && !reduceMotion) {
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // Hero intro
  gsap.from('[data-hero]', {
    y: 30, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.12, delay: 0.3,
  });
  gsap.from('.hero-anim', { scale: 0.85, opacity: 0, duration: 1, ease: 'power2.out', delay: 0.3 });

  // Scroll reveals
  if (window.ScrollTrigger) {
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      gsap.from(el, {
        y: 40, opacity: 0, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    });
  }
}
