/* ============================================
   EduConnect - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Lucide Icons
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  }

  // ---------- Theme Toggle (Dark / Light) ----------
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Load saved theme or system preference
  const savedTheme = localStorage.getItem('educonnect-theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (systemDark ? 'dark' : 'light');

  html.setAttribute('data-theme', initialTheme);

  themeToggle?.addEventListener('click', () => {
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('educonnect-theme', next);

    // Re-create icons after theme change
    if (typeof lucide !== 'undefined') {
      lucide.createIcons();
    }
  });

  // ---------- Mobile Menu ----------
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  menuToggle?.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close menu when clicking a link
  navLinks?.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      menuToggle?.setAttribute('aria-expanded', 'false');
    });
  });

  // ---------- Carousel ----------
  const track = document.getElementById('carouselTrack');
  const dots = document.querySelectorAll('.dot');
  let currentSlide = 0;
  const totalSlides = dots.length;
  let autoplayInterval;

  function goToSlide(index) {
    currentSlide = (index + totalSlides) % totalSlides;
    if (track) {
      track.style.transform = `translateX(-${currentSlide * 100}%)`;
    }
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 3000);
  }

  function stopAutoplay() {
    clearInterval(autoplayInterval);
  }

  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const index = parseInt(dot.dataset.index, 10);
      goToSlide(index);
      stopAutoplay();
      startAutoplay();
    });
  });

  // Pause on hover
  const carousel = document.getElementById('carousel');
  carousel?.addEventListener('mouseenter', stopAutoplay);
  carousel?.addEventListener('mouseleave', startAutoplay);

  // Start autoplay
  startAutoplay();

  // ---------- PWA Install Button ----------
  const installBtn = document.getElementById('installBtn');
  let deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn?.classList.add('available');
  });

  installBtn?.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log('Install outcome:', outcome);
      deferredPrompt = null;
    } else {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                           window.navigator.standalone === true;

      if (isStandalone) {
        alert('O aplicativo já está instalado!');
      } else {
        alert('Para instalar o EduConnect:\n\n• No Chrome/Edge: clique no ícone de instalação na barra de endereço\n• No Safari (iOS): toque em Compartilhar → Adicionar à Tela de Início');
      }
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    console.log('EduConnect PWA instalado com sucesso!');
  });

  // ---------- Smooth scroll for CTA ----------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ---------- Header shadow on scroll ----------
  const header = document.getElementById('header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 20) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // ---------- Intersection Observer for subtle animations ----------
  const observerOptions = {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.feature-card, .process-card, .about-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // Add visible class styles dynamically
  const style = document.createElement('style');
  style.textContent = `
    .feature-card.visible,
    .process-card.visible,
    .about-card.visible {
      opacity: 1 !important;
      transform: translateY(0) !important;
    }
  `;
  document.head.appendChild(style);

  // ---------- Service Worker Registration (basic PWA) ----------
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => console.log('Service Worker registrado:', reg.scope))
        .catch(err => console.log('SW registration failed:', err));
    });
  }
});