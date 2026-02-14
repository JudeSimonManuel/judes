document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. Global Scroll Progress ---
    const progressBar = document.querySelector('.progress-bar');
    window.addEventListener('scroll', () => {
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const progress = (window.scrollY / totalHeight) * 100;
        progressBar.style.width = `${progress}%`;
    });

    // --- 2. Hero to About Transition ---
    const stickyContainer = document.querySelector('.sticky-container');
    const hero = document.getElementById('hero');
    const about = document.getElementById('about');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const viewHeight = window.innerHeight;
        const stickyHeight = stickyContainer.offsetHeight;

        // Calculate progress within the sticky container (0 to 1)
        // We trigger the switch halfway through the sticky duration
        if (scrollY < stickyHeight) {
            const progress = Math.min(scrollY / viewHeight, 1.5); 
            
            // Fade out Hero
            hero.style.opacity = Math.max(1 - progress * 1.5, 0);
            hero.style.transform = `scale(${1 - progress * 0.1})`;
            hero.style.filter = `blur(${progress * 10}px)`;

            // Fade in About
            if (progress > 0.6) {
                const aboutProgress = (progress - 0.6) * 2; // Normalize 0 to 1
                about.style.opacity = Math.min(aboutProgress, 1);
                about.style.transform = `translateY(${100 - (aboutProgress * 100)}px) scale(1)`;
                about.style.pointerEvents = 'all';
            } else {
                about.style.opacity = 0;
                about.style.pointerEvents = 'none';
            }
        }
    });

    // --- 3. Horizontal Scroll Logic ---
    const track = document.getElementById('track');
    const projectsWrapper = document.getElementById('projects-wrapper');

    window.addEventListener('scroll', () => {
        const wrapperTop = projectsWrapper.offsetTop;
        const wrapperHeight = projectsWrapper.offsetHeight;
        const viewHeight = window.innerHeight;
        const scrollY = window.scrollY;

        // Check if we are currently looking at the projects section
        if (scrollY >= wrapperTop && scrollY <= (wrapperTop + wrapperHeight - viewHeight)) {
            // How far have we scrolled into the wrapper?
            const distance = scrollY - wrapperTop;
            const maxScroll = wrapperHeight - viewHeight;
            const percentage = distance / maxScroll;

            // Move track left. We calculate the width of the track minus the viewport width
            const trackWidth = track.scrollWidth;
            const moveAmount = percentage * (trackWidth - window.innerWidth + 200); // +200 for padding
            
            track.style.transform = `translateX(-${moveAmount}px)`;
        }
    });

    // --- 4. 3D Tilt Effect on Cards ---
    const tiltCards = document.querySelectorAll('.tilt-card,.about-card');

    tiltCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // Mouse X inside element
            const y = e.clientY - rect.top;  // Mouse Y inside element
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            // Calculate rotation (limit to +/- 15 degrees)
            const rotateX = ((y - centerY) / centerY) * -10; 
            const rotateY = ((x - centerX) / centerX) * 10;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            // Reset position
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            card.style.transition = 'transform 0.5s ease';
        });

        card.addEventListener('mouseenter', () => {
            card.style.transition = 'none'; // Remove transition for instant follow
        });
    });

    // --- 5. Nav Button Logic (Smooth Scroll) ---
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            let targetSection;

            if(targetId === 'hero') targetSection = 0;
            if(targetId === 'skills') targetSection = document.getElementById('skills').offsetTop;
            if(targetId === 'projects') targetSection = document.getElementById('projects-wrapper').offsetTop;
            if(targetId === 'contact') targetSection = document.getElementById('contact').offsetTop;

            window.scrollTo({
                top: targetSection,
                behavior: 'smooth'
            });
        });
    });

});
const point = document.querySelector('.cursor-point');
const glow = document.querySelector('.cursor-glow');

window.addEventListener('mousemove', (e) => {
    const x = e.clientX;
    const y = e.clientY;

    // Move the point instantly
    point.style.transform = `translate(${x}px, ${y}px)`;
    
    // Move the glow with a tiny delay (via CSS transition) for a "fluid" feel
    glow.style.transform = `translate(${x - 20}px, ${y - 20}px)`; 
});

// Add interaction for buttons and links
const interactables = document.querySelectorAll('button, a, .nav-btn, .project-card');

interactables.forEach(el => {
    el.addEventListener('mouseenter', () => {
        glow.style.width = '80px';
        glow.style.height = '80px';
        glow.style.opacity = '0.8';
        glow.style.background = 'var(--secondary)'; // Glow changes color on hover
    });
    
    el.addEventListener('mouseleave', () => {
        glow.style.width = '40px';
        glow.style.height = '40px';
        glow.style.opacity = '0.5';
        glow.style.background = 'var(--primary)';
    });
});

// Click animation
window.addEventListener('mousedown', () => glow.classList.add('cursor-clicking'));
window.addEventListener('mouseup', () => glow.classList.remove('cursor-clicking'));
document.addEventListener('DOMContentLoaded', () => {
    const point = document.querySelector('.cursor-point');
    const glow = document.querySelector('.cursor-glow');

    window.addEventListener('mousemove', (e) => {
        // Use requestAnimationFrame for smoother performance
        window.requestAnimationFrame(() => {
            point.style.left = e.clientX + 'px';
            point.style.top = e.clientY + 'px';
            
            // Offset the glow so it's centered (40px width / 2 = 20)
            glow.style.left = (e.clientX - 20) + 'px';
            glow.style.top = (e.clientY - 20) + 'px';
        });
    });
});