(function() {
    'use strict';

    // DOM elements
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const contactForm = document.querySelector('.contact-form');
    const loadingOverlay = document.getElementById('loading-overlay');

    // Initialize the application
    function init() {
        setupNavigation();
        setupImageHandling();
        setupFormValidation();
        setupSmoothScrolling();
        setupLazyLoading();
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
            navMenu.querySelector('a').focus();
        }
    }

    function closeNavMenu() {
        navToggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('show');
    }

    // Image handling with error states and lazy loading
    function setupImageHandling() {
        const images = document.querySelectorAll('img');
        
        images.forEach(img => {
            // Add loading state
            img.classList.add('image-loading');
            
            // Handle successful load
            img.addEventListener('load', function() {
                this.classList.remove('image-loading');
            });

            // Handle load errors
            img.addEventListener('error', function() {
                this.classList.remove('image-loading');
                this.classList.add('image-error');
                
                // Create fallback placeholder
                const placeholder = document.createElement('div');
                placeholder.className = 'image-error';
                placeholder.style.width = this.offsetWidth + 'px' || '100%';
                placeholder.style.height = this.offsetHeight + 'px' || '200px';
                
                this.parentNode.replaceChild(placeholder, this);
            });
        });
    }

    // Lazy loading implementation
    function setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            img.removeAttribute('data-src');
                        }
                        observer.unobserve(img);
                    }
                });
            });

            const lazyImages = document.querySelectorAll('img[loading="lazy"]');
            lazyImages.forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // Form validation
    function setupFormValidation() {
        if (!contactForm) return;

        const inputs = contactForm.querySelectorAll('input, textarea');
        
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
        
        let errorMessage = '';

        switch (fieldName) {
            case 'name':
                if (!value) {
                    errorMessage = 'Name is required';
                } else if (value.length < 2) {
                    errorMessage = 'Name must be at least 2 characters';
                }
                break;

            case 'email':
                if (!value) {
                    errorMessage = 'Email is required';
                } else if (!isValidEmail(value)) {
                    errorMessage = 'Please enter a valid email address';
                }
                break;

            case 'message':
                if (!value) {
                    errorMessage = 'Message is required';
                } else if (value.length < 10) {
                    errorMessage = 'Message must be at least 10 characters';
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
        
        const inputs = contactForm.querySelectorAll('input, textarea');
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
            }
        }
    }

    async function submitForm() {
        const submitButton = contactForm.querySelector('.submit-button');
        const formData = new FormData(contactForm);
        
        // Show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        showLoading();

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Success handling
            showSuccess('Message sent successfully!');
            contactForm.reset();
            
        } catch (error) {
            showError('Failed to send message. Please try again.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
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
                }
            });
        });
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

    function showSuccess(message) {
        const notification = createNotification(message, 'success');
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    function showError(message) {
        const notification = createNotification(message, 'error');
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    function createNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background-color: ${type === 'success' ? '#28a745' : '#dc3545'};
        `;
        notification.textContent = message;
        
        // Add close button
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '×';
        closeBtn.style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            margin-left: 10px;
            cursor: pointer;
        `;
        closeBtn.addEventListener('click', () => notification.remove());
        notification.appendChild(closeBtn);
        
        return notification;
    }

    // Initialize when DOM is loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Add slide-in animation CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

})();