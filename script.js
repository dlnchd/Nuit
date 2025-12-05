// === GESTION DE L'APPLICATION ===
const app = {
    showHome: function() {
        document.getElementById('game-app').style.display = 'none';
        const landing = document.getElementById('landing-page');
        landing.style.display = 'block';
        setTimeout(() => landing.style.opacity = 1, 50);
        window.scrollTo(0, 0);
        // Réactiver les animations de scroll
        setupScrollReveal();
    },
    
    startGame: function() {
        const landing = document.getElementById('landing-page');
        landing.style.opacity = 0;
        setTimeout(() => {
            landing.style.display = 'none';
            const gameApp = document.getElementById('game-app');
            gameApp.style.display = 'block';
            gameApp.classList.add('active');
        }, 500);
        window.scrollTo(0, 0);
        game.start();
    }
};

// === SCROLL REVEAL ANIMATION (Apple Style) ===
function setupScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

document.addEventListener('DOMContentLoaded', () => {
    setupScrollReveal();
});

// === NOTIFICATIONS ===
function showToast(msg, type = 'info') {
    const area = document.getElementById('toast-area');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = 'ℹ️';
    if(type === 'success') icon = '✓'; // Minimalist check
    if(type === 'error') icon = '!';
    
    toast.innerHTML = `<span style="color:var(--apple-blue); font-weight:bold">${icon}</span> ${msg}`;
    area.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateY(-20px)';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// === MOTEUR DE JEU (Logique conservée) ===
const game = {
    level: 0,
    score: 0,
    maxLevels: 5,
    selectedWaste: null,
    wasteData: [],
    flippedCards: [],
    matchedPairs: 0,
    currentQuizIndex: 0,
    
    // Données Quiz
    quizData: [
        {
            question: "15 ordinateurs à acheter. Le choix durable ?",
            choices: [
                { txt: "Neuf premier prix.", points: 0, feedback: "Obsolescence rapide." },
                { txt: "Reconditionné pro + Linux.", points: 100, feedback: "Excellent choix." },
                { txt: "Tablettes grand public.", points: 20, feedback: "Difficile à réparer." }
            ]
        },
        {
            question: "Logiciel de montage vidéo ?",
            choices: [
                { txt: "Freeware avec pub.", points: 10, feedback: "Attention aux données." },
                { txt: "Suite Adobe (cher).", points: 30, feedback: "Puissant mais propriétaire." },
                { txt: "Kdenlive (Libre).", points: 100, feedback: "Libre et performant." }
            ]
        },
        {
            question: "Stockage des données ?",
            choices: [
                { txt: "Cloud Nuage (Éduc. Nat).", points: 100, feedback: "Souverain." },
                { txt: "Google Drive perso.", points: 0, feedback: "Problème RGPD." },
                { txt: "Clé USB.", points: 50, feedback: "Risque de perte." }
            ]
        }
    ],

    start: function() {
        this.level = 0;
        this.score = 0;
        this.render();
    },

    render: function() {
        document.getElementById('current-score').innerText = this.score;
        document.getElementById('progress-fill').style.width = `${(this.level / (this.maxLevels - 1)) * 100}%`;

        document.querySelectorAll('.game-screen').forEach((el, index) => {
            el.style.display = 'none';
            if (index === this.level) {
                el.style.display = 'block';
                el.classList.add('active'); // Trigger animation
            }
        });

        if (this.level === 0) this.initLvlPollution();
        if (this.level === 1) this.initLvlSorting();
        if (this.level === 2) this.initLvlMemory();
        if (this.level === 3) this.initLvlQuiz();
        if (this.level === 4) document.getElementById('final-score-display').innerText = this.score;
    },

    nextLevel: function() {
        this.level++;
        if(this.level < this.maxLevels) {
             showToast("Niveau terminé.", "success");
             setTimeout(() => this.render(), 600);
        } else {
            this.render();
        }
    },

    // --- NIVEAU 1 ---
    initLvlPollution: function() {
        const zone = document.getElementById('pollution-zone');
        zone.innerHTML = '';
        let items = 8;
        for(let i=0; i<items; i++) {
            const el = document.createElement('div');
            el.className = 'cloud-item';
            el.innerText = ['☁️','📧','💾','📺'][i%4];
            el.style.left = (Math.random() * 80 + 10) + '%';
            el.style.top = (Math.random() * 80 + 10) + '%';
            el.onclick = (e) => {
                e.target.style.transform = 'scale(0)';
                this.score += 5;
                document.getElementById('current-score').innerText = this.score;
                items--;
                if(items===0) setTimeout(() => this.nextLevel(), 500);
            };
            zone.appendChild(el);
        }
    },

    // --- NIVEAU 2 ---
    initLvlSorting: function() {
        this.wasteData = [
            { icon: '💻', type: 'repair', name: "PC lent" },
            { icon: '🔋', type: 'recycle', name: "Batterie" },
            { icon: '📱', type: 'repair', name: "Écran cassé" }
        ];
        this.renderWastePool();
    },

    renderWastePool: function() {
        const pool = document.getElementById('waste-items');
        pool.innerHTML = '';
        if(this.wasteData.length === 0) {
            setTimeout(() => this.nextLevel(), 800);
            return;
        }
        const item = this.wasteData[0];
        const el = document.createElement('div');
        el.style.fontSize = '4rem';
        el.innerText = item.icon;
        this.selectedWaste = item;
        pool.appendChild(el);
    },

    tryDrop: function(binType) {
        if(!this.selectedWaste) return;
        if(binType === 'trash') {
            showToast("Erreur. Ne jamais jeter.", "error");
            this.score -= 5;
        } else if (binType === this.selectedWaste.type) {
            showToast("Correct.", "success");
            this.score += 20;
            this.wasteData.shift();
            this.renderWastePool();
        } else {
            showToast("Mauvaise filière.", "error");
        }
        document.getElementById('current-score').innerText = this.score;
    },

    // --- NIVEAU 3 (Memory) ---
    initLvlMemory: function() {
        const pairs = [
            {id:1, txt:"Word", t:'p'}, {id:1, txt:"LibreOffice", t:'f'},
            {id:2, txt:"Chrome", t:'p'}, {id:2, txt:"Firefox", t:'f'},
            {id:3, txt:"Photoshop", t:'p'}, {id:3, txt:"GIMP", t:'f'},
            {id:4, txt:"Windows", t:'p'}, {id:4, txt:"Linux", t:'f'}
        ];
        pairs.sort(() => Math.random() - 0.5);
        const grid = document.getElementById('memory-grid');
        grid.innerHTML = '';
        this.flippedCards = [];
        this.matchedPairs = 0;

        pairs.forEach(p => {
            const el = document.createElement('div');
            el.className = 'choice-btn'; // Réutilisation style bouton
            el.style.textAlign = 'center';
            el.style.height = '80px';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';
            el.innerText = '?';
            
            el.onclick = () => {
                if(el.innerText !== '?' || this.flippedCards.length >= 2) return;
                el.innerText = p.txt;
                el.style.background = p.t === 'f' ? '#1c1c1e' : '#1c1c1e'; // Garder sombre
                el.style.color = p.t === 'f' ? '#34c759' : '#ff3b30'; // Vert ou Rouge
                this.flippedCards.push({el, p});
                
                if(this.flippedCards.length === 2) {
                    const [c1, c2] = this.flippedCards;
                    if(c1.p.id === c2.p.id && c1.p.t !== c2.p.t) {
                        this.score += 20;
                        this.matchedPairs++;
                        this.flippedCards = [];
                        if(this.matchedPairs === 4) setTimeout(() => this.nextLevel(), 800);
                    } else {
                        setTimeout(() => {
                            c1.el.innerText = '?'; c1.el.style.color = 'white';
                            c2.el.innerText = '?'; c2.el.style.color = 'white';
                            this.flippedCards = [];
                        }, 1000);
                    }
                    document.getElementById('current-score').innerText = this.score;
                }
            };
            grid.appendChild(el);
        });
    },

    // --- NIVEAU 4 (Quiz) ---
    initLvlQuiz: function() {
        this.currentQuizIndex = 0;
        this.loadQuiz();
    },
    loadQuiz: function() {
        const c = document.getElementById('quiz-container');
        c.innerHTML = '';
        if(this.currentQuizIndex >= this.quizData.length) {
            this.nextLevel(); return;
        }
        const q = this.quizData[this.currentQuizIndex];
        
        const h3 = document.createElement('h3');
        h3.innerText = q.question;
        h3.style.marginBottom = '20px';
        c.appendChild(h3);

        q.choices.forEach(ch => {
            const btn = document.createElement('div');
            btn.className = 'choice-btn';
            btn.innerText = ch.txt;
            btn.onclick = () => {
                this.score += ch.points;
                document.getElementById('current-score').innerText = this.score;
                showToast(ch.points > 0 ? "Bien joué." : "Aïe.", ch.points > 0 ? "success" : "error");
                this.currentQuizIndex++;
                setTimeout(() => this.loadQuiz(), 1000);
            };
            c.appendChild(btn);
        });
    }
};