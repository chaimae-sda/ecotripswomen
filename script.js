const menuToggle = document.querySelector(".menu-toggle");
const header = document.querySelector(".site-header");
const form = document.querySelector(".contact-form");

menuToggle?.addEventListener("click", () => {
  const isOpen = header.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll(".main-nav a").forEach((link) => {
  link.addEventListener("click", () => {
    header.classList.remove("is-open");
    menuToggle?.setAttribute("aria-expanded", "false");
  });
});

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const email = new FormData(form).get("email") || "";
  const message = encodeURIComponent(
    `Bonjour EcoTrips Women, je veux recevoir les prochaines sorties. Email: ${email}`
  );
  window.location.href = `https://wa.me/212600368626?text=${message}`;
});
