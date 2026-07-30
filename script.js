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
window.addEventListener("scroll", () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 40);
});

document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", (event) => {
        event.preventDefault();
        const destino = document.querySelector(link.getAttribute("href"));
        if (destino) {
            destino.scrollIntoView({ behavior: "smooth" });
            destino.setAttribute("tabindex", "-1");
            destino.focus();
        }
    });
});
