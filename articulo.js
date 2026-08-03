(() => {
  const main = document.querySelector("#articulo-publicado");
  const id = new URLSearchParams(location.search).get("id");

  const formatDate = (value) => new Intl.DateTimeFormat("es-CL", {
    day: "numeric", month: "long", year: "numeric"
  }).format(new Date(`${value}T12:00:00`));

  const addBody = (container, post) => {
    const blocks = String(post.content || "").split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean);
    blocks.forEach((block, index) => {
      if (index === 0 && block.toLowerCase() === post.title.trim().toLowerCase()) return;
      const lines = block.split(/\n+/).map((line) => line.trim()).filter(Boolean);
      const bulletLines = lines.filter((line) => /^[-•]\s*/.test(line));
      if (lines.length > 1 && bulletLines.length === lines.length) {
        const list = document.createElement("ul");
        lines.forEach((line) => {
          const item = document.createElement("li");
          item.textContent = line.replace(/^[-•]\s*/, "");
          list.append(item);
        });
        container.append(list);
        return;
      }
      if (lines.length > 1) {
        lines.forEach((line) => {
          const paragraph = document.createElement("p");
          paragraph.textContent = line;
          container.append(paragraph);
        });
        return;
      }
      const isHeading = block.length <= 105 && !/[.!:]$/.test(block);
      const element = document.createElement(isHeading ? "h2" : "p");
      element.textContent = block;
      container.append(element);
    });
  };

  fetch(`blog-data.json?v=${Date.now()}`)
    .then((response) => {
      if (!response.ok) throw new Error("No fue posible cargar el artículo");
      return response.json();
    })
    .then(({ posts = [] }) => {
      const post = posts.find((item) => item.id === id);
      if (!post) throw new Error("Artículo no encontrado");
      document.title = `${post.title} | Paulina Lagos`;
      main.replaceChildren();

      const article = document.createElement("article");
      article.className = "articulo-publicacion";

      if (post.cover) {
        const figure = document.createElement("figure");
        figure.className = "articulo-portada";
        const image = document.createElement("img");
        image.src = post.cover;
        image.alt = post.coverAlt || `Portada de ${post.title}`;
        figure.append(image);
        article.append(figure);
      }

      const header = document.createElement("header");
      header.className = "articulo-cabecera";
      const category = document.createElement("span");
      category.className = "blog-categoria";
      category.textContent = post.category || "Nutrición";
      const title = document.createElement("h1");
      title.textContent = post.title;
      const meta = document.createElement("p");
      meta.className = "blog-meta";
      meta.textContent = `${post.author} · ${formatDate(post.publishedAt)} · ${post.readMinutes} min de lectura`;
      const excerpt = document.createElement("p");
      excerpt.className = "articulo-bajada";
      excerpt.textContent = post.excerpt;
      header.append(category, title, meta, excerpt);
      article.append(header);

      const body = document.createElement("div");
      body.className = "articulo-cuerpo";
      addBody(body, post);
      article.append(body);
      main.append(article);
      window.scrollTo(0, 0);
    })
    .catch((error) => {
      const box = document.createElement("div");
      box.className = "articulo-error";
      const title = document.createElement("h1");
      title.textContent = "No pudimos abrir este artículo";
      const message = document.createElement("p");
      message.textContent = error.message;
      const link = document.createElement("a");
      link.className = "btn-principal";
      link.href = "index.html#blog";
      link.textContent = "Volver al blog";
      box.append(title, message, link);
      main.replaceChildren(box);
    });
})();