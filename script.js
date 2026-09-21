"use strict";

/* ==============================================================
   RIJUL JAIN PORTFOLIO — script.js  (full rewrite)
   Features:
   1. Page Loader (boot sequence)
   2. Matrix canvas background
   3. Typewriter — hero eyebrow
   4. Terminal card typing animation
   5. Scroll-reveal animations
   6. Skill bar animation on scroll
   7. Active nav highlight on scroll
   8. Sticky header shadow
   9. Cursor glow follower
   10. Hamburger / mobile menu
   11. Animated stats counters
   12. Project detail modals
   13. Interactive terminal (type real commands)
   14. Copy email to clipboard
   15. Card 3D tilt
   16. Footer year
   ============================================================== */

/* ------------------------------------------------------------------
   1. PAGE LOADER
------------------------------------------------------------------ */
const LOADER_STEPS = [
  "Loading profile…",
  "Syncing workspace highlights…",
  "Checking infrastructure signals…",
  "Preparing terminal…",
  "Ready.",
];

(function runLoader() {
  const loader  = document.getElementById("page-loader");
  const bar     = document.getElementById("loader-bar");
  const text    = document.getElementById("loader-text");
  if (!loader) return;

  let step = 0;
  function tick() {
    if (step >= LOADER_STEPS.length) {
      loader.classList.add("hidden");
      return;
    }
    const pct = Math.round(((step + 1) / LOADER_STEPS.length) * 100);
    bar.style.width  = `${pct}%`;
    text.textContent = LOADER_STEPS[step];
    step++;
    setTimeout(tick, step === LOADER_STEPS.length ? 300 : 280);
  }
  setTimeout(tick, 180);
})();

/* ------------------------------------------------------------------
   2. CANVAS BACKGROUND
------------------------------------------------------------------ */
const canvas = document.getElementById("code-background");
const ctx    = canvas.getContext("2d");

const SNIPPETS = [
  "rijul@itops:~$ whoami",
  "rijul@itops:~$ az account show",
  "rijul@itops:~$ jumpcloud users list",
  "rijul@itops:~$ Get-ComputerInfo",
  "rijul@itops:~$ netsh advfirewall show allprofiles",
  "rijul@itops:~$ workspace migration status",
  "rijul@itops:~$ fortinet policy review",
  "rijul@itops:~$ onboarding checklist",
  "[+] 550+ users supported",
  "[+] identity platform synced",
  "[+] ISO 27001 controls reviewed",
  "[+] onboarding process ready",
  "Google Workspace -> stable",
  "JumpCloud -> centralized access",
  "Azure -> account aligned",
  "Fortinet -> secure edge",
];

