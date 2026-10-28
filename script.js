
const products = [
    {
        id: 1,
        name: "Dell OptiPlex Desktop",
        brand: "Dell",
        category: "Desktop",
        description: "Computadora de escritorio para oficina y productividad.",
        specs: "Intel Core i5 · 16 GB RAM · 512 GB SSD",
        price: 699,
        image: "https://placehold.co/600x400/f1f5f9/1e293b?text=Dell+OptiPlex"
    },
    {
        id: 2,
        name: "HP Pavilion Laptop",
        brand: "HP",
        category: "Laptop",
        description: "Laptop para estudiar, trabajar y uso diario.",
        specs: "Intel Core i5 · 16 GB RAM · 512 GB SSD",
        price: 799,
        image: "https://placehold.co/600x400/f1f5f9/1e293b?text=HP+Pavilion"
    },
    {
        id: 3,
        name: "Lenovo ThinkStation",
        brand: "Lenovo",
        category: "Workstation",
        description: "Estación de trabajo para aplicaciones profesionales.",
        specs: "Intel Xeon · 32 GB RAM · 1 TB SSD",
        price: 1899,
        image: "https://placehold.co/600x400/f1f5f9/1e293b?text=ThinkStation"
    },
    {
        id: 4,
        name: "Apple MacBook Air",
        brand: "Apple",
        category: "Laptop",
        description: "Laptop portátil para productividad y creación de contenido.",
        specs: "Apple Silicon · 16 GB RAM · 512 GB SSD",
        price: 1099,
        image: "https://placehold.co/600x400/f1f5f9/1e293b?text=MacBook+Air"
    },
    {
        id: 5,
        name: "Samsung Galaxy Smartphone",
        brand: "Samsung",
        category: "Movil",
        description: "Teléfono inteligente para comunicación y aplicaciones.",
        specs: "256 GB de almacenamiento · Pantalla táctil",
        price: 799,
        image: "https://placehold.co/600x400/f1f5f9/1e293b?text=Galaxy"
    },
    {
        id: 6,
        name: "Apple iPad",
        brand: "Apple",
        category: "Movil",
        description: "Tableta para lectura, estudio y entretenimiento.",
        specs: "128 GB de almacenamiento · Pantalla táctil",
        price: 449,
        image: "https://placehold.co/600x400/f1f5f9/1e293b?text=iPad"
    }
];

const productGrid = document.getElementById("product-grid");
const searchInput = document.getElementById("search");
const resultCount = document.getElementById("result-count");
const emptyMessage = document.getElementById("empty-message");
const filterButtons = document.querySelectorAll(".filter");

let activeCategory = "Todos";

function renderProducts() {
    const searchTerm = searchInput.value
        .trim()
        .toLowerCase();

    const filteredProducts = products.filter(product => {
        const matchesCategory =
            activeCategory === "Todos" ||
            product.category === activeCategory;

        const searchableText = [
            product.name,
            product.brand,
            product.category,
            product.description,
            product.specs
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(searchTerm);

        return matchesCategory && matchesSearch;
    });

    productGrid.replaceChildren();

    filteredProducts.forEach(product => {
        const card = document.createElement("article");
        card.className = "product-card";

        const image = document.createElement("img");
        image.className = "product-image";
        image.src = product.image;
        image.alt = product.name;
        image.loading = "lazy";

        const content = document.createElement("div");
        content.className = "product-content";

        const category = document.createElement("p");
        category.className = "product-category";
        category.textContent = product.category === "Movil"
            ? "Dispositivo móvil"
            : product.category;

        const name = document.createElement("h3");
        name.textContent = product.name;

        const description = document.createElement("p");
        description.className = "product-description";
        description.textContent = product.description;

        const specs = document.createElement("p");
        specs.className = "product-specs";
        specs.textContent = product.specs;

        const price = document.createElement("p");
        price.className = "product-price";
        price.textContent = new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD"
        }).format(product.price);

        content.append(category, name, description, specs, price);
        card.append(image, content);
        productGrid.append(card);
    });

    resultCount.textContent =
        `${filteredProducts.length} equipos encontrados`;

    emptyMessage.hidden = filteredProducts.length !== 0;
}

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        activeCategory = button.dataset.category;

        filterButtons.forEach(item => {
            const isActive = item === button;
            item.classList.toggle("active", isActive);
            item.setAttribute("aria-pressed", String(isActive));
        });

        renderProducts();
    });

    button.setAttribute(
        "aria-pressed",
        String(button.dataset.category === activeCategory)
    );
});

searchInput.addEventListener("input", renderProducts);

renderProducts();
