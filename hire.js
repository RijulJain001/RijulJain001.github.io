"use strict";

/* ==============================================================
   RECRUITER PAGE — hire.js
   - Auto-detects the visit time, time zone, and where the visitor came from
   - Validates the company / recruiter details
   - Turns them into a ready-to-send email (no server needed), or posts to
     an optional form endpoint if one is configured below
   ============================================================== */
(() => {
  const EMAIL = "jainrijul02@gmail.com";

  // OPTIONAL: paste a Formspree / Web3Forms endpoint URL here to receive entries
  // directly instead of opening the visitor's mail app. Leave empty to use email.
  const FORM_ENDPOINT = "";

  const $ = id => document.getElementById(id);
  const form = $("hire-form");
  if (!form) return;

  const f = {
    company:  $("f-company"),
    name:     $("f-name"),
    role:     $("f-role"),
    position: $("f-position"),
    email:    $("f-email"),
    message:  $("f-message"),
    trap:     $("f-website"),
  };
  const err = { company: $("e-company"), name: $("e-name"), email: $("e-email") };
  const prepared = $("prepared");

  /* ------------------------------------------------------------------
     1. AUTO-DETECTED DETAILS
  ------------------------------------------------------------------ */
  const tz = (() => {
    try { return Intl.DateTimeFormat().resolvedOptions().timeZone || "Local time"; }
    catch { return "Local time"; }
  })();

  function offsetLabel(d) {
    const m = -d.getTimezoneOffset();
    const a = Math.abs(m);
    return `UTC${m >= 0 ? "+" : "-"}${String(Math.floor(a / 60)).padStart(2, "0")}:${String(a % 60).padStart(2, "0")}`;
  }
  function fmt(d, opts) {
    try { return new Intl.DateTimeFormat(undefined, opts).format(d); }
    catch { return d.toString(); }
  }
  const fmtFull  = d => fmt(d, { weekday: "short", day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", second: "2-digit" });
  const fmtShort = d => fmt(d, { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

  const tidy = s => String(s).replace(/[^\w .\-/]/g, "").trim().slice(0, 40);

  function detectSource() {
    const p = new URLSearchParams(location.search);
    const tagged = p.get("utm_source") || p.get("source") || p.get("ref");
    if (tagged && tidy(tagged)) return tidy(tagged);
    try {
      if (document.referrer) {
        const host = new URL(document.referrer).hostname.replace(/^www\./, "");
        if (host === location.hostname) return "This portfolio";
        const known = [["linkedin.", "LinkedIn"], ["google.", "Google"], ["naukri.", "Naukri"], ["indeed.", "Indeed"],
                       ["glassdoor.", "Glassdoor"], ["github.", "GitHub"], ["outlook.", "Outlook"], ["mail.", "Email"],
                       ["whatsapp.", "WhatsApp"], ["twitter.", "X / Twitter"], ["t.co", "X / Twitter"]];
        const hit = known.find(([k]) => host.includes(k));
        return hit ? hit[1] : host;
      }
    } catch { /* malformed referrer */ }
    return "Direct link";
  }
  const source = detectSource();
  $("d-source").textContent = source;
  $("d-tz").textContent = `${tz} (${offsetLabel(new Date())})`;

  // The clock keeps running until the form is submitted, then freezes on that moment
  let frozenAt = null;
  function tick() {
    const now = frozenAt || new Date();
    $("chip-time").textContent = `${fmtShort(now)} · ${tz}`;
    $("d-time").textContent = fmtFull(now);
    updatePrepared();
  }
  tick();
  const clock = setInterval(() => { if (!frozenAt && !document.hidden) tick(); }, 1000);
  window.addEventListener("pagehide", () => clearInterval(clock));

  /* ------------------------------------------------------------------
     2. PREFILL FROM THE LINK  (hire.html?company=Acme&name=Priya&position=IT%20Admin)
  ------------------------------------------------------------------ */
  (() => {
    const p = new URLSearchParams(location.search);
    const take = (key, el, max) => { const v = p.get(key); if (v) el.value = v.trim().slice(0, max); };
    take("company", f.company, 80);
    take("name", f.name, 80);
    take("position", f.position, 80);
    const role = p.get("role");
    if (role) [...f.role.options].forEach(o => { if (o.text.toLowerCase() === role.toLowerCase()) f.role.value = o.text; });
  })();

  /* ------------------------------------------------------------------
     3. "PREPARED FOR" BANNER
  ------------------------------------------------------------------ */
  function updatePrepared() {
    const n = f.name.value.trim(), c = f.company.value.trim();
    if (!n && !c) { prepared.hidden = true; return; }
    prepared.hidden = false;
    prepared.textContent = `Resume prepared for ${n || "you"}${c ? ` at ${c}` : ""} · ${fmtShort(frozenAt || new Date())}`;
  }
  ["input", "change"].forEach(ev => form.addEventListener(ev, updatePrepared));
  updatePrepared();

  /* ------------------------------------------------------------------
     4. VALIDATION
  ------------------------------------------------------------------ */
  function setError(input, el, msg) {
    el.textContent = msg;
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
    return !msg;
  }
  function validate() {
    const results = [
      [f.company, setError(f.company, err.company, f.company.value.trim().length < 2 ? "Please enter the company name." : "")],
      [f.name,    setError(f.name, err.name, f.name.value.trim().length < 2 ? "Please enter your name." : "")],
      [f.email,   setError(f.email, err.email, f.email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()) ? "That email address doesn't look right." : "")],
    ];
    const bad = results.find(([, ok]) => !ok);
    if (bad) { bad[0].focus(); return false; }
    return true;
  }
  [["company", f.company], ["name", f.name], ["email", f.email]].forEach(([k, input]) =>
    input.addEventListener("input", () => setError(input, err[k], "")));

  /* ------------------------------------------------------------------
     5. BUILD THE MESSAGE
  ------------------------------------------------------------------ */
  function collect() {
    const at = frozenAt || new Date();
    return {
      company:  f.company.value.trim(),
      name:     f.name.value.trim(),
      role:     f.role.value,
      position: f.position.value.trim(),
      email:    f.email.value.trim(),
      message:  f.message.value.trim(),
      time:     fmtFull(at),
      timezone: `${tz} (${offsetLabel(at)})`,
      iso:      at.toISOString(),
      source,
    };
  }

  function toText(d) {
    return [
      "Hello Rijul,",
      "",
      `I'm ${d.name} (${d.role}) at ${d.company}.`,
      d.position ? `Position: ${d.position}` : "",
      d.email    ? `Reply to: ${d.email}` : "",
      d.message  ? `\n${d.message}` : "",
      "",
      "--",
      "Sent from your portfolio's recruiter page",
      `Detected: ${d.time} · ${d.timezone}`,
      `Arrived from: ${d.source}`,
      `UTC: ${d.iso}`,
    ].filter((line, i, a) => !(line === "" && a[i - 1] === "")).join("\n");
  }

  function mailtoFor(d) {
    const subject = `Opportunity at ${d.company} - ${d.name}`;
    const body = toText(d).replace(/\n/g, "\r\n");
    return `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function openMail(href) {
    const a = document.createElement("a");
    a.href = href;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  async function copyText(text, btn, idle) {
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; }
    catch {
      const t = document.createElement("textarea");
      t.value = text; t.setAttribute("readonly", ""); t.style.position = "fixed"; t.style.opacity = "0";
      document.body.appendChild(t); t.select();
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      t.remove();
    }
    btn.textContent = ok ? "Copied!" : "Copy failed";
    setTimeout(() => { btn.textContent = idle; }, 2000);
  }

  /* ------------------------------------------------------------------
     6. SUBMIT
  ------------------------------------------------------------------ */
  const success = $("success");
  const showSuccess = (d, sent) => {
    $("s-name").textContent = d.name;
    $("s-text").textContent = sent
      ? "Your details were sent to Rijul. He will get back to you soon."
      : "Your email app should have opened with everything filled in. If it did not, copy the details below and email them to " + EMAIL + ".";
    $("s-summary").textContent = toText(d);
    $("s-mail").setAttribute("href", mailtoFor(d));
    $("s-mail").hidden = sent;
    form.hidden = true;
    success.hidden = false;
    success.focus();
  };

  form.addEventListener("submit", async e => {
    e.preventDefault();
    if (f.trap.value) return;                    // bots fill the hidden field
    if (!validate()) return;

    frozenAt = new Date();                       // freeze the detected time at submit
    tick();
    const d = collect();
    const btn = $("send-btn");

    if (FORM_ENDPOINT) {
      btn.disabled = true;
      try {
        const res = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(d),
        });
        if (!res.ok) throw new Error(String(res.status));
        showSuccess(d, true);
        return;
      } catch { /* fall through to the email route */ }
      finally { btn.disabled = false; }
    }

    openMail(mailtoFor(d));
    showSuccess(d, false);
  });

  $("copy-btn").addEventListener("click", () => {
    if (!validate()) return;
    copyText(toText(collect()), $("copy-btn"), "Copy as text");
  });
  $("s-copy").addEventListener("click", () => copyText($("s-summary").textContent, $("s-copy"), "Copy details"));
  $("s-edit").addEventListener("click", () => {
    frozenAt = null;
    success.hidden = true;
    form.hidden = false;
    tick();
    f.company.focus();
  });
})();
