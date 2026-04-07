/* =========================================
   TEXT SPLITTING (Lego Effect / Staggered Text)
   ========================================= */

// Questa funzione prende un selettore, svuota il suo testo e lo ricostruisce parola per parola
const splitTextIntoSpans = (selector) => {
    // Cerchiamo tutti gli elementi che corrispondono (es. tutti i titoli delle slide)
    document.querySelectorAll(selector).forEach(element => {
        // Salviamo il testo originale
        const text = element.innerText;
        // Svuotiamo il contenitore HTML
        element.innerHTML = ''; 
        
        // Dividiamo la frase in un array di parole (usando lo spazio come separatore)
        const words = text.split(' ');
        
        // Cicliamo ogni parola...
        // Cicliamo ogni parola...
        words.forEach((word) => { // Rimuovi 'index' dalle parentesi, non ci serve più
            const span = document.createElement('span');
            span.classList.add('stagger-word');
            span.innerHTML = word + '&nbsp;';
            
            // LA MAGIA RANDOMICA: Assegniamo un valore casuale da 0.0 a 1.0 a ogni singola parola
            span.style.setProperty('--random-delay', Math.random());
            
            element.appendChild(span);
        });
    });
};

// Eseguiamo l'operazione sui titoli e sulle descrizioni del nostro carosello
splitTextIntoSpans('.slide-title');
splitTextIntoSpans('.slide-description');
splitTextIntoSpans('.modal-animate-text');


/* --- Architettura Scroll Reveal (Intersection Observer) --- */

// 1. Definiamo le opzioni del nostro "osservatore"
const revealOptions = {
    root: null, // Il viewport (lo schermo dell'utente)
    rootMargin: '0px', 
    threshold: 0.15 // Trigger: scatta quando almeno il 15% dell'elemento è visibile
};

// 2. Creiamo la logica: cosa succede quando un elemento viene "osservato"?
const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
        // Se l'elemento sta intersecando (entrando) nello schermo
        if (entry.isIntersecting) {
            
            // Aggiungiamo la classe CSS che fa partire l'animazione fisica
            entry.target.classList.add('active');
            
            // Per ottimizzare al massimo: una volta svelato, smettiamo di osservarlo.
            // (Evita che il browser continui a fare calcoli inutili se torni su).
            observer.unobserve(entry.target);
        }
    });
};

// 3. Istanziamo l'Observer passando logica e opzioni
const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

// 4. Selezioniamo tutte le sezioni "dormienti" e diciamo all'Observer di monitorarle
document.querySelectorAll('.reveal').forEach(section => {
    revealObserver.observe(section);
}); 


/* =========================================
   THEME SWITCHER ENGINE (View Transitions)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    
    // 1. Controlla la memoria del browser all'avvio
    if (localStorage.getItem('theme') === 'light') {
        document.body.classList.add('light-theme');
    }

    // 2. La logica pura del cambio colore
    function toggleThemeLogic() {
        document.body.classList.toggle('light-theme');
        if (document.body.classList.contains('light-theme')) {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
    }

    // 3. Azione al click (con supporto View Transitions)
    themeToggle.addEventListener('click', () => {
        // Se il browser è vecchio e non supporta l'API, fai il cambio normale
        if (!document.startViewTransition) {
            toggleThemeLogic();
            return;
        }

        // Magia: il browser cattura i frame e applica la cascata CSS!
        document.startViewTransition(() => {
            toggleThemeLogic();
        });
    });
});

/* =========================================
   GESTIONE MENU LATERALE (Off-Canvas Push)
   ========================================= */

const menuBtn = document.getElementById('menu-btn');
const sideMenu = document.getElementById('side-menu');
const body = document.body;
// Selezioniamo solo i link del menu che portano ad ancore interne (es. #projects)
const anchorLinks = document.querySelectorAll('.anchor-link');

// 1. Apri/Chiudi il menu cliccando il bottone
menuBtn.addEventListener('click', () => {
    body.classList.toggle('menu-open');
});

// 2. Chiudi il menu se clicchi un link che porta a una sezione della stessa pagina (es. Projects)
anchorLinks.forEach(link => {
    link.addEventListener('click', () => {
        body.classList.remove('menu-open');
    });
}); 

document.addEventListener('DOMContentLoaded', () => {
    // 1. Selezioniamo gli attori del carosello
    const track = document.querySelector('.carousel-track');
    if (!track) return; // Se non c'è il carosello, ferma lo script
    
    const slides = Array.from(track.querySelectorAll('.carousel-slide'));
    const buttons = document.querySelectorAll('.carousel-button');
    
    // Assumiamo che il primo bottone sia Indietro e il secondo sia Avanti
    const prevButton = buttons[0];
    const nextButton = buttons[1];
    
    let currentSlideIndex = 0; // Partiamo dalla prima slide

    // 2. La funzione che sposta letteralmente le classi
    const updateCarousel = (newIndex) => {
        // Spegne la slide vecchia
        slides[currentSlideIndex].classList.remove('current-slide');
        // Aggiorna l'indice
        currentSlideIndex = newIndex;
        // Accende la slide nuova
        slides[currentSlideIndex].classList.add('current-slide');
    };

    // 3. Logica AVANTI (Loop: se supero l'ultima, torno a 0)
    nextButton.addEventListener('click', () => {
        const newIndex = (currentSlideIndex + 1) % slides.length;
        updateCarousel(newIndex);
    });

    // 4. Logica INDIETRO (Loop: se vado sotto lo 0, vado all'ultima)
    prevButton.addEventListener('click', () => {
        const newIndex = (currentSlideIndex - 1 + slides.length) % slides.length;
        updateCarousel(newIndex);
    });
});

