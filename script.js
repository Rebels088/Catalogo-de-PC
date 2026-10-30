
(() => {
  "use strict";

  const REGIONES = {
    US: "Estados Unidos",
    PR: "Puerto Rico",
    GLOBAL: "Internacional"
  };

  const CATEGORIAS = {
    Desktop: "Computadora de escritorio",
    Laptop: "Laptop",
    Workstation: "Estación de trabajo",
    Movil: "Dispositivo móvil"
  };

  const elementos = {
    estado: document.getElementById("connection-status"),
    busqueda: document.getElementById("search-input"),
    categoria: document.getElementById("category-filter"),
    region: document.getElementById("region-filter"),
    contador: document.getElementById("result-count"),
    catalogo: document.getElementById("product-grid")
  };

  let cliente;
  let productos = [];
  let precios = [];

  function escapar(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, caracter => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[caracter]);
  }

  function urlSegura(valor) {
    try {
      const url = new URL(String(valor || ""));
      return ["https:", "http:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function mostrarEstado(mensaje, tipo = "loading") {
    if (!elementos.estado) return;

    elementos.estado.textContent = mensaje;
    elementos.estado.dataset.state = tipo;
    elementos.estado.setAttribute("role", tipo === "error" ? "alert" : "status");
  }

  function mostrarMensajeCatalogo(titulo, mensaje) {
    if (!elementos.catalogo) return;

    elementos.catalogo.innerHTML = `
      <div class="empty-state">
        <h3>${escapar(titulo)}</h3>
        <p>${escapar(mensaje)}</p>
      </div>
    `;
  }

  function textoEspecificaciones(especificaciones) {
    if (!especificaciones || typeof especificaciones !== "object") {
      return [];
    }

    return Object.entries(especificaciones)
      .filter(([, valor]) => {
        return valor !== null &&
          valor !== undefined &&
          typeof valor !== "object" &&
          String(valor).trim() !== "";
      })
      .slice(0, 8)
      .map(([clave, valor]) => {
        const nombre = clave
          .replace(/[_-]/g, " ")
          .replace(/([a-z])([A-Z])/g, "$1 $2");

        return `${nombre}: ${valor}`;
      });
  }

  function formatearPrecio(precio, moneda) {
    const cantidad = Number(precio);

    if (!Number.isFinite(cantidad)) {
      return "Precio no disponible";
    }

    try {
      return new Intl.NumberFormat("es-PR", {
        style: "currency",
        currency: moneda || "USD"
      }).format(cantidad);
    } catch {
      return `${moneda || "USD"} ${cantidad.toFixed(2)}`;
    }
  }

  function formatearFecha(fecha) {
    if (!fecha) return "Fecha de verificación no disponible";

    const fechaValida = new Date(fecha);

    if (Number.isNaN(fechaValida.getTime())) {
      return "Fecha de verificación no disponible";
    }

    return `Verificado: ${fechaValida.toLocaleDateString("es-PR")}`;
  }

  function preciosDelProducto(producto) {
    return precios.filter(precio => precio.product_id === producto.id);
  }

  function coincideConRegion(producto, regionSeleccionada) {
    if (!regionSeleccionada) return true;

    const regionProducto = producto.region;
    const ofertas = preciosDelProducto(producto);

    return regionProducto === regionSeleccionada ||
      ofertas.some(oferta => oferta.region === regionSeleccionada);
  }

  function obtenerProductosFiltrados() {
    const busqueda = (elementos.busqueda?.value || "")
      .trim()
      .toLocaleLowerCase("es");

    const categoria = elementos.categoria?.value || "";
    const region = elementos.region?.value || "";

    return productos.filter(producto => {
      const texto = [
        producto.name,
        producto.brand,
        producto.model,
        producto.description,
        producto.category
      ].filter(Boolean).join(" ").toLocaleLowerCase("es");

      const coincideBusqueda = !busqueda || texto.includes(busqueda);
      const coincideCategoria = !categoria || producto.category === categoria;
      const coincideRegion = coincideConRegion(producto, region);

      return coincideBusqueda && coincideCategoria && coincideRegion;
    });
  }

  function renderizarPrecios(producto) {
    let ofertas = preciosDelProducto(producto);
    const regionSeleccionada = elementos.region?.value || "";

    if (regionSeleccionada) {
      ofertas = ofertas.filter(oferta => oferta.region === regionSeleccionada);
    }

    if (ofertas.length === 0) {
      return `
        <div class="product-prices">
          <h4>Precios</h4>
          <p class="price-empty">
            No hay precios verificados disponibles para esta selección.
          </p>
        </div>
      `;
    }

    const ofertasHTML = ofertas.map(oferta => {
      const enlace = urlSegura(oferta.seller_url);
      const vendedor = escapar(oferta.seller || "Vendedor");
      const region = REGIONES[oferta.region] || oferta.region || "Región no especificada";
      const precio = formatearPrecio(oferta.price, oferta.currency);
      const disponibilidad = oferta.availability || "Estado no especificado";
      const fecha = formatearFecha(oferta.verified_at);

      return `
        <div class="price-offer">
          <div>
            <div class="price-value">${escapar(precio)}</div>
            <div class="price-meta">
              ${vendedor}<br>
              ${escapar(region)} · ${escapar(disponibilidad)}<br>
              ${escapar(fecha)}
            </div>
          </div>
          ${
            enlace
              ? `<a href="${escapar(enlace)}"
                   target="_blank"
                   rel="noopener noreferrer"
                   aria-label="Ver precio en ${vendedor}">Ver oferta</a>`
              : ""
          }
        </div>
      `;
    }).join("");

    return `
      <div class="product-prices">
        <h4>Precios por vendedor</h4>
        <div class="price-list">${ofertasHTML}</div>
      </div>
    `;
  }

  function renderizarProducto(producto) {
    const marca = escapar(producto.brand || "");
    const nombre = escapar(producto.name || producto.model || "Producto");
    const categoria = escapar(CATEGORIAS[producto.category] || producto.category || "Hardware");
    const region = escapar(REGIONES[producto.region] || producto.region || "Región no especificada");
    const descripcion = escapar(producto.description || "No hay una descripción disponible.");
    const imagen = urlSegura(producto.image_url);
    const enlaceFabricante = urlSegura(producto.official_url);
    const especificaciones = textoEspecificaciones(producto.specs);

    const especificacionesHTML = especificaciones.length
      ? `<ul class="product-specs">
          ${especificaciones.map(item => `<li>${escapar(item)}</li>`).join("")}
        </ul>`
      : "";

    const imagenHTML = imagen
      ? `<img class="product-image"
              src="${escapar(imagen)}"
              alt="${nombre}"
              loading="lazy"
              referrerpolicy="no-referrer"
              onerror="this.replaceWith(Object.assign(document.createElement('div'), {
                className: 'image-fallback',
                textContent: 'Imagen no disponible'
              }))">`
      : `<div class="image-fallback">Imagen no disponible</div>`;

    const enlaceHTML = enlaceFabricante
      ? `<div class="product-actions">
          <a href="${escapar(enlaceFabricante)}"
             target="_blank"
             rel="noopener noreferrer">Sitio oficial</a>
        </div>`
      : "";

    return `
      <article class="product-card">
        ${imagenHTML}

        <div class="product-content">
          <div class="product-topline">
            <span class="product-brand">${marca}</span>
            <span class="product-category">${categoria}</span>
          </div>

          <h3 class="product-title">${nombre}</h3>

          <p class="product-description">${descripcion}</p>

          <span class="product-region">${region}</span>

          ${especificacionesHTML}

          ${renderizarPrecios(producto)}

          ${enlaceHTML}
        </div>
      </article>
    `;
  }

  function renderizarCatalogo() {
    const resultados = obtenerProductosFiltrados();

    if (elementos.contador) {
      elementos.contador.textContent =
        `${resultados.length} ${resultados.length === 1 ? "producto" : "productos"}`;
    }

    if (resultados.length === 0) {
      mostrarMensajeCatalogo(
        productos.length === 0 ? "Catálogo vacío" : "No se encontraron productos",
        productos.length === 0
          ? "Todavía no hay productos publicados. Los productos en borrador no aparecen en el catálogo público."
          : "Prueba con otra búsqueda, categoría o región."
      );
      return;
    }

    elementos.catalogo.innerHTML = resultados
      .map(renderizarProducto)
      .join("");
  }

  async function cargarCatalogo() {
    if (
      !window.supabase ||
      !window.SUPABASE_URL ||
      !window.SUPABASE_PUBLISHABLE_KEY
    ) {
      mostrarEstado(
        "No se encontró la configuración de Supabase. Revisa js/supabase-config.js.",
        "error"
      );

      mostrarMensajeCatalogo(
        "No se pudo conectar",
        "Comprueba la configuración de la base de datos."
      );
      return;
    }

    try {
      mostrarEstado("Conectando con la base de datos...", "loading");

      cliente = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_PUBLISHABLE_KEY
      );

      const respuestaProductos = await cliente
        .from("products")
        .select("*")
        .eq("status", "published")
        .order("brand", { ascending: true })
        .order("name", { ascending: true });

      if (respuestaProductos.error) {
        throw respuestaProductos.error;
      }

      productos = respuestaProductos.data || [];

      if (productos.length === 0) {
        precios = [];
        mostrarEstado(
          "Conexión establecida. No hay productos publicados todavía.",
          "success"
        );
        renderizarCatalogo();
        return;
      }

      const idsProductos = productos.map(producto => producto.id);

      const respuestaPrecios = await cliente
        .from("product_prices")
        .select("*")
        .in("product_id", idsProductos)
        .order("price", { ascending: true });

      if (respuestaPrecios.error) {
        throw respuestaPrecios.error;
      }

      precios = respuestaPrecios.data || [];

      mostrarEstado(
        "Conexión establecida. Catálogo actualizado correctamente.",
        "success"
      );

      renderizarCatalogo();
    } catch (error) {
      console.error("Error al cargar el catálogo:", error);

      mostrarEstado(
        "No se pudo cargar el catálogo. Revisa la conexión y los permisos de Supabase.",
        "error"
      );

      mostrarMensajeCatalogo(
        "Error al cargar los productos",
        "Comprueba tu configuración de Supabase, las políticas de acceso y la conexión a Internet. Consulta la consola del navegador para ver el detalle del error."
      );

      if (elementos.contador) {
        elementos.contador.textContent = "Error de carga";
      }
    }
  }

  function iniciar() {
    if (!elementos.catalogo) {
      console.error("No se encontró el elemento #product-grid en el HTML.");
      return;
    }

    elementos.busqueda?.addEventListener("input", renderizarCatalogo);
    elementos.categoria?.addEventListener("change", renderizarCatalogo);
    elementos.region?.addEventListener("change", renderizarCatalogo);

    cargarCatalogo();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", iniciar);
  } else {
    iniciar();
  }
})();
