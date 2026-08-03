(() => {
  const REPOSITORY = "nutripaulilagos/nutricionfemenina";
  const ALLOWED_USER = "nutripaulilagos";
  const BRANCH = "main";
  let token = "";

  const access = document.querySelector("#acceso-editor");
  const form = document.querySelector("#form-publicacion");
  const status = document.querySelector("#admin-estado");
  const tokenInput = document.querySelector("#github-token");
  const connectButton = document.querySelector("#conectar-github");

  const setStatus = (message, type = "") => {
    status.textContent = message;
    status.className = `admin-estado ${type}`.trim();
  };

  const api = async (path, options = {}) => {
    const response = await fetch(`https://api.github.com${path}`, {
      ...options,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(options.headers || {})
      }
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `Error ${response.status}`);
    }
    return response.json();
  };

  const encodeUtf8 = (text) => {
    const bytes = new TextEncoder().encode(text);
    let binary = "";
    bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
    return btoa(binary);
  };

  const decodeUtf8 = (base64) => {
    const binary = atob(base64.replace(/\n/g, ""));
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  };

  const encodeFile = async (file) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const chunkSize = 0x8000;
    let binary = "";
    for (let index = 0; index < bytes.length; index += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
    }
    return btoa(binary);
  };

  const slugify = (value) => value.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

  const connect = async () => {
    token = tokenInput.value.trim();
    if (!token) return setStatus("Ingresa tu token de GitHub.", "error");
    connectButton.disabled = true;
    setStatus("Verificando tu cuentaâ€¦");
    try {
      const [user, repository] = await Promise.all([
        api("/user"),
        api(`/repos/${REPOSITORY}`)
      ]);
      if (user.login.toLowerCase() !== ALLOWED_USER || !repository.permissions?.push) {
        throw new Error("Esta cuenta no estÃ¡ autorizada para editar el blog.");
      }
      tokenInput.value = "";
      access.hidden = true;
      form.hidden = false;
      form.publishedAt.value = new Date().toISOString().slice(0, 10);
      document.querySelector("#cuenta-conectada").textContent = `Conectada como @${user.login}`;
      setStatus("Acceso autorizado.", "success");
    } catch (error) {
      token = "";
      setStatus(`No fue posible ingresar: ${error.message}`, "error");
    } finally {
      connectButton.disabled = false;
    }
  };

  connectButton.addEventListener("click", connect);
  tokenInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") connect();
  });

  document.querySelector("#cerrar-sesion").addEventListener("click", () => {
    token = "";
    form.reset();
    form.hidden = true;
    access.hidden = false;
    setStatus("SesiÃ³n cerrada.");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    const title = data.get("title").trim();
    const slug = slugify(title);
    const file = data.get("cover");
    submit.disabled = true;
    setStatus("Publicando el artÃ­culoâ€¦");

    try {
      let cover = "";
      if (file && file.size) {
        if (file.size > 5 * 1024 * 1024) throw new Error("La portada debe pesar menos de 5 MB.");
        const extension = file.name.split(".").pop().toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
        cover = `blog-images/${Date.now()}-${slug}.${extension}`;
        await api(`/repos/${REPOSITORY}/contents/${cover}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `AÃ±ade portada para ${title}`,
            content: await encodeFile(file),
            branch: BRANCH
          })
        });
      }

      const current = await api(`/repos/${REPOSITORY}/contents/blog-data.json?ref=${BRANCH}`);
      const blog = JSON.parse(decodeUtf8(current.content));
      if (data.get("featured")) blog.posts.forEach((post) => { post.featured = false; });
      const words = data.get("content").trim().split(/\s+/).length;
      blog.posts.push({
        id: `${slug}-${Date.now()}`,
        title,
        category: data.get("category").trim(),
        excerpt: data.get("excerpt").trim(),
        content: data.get("content").trim(),
        cover,
        coverAlt: data.get("coverAlt").trim(),
        author: "Paulina Lagos",
        publishedAt: data.get("publishedAt"),
        readMinutes: Math.max(1, Math.ceil(words / 200)),
        featured: Boolean(data.get("featured"))
      });

      await api(`/repos/${REPOSITORY}/contents/blog-data.json`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Publica artÃ­culo: ${title}`,
          content: encodeUtf8(`${JSON.stringify(blog, null, 2)}\n`),
          sha: current.sha,
          branch: BRANCH
        })
      });

      form.reset();
      form.publishedAt.value = new Date().toISOString().slice(0, 10);
      setStatus("ArtÃ­culo publicado. GitHub Pages puede tardar uno o dos minutos en mostrarlo.", "success");
    } catch (error) {
      setStatus(`No se pudo publicar: ${error.message}`, "error");
    } finally {
      submit.disabled = false;
    }
  });
})();
