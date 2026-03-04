/* ============================================
   APP LOGIC — Transitions, Interactions, Games
   Paawan Shah Portfolio
   ============================================ */

(function () {
    'use strict';

    // ---- STATE ----
    let currentSection = null;
    const hubOverlay = document.getElementById('hub-overlay');
    const backBtn = document.getElementById('back-to-hub');
    const loader = document.getElementById('loader');

    // ---- LOADING SCREEN ----
    window.addEventListener('load', () => {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 2200);
    });

    // ---- AMBIENT PARTICLES (CSS) ----
    function spawnAmbientParticles() {
        const container = document.getElementById('ambient-particles');
        for (let i = 0; i < 30; i++) {
            const p = document.createElement('div');
            p.className = 'ambient-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (10 + Math.random() * 20) + 's';
            p.style.animationDelay = (Math.random() * 15) + 's';
            p.style.width = p.style.height = (1 + Math.random() * 2) + 'px';
            container.appendChild(p);
        }
    }
    spawnAmbientParticles();

    // ---- SECTION NAVIGATION ----
    function showSection(id) {
        if (currentSection === id) return;

        // Hide hub
        hubOverlay.classList.add('hidden');
        document.body.classList.add('section-active');
        backBtn.classList.add('visible');

        // Hide previous section
        document.querySelectorAll('.page-section').forEach(s => {
            s.classList.remove('active', 'visible');
        });

        // Show target section
        const section = document.getElementById('section-' + id);
        if (section) {
            section.classList.add('active');
            // Trigger reflow for animation
            void section.offsetWidth;
            requestAnimationFrame(() => {
                section.classList.add('visible');
            });
            window.scrollTo(0, 0);
        }

        currentSection = id;
    }

    function returnToHub() {
        // Hide current section
        document.querySelectorAll('.page-section').forEach(s => {
            s.classList.remove('visible');
            setTimeout(() => s.classList.remove('active'), 600);
        });

        backBtn.classList.remove('visible');
        document.body.classList.remove('section-active');

        // Show hub with camera reset
        setTimeout(() => {
            hubOverlay.classList.remove('hidden');
            if (window.hubScene) {
                window.hubScene.resetCamera();
            }
        }, 400);

        currentSection = null;
    }

    // Listen for island clicks from Three.js scene
    window.addEventListener('islandClick', (e) => {
        const id = e.detail.id;
        if (window.hubScene) {
            window.hubScene.flyToIsland(id, () => {
                showSection(id);
            });
        } else {
            showSection(id);
        }
    });

    // Back button
    backBtn.addEventListener('click', returnToHub);

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentSection) {
            returnToHub();
        }
    });

    // ---- PROJECT CARD GLOW ----
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            card.style.setProperty('--mx', x + '%');
            card.style.setProperty('--my', y + '%');
        });
    });

    // ---- CREDIT CARD FINDER QUIZ ----
    const quizState = { step: 1, answers: {} };
    const quizSteps = document.querySelectorAll('.quiz-step');
    const progressFill = document.getElementById('quiz-progress-fill');
    const progressText = document.getElementById('quiz-progress-text');
    const resultsDiv = document.getElementById('ccfinder-results');
    const resultsGrid = document.getElementById('cc-results-grid');
    const quizContainer = document.getElementById('ccfinder-quiz');
    const resetBtn = document.getElementById('ccfinder-reset');

    document.querySelectorAll('.quiz-option').forEach(btn => {
        btn.addEventListener('click', () => {
            quizState.answers[quizState.step] = btn.dataset.value;

            // Visual feedback
            btn.parentElement.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');

            setTimeout(() => {
                if (quizState.step < 5) {
                    quizState.step++;
                    updateQuiz();
                } else {
                    showCCResults();
                }
            }, 300);
        });
    });

    function updateQuiz() {
        quizSteps.forEach(s => s.classList.remove('active'));
        const nextStep = document.querySelector(`.quiz-step[data-step="${quizState.step}"]`);
        if (nextStep) nextStep.classList.add('active');
        if (progressFill) progressFill.style.width = (quizState.step / 5 * 100) + '%';
        if (progressText) progressText.textContent = `Question ${quizState.step} of 5`;
    }

    function showCCResults() {
        if (quizContainer) quizContainer.style.display = 'none';
        if (resultsDiv) resultsDiv.style.display = 'block';

        // Generate recommendations based on answers
        const cards = generateCardRecommendations(quizState.answers);
        if (resultsGrid) {
            resultsGrid.innerHTML = cards.map(c => `
                <div class="cc-card">
                    <h4>${c.name}</h4>
                    <p>${c.desc}</p>
                    <div class="cc-fee">${c.fee}</div>
                </div>
            `).join('');
        }
    }

    function generateCardRecommendations(answers) {
        const recs = [];
        const spend = answers[1] || 'general';
        const fee = answers[2] || 'free';
        const reward = answers[3] || 'cashback';

        if (reward === 'cashback' || reward === 'mixed') {
            recs.push({
                name: 'Tangerine Money-Back Card',
                desc: 'Up to 2% cash back in 3 categories of your choice. No annual fee, great for everyday spending.',
                fee: 'Annual Fee: $0'
            });
        }
        if (reward === 'points' || reward === 'mixed') {
            recs.push({
                name: 'Scotiabank Gold Amex',
                desc: '5x points on groceries and dining, travel insurance included. Strong earn rate for daily purchases.',
                fee: 'Annual Fee: $120'
            });
        }
        if (reward === 'miles' || spend === 'travel') {
            recs.push({
                name: 'TD Aeroplan Visa Infinite',
                desc: 'Earn Aeroplan points on every purchase. Includes lounge passes and comprehensive travel insurance.',
                fee: 'Annual Fee: $139'
            });
        }
        if (fee === 'premium' || spend === 'travel') {
            recs.push({
                name: 'Amex Platinum Card',
                desc: 'Premium travel perks including Priority Pass lounge access, hotel status, and comprehensive insurance.',
                fee: 'Annual Fee: $799'
            });
        }
        if (recs.length < 2) {
            recs.push({
                name: 'CIBC Dividend Visa',
                desc: 'Up to 4% cash back on gas and groceries. Solid everyday card with no annual fee option.',
                fee: 'Annual Fee: $0'
            });
        }
        if (recs.length < 3) {
            recs.push({
                name: 'Rogers World Elite Mastercard',
                desc: '1.5% cash back on everything, plus no foreign transaction fees. Perfect for general spending.',
                fee: 'Annual Fee: $0'
            });
        }
        return recs.slice(0, 3);
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            quizState.step = 1;
            quizState.answers = {};
            if (quizContainer) quizContainer.style.display = 'block';
            if (resultsDiv) resultsDiv.style.display = 'none';
            document.querySelectorAll('.quiz-option').forEach(b => b.classList.remove('selected'));
            updateQuiz();
        });
    }

    // ---- MINI GAMES ----
    const gameContainer = document.getElementById('game-container');
    const gameCanvas = document.getElementById('game-canvas');
    const gameTitle = document.getElementById('game-active-title');
    const gameHtmlArea = document.getElementById('game-html-area');
    const closeGameBtn = document.getElementById('close-game');
    let activeGame = null;

    document.querySelectorAll('.game-launch').forEach(btn => {
        btn.addEventListener('click', () => {
            const gameId = btn.dataset.game;
            launchGame(gameId);
        });
    });

    if (closeGameBtn) {
        closeGameBtn.addEventListener('click', () => {
            closeGame();
        });
    }

    function launchGame(id) {
        if (gameContainer) gameContainer.style.display = 'block';
        if (gameHtmlArea) gameHtmlArea.innerHTML = '';
        if (gameCanvas) gameCanvas.style.display = 'block';

        switch (id) {
            case 'snake':
                if (gameTitle) gameTitle.textContent = 'Snake';
                activeGame = new SnakeGame(gameCanvas);
                break;
            case '2048':
                if (gameTitle) gameTitle.textContent = '2048';
                if (gameCanvas) gameCanvas.style.display = 'none';
                activeGame = new Game2048(gameHtmlArea);
                break;
            case 'memory':
                if (gameTitle) gameTitle.textContent = 'Memory Match';
                if (gameCanvas) gameCanvas.style.display = 'none';
                activeGame = new MemoryGame(gameHtmlArea);
                break;
            case 'typing':
                if (gameTitle) gameTitle.textContent = 'Typing Speed';
                if (gameCanvas) gameCanvas.style.display = 'none';
                activeGame = new TypingGame(gameHtmlArea);
                break;
        }
    }

    function closeGame() {
        if (activeGame && activeGame.destroy) activeGame.destroy();
        activeGame = null;
        if (gameContainer) gameContainer.style.display = 'none';
        if (gameHtmlArea) gameHtmlArea.innerHTML = '';
    }

    // ---- SNAKE GAME ----
    class SnakeGame {
        constructor(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.size = 20;
            this.cols = canvas.width / this.size;
            this.rows = canvas.height / this.size;
            this.snake = [{ x: 10, y: 10 }];
            this.dir = { x: 1, y: 0 };
            this.food = this.spawnFood();
            this.score = 0;
            this.gameOver = false;

            this.handleKey = (e) => {
                const dirs = {
                    ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
                    ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }
                };
                if (dirs[e.key]) {
                    const d = dirs[e.key];
                    if (d.x !== -this.dir.x || d.y !== -this.dir.y) {
                        this.dir = d;
                    }
                    e.preventDefault();
                }
            };
            document.addEventListener('keydown', this.handleKey);
            this.interval = setInterval(() => this.update(), 120);
        }

        spawnFood() {
            return {
                x: Math.floor(Math.random() * this.cols),
                y: Math.floor(Math.random() * this.rows)
            };
        }

        update() {
            if (this.gameOver) return;
            const head = { x: this.snake[0].x + this.dir.x, y: this.snake[0].y + this.dir.y };

            if (head.x < 0 || head.x >= this.cols || head.y < 0 || head.y >= this.rows ||
                this.snake.some(s => s.x === head.x && s.y === head.y)) {
                this.gameOver = true;
                this.draw();
                return;
            }

            this.snake.unshift(head);
            if (head.x === this.food.x && head.y === this.food.y) {
                this.score++;
                this.food = this.spawnFood();
            } else {
                this.snake.pop();
            }
            this.draw();
        }

        draw() {
            const ctx = this.ctx;
            const s = this.size;
            ctx.fillStyle = '#04040a';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            // Food
            ctx.fillStyle = '#ff6b9d';
            ctx.shadowColor = '#ff6b9d';
            ctx.shadowBlur = 10;
            ctx.fillRect(this.food.x * s + 2, this.food.y * s + 2, s - 4, s - 4);
            ctx.shadowBlur = 0;

            // Snake
            this.snake.forEach((seg, i) => {
                ctx.fillStyle = i === 0 ? '#64ffda' : '#3d9985';
                ctx.fillRect(seg.x * s + 1, seg.y * s + 1, s - 2, s - 2);
            });

            // Score
            ctx.fillStyle = '#e8e8f0';
            ctx.font = '14px JetBrains Mono, monospace';
            ctx.fillText(`Score: ${this.score}`, 10, 20);

            if (this.gameOver) {
                ctx.fillStyle = 'rgba(4, 4, 10, 0.8)';
                ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
                ctx.fillStyle = '#ff6b9d';
                ctx.font = 'bold 24px Syne, sans-serif';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 10);
                ctx.fillStyle = '#e8e8f0';
                ctx.font = '14px JetBrains Mono, monospace';
                ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
                ctx.textAlign = 'left';
            }
        }

        destroy() {
            clearInterval(this.interval);
            document.removeEventListener('keydown', this.handleKey);
        }
    }

    // ---- 2048 GAME ----
    class Game2048 {
        constructor(container) {
            this.container = container;
            this.size = 4;
            this.grid = Array.from({ length: 4 }, () => Array(4).fill(0));
            this.score = 0;
            this.addTile();
            this.addTile();

            this.handleKey = (e) => {
                const moves = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
                if (moves[e.key]) {
                    e.preventDefault();
                    if (this.move(moves[e.key])) {
                        this.addTile();
                        this.render();
                    }
                }
            };
            document.addEventListener('keydown', this.handleKey);
            this.render();
        }

        addTile() {
            const empty = [];
            for (let r = 0; r < 4; r++)
                for (let c = 0; c < 4; c++)
                    if (this.grid[r][c] === 0) empty.push([r, c]);
            if (empty.length) {
                const [r, c] = empty[Math.floor(Math.random() * empty.length)];
                this.grid[r][c] = Math.random() < 0.9 ? 2 : 4;
            }
        }

        move(dir) {
            let moved = false;
            const g = this.grid;
            const compress = (arr) => {
                let filtered = arr.filter(v => v !== 0);
                for (let i = 0; i < filtered.length - 1; i++) {
                    if (filtered[i] === filtered[i + 1]) {
                        filtered[i] *= 2;
                        this.score += filtered[i];
                        filtered.splice(i + 1, 1);
                    }
                }
                while (filtered.length < 4) filtered.push(0);
                return filtered;
            };

            for (let i = 0; i < 4; i++) {
                let line;
                if (dir === 'left') line = [...g[i]];
                else if (dir === 'right') line = [...g[i]].reverse();
                else if (dir === 'up') line = [g[0][i], g[1][i], g[2][i], g[3][i]];
                else line = [g[3][i], g[2][i], g[1][i], g[0][i]];

                const newLine = compress(line);
                if (dir === 'right' || dir === 'down') newLine.reverse();

                for (let j = 0; j < 4; j++) {
                    const r = (dir === 'up' || dir === 'down') ? j : i;
                    const c = (dir === 'up' || dir === 'down') ? i : j;
                    if (g[r][c] !== newLine[j]) moved = true;
                    g[r][c] = newLine[j];
                }
            }
            return moved;
        }

        render() {
            const colors = {
                0: '#0e0e1a', 2: '#1a1a30', 4: '#1e1e40', 8: '#2a3055',
                16: '#3a4070', 32: '#4a508a', 64: '#5a60a0', 128: '#64ffda',
                256: '#7c5cfc', 512: '#ff6b9d', 1024: '#ffd700', 2048: '#64ffda',
            };

            let html = `<div style="text-align:center;margin-bottom:12px;font-family:JetBrains Mono,monospace;font-size:0.85rem;color:#64ffda;">Score: ${this.score}</div>`;
            html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:320px;margin:0 auto;">';

            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 4; c++) {
                    const v = this.grid[r][c];
                    const bg = colors[v] || '#64ffda';
                    const textColor = v >= 128 ? '#04040a' : '#e8e8f0';
                    html += `<div style="background:${bg};border:1px solid rgba(100,255,218,0.1);border-radius:8px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-family:Syne,sans-serif;font-weight:700;font-size:${v >= 1000 ? '1rem' : '1.3rem'};color:${textColor};transition:all 0.15s;">${v || ''}</div>`;
                }
            }
            html += '</div><p style="text-align:center;margin-top:12px;font-family:JetBrains Mono,monospace;font-size:0.72rem;color:#56565e;">Use arrow keys to play</p>';
            this.container.innerHTML = html;
        }

        destroy() {
            document.removeEventListener('keydown', this.handleKey);
        }
    }

    // ---- MEMORY GAME ----
    class MemoryGame {
        constructor(container) {
            this.container = container;
            this.symbols = ['$', '%', '#', '@', '&', '*', '+', '='];
            this.cards = [...this.symbols, ...this.symbols]
                .sort(() => Math.random() - 0.5)
                .map((s, i) => ({ id: i, symbol: s, flipped: false, matched: false }));
            this.flippedCards = [];
            this.moves = 0;
            this.render();
        }

        flip(id) {
            const card = this.cards[id];
            if (card.flipped || card.matched || this.flippedCards.length >= 2) return;

            card.flipped = true;
            this.flippedCards.push(card);

            if (this.flippedCards.length === 2) {
                this.moves++;
                const [a, b] = this.flippedCards;
                if (a.symbol === b.symbol) {
                    a.matched = b.matched = true;
                    this.flippedCards = [];
                } else {
                    setTimeout(() => {
                        a.flipped = b.flipped = false;
                        this.flippedCards = [];
                        this.render();
                    }, 700);
                }
            }
            this.render();
        }

        render() {
            const allMatched = this.cards.every(c => c.matched);
            let html = `<div style="text-align:center;margin-bottom:12px;font-family:JetBrains Mono,monospace;font-size:0.85rem;color:#7c5cfc;">Moves: ${this.moves}</div>`;
            html += '<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;max-width:320px;margin:0 auto;">';

            this.cards.forEach(card => {
                const show = card.flipped || card.matched;
                const bg = card.matched ? 'rgba(100,255,218,0.15)' : (show ? '#1a1a30' : '#0e0e1a');
                const border = card.matched ? 'rgba(100,255,218,0.3)' : 'rgba(100,255,218,0.08)';
                html += `<div onclick="window._memoryFlip(${card.id})" style="cursor:pointer;background:${bg};border:1px solid ${border};border-radius:8px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-family:JetBrains Mono,monospace;color:${card.matched ? '#64ffda' : '#e8e8f0'};transition:all 0.3s;user-select:none;">${show ? card.symbol : '?'}</div>`;
            });

            html += '</div>';
            if (allMatched) {
                html += `<p style="text-align:center;margin-top:16px;font-family:Syne,sans-serif;font-size:1.1rem;color:#64ffda;">You won in ${this.moves} moves!</p>`;
            }
            this.container.innerHTML = html;
        }

        destroy() {
            delete window._memoryFlip;
        }
    }

    // Global ref for memory game clicks
    window._memoryFlip = (id) => {
        if (activeGame && activeGame instanceof MemoryGame) {
            activeGame.flip(id);
        }
    };

    // ---- TYPING GAME ----
    class TypingGame {
        constructor(container) {
            this.container = container;
            this.sentences = [
                'The quick brown fox jumps over the lazy dog',
                'Financial analysis requires attention to detail',
                'Equity research drives informed investment decisions',
                'Data visualization transforms complex numbers into insights',
                'Portfolio optimization balances risk and return',
                'Compound interest is the eighth wonder of the world',
            ];
            this.currentText = this.sentences[Math.floor(Math.random() * this.sentences.length)];
            this.input = '';
            this.startTime = null;
            this.wpm = 0;
            this.finished = false;
            this.render();
        }

        onInput(val) {
            if (this.finished) return;
            if (!this.startTime) this.startTime = Date.now();
            this.input = val;

            if (this.input === this.currentText) {
                const elapsed = (Date.now() - this.startTime) / 1000 / 60; // minutes
                const words = this.currentText.split(' ').length;
                this.wpm = Math.round(words / elapsed);
                this.finished = true;
            }
            this.render();
        }

        render() {
            let textHtml = '';
            for (let i = 0; i < this.currentText.length; i++) {
                if (i < this.input.length) {
                    const correct = this.input[i] === this.currentText[i];
                    textHtml += `<span style="color:${correct ? '#64ffda' : '#ff6b9d'}">${this.currentText[i]}</span>`;
                } else {
                    textHtml += `<span style="color:#56565e">${this.currentText[i]}</span>`;
                }
            }

            let html = `
                <div style="max-width:500px;margin:0 auto;">
                    <p style="font-family:JetBrains Mono,monospace;font-size:1rem;line-height:1.8;margin-bottom:16px;padding:16px;background:#0e0e1a;border:1px solid rgba(100,255,218,0.08);border-radius:8px;">${textHtml}</p>
                    <input type="text" id="typing-input" value="${this.input.replace(/"/g, '&quot;')}" placeholder="Start typing..."
                        style="width:100%;padding:12px 16px;background:#0e0e1a;border:1px solid rgba(100,255,218,0.15);border-radius:8px;color:#e8e8f0;font-family:JetBrains Mono,monospace;font-size:0.9rem;outline:none;"
                        oninput="window._typingInput(this.value)"
                        ${this.finished ? 'disabled' : 'autofocus'}>
            `;

            if (this.finished) {
                html += `<div style="text-align:center;margin-top:20px;">
                    <p style="font-family:Syne,sans-serif;font-size:1.8rem;font-weight:800;color:#64ffda;">${this.wpm} WPM</p>
                    <p style="font-family:JetBrains Mono,monospace;font-size:0.8rem;color:#9898a6;margin-top:4px;">Words Per Minute</p>
                </div>`;
            }

            html += '</div>';
            this.container.innerHTML = html;

            if (!this.finished) {
                const inp = document.getElementById('typing-input');
                if (inp) inp.focus();
            }
        }

        destroy() {
            delete window._typingInput;
        }
    }

    window._typingInput = (val) => {
        if (activeGame && activeGame instanceof TypingGame) {
            activeGame.onInput(val);
        }
    };

    // ---- SCROLL REVEAL for in-section elements ----
    function initScrollReveal() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.stat-card, .skill-category, .project-card, .blog-card, .game-card, .exp-item, .contact-card').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1), transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
            observer.observe(el);
        });
    }

    // Add CSS for revealed state
    const style = document.createElement('style');
    style.textContent = `.revealed { opacity: 1 !important; transform: translateY(0) !important; }`;
    document.head.appendChild(style);

    // Init scroll reveal after a small delay
    setTimeout(initScrollReveal, 100);

    // ---- STAGGER ANIMATION ON SECTION ENTER ----
    const origShowSection = showSection;
    // We already defined showSection above, so let's add stagger logic
    const sectionObserver = new MutationObserver(() => {
        document.querySelectorAll('.page-section.visible').forEach(section => {
            const children = section.querySelectorAll('.stat-card, .skill-category, .project-card, .blog-card, .game-card, .exp-item, .contact-card');
            children.forEach((child, i) => {
                child.style.transitionDelay = (i * 0.08) + 's';
                setTimeout(() => child.classList.add('revealed'), 100);
            });
        });
    });

    document.querySelectorAll('.page-section').forEach(section => {
        sectionObserver.observe(section, { attributes: true, attributeFilter: ['class'] });
    });

})();
