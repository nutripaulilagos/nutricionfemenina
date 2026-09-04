// Intersection observer para animación de tarjetas
const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
}, {
    threshold: 0.15
});

document.querySelectorAll(".card").forEach((card) => {
    cardObserver.observe(card);
});

const header = document.querySelector("header");
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector("#main-nav");

const closeMenu = () => {
    if (!header || !menuToggle) return;
    header.classList.remove("menu-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Abrir menú");
    const icon = menuToggle.querySelector("i");
    if (icon) icon.className = "fa-solid fa-bars";
};

if (menuToggle && header && mainNav) {
    menuToggle.addEventListener("click", () => {
        const isOpen = !header.classList.contains("menu-open");
        header.classList.toggle("menu-open", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
        const icon = menuToggle.querySelector("i");
        if (icon) icon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 980) closeMenu();
    });
}

window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 40);
});

document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const destino = document.querySelector(link.getAttribute("href"));
        if (destino) {
            const hash = link.getAttribute("href");
            if (window.location.hash !== hash) history.pushState(null, "", hash);
            destino.scrollIntoView({ behavior: "smooth" });
            destino.setAttribute("tabindex", "-1");
            window.setTimeout(() => destino.focus({ preventScroll: true }), 450);
            closeMenu();
        }
    });
});
