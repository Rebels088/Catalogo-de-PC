
(() => {
  "use strict";

  const products = Array.isArray(window.PRODUCTS)
    ? window.PRODUCTS
    : [];

  const grid = document.querySelector("#product-grid");
  const searchInput = document.querySelector("#search-input");
  const sortSelect = document.querySelector("#sort-select");
  const resultCount = document.querySelector("#result-count");
  const emptyState = document.querySelector("#empty-state");
  const clearButton = document.querySelector("#clear-filters");

  const filterButtons = [
    ...document.querySelectorAll(".filter-button")
  ];

  const categoryTiles = [
    ...document.querySelectorAll("[data-shortcut]")
  ];

  let activeCategory = "Todos";

  function categoryLabel(category) {
    return category === "Movil"
      ? "Dispositivos móviles"
      : category;
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag);

    if (className) {
      element.className = className;
    }

    if (text !== undefined) {
      element.textContent = text;
    }

    return element;
  }

  function createCard(product) {
    const article = makeElement("article", "product-card");

    const imageLink = makeElement("a", "product-image-link");

    imageLink.href =
      `producto.html?id=${encodeURIComponent(product.id)}`;

    imageLink.setAttribute(
      "aria-label",
      `Ver detalles de ${product.name}`
    );

    const image = document.createElement("img");

    image.className = "product-image";
    image.src = product.image;
    image.alt = product.imageAlt || product.name;
    image.loading = "lazy";
    image.decoding = "async";

    image.addEventListener("error", () => {
      image.classList.add("image-failed");
      image.alt = `Imagen no disponible: ${product.name}`;
    }, { once: true });

    imageLink.append(image);

    const body = makeElement("div", "product-card-body");
    const top = makeElement("div", "product-card-top");

    top.append(
      makeElement(
        "span",
        "product-category",
        categoryLabel(product.category)
      ),
      makeElement(
        "span",
        "product-code",
        product.id.toUpperCase()
      )
    );

    const titleLink = makeElement("a", "product-title-link");

    titleLink.href =
      `producto.html?id=${encodeURIComponent(product.id)}`;

    titleLink.append(
      makeElement("h3", "product-title", product.name)
    );

    const summary = makeElement(
      "p",
      "product-summary",
      product.summary
    );

    const specList = makeElement("ul", "card-specs");

    Object.entries(product.specs)
      .slice(0, 3)
      .forEach(([label, value]) => {
        const item = makeElement("li");

        item.append(
          makeElement("span", "", label),
          makeElement("strong", "", value)
        );

        specList.append(item);
      });

    const footer = makeElement("div", "product-card-footer");

    footer.append(
      makeElement("span", "info-only", "FICHA INFORMATIVA"),
      makeElement("a", "details-link", "VER DETALLES →")
    );

    footer.lastElementChild.href =
      `producto.html?id=${encodeURIComponent(product.id)}`;

    body.append(top, titleLink, summary, specList, footer);
    article.append(imageLink, body);

    return article;
  }

  function render() {
    const query = searchInput.value
      .trim()
      .toLocaleLowerCase("es");

    let visible = products.filter((product) => {
      const categoryMatches =
        activeCategory === "Todos" ||
        product.category === activeCategory;

      const searchableText = [
        product.name,
        product.brand,
        product.model,
        product.category,
        product.summary,
        ...Object.entries(product.specs).flat()
      ]
        .join(" ")
        .toLocaleLowerCase("es");

      return categoryMatches &&
        searchableText.includes(query);
    });

    const sort = sortSelect.value;

    if (sort === "name-asc") {
      visible.sort((a, b) =>
        a.name.localeCompare(b.name, "es")
      );
    }

    if (sort === "name-desc") {
      visible.sort((a, b) =>
        b.name.localeCompare(a.name, "es")
      );
    }

    if (sort === "featured") {
      visible.sort((a, b) =>
        Number(b.featured) - Number(a.featured)
      );
    }

    grid.replaceChildren(...visible.map(createCard));

    resultCount.textContent =
      String(visible.length).padStart(2, "0");

    emptyState.hidden = visible.length !== 0;
    grid.hidden = visible.length === 0;
  }

  function setCategory(category) {
    activeCategory = category;

    filterButtons.forEach((button) => {
      const active = button.dataset.category === category;

      button.classList.toggle("is-active", active);

      button.setAttribute(
        "aria-pressed",
        String(active)
      );
    });

    render();
  }

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setCategory(button.dataset.category);
    });
  });

  categoryTiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      setCategory(tile.dataset.shortcut);

      document.querySelector("#catalogo")
        .scrollIntoView({ behavior: "smooth" });
    });
  });

  searchInput.addEventListener("input", render);
  sortSelect.addEventListener("change", render);

  clearButton.addEventListener("click", () => {
    searchInput.value = "";
    sortSelect.value = "featured";

    setCategory("Todos");
    searchInput.focus();
  });

  document.querySelector("#hero-total").textContent =
    String(products.length).padStart(2, "0");

  render();
})();
