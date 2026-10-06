/* ============================================================
   PRO EVENT & EXHIBITION — MAIN SCRIPT
   ============================================================ */

/* ---- Navigation: hide on scroll down, show on scroll up -- */
const nav = document.getElementById('nav');
const backToTop = document.getElementById('backToTop');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const y = window.scrollY;

    nav.classList.toggle('scrolled', y > 60);

    if (y < 100) {
        // Always show at the top
        nav.classList.remove('nav--hidden');
    } else {
        // Hide when scrolling down, show when scrolling up
        nav.classList.toggle('nav--hidden', y > lastScrollY);
    }

    lastScrollY = y;

    if (backToTop) backToTop.classList.toggle('visible', y > 400);
}, { passive: true });

/* ---- FAQ accordion --------------------------------------- */
document.querySelectorAll('.faq__question').forEach(btn => {
    btn.addEventListener('click', () => {
        const item = btn.closest('.faq__item');
        const isOpen = item.classList.contains('open');
        // Close all
        document.querySelectorAll('.faq__item.open').forEach(el => {
            el.classList.remove('open');
            el.querySelector('.faq__question').setAttribute('aria-expanded', 'false');
        });
        // Open clicked if it was closed
        if (!isOpen) {
            item.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
        }
    });
});

/* ---- Back to top ----------------------------------------- */
if (backToTop) {
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ---- Mobile menu ----------------------------------------- */
const hamburger    = document.getElementById('hamburger');
const mobileMenu   = document.getElementById('mobileMenu');
const mobileClose  = document.getElementById('mobileClose');

function openMenu() {
    mobileMenu.classList.add('open');
    document.body.style.overflow = 'hidden';
}
function closeMenu() {
    mobileMenu.classList.remove('open');
    document.body.style.overflow = '';
}

hamburger.addEventListener('click', openMenu);
mobileClose.addEventListener('click', closeMenu);

// Close on any mobile link click
document.querySelectorAll('.nav__mobile-link').forEach(link => {
    link.addEventListener('click', closeMenu);
});

// Close on Escape key
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
});

/* ---- Smooth scroll for all anchor links ------------------ */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const offset = nav.offsetHeight + 16;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    });
});

/* ---- Scroll-reveal (fade-up) ----------------------------- */
const revealObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

document.querySelectorAll('.fade-up').forEach(el => revealObserver.observe(el));

/* ---- Counter animation ----------------------------------- */
function runCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 2000; // ms
    const fps      = 60;
    const steps    = (duration / 1000) * fps;
    const increment = target / steps;
    let current = 0;

    const tick = () => {
        current += increment;
        if (current >= target) {
            el.textContent = target;
            return;
        }
        el.textContent = Math.floor(current);
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver(
    entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    },
    { threshold: 0.6 }
);

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

/* ---- Expertise progress bars ----------------------------- */
const expertiseFills = document.querySelectorAll('.svc-expertise__fill');
if (expertiseFills.length) {
    const barObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.width = entry.target.dataset.width + '%';
                barObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.4 });
    expertiseFills.forEach(el => barObserver.observe(el));
}

/* ---- Portfolio filter ------------------------------------ */
const filterBtns     = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        portfolioItems.forEach(item => {
            const show = filter === 'all' || item.dataset.category === filter;
            item.style.display = show ? '' : 'none';
        });
    });
});

/* ---- Hero glow parallax ---------------------------------- */
const heroGlow1 = document.querySelector('.hero__glow--1');
const heroGlow2 = document.querySelector('.hero__glow--2');

window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (heroGlow1) heroGlow1.style.transform = `translate(-50%, calc(-50% + ${y * 0.15}px))`;
    if (heroGlow2) heroGlow2.style.transform = `translateY(${y * 0.08}px)`;
}, { passive: true });

/* ---- WhatsApp conversion tracking ------------------------ */
document.querySelectorAll('a[href*="wa.me/60189023676"]').forEach(link => {
    link.addEventListener('click', () => {
        if (typeof window.gtag === 'function') {
            window.gtag('event', 'conversion', {
                send_to: 'AW-18476545759/6DdaCP7gvY0dEN_tpupE'
            });
        }
    });
});

/* ---- Contact form ---------------------------------------- */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const formError   = document.getElementById('formError');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        formSuccess.hidden = true;
        formError.hidden   = true;

        const submitBtn = contactForm.querySelector('.form-submit');
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending…';

        // Formspree — Website Enquiries routes to proeventexhibitworks@gmail.com
        let success = false;
        try {
            const data = new FormData(contactForm);
            data.append('_replyto', data.get('email'));
            data.append('_subject', `New Enquiry: ${data.get('service') || 'General'} — Pro Event & Exhibition`);
            const res = await fetch('https://formspree.io/f/xrpebgpd', {
                method: 'POST',
                body: data,
                headers: { Accept: 'application/json' }
            });
            success = res.ok;
        } catch (err) {
            success = false;
        }

        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;

        if (success) {
            formSuccess.hidden = false;
            contactForm.reset();
            // Record an enquiry conversion only after Formspree accepts the submission.
            if (typeof window.gtag === 'function') {
                window.gtag('event', 'conversion', {
                    send_to: 'AW-18476545759/YR5DCIv0x40dEN_tpupE'
                });
            }
        } else {
            formError.hidden = false;
        }
    });
}

/* ---- Hamburger icon animation ---------------------------- */
hamburger.addEventListener('click', () => {
    const spans = hamburger.querySelectorAll('span');
    if (mobileMenu.classList.contains('open')) {
        spans[0].style.cssText = 'transform: rotate(45deg) translate(5px, 5px)';
        spans[1].style.cssText = 'opacity: 0';
        spans[2].style.cssText = 'transform: rotate(-45deg) translate(5px, -5px)';
    }
});
mobileClose.addEventListener('click', () => {
    const spans = hamburger.querySelectorAll('span');
    spans.forEach(s => s.style.cssText = '');
});
