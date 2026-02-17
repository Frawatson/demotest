// Main JavaScript functionality for iPhone landing page

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollEffects();
    initGalleryModal();
    initContactForm();
    initAnimations();
    loadImages();
});

// Navigation functionality
function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('active');
            navToggle.classList.remove('active');
        }
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const header = document.querySelector('.header');
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
        }
    });
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const headerHeight = document.querySelector('.header').offsetHeight;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight - 20;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// Scroll effects and animations
function initScrollEffects() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.feature-card, .gallery-item, .spec-item, .contact-info, .contact-form'
    );
    
    animatedElements.forEach(el => observer.observe(el));
}

// Gallery modal functionality
function initGalleryModal() {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.modal-close');

    // Close modal events
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.style.display === 'block') {
            closeModal();
        }
    });
}

// Open gallery modal
function openModal(imageId) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    
    if (modal && modalImage) {
        // SECURITY FIX: Validate imageId to prevent XSS
        const validImageIds = ['gallery1', 'gallery2', 'gallery3', 'gallery4'];
        if (!validImageIds.includes(imageId)) {
            console.warn('Invalid image ID provided');
            return;
        }

        const imageSources = {
            gallery1: 'assets/images/product-gallery/iphone-1.jpg',
            gallery2: 'assets/images/product-gallery/iphone-2.jpg',
            gallery3: 'assets/images/product-gallery/iphone-3.jpg',
            gallery4: 'assets/images/product-gallery/iphone-4.jpg'
        };

        modalImage.src = imageSources[imageId];
        modalImage.alt = `iPhone gallery image ${imageId.slice(-1)}`;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus trap for accessibility
        modalImage.focus();
    }
}

// Close gallery modal
function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Contact form functionality
function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', handleFormSubmit);

    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => clearFieldError(input));
    });
}

// SECURITY FIX: Enhanced form validation with security checks
function validateField(field) {
    const formGroup = field.closest('.form-group');
    const errorElement = formGroup.querySelector('.error-message');
    let isValid = true;
    let errorMessage = '';

    // Clear previous error state
    formGroup.classList.remove('error', 'success');

    switch (field.name) {
        case 'name':
            if (!field.value.trim()) {
                errorMessage = 'Name is required';
                isValid = false;
            } else if (!securityManager.validateName(field.value)) {
                errorMessage = 'Please enter a valid name (letters and spaces only, 2-100 characters)';
                isValid = false;
            }
            break;

        case 'email':
            if (!field.value.trim()) {
                errorMessage = 'Email is required';
                isValid = false;
            } else if (!securityManager.validateEmail(field.value)) {
                errorMessage = 'Please enter a valid email address';
                isValid = false;
            }
            break;

        case 'phone':
            if (field.value.trim() && !securityManager.validatePhone(field.value)) {
                errorMessage = 'Please enter a valid phone number';
                isValid = false;
            }
            break;

        case 'message':
            if (!field.value.trim()) {
                errorMessage = 'Message is required';
                isValid = false;
            } else if (!securityManager.validateMessage(field.value)) {
                errorMessage = 'Message must be 10-1000 characters and contain valid content';
                isValid = false;
            }
            break;

        case 'captcha':
            const captchaValue = parseInt(field.value);
            if (isNaN(captchaValue) || captchaValue !== 10) {
                errorMessage = 'Please solve the security question correctly';
                isValid = false;
            }
            break;
    }

    if (!isValid) {
        formGroup.classList.add('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
        }
    } else if (field.value.trim()) {
        formGroup.classList.add('success');
    }

    return isValid;
}

// Clear field error state
function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error');
}

// SECURITY FIX: Secure form submission with validation and rate limiting
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitButton = form.querySelector('button[type="submit"]');
    const spinner = document.getElementById('loadingSpinner');
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let allValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            allValid = false;
        }
    });

    if (!allValid) {
        return;
    }

    // SECURITY FIX: Check CSRF token
    const csrfToken = form.querySelector('input[name="csrf_token"]').value;
    if (!securityManager.validateCSRFToken(csrfToken)) {
        showNotification('Security error. Please refresh the page and try again.', 'error');
        return;
    }

    // SECURITY FIX: Rate limiting check
    const clientFingerprint = securityManager.getClientFingerprint();
    if (securityManager.isRateLimited(clientFingerprint)) {
        showNotification('Too many requests. Please wait before submitting again.', 'error');
        return;
    }

    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    if (spinner) spinner.style.display = 'block';

    try {
        // Simulate form submission (replace with actual endpoint)
        await simulateFormSubmission(new FormData(form));
        
        showNotification('Thank you for your message! We\'ll get back to you soon.', 'success');
        form.reset();
        
        // Clear form states
        const formGroups = form.querySelectorAll('.form-group');
        formGroups.forEach(group => {
            group.classList.remove('error', 'success');
        });

        // Generate new CSRF token
        securityManager.csrfToken = securityManager.generateCSRFToken();
        securityManager.setCSRFToken();
        
    } catch (error) {
        console.error('Form submission error:', error);
        showNotification('Sorry, there was an error sending your message. Please try again.', 'error');
    } finally {
        // Reset button state
        submitButton.disabled = false;
        submitButton.textContent = 'Send Message';
        if (spinner) spinner.style.display = 'none';
    }
}

// Simulate form submission (replace with actual API call)
function simulateFormSubmission(formData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate random success/failure for demo
            if (Math.random() > 0.1) {
                resolve({ success: true });
            } else {
                reject(new Error('Network error'));
            }
        }, 2000);
    });
}

// Show notification to user
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-icon">
                ${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}
            </span>
            <span class="notification-message">${securityManager.sanitizeHTML(message)}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;

    // Add styles if not present
    if (!document.querySelector('#notification-styles')) {
        const styles = document.createElement('style');
        styles.id = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 4000;
                max-width: 400px;
                padding: 1rem;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                animation: slideIn 0.3s ease;
            }
            .notification-success { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
            .notification-error { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
            .notification-info { background: #d1ecf1; color: #0c5460; border: 1px solid #b8daff; }
            .notification-content { display: flex; align-items: center; gap: 0.5rem; }
            .notification-close { 
                background: none; border: none; font-size: 1.2rem; 
                cursor: pointer; margin-left: auto; padding: 0;
            }
            @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Initialize animations
function initAnimations() {
    // Add CSS animation classes
    const animationCSS = `
        .animate-in {
            animation: fadeInUp 0.6s ease forwards;
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;

    if (!document.querySelector('#animation-styles')) {
        const styles = document.createElement('style');
        styles.id = 'animation-styles';
        styles.textContent = animationCSS;
        document.head.appendChild(styles);
    }
}

// Lazy load images
function loadImages() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.src || img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        images.forEach(img => {
            img.src = img.src || img.dataset.src;
        });
    }
}

// Performance monitoring
if ('performance' in window) {