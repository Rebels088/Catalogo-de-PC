
/*
  CATÁLOGO DE PRODUCTOS
  Edita este archivo para añadir o modificar equipos.

  Categorías permitidas:
  Desktop, Laptop, Workstation, Movil.

  Los datos son ejemplos ilustrativos y deben verificarse.
*/

window.PRODUCTS = [
  {
    id: "desktop-001",
    name: "Apex Forge X7",
    brand: "Apex",
    model: "Forge X7",
    category: "Desktop",
    featured: true,
    image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Computadora de escritorio de alto rendimiento",
    summary: "Sistema de escritorio para videojuegos y tareas exigentes.",
    specs: {
      "Procesador": "AMD Ryzen 7 (ejemplo)",
      "Memoria RAM": "32 GB DDR5 (ejemplo)",
      "Gráficos": "GPU dedicada",
      "Almacenamiento": "1 TB SSD (ejemplo)",
      "Sistema operativo": "Windows o Linux"
    }
  },
  {
    id: "laptop-001",
    name: "Vector 16 Pro",
    brand: "Vector",
    model: "16 Pro",
    category: "Laptop",
    featured: true,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Computadora portátil abierta",
    summary: "Laptop para videojuegos, creación de contenido y productividad.",
    specs: {
      "Procesador": "Intel Core i7 (ejemplo)",
      "Memoria RAM": "16 GB (ejemplo)",
      "Gráficos": "GPU dedicada",
      "Almacenamiento": "1 TB SSD (ejemplo)",
      "Pantalla": "16 pulgadas (ejemplo)"
    }
  },
  {
    id: "workstation-001",
    name: "Vertex Studio W5",
    brand: "Vertex",
    model: "Studio W5",
    category: "Workstation",
    featured: true,
    image: "https://images.unsplash.com/photo-1591238372338-22d30c883a86?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Estación de trabajo de escritorio",
    summary: "Estación de trabajo para ingeniería, modelado y producción.",
    specs: {
      "Procesador": "CPU profesional multinúcleo",
      "Memoria RAM": "64 GB (ejemplo)",
      "Gráficos": "GPU profesional o dedicada",
      "Almacenamiento": "2 TB SSD (ejemplo)",
      "Uso recomendado": "CAD, renderizado y producción"
    }
  },
  {
    id: "mobile-001",
    name: "Nova One Ultra",
    brand: "Nova",
    model: "One Ultra",
    category: "Movil",
    featured: true,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Teléfono inteligente moderno",
    summary: "Teléfono inteligente para fotografía, comunicación y aplicaciones.",
    specs: {
      "Pantalla": "OLED (ejemplo)",
      "Memoria RAM": "12 GB (ejemplo)",
      "Almacenamiento": "256 GB (ejemplo)",
      "Conectividad": "Wi-Fi y red móvil",
      "Sistema operativo": "Android, según versión"
    }
  },
  {
    id: "desktop-002",
    name: "Northstar Compact",
    brand: "Northstar",
    model: "Compact",
    category: "Desktop",
    featured: false,
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Computadora de escritorio con periféricos",
    summary: "Equipo compacto para productividad, oficina y estudio.",
    specs: {
      "Procesador": "Intel Core i5 (ejemplo)",
      "Memoria RAM": "16 GB (ejemplo)",
      "Gráficos": "Integrados o dedicados",
      "Almacenamiento": "512 GB SSD (ejemplo)",
      "Uso recomendado": "Oficina y estudio"
    }
  },
  {
    id: "laptop-002",
    name: "Slate Air 14",
    brand: "Slate",
    model: "Air 14",
    category: "Laptop",
    featured: false,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Laptop delgada sobre un escritorio",
    summary: "Laptop ligera para movilidad, estudio y productividad.",
    specs: {
      "Procesador": "CPU de bajo consumo",
      "Memoria RAM": "16 GB (ejemplo)",
      "Gráficos": "Integrados",
      "Almacenamiento": "512 GB SSD (ejemplo)",
      "Pantalla": "14 pulgadas (ejemplo)"
    }
  },
  {
    id: "workstation-002",
    name: "Titan Render S2",
    brand: "Titan",
    model: "Render S2",
    category: "Workstation",
    featured: false,
    image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Torre de computadora para trabajo especializado",
    summary: "Plataforma configurable para cargas de trabajo intensivas.",
    specs: {
      "Procesador": "CPU de alto rendimiento",
      "Memoria RAM": "64 GB o más, según configuración",
      "Gráficos": "GPU dedicada",
      "Almacenamiento": "SSD NVMe",
      "Uso recomendado": "Renderizado y cálculo"
    }
  },
  {
    id: "mobile-002",
    name: "Tab Horizon 11",
    brand: "Horizon",
    model: "Tab 11",
    category: "Movil",
    featured: false,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1000&q=85",
    imageAlt: "Tableta con pantalla táctil",
    summary: "Tableta para lectura, dibujo, estudio y entretenimiento.",
    specs: {
      "Pantalla": "11 pulgadas (ejemplo)",
      "Memoria RAM": "8 GB (ejemplo)",
      "Almacenamiento": "128 GB (ejemplo)",
      "Conectividad": "Wi-Fi o móvil",
      "Accesorios": "Compatibilidad variable con lápiz y teclado"
    }
  }
];
