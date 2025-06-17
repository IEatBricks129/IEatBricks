document.addEventListener('DOMContentLoaded', () => {
    // Navigation link animation
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetHref = this.getAttribute('href');
            // Check if the link is a same-page anchor (starts with '#')
            const isSamePageAnchor = targetHref.startsWith('#') && this.pathname === window.location.pathname;
            // Check if the link is to any page within the same website origin
            const isInternalLink = (this.origin === window.location.origin);

            // Prevent default browser navigation only for internal links we want to control
            if (isInternalLink) {
                e.preventDefault();
            }

            // Add the animation class
            this.classList.add('is-animating');

            // Listen for the animation to end, then perform the navigation
            this.addEventListener('animationend', () => {
                this.classList.remove('is-animating'); // Remove animation class

                if (isSamePageAnchor) {
                    // For same-page anchors, explicitly use scrollIntoView for smooth behavior
                    const targetId = targetHref.substring(1); // Get the ID without '#'
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                } else if (isInternalLink) {
                    // For internal links to different pages (e.g., from essays.html to index.html#about)
                    window.location.href = targetHref;
                } else {
                    // If it's an external link (and e.preventDefault was not called), let it proceed naturally.
                    // This else block is mostly a fallback/clarification as e.preventDefault() should not have been called for external links based on 'isInternalLink' check.
                }
            }, { once: true }); // Ensure the event listener runs only once per click
        });
    });

    // The random background animation logic was removed in a previous step.
    // The background scroll speed is now consistently set by your style.css.
});
