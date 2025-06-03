import { Trash2 } from "lucide-react";
import type { PolitiScalesEntry } from "../utils/types";

type EntryListProps = {
  data: PolitiScalesEntry[];
  isReadOnly: boolean;
  deleteEntry: (id: number) => void;
  onEntryClick: (entry: PolitiScalesEntry) => void; // Ajout du handler
};

function EntryList({
  data,
  isReadOnly,
  deleteEntry,
  onEntryClick,
}: EntryListProps) {
  if (data.length === 0) return null;
  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-text-primary">
        Entrées ({data.length})
      </h2>
      <div className="grid gap-2 max-h-60 overflow-y-auto">
        {data.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between bg-primary-800 text-text-inverse p-3 rounded-lg hover:bg-primary-700 cursor-pointer"
            onClick={() => !isReadOnly && onEntryClick(entry)}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">{entry.pseudo}</span>
            </div>
            {!isReadOnly && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteEntry(entry.id);
                }}
                className="text-error-400 hover:text-error-300 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default EntryList;
