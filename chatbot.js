/* ============================================
   PAAWAN SHAH — CHATBOT WIDGET
   Floating AI assistant for site navigation
   Roaming puppy-style movement
   ============================================ */
(function(){
'use strict';

// ─── Inject CSS ───
const css = document.createElement('style');
css.textContent = `
/* ═══ CHATBOT TRIGGER ═══ */
.cb-trigger{position:fixed;z-index:9999;width:62px;height:62px;border-radius:50%;background:linear-gradient(135deg,#6c5ce7,#a855f7);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 25px rgba(108,92,231,0.45);font-size:26px;line-height:1;overflow:visible;
  /* start bottom-right */
  bottom:24px;right:24px;
  /* smooth roaming movement */
  transition:bottom 2.8s cubic-bezier(.25,.46,.45,.94),right 2.8s cubic-bezier(.25,.46,.45,.94),left 2.8s cubic-bezier(.25,.46,.45,.94),top 2.8s cubic-bezier(.25,.46,.45,.94),transform .3s cubic-bezier(.16,1,.3,1),box-shadow .3s ease,opacity .3s ease}
.cb-trigger:hover{transform:scale(1.15) !important;box-shadow:0 8px 35px rgba(108,92,231,0.65)}
.cb-trigger.open{transform:scale(0) !important;opacity:0;pointer-events:none}
.cb-trigger .cb-badge{position:absolute;top:-2px;right:-2px;width:16px;height:16px;background:#00e676;border-radius:50%;border:2px solid #0a0a0b;animation:cb-pulse 2s infinite}
@keyframes cb-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}

/* little hop while roaming */
.cb-trigger.roaming{animation:cb-hop 0.6s ease-in-out infinite}
@keyframes cb-hop{0%,100%{transform:translateY(0) rotate(0deg)}25%{transform:translateY(-6px) rotate(-3deg)}50%{transform:translateY(0) rotate(0deg)}75%{transform:translateY(-4px) rotate(3deg)}}
/* idle wiggle when stopped */
.cb-trigger.idle:not(.open):not(:hover){animation:cb-wiggle 3s ease-in-out infinite}
@keyframes cb-wiggle{0%,100%{transform:rotate(0deg)}10%{transform:rotate(-8deg)}20%{transform:rotate(8deg)}30%{transform:rotate(-5deg)}40%{transform:rotate(5deg)}50%,100%{transform:rotate(0deg)}}

/* speech bubble tail on the icon */
.cb-tail{position:absolute;bottom:-6px;right:4px;width:14px;height:14px;overflow:hidden}
.cb-tail::before{content:'';display:block;width:14px;height:14px;background:linear-gradient(135deg,#6c5ce7,#a855f7);border-radius:0 0 0 10px;transform:rotate(0deg)}

/* ═══ CHATBOT PANEL ═══ */
.cb-panel{position:fixed;bottom:24px;right:24px;z-index:10000;width:380px;height:560px;background:#12122a;border-radius:20px;box-shadow:0 20px 60px rgba(0,0,0,0.6),0 0 40px rgba(108,92,231,0.12);border:1px solid rgba(255,255,255,0.06);display:flex;flex-direction:column;overflow:hidden;transform:scale(0.4) translateY(40px);opacity:0;pointer-events:none;transform-origin:bottom right;transition:all .35s cubic-bezier(.16,1,.3,1)}
.cb-panel.open{transform:scale(1) translateY(0);opacity:1;pointer-events:all}

/* header */
.cb-head{background:linear-gradient(135deg,#6c5ce7,#a855f7);padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0}
.cb-avatar{width:40px;height:40px;border-radius:50%;background:rgba(255,255,255,0.18);display:flex;align-items:center;justify-content:center;font-size:22px;backdrop-filter:blur(8px)}
.cb-head-info h2{color:#fff;font-size:15px;font-weight:700;font-family:'Outfit',sans-serif;margin:0}
.cb-head-info p{color:rgba(255,255,255,0.7);font-size:11px;margin:2px 0 0;font-family:'JetBrains Mono',monospace}
.cb-close{margin-left:auto;background:rgba(255,255,255,0.15);border:none;width:32px;height:32px;border-radius:50%;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}
.cb-close:hover{background:rgba(255,255,255,0.3)}

/* messages area */
.cb-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}
.cb-body::-webkit-scrollbar{width:3px}
.cb-body::-webkit-scrollbar-thumb{background:rgba(108,92,231,0.3);border-radius:3px}

/* messages */
.cb-msg{max-width:88%;animation:cb-slide .3s cubic-bezier(.16,1,.3,1)}
@keyframes cb-slide{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
.cb-bot{align-self:flex-start}
.cb-bot .cb-bubble{background:#1a1a2e;color:#d0d0e0;padding:12px 16px;border-radius:4px 16px 16px 16px;font-size:13.5px;line-height:1.6;border:1px solid rgba(255,255,255,0.05);font-family:'Outfit',sans-serif}
.cb-user{align-self:flex-end}
.cb-user .cb-bubble{background:linear-gradient(135deg,#6c5ce7,#a855f7);color:#fff;padding:12px 16px;border-radius:16px 4px 16px 16px;font-size:13.5px;line-height:1.6;font-family:'Outfit',sans-serif}

/* options */
.cb-opts{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px;animation:cb-slide .35s cubic-bezier(.16,1,.3,1)}
.cb-opt{background:rgba(108,92,231,0.1);border:1px solid rgba(108,92,231,0.3);color:#c4b5fd;padding:9px 16px;border-radius:20px;cursor:pointer;font-size:12.5px;font-family:'Outfit',sans-serif;font-weight:500;transition:all .2s;line-height:1.3}
.cb-opt:hover{background:rgba(108,92,231,0.28);border-color:#a855f7;color:#fff;transform:translateY(-1px);box-shadow:0 3px 12px rgba(108,92,231,0.2)}

/* typing dots */
.cb-typing{display:flex;gap:4px;padding:12px 16px;align-self:flex-start}
.cb-typing span{width:7px;height:7px;background:#6c5ce7;border-radius:50%;animation:cb-bounce 1.4s infinite}
.cb-typing span:nth-child(2){animation-delay:.2s}
.cb-typing span:nth-child(3){animation-delay:.4s}
@keyframes cb-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-7px)}}

/* result card */
.cb-result{background:linear-gradient(135deg,rgba(108,92,231,0.12),rgba(168,85,247,0.08));border:1px solid rgba(108,92,231,0.25);border-radius:14px;padding:16px;margin-top:6px}
.cb-result h4{color:#c4b5fd;font-size:14px;margin:0 0 6px;font-family:'Outfit',sans-serif}
.cb-result p{color:#9e9eb8;font-size:12.5px;line-height:1.5;margin:0;font-family:'Outfit',sans-serif}
.cb-go-btn{display:inline-block;margin-top:10px;padding:8px 18px;background:linear-gradient(135deg,#6c5ce7,#a855f7);color:#fff;border:none;border-radius:12px;font-size:12px;font-family:'Outfit',sans-serif;font-weight:600;cursor:pointer;transition:all .2s}
.cb-go-btn:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(108,92,231,0.35)}
.cb-restart{background:rgba(108,92,231,0.1);border:1px dashed rgba(108,92,231,0.35);color:#a78bfa;padding:8px 18px;border-radius:12px;cursor:pointer;font-size:12px;font-family:'Outfit',sans-serif;font-weight:600;margin-top:8px;transition:all .2s;display:inline-block}
.cb-restart:hover{background:rgba(108,92,231,0.25);color:#fff}

/* mobile */
@media(max-width:500px){
  .cb-panel{bottom:0;right:0;left:0;width:100%;height:100%;border-radius:0;max-height:100dvh}
  .cb-trigger{width:54px;height:54px;font-size:22px}
}
`;
document.head.appendChild(css);

// ─── Inject HTML ───
const trigger = document.createElement('button');
trigger.className = 'cb-trigger idle';
trigger.setAttribute('aria-label','Open chat assistant');
trigger.innerHTML = `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
  <circle cx="9.5" cy="11.5" r="0.8" fill="#fff" stroke="none"/>
  <circle cx="12" cy="11.5" r="0.8" fill="#fff" stroke="none"/>
  <circle cx="14.5" cy="11.5" r="0.8" fill="#fff" stroke="none"/>
</svg><span class="cb-badge"></span>`;
document.body.appendChild(trigger);

const panel = document.createElement('div');
panel.className = 'cb-panel';
panel.innerHTML = `
<div class="cb-head">
  <div class="cb-avatar">💬</div>
  <div class="cb-head-info">
    <h2>Paawan's Assistant</h2>
    <p>● online &middot; here to help</p>
  </div>
  <button class="cb-close" aria-label="Close chat">&times;</button>
</div>
<div class="cb-body" id="cbBody"></div>
`;
document.body.appendChild(panel);

const body = document.getElementById('cbBody');

// ─── ROAMING ENGINE (puppy-style) ───
let roamInterval = null;
let isHovering = false;
let chatOpen = false;
const SIZE = 62; // button size
const PAD = 12;  // edge padding

// Predefined "spots" the puppy likes to visit (percentages of viewport)
// It wanders along edges and sometimes ventures to mid-screen
const spots = [
  { side:'br' }, // bottom-right (home)
  { side:'bl' }, // bottom-left
  { side:'tr' }, // top-right
  { side:'tl' }, // top-left
  { side:'rm' }, // right-middle
  { side:'lm' }, // left-middle
  { side:'bm' }, // bottom-middle
  { side:'tm' }, // top-middle
];

function getSpotPosition(spot) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Add a little randomness so it's not perfectly robotic
  const jitterX = Math.round((Math.random() - 0.5) * 40);
  const jitterY = Math.round((Math.random() - 0.5) * 40);

  switch(spot.side) {
    case 'br': return { bottom: PAD + jitterY, right: PAD + jitterX };
    case 'bl': return { bottom: PAD + jitterY, left: PAD + Math.abs(jitterX) };
    case 'tr': return { top: PAD + Math.abs(jitterY), right: PAD + jitterX };
    case 'tl': return { top: PAD + Math.abs(jitterY), left: PAD + Math.abs(jitterX) };
    case 'rm': return { top: Math.round(vh * 0.4) + jitterY, right: PAD + jitterX };
    case 'lm': return { top: Math.round(vh * 0.4) + jitterY, left: PAD + Math.abs(jitterX) };
    case 'bm': return { bottom: PAD + Math.abs(jitterY), left: Math.round(vw * 0.45) + jitterX };
    case 'tm': return { top: PAD + Math.abs(jitterY), left: Math.round(vw * 0.45) + jitterX };
    default:   return { bottom: PAD, right: PAD };
  }
}

let lastSpotIdx = 0; // start at bottom-right

function roamToNext() {
  if (isHovering || chatOpen) return;

  // Pick a random spot that isn't the current one
  let nextIdx;
  do { nextIdx = Math.floor(Math.random() * spots.length); } while (nextIdx === lastSpotIdx);
  lastSpotIdx = nextIdx;

  const pos = getSpotPosition(spots[nextIdx]);

  // Start hopping animation
  trigger.classList.remove('idle');
  trigger.classList.add('roaming');

  // Clear all positional props first, then set new ones
  trigger.style.top = '';
  trigger.style.bottom = '';
  trigger.style.left = '';
  trigger.style.right = '';

  // Apply new position
  Object.keys(pos).forEach(k => {
    trigger.style[k] = Math.max(PAD, pos[k]) + 'px';
  });

  // Stop hopping after arriving
  setTimeout(() => {
    trigger.classList.remove('roaming');
    trigger.classList.add('idle');
  }, 2800); // matches CSS transition duration
}

function startRoaming() {
  // Wait a bit before first roam, then every 4-7 seconds
  setTimeout(() => {
    if (!chatOpen) roamToNext();
    roamInterval = setInterval(() => {
      roamToNext();
    }, 4000 + Math.random() * 3000);
  }, 3000);
}

function stopRoaming() {
  if (roamInterval) { clearInterval(roamInterval); roamInterval = null; }
  trigger.classList.remove('roaming');
}

function returnHome() {
  // Glide back to bottom-right
  trigger.style.top = '';
  trigger.style.left = '';
  trigger.style.bottom = '24px';
  trigger.style.right = '24px';
  lastSpotIdx = 0;
}

// Pause on hover
trigger.addEventListener('mouseenter', () => {
  isHovering = true;
  trigger.classList.remove('roaming','idle');
});
trigger.addEventListener('mouseleave', () => {
  isHovering = false;
  if (!chatOpen) trigger.classList.add('idle');
});

// Start roaming on load
startRoaming();

// ─── Open / Close ───
trigger.addEventListener('click', () => { openChat(); });
panel.querySelector('.cb-close').addEventListener('click', () => { closeChat(); });

function openChat(){
  chatOpen = true;
  stopRoaming();
  returnHome();
  trigger.classList.add('open');
  trigger.classList.remove('idle','roaming');
  panel.classList.add('open');
  if(!body.hasChildNodes()) boot();
}
function closeChat(){
  chatOpen = false;
  trigger.classList.remove('open');
  panel.classList.remove('open');
  // Resume roaming after a pause
  setTimeout(() => {
    if(!chatOpen){
      trigger.classList.add('idle');
      startRoaming();
    }
  }, 1500);
}

// ─── Conversation Tree ───
const T = {
  start: {
    msg: "Hey! 👋 I'm Paawan's site assistant. I can help you explore anything here — credit cards, games, markets, or just get to know Paawan. What brings you here today?",
    opts: [
      { text: "🔍 Help me explore", next: "explore" },
      { text: "💳 Credit cards", next: "cc_start" },
      { text: "🎮 Play a game", next: "games" },
      { text: "📈 Markets info", next: "markets" },
      { text: "👤 About Paawan", next: "about" }
    ]
  },

  // ─── EXPLORE ───
  explore: {
    msg: "Great! This site has a lot packed in. What sounds interesting?",
    opts: [
      { text: "💳 Find the best credit card for me", next: "cc_start" },
      { text: "🎮 I want to play games", next: "games" },
      { text: "📈 Tell me about Markets", next: "markets" },
      { text: "✍️ Read some blogs", next: "blogs" },
      { text: "👤 Who is Paawan?", next: "about" },
      { text: "📬 Contact info", next: "contact" }
    ]
  },

  // ─── CREDIT CARDS ───
  cc_start: {
    msg: "Nice — the Credit Card Finder has **63 Canadian cards** from every major bank and credit union. Let me point you in the right direction. What's your main goal?",
    opts: [
      { text: "💰 Earn cashback", next: "cc_cashback" },
      { text: "✈️ Travel rewards", next: "cc_travel" },
      { text: "📉 Low interest rate", next: "cc_low" },
      { text: "🆓 No annual fee", next: "cc_nofee" },
      { text: "🏗️ Build my credit", next: "cc_build" },
      { text: "🔍 Take the full quiz", next: "cc_quiz" }
    ]
  },
  cc_cashback: {
    msg: "Cashback is king! 👑 How much do you spend per month roughly?",
    opts: [
      { text: "Under $1,000", next: "cc_cb_low" },
      { text: "$1,000 – $3,000", next: "cc_cb_mid" },
      { text: "$3,000+", next: "cc_cb_high" }
    ]
  },
  cc_cb_low: {
    msg: "For lower spend, no-fee cards are your best bet so rewards aren't eaten by fees.",
    result: true, emoji: "💳", title: "Top Picks for You",
    desc: "• Tangerine Money-Back (2% in 3 categories, $0 fee)\n• BMO CashBack MC (3% groceries, $0 fee)\n• PC World Elite MC (4.5% at Shoppers, $0 fee)",
    action: { type: "link", label: "Take the Full Quiz →", url: "credit-card-finder.html" }
  },
  cc_cb_mid: {
    msg: "Mid-range spender — you can justify a small annual fee for much better rates.",
    result: true, emoji: "🔥", title: "Top Picks for You",
    desc: "• CIBC Dividend Visa Infinite (4% groceries, $99/yr)\n• Scotia Momentum Infinite (4% groceries & bills)\n• Amex SimplyCash Preferred (4% groceries & gas)",
    action: { type: "link", label: "Take the Full Quiz →", url: "credit-card-finder.html" }
  },
  cc_cb_high: {
    msg: "High spender! Premium cards will pay for themselves easily with your volume.",
    result: true, emoji: "👑", title: "Top Picks for You",
    desc: "• BMO CashBack World Elite (5% groceries, 4% transit)\n• RBC Cash Back Preferred WE (1.5% on EVERYTHING)\n• Neo World Elite MC (5% groceries, 3% gas)",
    action: { type: "link", label: "Take the Full Quiz →", url: "credit-card-finder.html" }
  },
  cc_travel: {
    msg: "Travel rewards — great choice! ✈️ Do you prefer Aeroplan (Air Canada) or flexible points?",
    opts: [
      { text: "Aeroplan all the way", next: "cc_travel_ap" },
      { text: "Flexible points", next: "cc_travel_flex" },
      { text: "Just no foreign fees", next: "cc_travel_nofx" }
    ]
  },
  cc_travel_ap: {
    result: true, emoji: "✈️", title: "Best Aeroplan Cards",
    desc: "• TD Aeroplan Visa Infinite ($139/yr, buddy pass)\n• CIBC Aeroplan Visa Infinite (1.5x groceries & gas)\n• Amex Aeroplan Card (2x on Air Canada)",
    action: { type: "link", label: "Take the Full Quiz →", url: "credit-card-finder.html" }
  },
  cc_travel_flex: {
    result: true, emoji: "🌍", title: "Best Flexible Travel Cards",
    desc: "• Amex Cobalt (5x dining & groceries, MR-S points)\n• TD First Class Travel Infinite (3x on travel)\n• Scotiabank Passport Infinite (no FX fee + Scene+)",
    action: { type: "link", label: "Take the Full Quiz →", url: "credit-card-finder.html" }
  },
  cc_travel_nofx: {
    result: true, emoji: "🌎", title: "No Foreign Transaction Fee Cards",
    desc: "• Home Trust Preferred Visa ($0 fee, 0% FX, 1% CB)\n• Scotiabank Passport Visa Infinite (0% FX + Scene+)\n• Scotiabank Gold Amex (0% FX, 5x dining & groceries)",
    action: { type: "link", label: "Take the Full Quiz →", url: "credit-card-finder.html" }
  },
  cc_low: {
    result: true, emoji: "📉", title: "Best Low Interest Cards",
    desc: "• Desjardins Flexi Visa (10.90% — lowest in Canada!)\n• Servus Low Rate MC (11.99%)\n• TD Emerald Flex Rate (8.99% — super low)\n• MBNA True Line (12.99% + 0% intro on transfers)",
    action: { type: "link", label: "Take the Full Quiz →", url: "credit-card-finder.html" }
  },
  cc_nofee: {
    result: true, emoji: "🆓", title: "Best No-Fee Cards",
    desc: "• Tangerine Money-Back (2% in 3 chosen categories)\n• PC World Elite MC (4.5% Shoppers, 3% grocery — $0!)\n• Triangle World Elite MC (3% grocery, insurance — $0!)\n• Rogers World Elite MC (1.5% everything — $0!)",
    action: { type: "link", label: "Take the Full Quiz →", url: "credit-card-finder.html" }
  },
  cc_build: {
    result: true, emoji: "🏗️", title: "Best Cards to Build Credit",
    desc: "• Neo Secured MC ($0 fee, min $50 deposit, cashback)\n• Home Trust Secured Visa (reports to bureaus)\n• BMO CashBack MC (good starter, $0 fee)\n• Scene+ Visa ($0 fee, easy approval)",
    action: { type: "link", label: "Take the Full Quiz →", url: "credit-card-finder.html" }
  },
  cc_quiz: {
    msg: "Smart move — the full quiz scores all 63 cards against your exact profile. Let me take you there!",
    result: true, emoji: "🧠", title: "Credit Card Finder Quiz",
    desc: "Answer 5 quick questions about your goals, spending, and credit score — get personalized top 5 recommendations from 63 Canadian cards.",
    action: { type: "link", label: "Start the Quiz →", url: "credit-card-finder.html" }
  },

  // ─── GAMES ───
  games: {
    msg: "Game time! 🎮 We've got 4 games built right into the site. What sounds fun?",
    opts: [
      { text: "🐍 Snake", next: "game_snake" },
      { text: "🔢 2048", next: "game_2048" },
      { text: "🧠 Memory Match", next: "game_memory" },
      { text: "⌨️ Typing Speed", next: "game_typing" },
      { text: "🎲 Surprise me!", next: "game_random" }
    ]
  },
  game_snake: {
    result: true, emoji: "🐍", title: "Snake",
    desc: "The classic! Use arrow keys or swipe to grow your snake. Don't hit the walls or yourself.",
    action: { type: "link", label: "Play Snake →", url: "games.html#snake", newTab: true }
  },
  game_2048: {
    result: true, emoji: "🔢", title: "2048",
    desc: "Slide tiles to combine numbers. Can you reach 2048? It's deceptively addictive.",
    action: { type: "link", label: "Play 2048 →", url: "games.html#2048", newTab: true }
  },
  game_memory: {
    result: true, emoji: "🧠", title: "Memory Match",
    desc: "Flip cards and find matching pairs. Tests your memory in the best way.",
    action: { type: "link", label: "Play Memory →", url: "games.html#memory", newTab: true }
  },
  game_typing: {
    result: true, emoji: "⌨️", title: "Typing Speed Test",
    desc: "How fast can you type? Race against the clock and measure your WPM.",
    action: { type: "link", label: "Play Typing →", url: "games.html#typing", newTab: true }
  },
  game_random: {
    msg: "Let fate decide... 🎲",
    auto: function(){ return ['game_snake','game_2048','game_memory','game_typing'][Math.floor(Math.random()*4)]; }
  },

  // ─── MARKETS ───
  markets: {
    msg: "The Markets section covers equity research and capital markets insights. What interests you?",
    opts: [
      { text: "📊 What's covered?", next: "markets_info" },
      { text: "🔍 Take me there", next: "markets_go" }
    ]
  },
  markets_info: {
    result: true, emoji: "📊", title: "Markets & Analytics",
    desc: "Equity research, M&A advisory insights, portfolio construction frameworks, and capital markets intelligence — Paawan's professional domain.",
    action: { type: "slide", label: "Go to Markets →", slide: 2 }
  },
  markets_go: {
    msg: "Taking you to the Markets slide!",
    action: { type: "slide", slide: 2, autoNav: true }
  },

  // ─── BLOGS ───
  blogs: {
    msg: "The Blog section has Paawan's thoughts on finance, tech, and more. Want to check it out?",
    opts: [
      { text: "📝 Take me there", next: "blogs_go" },
      { text: "← Back to menu", next: "explore" }
    ]
  },
  blogs_go: {
    msg: "Navigating to Blogs!",
    action: { type: "slide", slide: 4, autoNav: true }
  },

  // ─── ABOUT ───
  about: {
    msg: "Paawan Shah is a Finance & Analytics professional. What would you like to know?",
    opts: [
      { text: "🎓 Background & skills", next: "about_skills" },
      { text: "💼 Experience", next: "about_exp" },
      { text: "🔗 See full About page", next: "about_go" },
      { text: "📬 Get in touch", next: "contact" }
    ]
  },
  about_skills: {
    result: true, emoji: "🎓", title: "Skills & Background",
    desc: "Specializes in equity research, M&A advisory, portfolio construction, financial modeling, and data analytics. Proficient in Python, SQL, Excel/VBA, and visualization tools.",
    action: { type: "slide", label: "View About Section →", slide: 5 }
  },
  about_exp: {
    result: true, emoji: "💼", title: "Professional Experience",
    desc: "Background in finance with hands-on experience in capital markets, research analysis, and building data-driven insights for investment decisions.",
    action: { type: "slide", label: "View About Section →", slide: 5 }
  },
  about_go: {
    msg: "Taking you to the About section!",
    action: { type: "slide", slide: 5, autoNav: true }
  },

  // ─── CONTACT ───
  contact: {
    result: true, emoji: "📬", title: "Get in Touch",
    desc: "Email, LinkedIn, or GitHub — all the ways to reach Paawan are on the Contact slide.",
    action: { type: "slide", label: "Go to Contact →", slide: 6 }
  }
};

// ─── Engine ───
function addBot(text){
  const d = document.createElement('div');
  d.className = 'cb-msg cb-bot';
  // support **bold**
  const html = text.replace(/\*\*(.*?)\*\*/g,'<strong style="color:#c4b5fd">$1</strong>');
  d.innerHTML = '<div class="cb-bubble">' + html + '</div>';
  body.appendChild(d);
  scrollBottom();
}
function addUser(text){
  const d = document.createElement('div');
  d.className = 'cb-msg cb-user';
  d.innerHTML = '<div class="cb-bubble">' + text + '</div>';
  body.appendChild(d);
  scrollBottom();
}
function showTyping(){
  const d = document.createElement('div');
  d.className = 'cb-typing';
  d.id = 'cbTyping';
  d.innerHTML = '<span></span><span></span><span></span>';
  body.appendChild(d);
  scrollBottom();
}
function hideTyping(){
  const el = document.getElementById('cbTyping');
  if(el) el.remove();
}
function showOpts(opts){
  const c = document.createElement('div');
  c.className = 'cb-opts';
  c.id = 'cbOpts';
  opts.forEach(o => {
    const b = document.createElement('button');
    b.className = 'cb-opt';
    b.textContent = o.text;
    b.onclick = () => pick(o);
    c.appendChild(b);
  });
  body.appendChild(c);
  scrollBottom();
}
function showResult(node){
  const n = typeof node === 'string' ? T[node] : node;
  const d = document.createElement('div');
  d.className = 'cb-msg cb-bot';
  const descHtml = (n.desc||'').replace(/\n/g,'<br>');
  let actionHtml = '';
  if(n.action){
    if(n.action.type === 'link'){
      const target = n.action.newTab ? 'target="_blank" rel="noopener"' : '';
      actionHtml = '<a href="'+n.action.url+'" '+target+' class="cb-go-btn">'+n.action.label+'</a>';
    } else if(n.action.type === 'slide'){
      actionHtml = '<button class="cb-go-btn" onclick="goToSlide('+n.action.slide+')">'+( n.action.label || 'Go there →')+'</button>';
    }
  }
  d.innerHTML = `<div class="cb-bubble">
    <div style="font-size:28px;margin-bottom:6px">${n.emoji||'✨'}</div>
    <div class="cb-result">
      <h4>${n.title||''}</h4>
      <p>${descHtml}</p>
      ${actionHtml}
    </div>
    <button class="cb-restart" onclick="window._cbRestart()">🔄 Ask me something else</button>
  </div>`;
  body.appendChild(d);
  scrollBottom();
}
function scrollBottom(){
  requestAnimationFrame(() => { body.scrollTop = body.scrollHeight; });
}

function pick(opt){
  // remove options
  const old = document.getElementById('cbOpts');
  if(old) old.remove();
  addUser(opt.text);
  showTyping();
  const delay = 500 + Math.random()*600;
  setTimeout(() => {
    hideTyping();
    const node = T[opt.next];
    if(!node) return;
    // handle auto-redirect (random game, etc)
    if(node.auto){
      const resolved = node.auto();
      const rNode = T[resolved];
      if(node.msg) addBot(node.msg);
      setTimeout(() => {
        if(rNode.result) showResult(resolved);
        else { addBot(rNode.msg); if(rNode.opts) setTimeout(()=>showOpts(rNode.opts),250); }
      }, 400);
      return;
    }
    // handle auto-navigate
    if(node.action && node.action.autoNav){
      addBot(node.msg || 'Navigating...');
      setTimeout(() => {
        if(node.action.type === 'slide' && typeof goToSlide === 'function') goToSlide(node.action.slide);
        showResult({ emoji:'✅', title:'Done!', desc:'I\'ve navigated you there. Enjoy exploring!', action: null });
        // add restart
        const rb = document.createElement('button');
        rb.className = 'cb-restart';
        rb.textContent = '🔄 Ask me something else';
        rb.onclick = window._cbRestart;
        body.lastChild.querySelector('.cb-bubble').appendChild(rb);
      }, 500);
      return;
    }
    // normal node
    if(node.msg) addBot(node.msg);
    if(node.result){
      setTimeout(() => showResult(node), 300);
    } else if(node.opts){
      setTimeout(() => showOpts(node.opts), 250);
    }
  }, delay);
}

// boot
function boot(){
  body.innerHTML = '';
  showTyping();
  setTimeout(() => {
    hideTyping();
    addBot(T.start.msg);
    setTimeout(() => showOpts(T.start.opts), 300);
  }, 800);
}

// restart
window._cbRestart = function(){
  boot();
};

})();
