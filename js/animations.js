// Animation utilities for enhanced user experience

class AnimationManager {
    constructor() {
        this.observer = null;
        this.scrollY = 0;
        this.init();
    }


    init() {
        // Enhanced Intersection Observer for scroll-triggered animations
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    // Add stagger effect for child elements
                    const children = entry.target.querySelectorAll('.stagger-item');
                    if (children.length > 0) {
                        this.staggerAnimate(Array.from(children), 100);
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        // Observe all elements with fade-in class
        document.querySelectorAll('.fade-in').forEach(el => {
            this.observer.observe(el);
        });

        // Initialize advanced scroll animations
        this.initScrollAnimations();

        // Initialize particle system
        this.initParticles();

        // Initialize micro-interactions
        this.initMicroInteractions();
    }


    initScrollAnimations() {
        // Advanced parallax with multiple layers
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled - this.scrollY;
            this.scrollY = scrolled;

            // Hero parallax
            const hero = document.querySelector('.hero-section');
            if (hero) {
                const parallaxRate = scrolled * -0.5;
                hero.style.transform = `translateY(${parallaxRate}px)`;
            }

            // Floating elements parallax
            document.querySelectorAll('.parallax-element').forEach((el, index) => {
                const speed = (index + 1) * 0.1;
                el.style.transform = `translateY(${scrolled * speed}px)`;
            });

            // Dynamic navbar background on scroll
            const header = document.querySelector('.main-header');
            if (header && scrolled > 100) {
                header.style.background = 'rgba(255, 255, 255, 0.98)';
                header.style.backdropFilter = 'blur(20px)';
                header.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
            } else if (header) {
                header.style.background = 'rgba(255, 255, 255, 0.95)';
                header.style.boxShadow = 'var(--card-shadow)';
            }
        });

        // Smooth scroll for anchor links with offset for fixed header
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    const headerOffset = 100;
                    const elementPosition = target.offsetTop;
                    const offsetPosition = elementPosition - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }


    initParticles() {
        // Enhanced particle system with physics
        const particles = document.querySelector('.particles');
        if (!particles) return;

        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (Math.random() * 6 + 8) + 's';
            particle.style.opacity = Math.random() * 0.5 + 0.2;

            // Add size variation
            const size = Math.random() * 20 + 5;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';

            particles.appendChild(particle);
        }
    }

    initMicroInteractions() {
        // Enhanced button interactions
        document.querySelectorAll('.btn').forEach(button => {
            button.addEventListener('mouseenter', (e) => {
                this.createMagneticEffect(e.target, e);
            });

            button.addEventListener('mouseleave', (e) => {
                this.removeMagneticEffect(e.target);
            });
        });

        // Card tilt effect
        document.querySelectorAll('.feature-card, .product-card, .category-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                this.createTiltEffect(card, e);
            });

            card.addEventListener('mouseleave', () => {
                this.removeTiltEffect(card);
            });
        });

        // Loading states for interactive elements
        this.initLoadingStates();
    }

    createMagneticEffect(element, event) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const deltaX = (event.clientX - centerX) * 0.1;
        const deltaY = (event.clientY - centerY) * 0.1;

        element.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.05)`;
    }

    removeMagneticEffect(element) {
        element.style.transform = '';
    }

    createTiltEffect(card, event) {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const rotateX = (event.clientY - centerY) / 10;
        const rotateY = -(event.clientX - centerX) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    }

    removeTiltEffect(card) {
        card.style.transform = '';
    }

    initLoadingStates() {
        // Add loading animation to forms on submit
        document.querySelectorAll('form').forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn) {
                    submitBtn.innerHTML = '<i data-feather="loader" class="spin"></i> Processing...';
                    submitBtn.disabled = true;
                }
            });
        });
    }


    // Enhanced utility methods
    animateElement(element, animation = 'fadeInUp', duration = 600) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px) scale(0.95)';
        element.style.transition = `all ${duration}ms cubic-bezier(0.4, 0, 0.2, 1)`;

        requestAnimationFrame(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0) scale(1)';
        });
    }

    staggerAnimate(elements, delay = 100, animation = 'fadeInUp') {
        elements.forEach((el, index) => {
            setTimeout(() => {
                this.animateElement(el, animation);
            }, index * delay);
        });
    }

    // Page transition effects
    pageTransition(to, from) {
        const transition = document.createElement('div');
        transition.className = 'page-transition';
        transition.innerHTML = `
            <div class="transition-overlay"></div>
            <div class="transition-spinner"></div>
        `;
        document.body.appendChild(transition);

        setTimeout(() => {
            window.location.href = to;
        }, 500);
    }

}

// Button ripple effect
function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = diameter + 'px';
    circle.style.left = event.clientX - rect.left - radius + 'px';
    circle.style.top = event.clientY - rect.top - radius + 'px';
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
        ripple.remove();
    }

    button.appendChild(circle);
}

// Loading animation for dynamic content
function showLoadingAnimation(container) {
    container.innerHTML = `
        <div class="loading-grid">
            ${Array(4).fill().map(() => `
                <div class="loading-card">
                    <div class="skeleton skeleton-image"></div>
                    <div class="skeleton skeleton-title"></div>
                    <div class="skeleton skeleton-text"></div>
                </div>
            `).join('')}
        </div>
    `;
}

function hideLoadingAnimation(container) {
    // This will be replaced by actual content
}

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const animationManager = new AnimationManager();

    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', createRipple);
    });

    // Enhanced card interactions (magnetic and tilt effects are handled in initMicroInteractions)
    document.querySelectorAll('.product-card, .category-card, .feature-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
});


// Export for use in other modules
window.AnimationManager = AnimationManager;
window.createRipple = createRipple;
window.showLoadingAnimation = showLoadingAnimation;
window.hideLoadingAnimation = hideLoadingAnimation;
