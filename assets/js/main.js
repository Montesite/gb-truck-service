document.body.classList.add('loaded');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const bar = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
}, { passive: true });

// Parallax leve nos fundos de foto das seções escuras
const parallaxImgs = Array.from(document.querySelectorAll('.bg-photo img'));
if (parallaxImgs.length && !reduceMotion) {
  let parallaxTicking = false;
  function updateParallax() {
    const vh = window.innerHeight;
    parallaxImgs.forEach(img => {
      const rect = img.parentElement.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > vh + 100) return;
      const centerOffset = (rect.top + rect.height / 2) - vh / 2;
      const offset = Math.max(-40, Math.min(40, centerOffset * -0.08));
      img.style.transform = `translateY(${offset.toFixed(1)}px) scale(1.15)`;
    });
    parallaxTicking = false;
  }
  window.addEventListener('scroll', () => {
    if (!parallaxTicking) { requestAnimationFrame(updateParallax); parallaxTicking = true; }
  }, { passive: true });
  updateParallax();
}

const backToTop = document.getElementById('backToTop');
window.addEventListener('scroll', () => {
  backToTop.classList.toggle('visible', window.scrollY > 700);
}, { passive: true });
backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Barra fixa de WhatsApp (mobile): só aparece depois que o hero sai de tela,
// pra nunca cobrir o conteúdo do hero em nenhuma altura de aparelho.
const mobileCtaBar = document.querySelector('.mobile-cta-bar');
if (mobileCtaBar) {
  const heroSection = document.getElementById('inicio');
  if (heroSection) {
    const heroObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        mobileCtaBar.classList.toggle('visible', !entry.isIntersecting);
      });
    }, { threshold: 0, rootMargin: '-1px 0px 0px 0px' });
    heroObserver.observe(heroSection);
  } else {
    mobileCtaBar.classList.add('visible');
  }
}

const header = document.getElementById('header');
const mobileNavEl = document.getElementById('mobileNav');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 40);
  mobileNavEl.style.top = header.offsetHeight + 'px';
}, { passive: true });

const toggle = document.getElementById('menuToggle');
const mNav   = document.getElementById('mobileNav');
const spans  = toggle.querySelectorAll('span');
toggle.addEventListener('click', () => {
  const open = mNav.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
  if (open) {
    spans[0].style.cssText = 'transform:rotate(45deg) translate(5px,5px)';
    spans[1].style.cssText = 'opacity:0;transform:scaleX(0)';
    spans[2].style.cssText = 'transform:rotate(-45deg) translate(5px,-5px)';
  } else {
    spans.forEach(s => s.style.cssText = '');
  }
});
document.querySelectorAll('.mobile-link').forEach(l => {
  l.addEventListener('click', () => {
    mNav.classList.remove('open');
    spans.forEach(s => s.style.cssText = '');
    toggle.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const nome     = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const assunto  = document.getElementById('assunto').value;
    const mensagem = document.getElementById('mensagem').value.trim();
    if (!nome || !telefone) { alert('Por favor, preencha nome e telefone.'); return; }
    const labels = {
      pecas: 'Peças para linha pesada', lubrificantes: 'Óleos lubrificantes', arla32: 'Arla 32',
      manutencao: 'Manutenção / oficina', frotas: 'Atendimento a frotas e empresas', licitacao: 'Compras corporativas / licitação', outro: 'Outro assunto'
    };
    let msg = `Olá! Vim pelo site da GB Truck Service e gostaria de saber mais.\n\n`;
    msg += `*Nome:* ${nome}\n*Telefone:* ${telefone}\n`;
    if (assunto)  msg += `*Assunto:* ${labels[assunto] || assunto}\n`;
    if (mensagem) msg += `\n*Mensagem:* ${mensagem}`;
    window.open(`https://wa.me/5544997066849?text=${encodeURIComponent(msg)}`, '_blank');
  });
}

// Galeria: carrossel de imagem única com autoplay + lightbox ao clicar
const galeriaStage = document.getElementById('galeriaStage');
if (galeriaStage) {
  const slides = Array.from(galeriaStage.querySelectorAll('.galeria-slide'));
  const dots = Array.from(document.querySelectorAll('#galeriaDots .galeria-dot'));
  const prevBtn = document.getElementById('galeriaPrev');
  const nextBtn = document.getElementById('galeriaNext');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');

  let current = 0;
  let timer = null;
  const AUTOPLAY_MS = 3000;

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('is-active', i === current));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    if (lightbox.classList.contains('is-open')) updateLightboxImage();
  }
  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  function startAutoplay() {
    if (reduceMotion) return;
    stopAutoplay();
    timer = setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  if (prevBtn) prevBtn.addEventListener('click', () => { prev(); startAutoplay(); });
  if (nextBtn) nextBtn.addEventListener('click', () => { next(); startAutoplay(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); startAutoplay(); }));

  galeriaStage.addEventListener('mouseenter', stopAutoplay);
  galeriaStage.addEventListener('mouseleave', startAutoplay);

  function updateLightboxImage() {
    const img = slides[current].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
  }
  function openLightbox(index) {
    goTo(index);
    updateLightboxImage();
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    stopAutoplay();
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    startAutoplay();
  }

  slides.forEach((slide, i) => slide.addEventListener('click', () => openLightbox(i)));
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prev);
  if (lightboxNext) lightboxNext.addEventListener('click', next);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });

  startAutoplay();
}
const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

// Reveal ao rolar, com stagger nas grades de cards
document.querySelectorAll('.mvv-grid, .mercado-grid, .servicos-grid, .dif-grid, .valores-list, .faq-list, .footer-grid, .processo-grid').forEach(group => {
  Array.from(group.children).forEach((el, i) => {
    el.classList.add('reveal');
    if (i > 0) el.style.transitionDelay = (i * 80) + 'ms';
  });
});
document.querySelectorAll('.section-head, .sobre-text, .sobre-photo, .contato-info, .contato-form, .arla-strip, .hero-visual').forEach(el => {
  el.classList.add('reveal');
});
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// Scrollspy: destaca o link do menu conforme a seção visível
const spySections = document.querySelectorAll('section[id]');
const spyLinks = document.querySelectorAll('nav a[href^="#"], .mobile-nav a[href^="#"]');
const spyObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      spyLinks.forEach(link => {
        link.classList.toggle('nav-active', link.getAttribute('href') === '#' + id);
      });
    }
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
spySections.forEach(sec => spyObserver.observe(sec));

// Tilt 3D leve nos cards (desktop)
function applyTilt(selector, maxTilt) {
  document.querySelectorAll(selector).forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(700px) rotateX(${(-y * maxTilt).toFixed(2)}deg) rotateY(${(x * maxTilt).toFixed(2)}deg) translateY(-4px)`;
    }, { passive: true });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });
}
if (canHover && !reduceMotion) {
  applyTilt('.servico-card', 4);
  applyTilt('.dif-card', 3);
}

// Ripple de clique nos botões principais
document.querySelectorAll('.ripple-el').forEach(btn => {
  btn.addEventListener('click', function(e) {
    if (reduceMotion) return;
    const rect = btn.getBoundingClientRect();
    const wave = document.createElement('span');
    const size = Math.max(rect.width, rect.height) * 1.4;
    wave.className = 'ripple-wave';
    wave.style.width = wave.style.height = size + 'px';
    wave.style.left = (e.clientX - rect.left - size / 2) + 'px';
    wave.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(wave);
    wave.addEventListener('animationend', () => wave.remove());
  });
});
