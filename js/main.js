/* ============================================
   COUNTERBENCH ADVISORY — CORE JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // --- NAV SCROLL STATE ---
  const nav = document.querySelector('.nav');
  if (nav) {
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 60);
    });
  }

  // --- MOBILE MENU TOGGLE ---
  const toggle = document.querySelector('.nav__toggle');
  const links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      toggle.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => { links.classList.remove('open'); toggle.classList.remove('open'); });
    });
  }

  // --- HERO ENEMY ROTATION ---
  const rotator = document.getElementById('enemy-rotator');
  if (rotator) {
    const enemies = [
      "Insurance carriers",
      "Defense AI systems",
      "Colossus-trained adjusters"
    ];

    // Respect OS-level reduced motion preference.
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    rotator.textContent = enemies[0];
    rotator.style.opacity = 1;

    if (!reduceMotion) {
      let enemyIndex = 0;
      window.setInterval(() => {
        enemyIndex = (enemyIndex + 1) % enemies.length;
        rotator.style.opacity = 0;

        window.setTimeout(() => {
          rotator.textContent = enemies[enemyIndex];
          rotator.style.opacity = 1;
        }, 220);
      }, 3000);
    }
  }



  // --- FADE-UP ON SCROLL (Intersection Observer) ---
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    fadeEls.forEach(el => observer.observe(el));
  }

  // --- FAQ ACCORDIONS ---
  document.querySelectorAll('.faq-q').forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const wasOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
      // Open clicked (if wasn't already open)
      if (!wasOpen) item.classList.add('open');
    });
  });

  // --- STICKY CTA BAR ---
  const stickyCta = document.querySelector('.sticky-cta');
  if (stickyCta) {
    window.addEventListener('scroll', () => {
      const scrollPct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
      stickyCta.classList.toggle('visible', scrollPct > 0.25 && scrollPct < 0.92);
    });
  }

  // --- SMOOTH SCROLL FOR ANCHOR LINKS ---
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // --- EMAIL FORM HANDLER ---
  document.querySelectorAll('.newsletter-form').forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = form.querySelector('input[type="email"]').value;
      if (!email) return;
      
      // Track event (GTM dataLayer)
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'newsletter_subscribe',
          email_source: form.dataset.source || 'unknown'
        });
      }
      
      // TODO: Replace with actual Kit/Beehiiv API endpoint
      // fetch('https://app.convertkit.com/forms/YOUR_FORM_ID/subscriptions', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email_address: email })
      // });

      // Show success state
      const btn = form.querySelector('button');
      const origText = btn.textContent;
      btn.textContent = 'Subscribed ✓';
      btn.style.background = '#27AE60';
      form.querySelector('input').value = '';
      setTimeout(() => { btn.textContent = origText; btn.style.background = ''; }, 3000);
    });
  });

  // --- TRACK CTA CLICKS ---
  document.querySelectorAll('[data-track]').forEach(el => {
    el.addEventListener('click', () => {
      if (window.dataLayer) {
        window.dataLayer.push({
          event: 'cta_click',
          cta_text: el.dataset.track,
          cta_location: el.dataset.location || 'unknown',
          page: window.location.pathname
        });
      }
    });
  });
});
