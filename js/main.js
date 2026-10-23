(function preventWidows() {
  const blocks = document.querySelectorAll("h1, h2, h3, h4, p, .lead, .subnote, .accordion-body, .footer-disclosure, .diagnostic, .checklist li, .question-list p, .card p, .step p, .flow-item p, .article-copy p, .plain-answer p");
  blocks.forEach((el) => {
    if (el.closest("nav, form, script, style, .btn, .logo, .breadcrumb, .nav-links, .legal, .contact-hours, .footer-social, #mca-daily-draw")) return;
    if (el.querySelector("p, ul, ol, table, form, .accordion, h1, h2, h3")) return;
    const nodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (node.parentElement?.closest("script, style")) continue;
      nodes.push(node);
    }
    if (!nodes.length) return;
    const original = nodes.map((item) => item.nodeValue).join("");
    const words = original.trim().split(/\s+/).filter(Boolean);
    if (words.length < 2) return;
    const next = original.replace(/(\S+)[ \t]+(\S+)([ \t]*)$/, "$1\u00A0$2$3");
    if (next === original) return;
    let offset = 0;
    nodes.forEach((item) => {
      const len = item.nodeValue.length;
      item.nodeValue = next.slice(offset, offset + len);
      offset += len;
    });
  });
})();

const heroVideo = document.querySelector(".hero-video");
if (heroVideo) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroVideo.pause();
    heroVideo.removeAttribute("autoplay");
    heroVideo.remove();
  } else {
    const revealHeroVideo = () => heroVideo.classList.add("is-ready");
    if (heroVideo.readyState >= 2) revealHeroVideo();
    heroVideo.addEventListener("canplay", revealHeroVideo, { once: true });
    heroVideo.addEventListener("playing", revealHeroVideo, { once: true });
  }
}

const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const navCta = document.querySelector(".nav-cta");

if (hamburger) {
  hamburger.addEventListener("click", () => {
    navLinks?.classList.toggle("open");
    navCta?.classList.toggle("open");
    const open = navLinks?.classList.contains("open");
    hamburger.setAttribute("aria-expanded", String(open));
  });
}

const currentPage = location.pathname.split("/").pop() || "index.html";
const teamPages = ["about.html", "timothy-shaw.html", "stacey-marshall.html", "luis-herrera.html"];
document.querySelectorAll(".nav-links a").forEach((a) => {
  const href = (a.getAttribute("href") || "").split("/").pop();
  if (href === currentPage) {
    a.classList.add("active");
    a.setAttribute("aria-current", "page");
  }
});
if (teamPages.includes(currentPage) || currentPage === "why-life-advisors.html") {
  document.querySelectorAll(".nav-dropdown > a").forEach((a) => {
    if ((a.getAttribute("href") || "").includes("why-life-advisors.html")) {
      a.classList.add("active");
    }
  });
}

document.querySelectorAll(".accordion-trigger").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".accordion-item");
    const open = item.classList.toggle("open");
    btn.setAttribute("aria-expanded", String(open));
  });
});

document.querySelectorAll("[data-event]").forEach((el) => {
  el.addEventListener("click", () => {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: el.dataset.event,
      location: el.dataset.ctaLocation || "",
      label: el.textContent.trim()
    });
  });
});

function phoneDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 10);
}

