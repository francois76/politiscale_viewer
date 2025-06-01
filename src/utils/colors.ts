// Types pour l'autocomplétion



const redScales = [300, 400, 600, 700] as const;
const blueScales = [500, 600, 700] as const;
const actionScales = [600, 700] as const;
const grayScales = [300, 400, 600, 700, 800, 900] as const;

export const colorMap = {
    primary: [300, 400, 500, 600, 700, 800, 900],
    secondary: actionScales,
    neutral: [50, 600, 700, 800],
    success: actionScales,
    error: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    warning: actionScales,
    info: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    red: redScales,
    blue: blueScales,
    purple: actionScales,
    gray: grayScales,
    background: ['primary', 'secondary', 'tertiary', 'dark'],
    text: ['primary', 'secondary', 'tertiary', 'inverse', 'muted'],
    border: ['light', 'medium', 'dark', 'inverse', 'accent'],
    accent: ['mint', 'lavender', 'peach', 'coral', 'gold', 'teal'],
    nuance: ['orange', 'blue', 'red']
}



type ColorKeys = keyof typeof colorMap;

// Correction du typage pour une meilleure sécurité de type
export function getColor<K extends ColorKeys>(
    category: K,
    shade: K extends keyof typeof colorMap ? (typeof colorMap)[K][number] : never
): string {
    return getComputedStyle(document.documentElement).getPropertyValue(`--color-${category}-${shade}`);
};


// Utilitaire pour convertir un hex en objet rgba
export function hexToRgba(
    hex: string,
    alpha = 1
): { r: number; g: number; b: number; a: number } {
    let c = hex.replace("#", "");
    if (c.length === 3)
        c = c
            .split("")
            .map((x) => x + x)
            .join("");
    const num = parseInt(c, 16);
    return {
        r: (num >> 16) & 255,
        g: (num >> 8) & 255,
        b: num & 255,
        a: alpha,
    };
}
