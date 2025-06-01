import type { PolitiScalesEntry } from "./types";

export const CSV_HEADERS = [
    'pseudo', 'color', 'constructivisme', 'essentialisme', 'justiceRehabilitative', 'justicePunitive',
    'progressisme', 'conservatisme', 'internationalisme', 'nationalisme', 'communisme', 'capitalisme',
    'regulation', 'laissezFaire', 'ecologie', 'productivisme', 'revolution', 'reformisme'
];

export function exportToCSV(data: PolitiScalesEntry[], filename = 'politiscales_data.csv') {
    const csvContent = [
        CSV_HEADERS.join(','),
        ...data.map(row => CSV_HEADERS.map(header => row[header as keyof PolitiScalesEntry]).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

export function importFromCSV(
    file: File,
    onSuccess: (entries: PolitiScalesEntry[]) => void,
    onError: () => void
) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') {
                onError();
                return;
            }
            const lines = text.split('\n');
            const headers = lines[0].split(',').map(h => h.trim());

            // Validate headers
            if (!CSV_HEADERS.every(h => headers.includes(h))) {
                onError();
                return;
            }

            const importedData: PolitiScalesEntry[] = lines.slice(1)
                .filter((line: string) => line.trim())
                .map((line: string, index: number) => {
                    const values = line.split(',').map(v => v.trim());
                    const entry: Partial<PolitiScalesEntry> = { id: Date.now() + index };

                    headers.forEach((header: string, i: number) => {
                        const key = header as keyof PolitiScalesEntry;
                        const value = values[i];

                        if (key === 'pseudo' || key === 'color') {
                            (entry[key] as string) = value;
                        } else if (key !== 'id') {
                            // Gérer les valeurs vides ou non numériques
                            const numValue = value === '' ? 0 : Number(value);
                            if (!isNaN(numValue)) {
                                (entry[key] as number) = numValue;
                            } else {
                                (entry[key] as number) = 0;
                            }
                        }
                    });

                    return entry as PolitiScalesEntry;
                });

            if (importedData.length > 0) {
                onSuccess(importedData);
            } else {
                onError();
            }
        } catch (error) {
            console.error('CSV import error:', error);
            onError();
        }
    };

    reader.onerror = () => {
        onError();
    };

    reader.readAsText(file);
}
