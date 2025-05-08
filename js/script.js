document.addEventListener('DOMContentLoaded', function() {
    // Mobilní navigace toggle
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true' || false;
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active'); // Pro změnu ikony hamburgeru na křížek vizuálně
        });

        // Zavření menu po kliknutí na odkaz
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // Copyright rok
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // Aktivní odkaz v navigaci podle aktuální stránky
    const currentLocation = window.location.pathname.split("/").pop();
    const menuLinks = document.querySelectorAll('.nav-menu .nav-link'); // Používáme obecnější selektor, který zahrnuje i tlačítko

    menuLinks.forEach(link => {
        const linkPath = link.getAttribute('href').split("/").pop();
        // Speciální případ pro index.html a prázdnou cestu (kořen webu)
        if ((currentLocation === linkPath) || (currentLocation === "" && linkPath === "index.html")) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Jednoduchý smooth scroll pro kotvy (pokud byste je použili)
    // document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    //     anchor.addEventListener('click', function (e) {
    //         e.preventDefault();
    //         const targetId = this.getAttribute('href');
    //         const targetElement = document.querySelector(targetId);
    //         if (targetElement) {
    //             targetElement.scrollIntoView({
    //                 behavior: 'smooth'
    //             });
    //         }
    //     });
    // });
});