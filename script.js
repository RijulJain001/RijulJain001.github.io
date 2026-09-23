"use strict";

/* ==============================================================
   RIJUL JAIN PORTFOLIO — script.js  (full rewrite)
   Features:
   1. Page Loader (boot sequence)
   2. Effects on/off toggle
   3. Typewriter — hero eyebrow
   4. Terminal card typing animation
   5. Scroll-reveal animations
   6. Skill bar animation on scroll
   7. Active nav highlight on scroll
   8. Header shadow, scroll progress bar, timeline fill
   9. Hamburger / mobile menu
   10. Animated stats counters
   11. Project detail modals
   12. Interactive terminal (type real commands)
   13. Copy email to clipboard
   14. Card spotlight + 3D tilt
   15. Footer year
   ============================================================== */

/* ------------------------------------------------------------------
   1. PAGE LOADER
------------------------------------------------------------------ */
const LOADER_STEPS = [
  "Loading profile…",
  "Preparing workspace…",
  "Ready.",
];

(function runLoader() {
  const loader  = document.getElementById("page-loader");
  const bar     = document.getElementById("loader-bar");
  const text    = document.getElementById("loader-text");
  if (!loader) return;

  // Only show the boot animation once per browser session
  try {
    if (sessionStorage.getItem("rj-loaded")) { loader.classList.add("hidden"); return; }
    sessionStorage.setItem("rj-loaded", "1");
  } catch { /* storage unavailable: just show it */ }

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
    setTimeout(tick, 170);
  }
  setTimeout(tick, 80);
})();

/* ------------------------------------------------------------------
   2. EFFECTS TOGGLE — visitors can switch decorative motion off; the
      choice is remembered and reduced-motion users start with it off
------------------------------------------------------------------ */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const fxBtns  = document.querySelectorAll("[data-fx-toggle]");
let fxOn = !reduceMotion;
try {
  const saved = localStorage.getItem("rj-fx");
  if (saved) fxOn = saved === "on";
} catch { /* storage unavailable */ }

function applyFx() {
  document.documentElement.dataset.fx = fxOn ? "on" : "off";
  fxBtns.forEach(btn => {
    btn.setAttribute("aria-pressed", String(fxOn));
    const label = btn.querySelector(".fx-label");
    if (label) label.textContent = fxOn ? "Effects on" : "Effects off";
  });
}
applyFx();
fxBtns.forEach(btn => btn.addEventListener("click", () => {
  fxOn = !fxOn;
  try { localStorage.setItem("rj-fx", fxOn ? "on" : "off"); } catch { /* ignore */ }
  applyFx();
}));

/* ------------------------------------------------------------------
   3. TYPEWRITER — hero eyebrow
------------------------------------------------------------------ */
const TW_PHRASES = ["whoami", "get system status", "jumpcloud users list", "Get-ComputerInfo"];
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
   8. SCROLL EFFECTS — header shadow, progress bar, timeline fill
------------------------------------------------------------------ */
const header         = document.getElementById("site-header");
const scrollProgress = document.getElementById("scroll-progress");
const timelines      = document.querySelectorAll(".timeline");

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  header.classList.toggle("scrolled", window.scrollY > 20);
  scrollProgress?.style.setProperty("--p", max > 0 ? (window.scrollY / max).toFixed(4) : "0");

  const mid = window.innerHeight * 0.6;
  timelines.forEach(tl => {
    const r = tl.getBoundingClientRect();
    const fill = Math.min(1, Math.max(0, (mid - r.top) / r.height));
    tl.style.setProperty("--fill", fill.toFixed(3));
  });
}

let scrollTicking = false;
window.addEventListener("scroll", () => {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => { onScroll(); scrollTicking = false; });
}, { passive: true });
window.addEventListener("resize", onScroll, { passive: true });
onScroll();

