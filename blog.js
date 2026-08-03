(() => {
  const container = document.querySelector("#blog-publicaciones");
  if (!container) return;

  const formatDate = (value) => new Intl.DateTimeFormat("es-CL", {
    day: "numeric", month: "long", year: "numeric"
  }).format(new Date(`${value}T12:00:00`));

  const createCover = (post, className) => {
    const cover = document.createElement("div");
    cover.className = className;
    if (post.cover) {
      const image = document.createElement("img");
      image.src = post.cover;
      image.alt = post.coverAlt || `Portada de ${post.title}`;
      image.loading = "lazy";
      cover.append(image);
    } else {
      cover.setAttribute("aria-hidden", "true");
      cover.innerHTML = '<i class="fa-solid fa-leaf"></i>';
    }
    return cover;
  };

  const createCard = (post, featured = false) => {
    const article = document.createElement("article");
    article.className = featured ? "revista-destacada" : "revista-card";
    article.append(createCover(post, featured ? "revista-destacada-portada" : "revista-card-portada"));

    const content = document.createElement("div");
    content.className = featured ? "revista-destacada-contenido" : "revista-card-contenido";

    const category = document.createElement("span");
    category.className = "blog-categoria";
    category.textContent = post.category || "Nutrición";

    const heading = document.createElement("h3");
    heading.textContent = post.title;

    const excerpt = document.createElement("p");
    excerpt.textContent = post.excerpt;

    const meta = document.createElement("p");
    meta.className = "blog-meta";
    meta.textContent = `${formatDate(post.publishedAt)} · ${post.readMinutes} min de lectura`;

    const link = document.createElement("a");
    link.className = "blog-leer";
    link.href = `articulo.html?id=${encodeURIComponent(post.id)}&v=20260803-referencias`;
    link.textContent = "Leer artículo";
    link.setAttribute("aria-label", `Leer artículo: ${post.title}`);

    content.append(category, heading, excerpt, meta, link);
    article.append(content);
    return article;
  };

  fetch(`blog-data.json?v=${Date.now()}`)
    .then((response) => {
      if (!response.ok) throw new Error("No fue posible cargar las publicaciones");
      return response.json();
    })
    .then(({ posts = [] }) => {
      const sorted = [...posts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      const featured = sorted.find((post) => post.featured) || sorted[0];
      container.replaceChildren();
      if (featured) container.append(createCard(featured, true));
      const grid = document.createElement("div");
      grid.className = "revista-grid";
      sorted.filter((post) => post !== featured).forEach((post) => grid.append(createCard(post)));
      container.append(grid);
    })
    .catch(() => {
      const error = document.createElement("p");
      error.className = "blog-error";
      error.textContent = "Las publicaciones no están disponibles temporalmente.";
      container.replaceChildren(error);
    });
})();