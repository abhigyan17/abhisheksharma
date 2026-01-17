document.addEventListener('DOMContentLoaded', () => {
    // Current Year Update
    document.getElementById('year').textContent = new Date().getFullYear();

    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links li a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Scroll Animations (Intersection Observer)
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Add floating effect to children (.timeline-content) if applicable
                const content = entry.target.querySelector('.timeline-content');
                if (content) {
                    content.classList.add('floating');
                }
            }
        });
    }, observerOptions);

    const hiddenElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
    hiddenElements.forEach((el) => observer.observe(el));

    // --- Scroll Scrubbing Animation ---
    const scrubItems = document.querySelectorAll('.scrub-item');

    function animateScrub() {
        const triggerBottom = window.innerHeight * 0.9;
        const triggerTop = window.innerHeight * 0.1;

        scrubItems.forEach(item => {
            const boxTop = item.getBoundingClientRect().top;
            const boxBottom = item.getBoundingClientRect().bottom;
            const direction = item.getAttribute('data-direction');

            // Calculate progress: 0 when just entering view, 1 when fully centered/visible
            // We wan full visibility around center of screen

            let progress = 0;
            const windowHeight = window.innerHeight;

            // Map position to a -1 to 1 range relative to center
            // 0 is center, 1 is bottom, -1 is top (roughly)
            const position = (boxTop + item.clientHeight / 2 - windowHeight / 2) / (windowHeight / 2);

            // We want translation to be 0 at position 0 (center)
            // And e.g. 100px at position 1 (bottom) or -1 (top)

            // Simple logic:
            // If item is below viewport, opaque & translated away
            // As it comes up (position decreases), translate -> 0 and opacity -> 1

            // Let's use a simpler range for visual smoothness
            // Start animating when top < windowHeight
            // Finish when top < windowHeight * 0.7 or so

            let offset = 0;
            let opacity = 0;

            const startY = windowHeight;    // Enters at bottom
            const endY = windowHeight * 0.5; // Fully viewing at center

            if (boxTop < startY && boxBottom > 0) {
                // Item is in viewport
                // Calculate normalized progress (0 at startY, 1 at endY)
                let norm = (startY - boxTop) / (startY - endY);
                if (norm > 1) norm = 1; // Cap at 1 (center)
                // Or we can let it go past 1 if we want it to exit cleanly too, but usually entering is key

                opacity = norm;
                // 150px initial offset -> 0px at center
                offset = 150 * (1 - norm);
            } else if (boxTop >= startY) {
                // Below viewport
                opacity = 0;
                offset = 150;
            } else {
                // Above viewport / centered
                // Keep it visible
                opacity = 1;
                offset = 0;
            }

            let translateVal = 0;
            if (direction === 'left') {
                translateVal = -offset;
            } else {
                translateVal = offset;
            }

            item.style.transform = `translateX(${translateVal}px)`;
            item.style.opacity = opacity;

            // Re-apply float if fully visible
            const content = item.querySelector('.timeline-content');
            if (opacity > 0.9 && content) {
                content.classList.add('floating');
            }
        });

        requestAnimationFrame(animateScrub); // Use RAF for smoother scrub
    }

    // Call animateScrub on scroll
    // Better to just run it on RAF loop for smoothest scrub feeling or on scroll event
    window.addEventListener('scroll', animateScrub);
    animateScrub(); // Initial check

    // Active Navigation Link Highlighting
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === `#${current}`) {
                a.classList.add('active');
            }
        });
    });

    // --- Typewriter Effect ---
    const typeWriterElement = document.getElementById('typewriter');
    const texts = ["Cyber Security Consultant", "Red Teamer", "AI Security Researcher", "IoT Security Expert"];
    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typeSpeed = 100;

    // Optimized Font Scaling using Offscreen Canvas
    // This prevents layout thrashing by calculating size BEFORE rendering
    function getOptimalFontSize(text, maxWidth, fontFace, initialSize) {
        const canvas = getOptimalFontSize.canvas || (getOptimalFontSize.canvas = document.createElement('canvas'));
        const context = canvas.getContext('2d');

        let size = initialSize;

        // Loop down until it fits
        // We use a simple decrement loop for accuracy over binary search for this range
        while (size > 10) {
            context.font = `${size}px ${fontFace}`;
            const width = context.measureText(text).width;
            if (width <= maxWidth) {
                return size;
            }
            size -= 1; // Decrease by 1px steps
        }
        return size;
    }

    function type() {
        const currentText = texts[textIndex];

        // --- Pre-Calculation Phase ---
        // Run this ONLY at the start of a new word (or very first run)
        if (charIndex === 0 && !isDeleting) {
            const parent = typeWriterElement.parentElement;
            // Use slightly less than full width to be safe (padding/margin safety)
            const maxW = parent.clientWidth - 10;

            // Get standard style from computed style (or assume base)
            // We can check the element's default sized definition by temporarily resetting
            // but strictly reading computed might return the *previously* shrunk size if not reset.

            typeWriterElement.style.fontSize = ''; // Reset to default
            const computed = window.getComputedStyle(typeWriterElement);
            const baseSize = parseFloat(computed.fontSize);
            const fontFamily = computed.fontFamily;

            const newSize = getOptimalFontSize(currentText, maxW, fontFamily, baseSize);
            typeWriterElement.style.fontSize = `${newSize}px`;
        }

        if (isDeleting) {
            typeWriterElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
            typeSpeed = 50;
        } else {
            typeWriterElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
            typeSpeed = 100;
        }

        // Removed dynamic check (handled by pre-calc)

        if (!isDeleting && charIndex === currentText.length) {
            isDeleting = true;
            typeSpeed = 2000; // Pause at end
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            typeSpeed = 500; // Pause before new word

        }

        setTimeout(type, typeSpeed);
    }

    // Start Typewriter
    if (typeWriterElement) {
        type();
    }

    // --- Particle Network Animation ---
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particlesArray;
    let mouse = {
        x: null,
        y: null,
        radius: (canvas.height / 80) * (canvas.width / 80) // Interaction radius
    };

    window.addEventListener('mousemove', (event) => {
        mouse.x = event.x;
        mouse.y = event.y;
    });

    window.addEventListener('mouseout', () => {
        mouse.x = undefined;
        mouse.y = undefined;
    });

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 1 - 0.5;
            this.speedY = Math.random() * 1 - 0.5;
            this.color = '#38bdf8';
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce off edges
            if (this.x > canvas.width || this.x < 0) this.speedX = -this.speedX;
            if (this.y > canvas.height || this.y < 0) this.speedY = -this.speedY;

            // Mouse Interaction
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < mouse.radius + this.size) {
                if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                    this.x += 1; // Push away slightly or just connect
                }
                if (mouse.x > this.x && this.x > this.size * 10) {
                    this.x -= 1;
                }
            }
        }
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particlesArray = [];
        const numberOfParticles = (canvas.width * canvas.height) / 9000;
        for (let i = 0; i < numberOfParticles; i++) {
            particlesArray.push(new Particle());
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let i = 0; i < particlesArray.length; i++) {
            particlesArray[i].update();
            particlesArray[i].draw();

            // Draw connections to other particles
            for (let j = i; j < particlesArray.length; j++) {
                const dx = particlesArray[i].x - particlesArray[j].x;
                const dy = particlesArray[i].y - particlesArray[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(56, 189, 248, ${1 - distance / 100})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                    ctx.stroke();
                }
            }

            // Draw connections to mouse
            if (mouse.x != undefined) {
                let dx = mouse.x - particlesArray[i].x;
                let dy = mouse.y - particlesArray[i].y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 150) { // Connection distance
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(56, 189, 248, ${1 - distance / 150})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animateParticles);
    }

    // Handle Resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    });

    // Start Particles
    if (canvas) {
        initParticles();
        animateParticles();
    }
});