const COLORS = ["#3dffa4", "#2bdcff", "#f7d85a", "#ff4f77", "#3578ff"];
let columns  = [], W = 0, H = 0, lastFrame = 0;

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  W = window.innerWidth; H = window.innerHeight;
  canvas.width  = Math.floor(W * dpr);
  canvas.height = Math.floor(H * dpr);
  canvas.style.width  = `${W}px`;
  canvas.style.height = `${H}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.max(18, Math.floor(W / 56));
  columns = Array.from({ length: count }, (_, i) => ({
    x: i * (W / count) + Math.random() * 14,
    y: Math.random() * H,
    speed:  16 + Math.random() * 54,
    color:  COLORS[i % COLORS.length],
    text:   SNIPPETS[i % SNIPPETS.length],
    offset: Math.floor(Math.random() * 22),
  }));
}

function drawCanvas(ts) {
  const delta = Math.min((ts - lastFrame) / 1000 || 0.016, 0.05);
  lastFrame = ts;
  ctx.fillStyle = "rgba(2, 3, 4, 0.16)";
  ctx.fillRect(0, 0, W, H);
  ctx.font = "13px 'JetBrains Mono', Consolas, monospace";
  ctx.textBaseline = "top";
  columns.forEach((col, i) => {
    col.y += col.speed * delta;
    if (col.y > H + 160) {
      col.y    = -100 - Math.random() * 200;
      col.text = SNIPPETS[(i + Math.floor(Math.random() * SNIPPETS.length)) % SNIPPETS.length];
    }
    for (let j = 0; j < 9; j++) {
      const y = col.y - j * 21;
      if (y < -30 || y > H + 30) continue;
      const a = Math.max(0, 0.88 - j * 0.11);
      const f = col.text.slice(0, Math.max(6, col.text.length - j - col.offset));
      const h = col.color.replace("#", "");
      ctx.fillStyle = `rgba(${parseInt(h.slice(0,2),16)},${parseInt(h.slice(2,4),16)},${parseInt(h.slice(4,6),16)},${a})`;
      ctx.fillText(f, col.x, y);
    }
  });
  requestAnimationFrame(drawCanvas);
}

window.addEventListener("resize", resizeCanvas, { passive: true });
resizeCanvas();
requestAnimationFrame(drawCanvas);

/* ------------------------------------------------------------------
   3. TYPEWRITER — hero eyebrow
------------------------------------------------------------------ */
const TW_PHRASES = ["whoami", "az account show", "jumpcloud users list", "Get-ComputerInfo"];
let twPhrase = 0, twChar = 0, twDeleting = false;
const twEl = document.getElementById("typewriter");

function typewriterTick() {
  if (!twEl) return;
  const cur = TW_PHRASES[twPhrase];
  if (!twDeleting) {
    twChar++;
    twEl.textContent = cur.slice(0, twChar);
    if (twChar >= cur.length) { twDeleting = true; setTimeout(typewriterTick, 1800); return; }
    setTimeout(typewriterTick, 68);
  } else {
    twChar--;
    twEl.textContent = cur.slice(0, twChar);
    if (twChar === 0) {
      twDeleting = false;
      twPhrase   = (twPhrase + 1) % TW_PHRASES.length;
      setTimeout(typewriterTick, 420); return;
    }
    setTimeout(typewriterTick, 34);
  }
}
setTimeout(typewriterTick, 900);

/* ------------------------------------------------------------------
   4. TERMINAL CARD TYPING
------------------------------------------------------------------ */
const termCmd = document.getElementById("term-main-cmd");
if (termCmd) {
  const CMD = "jumpcloud sync --devices";
  let ci = 0;
  function typeCmd() {
    if (ci <= CMD.length) { termCmd.textContent = CMD.slice(0, ci++); setTimeout(typeCmd, 58); }
  }
  setTimeout(typeCmd, 1000);
}

/* ------------------------------------------------------------------
   5. SCROLL REVEAL
------------------------------------------------------------------ */
const revealEls = document.querySelectorAll(".reveal-up");
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); });
}, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
revealEls.forEach(el => revealObs.observe(el));

/* ------------------------------------------------------------------
   6. SKILL BAR ANIMATION
------------------------------------------------------------------ */
const skillChips = document.querySelectorAll(".skill-chip");
const skillObs   = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("visible"); skillObs.unobserve(e.target); } });
}, { threshold: 0.2 });
skillChips.forEach(c => skillObs.observe(c));

/* ------------------------------------------------------------------
   7. ACTIVE NAV ON SCROLL
------------------------------------------------------------------ */
const navLinks    = document.querySelectorAll(".nav-link");
const mobileLinks = document.querySelectorAll(".mobile-link");
const sections    = document.querySelectorAll("main section[id]");

const sectionRatios = new Map();
const navObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    sectionRatios.set(e.target.id, e.isIntersecting ? e.intersectionRatio : 0);
  });

  let activeId = null, maxRatio = 0;
  sectionRatios.forEach((ratio, id) => {
    if (ratio > maxRatio) { maxRatio = ratio; activeId = id; }
  });

  if (activeId) {
    [...navLinks, ...mobileLinks].forEach(a => {
      a.classList.toggle("active", a.getAttribute("href") === `#${activeId}`);
    });
  }
}, { threshold: [0, 0.1, 0.25, 0.35, 0.5, 0.75, 1] });
sections.forEach(s => navObs.observe(s));

