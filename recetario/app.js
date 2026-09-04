(() => {
  const state = { recipes: [], query: "", category: "Todas", diet: "Todas" };
  const grid = document.querySelector("#recipe-grid");
  const count = document.querySelector("#recipe-count");
  const empty = document.querySelector("#empty-state");
  const search = document.querySelector("#recipe-search");
  const diet = document.querySelector("#diet-filter");
  const chips = document.querySelector(".chips");
  const modal = document.querySelector("#recipe-modal");
  const closeButton = modal.querySelector(".close");
  let returnFocus = null;

  const imagePath = (id) => `recipes/${String(id).padStart(2, "0")}.webp`;
  const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  function filteredRecipes() {
    const query = normalize(state.query.trim());
    return state.recipes.filter((recipe) => {
      const searchable = normalize([
        recipe.title,
        recipe.description,
        ...recipe.ingredients,
        ...recipe.tags
      ].join(" "));
      return (state.category === "Todas" || recipe.category === state.category)
        && (state.diet === "Todas" || recipe.tags.includes(state.diet))
        && (!query || searchable.includes(query));
    });
  }

  function recipeCard(recipe, index) {
    const article = document.createElement("article");
    article.className = "card";
    article.innerHTML = `
      <button class="card-art tone-${index % 6}" type="button" data-recipe-id="${recipe.id}" aria-label="Abrir ${recipe.title}">
        <img src="${imagePath(recipe.id)}" alt="${recipe.title}" width="1100" height="1100" loading="lazy">
        <i>${recipe.category}</i>
      </button>
      <div class="card-body">
        <div class="meta"><span>◷ ${recipe.time} min</span><span>• ${recipe.kcal} kcal</span></div>
        <h3>${recipe.title}</h3>
        <p>${recipe.description}</p>
        <div class="tags">${recipe.tags.slice(0, 2).map((tag) => `<span>${tag}</span>`).join("")}</div>
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

  function openRecipe(recipe, trigger) {
    returnFocus = trigger;
    document.querySelector("#modal-photo").src = imagePath(recipe.id);
    document.querySelector("#modal-photo").alt = recipe.title;
    document.querySelector("#modal-category").textContent = recipe.category;
    document.querySelector("#recipe-title").textContent = recipe.title;
    document.querySelector("#modal-description").textContent = recipe.description;
    document.querySelector("#modal-quick").innerHTML = `
      <span>◷ <b>${recipe.time} min</b></span>
      <span>♨ <b>${recipe.kcal} kcal</b></span>
      <span>◉ <b>${recipe.servings} porciones</b></span>
      <span>◇ <b>${recipe.difficulty}</b></span>`;
    addListItems(document.querySelector("#modal-ingredients"), recipe.ingredients);
    addListItems(document.querySelector("#modal-steps"), recipe.steps);
    document.querySelector("#modal-nutrition").innerHTML = `
      <span><b>${recipe.kcal}</b> kcal</span>
      <span><b>${recipe.protein} g</b> proteína</span>
      <span><b>${recipe.carbs} g</b> carbohidratos</span>
      <span><b>${recipe.fat} g</b> grasas</span>
      <span><b>${recipe.fiber} g</b> fibra</span>`;
    document.querySelector("#modal-details").innerHTML = `
      <p><b>Alérgenos:</b> ${recipe.allergens}</p>
      <p><b>Conservación:</b> ${recipe.storage}</p>
      <p><b>Consejo:</b> ${recipe.tip}</p>`;
    modal.hidden = false;
    document.body.classList.add("modal-open");
    closeButton.focus();
  }

  function closeRecipe() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");
    if (returnFocus) returnFocus.focus();
  }

  search.addEventListener("input", () => {
    state.query = search.value;
    render();
  });

  diet.addEventListener("change", () => {
    state.diet = diet.value;
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

  fetch("recetas.json")
    .then((response) => {
      if (!response.ok) throw new Error("No se pudo cargar el recetario");
      return response.json();
    })
    .then((recipes) => {
      state.recipes = recipes;
      render();
    })
    .catch(() => {
      count.textContent = "No pudimos cargar las recetas";
      empty.hidden = false;
      empty.querySelector("h3").textContent = "El recetario no está disponible en este momento";
      empty.querySelector("p").textContent = "Puedes descargar la versión en PDF mientras lo solucionamos.";
    });
})();
