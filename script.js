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
                    // Pokud je to tlačítko přepínače motivu, nezavírej menu
                    if (link.closest('.theme-switcher-btn') || link.id === 'theme-switcher') {
                        return;
                    }
                    // Pokud je to samotná položka menu obsahující přepínač, také nezavírej
                    if (link.closest('.theme-switch-item') && !link.classList.contains('btn')) {
                         // Toto je pro případ, kdyby se kliklo na LI místo na tlačítko uvnitř
                        // Ale náš přepínač je tlačítko, takže by to nemělo být nutné
                    }

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
    const menuLinks = document.querySelectorAll('.nav-menu .nav-link');

    menuLinks.forEach(link => {
        // Přeskočíme odkaz tlačítka přepínače motivu, pokud má vlastní logiku
        if (link.id === 'theme-switcher' || link.closest('#theme-switcher')) {
            return;
        }

        const linkPath = link.getAttribute('href').split("/").pop();
        if ((currentLocation === linkPath) || (currentLocation === "" && linkPath === "index.html")) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // --- KÓD PRO PŘEPÍNÁNÍ MOTIVŮ ---
    const themeSwitcher = document.getElementById('theme-switcher');
    const body = document.body;

    // Funkce pro nastavení motivu
    const setTheme = (theme) => {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode-explicit');
            body.classList.add('dark-mode-explicit');
            localStorage.setItem('theme', 'dark');
        } else {
            body.classList.remove('dark-mode');
            body.classList.remove('dark-mode-explicit');
            body.classList.add('light-mode-explicit');
            localStorage.setItem('theme', 'light');
        }
    };

    // Zjištění preferovaného motivu při načtení stránky
    const storedTheme = localStorage.getItem('theme');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (storedTheme) {
        setTheme(storedTheme);
    } else if (prefersDarkScheme) {
        // Pouze pokud není uložena žádná explicitní volba, respektuj systém
        // Třídu .dark-mode přidá CSS přes @media query, pokud není .light-mode-explicit
        // Pokud chceme JS, aby to řídil: setTheme('dark'); ale bez ukládání do localStorage,
        // aby se při příštím načtení znovu zkontroloval systém.
        // Pro jednoduchost necháme CSS @media query, aby se postaralo o počáteční systémový stav,
        // pokud není nic v localStorage. JS přidá .dark-mode jen při explicitní akci.
        // Nebo, pokud chceme, aby se to projevilo i v JS:
         body.classList.add('dark-mode'); // Přidá třídu, ale neukládá jako explicitní volbu
    }
    // Pokud není storedTheme a není prefersDarkScheme, je světlý (výchozí)


    // Listener pro tlačítko přepínače
    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            // Zkontrolujeme aktuální stav podle třídy na body, protože localStorage nemusí být hned synchronní
            // nebo pokud by byl systémový tmavý režim aktivní bez explicitní třídy .dark-mode
            const isCurrentlyDark = body.classList.contains('dark-mode') ||
                                   (!body.classList.contains('light-mode-explicit') && window.matchMedia('(prefers-color-scheme: dark)').matches && !localStorage.getItem('theme'));
            if (isCurrentlyDark) {
                setTheme('light');
            } else {
                setTheme('dark');
            }
        });
    }

    // Listener pro změnu systémového nastavení (pokud uživatel změní během session)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        // Pokud nebyl motiv explicitně zvolen uživatelem (tj. není v localStorage), přizpůsob se systému
        if (!localStorage.getItem('theme')) {
            if (event.matches) {
                body.classList.add('dark-mode');
                body.classList.remove('light-mode-explicit'); // Ujistíme se, že explicitní světlý je pryč
            } else {
                body.classList.remove('dark-mode');
                body.classList.remove('dark-mode-explicit'); // Ujistíme se, že explicitní tmavý je pryč
            }
        }
    });
    // --- KONEC KÓDU PRO PŘEPÍNÁNÍ MOTIVŮ ---

}); // Konec DOMContentLoaded