/* ------------------------------------------------------------------
   9. HAMBURGER MENU
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
   10. ANIMATED STATS COUNTER
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
   11. PROJECT DETAIL MODALS
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
   12. INTERACTIVE TERMINAL
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
    { cls: "t-out",  txt: "  Core     used in my current role" },
    { cls: "t-out",  txt: "           JumpCloud · Google Workspace · Fortinet FortiGate" },
    { cls: "t-out",  txt: "           LAN/WAN networking · IT asset management · ISO/IEC 27001" },
    { cls: "t-out",  txt: "  Working  Windows Server" },
    { cls: "t-out",  txt: "  Basic    AWS · Docker · Jenkins · Kubernetes · Active Directory" },
    { cls: "t-out",  txt: "" },
    { cls: "t-info", txt: "[+] Soft Skills:" },
    { cls: "t-out",  txt: "  Problem-solving · Communication · Analytical" },
    { cls: "t-out",  txt: "  Troubleshooting · Leadership · Collaboration" },
    { cls: "t-out",  txt: "  Time Management · Continuous Learning" },
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
    { cls: "t-out",  txt: "  Location : Jaipur, Rajasthan, India" },
  ],
  certs: () => [
    { cls: "t-info", txt: "[+] Certifications:" },
    { cls: "t-out",  txt: "  Effective Communication" },
    { cls: "t-out",  txt: "  Project Management" },
    { cls: "t-out",  txt: "  Time Management" },
    { cls: "t-out",  txt: "  Star Certified DevOps Expert" },
    { cls: "t-out",  txt: "  Star Cloud Computing" },
    { cls: "t-out",  txt: "  Ethical Hacking Expert" },
    { cls: "t-out",  txt: "  IT - Essential" },
    { cls: "t-out",  txt: "  SCSU (Star Cyber Secure User)" },
  ],
  stack: () => [
    { cls: "t-info", txt: "[+] Core Platforms:" },
    { cls: "t-out",  txt: "  Google Workspace" },
    { cls: "t-out",  txt: "  JumpCloud" },
    { cls: "t-out",  txt: "  Fortinet FortiGate 80F & 120G" },
    { cls: "t-out",  txt: "  Windows Server / Linux (Ubuntu, Kali)" },
    { cls: "t-out",  txt: "  UNIRMS / WE360 / Git" },
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
   13. COPY EMAIL
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
   14. CARD SPOTLIGHT + 3D TILT
------------------------------------------------------------------ */
const SPOT_SELECTOR = ".card, .about-card, .cert-card, .stat-card, .contact-card, .timeline-item, .skill-chip";
const TILT_SELECTOR = ".card, .about-card, .cert-card";
const canTilt = !reduceMotion && window.matchMedia("(hover: hover)").matches;

// One pointer handler per card, applied at most once per frame
const TILT_SET = new Set(document.querySelectorAll(TILT_SELECTOR));
document.querySelectorAll(SPOT_SELECTOR).forEach(el => {
  const tilt = canTilt && TILT_SET.has(el);
  let raf = 0, px = 0, py = 0;

  const apply = () => {
    raf = 0;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${px - r.left}px`);
    el.style.setProperty("--my", `${py - r.top}px`);
    if (tilt) {
      const x = (px - r.left) / r.width  - 0.5;
      const y = (py - r.top)  / r.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${x * 7}deg) rotateX(${-y * 5}deg) translateY(-6px)`;
    }
  };

  el.addEventListener("pointermove", e => {
    px = e.clientX; py = e.clientY;
    if (!raf) raf = requestAnimationFrame(apply);
  }, { passive: true });

  if (tilt) {
    el.addEventListener("pointerleave", () => {
      if (raf) { cancelAnimationFrame(raf); raf = 0; }
      el.style.transform = "";
    });
  }
});

/* ------------------------------------------------------------------
   15. FOOTER YEAR
------------------------------------------------------------------ */
const yearEl = document.querySelector(".footer-year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