/* =========================================
   MOTORE FISICO: CAROSELLO LOGHI INTERATTIVO (V2 - Fluido & Bilanciato)
   ========================================= */

window.addEventListener('load', () => {
    const track = document.querySelector('.logo-carousel-track');
    if (!track) return;

    let singleGroupWidth = track.querySelector('.logo-group').offsetWidth;
    let currentX = 0;        
    let velocity = 0;        
    let isDragging = false;  
    let startX = 0;          
    let lastX = 0;           
    
// Parametri Fisici Calibrati (Alta Fluidità)
    const autoScrollSpeed = -0.5; 
    const dragSensitivity = 0.85; // Aumentato dal 35% all'85%. Il nastro ora segue quasi 1:1 il tuo mouse.
    const maxVelocity = 18;       // Alzato da 12 a 18. Permette uno slancio iniziale più appagante, ma lo blocca prima che diventi invisibile.
    const friction = 0.975;       // LA MAGIA: Ora perde solo il 2.5% di energia a frame. Scivolerà a luuuungo prima di fermarsi.
    
    let isAutoScrolling = true;
    let resumeTimeout;
    // --- RADAR LASER: Tracciamento Mouse ---
    let mouseX = -1;
    let mouseY = -1;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouseX = -1;
        mouseY = -1;
    });      

    window.addEventListener('resize', () => {
        singleGroupWidth = track.querySelector('.logo-group').offsetWidth;
    });

    const startDrag = (e) => {
        isDragging = true;
        isAutoScrolling = false;
        clearTimeout(resumeTimeout); 

        track.classList.add('is-dragging');
        
        startX = e.pageX || e.touches[0].pageX;
        lastX = startX;
        velocity = 0; 
    };

    const onDrag = (e) => {
        if (!isDragging) return;
        
        // 🚨 IL FAIL-SAFE (ANTI-STICKY DRAG) 🚨
        // Controlliamo fisicamente a livello hardware se il tasto del mouse è premuto.
        // e.buttons restituisce 0 se nessun tasto è premuto.
        // Se ci stiamo muovendo col mouse e nessun tasto è giù, ma isDragging è true,
        // significa che abbiamo perso il segnale. Sganciamo il carosello forzatamente!
        if (e.type === 'mousemove' && e.buttons === 0) {
            stopDrag();
            return;
        }

        e.preventDefault(); 
        
        const currentPosition = e.pageX || e.touches[0].pageX;
        
        // 1. Calcoliamo lo spostamento grezzo
        const rawDelta = currentPosition - lastX;
        
        // 2. Applichiamo lo smorzamento per renderlo meno schizofrenico
        const smoothedDelta = rawDelta * dragSensitivity;
        
        currentX += smoothedDelta;
        
        // 3. CLAMP (Limite): Impediamo alla velocità di superare i +/- 12 pixel per frame
        velocity = Math.max(-maxVelocity, Math.min(maxVelocity, smoothedDelta)); 
        
        lastX = currentPosition;
    };

    const stopDrag = () => {
        if (!isDragging) return;
        isDragging = false;

        track.classList.remove('is-dragging');

        resumeTimeout = setTimeout(() => {
            isAutoScrolling = true;
        }, 2000); // Abbassato a 2 secondi per una ripresa più reattiva
    };

    track.addEventListener('mousedown', startDrag);
    // FIX NATIVE DRAG: Uccide l'evento di "drag & drop" nativo del sistema operativo
    track.addEventListener('dragstart', (e) => e.preventDefault());
    window.addEventListener('mousemove', onDrag);
    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('mouseleave', stopDrag);

    track.addEventListener('touchstart', startDrag, { passive: true });
    window.addEventListener('touchmove', onDrag, { passive: false });
    window.addEventListener('touchend', stopDrag);

    let frameCounter = 0;
    
// CACHING: Salviamo in memoria la lista di tutti i loghi una volta sola
    const allCarouselLogos = track.querySelectorAll('img');

    const renderEngine = () => {
        if (isAutoScrolling) {
            velocity += (autoScrollSpeed - velocity) * 0.05;
        } else if (!isDragging) {
            // Frizione per rallentare dolcemente
            velocity *= friction;
        }

        currentX += velocity;

        // Teletrasporto matematico per il loop infinito
        if (currentX <= -singleGroupWidth) {
            currentX += singleGroupWidth; 
        } else if (currentX >= 0) {
            currentX -= singleGroupWidth; 
        }

        // LA MAGIA DELLA FLUIDITÀ: usiamo translate3d invece di translateX.
        // Questo obbliga la Scheda Video (GPU) ad elaborare l'animazione, 
        // annullando totalmente la "macchinosità" (jittering) della CPU.
        track.style.transform = `translate3d(${currentX}px, 0, 0)`;

        frameCounter++;

       // LA MAGIA: Eseguiamo il raggio laser solo 1 volta ogni 5 frame!
        // (Riduciamo il carico del processore dell'80%)
        if (frameCounter % 5 === 0) {
            if (!isDragging && mouseX !== -1) {
                const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
                // USA LA VARIABILE SALVATA (Più veloce del 1000%)
                allCarouselLogos.forEach(img => img.classList.remove('is-hovered'));
                
                if (elementUnderMouse && elementUnderMouse.tagName === 'IMG' && elementUnderMouse.closest('.logo-group')) {
                    elementUnderMouse.classList.add('is-hovered');
                }
            } else {
                allCarouselLogos.forEach(img => img.classList.remove('is-hovered'));
            }
        }

        requestAnimationFrame(renderEngine);
    };

    renderEngine();
});