/* ------------------------------------------------------------------
   8. STICKY HEADER SHADOW
------------------------------------------------------------------ */
const header = document.getElementById("site-header");
window.addEventListener("scroll", () => {
  header.classList.toggle("scrolled", window.scrollY > 20);
}, { passive: true });

/* ------------------------------------------------------------------
   9. CURSOR GLOW
------------------------------------------------------------------ */
const cursorGlow = document.getElementById("cursor-glow");
let mx = -999, my = -999, cx = -999, cy = -999;
window.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; }, { passive: true });
(function animCursor() {
  cx += (mx - cx) * 0.08; cy += (my - cy) * 0.08;
  if (cursorGlow) cursorGlow.style.transform = `translate(${cx - 190}px, ${cy - 190}px)`;
  requestAnimationFrame(animCursor);
})();

/* ------------------------------------------------------------------
   10. HAMBURGER MENU
------------------------------------------------------------------ */
const hamburger  = document.getElementById("hamburger-btn");
const mobileMenu = document.getElementById("mobile-menu");

hamburger?.addEventListener("click", () => {
  const open = mobileMenu.classList.toggle("open");
  hamburger.classList.toggle("open", open);
  hamburger.setAttribute("aria-expanded", String(open));
  mobileMenu.setAttribute("aria-hidden", String(!open));
});

mobileLinks.forEach(l => l.addEventListener("click", () => {
  mobileMenu.classList.remove("open");
  hamburger.classList.remove("open");
  hamburger.setAttribute("aria-expanded", "false");
  mobileMenu.setAttribute("aria-hidden", "true");
}));

document.addEventListener("click", e => {
  if (mobileMenu.classList.contains("open") && !mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
    mobileMenu.classList.remove("open");
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  }
}, { passive: true });

/* ------------------------------------------------------------------
   11. ANIMATED STATS COUNTER
------------------------------------------------------------------ */
function animateCounter(el, target, duration = 1600) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.floor(eased * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

const statCards = document.querySelectorAll(".stat-card");
const statObs   = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const numEl  = e.target.querySelector(".stat-num");
      const target = parseInt(numEl?.dataset.target || "0", 10);
      if (numEl && target) animateCounter(numEl, target);
      statObs.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });
statCards.forEach(c => statObs.observe(c));

/* ------------------------------------------------------------------
   12. PROJECT DETAIL MODALS
------------------------------------------------------------------ */
const modalOverlay = document.getElementById("modal-overlay");
const modalContent = document.getElementById("modal-content");
const modalClose   = document.getElementById("modal-close");

function openModal(card) {
  const title   = card.dataset.title   || "";
  const kicker  = card.dataset.kicker  || "";
  const desc    = card.dataset.desc    || "";
  const details = card.dataset.details || "";
  const tags    = (card.dataset.tags   || "").split(",").filter(Boolean);

  modalContent.innerHTML = `
    <p class="modal-kicker">${kicker}</p>
    <h2 id="modal-title">${title}</h2>
    <p class="modal-desc">${desc}</p>
    <p class="modal-details-title">[+] Technical Highlights</p>
    <div class="modal-details">${details.replace(/\\n/g, "\n")}</div>
    <div class="modal-tags">${tags.map(t => `<span class="modal-tag">${t.trim()}</span>`).join("")}</div>
  `;
  modalOverlay.classList.add("open");
  modalOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modalClose.focus();
}

function closeModal() {
  modalOverlay.classList.remove("open");
  modalOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.querySelectorAll(".card[data-modal='true']").forEach(card => {
  card.addEventListener("click", e => {
    if (!e.target.closest("a")) openModal(card);
  });
  card.style.cursor = "pointer";
  const cta = card.querySelector(".card-cta");
  if (cta) {
    cta.addEventListener("click", e => { e.preventDefault(); openModal(card); });
  }
});

modalClose?.addEventListener("click", closeModal);
modalOverlay?.addEventListener("click", e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeModal(); closeTerminalModal(); }
});

