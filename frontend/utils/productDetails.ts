export const Products = new Map();

Products.set("BASICO", {
    description: "Permite publicar hasta 10 ofertas de empleo con datos completos.",
    image: "/assets/images/icon.png",
    name: "Plan Básico",
    price: 24.99,
    id: "BASICO"
})

Products.set("PREMIUM", {
    description: "Permite publicar un número ilimitado de ofertas con datos completos.",
    image: "/assets/images/icon.png",
    name: "Plan Premium",
    price: 49.99,
    id: "PREMIUM"
})

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
