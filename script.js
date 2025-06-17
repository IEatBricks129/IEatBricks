document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        link.classList.add('nav-link-animated');

        link.addEventListener('click', (event) => {
            // Check if the link points to a section on the current page or another page
            const href = link.getAttribute('href');
            const isInternalLink = href.startsWith('#') || (href.includes('#') && href.split('#')[0] === window.location.pathname.split('/').pop()); // Also consider links to sections on the current page even if it's not just a #

            // If it's an internal link on the current page, prevent default and animate
            if (isInternalLink) {
                event.preventDefault();

                navLinks.forEach(otherLink => {
                    otherLink.classList.remove('is-animating');
                });

                link.classList.add('is-animating');

                link.addEventListener('animationend', () => {
                    link.classList.remove('is-animating');

                    const targetId = href.split('#')[1];
                    const targetSection = document.querySelector(`#${targetId}`);
                    if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                }, { once: true });
            } else {
                // For external links (to other pages), just let the default behavior happen
                // The animation for external links will happen on the current page before navigation
                navLinks.forEach(otherLink => {
                    otherLink.classList.remove('is-animating');
                });
                link.classList.add('is-animating');
                // No need for animationend listener if we're just navigating away
            }
        });
    });

    // Background Animation Randomizer
    const bodyElement = document.body;
    const headerContentElement = document.querySelector('.header-content');

    function setRandomBackgroundAnimation() {
        // --- For Body Background ---
        const bodyDuration = Math.random() * (45 - 20) + 20; // Random duration between 20s and 45s
        const bodyDirection = Math.random() < 0.5 ? 'normal' : 'reverse'; // Randomly normal or reverse

        // Apply custom properties to root, then use them in CSS
        document.documentElement.style.setProperty('--body-animation-duration', `${bodyDuration}s`);
        document.documentElement.style.setProperty('--body-animation-direction', bodyDirection);


        // --- For Header Background ---
        const headerDuration = Math.random() * (35 - 15) + 15; // Random duration between 15s and 35s
        const headerDirection = Math.random() < 0.5 ? 'normal' : 'reverse'; // Randomly normal or reverse

        if (headerContentElement) { // Check if headerContentElement exists on the page
             // Apply custom properties to root, then use them in CSS
            document.documentElement.style.setProperty('--header-animation-duration', `${headerDuration}s`);
            document.documentElement.style.setProperty('--header-animation-direction', headerDirection);
        }
    }

    // Set initial random animations
    setRandomBackgroundAnimation();

    // Change animation every 10 seconds
    setInterval(setRandomBackgroundAnimation, 10000); // 10000 milliseconds = 10 seconds
});
