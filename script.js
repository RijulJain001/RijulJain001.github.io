"use strict";

/* ==============================================================
   RIJUL JAIN PORTFOLIO — script.js
   Features:
   Reduced-motion support, profile summary, scroll reveal, skill bars,
   active navigation, mobile menu, project modals, interactive terminal,
   email copy, and footer year.
   ============================================================== */

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ------------------------------------------------------------------
   3. TERMINAL CARD TYPING
------------------------------------------------------------------ */
const termCmd = document.getElementById("term-main-cmd");
if (termCmd) termCmd.textContent = "jumpcloud sync --devices";

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
   11. PROJECT DETAIL MODALS
------------------------------------------------------------------ */
const modalOverlay = document.getElementById("modal-overlay");
const modalContent = document.getElementById("modal-content");
const modalClose   = document.getElementById("modal-close");
let modalTrigger = null;

function openModal(card, trigger) {
  const title   = card.dataset.title   || "";
  const kicker  = card.dataset.kicker  || "";
  const challenge = card.dataset.challenge || "";
  const contribution = card.dataset.contribution || "";
  const outcome = card.dataset.outcome || "";
  const tags    = (card.dataset.tags   || "").split(",").filter(Boolean);

  const addText = (parent, tag, className, value) => {
    const element = document.createElement(tag);
    element.className = className;
    element.textContent = value;
    parent.appendChild(element);
    return element;
  };
  modalContent.replaceChildren();
  addText(modalContent, "p", "modal-kicker", kicker);
  const heading = addText(modalContent, "h2", "", title);
  heading.id = "modal-title";
  const story = document.createElement("div");
  story.className = "case-story";
  [["The challenge", challenge], ["My work", contribution], ["The result", outcome]].forEach(([label, value]) => {
    const section = document.createElement("section");
    section.className = "case-detail";
    addText(section, "h3", "case-detail-title", label);
    addText(section, "p", "case-detail-copy", value);
    story.appendChild(section);
  });
  modalContent.appendChild(story);
  const tagRow = document.createElement("div");
  tagRow.className = "modal-tags";
  tags.forEach(tag => addText(tagRow, "span", "modal-tag", tag.trim()));
  modalContent.appendChild(tagRow);
  modalTrigger = trigger || card.querySelector(".card-cta");
  modalOverlay.classList.add("open");
  modalOverlay.style.visibility = "visible";
  modalOverlay.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  modalClose.focus({ preventScroll: true });
}

function closeModal() {
  if (!modalOverlay.classList.contains("open")) return;
  modalOverlay.classList.remove("open");
  modalOverlay.style.visibility = "hidden";
  modalOverlay.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  modalTrigger?.focus({ preventScroll: true });
  modalTrigger = null;
}

document.querySelectorAll(".card[data-modal='true']").forEach(card => {
  card.addEventListener("click", e => {
    if (!e.target.closest("a, .card-cta")) openModal(card, card.querySelector(".card-cta"));
  });
  card.style.cursor = "pointer";
  const cta = card.querySelector(".card-cta");
  if (cta) {
    cta.addEventListener("click", e => { e.preventDefault(); e.stopPropagation(); openModal(card, cta); });
  }
});

modalClose?.addEventListener("click", closeModal);
modalOverlay?.addEventListener("click", e => { if (e.target === modalOverlay) closeModal(); });
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    if (modalOverlay.classList.contains("open")) closeModal();
    else if (termOverlay?.classList.contains("open")) closeTerminalModal();
  }
  if (e.key === "Tab" && modalOverlay.classList.contains("open")) {
    const focusable = [...modalOverlay.querySelectorAll("button, a[href], input")].filter(el => el.getClientRects().length);
    const first = focusable[0], last = focusable.at(-1);
    if (!first) return;
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    else if (!modalOverlay.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  }
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
    { cls: "t-out",  txt: "  2. JumpCloud IAM Operations" },
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
   15. FOOTER YEAR
------------------------------------------------------------------ */
const yearEl = document.querySelector(".footer-year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
