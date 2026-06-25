// =========================
// ANIMACIONES AL HACER SCROLL
// =========================
const elementos = document.querySelectorAll(".card, .seccion h2, .banner h1, .banner p, .boton");
const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("visible");
        }
    });
}, {
    threshold: 0.15
});
elementos.forEach((elemento) => {
    observer.observe(elemento);
});
// =========================
// HEADER CON EFECTO AL DESPLAZARSE
// =========================
const header = document.querySelector(".hero");
window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
        header.style.background = "rgba(255,255,255,0.96)";
        header.style.boxShadow = "0 8px 24px rgba(0,0,0,.08)";
    } else {
        header.style.background = "rgba(255,255,255,.85)";
        header.style.boxShadow = "0 2px 12px rgba(0,0,0,.06)";
    }
});
// =========================
// DESPLAZAMIENTO SUAVE DEL MENÚ
// =========================
document.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener("click", function(e){
        e.preventDefault();
        const destino = document.querySelector(this.getAttribute("href"));
        destino.scrollIntoView({
            behavior:"smooth"
        });
    });
});
// =========================
// EFECTO HOVER EN BOTONES
// =========================
document.querySelectorAll(".boton").forEach((boton)=>{
    boton.addEventListener("mouseenter",()=>{
        boton.style.transform="translateY(-4px) scale(1.02)";
    });
    boton.addEventListener("mouseleave",()=>{
        boton.style.transform="translateY(0) scale(1)";
    });
});
// =========================
// APARICIÓN SUAVE DE LAS TARJETAS
// =========================
document.querySelectorAll(".card").forEach((card)=>{
    card.style.opacity="0";
    card.style.transform="translateY(40px)";
    card.style.transition="all .8s ease";
});
const observerCards = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
        if(entry.isIntersecting){
            entry.target.style.opacity="1";
            entry.target.style.transform="translateY(0)";
        }
    });
},{
    threshold:0.15
});
document.querySelectorAll(".card").forEach((card)=>{
    observerCards.observe(card);
});
