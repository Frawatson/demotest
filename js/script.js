// Enhanced Candy Website JavaScript with improved UX and accessibility
(function() {
    'use strict';

    // Configuration object
    const CONFIG = {
        SCROLL_THRESHOLD: 100,
        ANIMATION_DURATION: 300,
        TYPING_SPEED: 100,
        FORM_VALIDATION_DELAY: 300,
        INTERSECTION_THRESHOLD: 0.1,
        PARALLAX_FACTOR: 0.3
    };

    // State management
    const state = {
        isMenuOpen: false,
        isLoading: false,
        scrollPosition: 0,
        formSubmitted: false,
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
    };

    // Utility functions
    const utils = {
        // Debounce function for performance optimization
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        // Throttle function for scroll events
        throttle(func, limit) {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        // Smooth scroll with accessibility consideration
        smoothScroll(target, offset = 80) {
            if (state.reducedMotion) {
                target.scrollIntoView();
                return;
            }

            const targetPosition = target.offsetTop - offset;
            const startPosition = window.pageYOffset;
            const distance = targetPosition - startPosition;
            const duration = Math.min(Math.abs(distance) / 2, 800);
            let start = null;

            function animation(currentTime) {
                if (start === null) start = currentTime;
                const timeElapsed = currentTime - start;
                const run = ease(timeElapsed, startPosition, distance, duration);
                window.scrollTo(0, run);
                if (timeElapsed < duration) requestAnimationFrame(animation);
            }

            function ease(t, b, c, d) {
                t /= d / 2;
                if (t < 1) return c / 2 * t * t + b;
                t--;
                return -c / 2 * (t * (t - 2) - 1) + b;
            }

            requestAnimationFrame(animation);
        },

        // Accessible focus management
        trapFocus(element) {
            const focusableElements = element.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            element.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            lastElement.focus();
                            e.preventDefault();
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            firstElement.focus();
                            e.preventDefault();
                        }
                    }
                }
                if (e.key === 'Escape') {
                    this.closeMenu();
                }
            });
        },

        // Animate element with intersection observer
        animateOnScroll(elements, animationClass = 'animate-in') {
            if (state.reducedMotion) return;

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(animationClass);
                        observer.unobserve(entry.target);
                    }
                });
            }, {
                threshold: CONFIG.INTERSECTION_THRESHOLD,
                rootMargin: '50px'
            });

            elements.forEach(el => observer.observe(el));
        },

        // Enhanced loading state management
        showLoading(message = 'Loading...') {
            const overlay = document.getElementById('loading-overlay');
            const loadingText = overlay.querySelector('.loading-text') || this.createLoadingText();
            
            loadingText.textContent = message;
            overlay.classList.add('show');
            overlay.setAttribute('aria-hidden', 'false');
            state.isLoading = true;
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
        },

        hideLoading() {
            const overlay = document.getElementById('loading-overlay');
            overlay.classList.remove('show');
            overlay.setAttribute('aria-hidden', 'true');
            state.isLoading = false;
            
            // Restore body scroll
            document.body.style.overflow = '';
        },

        createLoadingText() {
            const overlay = document.getElementById('loading-overlay');
            const spinner = overlay.querySelector('.loading-spinner');
            const loadingText = document.createElement('div');
            loadingText.className = 'loading-text';
            loadingText.setAttribute('aria-live', 'polite');
            spinner.appendChild(loadingText);
            return loadingText;
        }
    };

    // Enhanced Navigation functionality
    class Navigation {
        constructor() {
            this.header = document.querySelector('.header');
            this.navToggle = document.querySelector('.nav-toggle');
            this.navMenu = document.querySelector('.nav-menu');
            this.navLinks = document.querySelectorAll('.nav-menu a');
            
            this.init();
        }

        init() {
            this.bindEvents();
            this.handleInitialState();
        }

        bindEvents() {
            // Toggle menu
            this.navToggle?.addEventListener('click', () => this.toggleMenu());
            
            // Close menu on outside click
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.nav-container') && state.isMenuOpen) {
                    this.closeMenu();
                }
            });

            // Handle escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && state.isMenuOpen) {
                    this.closeMenu();
                }
            });

            // Smooth scroll navigation
            this.navLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = link.getAttribute('href').substring(1);
                    const target = document.getElementById(targetId);
                    
                    if (target) {
                        utils.smoothScroll(target);
                        this.closeMenu();
                        
                        // Update active link
                        this.updateActiveLink(link);
                        
                        // Announce navigation for screen readers
                        this.announceNavigation(targetId);
                    }
                });
            });

            // Scroll effects
            window.addEventListener('scroll', utils.throttle(() => {
                this.handleScroll();
            }, 16));

            // Resize handler
            window.addEventListener('resize', utils.debounce(() => {
                if (window.innerWidth > 768 && state.isMenuOpen) {
                    this.closeMenu();
                }
            }, 250));
        }

        toggleMenu() {
            state.isMenuOpen = !state.isMenuOpen;
            this.updateMenuState();
        }

        closeMenu() {
            state.isMenuOpen = false;
            this.updateMenuState();
        }

        updateMenuState() {
            const isExpanded = state.isMenuOpen;
            
            // Update ARIA attributes
            this.navToggle?.setAttribute('aria-expanded', isExpanded.toString());
            this.navMenu?.setAttribute('aria-hidden', (!isExpanded).toString());
            
            // Update classes
            this.navMenu?.classList.toggle('show', isExpanded);
            
            // Focus management
            if (isExpanded) {
                this.navMenu?.querySelector('a')?.focus();
                utils.trapFocus(this.navMenu);
            } else {
                this.navToggle?.focus();
            }
            
            // Prevent body scroll when menu is open on mobile
            if (window.innerWidth <= 768) {
                document.body.style.overflow = isExpanded ? 'hidden' : '';
            }
        }

        updateActiveLink(activeLink) {
            this.navLinks.forEach(link => {
                link.classList.remove('active');
                link.setAttribute('aria-current', 'false');
            });
            
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
        }

        announceNavigation(targetId) {
            const announcement = document.createElement('div');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            announcement.textContent = `Navigated to ${targetId} section`;
            
            document.body.appendChild(announcement);
            setTimeout(() => {
                document.body.removeChild(announcement);
            }, 1000);
        }

        handleScroll() {
            const scrolled = window.pageYOffset > CONFIG.SCROLL_THRESHOLD;
            this.header?.classList.toggle('scrolled', scrolled);
            
            // Update active section based on scroll position
            this.updateActiveSection();
            
            state.scrollPosition = window.pageYOffset;
        }

        updateActiveSection() {
            const sections = document.querySelectorAll('section[id]');
            const scrollPos = window.pageYOffset + 100;

            sections.forEach(section => {
                const top = section.offsetTop;
                const bottom = top + section.offsetHeight;
                const id = section.getAttribute('id');
                const navLink = document.querySelector(`.nav-menu a[href="#${id}"]`);

                if (scrollPos >= top && scrollPos <= bottom) {
                    this.navLinks.forEach(link => {
                        link.classList.remove('active');
                        link.setAttribute('aria-current', 'false');
                    });
                    navLink?.classList.add('active');
                    navLink?.setAttribute('aria-current', 'page');
                }
            });
        }

        handleInitialState() {
            // Set initial ARIA states
            this.navToggle?.setAttribute('aria-expanded', 'false');
            this.navMenu?.setAttribute('aria-hidden', 'true');
            
            // Add proper roles and labels
            this.navLinks.forEach((link, index) => {
                link.setAttribute('role', 'menuitem');
                link.setAttribute('tabindex', '0');
            });
        }
    }

    // Enhanced Form handling with better validation and UX
    class FormHandler {
        constructor() {
            this.form = document.querySelector('.contact-form');
            this.submitButton = this.form?.querySelector('.submit-button');
            this.fields = this.form?.querySelectorAll('input, select, textarea');
            
            this.validationRules = {
                name: {
                    required: true,
                    minLength: 2,
                    pattern: /^[a-zA-Z\s'-]+$/,
                    message: 'Please enter a valid name (letters only, minimum 2 characters)'
                },
                email: {
                    required: true,
                    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Please enter a valid email address'
                },
                subject: {
                    required: true,
                    message: 'Please select a subject'
                },
                message: {