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
  if (href === currentPage) a.classList.add("active");
});

document.querySelectorAll(".accordion-trigger").forEach((btn) => {
  btn.addEventListener("click", () => {
    const item = btn.closest(".accordion-item");
    item.classList.toggle("open");
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
          <p class="lead center-lead" style="margin-top:12px;">Thank you. A Life Advisor will follow up about your confidential consultation. This preview form is not yet connected to email.</p>
        </div>`;
    }, 900);
  });
}
