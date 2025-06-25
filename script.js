document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav ul li a');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetHref = this.getAttribute('href');
            const isSamePageAnchor = targetHref.startsWith('#') && this.pathname === window.location.pathname;
            const isInternalLink = (this.origin === window.location.origin);

            if (isInternalLink) {
                e.preventDefault();
            }

            this.classList.add('is-animating');

            this.addEventListener('animationend', () => {
                this.classList.remove('is-animating');

                if (isSamePageAnchor) {
                    const targetId = targetHref.substring(1);
                    const targetElement = document.getElementById(targetId);
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                } else if (isInternalLink) {
                    window.location.href = targetHref;
                }
            }, { once: true });
        });
    });
});