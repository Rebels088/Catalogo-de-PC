
/*
 * TechCatalog Gaming
 * Public catalog powered by Supabase
 *
 * Features:
 * - Desktop, Laptop, Workstation, Movil
 * - Search and category filtering
 * - US and Puerto Rico region filtering
 * - Product specifications and images
 * - Seller offers, prices, currency and verification dates
 * - Published products only
 */

(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);

  const grid = $("#product-grid");
  const searchInput = $("#search-input");
  const categoryFilter = $("#category-filter");
  const regionFilter = $("#region-filter");
  const resultCount = $("#result-count");
  const connectionStatus = $("#connection-status");

  if (!grid || !searchInput || !categoryFilter || !regionFilter) {
    console.error("TechCatalog: Required catalog elements are missing from index.html.");
    return;
  }

  let supabaseClient = null;
  let products = [];
  let prices = [];

  const CATEGORY_ICONS = {
    Desktop: "▣",
    Laptop: "▱",
    Workstation: "◈",
    Movil: "▯"
  };

  function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[character]);
  }

  function safeURL(value) {
    try {
      const parsed = new URL(value);

      if (parsed.protocol === "https:" || parsed.protocol === "http:") {
        return parsed.href;
      }
    } catch {
      // Invalid or missing URL.
    }

    return "";
  }

  function formatPrice(price, currency) {
    const amount = Number(price);

    if (!Number.isFinite(amount)) {
      return "Price unavailable";
    }

    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: String(currency || "USD").trim(),
        maximumFractionDigits: 2
      }).format(amount);
    } catch {
      return `${String(currency || "USD")} ${amount.toFixed(2)}`;
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) return "Date not provided";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Date unavailable";
    }

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC"
    });
  }

  function regionName(region) {
    return {
      US: "United States",
      PR: "Puerto Rico",
      GLOBAL: "Global"
    }[region] || region || "Unspecified";
  }

  function availabilityName(value) {
    return {
      in_stock: "In stock",
      out_of_stock: "Out of stock",
      preorder: "Pre-order",
      unknown: "Availability unverified"
    }[value] || "Availability unverified";
  }

  function getProductPrices(product) {
    return prices.filter((price) => price.product_id === product.id);
  }

  function getRegionPrices(product, region) {
    const offers = getProductPrices(product);

    if (!region) return offers;

    return offers.filter((offer) =>
      offer.region === region || offer.region === "GLOBAL"
    );
  }

  function productMatchesRegion(product, region) {
    if (!region) return true;

    const offers = getProductPrices(product);

    // If seller offers exist, filter by the offer's region.
    if (offers.length > 0) {
      return offers.some((offer) =>
        offer.region === region || offer.region === "GLOBAL"
      );
    }

    // If no offers have been added, use the product's own region.
    return product.region === region || product.region === "GLOBAL";
  }

  function renderSpecifications(product) {
    const specs = product.specs;

    if (!specs || typeof specs !== "object" || Array.isArray(specs)) {
      return `<div>Specifications to be confirmed.</div>`;
    }

    const entries = Object.entries(specs).slice(0, 6);

    if (!entries.length) {
      return `<div>Specifications to be confirmed.</div>`;
    }

    return entries.map(([key, value]) => {
      const displayValue =
        value !== null && typeof value === "object"
          ? JSON.stringify(value)
          : String(value ?? "Not specified");

      return `
        <div>
          <strong>${escapeHTML(key)}:</strong>
          ${escapeHTML(displayValue)}
        </div>
      `;
    }).join("");
  }

  function renderPrices(product, selectedRegion) {
    const offers = getRegionPrices(product, selectedRegion);

    if (offers.length === 0) {
      return `
        <div class="price-empty">
          <strong>Price not yet verified</strong>
          <div>Seller pricing will appear here when available.</div>
        </div>
      `;
    }

    const sortedOffers = [...offers].sort((a, b) =>
      Number(a.price) - Number(b.price)
    );

    return `
      <div class="price-list">
        ${sortedOffers.map((offer) => {
          const sellerURL = safeURL(offer.seller_url);

          const sellerMarkup = sellerURL
            ? `<a href="${escapeHTML(sellerURL)}"
                 target="_blank"
                 rel="noopener noreferrer">${escapeHTML(offer.seller)} ↗</a>`
            : `<span>${escapeHTML(offer.seller)}</span>`;

          return `
            <div class="price-offer">
              <div class="price-offer-top">
                <strong class="price-value">
                  ${escapeHTML(formatPrice(offer.price, offer.currency))}
                </strong>
                <span class="price-region">
                  ${escapeHTML(regionName(offer.region))}
                </span>
              </div>

              <div class="price-seller">${sellerMarkup}</div>

              <div class="price-meta">
                ${escapeHTML(availabilityName(offer.availability))}
              </div>

              <div class="price-meta">
                Verified: ${escapeHTML(formatDate(offer.verified_at))}
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderProduct(product, selectedRegion) {
    const imageURL = safeURL(product.image_url);
    const officialURL = safeURL(product.official_url);

    const imageMarkup = imageURL
      ? `<img
           src="${escapeHTML(imageURL)}"
           alt="${escapeHTML(product.name)}"
           loading="lazy"
           onerror="this.style.display='none';this.nextElementSibling.style.display='grid';"
         >
         <span class="image-fallback" style="display:none">
           ${escapeHTML(CATEGORY_ICONS[product.category] || "◇")}
         </span>`
      : `<span class="image-fallback">
           ${escapeHTML(CATEGORY_ICONS[product.category] || "◇")}
         </span>`;

    const manufacturerLink = officialURL
      ? `<a class="product-link"
           href="${escapeHTML(officialURL)}"
           target="_blank"
           rel="noopener noreferrer">Manufacturer details ↗</a>`
      : "";

    return `
      <article class="product">
        <div class="product-image">
          ${imageMarkup}
        </div>

        <div class="product-body">
          <div class="category">
            ${escapeHTML(product.category)}
          </div>

          <h3>${escapeHTML(product.name)}</h3>

          <p class="description">
            ${escapeHTML(product.description || "No description available.")}
          </p>

          <div class="specs">
            ${renderSpecifications(product)}
          </div>

          <div class="product-region">
            Market: ${escapeHTML(regionName(product.region))}
          </div>

          <section class="product-prices">
            <h4>Seller prices</h4>
            ${renderPrices(product, selectedRegion)}
          </section>

          ${manufacturerLink}
        </div>
      </article>
    `;
  }

  function renderProducts() {
    const query = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const region = regionFilter.value;

    const filteredProducts = products.filter((product) => {
      const searchableText = [
        product.name,
        product.brand,
        product.model,
        product.description,
        product.category
      ].join(" ").toLowerCase();

      return searchableText.includes(query)
        && (!category || product.category === category)
        && productMatchesRegion(product, region);
    });

    resultCount.textContent =
      `${filteredProducts.length} product${filteredProducts.length === 1 ? "" : "s"}`;

    if (filteredProducts.length === 0) {
      grid.innerHTML = `
        <div class="message">
          No published products match these filters.
          Try another search or check whether products have been published
          in Supabase.
        </div>
      `;
      return;
    }

    grid.innerHTML = filteredProducts
      .map((product) => renderProduct(product, region))
      .join("");
  }

  async function loadCatalog() {
    const projectURL = window.SUPABASE_URL;
    const publishableKey = window.SUPABASE_PUBLISHABLE_KEY;

    if (!projectURL || !publishableKey) {
      connectionStatus.textContent = "Configuration missing";
      grid.innerHTML = `
        <div class="message">
          Supabase settings are missing. Check js/supabase-config.js.
        </div>
      `;
      return;
    }

    if (!window.supabase || typeof window.supabase.createClient !== "function") {
      connectionStatus.textContent = "Library unavailable";
      grid.innerHTML = `
        <div class="message">
          The Supabase JavaScript library did not load.
          Check the script URL in index.html and your internet connection.
        </div>
      `;
      return;
    }

    supabaseClient = window.supabase.createClient(
      projectURL,
      publishableKey
    );

    connectionStatus.textContent = "Loading catalog…";

    try {
      const { data: productData, error: productError } =
        await supabaseClient
          .from("products")
          .select(
            "id, brand, model, name, category, description, image_url, official_url, region, specs"
          )
          .eq("status", "published")
          .order("brand", { ascending: true });

      if (productError) throw productError;

      products = productData || [];
      prices = [];

      if (products.length > 0) {
        const productIDs = products.map((product) => product.id);

        const { data: priceData, error: priceError } =
          await supabaseClient
            .from("product_prices")
            .select(
              "id, product_id, seller, seller_url, region, currency, price, availability, verified_at"
            )
            .in("product_id", productIDs)
            .order("price", { ascending: true });

        if (priceError) {
          console.error("Could not load seller prices:", priceError);
          connectionStatus.textContent = "Products loaded; prices unavailable";
        } else {
          prices = priceData || [];
          connectionStatus.textContent = "Catalog connected";
        }
      } else {
        connectionStatus.textContent = "Connected — no published products";
      }

      renderProducts();
    } catch (error) {
      console.error("TechCatalog Supabase error:", error);

      connectionStatus.textContent = "Connection error";

      grid.innerHTML = `
        <div class="message">
          The catalog could not be loaded from Supabase.
          Check your Project URL, publishable key, table names,
          Row Level Security policies, and browser console.
        </div>
      `;

      resultCount.textContent = "Unable to load products";
    }
  }

  searchInput.addEventListener("input", renderProducts);
  categoryFilter.addEventListener("change", renderProducts);
  regionFilter.addEventListener("change", renderProducts);

  loadCatalog();
})();
