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