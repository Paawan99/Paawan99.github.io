/* ============================================
   PAAWAN SHAH — APP.JS
   Smooth PowerPoint-style slide navigation
   ============================================ */

(function () {
    'use strict';

    let currentSlide = 0;
    let isTransitioning = false;
    const slides = document.querySelectorAll('.slide');
    const navDots = document.querySelectorAll('.nav-dot');
    const hubOptions = document.querySelectorAll('.hub-option');
    const backBtns = document.querySelectorAll('.back-btn');
    const hubOptionsContainer = document.getElementById('hub-options');

    // ==================== LOADER ====================
    function hideLoader() {
        document.getElementById('loader').classList.add('hidden');
    }
    document.addEventListener('DOMContentLoaded', function () {
        setTimeout(hideLoader, 400);
    });
    // Safety net: never leave the loader up, even if an event above fails to fire
    setTimeout(hideLoader, 5000);

    // ==================== SLIDE NAVIGATION ====================
    window.goToSlide = function (index) {
        if (isTransitioning || index === currentSlide || index < 0 || index >= slides.length) return;
        isTransitioning = true;

        const direction = index > currentSlide ? 'down' : 'up';
        const oldSlide = slides[currentSlide];
        const newSlide = slides[index];

        // Exit current slide
        oldSlide.classList.remove('active');
        if (direction === 'down') oldSlide.classList.add('exit-up');
        oldSlide.style.opacity = '0';
        oldSlide.style.transform = direction === 'down'
            ? 'translateY(-60px) scale(0.98)'
            : 'translateY(60px) scale(0.98)';

        // Slight delay for enter
        setTimeout(function () {
            oldSlide.classList.remove('exit-up');
            oldSlide.style.visibility = 'hidden';

            // Enter new slide
            newSlide.style.visibility = 'visible';
            newSlide.style.transform = direction === 'down'
                ? 'translateY(60px) scale(0.98)'
                : 'translateY(-60px) scale(0.98)';
            newSlide.style.opacity = '0';

            // Force reflow
            newSlide.offsetHeight;

            newSlide.classList.add('active');
            newSlide.style.transform = '';
            newSlide.style.opacity = '';
            newSlide.style.visibility = '';

            currentSlide = index;
            updateNavDots();

            // Animate children in
            animateSlideContent(newSlide);

            setTimeout(function () {
                isTransitioning = false;
                oldSlide.style.transform = '';
                oldSlide.style.opacity = '';
                oldSlide.style.visibility = '';
            }, 700);
        }, 150);
    };

    function updateNavDots() {
        navDots.forEach(function (dot, i) {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    // Staggered content animation
    function animateSlideContent(slide) {
        var items = slide.querySelectorAll('.section-header, .feature-card, .hub-option, .stat-item, .skill-pill, .exp-card, .contact-link-card, .about-text-block, .about-lead');
        items.forEach(function (el, i) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'none';
            setTimeout(function () {
                el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 80 + i * 60);
        });
    }

    // ==================== NAV DOTS CLICK ====================
    navDots.forEach(function (dot) {
        dot.addEventListener('click', function () {
            goToSlide(parseInt(this.dataset.slide));
        });
    });

    // ==================== HUB OPTIONS ====================
    // Hover: dim others, highlight hovered (pointer devices only — synthetic
    // hover on touch screens would leave the menu stuck dimmed)
    var canHover = window.matchMedia('(hover: hover)').matches;
    hubOptions.forEach(function (option) {
        if (canHover) {
            option.addEventListener('mouseenter', function () {
                hubOptionsContainer.classList.add('has-focus');
            });

            option.addEventListener('mouseleave', function () {
                hubOptionsContainer.classList.remove('has-focus');
            });
        }

        option.addEventListener('click', function () {
            hubOptionsContainer.classList.remove('has-focus');
            var target = parseInt(this.dataset.target);
            // Brief "selected" animation
            this.style.transform = 'scale(0.96)';
            var self = this;
            setTimeout(function () {
                self.style.transform = '';
                goToSlide(target);
            }, 150);
        });
    });

    // ==================== BACK BUTTONS ====================
    backBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            goToSlide(parseInt(this.dataset.target));
        });
    });

    // ==================== KEYBOARD NAVIGATION ====================
    document.addEventListener('keydown', function (e) {
        // Never steal keys from form fields or the chatbot
        var t = e.target;
        if (t && (t.matches && t.matches('input, textarea, select') || t.isContentEditable || (t.closest && t.closest('.cb-panel')))) return;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            goToSlide(currentSlide + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            goToSlide(currentSlide - 1);
        } else if (e.key === 'Escape') {
            goToSlide(0);
        }
    });

    // ==================== SCROLL / WHEEL NAVIGATION ====================
    var scrollCooldown = false;
    var accumulatedDelta = 0;

    document.addEventListener('wheel', function (e) {
        if (scrollCooldown) return;

        // Let the chatbot panel scroll its own messages
        if (e.target && e.target.closest && e.target.closest('.cb-panel, .cb-trigger')) return;

        // Check if the slide content is scrollable and not at edges
        var slideContent = slides[currentSlide].querySelector('.slide-content');
        if (slideContent) {
            // Add a small buffer (e.g., 20px) to the edge detection to be forgiving on mobile
            var atTop = slideContent.scrollTop <= 20;
            var atBottom = Math.abs((slideContent.scrollHeight - slideContent.scrollTop) - slideContent.clientHeight) <= 20;

            if (e.deltaY > 0 && !atBottom) { accumulatedDelta = 0; return; }
            if (e.deltaY < 0 && !atTop) { accumulatedDelta = 0; return; }
        }

        accumulatedDelta += e.deltaY;

        if (accumulatedDelta > 20) {
            goToSlide(currentSlide + 1);
            accumulatedDelta = 0;
            scrollCooldown = true;
            setTimeout(function () { scrollCooldown = false; }, 900);
        } else if (accumulatedDelta < -20) {
            goToSlide(currentSlide - 1);
            accumulatedDelta = 0;
            scrollCooldown = true;
            setTimeout(function () { scrollCooldown = false; }, 900);
        }
    }, { passive: true });

    // ==================== TOUCH NAVIGATION ====================
    var touchStartY = 0;
    var touchStartX = 0;

    document.addEventListener('touchstart', function (e) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
    }, { passive: true });

    document.addEventListener('touchend', function (e) {
        var deltaY = touchStartY - e.changedTouches[0].clientY;
        var deltaX = touchStartX - e.changedTouches[0].clientX;

        // Only trigger if vertical swipe is dominant and significant
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 80) { // Increased threshold

            var slideContent = slides[currentSlide].querySelector('.slide-content');
            if (slideContent) {
                var atTop = slideContent.scrollTop <= 20;
                var atBottom = Math.abs((slideContent.scrollHeight - slideContent.scrollTop) - slideContent.clientHeight) <= 20;

                // Block transition if user is swiping up to scroll down AND not at bottom yet
                if (deltaY > 0 && !atBottom) return;
                // Block transition if user is swiping down to scroll up AND not at top yet
                if (deltaY < 0 && !atTop) return;
            }

            if (deltaY > 0) {
                goToSlide(currentSlide + 1);
            } else {
                goToSlide(currentSlide - 1);
            }
        }
    }, { passive: true });

    // ==================== INITIAL ANIMATION ====================
    setTimeout(function () {
        animateSlideContent(slides[0]);
    }, 600);

})();
