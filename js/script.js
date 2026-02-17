(function() {
    'use strict';

    // DOM elements
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const contactForm = document.querySelector('.contact-form');
    const loadingOverlay = document.getElementById('loading-overlay');
    const ctaButton = document.querySelector('.cta-button');

    // Initialize the application
    function init() {
        setupNavigation();
        setupFormValidation();
        setupSmoothScrolling();
        setupAnimations();
        setupCandyInteractions();
    }

    // Navigation functionality
    function setupNavigation() {
        if (!navToggle || !navMenu) return;

        navToggle.addEventListener('click', toggleNavMenu);
        
        // Close menu when clicking on links
        navMenu.addEventListener('click', function(e) {
            if (e.target.tagName === 'A') {
                closeNavMenu();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.nav')) {
                closeNavMenu();
            }
        });

        // Handle escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navMenu.classList.contains('show')) {
                closeNavMenu();
                navToggle.focus();
            }
        });
    }

    function toggleNavMenu() {
        const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
        
        navToggle.setAttribute('aria-expanded', !isOpen);
        navMenu.classList.toggle('show');
        
        if (!isOpen) {
            const firstLink = navMenu.querySelector('a');
            if (firstLink) {
                firstLink.focus();
            }
        }
    }

    function closeNavMenu() {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('show');
    }

    // Form validation
    function setupFormValidation() {
        if (!contactForm) return;

        const inputs = contactForm.querySelectorAll('input, select, textarea');
        
        inputs.forEach(input => {
            input.addEventListener('blur', () => validateField(input));
            input.addEventListener('input', () => clearFieldError(input));
        });

        contactForm.addEventListener('submit', handleFormSubmit);
    }

    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        if (!errorElement) return true;
        
        let errorMessage = '';

        switch (fieldName) {
            case 'name':
                if (!value) {
                    errorMessage = 'Name is required';
                } else if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters';
                } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                    errorMessage = 'Name contains invalid characters';
                }
                break;

            case 'email':
                if (!value) {
                    errorMessage = 'Email is required';
                } else if (!isValidEmail(value)) {
                    errorMessage = 'Please enter a valid email address';
                }
                break;

            case 'subject':
                if (!value) {
                    errorMessage = 'Please select a subject';
                }
                break;

            case 'message':
                if (!value) {
                    errorMessage = 'Message is required';
                } else if (value.length < 10) {
                    errorMessage = 'Message must be at least 10 characters';
                } else if (value.length > 1000) {
                    errorMessage = 'Message must be less than 1000 characters';
                }
                break;
        }

        if (errorMessage) {
            field.classList.add('error');
            errorElement.textContent = errorMessage;
            return false;
        } else {
            field.classList.remove('error');
            errorElement.textContent = '';
            return true;
        }
    }

    function clearFieldError(field) {
        if (field.value.trim()) {
            field.classList.remove('error');
            const errorElement = document.getElementById(`${field.name}-error`);
            if (errorElement) {
                errorElement.textContent = '';
            }
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        const inputs = contactForm.querySelectorAll('input, select, textarea');
        let isValid = true;

        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });

        if (isValid) {
            submitForm();
        } else {
            // Focus on first error field
            const firstError = contactForm.querySelector('.error');
            if (firstError) {
                firstError.focus();
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }

    async function submitForm() {
        const submitButton = contactForm.querySelector('.submit-button');
        const originalText = submitButton.textContent;
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending Sweet Message... 🍭';
        showLoading();

        try {
            // Simulate API call with realistic delay
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Success handling
            showNotification('Sweet! Your message has been sent successfully! 🎉', 'success');
            contactForm.reset();
            
            // Clear any remaining error states
            const inputs = contactForm.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                input.classList.remove('error');
                const errorElement = document.getElementById(`${input.name}-error`);
                if (errorElement) {
                    errorElement.textContent = '';
                }
            });
            
        } catch (error) {
            showNotification('Oops! Something went wrong. Please try again. 😔', 'error');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
            hideLoading();
        }
    }

    // Smooth scrolling for navigation links
    function setupSmoothScrolling() {
        const navLinks = document.querySelectorAll('a[href^="#"]');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = targetElement.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });

                    // Update URL without jumping
                    if (history.pushState) {
                        history.pushState(null, null, `#${targetId}`);
                    }
                }
            });
        });

        // Handle CTA button
        if (ctaButton) {
            ctaButton.addEventListener('click', function() {
                const productsSection = document.getElementById('products');
                if (productsSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = productsSection.offsetTop - headerHeight - 20;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        }
    }

    // Animation and interaction setup
    function setupAnimations() {
        // Intersection Observer for scroll animations
        if ('IntersectionObserver' in window) {
            const observerOptions = {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        
                        // Stagger animation for grid items
                        if (entry.target.classList.contains('products-grid') ||
                            entry.target.classList.contains('gallery-grid')) {
                            const items = entry.target.children;
                            Array.from(items).forEach((item, index) => {
                                setTimeout(() => {
                                    item.style.opacity = '1';
                                    item.style.transform = 'translateY(0)';
                                }, index * 150);
                            });
                        }
                    }
                });
            }, observerOptions);

            // Observe elements for animation
            const animatedElements = document.querySelectorAll(
                '.products-grid, .gallery-grid, .product-card, .gallery-item, .contact-content'
            );
            
            animatedElements.forEach(el => {
                observer.observe(el);
            });

            // Set initial states for staggered animations
            const gridItems = document.querySelectorAll('.product-card, .gallery-item');
            gridItems.forEach(item => {
                item.style.opacity = '0';
                item.style.transform = 'translateY(30px)';
                item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            });
        }

        // Parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const heroImage = document.querySelector('.candy-hero-visual');
            
            if (heroImage) {
                const speed = scrolled * 0.2;
                heroImage.style.transform = `translateY(${speed}px)`;
            }
        });
    }

    // Candy-specific interactions
    function setupCandyInteractions() {
        // Interactive floating candies
        const floatingCandies = document.querySelectorAll('.floating-candy');
        
        floatingCandies.forEach(candy => {
            candy.addEventListener('mouseenter', function() {
                this.style.transform = 'scale(1.3) rotate(15deg)';
                this.style.filter = 'drop-shadow(0 15px 30px rgba(0, 0, 0, 0.3))';
            });
            
            candy.addEventListener('mouseleave', function() {
                this.style.transform = 'scale(1) rotate(0deg)';
                this.style.filter = 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.2))';
            });
            
            candy.addEventListener('click', function() {
                createCandyBurst(this);
            });
        });

        // Interactive gallery items
        const galleryItems = document.querySelectorAll('.gallery-item');
        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                const emoji = this.querySelector('.gallery-emoji');
                if (emoji) {
                    createCandyBurst(emoji);
                }
            });
        });

        // Product card interactions
        const productCards = document.querySelectorAll('.product-card');
        productCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                const icon = this.querySelector('.product-icon');
                if (icon) {
                    icon.style.transform = 'scale(1.2) rotate(10deg)';
                }
            });
            
            card.addEventListener('mouseleave', function() {
                const icon = this.querySelector('.product-icon');
                if (icon) {
                    icon.style.transform = 'scale(1) rotate(0deg)';
                }
            });
        });

        // Random candy rain effect
        let candyRainTimeout;
        
        function startCandyRain() {
            clearTimeout(candyRainTimeout);
            candyRainTimeout = setTimeout(() => {
                createRandomCandy();
                startCandyRain();
            }, Math.random() * 5000 + 3000); // Random interval between 3-8 seconds
        }
        
        // Start candy rain after page load
        setTimeout(startCandyRain, 3000);
    }

    // Create candy burst effect
    function createCandyBurst(element) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const candyEmojis = ['🍭', '🍬', '🧁', '🍫', '🍰', '🎂', '🍩', '🧇'];
        
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const candy = document.createElement('div');
                candy.textContent = candyEmojis[Math.floor(Math.random() * candyEmojis.length)];
                candy.style.position = 'fixed';
                candy.style.left = centerX + 'px';
                candy.style.top = centerY + 'px';
                candy.style.fontSize = '2rem';
                candy.style.pointerEvents = 'none';
                candy.style.zIndex = '10000';
                candy.style.transition = 'all 1.5s ease-out';
                
                document.body.appendChild(candy);
                
                // Animate candy burst
                setTimeout(() => {
                    const angle = (i * 60) + Math.random() * 60;
                    const distance = 100 + Math.random() * 100;
                    const x = Math.cos(angle * Math.PI / 180) * distance;
                    const y = Math.sin(angle * Math.PI / 180) * distance;
                    
                    candy.style.transform = `translate(${x}px, ${y}px) rotate(360deg)`;
                    candy.style.opacity = '0';
                }, 50);
                
                // Remove candy after animation
                setTimeout(() => {
                    if (candy.parentNode) {
                        candy.parentNode.removeChild(candy);
                    }
                }, 1600);
            }, i * 100);
        }
    }

    // Create random falling candy
    function createRandomCandy() {
        const candyEmojis = ['🍭', '🍬', '🧁', '🍫', '🍰', '🎂'];
        const candy = document.createElement('div');
        
        candy.textContent = candyEmojis[Math.floor(Math.random() * candyEmojis.length)];
        candy.style.position = 'fixed';
        candy.style.left = Math.random() * window.innerWidth + 'px';
        candy.style.top = '-50px';
        candy.style.fontSize = '2rem';
        candy.style.pointerEvents = 'none';
        candy.style.zIndex = '999';
        candy.style.opacity = '0.7';
        candy.style.transition = 'all 4s linear';
        
        document.body.appendChild(candy);
        
        // Animate falling
        setTimeout(() => {
            candy.style.top = window.innerHeight + 50 + 'px';
            candy.style.transform = 'rotate(360deg)';
            candy.style.opacity = '0';
        }, 50);
        
        // Remove after animation
        setTimeout(() => {
            if (candy.parentNode) {
                candy.parentNode.removeChild(candy);
            }
        }, 4100);
    }

    // Utility functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function showLoading() {
        if (loadingOverlay) {
            loadingOverlay.classList.add('show');
            loadingOverlay.setAttribute('aria-hidden', 'false');
        }
    }

    function hideLoading() {
        if (loadingOverlay) {
            loadingOverlay.classList.remove('show');
            loadingOverlay.setAttribute('aria-hidden', 'true');
        }
    }

    function showNotification(message, type = 'info') {
        const notification = createNotification(message, type);
        document.body.appendChild(notification);
        
        // Auto-remove notification
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    function createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `candy-notification candy-notification-${type}`;
        
        const colors = {
            success: 'linear-gradient(135deg, #10b981, #34d399)',
            error: 'linear-gradient(135deg, #ef4444, #f87171)',
            info: 'linear-gradient(135deg, #3b82f6, #60a5fa)'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 20px 25px;
            border-radius: 15px;
            color: white;
            font-weight: 600;
            z-index: 10001;
            animation: slideInRight 0.4s ease;
            background: ${colors[type] || colors.info};
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            max-width: 400px;
            font-size: 1rem;
            line-height: 1.4;
        `;
        
        notification.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 15px;">
                <span>${message}</span>
                <button style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer; opacity: 0.8; transition: opacity 0.3s ease;" onclick="this.parentNode.parentNode.remove()">×</button>
            </div>
        `;
        
        return notification;
    }

    // Add notification animations
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        .candy-notification.fade-out {
            animation: fadeOut 0.3s ease forwards;
        }
        
        @keyframes fadeOut {
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    document.head.appendChild(notificationStyles);

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Handle page visibility for performance
    document.addEventListener('visibilitychange', function() {
        const floatingCandies = document.querySelectorAll('.floating-candy');
        
        if (document.hidden) {
            // Pause animations when page is not visible
            floatingCandies.forEach(candy => {
                candy.style.animationPlayState = 'paused';
            });
        } else {
            // Resume animations when page becomes visible
            floatingCandies.forEach(candy => {
                candy.style.animationPlayState = 'running';
            });
        }
    });

})();