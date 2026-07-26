/* =========================================================
   Mian Dental Surgery — Modern Interactions
   ========================================================= */

(() => {
  'use strict';

  /* ---------- Loader ---------- */
  window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    if (loader) {
      setTimeout(() => loader.classList.add('hidden'), 600);
    }
  });

  /* ---------- Year ---------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Navbar scroll state ---------- */
  const navbar = document.getElementById('navbar');
  const scrollProgress = document.getElementById('scrollProgress');
  const backTop = document.getElementById('backTop');

  const onScroll = () => {
    const y = window.scrollY;
    if (navbar) navbar.classList.toggle('scrolled', y > 30);
    if (backTop) backTop.classList.toggle('show', y > 600);

    if (scrollProgress) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
      scrollProgress.style.width = pct + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      menuToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        menuToggle.classList.remove('active');
        navLinks.classList.remove('open');
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0', 10);
          setTimeout(() => entry.target.classList.add('visible'), delay);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  reveals.forEach(el => revealObserver.observe(el));

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll('.count');
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.target || '0');
        const decimal = el.dataset.decimal ? parseFloat(el.dataset.decimal) : null;
        const duration = 1800;
        const start = performance.now();

        const tick = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          // easeOutCubic
          const eased = 1 - Math.pow(1 - progress, 3);

          if (decimal !== null) {
            // For "4.9" style: animate from 0 to (target + decimal/10)
            const finalVal = (target + decimal / 10) * eased;
            el.textContent = finalVal.toFixed(1);
          } else {
            const value = Math.floor(target * eased);
            el.textContent = value.toLocaleString('en-US');
          }

          if (progress < 1) {
            requestAnimationFrame(tick);
          } else {
            if (decimal !== null) {
              el.textContent = (target + decimal / 10).toFixed(1);
            } else {
              el.textContent = target.toLocaleString('en-US');
            }
          }
        };
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach(c => counterObserver.observe(c));

  /* ---------- Testimonials slider ---------- */
  const track = document.getElementById('testiTrack');
  const prev = document.getElementById('testiPrev');
  const next = document.getElementById('testiNext');
  const dotsWrap = document.getElementById('testiDots');

  if (track && prev && next && dotsWrap) {
    let index = 0;
    let autoplayId = null;
    const cards = track.querySelectorAll('.testi-card');

    const getPerView = () => {
      if (window.innerWidth <= 768) return 1;
      if (window.innerWidth <= 1024) return 2;
      return 3;
    };

    let perView = getPerView();
    let maxIndex = Math.max(0, cards.length - perView);

    const buildDots = () => {
      dotsWrap.innerHTML = '';
      for (let i = 0; i <= maxIndex; i++) {
        const b = document.createElement('button');
        b.setAttribute('aria-label', `Go to slide ${i + 1}`);
        if (i === index) b.classList.add('active');
        b.addEventListener('click', () => {
          index = i;
          update();
          restartAutoplay();
        });
        dotsWrap.appendChild(b);
      }
    };

    const update = () => {
      const card = cards[0];
      const gap = parseFloat(getComputedStyle(track).gap) || 26;
      const cardWidth = card.offsetWidth + gap;
      track.style.transform = `translateX(${-index * cardWidth}px)`;
      dotsWrap.querySelectorAll('button').forEach((d, i) => {
        d.classList.toggle('active', i === index);
      });
    };

    const nextSlide = () => {
      index = index >= maxIndex ? 0 : index + 1;
      update();
    };
    const prevSlide = () => {
      index = index <= 0 ? maxIndex : index - 1;
      update();
    };

    const startAutoplay = () => {
      autoplayId = setInterval(nextSlide, 4500);
    };
    const stopAutoplay = () => clearInterval(autoplayId);
    const restartAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    next.addEventListener('click', () => { nextSlide(); restartAutoplay(); });
    prev.addEventListener('click', () => { prevSlide(); restartAutoplay(); });

    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // Touch / swipe support
    let startX = 0;
    let isDragging = false;
    track.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      stopAutoplay();
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) nextSlide(); else prevSlide();
      }
      isDragging = false;
      startAutoplay();
    });

    const onResize = () => {
      const newPerView = getPerView();
      if (newPerView !== perView) {
        perView = newPerView;
        maxIndex = Math.max(0, cards.length - perView);
        if (index > maxIndex) index = maxIndex;
        buildDots();
      }
      update();
    };
    window.addEventListener('resize', onResize);

    buildDots();
    update();
    startAutoplay();
  }

  /* ---------- Appointment form -> WhatsApp ---------- */
  const apptForm = document.getElementById('apptForm');
  if (apptForm) {
    apptForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value.trim();
      const phone = document.getElementById('phone').value.trim();
      const service = document.getElementById('service').value;
      const date = document.getElementById('date').value;
      const message = document.getElementById('message').value.trim();

      const prettyDate = date
        ? new Date(date).toLocaleDateString('en-GB', {
            weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
          })
        : 'Not specified';

      const cleanText =
        `*New Appointment Request — Mian Dental Surgery*\n` +
        `------------------------------------\n` +
        `*Name:* ${name}\n` +
        `*Phone:* ${phone}\n` +
        `*Service:* ${service}\n` +
        `*Preferred Date:* ${prettyDate}\n` +
        `*Message:* ${message || '—'}`;

      const finalUrl = `https://wa.me/923214422590?text=${encodeURIComponent(cleanText)}`;
      window.open(finalUrl, '_blank', 'noopener');

      // Visual feedback
      const btn = apptForm.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Opening WhatsApp...';
      btn.disabled = true;
      setTimeout(() => {
        btn.innerHTML = originalHTML;
        btn.disabled = false;
        apptForm.reset();
      }, 2200);
    });

    // Set min date to today
    const dateInput = document.getElementById('date');
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
    }
  }

  /* ---------- Smooth anchor scroll (legacy browsers) ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length > 1) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });

  /* ---------- Subtle parallax on hero image ---------- */
  const heroImgWrap = document.querySelector('.hero-img-wrap');
  if (heroImgWrap && window.matchMedia('(min-width: 1025px)').matches) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < 800) {
        heroImgWrap.style.transform = `translateY(${y * 0.06}px)`;
      }
    }, { passive: true });
  }

  /* ---------- Doctor card tilt ---------- */
  const doctorCards = document.querySelectorAll('.doctor-card');
  doctorCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-10px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ---------- Service card subtle tilt ---------- */
  const serviceCards = document.querySelectorAll('.service-card');
  serviceCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-10px) rotateX(${-y * 3}deg) rotateY(${x * 3}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

})();
