(() => {
  const state = { recipes: [], query: "", category: "Todas" };
  const grid = document.querySelector("#recipe-grid");
  const count = document.querySelector("#recipe-count");
  const empty = document.querySelector("#empty-state");
  const search = document.querySelector("#recipe-search");
  const chips = document.querySelector(".chips");
  const modal = document.querySelector("#recipe-modal");
  const closeButton = modal.querySelector(".close");
  let returnFocus = null;

  const imagePath = (id) => `recipes/${String(id).padStart(2, "0")}.webp`;
  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const categoryLabel = (recipe) => recipe.categories.join(" · ");

  function filteredRecipes() {
    const query = normalize(state.query.trim());
    return state.recipes.filter((recipe) => {
      const searchable = normalize([
        recipe.title,
        recipe.note,
        ...recipe.categories,
        ...recipe.ingredients
      ].join(" "));
      return (state.category === "Todas" || recipe.categories.includes(state.category))
        && (!query || searchable.includes(query));
    });
  }

  function recipeCard(recipe) {
    const article = document.createElement("article");
    article.className = "card";
    article.innerHTML = `
      <button class="card-art" type="button" data-recipe-id="${recipe.id}" aria-label="Abrir ${recipe.title}">
        <img src="${imagePath(recipe.id)}" alt="${recipe.title}" width="1200" height="624" loading="lazy">
        <i>${categoryLabel(recipe)}</i>
      </button>
      <div class="card-body">
        <div class="meta"><span>◷ ${recipe.time}</span><span>• ${recipe.servings}</span></div>
        <h3>${recipe.title}</h3>
        <p>${recipe.note}</p>
        <div class="tags">${recipe.categories.map((category) => `<span>${category}</span>`).join("")}</div>
        <button class="open" type="button" data-recipe-id="${recipe.id}">Ver receta <span aria-hidden="true">→</span></button>
      </div>`;
    return article;
  }

  function render() {
    const recipes = filteredRecipes();
    grid.replaceChildren(...recipes.map(recipeCard));
    count.textContent = `${recipes.length} de ${state.recipes.length} recetas`;
    empty.hidden = recipes.length !== 0;
  }

  function addListItems(container, values) {
    container.replaceChildren(...values.map((value) => {
      const item = document.createElement("li");
      item.textContent = value;
      return item;
    }));
  }

  function setRecipeParameter(recipeId) {
    const url = new URL(window.location.href);
    if (recipeId) url.searchParams.set("receta", recipeId);
    else url.searchParams.delete("receta");
    window.history.replaceState({}, "", url);
  }

  function openRecipe(recipe, trigger = null, updateUrl = true) {
    returnFocus = trigger;
    document.querySelector("#modal-photo").src = imagePath(recipe.id);
    document.querySelector("#modal-photo").alt = recipe.title;
    document.querySelector("#modal-category").textContent = categoryLabel(recipe);
    document.querySelector("#recipe-title").textContent = recipe.title;
    document.querySelector("#modal-quick").innerHTML = `
      <span>Tiempo <b>${recipe.time}</b></span>
      <span>Rinde <b>${recipe.servings}</b></span>`;
    addListItems(document.querySelector("#modal-ingredients"), recipe.ingredients);
    addListItems(document.querySelector("#modal-steps"), recipe.steps);
    document.querySelector("#modal-note p").textContent = recipe.note;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    if (updateUrl) setRecipeParameter(recipe.id);
    closeButton.focus();
  }

  function closeRecipe() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    setRecipeParameter(null);
    if (returnFocus) returnFocus.focus();
  }

  search.addEventListener("input", () => {
    state.query = search.value;
    render();
  });

  chips.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-category]");
    if (!button) return;
    state.category = button.dataset.category;
    chips.querySelectorAll("button").forEach((chip) => {
      const selected = chip === button;
      chip.classList.toggle("active", selected);
      chip.setAttribute("aria-pressed", String(selected));
    });
    render();
  });

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-recipe-id]");
    if (!button) return;
    const recipe = state.recipes.find((item) => item.id === Number(button.dataset.recipeId));
    if (recipe) openRecipe(recipe, button);
  });

  closeButton.addEventListener("click", closeRecipe);
  modal.addEventListener("mousedown", (event) => {
    if (event.target === modal) closeRecipe();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !modal.hidden) closeRecipe();
  });

  fetch("recetas.json?v=20260904-mediterraneo")
    .then((response) => {
      if (!response.ok) throw new Error("No se pudo cargar el recetario");
      return response.json();
    })
    .then((recipes) => {
      state.recipes = recipes;
      render();
      const requestedId = Number(new URLSearchParams(window.location.search).get("receta"));
      const requestedRecipe = state.recipes.find((recipe) => recipe.id === requestedId);
      if (requestedRecipe) openRecipe(requestedRecipe, null, false);
    })
    .catch(() => {
      count.textContent = "No pudimos cargar las recetas";
      empty.hidden = false;
      empty.querySelector("h3").textContent = "El recetario no está disponible en este momento";
      empty.querySelector("p").textContent = "Puedes descargar la versión en PDF mientras lo solucionamos.";
    });
})();
