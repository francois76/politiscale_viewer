
import { getColor } from "./colors";
import type { PolitiScalesEntry } from "./types";

export function newFormData(): PolitiScalesEntry {
    return {
        id: Date.now(),
        pseudo: '',
        color: getColor('accent', 'peach'),
        constructivisme: null,
        essentialisme: null,
        justiceRehabilitative: null,
        justicePunitive: null,
        progressisme: null,
        conservatisme: null,
        internationalisme: null,
        nationalisme: null,
        communisme: null,
        capitalisme: null,
        regulation: null,
        laissezFaire: null,
        ecologie: null,
        productivisme: null,
        revolution: null,
        reformisme: null
    };
}