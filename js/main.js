(function preventWidows() {
  const blocks = document.querySelectorAll("h1, h2, h3, h4, p, .lead, .subnote, .accordion-body, .footer-disclosure, .diagnostic, .checklist li, .question-list p, .card p, .step p, .flow-item p, .article-copy p, .plain-answer p");
  blocks.forEach((el) => {
    if (el.closest("nav, form, script, style, .btn, .logo, .breadcrumb, .nav-links, .legal, .contact-hours")) return;
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
document.querySelectorAll(".nav-links a").forEach((a) => {
  const href = a.getAttribute("href");
  if (href === currentPage) {
    a.classList.add("active");
    a.setAttribute("aria-current", "page");
  }
});

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

const form = document.querySelector(".contact-form");
if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const btn = form.querySelector("[type=submit]");
    btn.textContent = "Sending…";
    btn.disabled = true;
    setTimeout(() => {
      form.innerHTML = `
        <div class="text-center" style="padding:48px 12px;">
          <h3>Request received</h3>
          <p class="lead center-lead" style="margin-top:12px;">Thank you. Your request has been received. A member of the Life Advisors team will contact you using the information you provided. Submitting this form does not create a client relationship or guarantee eligibility or results.</p>
        </div>`;
    }, 900);
  });
}
