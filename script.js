/**
 * BoneSaver 2026 - Interactive Script
 * Live Music Band (Pardubice, ČR)
 */

document.addEventListener('DOMContentLoaded', function () {

    // ==========================================
    // 1. Mobilní navigace (Hamburger toggle)
    // ==========================================
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
            navToggle.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });

        // Zavření po kliknutí na odkaz
        const navLinks = navMenu.querySelectorAll('.nav-link, .nav-actions .btn');
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

    // ==========================================
    // 2. Automatický rok v copyrightu
    // ==========================================
    const yearSpan = document.getElementById('currentYear');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // ==========================================
    // 3. Aktivní odkaz v navigaci
    // ==========================================
    const currentLocation = window.location.pathname.split("/").pop() || "index.html";
    const menuLinks = document.querySelectorAll('.nav-menu .nav-link');

    menuLinks.forEach(link => {
        const linkPath = link.getAttribute('href')?.split("/").pop();
        if (linkPath === currentLocation || (currentLocation === "" && linkPath === "index.html")) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // ==========================================
    // 4. Přepínání motivu (Dark-First default)
    // ==========================================
    const body = document.body;

    function updateThemeUI(isLight) {
        const moonSvg = '<svg class="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg>';
        const sunSvg = '<svg class="theme-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path></svg>';

        document.querySelectorAll('.theme-switcher-btn').forEach(btn => {
            btn.innerHTML = isLight ? moonSvg : sunSvg;
            btn.setAttribute('aria-label', isLight ? 'Přepnout do tmavého režimu' : 'Přepnout do světlého režimu');
            btn.setAttribute('title', isLight ? 'Přepnout do tmavého režimu' : 'Přepnout do světlého režimu');
        });
    }

    const storedTheme = localStorage.getItem('theme');
    const isLightInitial = storedTheme === 'light';
    if (isLightInitial) {
        body.classList.add('light-mode-explicit');
    }
    updateThemeUI(isLightInitial);

    document.querySelectorAll('.theme-switcher-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const isLight = body.classList.toggle('light-mode-explicit');
            localStorage.setItem('theme', isLight ? 'light' : 'dark');
            updateThemeUI(isLight);
        });
    });

    // ==========================================
    // 5. Interaktivní Repertoár (Filtry & Vyhledávání s diakritikou)
    // ==========================================
    function normalizeText(str) {
        return (str || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim();
    }

    function setupRepertoireExplorer(filterContainerId, searchInputId, cardsGridId) {
        const filterContainer = document.getElementById(filterContainerId);
        const searchInput = document.getElementById(searchInputId);
        const cardsGrid = document.getElementById(cardsGridId);

        if (!cardsGrid) return;

        let activeGenre = 'all';
        let searchQuery = '';

        function filterCards() {
            const cards = cardsGrid.querySelectorAll('.song-card');
            let matchCount = 0;
            const normalizedSearch = normalizeText(searchQuery);

            cards.forEach(card => {
                const cardGenre = card.getAttribute('data-genre') || '';
                const cardText = normalizeText(card.textContent);

                const matchesGenre = (activeGenre === 'all') || (cardGenre === activeGenre);
                const matchesSearch = !normalizedSearch || cardText.includes(normalizedSearch);

                if (matchesGenre && matchesSearch) {
                    card.style.display = 'flex';
                    matchCount++;
                } else {
                    card.style.display = 'none';
                }
            });

            // "Nenalezeno" hláška
            let noResultMsg = cardsGrid.querySelector('.no-repertoire-results');
            if (matchCount === 0) {
                if (!noResultMsg) {
                    noResultMsg = document.createElement('div');
                    noResultMsg.className = 'no-repertoire-results';
                    noResultMsg.style.gridColumn = '1 / -1';
                    noResultMsg.style.textAlign = 'center';
                    noResultMsg.style.padding = '2.5rem 1rem';
                    noResultMsg.style.color = 'var(--text-muted)';
                    noResultMsg.textContent = 'Pro zadaný filtr jsme nic nenašli. Zkuste jiný výraz nebo si stáhněte kompletní PDF repertoár.';
                    cardsGrid.appendChild(noResultMsg);
                }
                noResultMsg.style.display = 'block';
            } else if (noResultMsg) {
                noResultMsg.style.display = 'none';
            }
        }

        if (filterContainer) {
            const filterButtons = filterContainer.querySelectorAll('.filter-btn');
            filterButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    filterButtons.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    activeGenre = btn.getAttribute('data-genre') || 'all';
                    filterCards();
                });
            });
        }

        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                searchQuery = e.target.value;
                filterCards();
            });
        }
    }

    // Inicializace repertoáru na homepage i podstránce
    setupRepertoireExplorer('homeRepertoireFilters', 'homeRepertoireSearch', 'homeRepertoireGrid');
    setupRepertoireExplorer('pageRepertoireFilters', 'pageRepertoireSearch', 'pageRepertoireGrid');

    // ==========================================
    // 6. Hero Audio Snippet Player (Ukázkový přehrávač)
    // ==========================================
    const audioBtn = document.getElementById('audioSnippetBtn');
    const audioFill = document.getElementById('audioSnippetFill');
    let isPlaying = false;
    let audioTimer = null;
    let progressPercent = 35;

    if (audioBtn && audioFill) {
        audioBtn.addEventListener('click', () => {
            isPlaying = !isPlaying;
            if (isPlaying) {
                audioBtn.innerHTML = '⏸ Zastavit ukázku';
                audioBtn.style.borderColor = 'var(--accent-cyan)';
                audioTimer = setInterval(() => {
                    progressPercent += 2;
                    if (progressPercent > 100) progressPercent = 0;
                    audioFill.style.width = progressPercent + '%';
                }, 150);
            } else {
                audioBtn.innerHTML = '▶ Přehrát ukázku';
                audioBtn.style.borderColor = '';
                clearInterval(audioTimer);
            }
        });
    }

    // ==========================================
    // 7. Inteligentní poptávkový formulář (Wizard)
    // ==========================================
    function setupInquiryForm(formId, successBoxId, emailDraftLinkId, eventTypeRadioName, dateId, locationId, nameId, phoneId, emailId, notesId) {
        const form = document.getElementById(formId);
        const successBox = document.getElementById(successBoxId);
        const emailDraftLink = document.getElementById(emailDraftLinkId);

        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const selectedRadio = form.querySelector(`input[name="${eventTypeRadioName}"]:checked`);
            const eventType = selectedRadio ? selectedRadio.value : 'Vystoupení kapely';
            const date = document.getElementById(dateId)?.value || '';
            const location = document.getElementById(locationId)?.value || '';
            const name = document.getElementById(nameId)?.value || '';
            const phone = document.getElementById(phoneId)?.value || '';
            const email = document.getElementById(emailId)?.value || '';
            const notes = document.getElementById(notesId)?.value || '';

            // Sestavení přehledného textu poptávky
            const subject = encodeURIComponent(`Poptávka vystoupení BoneSaver - ${eventType} (${date})`);
            const body = encodeURIComponent(
                `Dobrý den,\n\n` +
                `rád(a) bych nezávazně poptal(a) vystoupení kapely BoneSaver na naši akci:\n\n` +
                `• Typ akce: ${eventType}\n` +
                `• Datum: ${date}\n` +
                `• Místo konání: ${location}\n` +
                `• Jméno / Pořadatel: ${name}\n` +
                `• Telefon: ${phone}\n` +
                `• E-mail: ${email}\n` +
                (notes ? `• Poznámka / dotaz: ${notes}\n` : '') +
                `\nProsím o ověření volného termínu a zaslání cenové nabídky.\n\n` +
                `S pozdravem,\n${name}`
            );

            const mailtoUrl = `mailto:bonesavermusic@gmail.com?subject=${subject}&body=${body}`;

            if (emailDraftLink) {
                emailDraftLink.href = mailtoUrl;
            }

            if (successBox) {
                successBox.style.display = 'block';
                successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }

            // Pokus o automatické otevření mailového klienta
            window.location.href = mailtoUrl;
        });
    }

    // Inicializace pro formulář na homepage
    setupInquiryForm(
        'inquiryForm',
        'formSuccessMessage',
        'emailDraftLink',
        'event_type',
        'formDate',
        'formLocation',
        'formName',
        'formPhone',
        'formEmail',
        'formNotes'
    );

    // Inicializace pro formulář na kontaktní stránce
    setupInquiryForm(
        'contactPageForm',
        'contactPageSuccess',
        'contactEmailDraftLink',
        'contact_event_type',
        'contactDate',
        'contactLocation',
        'contactName',
        'contactPhone',
        'contactEmail',
        'contactNotes'
    );
    // ==========================================
    // 8. Omezení kalendáře na dnešní a budoucí data
    // ==========================================
    const today = new Date().toISOString().split('T')[0];
    const formDate = document.getElementById('formDate');
    const contactDate = document.getElementById('contactDate');
    if (formDate) formDate.min = today;
    if (contactDate) contactDate.min = today;

    // ==========================================
    // 9. Plovoucí tlačítko Zpět nahoru
    // ==========================================
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        }, { passive: true });

        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

});