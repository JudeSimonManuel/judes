/* ==========================================================================
 * JUDE SIMON MANUEL — COMPLETE INTERACTIVE ENGINE (3D CARD SWAP EDITION)
 * ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');
    const progressBar = document.querySelector('.progress-bar');
    const horizontalTrack = document.querySelector('#track');

    // ----------------------------------------------------------------------
    // 1. SMOOTH CUSTOM CURSOR
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
    // 2. MAGNETIC BUTTONS
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
    // 4. SCROLL REVEALS & SKILL BARS
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
        { threshold: 0.12 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));

    // ----------------------------------------------------------------------
    // 5. TOP PROGRESS BAR & 3D CARD SWAP STACK
    // ----------------------------------------------------------------------
    function updateScroll() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (progressBar && docHeight > 0) {
            progressBar.style.width = `${(scrollTop / docHeight) * 100}%`;
        }
    }
    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();

    if (horizontalTrack) {
        let cards = Array.from(horizontalTrack.querySelectorAll('.project-card'));
        // Ensure tilt-card class doesn't interfere with 3D stack transforms
        cards.forEach((c) => c.classList.remove('tilt-card'));

        let isAnimating = false;
        let autoSwapTimer = null;

        function getStackCoords(i) {
            return {
                x: i * 18,
                y: i * -20,
                z: i * -55,
                rot: i * 3,
                scale: 1 - i * 0.05,
                opacity: i > 3 ? 0 : 1 - i * 0.16
            };
        }

        function layoutStack() {
            cards.forEach((card, i) => {
                const s = getStackCoords(i);
                card.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.65s ease';
                card.style.zIndex = String(cards.length - i);
                card.style.transform = `translate3d(${s.x}px, ${s.y}px, ${s.z}px) rotateZ(${s.rot}deg) scale(${s.scale})`;
                card.style.opacity = String(s.opacity);
                card.style.pointerEvents = i === 0 ? 'auto' : 'none';
            });
        }

        function swapFrontToBack(flingX = 0, flingY = 0) {
            if (isAnimating || cards.length < 2) return;
            isAnimating = true;

            const frontCard = cards[0];
            const backSlot = getStackCoords(cards.length - 1);
            const dir = flingX < -15 ? -1 : 1;

            const peakX = flingX !== 0
            ? flingX + dir * Math.max(90, 140 - Math.abs(flingX) * 0.3)
            : 140;
            const peakY = flingY !== 0
            ? Math.min(flingY - 50, -80)
            : -110;
            const startRot = flingX * 0.06;

            // Advance remaining cards forward one slot
            cards.slice(1).forEach((card, idx) => {
                const s = getStackCoords(idx);
                card.style.transition = 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.65s ease';
                card.style.zIndex = String(cards.length - idx);
                card.style.transform = `translate3d(${s.x}px, ${s.y}px, ${s.z}px) rotateZ(${s.rot}deg) scale(${s.scale})`;
                card.style.opacity = String(s.opacity);
            });

            // Stage 1: Throw outward from exact release point
            frontCard.style.transition = 'transform 0.26s cubic-bezier(0.2, 0.8, 0.4, 1), opacity 0.26s ease';
            frontCard.style.transform = `translate3d(${peakX}px, ${peakY}px, 40px) rotateZ(${dir * 14}deg) scale(0.95)`;
            frontCard.style.opacity = '0.85';

            // Stage 2: Tuck behind the stack into back slot
            setTimeout(() => {
                frontCard.style.zIndex = '1';
                frontCard.style.transition = 'transform 0.38s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.38s ease';
                frontCard.style.transform = `translate3d(${backSlot.x}px, ${backSlot.y}px, ${backSlot.z}px) rotateZ(${backSlot.rot}deg) scale(${backSlot.scale})`;
                frontCard.style.opacity = String(backSlot.opacity);
            }, 250);

            // Stage 3: Finalize order
            setTimeout(() => {
                cards.push(cards.shift());
                layoutStack();
                isAnimating = false;
            }, 640);
        }

        function resetTimer() {
            clearInterval(autoSwapTimer);
            autoSwapTimer = setInterval(() => swapFrontToBack(0, 0), 4000);
        }

        let startX = 0, startY = 0, deltaX = 0, deltaY = 0, isDragging = false;

        horizontalTrack.addEventListener('pointerdown', (e) => {
            if (isAnimating || e.target.closest('a')) return;
            const frontCard = cards[0];
            if (!frontCard.contains(e.target)) return;

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            deltaX = 0;
            deltaY = 0;
            frontCard.style.transition = 'none';
            if (frontCard.setPointerCapture) {
                try { frontCard.setPointerCapture(e.pointerId); } catch (_) {}
            }
            clearInterval(autoSwapTimer);
        });

        window.addEventListener('pointermove', (e) => {
            if (!isDragging) return;
            deltaX = e.clientX - startX;
            deltaY = e.clientY - startY;
            cards[0].style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) rotateZ(${deltaX * 0.06}deg)`;
        });

        function endDrag() {
            if (!isDragging) return;
            isDragging = false;

            const distance = Math.hypot(deltaX, deltaY);
            if (distance > 65) {
                swapFrontToBack(deltaX, deltaY);
            } else if (distance < 6) {
                swapFrontToBack(0, 0);
            } else {
                layoutStack();
            }
            resetTimer();
        }

        window.addEventListener('pointerup', endDrag);
        window.addEventListener('pointercancel', endDrag);
        horizontalTrack.addEventListener('mouseenter', () => clearInterval(autoSwapTimer));
        horizontalTrack.addEventListener('mouseleave', () => { if (!isDragging) resetTimer(); });

        layoutStack();
        resetTimer();
    }

    // ----------------------------------------------------------------------
    // 6. SUBTLE 3D PERSPECTIVE TILT ON OTHER CARDS
    // ----------------------------------------------------------------------
    const tiltCards = document.querySelectorAll('.tilt-card:not(.project-card)');
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
