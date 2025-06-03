import { useState, useEffect, useCallback } from "react";
import { Download, Upload, Plus, RotateCcw } from "lucide-react";
import {
  exportToCSV,
  fetchAndValidateCSV,
  importFromCSV,
} from "./utils/csvUtils";
import { useParams } from "react-router";

import Tooltip from "./components/Tooltip";

import EntryList from "./components/EntryList";

import EntryForm from "./components/EntryForm";

import ThreeVisualization from "./components/ThreeVisualization";
import type { PolitiScalesEntry } from "./utils/types";
import { AXES_CONFIG } from "./utils/config";
import { newFormData } from "./utils/formUtils";

// Définition du type pour la position de la souris
type MousePosition = { x: number; y: number };

// Définition du type pour le formulaire

export default function PolitiScalesVisualizer() {
  const pastebinId = useParams().id;
  const isViewReadOnly = !!pastebinId;
  const [data, setData] = useState<PolitiScalesEntry[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<PolitiScalesEntry | null>(
    null
  );
  const [mousePosition, setMousePosition] = useState<MousePosition>({
    x: 0,
    y: 0,
  });
  const [formData, setFormData] = useState<PolitiScalesEntry>(newFormData());
  const [editId, setEditId] = useState<number | null>(null); // Ajout pour édition

  // Charger les données du localStorage au démarrage
  useEffect(() => {
    if (isViewReadOnly) {
      fetchAndValidateCSV(pastebinId).then((data) => {
        if (data) {
          setData(data);
        }
      });
    } else {
      const savedData = localStorage.getItem("politiscales_data");
      if (savedData) {
        try {
          setData(JSON.parse(savedData));
        } catch (e) {
          console.error("Erreur lors du chargement des données:", e);
        }
      }
      setHasLoaded(true);
    }
  }, []);

  // Sauvegarder les données dans le localStorage
  useEffect(() => {
    if (!hasLoaded) return;
    localStorage.setItem("politiscales_data", JSON.stringify(data));
  }, [data, hasLoaded]);

  // Ouvre le formulaire pour édition ou ajout
  const openFormForEdit = (entry?: PolitiScalesEntry) => {
    if (entry) {
      setFormData(entry);
      setEditId(entry.id);
    } else {
      setFormData(newFormData());
      setEditId(null);
    }
    setShowForm(true);
  };

  const handleExportCSV = () => {
    exportToCSV(data);
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    importFromCSV(
      file,
      (importedData) => setData((prev) => [...prev, ...importedData]),
      () => alert("Erreur lors de l'import du fichier CSV")
    );
  };

  const deleteEntry = (id: number) => {
    setData((prev) => prev.filter((entry) => entry.id !== id));
  };

  const resetData = () => {
    if (
      window.confirm("Êtes-vous sûr de vouloir supprimer toutes les données ?")
    ) {
      setData([]);
    }
  };

  // Ajout : mémoriser les callbacks pour éviter leur recréation à chaque render
  const handlePointHover = useCallback(
    (point: PolitiScalesEntry, position: MousePosition) => {
      setHoveredPoint(point);
      setMousePosition(position);
    },
    []
  );

  const handlePointLeave = useCallback(() => setHoveredPoint(null), []);

  return (
    <div className="min-h-screen bg-background-primary text-text-primary">
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold text-center mb-6">
          Visualiseur PolitiScales 3D
        </h1>

        {/* Barre d'outils */}
        {!isViewReadOnly && (
          <div className="flex flex-wrap gap-4 mb-6 justify-center">
            <button
              onClick={() => openFormForEdit()}
              className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors cursor-pointer text-neutral-50"
            >
              <Plus size={20} />
              Ajouter une entrée
            </button>

            <button
              onClick={handleExportCSV}
              disabled={data.length === 0}
              className="flex items-center gap-2 bg-success-600 hover:bg-success-700 disabled:bg-neutral-600 px-4 py-2 cursor-pointer rounded-lg transition-colors text-neutral-50"
            >
              <Download size={20} />
              Exporter CSV
            </button>

            <label className="flex items-center gap-2 bg-secondary-600 hover:bg-secondary-700 px-4 py-2 rounded-lg cursor-pointer transition-colors text-neutral-50">
              <Upload size={20} />
              Importer CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
            </label>

            <button
              onClick={resetData}
              disabled={data.length === 0}
              className="flex items-center gap-2 bg-error-600 hover:bg-error-700 disabled:bg-neutral-600 px-4 py-2 cursor-pointer rounded-lg transition-colors text-neutral-50"
            >
              <RotateCcw size={20} />
              Reset
            </button>
          </div>
        )}

        {/* Statistiques */}
        <div className="text-center mb-4">
          <p className="text-text-muted">
            {data.length} entrée{data.length !== 1 ? "s" : ""} • Cliquez et
            glissez pour faire tourner • Molette pour zoomer
          </p>
        </div>

        {/* Visualisation 3D */}
        <div
          className="relative bg-background-dark rounded-lg overflow-hidden"
          style={{ height: "600px" }}
        >
          <ThreeVisualization
            data={data}
            onPointHover={handlePointHover}
            onPointLeave={handlePointLeave}
          />

          <Tooltip
            hoveredPoint={hoveredPoint}
            mousePosition={mousePosition}
            AXES_CONFIG={AXES_CONFIG}
          />
        </div>

        <EntryList
          data={data}
          deleteEntry={deleteEntry}
          isReadOnly={isViewReadOnly}
          onEntryClick={openFormForEdit} // Ajout du handler de clic
        />

        <EntryForm
          show={showForm}
          setShowForm={setShowForm}
          formData={formData}
          setFormData={setFormData}
          editId={editId}
          onSubmit={(updatedEntry) => {
            if (editId !== null) {
              setData((prev) =>
                prev.map((entry) =>
                  entry.id === editId ? { ...updatedEntry, id: editId } : entry
                )
              );
            } else {
              setData((prev) => [...prev, { ...updatedEntry, id: Date.now() }]);
            }
            setFormData(newFormData());
            setEditId(null);
            setShowForm(false);
          }}
        />
      </div>
    </div>
  );
}
