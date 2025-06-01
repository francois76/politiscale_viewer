import type { PolitiScalesEntry } from "../utils/types";
import { getCategoryDisplayName, type AxisConfig } from "../utils/config";

type MousePosition = { x: number; y: number };

interface TooltipProps {
  hoveredPoint: PolitiScalesEntry | null;
  mousePosition: MousePosition;
  AXES_CONFIG: AxisConfig[];
}

function Tooltip({ hoveredPoint, mousePosition, AXES_CONFIG }: TooltipProps) {
  if (!hoveredPoint) return null;

  const offset = { x: 15, y: 15 }; // Décalage par rapport au curseur
  const tooltipWidth = 200; // Largeur approximative du tooltip
  const tooltipHeight = 150; // Hauteur approximative du tooltip

  // Ajustement de la position pour éviter les débordements
  const adjustedPosition = {
    x:
      mousePosition.x + offset.x + tooltipWidth > window.innerWidth
        ? mousePosition.x - tooltipWidth - offset.x
        : mousePosition.x + offset.x,
    y:
      mousePosition.y + offset.y + tooltipHeight > window.innerHeight
        ? mousePosition.y - tooltipHeight - offset.y
        : mousePosition.y + offset.y,
  };

  return (
    <div
      className="fixed z-50 bg-primary-800 border border-gray-600 rounded-lg p-3 text-text-inverse text-sm pointer-events-none"
      style={{
        left: adjustedPosition.x,
        top: adjustedPosition.y,
        width: "max-content",
        maxWidth: tooltipWidth,
      }}
    >
      <div className="font-bold mb-2">{hoveredPoint.pseudo}</div>
      <div className="grid grid-cols-2 gap-1 text-xs">
        {AXES_CONFIG.map((axis, index) => {
          const firstKey = axis.key;
          const secondKey = axis.oppositeKey;
          const firstValue = hoveredPoint[firstKey] ?? 0;
          const secondValue = hoveredPoint[secondKey] ?? 0;
          return (
            <div
              key={index}
              className="col-span-2 border-b border-gray-600 pb-1 mb-1"
            >
              <div>
                {getCategoryDisplayName(firstKey)}: {firstValue}%
              </div>
              <div>
                {getCategoryDisplayName(secondKey)}: {secondValue}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Tooltip;
