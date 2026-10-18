/* ==========================================================================
   JUDE SIMON MANUEL — INTERACTIVE ARTISTIC ENGINE (v2 - Fixed Sticky Scroll)
   Features:
   1. Smooth Lerped Custom Cursor & Hover Expansion
   2. Magnetic Navigation & Action Buttons
   3. Staggered IntersectionObserver Scroll Reveals & Skill Bars
   4. Exact 1:1 Sticky Horizontal Scroll Calculation & Clamping
   5. Subtle 3D Perspective Card Tilt
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    const progressBar = document.querySelector('.progress-bar');
    const horizontalWrapper = document.querySelector('#projects-wrapper');
    const horizontalTrack = document.querySelector('#track');

    // ----------------------------------------------------------------------
    // 1. SMOOTH CUSTOM CURSOR WITH SPRING INERTIA
    // ----------------------------------------------------------------------
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        if (cursorDot) {
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        }
    });

    function animateCursor() {
        ringX += (mouseX - ringX) * 0.18;
        ringY += (mouseY - ringY) * 0.18;

        if (cursorRing) {
            cursorRing.style.left = `${ringX}px`;
            cursorRing.style.top = `${ringY}px`;
        }
        requestAnimationFrame(animateCursor);
    }
    animateCursor();

    const interactiveEls = document.querySelectorAll('a, button, .project-card, .skill-card');
    interactiveEls.forEach((el) => {
        el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
        el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });

    // ----------------------------------------------------------------------
    // 2. MAGNETIC BUTTON MICRO-INTERACTION
    // ----------------------------------------------------------------------
    const magneticEls = document.querySelectorAll('.magnetic');
    magneticEls.forEach((el) => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            el.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = 'translate(0px, 0px)';
        });
    });

    // ----------------------------------------------------------------------
    // 3. SMOOTH NAVIGATION SCROLLING
    // ----------------------------------------------------------------------
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ----------------------------------------------------------------------
    // 4. INTERSECTION OBSERVER FOR REVEALS & SKILL BARS
    // ----------------------------------------------------------------------
    const revealEls = document.querySelectorAll('.reveal-up, .skill-card');
    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        },
        { threshold: 0.15 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));

    // ----------------------------------------------------------------------
    // 5. EXACT STICKY HORIZONTAL SCROLL ENGINE
    // ----------------------------------------------------------------------
    let currentTrackX = 0;
    let targetTrackX = 0;
    let maxTranslate = 0;

    function syncHorizontalDimensions() {
        if (!horizontalWrapper || !horizontalTrack) return;

        if (window.innerWidth > 960) {
            // Calculate exact horizontal overflow distance so every card scrolls fully into view
            const trackWidth = horizontalTrack.scrollWidth;
            const viewportWidth = window.innerWidth;
            maxTranslate = Math.max(0, trackWidth - viewportWidth + 60);

            // Set wrapper vertical height = 100vh + exact horizontal scroll distance
            horizontalWrapper.style.height = `${window.innerHeight + maxTranslate}px`;
        } else {
            horizontalWrapper.style.height = 'auto';
            maxTranslate = 0;
            targetTrackX = 0;
            currentTrackX = 0;
            horizontalTrack.style.transform = 'none';
        }
    }

    function updateScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;

        if (progressBar) {
            progressBar.style.width = `${scrollPercent}%`;
        }

        if (horizontalWrapper && horizontalTrack && window.innerWidth > 960) {
            const wrapperRect = horizontalWrapper.getBoundingClientRect();
            const scrollableDistance = horizontalWrapper.offsetHeight - window.innerHeight;

            if (scrollableDistance > 0) {
                // Clamp progress strictly between 0 and 1 so it never stops early
                const rawProgress = -wrapperRect.top / scrollableDistance;
                const clampedProgress = Math.min(1, Math.max(0, rawProgress));
                targetTrackX = -clampedProgress * maxTranslate;
            }
        }
    }

    function smoothHorizontalLoop() {
        if (horizontalTrack && window.innerWidth > 960) {
            currentTrackX += (targetTrackX - currentTrackX) * 0.12;
            horizontalTrack.style.transform = `translate3d(${currentTrackX.toFixed(2)}px, 0, 0)`;
        }
        requestAnimationFrame(smoothHorizontalLoop);
    }

    window.addEventListener('resize', () => {
        syncHorizontalDimensions();
        updateScroll();
    });
    window.addEventListener('load', () => {
        syncHorizontalDimensions();
        updateScroll();
    });

    syncHorizontalDimensions();
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    smoothHorizontalLoop();

    // ----------------------------------------------------------------------
    // 6. SUBTLE 3D PERSPECTIVE TILT ON CARDS
    // ----------------------------------------------------------------------
    const tiltCards = document.querySelectorAll('.tilt-card');
    tiltCards.forEach((card) => {
        card.addEventListener('mousemove', (e) => {
            if (window.innerWidth <= 960) return;
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -3.5;
            const rotateY = ((x - centerX) / centerX) * 3.5;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    });
});
