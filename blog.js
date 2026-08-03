(() => {
  const container = document.querySelector("#blog-publicaciones");
  const dialog = document.querySelector("#blog-lector");
  if (!container || !dialog) return;

  const formatDate = (value) => new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));

  const createCover = (post, className) => {
    const cover = document.createElement("div");
    cover.className = className;
    if (post.cover) {
      const image = document.createElement("img");
      image.src = post.cover;
      image.alt = post.coverAlt || "";
      image.loading = "lazy";
      cover.append(image);
    } else {
      cover.setAttribute("aria-hidden", "true");
      cover.innerHTML = '<i class="fa-solid fa-leaf"></i>';
    }
    return cover;
  };

  const openPost = (post) => {
    const article = dialog.querySelector(".blog-lector-articulo");
    article.replaceChildren();
    article.append(createCover(post, "blog-lector-portada"));

    const header = document.createElement("header");
    header.className = "blog-lector-cabecera";
    const category = document.createElement("span");
    category.className = "blog-categoria";
    category.textContent = post.category;
    const title = document.createElement("h2");
    title.textContent = post.title;
    const meta = document.createElement("p");
    meta.className = "blog-meta";
    meta.textContent = `${post.author} Â· ${formatDate(post.publishedAt)} Â· ${post.readMinutes} min de lectura`;
    const lead = document.createElement("p");
    lead.className = "blog-bajada";
    lead.textContent = post.excerpt;
    header.append(category, title, meta, lead);
    article.append(header);

    const body = document.createElement("div");
    body.className = "blog-lector-cuerpo";
    post.content.split(/\n\s*\n/).filter(Boolean).forEach((text) => {
      const paragraph = document.createElement("p");
      paragraph.textContent = text.trim();
      body.append(paragraph);
    });
    article.append(body);
    dialog.showModal();
  };

  const card = (post, featured = false) => {
    const article = document.createElement("article");
    article.className = featured ? "revista-destacada" : "revista-card";
    article.append(createCover(post, featured ? "revista-destacada-portada" : "revista-card-portada"));

    const content = document.createElement("div");
    content.className = featured ? "revista-destacada-contenido" : "revista-card-contenido";
    const category = document.createElement("span");
    category.className = "blog-categoria";
    category.textContent = post.category;
    const heading = document.createElement(featured ? "h3" : "h3");
    heading.textContent = post.title;
    const excerpt = document.createElement("p");
    excerpt.textContent = post.excerpt;
    const meta = document.createElement("p");
    meta.className = "blog-meta";
    meta.textContent = `${formatDate(post.publishedAt)} Â· ${post.readMinutes} min`;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "blog-leer";
    button.textContent = "Leer artÃ­culo";
    button.addEventListener("click", () => openPost(post));
    content.append(category, heading, excerpt, meta, button);
    article.append(content);
    return article;
  };

  fetch(`blog-data.json?v=${Date.now()}`)
    .then((response) => {
      if (!response.ok) throw new Error("No fue posible cargar las publicaciones");
      return response.json();
    })
    .then(({ posts }) => {
      const sorted = [...posts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
      const featured = sorted.find((post) => post.featured) || sorted[0];
      container.replaceChildren();
      if (featured) container.append(card(featured, true));
      const grid = document.createElement("div");
      grid.className = "revista-grid";
      sorted.filter((post) => post !== featured).forEach((post) => grid.append(card(post)));
      container.append(grid);
    })
    .catch(() => {
      container.innerHTML = '<p class="blog-error">Las publicaciones no estÃ¡n disponibles temporalmente.</p>';
    });

  dialog.querySelector(".blog-lector-cerrar").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
})();
