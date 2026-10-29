
(() => {
  "use strict";

  const root = document.querySelector("#detail-root");

  const products = Array.isArray(window.PRODUCTS)
    ? window.PRODUCTS
    : [];

  const id = new URLSearchParams(
    window.location.search
  ).get("id");

  const product = products.find(
    (item) => item.id === id
  );

  function element(tag, className, text) {
    const node = document.createElement(tag);

    if (className) {
      node.className = className;
    }

    if (text !== undefined) {
      node.textContent = text;
    }

    return node;
  }

  if (!product) {
    root.append(
      element(
        "p",
        "section-kicker",
        "EQUIPO NO ENCONTRADO"
      ),
      element(
        "h1",
        "detail-not-found",
        "No encontramos esa ficha."
      ),
      element(
        "p",
        "detail-not-found-copy",
        "Vuelve al catálogo y selecciona uno de los equipos disponibles."
      )
    );

    const link = element(
      "a",
      "button button-primary",
      "VOLVER AL CATÁLOGO"
    );

    link.href = "index.html#catalogo";
    root.append(link);

    document.title = "Equipo no encontrado | TechCatalog";

    return;
  }

  document.title = `${product.name} | TechCatalog`;

  const layout = element("div", "detail-layout");
  const visual = element("div", "detail-visual");

  const image = document.createElement("img");

  image.src = product.image;
  image.alt = product.imageAlt || product.name;
  image.loading = "eager";

  image.addEventListener("error", () => {
    image.alt = `Imagen no disponible: ${product.name}`;
  }, { once: true });

  visual.append(
    image,
    element(
      "span",
      "detail-image-label",
      `TECHCATALOG / ${product.id.toUpperCase()}`
    )
  );

  const info = element("div", "detail-info");

  info.append(
    element(
      "p",
      "section-kicker",
      `FICHA TÉCNICA / ${product.category.toUpperCase()}`
    ),
    element("p", "detail-brand", product.brand),
    element("h1", "detail-title", product.name),
    element("p", "detail-summary", product.summary),
    element(
      "p",
      "detail-disclaimer",
      "Información de referencia. Confirma las especificaciones con el fabricante o distribuidor."
    )
  );

  const specsHeading = element(
    "h2",
    "spec-heading",
    "Especificaciones"
  );

  const specs = element("dl", "detail-specs");

  Object.entries(product.specs).forEach(([label, value]) => {
    specs.append(
      element("dt", "", label),
      element("dd", "", value)
    );
  });

  const actions = element("div", "detail-actions");

  const back = element(
    "a",
    "button button-primary",
    "VOLVER AL CATÁLOGO"
  );

  back.href = "index.html#catalogo";

  actions.append(back);

  info.append(specsHeading, specs, actions);
  layout.append(visual, info);
  root.append(layout);

  const related = products
    .filter((item) =>
      item.category === product.category &&
      item.id !== product.id
    )
    .slice(0, 3);

  if (related.length > 0) {
    const section = element("section", "related-section");

    section.append(
      element(
        "h2",
        "",
        "Más equipos de esta categoría"
      )
    );

    const list = element("div", "related-list");

    related.forEach((item) => {
      const link = element("a", "related-link");

      link.href =
        `producto.html?id=${encodeURIComponent(item.id)}`;

      link.append(
        element("span", "", item.name),
        element("span", "accent", "→")
      );

      list.append(link);
    });

    section.append(list);
    root.append(section);
  }
})();