/* ------------------------------------------------------------------
   13. INTERACTIVE TERMINAL
------------------------------------------------------------------ */
const termOverlay = document.getElementById("terminal-overlay");
const termOutput  = document.getElementById("terminal-output");
const termInput   = document.getElementById("terminal-input");
const termClose   = document.getElementById("terminal-close");

const COMMANDS = {
  help: () => [
    { cls: "t-info", txt: "Available commands:" },
    { cls: "t-out",  txt: "  whoami        - show profile summary" },
    { cls: "t-out",  txt: "  skills        - list technical skills" },
    { cls: "t-out",  txt: "  projects      - list key initiatives" },
    { cls: "t-out",  txt: "  contact       - show contact info" },
    { cls: "t-out",  txt: "  certs         - list certifications" },
    { cls: "t-out",  txt: "  stack         - list platforms in use" },
    { cls: "t-out",  txt: "  date          - show current datetime" },
    { cls: "t-out",  txt: "  clear         - clear terminal" },
    { cls: "t-out",  txt: "  exit          - close terminal" },
  ],
  whoami: () => [
    { cls: "t-info", txt: "Rijul Jain" },
    { cls: "t-out",  txt: "Role   : Information Technology Administrator" },
    { cls: "t-out",  txt: "Status : Open to IT infrastructure and security-focused roles" },
    { cls: "t-out",  txt: "Focus  : IT ops · IAM · support · compliance" },
  ],
  skills: () => [
    { cls: "t-info", txt: "[+] Technical Skills:" },
    { cls: "t-out",  txt: "  JumpCloud        ██████████ 90%" },
    { cls: "t-out",  txt: "  Networking       █████████░ 88%" },
    { cls: "t-out",  txt: "  Microsoft Azure  ████████░░ 85%" },
    { cls: "t-out",  txt: "  Windows Server   ████████░░ 80%" },
    { cls: "t-out",  txt: "  ISO 27001        ███████░░░ 80%" },
    { cls: "t-out",  txt: "" },
    { cls: "t-info", txt: "[+] Soft Skills:" },
    { cls: "t-out",  txt: "  Effective Communication" },
    { cls: "t-out",  txt: "  Time Management" },
    { cls: "t-out",  txt: "  Problem Solving" },
    { cls: "t-out",  txt: "  User Support" },
  ],
  projects: () => [
    { cls: "t-info", txt: "[+] Key Initiatives:" },
    { cls: "t-out",  txt: "  1. Google Workspace Migration" },
    { cls: "t-out",  txt: "  2. JumpCloud Rollout" },
    { cls: "t-out",  txt: "  3. ISO 27001 & Fortinet Operations" },
    { cls: "t-out",  txt: '  → Click the project cards on the page for full details.' },
  ],
  contact: () => [
    { cls: "t-info", txt: "[+] Contact Info:" },
    { cls: "t-out",  txt: "  Email    : jainrijul02@gmail.com" },
    { cls: "t-out",  txt: "  LinkedIn : linkedin.com/in/jainrijul1122" },
    { cls: "t-out",  txt: "  GitHub   : github.com/RijulJain001" },
    { cls: "t-out",  txt: "  Location : Greater Jaipur Area" },
  ],
  certs: () => [
    { cls: "t-info", txt: "[+] Certifications:" },
    { cls: "t-out",  txt: "  [COMPLETED] CHNA" },
    { cls: "t-out",  txt: "  [COMPLETED] Ethical Hacker Expert" },
    { cls: "t-out",  txt: "  [COMPLETED] Cloud Computing" },
    { cls: "t-out",  txt: "  [COMPLETED] Star Cyber Security User" },
  ],
  stack: () => [
    { cls: "t-info", txt: "[+] Core Platforms:" },
    { cls: "t-out",  txt: "  Google Workspace" },
    { cls: "t-out",  txt: "  JumpCloud" },
    { cls: "t-out",  txt: "  Microsoft Azure" },
    { cls: "t-out",  txt: "  Fortinet Firewall" },
    { cls: "t-out",  txt: "  Zoho Apps / We360 / UNIRMS" },
  ],
  date: () => [{ cls: "t-out", txt: new Date().toString() }],
  clear: () => "clear",
  exit:  () => "exit",
};