/* =========================================
   SPA MODAL ENGINE (Orchestrazione Eventi)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    const modalOverlay = document.getElementById('sys-modal-overlay');
    const modals = document.querySelectorAll('.sys-modal');
    const closeBtns = document.querySelectorAll('.modal-close-btn');
    const modalTriggers = document.querySelectorAll('[data-modal]');

    // 1. INNESCO (Spatial-Aware Engine)
    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.preventDefault(); 

            const targetModalId = trigger.getAttribute('data-modal');
            const targetSectionId = trigger.getAttribute('href');
            
            const targetSection = document.querySelector(targetSectionId);
            const targetModal = document.getElementById(targetModalId);

            if (!targetModal || !targetSection) return;

            // --- LA MAGIA: Calcolo Matematico della Distanza ---
            const rect = targetSection.getBoundingClientRect();
            // Troviamo il centro esatto della sezione bersaglio
            const sectionCenter = rect.top + (rect.height / 2); 
            // Troviamo il centro esatto del monitor dell'utente
            const viewportCenter = window.innerHeight / 2; 
            // Calcoliamo la distanza assoluta in pixel tra i due centri
            const distanceFromCenter = Math.abs(sectionCenter - viewportCenter);

            // Definiamo una "Tolleranza": se lo scarto è minore di 150px, lo consideriamo "già centrato"
            const isAlreadyCentered = distanceFromCenter < 150; 

            const isMenuOpen = document.body.classList.contains('menu-open');

            if (isMenuOpen) {
                // SCENARIO 1: L'utente ha cliccato dal Menu Laterale
                document.body.classList.remove('menu-open');
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                // Il menu scuro ci mette 0.6s fisici a chiudersi. 
                // Se la sezione è già lì, aspettiamo solo il tempo che il menu si tolga di mezzo (600ms).
                // Se la sezione è lontana, diamo il tempo del viaggio allo scroll (850ms).
                const delay = isAlreadyCentered ? 600 : 850;
                
                setTimeout(() => {
                    openModal(targetModal);
                }, delay); 

            } else {
                // SCENARIO 2: L'utente ha cliccato da un link direttamente sulla pagina
                if (isAlreadyCentered) {
                    // ZERO LAG: Il bersaglio è sotto tiro, innesco immediato (Nessuno scroll, nessuna attesa)
                    openModal(targetModal);
                } else {
                    // Bersaglio lontano: Inizia lo scroll e calcola il tempo di viaggio
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setTimeout(() => {
                        openModal(targetModal);
                    }, 850);
                }
            }
        });
    });

    // 2. FUNZIONE DI DEPLOY (Apertura)
    const openModal = (modalNode) => {
        // Blocchiamo fisicamente lo scroll della pagina in background
        document.body.classList.add('modal-open'); 
        
        // Accendiamo lo strato oscuro
        modalOverlay.classList.add('is-active');

        // requestAnimationFrame forza il browser a dipingere l'overlay nero 
        // PRIMA di sparare l'animazione di espansione (elimina scatti grafici)
        requestAnimationFrame(() => {
            modalNode.classList.add('is-open');
        });
    };

    // 3. FUNZIONE DI TERMINAZIONE (Chiusura)
    const closeModal = () => {
        // Sblocchiamo la pagina
        document.body.classList.remove('modal-open');
        // Spegniamo lo strato oscuro
        modalOverlay.classList.remove('is-active');
        // Ripristiniamo la geometria di tutti i popup
        modals.forEach(m => m.classList.remove('is-open'));
    };

    // 4. EVENTI DI CHIUSURA FAIL-SAFE
    // Clic sulla 'X'
    closeBtns.forEach(btn => btn.addEventListener('click', closeModal));
    
    // Clic in un punto morto dello schermo (overlay nero)
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    // Pressione del tasto ESC sulla tastiera (Accessibilità Terminale)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.body.classList.contains('modal-open')) {
            closeModal();
        }
    });
}); 

/* =========================================
   IDE SCROLLSPY ENGINE (Active File Tracker)
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // Cerchiamo tutti i moduli IDE (così funzionerà anche per i progetti futuri)
    const ideModals = document.querySelectorAll('.sys-modal-ide');
    
    ideModals.forEach(modal => {
        const scrollContainer = modal.querySelector('.ide-content');
        const sections = modal.querySelectorAll('.ide-section');
        const links = modal.querySelectorAll('.ide-file');
        
        // Se manca uno degli elementi, fermiamo lo script per evitare errori
        if (!scrollContainer || sections.length === 0 || links.length === 0) return;

        // Configurazione del Radar: 
        // Guarda dentro il pannello che scorre. Quando una sezione entra 
        // nella metà superiore dello schermo, innesca il cambio.
        const observerOptions = {
            root: scrollContainer,
            rootMargin: '-10% 0px -60% 0px', 
            threshold: 0
        };

        const observerCallback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // 1. Troviamo l'ID della sezione attualmente in lettura (es: "proj-arch")
                    const currentId = entry.target.id;
                    
                    // 2. Spegniamo tutti i file nell'Explorer
                    links.forEach(l => l.classList.remove('active'));
                    
                    // 3. Troviamo il file con l'href corrispondente e lo accendiamo
                    const activeLink = modal.querySelector(`.ide-file[href="#${currentId}"]`);
                    if (activeLink) {
                        activeLink.classList.add('active');
                    }
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);
        
        // Diciamo al radar di osservare ogni singola sezione del report
        sections.forEach(sec => observer.observe(sec));
        
        // --- UX Iistantanea (Fallback) ---
        // Se l'utente clicca, diamo un feedback visivo immediato senza aspettare lo scorrimento
        links.forEach(link => {
            link.addEventListener('click', function() {
                links.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
            });
        });
    });

});

/* =========================================
   GHOST BRANDING SENSOR (Menu-Freeze Fix)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const scrollThreshold = 350; 

    window.addEventListener('scroll', () => {
        // IL FRENO A MANO: Se il menu è aperto, il radar si congela e ignora i falsi valori di scroll.
        // SOSTITUISCI 'menu-open' con la classe reale che usa il tuo menu!
        if (body.classList.contains('menu-open')) return;

        window.requestAnimationFrame(() => {
            if (window.scrollY > scrollThreshold) {
                body.classList.add('is-scrolled');
            } else {
                body.classList.remove('is-scrolled');
            }
        });
    }, { passive: true });
});

/* =========================================
   IDE FOLDER TOGGLE ENGINE (Collapse/Expand)
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    // Selezioniamo tutte le cartelle cliccabili, escludendo la Root principale
    const ideFolders = document.querySelectorAll('.ide-folder:not(.root-folder)');
    
    ideFolders.forEach(folder => {
        folder.addEventListener('click', () => {
            // Aggiunge o toglie la classe che fa scattare l'animazione CSS
            folder.classList.toggle('is-collapsed');
        });
    });
});

/* =========================================
   LANGUAGE SWITCHER
   ========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const langToggle = document.getElementById('lang-toggle');
    const langSwitcher = langToggle.parentElement;

    // Apre/Chiude il menu lingua
    langToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Evita che il click si propaghi al document
        langSwitcher.classList.toggle('is-open');
    });

    // Chiude il menu se clicchi in qualsiasi altra parte del sito
    document.addEventListener('click', (e) => {
        if (!langSwitcher.contains(e.target)) {
            langSwitcher.classList.remove('is-open');
        }
    });
});

/* =========================================
   TRANSLATION ENGINE (i18n)
   ========================================= */

