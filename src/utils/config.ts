import type { PolitiScaleCategoryKey } from "./types";
import { POLITISCALE_CATEGORIES } from "./types";


// Configuration des axes PolitiScales avec les identifiants
export type AxisConfig = {
    key: PolitiScaleCategoryKey;
    oppositeKey: PolitiScaleCategoryKey;
};

export const AXES_CONFIG: AxisConfig[] = [
    { key: 'constructivisme', oppositeKey: 'essentialisme' },
    { key: 'justiceRehabilitative', oppositeKey: 'justicePunitive' },
    { key: 'progressisme', oppositeKey: 'conservatisme' },
    { key: 'internationalisme', oppositeKey: 'nationalisme' },
    { key: 'communisme', oppositeKey: 'capitalisme' },
    { key: 'regulation', oppositeKey: 'laissezFaire' },
    { key: 'ecologie', oppositeKey: 'productivisme' },
    { key: 'revolution', oppositeKey: 'reformisme' }
];

// Utilitaire pour obtenir le nom d'affichage à partir de l'identifiant
export function getCategoryDisplayName(key: PolitiScaleCategoryKey): string {
    return POLITISCALE_CATEGORIES[key];
}

// Utilitaire pour obtenir la clé opposée
export function getOppositeKey(key: PolitiScaleCategoryKey): PolitiScaleCategoryKey | undefined {
    const axis = AXES_CONFIG.find(axis => axis.key === key || axis.oppositeKey === key);
    if (!axis) return undefined;
    return axis.key === key ? axis.oppositeKey : axis.key;
}
