// Map des catégories PolitiScales : identifiant -> nom d'affichage
export const POLITISCALE_CATEGORIES = {
    constructivisme: "Constructivisme",
    essentialisme: "Essentialisme",
    justiceRehabilitative: "Justice Réhabilitative",
    justicePunitive: "Justice Punitive",
    progressisme: "Progressisme",
    conservatisme: "Conservatisme",
    internationalisme: "Internationalisme",
    nationalisme: "Nationalisme",
    communisme: "Communisme",
    capitalisme: "Capitalisme",
    regulation: "Régulation",
    laissezFaire: "Laissez-faire",
    ecologie: "Écologie",
    productivisme: "Productivisme",
    revolution: "Révolution",
    reformisme: "Réformisme"
} as const;

// Type générique pour les clés de la map
export type PolitiScaleCategoryKey = keyof typeof POLITISCALE_CATEGORIES;

// Composant principal
export type PolitiScalesEntry = {
    id: number;
    pseudo: string;
    color: string;
} & {
    [K in PolitiScaleCategoryKey]: number | null;
};