function termPrint(lines) {
  lines.forEach(({ cls, txt }) => {
    const span = document.createElement("span");
    span.className = `t-line ${cls}`;
    span.textContent = txt;
    termOutput.appendChild(span);
  });
  termOutput.scrollTop = termOutput.scrollHeight;
}

function termWelcome() {
  termPrint([
    { cls: "t-info", txt: "╔══════════════════════════════════════╗" },
    { cls: "t-info", txt: "║      RIJUL JAIN - OPS TERMINAL       ║" },
    { cls: "t-info", txt: "╚══════════════════════════════════════╝" },
    { cls: "t-out",  txt: 'Type "help" to see available commands.' },
    { cls: "t-out",  txt: "" },
  ]);
}

function handleTermInput(rawCmd) {
  const cmd = rawCmd.trim().toLowerCase();
  // Echo the command
  const prompt = document.createElement("span");
  prompt.className = "t-line t-prompt";
  prompt.textContent = `rijul@itops:~$ ${rawCmd}`;
  termOutput.appendChild(prompt);

  if (!cmd) { termOutput.scrollTop = termOutput.scrollHeight; return; }

  const handler = COMMANDS[cmd];
  if (!handler) {
    termPrint([
      { cls: "t-err", txt: `bash: ${cmd}: command not found` },
      { cls: "t-out", txt: 'Type "help" for available commands.' },
    ]);
    return;
  }
  const result = handler();
  if (result === "clear") { termOutput.innerHTML = ""; termWelcome(); return; }
  if (result === "exit")  { closeTerminalModal(); return; }
  termPrint(result);
}

termInput?.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    handleTermInput(termInput.value);
    termInput.value = "";
  }
});

function openTerminalModal() {
  termOverlay.classList.add("open");
  termOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  if (!termOutput.hasChildNodes()) termWelcome();
  setTimeout(() => termInput?.focus(), 300);
}

function closeTerminalModal() {
  termOverlay?.classList.remove("open");
  termOverlay?.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

document.getElementById("terminal-trigger-btn")?.addEventListener("click", openTerminalModal);
document.getElementById("hero-terminal-btn")?.addEventListener("click", openTerminalModal);
termClose?.addEventListener("click", closeTerminalModal);
termOverlay?.addEventListener("click", e => { if (e.target === termOverlay) closeTerminalModal(); });

/* ------------------------------------------------------------------
   14. COPY EMAIL
------------------------------------------------------------------ */
const copyBtn   = document.getElementById("copy-email-btn");
const copyLabel = document.getElementById("copy-label");
const emailVal  = document.getElementById("email-val");

copyBtn?.addEventListener("click", async () => {
  const email = emailVal?.textContent.trim() || "";
  try {
    await navigator.clipboard.writeText(email);
    copyBtn.classList.add("copied");
    copyLabel.textContent = "Copied!";
    setTimeout(() => {
      copyBtn.classList.remove("copied");
      copyLabel.textContent = "Copy";
    }, 2200);
  } catch {
    copyLabel.textContent = "Failed";
    setTimeout(() => { copyLabel.textContent = "Copy"; }, 1500);
  }
});

/* ------------------------------------------------------------------
   15. CARD 3D TILT
------------------------------------------------------------------ */
document.querySelectorAll(".card, .about-card, .cert-card").forEach(card => {
  card.addEventListener("mousemove", e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg) translateY(-4px)`;
  });
  card.addEventListener("mouseleave", () => { card.style.transform = ""; card.style.transition = "transform 500ms ease"; });
  card.addEventListener("mouseenter", () => { card.style.transition = "transform 100ms ease"; });
});

/* ------------------------------------------------------------------
   16. FOOTER YEAR
------------------------------------------------------------------ */
const yearEl = document.querySelector(".footer-year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