function formatPhone(value) {
  const digits = phoneDigits(value);
  if (digits.length < 4) return digits;
  if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidPhone(value) {
  const digits = phoneDigits(value);
  return digits.length === 10 && /^[2-9]\d{2}[2-9]\d{6}$/.test(digits);
}

function fieldsValid(scope) {
  const fields = scope.querySelectorAll("input, select, textarea");
  for (const field of fields) {
    if (field.disabled || field.hasAttribute("data-skip-validate")) continue;
    if (!field.checkValidity()) {
      field.reportValidity();
      field.focus();
      return false;
    }
  }
  return true;
}

function setSmsStatus(form, message, kind) {
  const status = form.querySelector("[data-sms-status]");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("is-ok", kind === "ok");
  status.classList.toggle("is-error", kind === "error");
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];

function readStoredUtms() {
  try {
    return JSON.parse(sessionStorage.getItem("la_utm") || "{}");
  } catch {
    return {};
  }
}

function persistUtms() {
  const params = new URLSearchParams(location.search);
  const stored = readStoredUtms();
  UTM_KEYS.forEach((key) => {
    const value = params.get(key);
    if (value) stored[key] = value.slice(0, 200);
  });
  try {
    sessionStorage.setItem("la_utm", JSON.stringify(stored));
  } catch {
    /* private mode */
  }
  return stored;
}

function fillUtmFields(form) {
  const stored = persistUtms();
  UTM_KEYS.forEach((key) => {
    const input = form.querySelector(`[name="${key}"]`);
    if (input) input.value = stored[key] || "";
  });
}

persistUtms();

document.querySelectorAll(".contact-form[data-multistep]").forEach((form) => {
  const steps = [...form.querySelectorAll("[data-form-step]")];
  const progress = [...form.querySelectorAll(".form-progress-step")];
  const phone = form.querySelector("#phone");
  const smsConsent = form.querySelector("#consent-sms");
  const codeWrap = form.querySelector("[data-sms-code-wrap]");
  const codeInput = form.querySelector("#sms-code");
  const sendBtn = form.querySelector("[data-sms-send]");
  const checkBtn = form.querySelector("[data-sms-check]");
  const skipBtn = form.querySelector("[data-sms-skip]");
  let current = 0;
  // Launch: SMS UI is hidden; treat every submission as skipped until verification returns.
  let smsState = "skipped";
  form.dataset.smsVerified = "skipped";

  const showStep = (index) => {
    current = index;
    steps.forEach((step, i) => {
      step.hidden = i !== index;
    });
    progress.forEach((item, i) => {
      item.classList.toggle("is-active", i === index);
      item.classList.toggle("is-complete", i < index);
    });
    const firstField = steps[index]?.querySelector("input:not([type=hidden]):not([hidden]), select, textarea");
    firstField?.focus();
  };

  phone?.addEventListener("input", () => {
    const start = phone.selectionStart;
    const before = phone.value;
    phone.value = formatPhone(phone.value);
    if (smsState === "verified") {
      smsState = "idle";
      form.dataset.smsVerified = "";
      if (sendBtn) sendBtn.textContent = "Send code";
      setSmsStatus(form, "", "");
    }
    if (typeof start === "number" && document.activeElement === phone) {
      const delta = phone.value.length - before.length;
      phone.setSelectionRange(start + delta, start + delta);
    }
  });

  sendBtn?.addEventListener("click", () => {
    if (!isValidPhone(phone?.value)) {
      phone?.setCustomValidity("Enter a 10-digit U.S. phone number.");
      phone?.reportValidity();
      phone?.setCustomValidity("");
      return;
    }
    if (smsConsent && !smsConsent.checked) {
      smsConsent.setCustomValidity("Please opt in to SMS to receive a verification code.");
      smsConsent.reportValidity();
      smsConsent.setCustomValidity("");
      return;
    }
    codeWrap.hidden = false;
    codeInput?.focus();
    smsState = "sent";
    sendBtn.textContent = "Resend code";
    sendBtn.disabled = true;
    setTimeout(() => { sendBtn.disabled = false; }, 30000);
    setSmsStatus(form, "If a code arrives, enter it below. If it does not, you can continue and a Life Advisor will confirm this number by phone.", "ok");
  });

  checkBtn?.addEventListener("click", () => {
    const code = (codeInput?.value || "").replace(/\D/g, "");
    if (code.length !== 6) {
      codeInput?.setCustomValidity("Enter the 6-digit code from your text.");
      codeInput?.reportValidity();
      codeInput?.setCustomValidity("");
      return;
    }
    smsState = "verified";
    form.dataset.smsVerified = "true";
    if (phone) phone.readOnly = true;
    if (sendBtn) {
      sendBtn.textContent = "Code sent";
      sendBtn.disabled = true;
    }
    setSmsStatus(form, "Code received. We’ll confirm this number.", "ok");
  });

  skipBtn?.addEventListener("click", () => {
    if (current === 0 && !fieldsValid(steps[0])) return;
    if (current === 0 && !isValidPhone(phone?.value)) {
      phone?.setCustomValidity("Enter a 10-digit U.S. phone number.");
      phone?.reportValidity();
      phone?.setCustomValidity("");
      return;
    }
    smsState = "skipped";
    form.dataset.smsVerified = "skipped";
    setSmsStatus(form, "We’ll confirm this number by phone.", "ok");
    if (current === 0) showStep(1);
  });

  form.querySelector("[data-form-next]")?.addEventListener("click", () => {
    if (!fieldsValid(steps[0])) return;
    if (!isValidPhone(phone?.value)) {
      phone?.setCustomValidity("Enter a 10-digit U.S. phone number.");
      phone?.reportValidity();
      phone?.setCustomValidity("");
      return;
    }
    showStep(1);
  });

  form.querySelector("[data-form-back]")?.addEventListener("click", () => {
    if (phone) phone.readOnly = false;
    showStep(0);
  });

  fillUtmFields(form);

  const submitError = form.querySelector("[data-form-error]");
  const setSubmitError = (message) => {
    if (!submitError) return;
    submitError.hidden = !message;
    submitError.textContent = message || "";
  };

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (current === 0) {
      form.querySelector("[data-form-next]")?.click();
      return;
    }
    if (!fieldsValid(steps[1])) return;
    if (!form.querySelector("#consent-contact")?.checked) {
      setSubmitError("Please agree to be contacted to send this request.");
      return;
    }

    fillUtmFields(form);
    const btn = form.querySelector("[type=submit]");
    const original = btn?.textContent;
    if (btn) {
      btn.textContent = "Sending…";
      btn.disabled = true;
    }
    setSubmitError("");

    const data = new FormData(form);
    const payload = {
      first: data.get("first"),
      last: data.get("last"),
      phone: data.get("phone"),
      email: data.get("email"),
      business: data.get("business"),
      mcaCount: data.get("mca-count"),
      state: data.get("state"),
      industry: data.get("industry"),
      revenue: data.get("revenue"),
      balance: data.get("balance"),
      current: data.get("current"),
      contactTime: data.get("contact-time"),
      message: data.get("message"),
      smsConsent: false,
      smsStatus: "skipped",
      contactConsent: data.get("consent-contact") === "on" || form.querySelector("#consent-contact")?.checked,
      formLocation: form.dataset.formLocation || "",
      utm_source: data.get("utm_source"),
      utm_medium: data.get("utm_medium"),
      utm_campaign: data.get("utm_campaign"),
      utm_content: data.get("utm_content"),
      utm_term: data.get("utm_term"),
      company_url: data.get("company_url")
    };

    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || !result.ok) {
        throw new Error(result.error || "Send failed");
      }
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "consultation_form_submit",
        location: form.dataset.formLocation || "",
        sms: smsState
      });
      window.location.href = "thank-you.html";
    } catch (err) {
      const fallback = "We could not send your request. Please call (888) 511-6259.";
      const message = err?.message && /511-6259/.test(err.message) ? err.message : fallback;
      setSubmitError(message);
      if (btn) {
        btn.textContent = original || "Request a Confidential Consultation";
        btn.disabled = false;
      }
    }
  });
});

document.querySelectorAll(".upload-form").forEach((form) => {
  const list = form.querySelector("[data-file-list]");
  const status = form.querySelector("[data-upload-status]");
  const inputs = [...form.querySelectorAll('input[type="file"]')];

  const renderFiles = () => {
    if (!list) return;
    const names = inputs.flatMap((input) => [...input.files].map((file) => file.name));
    list.innerHTML = names.length
      ? names.map((name) => `<li>${name}</li>`).join("")
      : "";
  };

  inputs.forEach((input) => input.addEventListener("change", renderFiles));

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const names = inputs.flatMap((input) => [...input.files].map((file) => file.name));
    if (status) {
      status.hidden = false;
      status.textContent = names.length
        ? "Those files stay on this device. A Life Advisor will send a secure link to receive MCA agreements and bank statements. Keep the files you selected ready to send, and do not email them unless instructed."
        : "A Life Advisor will send a secure link to receive MCA agreements and bank statements. Use the checklist above to gather what you’ll need.";
    }
    const btn = form.querySelector("[type=submit]");
    if (btn) {
      btn.textContent = "Ready for secure upload";
      btn.disabled = true;
    }
  });
});
