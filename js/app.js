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
   MOTORE DEL CAROSELLO (STATE MANAGEMENT)
   ========================================= */

// 1. Mappatura del DOM: Diciamo a JS chi sono gli attori in gioco
const track = document.querySelector('.carousel-track');
const slides = Array.from(track.children);
const nextButton = document.querySelector('.next-btn');
const prevButton = document.querySelector('.prev-btn');

// 2. La funzione "Core" (Pura): Cambia lo stato delle classi
const moveToSlide = (currentSlide, targetSlide) => {
    // Sicurezza: se la slide di destinazione non esiste, blocca l'esecuzione
    if (!targetSlide) return;

    // Rimuove il "testimone" dalla slide vecchia (il CSS la farà cadere)
    currentSlide.classList.remove('current-slide');
    
    // Passa il "testimone" alla slide nuova (il CSS la farà salire)
    targetSlide.classList.add('current-slide');
};
// 3. Azione: Clicca a Destra (Avanti)
nextButton.addEventListener('click', () => {
    // JS cerca nel momento esatto del click quale slide ha la classe attiva
    const currentSlide = track.querySelector('.current-slide');
    
    // Trova l'elemento "fratello" successivo nel DOM
    const nextSlide = currentSlide.nextElementSibling;
    
    // Invoca la funzione di prima passandole i due elementi
    moveToSlide(currentSlide, nextSlide);
});

// 4. Azione: Clicca a Sinistra (Indietro)
prevButton.addEventListener('click', () => {
    const currentSlide = track.querySelector('.current-slide');
    
    // Trova l'elemento "fratello" precedente nel DOM
    const prevSlide = currentSlide.previousElementSibling;
    
    moveToSlide(currentSlide, prevSlide);
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