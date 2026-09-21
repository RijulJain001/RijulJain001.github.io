/* ============================================================
   RIJUL JAIN — login.js
   Access Portal: Boot sequence, typewriter, cursor
   ============================================================ */

"use strict";

/* ------------------------------------------------------------------
   2. CURSOR GLOW
------------------------------------------------------------------ */
const cursorGlow = document.getElementById("cursor-glow");
let mx = -999, my = -999, cx = -999, cy = -999;

window.addEventListener("mousemove", e => { mx = e.clientX; my = e.clientY; }, { passive: true });

function animCursor() {
  cx += (mx - cx) * 0.09;
  cy += (my - cy) * 0.09;
  if (cursorGlow) cursorGlow.style.transform = `translate(${cx - 170}px, ${cy - 170}px)`;
  requestAnimationFrame(animCursor);
}
animCursor();

/* ------------------------------------------------------------------
   3. SESSION ID (random hex)
------------------------------------------------------------------ */
const sessEl = document.getElementById("sess-num");
if (sessEl) {
  sessEl.textContent = Math.random().toString(16).slice(2, 8).toUpperCase();
}

/* ------------------------------------------------------------------
   4. BOOT SEQUENCE
------------------------------------------------------------------ */
const BOOT_MESSAGES = [
  { text: "[ OK ] Booting access portal…",            delay: 0   },
  { text: "[ OK ] Loading workspace modules…",        delay: 180 },
  { text: "[ OK ] Syncing identity platform…",        delay: 360 },
  { text: "[ OK ] Checking device posture…",          delay: 540 },
  { text: "[ OK ] Verifying agent identity…",         delay: 760 },
  { text: "[ OK ] Validating secure access…",         delay: 960 },
  { text: "[ OK ] Identity confirmed: Rijul Jain",    delay: 1180 },
  { text: "[ OK ] ACCESS GRANTED — Portal ready.",    delay: 1400 },
];

const bootLinesEl  = document.getElementById("boot-lines");
const bootBarEl    = document.getElementById("boot-bar");
const bootStatusEl = document.getElementById("boot-status");
const bootScreen   = document.getElementById("boot-screen");
const portalCard   = document.getElementById("portal-card");

function runBoot() {
  BOOT_MESSAGES.forEach(({ text, delay }, i) => {
    setTimeout(() => {
      // Add line
      const p = document.createElement("p");
      p.className = "boot-line";
      p.textContent = text;
      p.style.animationDelay = "0s";
      bootLinesEl.appendChild(p);
      bootLinesEl.scrollTop = bootLinesEl.scrollHeight;

      // Progress bar
      const pct = Math.round(((i + 1) / BOOT_MESSAGES.length) * 100);
      bootBarEl.style.width = `${pct}%`;

      // Status text
      bootStatusEl.textContent = text.replace("[ OK ] ", "");

      // Final: reveal portal
      if (i === BOOT_MESSAGES.length - 1) {
        setTimeout(() => {
          bootScreen.classList.add("hidden");
          setTimeout(() => {
            bootScreen.style.display = "none";
            portalCard.setAttribute("aria-hidden", "false");
            portalCard.classList.add("visible");
          }, 620);
        }, 700);
      }
    }, delay + 300);
  });
}

runBoot();

/* ------------------------------------------------------------------
   5. TYPEWRITER — portal sub-text
------------------------------------------------------------------ */
const subEl = document.getElementById("portal-sub-text");
const SUB_PHRASES = [
  "Select a platform to authenticate →",
  "Your identity has been verified ✓",
  "Choose your access method below",
];
let subPhraseIdx = 0, subCharIdx = 0, subDeleting = false;

function typeSub() {
  if (!subEl) return;
  const phrase = SUB_PHRASES[subPhraseIdx];
  if (!subDeleting) {
    subCharIdx++;
    subEl.innerHTML = phrase.slice(0, subCharIdx) + '<span class="sub-cursor">|</span>';
    if (subCharIdx >= phrase.length) {
      subDeleting = true;
      setTimeout(typeSub, 2200);
      return;
    }
    setTimeout(typeSub, 52);
  } else {
    subCharIdx--;
    subEl.innerHTML = phrase.slice(0, subCharIdx) + '<span class="sub-cursor">|</span>';
    if (subCharIdx === 0) {
      subDeleting = false;
      subPhraseIdx = (subPhraseIdx + 1) % SUB_PHRASES.length;
      setTimeout(typeSub, 360);
      return;
    }
    setTimeout(typeSub, 28);
  }
}

// Start typewriter after boot
setTimeout(typeSub, 2600);

/* ------------------------------------------------------------------
   6. BUTTON CLICK — ripple + open link
------------------------------------------------------------------ */
function addRipple(btn, color) {
  btn.addEventListener("click", function(e) {
    const ripple = document.createElement("span");
    const rect   = btn.getBoundingClientRect();
    const size   = Math.max(rect.width, rect.height) * 2;
    ripple.style.cssText = `
      position:absolute;
      border-radius:50%;
      background:${color};
      width:${size}px;
      height:${size}px;
      left:${e.clientX - rect.left - size/2}px;
      top:${e.clientY - rect.top - size/2}px;
      transform:scale(0);
      animation:rippleAnim 0.55s ease-out forwards;
      pointer-events:none;
      z-index:10;
    `;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

// Inject ripple keyframes
const style = document.createElement("style");
style.textContent = `
@keyframes rippleAnim {
  to { transform: scale(1); opacity: 0; }
}`;
document.head.appendChild(style);

const githubBtn   = document.getElementById("github-access-btn");
const linkedinBtn = document.getElementById("linkedin-access-btn");

if (githubBtn)   addRipple(githubBtn,   "rgba(255,255,255,0.1)");
if (linkedinBtn) addRipple(linkedinBtn, "rgba(10,102,194,0.15)");