const translations = {
    en: {
        nav_home: "Home",
        nav_about: "About Me",
        nav_focus: "Core Focus",
        nav_skills: "Skills",
        nav_projects: "Projects",
        header_subtitle: "Computer Science Student @ UnivAQ | Privacy Advocate & System Hardening Enthusiast",
        
        about_title: "About Me",
        about_p1: "I am a second-year Computer Science student at the <a href=\"https://www.univaq.it\" target=\"_blank\" rel=\"noopener noreferrer\">University of L'Aquila (UnivAQ)</a>.",
        about_p2: "My journey in Information Technology began with a fundamental goal: achieving <strong>Digital Sovereignty</strong>. What started as a practical effort to optimize personal devices and mitigate corporate telemetry has evolved into a rigorous academic and professional pursuit. I am deeply interested in system architecture, data privacy, and building secure infrastructures from the ground up.",
        
        focus_title: "Core Focus & Career Goals",
        focus_p1: "My objective is to specialize in areas where system performance and proactive security intersect:",
        focus_li1: "<strong>Blue Teaming & Network Defense:</strong> Traffic analysis and infrastructure monitoring.",
        focus_li2: "<strong>Device Optimization & Hardening:</strong> Attack surface reduction and bare-metal OS tuning.",
        focus_li3: "<strong>DevSecOps & Cloud Security:</strong> Designing sovereign and automated cloud environments.",
        
        skills_title: "Technical Competencies",
        skills_context: "Driven by a need for <strong>digital autonomy</strong>, I have built this technical stack through rigorous self-directed study and hands-on experimentation. I view these tools not as static endpoints, but as a foundation for a constantly evolving horizon in systems security and architecture.",
        skills_li1: "<strong>Bare-Metal & OS Hardening:</strong> Arch Linux, Windows (AtlasOS), Android custom environments. Focus on telemetry stripping and attack surface reduction.",
        skills_li2: "<strong>Network Defense & Routing:</strong> TCP/IP, Wireguard VPNs, Pi-hole. Designing zero-trust local environments and DNS-level traffic filtering.",
        skills_li3: "<strong>Infrastructure & DevSecOps:</strong> Docker containerization for strict service isolation, Git version control, and Markdown/Obsidian for technical documentation.",
        skills_li4: "<strong>Software & Web Engineering:</strong> Vanilla JS, Semantic HTML, CSS3, Python. Building lightweight, 'Zero-Dependency' and hardware-accelerated architectures.",
        
        projects_title: "Projects & Portfolio",
        projects_desc: "This space will be regularly updated with technical write-ups and code repositories as my projects reach completion. I am currently focusing on:",
        proj1_title: "Web Portfolio (Static)",
        proj1_desc: "Developing a privacy-respecting static personal website. Built locally, zero external trackers, semantic HTML & Vanilla JS.",
        proj1_link: "View Architecture & More >_",
        proj2_title: "Home Server Infrastructure",
        proj2_desc: "Designing a bare-metal local server (Raspberry Pi). Focused on network-wide DNS filtering (Pi-hole) and private VPN routing.",
        proj_wip: "Work In Progress >_",
        proj3_title: "Docker Containerization",
        proj3_desc: "Microservices architecture blueprint. Isolating local services to maintain the host OS clean, secure, and fully portable.",
        
        footer_title: "Contact & Links",
        footer_email: "Email Me",
        footer_github: "GitHub Profile",
        footer_copy: "© 2026 Flavius. Built locally with a strict focus on privacy.",
        
        modal_about_title: "About Me",
        modal_about_p1: "I am a second-year Computer Science student at the University of L'Aquila (UnivAQ), but my real education began much earlier. Growing up with the internet, I was driven by a practical need: I hated friction. I was looking for the ultimate \"user-friendly\" experience.",
        modal_about_p2: "It all started around the age of 14. My obsession wasn't writing code, but finding flaws in systems. I tinkered with adblockers and patched versions of everyday apps. I remember when I used to create chains of accounts to endlessly extend the 14-day PS Plus free trial, allowing my friends to play online for free. What seemed like just a trick to save money back then was actually my first approach to system manipulation.",
        modal_about_p3: "Today, that instinct to bend the rules to my advantage has evolved into a rigorous pursuit of <strong>Digital Sovereignty</strong>. My playground is Operating Systems: I use AtlasOS to strip down the attack surface on Windows to the bare minimum and get a great gaming experience. I even managed to configure Arch Linux with Hyprland on a dreaded Intel+Nvidia combo (then I broke everything again, obviously). But that's my philosophy: I'm not afraid to destroy a system, because I know that by exploring the wreckage I'll learn how to rebuild it in a more solid and secure way.",
        modal_about_p4: "This approach is reflected in everything I love. Besides being a fan of JDM cars and video games, I live and breathe Japanese Fusion music like Masayoshi Takanaka and Casiopea.",
        
        modal_focus_title: "Core Focus & Career Goals",
        modal_focus_p1: "I don't just want to write code or deploy servers; I want to understand exactly how they break. My current technical journey is driven by a profound curiosity for reverse engineering: taking existing, heavy, or vulnerable projects and 'dissecting' them to their core components.",
        modal_focus_p2: "I am in a phase of deep exploration. I spend my time stripping away telemetry, cutting out bloatware, and hardening systems to see how much I can secure a machine before it stops functioning. It’s an exercise in extreme minimalization and digital sovereignty.",
        modal_focus_p3: "As for my long-term career, I am equally fascinated by two paths: the analytical thrill of Blue Teaming (hunting active threats and analyzing traffic) and the architectural elegance of DevSecOps (building automated, secure-by-design cloud infrastructures). Regardless of the exact title I will hold, my ultimate goal remains the same: mastering the bare-metal logic of systems to build environments that answer to no one but their owner.",
        
        modal_skills_title: "Technical Competencies",
        modal_skills_p1: "My approach to technology is strictly utilitarian and security-first. I don't use tools simply because they are industry standards; I use them because they offer transparency and absolute control over the system state. If a software acts like a black box, it's a liability.",
        modal_skills_p2: "My networking philosophy is based on \"Zero Trust\" and local sovereignty. I route my traffic through custom Wireguard tunnels and utilize Pi-hole for network-wide DNS sinkholing, blocking trackers and malicious domains before they even reach the end devices. Furthermore, everything I self-host is strictly containerized via Docker to prevent privilege escalation and ensure total isolation.",
        modal_skills_p3: "When it comes to software engineering, I apply the same \"Hardening\" principles. I prioritize Zero-Dependency architectures. Using Vanilla JS and raw CSS isn't just a stylistic choice; it's a deliberate security measure to avoid importing vulnerable third-party modules and to keep the codebase lightweight and fully auditable.",
        
        ide_explorer: "EXPLORER",
        ide_proj_overview_title: "Web Portfolio (Static)",
        ide_proj_overview_p1: "The goal of this project wasn't just to create a space to showcase my work, but to demonstrate a concept I strongly believe in: <strong>the integrity and security of a system start from the foundation.</strong>",
        ide_proj_overview_p2: "Today we are used to seeing constant data breaches or unnecessarily heavy websites, often caused by a certain architectural laziness. There's a tendency to import dozens of third-party external libraries without really knowing what they do under the hood. For this portfolio, I chose a different path: a strict <em>Zero-Dependencies</em> philosophy. No heavy frameworks, just semantic HTML, Vanilla JS, and pure CSS3.",
        ide_proj_overview_p3: "This approach not only eliminates trackers and drastically reduces the attack surface, but it also answers a personal principle of mine: things must simply <em>work well</em> for everyone. Whether you're browsing from a high-end workstation or a 400-euro laptop, this site will remain fluid, lightweight, and above all, will fully respect your privacy.",
        
        ide_proj_arch_title: "Architecture & Workflow",
        ide_proj_arch_p1: "In life and in projects, I appreciate a very specific mindset: minimum effort, maximum gain. This doesn't mean working less, but working <em>better</em>, optimizing resources. For me, a digital product must simply work, and it must do so at peak performance regardless of the hardware.",
        ide_proj_arch_p2: "To achieve this level of total control, I structured the development into very rigorous phases:",
        ide_proj_arch_li1: "<strong>Bare-Metal Study:</strong> Before touching CSS or complex scripts, I started from the basics. I filled pages of notes studying the native behavior of HTML, the DOM structure, anchors, and space management.",
        ide_proj_arch_li2: "<strong>AI-Assisted Development:</strong> Once the architecture was clear, I integrated Artificial Intelligence with a strict hierarchy: I provided the brains, the AI got its hands dirty. I used it as a true \"Tactical Executor\". I defined the engineering direction, the logical choices, and the security constraints, delegating the physical writing of the code to it.",
        ide_proj_arch_p3: "Implementing, testing, and manually \"dissecting\" the generated code allowed me to avoid memorizing anything in a sterile way. On the contrary, it helped me internalize the intimate <em>inner workings</em> of the site. Thanks to this workflow, today I know every millimeter of this project and possess the know-how to expand and modify it with total autonomy.",
        
        ide_proj_chall_title: "Engineering Challenges (UI/UX)",
        ide_proj_chall_p1: "Creating an interface that felt \"alive\" and responsive to the touch, while refusing to use conveniences like animation frameworks (e.g., GSAP), required a lot of creativity and a few headaches.",
        ide_proj_chall_p2: "The first major challenge was text animation. I didn't want the usual static block appearance; I wanted a natural, soft, and fluid <em>flow</em>, which I dubbed the <strong>\"Lego Effect\"</strong>. To achieve this, I engineered a script that destroys and rebuilds the text DOM in real-time:",
        ide_proj_chall_p3: "By injecting a random CSS variable (<code>--random-delay</code>) for every single word, the CSS hardware-accelerates an asymmetrical falling animation. The result is an incredibly organic rain of characters.",
        
        ide_proj_code_title: "Core Snippets: The Carousel Physics Engine",
        ide_proj_code_p1: "The <strong>interactive logo carousel</strong> helped me understand the fundamental concepts of hardware optimization. Instead of using pre-packaged sliders (like Swiper or Slick) that would have added dozens of useless Kilobytes of dead weight, I wrote a physics engine from scratch, based on vector mouse tracking.",
        ide_proj_code_p2: "Why is this code block solid from an engineering standpoint?",
        ide_proj_code_li1: "<strong>Anti-Sticky Bug:</strong> By brute-force reading the hardware state of the mouse (<code>e.buttons === 0</code>), we avoid the annoying glitch where the carousel stays glued to the cursor if the user exits the window while clicking.",
        ide_proj_code_li2: "<strong>Rev Limiter:</strong> The use of <code>Math.max/min</code> acts as a \"disc brake\", preventing overly sudden movements from launching the images at impossible-to-render speeds.",
        ide_proj_code_li3: "<strong>Zero CPU Bottleneck:</strong> This script limits itself to calculating the math of the <code>currentX</code> variable. The actual movement on the screen is delegated to an isolated <code>requestAnimationFrame</code> that uses <code>translate3d</code>, forcing the Graphics Card (GPU) to do the heavy lifting. No lag, a solid 60 frames per second."
    },
    it: {
        nav_home: "Home",
        nav_about: "Chi Sono",
        nav_focus: "Focus Principale",
        nav_skills: "Competenze",
        nav_projects: "Progetti",
        header_subtitle: "Studente di Informatica @ UnivAQ | Sostenitore della Privacy & Appassionato del System Hardening",
        
        about_title: "Chi Sono",
        about_p1: "Sono uno studente al secondo anno di Informatica presso l'<a href=\"https://www.univaq.it\" target=\"_blank\" rel=\"noopener noreferrer\">Università dell'Aquila (UnivAQ)</a>.",
        about_p2: "Il mio percorso nell'Information Technology è iniziato con un obiettivo fondamentale: raggiungere la <strong>Sovranità Digitale</strong>. Quello che è nato come un tentativo pratico di ottimizzare i dispositivi personali e mitigare la telemetria aziendale si è evoluto in una rigorosa ricerca accademica e professionale. Sono profondamente interessato all'architettura dei sistemi, alla privacy dei dati e alla costruzione di infrastrutture sicure partendo dalle basi.",
        
        focus_title: "Focus Principale & Obiettivi",
        focus_p1: "La mia ricerca attuale si colloca all'intersezione tra la decostruzione dei sistemi e l'architettura sicura. Prima di costruire sistemi inespugnabili, credo sia vitale smontare quelli esistenti per capirne le falle:",
        focus_li1: "<strong>Decostruzione & Hardening:</strong> Disossare OS e reti per ridurre al minimo la superficie d'attacco.",
        focus_li2: "<strong>Fondamenti di Blue Teaming:</strong> Capire come i sistemi vengono compromessi per poterli difendere.",
        focus_li3: "<strong>Architettura Infrastrutturale:</strong> Imparare a progettare ambienti sicuri e privati 'by design'.",
        
        skills_title: "Competenze Tecniche",
        skills_context: "Spinto dal bisogno di <strong>autonomia digitale</strong>, ho costruito questo stack tecnico attraverso un rigoroso studio autodidatta e sperimentazione pratica. Non vedo questi strumenti come punti di arrivo statici, ma come fondamento per un orizzonte in continua evoluzione nella sicurezza e architettura dei sistemi.",
        skills_li1: "<strong>Bare-Metal & OS Hardening:</strong> Arch Linux, Windows (AtlasOS), ambienti Android custom. Focus su rimozione della telemetria e riduzione della superficie d'attacco.",
        skills_li2: "<strong>Network Defense & Routing:</strong> TCP/IP, VPN Wireguard, Pi-hole. Progettazione di ambienti locali zero-trust e filtraggio del traffico a livello DNS.",
        skills_li3: "<strong>Infrastruttura & DevSecOps:</strong> Containerizzazione Docker per l'isolamento dei servizi, versioning Git e Markdown/Obsidian per la documentazione tecnica.",
        skills_li4: "<strong>Software & Web Engineering:</strong> Vanilla JS, HTML Semantico, CSS3, Python. Sviluppo di architetture leggere, 'Zero-Dependency' e accelerate via hardware.",
        
        projects_title: "Progetti & Portfolio",
        projects_desc: "Questo spazio verrà aggiornato regolarmente con documentazione tecnica e repository di codice man mano che i miei progetti giungono al termine. Attualmente mi sto concentrando su:",
        proj1_title: "Web Portfolio (Statico)",
        proj1_desc: "Sviluppo di un sito web personale statico e rispettoso della privacy. Costruito in locale, zero tracker esterni, HTML semantico e Vanilla JS.",
        proj1_link: "Visualizza Architettura e altro >_",
        proj2_title: "Infrastruttura Home Server",
        proj2_desc: "Progettazione di un server locale bare-metal (Raspberry Pi). Focus sul filtraggio DNS a livello di rete (Pi-hole) e routing VPN privato.",
        proj_wip: "Work In Progress >_",
        proj3_title: "Containerizzazione con Docker",
        proj3_desc: "Prototipo di architettura a microservizi. Isolamento dei servizi locali per mantenere il sistema host pulito, sicuro e completamente portatile.",
        
        footer_title: "Contatti & Link",
        footer_email: "Email",
        footer_github: "Profilo GitHub",
        footer_copy: "© 2026 Flavius. Sviluppato localmente con un focus rigoroso sulla privacy.",
        
        modal_about_title: "Chi Sono",
        modal_about_p1: "Sono uno studente al secondo anno di Informatica all'Università dell'Aquila (UnivAQ), ma la mia vera educazione è iniziata molto prima, spinta da una necessità pratica: odiavo gli attriti. Cercavo l'esperienza \"user-friendly\" definitiva.",
        modal_about_p2: "Tutto è partito intorno ai 14 anni. La mia ossessione non era scrivere codice, ma trovare le falle nei sistemi. Smanettavo con adblocker e versioni patchate delle app di uso quotidiano. Ricordo quando creavo catene di account principali per estendere all'infinito i 14 giorni gratuiti di PS Plus, permettendo ai miei amici di giocare a costo zero. Quello che allora sembrava solo un trucco per risparmiare, era in realtà il mio primo approccio alla manipolazione dei sistemi.",
        modal_about_p3: "Oggi, quell'istinto di piegare le regole dell'hardware a mio vantaggio si è evoluto in una rigorosa ricerca della <strong>Sovranità Digitale</strong>. Il mio terreno di gioco sono i Sistemi Operativi: uso AtlasOS per ridurre all'osso l'attacco di superficie su Windows e non ho il minimo timore di sporcarmi le mani. Sono persino riuscito a configurare Arch Linux con Hyprland su una tremenda accoppiata Intel+Nvidia. Poi ho rotto tutto di nuovo, ovviamente. Ma è questa la mia filosofia: non ho paura di distruggere un sistema, perché so che esplorando i cocci imparerò a ricostruirlo in modo più solido e sicuro.",
        modal_about_p4: "Questo approccio si riflette in tutto ciò che amo. Oltre a essere un appassionato di motori JDM e di videogiochi (da <em>Persona 5</em> a <em>Catherine</em>), vivo di musica Fusion giapponese come Masayoshi Takanaka o i Casiopea.",
        
        modal_focus_title: "Focus Principale & Obiettivi",
        modal_focus_p1: "Non voglio limitarmi a scrivere codice o configurare server; voglio capire esattamente come si rompono. Il mio attuale percorso tecnico è guidato da una profonda curiosità per il reverse engineering: prendere progetti esistenti, pesanti o vulnerabili, e 'disossarli' fino alle loro componenti fondamentali.",
        modal_focus_p2: "Mi trovo in una fase di esplorazione profonda. Passo il tempo a estirpare telemetria, rimuovere bloatware e fare hardening sui sistemi per vedere fino a che punto posso blindare una macchina prima che smetta di funzionare. È un esercizio di minimalismo estremo e sovranità digitale.",
        modal_focus_p3: "Per quanto riguarda la mia carriera a lungo termine, sono ugualmente affascinato da due strade: il brivido analitico del Blue Teaming (dare la caccia alle minacce e analizzare il traffico) e l'eleganza architetturale del DevSecOps (costruire infrastrutture cloud automatizzate e sicure di base). A prescindere dal titolo esatto che avrò, il mio obiettivo finale resta lo stesso: padroneggiare la logica bare-metal dei sistemi per costruire ambienti che non debbano rispondere a nessuno se non al proprio proprietario.",
        
        modal_skills_title: "Competenze Tecniche",
        modal_skills_p1: "Il mio approccio alla tecnologia è strettamente utilitaristico e orientato alla sicurezza. Non uso strumenti solo perché sono standard del settore; li uso perché offrono trasparenza e controllo assoluto sullo stato del sistema. Se un software si comporta come una scatola nera, è una vulnerabilità.",
        modal_skills_p2: "La mia filosofia di networking si basa sullo \"Zero Trust\" e sulla sovranità locale. Instrado il mio traffico attraverso tunnel Wireguard custom e utilizzo Pi-hole per il DNS sinkholing a livello di rete, bloccando tracker e domini malevoli prima ancora che raggiungano i dispositivi. Inoltre, tutto ciò che ospito localmente è rigorosamente containerizzato tramite Docker per prevenire la scalata dei privilegi e garantire un isolamento totale.",
        modal_skills_p3: "Nello sviluppo software, applico gli stessi principi di \"Hardening\". Privilegio architetture Zero-Dependency. Usare Vanilla JS e CSS puro non è solo una scelta stilistica; è una misura di sicurezza deliberata per evitare di importare moduli di terze parti vulnerabili e per mantenere il codice leggero e completamente ispezionabile.",
        
        ide_explorer: "ESPLORA RISORSE",
        ide_proj_overview_title: "Web Portfolio (Statico)",
        ide_proj_overview_p1: "L'obiettivo di questo progetto non era solo creare uno spazio per mostrare il mio lavoro, ma dimostrare un concetto in cui credo fermamente: <strong>l'integrità e la sicurezza di un sistema partono dalle fondamenta.</strong>",
        ide_proj_overview_p2: "Oggi siamo abituati a vedere continui data breach o siti inutilmente pesanti, spesso causati da una certa pigrizia architetturale. C'è la tendenza a importare dozzine di librerie esterne senza sapere cosa facciano sotto il cofano. Per questo portfolio, ho scelto una strada diversa: una rigorosa filosofia <em>Zero-Dependencies</em>. Nessun framework pesante, solo HTML semantico, Vanilla JS e puro CSS3.",
        ide_proj_overview_p3: "Questo approccio non solo elimina i tracker e riduce la superficie d'attacco, ma risponde a un mio principio personale: le cose devono semplicemente <em>funzionare bene</em> per tutti. Che tu stia navigando da una workstation di fascia alta o da un portatile da 400 euro, questo sito rimarrà fluido, leggero e rispetterà totalmente la tua privacy.",
        
        ide_proj_arch_title: "Architettura & Workflow",
        ide_proj_arch_p1: "Nella vita e nei progetti apprezzo una forma mentis precisa: minimo sforzo, massimo guadagno. Questo non significa lavorare meno, ma lavorare <em>meglio</em>, ottimizzando le risorse. Un prodotto digitale deve semplicemente funzionare, e deve farlo al massimo delle prestazioni a prescindere dall'hardware.",
        ide_proj_arch_p2: "Per ottenere questo livello di controllo totale, ho strutturato lo sviluppo in fasi molto rigorose:",
        ide_proj_arch_li1: "<strong>Studio Bare-Metal:</strong> Prima di toccare CSS o script complessi, sono partito dalle basi studiando il comportamento nativo dell'HTML, la struttura del DOM, le ancore e la gestione degli spazi.",
        ide_proj_arch_li2: "<strong>Sviluppo AI-Assisted:</strong> Una volta chiara l'architettura, ho integrato l'Intelligenza Artificiale con una gerarchia netta: io ci mettevo il cervello, l'IA si sporcava le mani. L'ho usata come un vero 'Tactical Executor'. Io definivo la direzione ingegneristica, le scelte logiche e i vincoli di sicurezza, delegando a lei la stesura materiale del codice.",
        ide_proj_arch_p3: "Implementare, testare e 'sezionare' manualmente il codice generato mi ha permesso di non dover imparare nulla a memoria in modo sterile. Al contrario, mi ha aiutato a interiorizzare il <em>funzionamento intimo</em> del sito. Grazie a questo workflow, oggi conosco ogni millimetro di questo progetto e possiedo il know-how per espanderlo in totale autonomia.",
        
        ide_proj_chall_title: "Sfide Ingegneristiche (UI/UX)",
        ide_proj_chall_p1: "Creare un'interfaccia che sembrasse 'viva' e reattiva, rifiutando scorciatoie come i framework di animazione (es. GSAP), ha richiesto molta creatività e qualche mal di testa.",
        ide_proj_chall_p2: "La prima grande sfida è stata l'animazione del testo. Non volevo il solito blocco statico, ma un flusso naturale e morbido che ho ribattezzato <strong>\"Effetto Lego\"</strong>. Per ottenerlo, ho ingegnerizzato uno script che distrugge e ricostruisce il DOM del testo in tempo reale:",
        ide_proj_chall_p3: "Iniettando una variabile CSS casuale (<code>--random-delay</code>) per ogni parola, il CSS accelera via hardware un'animazione di caduta asimmetrica. Il risultato è una pioggia di caratteri incredibilmente organica.",
        
        ide_proj_code_title: "Core Snippets: Motore Fisico del Carosello",
        ide_proj_code_p1: "Il <strong>carosello interattivo dei loghi</strong> mi ha aiutato a capire i concetti fondamentali dell'ottimizzazione hardware. Invece di usare slider pre-fatti (come Swiper o Slick) che avrebbero aggiunto Kilobyte di peso inutile, ho scritto un motore fisico da zero basato sul tracking vettoriale del mouse.",
        ide_proj_code_p2: "Perché questo blocco di codice è solido dal punto di vista ingegneristico?",
        ide_proj_code_li1: "<strong>Anti-Sticky Bug:</strong> Leggendo brutalmente lo stato hardware del mouse (<code>e.buttons === 0</code>), evitiamo il glitch in cui il carosello rimane incollato al cursore se l'utente esce dalla finestra mentre clicca.",
        ide_proj_code_li2: "<strong>Limitatore di Giri:</strong> L'uso di <code>Math.max/min</code> funge da 'freno a disco', impedendo a movimenti troppo bruschi di lanciare le immagini a velocità impossibili da renderizzare.",
        ide_proj_code_li3: "<strong>Zero CPU Bottleneck:</strong> Questo script si limita a calcolare la matematica della variabile <code>currentX</code>. Il movimento effettivo su schermo è delegato a un <code>requestAnimationFrame</code> isolato che usa <code>translate3d</code>, forzando la GPU a fare il grosso del lavoro. Nessun lag, 60 frame al secondo fissi."
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const elementsToTranslate = document.querySelectorAll('[data-i18n]');
    const langButtons = document.querySelectorAll('.lang-btn');
    const currentLangLabel = document.getElementById('current-lang');
    const langSwitcher = document.getElementById('lang-toggle').parentElement;

function setLanguage(lang) {
        currentLangLabel.textContent = lang.toUpperCase();

        // FASE 1: Dissolvenza in uscita
        elementsToTranslate.forEach(el => {
            el.classList.add('is-translating');
        });

// FASE 2: Cambio testo e Re-innesco Motori
        setTimeout(() => {
            elementsToTranslate.forEach(el => {
                const translationKey = el.getAttribute('data-i18n');
                
                if (translations[lang] && translations[lang][translationKey]) {
                    // 1. Iniettiamo il testo grezzo tradotto
                    el.innerHTML = translations[lang][translationKey];
                    
                    // 2. FIX LEGO EFFECT: Aggiunte le classi del carosello
                    if (el.classList.contains('modal-animate-text') || 
                        el.classList.contains('slide-title') || 
                        el.classList.contains('slide-description')) {
                        
                        const words = el.innerText.split(' ');
                        el.innerHTML = ''; 
                        
                        words.forEach(word => {
                            const span = document.createElement('span');
                            span.classList.add('stagger-word');
                            span.innerHTML = word + '&nbsp;';
                            span.style.setProperty('--random-delay', Math.random());
                            el.appendChild(span);
                        });
                    }
                }
                
                // FASE 3: Dissolvenza in entrata
                el.classList.remove('is-translating');
            });
        }, 300);
    }

    langButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); 
            
            const targetLang = btn.getAttribute('data-lang');
            setLanguage(targetLang); 
            
            langSwitcher.classList.remove('is-open'); 
        });
    });
});

