document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        link.classList.add('nav-link-animated');

        link.addEventListener('click', (event) => {
            event.preventDefault();

            navLinks.forEach(otherLink => {
                otherLink.classList.remove('is-animating');
            });

            link.classList.add('is-animating');

            link.addEventListener('animationend', () => {
                link.classList.remove('is-animating');

                const targetId = link.getAttribute('href');
                const targetSection = document.querySelector(targetId);

                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, { once: true });
        });
    });

    // Background Animation Randomizer
    const bodyElement = document.body;
    const headerContentElement = document.querySelector('.header-content');

    function setRandomBackgroundAnimation() {
        // --- For Body Background ---
        const bodyDuration = Math.random() * (45 - 20) + 20; // Random duration between 20s and 45s
        const bodyDirection = Math.random() < 0.5 ? 'normal' : 'reverse'; // Randomly normal or reverse

        bodyElement.style.setProperty('--body-animation-duration', `${bodyDuration}s`);
        bodyElement.style.setProperty('--body-animation-direction', bodyDirection);

        // --- For Header Background ---
        const headerDuration = Math.random() * (35 - 15) + 15; // Random duration between 15s and 35s
        const headerDirection = Math.random() < 0.5 ? 'normal' : 'reverse'; // Randomly normal or reverse

        // Optional: If you always want them opposite, you could do:
        // const headerDirection = (bodyDirection === 'normal') ? 'reverse' : 'normal';

        headerContentElement.style.setProperty('--header-animation-duration', `${headerDuration}s`);
        headerContentElement.style.setProperty('--header-animation-direction', headerDirection);
    }

    // Set initial random animations
    setRandomBackgroundAnimation();

    // Change animation every 10 seconds
    setInterval(setRandomBackgroundAnimation, 10000); // 10000 milliseconds = 10 seconds
});
