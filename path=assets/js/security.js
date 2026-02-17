// SECURITY FIX: Comprehensive security module for form validation and CSRF protection

class SecurityManager {
    constructor() {
        this.csrfToken = this.generateCSRFToken();
        this.rateLimitMap = new Map();
        this.initSecurity();
    }

    // SECURITY FIX: Generate CSRF token to prevent cross-site request forgery
    generateCSRFToken() {
        const array = new Uint8Array(32);
        crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    // SECURITY FIX: Initialize security measures
    initSecurity() {
        this.setCSRFToken();
        this.preventXSS();
        this.setupRateLimiting();
        this.sanitizeInputs();
    }

    // SECURITY FIX: Set CSRF token in form
    setCSRFToken() {
        const csrfInput = document.getElementById('csrfToken');
        if (csrfInput) {
            csrfInput.value = this.csrfToken;
        }
    }

    // SECURITY FIX: Prevent XSS by sanitizing content
    sanitizeHTML(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    // SECURITY FIX: Validate CSRF token
    validateCSRFToken(token) {
        return token === this.csrfToken && token.length === 64;
    }

    // SECURITY FIX: Rate limiting for form submissions
    isRateLimited(identifier) {
        const now = Date.now();
        const attempts = this.rateLimitMap.get(identifier) || [];
        
        // Remove attempts older than 15 minutes
        const recentAttempts = attempts.filter(time => now - time < 900000);
        
        // Allow maximum 5 attempts per 15 minutes
        if (recentAttempts.length >= 5) {
            return true;
        }
        
        recentAttempts.push(now);
        this.rateLimitMap.set(identifier, recentAttempts);
        return false;
    }

    // SECURITY FIX: Setup rate limiting
    setupRateLimiting() {
        // Clear old rate limit entries every 30 minutes
        setInterval(() => {
            const now = Date.now();
            for (const [key, attempts] of this.rateLimitMap.entries()) {
                const validAttempts = attempts.filter(time => now - time < 900000);
                if (validAttempts.length === 0) {
                    this.rateLimitMap.delete(key);
                } else {
                    this.rateLimitMap.set(key, validAttempts);
                }
            }
        }, 1800000);
    }

    // SECURITY FIX: Sanitize all inputs to prevent XSS
    sanitizeInputs() {
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                // Remove potentially dangerous characters
                const sanitized = e.target.value
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/<[^>]*>?/gm, '')
                    .replace(/javascript:/gi, '')
                    .replace(/on\w+\s*=/gi, '');
                
                if (sanitized !== e.target.value) {
                    e.target.value = sanitized;
                }
            }
        });
    }

    // SECURITY FIX: Validate input against XSS patterns
    validateInput(value) {
        const xssPatterns = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi,
            /vbscript:/gi,
            /data:text\/html/gi
        ];

        return !xssPatterns.some(pattern => pattern.test(value));
    }

    // SECURITY FIX: Prevent XSS in dynamic content
    preventXSS() {
        // Override innerHTML to sanitize content
        const originalInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
        
        Object.defineProperty(Element.prototype, 'innerHTML', {
            set: function(value) {
                if (typeof value === 'string' && !this.hasAttribute('data-allow-html')) {
                    value = securityManager.sanitizeHTML(value);
                }
                originalInnerHTML.set.call(this, value);
            },
            get: originalInnerHTML.get
        });
    }

    // SECURITY FIX: Validate email format
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
        return emailRegex.test(email) && email.length <= 254;
    }

    // SECURITY FIX: Validate phone number
    validatePhone(phone) {
        const phoneRegex = /^[+]?[\d\s\-\(\)]{10,20}$/;
        return phoneRegex.test(phone);
    }

    // SECURITY FIX: Validate name (prevent code injection)
    validateName(name) {
        const nameRegex = /^[A-Za-z\s]{2,100}$/;
        return nameRegex.test(name) && this.validateInput(name);
    }

    // SECURITY FIX: Validate message content
    validateMessage(message) {
        return message.length >= 10 && 
               message.length <= 1000 && 
               this.validateInput(message);
    }

    // SECURITY FIX: Generate secure fingerprint for rate limiting
    getClientFingerprint() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        ctx.textBaseline = 'top';
        ctx.font = '14px Arial';
        ctx.fillText('Security fingerprint', 2, 2);
        
        return btoa(JSON.stringify({
            screen: `${screen.width}x${screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            platform: navigator.platform,
            canvas: canvas.toDataURL(),
            timestamp: Math.floor(Date.now() / 3600000) // Hour-based timestamp
        })).slice(0, 32);
    }
}

// SECURITY FIX: Initialize security manager
const securityManager = new SecurityManager();

// SECURITY FIX: Content Security Policy violation reporting
window.addEventListener('securitypolicyviolation', (e) => {
    console.warn('CSP Violation:', e.violatedDirective, e.blockedURI);
    
    // In production, you would send this to your security monitoring service
    if (typeof fetch !== 'undefined') {
        fetch('/api/security/csp-violation', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                violatedDirective: e.violatedDirective,
                blockedURI: e.blockedURI,
                documentURI: e.documentURI,
                timestamp: new Date().toISOString()
            })
        }).catch(() => {}); // Silently fail if endpoint doesn't exist
    }
});

// SECURITY FIX: Prevent clickjacking
if (window.top !== window.self) {
    window.top.location = window.self.location;
}

// SECURITY FIX: Clear sensitive data on page unload
window.addEventListener('beforeunload', () => {
    // Clear any sensitive form data
    const sensitiveInputs = document.querySelectorAll('input[type="password"], input[type="email"]');
    sensitiveInputs.forEach(input => {
        input.value = '';
    });
    
    // Clear CSRF token
    const csrfInput = document.getElementById('csrfToken');
    if (csrfInput) {
        csrfInput.value = '';
    }
});