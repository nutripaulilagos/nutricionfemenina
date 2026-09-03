(() => {
  const main = document.querySelector("#articulo-publicado");
  const id = new URLSearchParams(location.search).get("id");
  const whatsappUrl = "https://wa.me/56936110436?text=Hola%20Paulina%2C%20le%C3%AD%20uno%20de%20tus%20art%C3%ADculos%20y%20quisiera%20agendar%20una%20evaluaci%C3%B3n%20nutricional.%20%C2%BFQu%C3%A9%20horarios%20tienes%20disponibles%3F";

  const setMeta = (selector, attribute, value) => {
    let element = document.querySelector(selector);
    if (!element) {
      element = document.createElement("meta");
      const [name, key] = selector.includes("property=") ? ["property", selector.match(/property="([^"]+)"/)?.[1]] : ["name", selector.match(/name="([^"]+)"/)?.[1]];
      if (key) element.setAttribute(name, key);
      document.head.append(element);
    }
    element.setAttribute(attribute, value);
  };

  const appendLinkedText = (container, text) => {
    const pattern = /(https?:\/\/[^\s]+)/g;
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      container.append(document.createTextNode(text.slice(cursor, match.index)));
      const cleanUrl = match[0].replace(/[.,;)]+$/, "");
      const trailing = match[0].slice(cleanUrl.length);
      const link = document.createElement("a");
      link.href = cleanUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = cleanUrl;
      container.append(link, document.createTextNode(trailing));
      cursor = match.index + match[0].length;
    }
    container.append(document.createTextNode(text.slice(cursor)));
  };

  const formatDate = (value) => new Intl.DateTimeFormat("es-CL", {
    day: "numeric", month: "long", year: "numeric"
  }).format(new Date(`${value}T12:00:00`));

  const ensureSentencePunctuation = (text) => {
    const clean = String(text || "").trim();
    return /[.!?…:;]["'»”)]?$/.test(clean) ? clean : `${clean}.`;
  };

  const addBody = (container, post) => {
    const blocks = String(post.content || "").split(/\n\s*\n/).map((text) => text.trim()).filter(Boolean);
    let previousWasListIntro = false;

    blocks.forEach((block, index) => {
      if (index === 0 && block.toLowerCase() === post.title.trim().toLowerCase()) return;

      const lines = block.split(/\n+/).map((line) => line.trim()).filter(Boolean);

      if (/^referencias(?: científicas)?$/i.test(lines[0])) {
        const section = document.createElement("section");
        section.className = "articulo-referencias";
        const heading = document.createElement("h2");
        heading.textContent = "Referencias";
        const list = document.createElement("ol");
        lines.slice(1).forEach((reference) => {
          const item = document.createElement("li");
          appendLinkedText(item, reference.replace(/^\d+[.)]\s*/, ""));
          list.append(item);
        });
        section.append(heading, list);
        container.append(section);
        previousWasListIntro = false;
        return;
      }
      const explicitBullets = lines.every((line) => /^[-•]\s*/.test(line));
      const compactItems = lines.length > 1 && lines.every((line) => line.length <= 190);
      const shouldBeList = explicitBullets || (previousWasListIntro && compactItems);

      if (shouldBeList) {
        const list = document.createElement("ul");
        list.className = "articulo-lista";
        lines.forEach((line) => {
          const item = document.createElement("li");
          item.textContent = ensureSentencePunctuation(line.replace(/^[-•]\\s*/, ""));
          list.append(item);
        });
        container.append(list);
        previousWasListIntro = false;
        return;
      }

      if (lines.length > 1) {
        lines.forEach((line) => {
          const paragraph = document.createElement("p");
          paragraph.textContent = ensureSentencePunctuation(line);
          container.append(paragraph);
        });
        previousWasListIntro = /:\s*$/.test(lines.at(-1));
        return;
      }

      const isHeading = block.length <= 105 && !/[.!:]$/.test(block);
      const element = document.createElement(isHeading ? "h2" : "p");
      if (isHeading) element.className = "articulo-seccion";
      element.textContent = isHeading ? block : ensureSentencePunctuation(block);
      container.append(element);
      previousWasListIntro = !isHeading && /:\s*$/.test(block);
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
      setMeta('meta[name="description"]', "content", post.excerpt);
      setMeta('meta[property="og:title"]', "content", post.title);
      setMeta('meta[property="og:description"]', "content", post.excerpt);
      if (post.cover) setMeta('meta[property="og:image"]', "content", new URL(post.cover, location.href).href);
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

      const cta = document.createElement("aside");
      cta.className = "articulo-cta";
      const ctaTitle = document.createElement("h2");
      ctaTitle.textContent = "¿Quieres adaptar estas recomendaciones a tu vida?";
      const ctaText = document.createElement("p");
      ctaText.textContent = "En una evaluación nutricional revisamos tu alimentación, antecedentes, síntomas y objetivos para construir un plan individualizado y posible de mantener.";
      const ctaLink = document.createElement("a");
      ctaLink.className = "btn-principal";
      ctaLink.href = whatsappUrl;
      ctaLink.target = "_blank";
      ctaLink.rel = "noopener";
      ctaLink.textContent = "Consultar horarios por WhatsApp";
      cta.append(ctaTitle, ctaText, ctaLink);
      body.append(cta);
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
