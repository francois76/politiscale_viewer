import { colorMap, getColor } from "../utils/colors";
import {
  AXES_CONFIG,
  type AxisConfig,
  getCategoryDisplayName,
} from "../utils/config";
import type { PolitiScalesEntry } from "../utils/types";
import {
  UiInput,
  UiSelect,
  UiButton,
  UiCard,
  UiModal,
  UiModalContent,
} from "./UiKit";
import { useState, useEffect } from "react";

type EntryFormProps = {
  show: boolean;
  setShowForm: (show: boolean) => void;
  formData: PolitiScalesEntry;
  setFormData: (data: PolitiScalesEntry) => void;
  editId: number | null;
  onSubmit: (entry: PolitiScalesEntry) => void;
};

function EntryForm({
  show,
  setShowForm,
  formData,
  setFormData,
  editId,
  onSubmit,
}: EntryFormProps) {
  const [localForm, setLocalForm] = useState(formData);

  useEffect(() => {
    setLocalForm(formData);
  }, [formData, show]);

  // Déplace la logique ici : chaque changement met à jour localForm ET formData parent
  const handleLocalChange = (
    key: keyof PolitiScalesEntry,
    value: string | number
  ) => {
    const updated = { ...localForm, [key]: value };
    setLocalForm(updated);
    setFormData(updated);
  };
  const colorPalette = colorMap.accent.map((color) =>
    getColor("accent", color)
  );
  if (!show) return null;
  return (
    <UiModal>
      <UiModalContent>
        <h2 className="text-xl font-bold mb-4">
          {editId !== null
            ? "Modifier l'entrée"
            : "Ajouter une nouvelle entrée"}
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Pseudo</label>
              <UiInput
                type="text"
                value={localForm.pseudo as string}
                onChange={(e) => handleLocalChange("pseudo", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Couleur</label>
              <style>
                {`
                  option::checkmark {
                  display: none;
                }
                  `}
              </style>
              <div className="flex items-center gap-1">
                <UiSelect
                  value={localForm.color as string}
                  onChange={(e) => handleLocalChange("color", e.target.value)}
                  colorBackground={localForm.color as string}
                >
                  {colorPalette.map((color, index) => (
                    <option
                      key={index}
                      value={color}
                      dangerouslySetInnerHTML={{
                        __html: `
                          <span 
                            style="
                              display:block;
                              width:100%;
                              height:2em;
                              background:${color};
                              transition: box-shadow 0.2s;
                            "
                            onmouseover="this.style.boxShadow='0 0 0 2px #33333355';"
                            onmouseout="this.style.boxShadow='none';"
                          ></span>
                        `,
                      }}
                    />
                  ))}
                </UiSelect>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AXES_CONFIG.map((axis: AxisConfig, index: number) => {
              const firstKey = axis.key;
              const secondKey = axis.oppositeKey;
              return (
                <UiCard key={index}>
                  <h3 className="text-lg font-medium mb-3">
                    {getCategoryDisplayName(firstKey)} vs{" "}
                    {getCategoryDisplayName(secondKey)}
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm mb-1">
                        {getCategoryDisplayName(firstKey)} (%)
                      </label>
                      <UiInput
                        type="number"
                        min={0}
                        max={100}
                        value={localForm[firstKey] as number}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleLocalChange(firstKey, e.target.value)
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-1">
                        {getCategoryDisplayName(secondKey)} (%)
                      </label>
                      <UiInput
                        type="number"
                        min={0}
                        max={100}
                        value={localForm[secondKey] as number}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          handleLocalChange(secondKey, e.target.value)
                        }
                      />
                    </div>
                    <div className="text-xs text-gray-400">
                      Total:{" "}
                      {Number(localForm[firstKey]) +
                        Number(localForm[secondKey])}
                      %
                    </div>
                  </div>
                </UiCard>
              );
            })}
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <UiButton
              type="button"
              variant="default"
              onClick={() => setShowForm(false)}
            >
              Annuler
            </UiButton>
            <UiButton
              type="button"
              variant="primary"
              onClick={() => onSubmit(localForm)}
            >
              {editId !== null ? "Enregistrer" : "Ajouter"}
            </UiButton>
          </div>
        </div>
      </UiModalContent>
    </UiModal>
  );
}

export default EntryForm;
