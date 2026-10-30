
(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const ui = {
    status: $("admin-status"),
    loginPanel: $("login-panel"),
    loginForm: $("login-form"),
    email: $("admin-email"),
    password: $("admin-password"),
    adminPanel: $("admin-panel"),
    logout: $("logout-button"),
    form: $("product-form"),
    id: $("product-id"),
    brand: $("product-brand"),
    model: $("product-model"),
    name: $("product-name"),
    category: $("product-category"),
    region: $("product-region"),
    description: $("product-description"),
    image: $("product-image"),
    officialUrl: $("product-url"),
    specs: $("product-specs"),
    status: $("product-status"),
    reset: $("reset-form"),
    products: $("admin-products")
  };

  let supabase;
  let currentUser = null;
  let adminVerified = false;
  let products = [];

  function message(text, type = "info") {
    if (!ui.status) return;

    ui.status.textContent = text;
    ui.status.dataset.state =
      type === "error" ? "error" :
      type === "success" ? "success" : "loading";
  }

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);
  }

  function safeURL(value, optional = false) {
    const text = String(value || "").trim();

    if (!text && optional) return "";

    let url;

    try {
      url = new URL(text);
    } catch {
      throw new Error("Introduce una URL válida que comience con https://.");
    }

    if (url.protocol !== "https:" && url.protocol !== "http:") {
      throw new Error("Las URL solo pueden usar HTTP o HTTPS.");
    }

    return url.href;
  }

  function setAuthenticated(isAuthenticated) {
    ui.loginPanel.hidden = isAuthenticated;
    ui.adminPanel.hidden = !isAuthenticated;
  }

  function requireClient() {
    if (
      !window.supabase ||
      !window.SUPABASE_URL ||
      !window.SUPABASE_PUBLISHABLE_KEY
    ) {
      throw new Error(
        "Falta la configuración de Supabase. Revisa js/supabase-config.js."
      );
    }

    if (!supabase) {
      supabase = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_PUBLISHABLE_KEY,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true
          }
        }
      );
    }

    return supabase;
  }

  async function verifyAdmin(user) {
    adminVerified = false;
    currentUser = null;
    setAuthenticated(false);

    if (!user) {
      message("Inicia sesión para administrar el catálogo.");
      return false;
    }

    const client = requireClient();

    const { data, error } = await client
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Error al verificar administrador:", error);

      message(
        "No se pudo verificar el acceso administrativo. Revisa los permisos de admin_users.",
        "error"
      );

      return false;
    }

    if (!data) {
      await client.auth.signOut();

      message(
        "Tu cuenta no tiene permisos de administrador.",
        "error"
      );

      return false;
    }

    currentUser = user;
    adminVerified = true;
    setAuthenticated(true);

    message(`Sesión iniciada: ${user.email}`, "success");

    await loadProducts();

    return true;
  }

  async function checkSession() {
    try {
      const client = requireClient();
      message("Verificando sesión...");

      const { data, error } = await client.auth.getSession();

      if (error) throw error;

      if (!data.session) {
        setAuthenticated(false);
        message("Inicia sesión para administrar el catálogo.");
        return;
      }

      await verifyAdmin(data.session.user);
    } catch (error) {
      console.error(error);
      setAuthenticated(false);
      message(error.message || "No se pudo conectar con Supabase.", "error");
    }
  }

  async function login(event) {
    event.preventDefault();

    const email = ui.email.value.trim();
    const password = ui.password.value;

    try {
      message("Iniciando sesión...");

      const client = requireClient();

      const { data, error } = await client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      const authorized = await verifyAdmin(data.user);

      if (authorized) {
        ui.password.value = "";
      }
    } catch (error) {
      console.error(error);

      message(
        error.message || "No se pudo iniciar sesión. Verifica tus credenciales.",
        "error"
      );
    }
  }

  async function logout() {
    try {
      adminVerified = false;
      currentUser = null;
      products = [];
      setAuthenticated(false);

      const client = requireClient();
      const { error } = await client.auth.signOut();

      if (error) throw error;

      message("Sesión cerrada correctamente.", "success");
    } catch (error) {
      console.error(error);
      message(error.message || "No se pudo cerrar la sesión.", "error");
    }
  }

  function resetForm() {
    ui.form.reset();
    ui.id.value = "";
    ui.status.value = "draft";

    const submitButton = ui.form.querySelector('[type="submit"]');

    if (submitButton) {
      submitButton.textContent = "GUARDAR PRODUCTO";
    }

    message("Formulario listo para un nuevo producto.");
  }

  function readSpecs() {
    const raw = ui.specs.value.trim();

    if (!raw) return {};

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error("Las especificaciones deben ser un JSON válido.");
    }

    if (
      !parsed ||
      Array.isArray(parsed) ||
      typeof parsed !== "object"
    ) {
      throw new Error(
        'Las especificaciones deben ser un objeto JSON, por ejemplo {"RAM":"16 GB"}.'
      );
    }

    return parsed;
  }

  function readProductForm() {
    const brand = ui.brand.value.trim();
    const model = ui.model.value.trim();
    const name = ui.name.value.trim();

    if (!brand || !model || !name) {
      throw new Error("Completa la marca, el modelo y el nombre.");
    }

    return {
      brand,
      model,
      name,
      category: ui.category.value,
      region: ui.region.value,
      description: ui.description.value.trim(),
      image_url: safeURL(ui.image.value, true) || null,
      official_url: safeURL(ui.officialUrl.value, true) || null,
      specs: readSpecs(),
      status: ui.status.value,
      updated_at: new Date().toISOString()
    };
  }

  async function saveProduct(event) {
    event.preventDefault();

    if (!adminVerified || !currentUser) {
      message("Inicia sesión como administrador antes de guardar.", "error");
      return;
    }

    const submitButton = ui.form.querySelector('[type="submit"]');

    try {
      const client = requireClient();
      const product = readProductForm();
      const existingId = ui.id.value.trim();

      if (submitButton) submitButton.disabled = true;

      message("Guardando producto...");

      let result;

      if (existingId) {
        result = await client
          .from("products")
          .update(product)
          .eq("id", existingId)
          .select()
          .single();
      } else {
        result = await client
          .from("products")
          .insert(product)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      resetForm();

      message(
        product.status === "published"
          ? "Producto guardado y publicado."
          : product.status === "archived"
            ? "Producto guardado como archivado."
            : "Producto guardado como borrador.",
        "success"
      );

      await loadProducts();
    } catch (error) {
      console.error("Error al guardar producto:", error);

      message(
        error.message ||
          "No se pudo guardar. Comprueba los permisos y los campos requeridos.",
        "error"
      );
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  }

  function editProduct(id) {
    if (!adminVerified) return;

    const product = products.find(item => item.id === id);

    if (!product) {
      message("No se encontró ese producto.", "error");
      return;
    }

    ui.id.value = product.id;
    ui.brand.value = product.brand || "";
    ui.model.value = product.model || "";
    ui.name.value = product.name || "";
    ui.category.value = product.category || "Desktop";
    ui.region.value = product.region || "US";
    ui.description.value = product.description || "";
    ui.image.value = product.image_url || "";
    ui.officialUrl.value = product.official_url || "";
    ui.specs.value = JSON.stringify(product.specs || {}, null, 2);
    ui.status.value = product.status || "draft";

    const submitButton = ui.form.querySelector('[type="submit"]');

    if (submitButton) {
      submitButton.textContent = "GUARDAR CAMBIOS";
    }

    ui.form.scrollIntoView({ behavior: "smooth", block: "start" });

    message(`Editando: ${product.name || product.model}`);
  }

  async function changeStatus(id, newStatus) {
    if (!adminVerified) return;

    const product = products.find(item => item.id === id);

    if (!product) return;

    const statusNames = {
      draft: "borrador",
      published: "publicado",
      archived: "archivado"
    };

    const confirmed = window.confirm(
      `¿Quieres cambiar "${product.name}" a estado ${statusNames[newStatus]}?`
    );

    if (!confirmed) return;

    try {
      message("Actualizando estado...");

      const { error } = await requireClient()
        .from("products")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);

      if (error) throw error;

      message("Estado del producto actualizado.", "success");

      await loadProducts();
    } catch (error) {
      console.error(error);
      message(error.message || "No se pudo cambiar el estado.", "error");
    }
  }

  async function deleteProduct(id) {
    if (!adminVerified) return;

    const product = products.find(item => item.id === id);

    if (!product) return;

    const confirmed = window.confirm(
      `¿Eliminar permanentemente "${product.name}"?\n\n` +
      "Esta acción no se puede deshacer. También puede afectar sus precios asociados."
    );

    if (!confirmed) return;

    try {
      message("Eliminando producto...");

      const client = requireClient();

      // Eliminar precios asociados primero.
      const { error: priceError } = await client
        .from("product_prices")
        .delete()
        .eq("product_id", id);

      if (priceError) throw priceError;

      const { error: productError } = await client
        .from("products")
        .delete()
        .eq("id", id);

      if (productError) throw productError;

      message("Producto eliminado.", "success");

      if (ui.id.value === id) resetForm();

      await loadProducts();
    } catch (error) {
      console.error(error);

      message(
        error.message ||
          "No se pudo eliminar el producto. Comprueba los permisos de Supabase.",
        "error"
      );
    }
  }

  function renderProducts() {
    if (!ui.products) return;

    if (products.length === 0) {
      ui.products.innerHTML = `
        <p>No hay productos registrados todavía.</p>
      `;
      return;
    }

    ui.products.innerHTML = products.map(product => {
      const statusLabels = {
        draft: "Borrador",
        published: "Publicado",
        archived: "Archivado"
      };

      const status = product.status || "draft";

      return `
        <article class="product-card" style="margin-bottom: 16px;">
          <div class="product-content">
            <div class="product-topline">
              <span class="product-brand">${escapeHTML(product.brand)}</span>
              <span class="product-category">${escapeHTML(
                statusLabels[status] || status
              )}</span>
            </div>

            <h3>${escapeHTML(product.name || product.model)}</h3>

            <p class="product-description">
              ${escapeHTML(product.model)} ·
              ${escapeHTML(product.category)} ·
              ${escapeHTML(product.region)}
            </p>

            <div class="product-actions">
              <button class="button button-outline"
                type="button" data-action="edit"
                data-id="${escapeHTML(product.id)}">
                EDITAR
              </button>

              ${
                status !== "published"
                  ? `<button class="button button-primary"
                       type="button" data-action="publish"
                       data-id="${escapeHTML(product.id)}">
                       PUBLICAR
                     </button>`
                  : `<button class="button button-outline"
                       type="button" data-action="draft"
                       data-id="${escapeHTML(product.id)}">
                       PASAR A BORRADOR
                     </button>`
              }

              ${
                status !== "archived"
                  ? `<button class="button button-outline"
                       type="button" data-action="archive"
                       data-id="${escapeHTML(product.id)}">
                       ARCHIVAR
                     </button>`
                  : ""
              }

              <button class="button button-outline"
                type="button" data-action="delete"
                data-id="${escapeHTML(product.id)}">
                ELIMINAR
              </button>
            </div>
          </div>
        </article>
      `;
    }).join("");
  }

  async function loadProducts() {
    if (!adminVerified || !currentUser) return;

    try {
      const { data, error } = await requireClient()
        .from("products")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) throw error;

      products = data || [];

      renderProducts();
    } catch (error) {
      console.error("Error al cargar productos:", error);

      if (ui.products) {
        ui.products.textContent =
          "No se pudieron cargar los productos. Comprueba los permisos de Supabase.";
      }

      message("Error al cargar los productos.", "error");
    }
  }

  function bindEvents() {
    ui.loginForm?.addEventListener("submit", login);
    ui.logout?.addEventListener("click", logout);
    ui.form?.addEventListener("submit", saveProduct);
    ui.reset?.addEventListener("click", resetForm);

    ui.products?.addEventListener("click", async (event) => {
      const button = event.target.closest("button[data-action][data-id]");

      if (!button || !adminVerified) return;

      const id = button.dataset.id;
      const action = button.dataset.action;

      if (action === "edit") {
        editProduct(id);
      } else if (action === "publish") {
        await changeStatus(id, "published");
      } else if (action === "draft") {
        await changeStatus(id, "draft");
      } else if (action === "archive") {
        await changeStatus(id, "archived");
      } else if (action === "delete") {
        await deleteProduct(id);
      }
    });

    const client = requireClient();

    client.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        adminVerified = false;
        currentUser = null;
        products = [];
        setAuthenticated(false);
        message("Sesión cerrada. Inicia sesión para continuar.");
      }
    });
  }

  async function init() {
    try {
      requireClient();
      bindEvents();
      await checkSession();
    } catch (error) {
      console.error(error);
      setAuthenticated(false);
      message(error.message || "No se pudo iniciar el panel.", "error");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
