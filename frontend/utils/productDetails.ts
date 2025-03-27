export const Products = new Map();

Products.set("BASICO", {
    description: "3 ofertas activas simultáneas + 1 patrocinada. Ideal para pequeñas empresas.",
    image: "/assets/images/icon.png",
    name: "Plan Básico",
    price: 24.99,
    id: "BASICO"
});

Products.set("PREMIUM", {
    description: "Ofertas ilimitadas activas y patrocinadas. Máxima visibilidad y herramientas avanzadas.",
    image: "/assets/images/icon.png",
    name: "Plan Premium",
    price: 49.99,
    id: "PREMIUM"
});

Products.set("PATROCINAR", {
    description: "Promociona una oferta para destacarla durante un periodo de tiempo.",
    image: "/assets/images/icon.png",
    name: "Patrocinar oferta",
    price: 9.99,
    id: "PATROCINAR"
})

Products.set("ELIMINAR_ANUNCIOS", {
    description: "Elimina los anuncios en Camyo permanentemente.",
    image: "/assets/images/icon.png",
    name: "Eliminar anuncios",
    price: 9.99,
    id: "ELIMINAR_ANUNCIOS"
})
