import { useRef, useEffect, useMemo, type RefObject } from "react";
import * as THREE from "three";
import type { PolitiScalesEntry } from "../utils/types";
import { getColor, hexToRgba } from "../utils/colors";
import { AXES_CONFIG } from "../utils/config";

type ThreeVisualizationProps = {
  data: PolitiScalesEntry[];
  onPointHover: (
    datum: PolitiScalesEntry,
    coords: { x: number; y: number }
  ) => void;
  onPointLeave: () => void;
};

function performPCA(data: PolitiScalesEntry[]) {
  if (data.length === 0) return { projectedData: [], variance: [] };
  const dataAvecMarqueurs: PolitiScalesEntry[] = [
    {
      constructivisme: 100,
      essentialisme: 0,
      justiceRehabilitative: 100,
      justicePunitive: 0,
      progressisme: 100,
      conservatisme: 0,
      internationalisme: 100,
      nationalisme: 0,
      communisme: 100,
      capitalisme: 0,
      regulation: 100,
      laissezFaire: 0,
      ecologie: 100,
      productivisme: 0,
      revolution: 100,
      reformisme: 0,
      pseudo: "Extrême gauche",
      color: getColor("nuance", "red"),
      id: -1,
    },
    {
      constructivisme: 0,
      essentialisme: 100,
      justiceRehabilitative: 0,
      justicePunitive: 100,
      progressisme: 0,
      conservatisme: 100,
      internationalisme: 0,
      nationalisme: 100,
      communisme: 0,
      capitalisme: 100,
      regulation: 0,
      laissezFaire: 100,
      ecologie: 0,
      productivisme: 100,
      revolution: 0,
      reformisme: 100,
      pseudo: "Extrême droite",
      color: getColor("nuance", "blue"),
      id: -2,
    },
    {
      constructivisme: 50,
      essentialisme: 50,
      justiceRehabilitative: 50,
      justicePunitive: 50,
      progressisme: 50,
      conservatisme: 50,
      internationalisme: 50,
      nationalisme: 50,
      communisme: 50,
      capitalisme: 50,
      regulation: 50,
      laissezFaire: 50,
      ecologie: 50,
      productivisme: 50,
      revolution: 50,
      reformisme: 50,
      pseudo: "Centrisme absolu",
      color: getColor("nuance", "orange"),
      id: -3,
    },
    ...data,
  ];
  // Normalisation des paires de valeurs opposées
  const normalizedData = dataAvecMarqueurs.map((entry) => {
    const normalized: Record<string, number> = {};
    AXES_CONFIG.forEach((axis) => {
      const mainValue = Number(entry[axis.key]);
      const oppositeValue = Number(entry[axis.oppositeKey]);
      const total = mainValue + oppositeValue;
      if (total === 0) {
        normalized[axis.key] = 50; // Valeur par défaut si total = 0
        normalized[axis.oppositeKey] = 50;
      } else {
        normalized[axis.key] = (mainValue / total) * 100;
        normalized[axis.oppositeKey] = (oppositeValue / total) * 100;
      }
    });
    return normalized;
  });

  // Conversion en matrice pour PCA (on utilise uniquement les clés principales)
  const matrix = normalizedData.map((entry) => [
    entry.constructivisme,
    entry.justiceRehabilitative,
    entry.progressisme,
    entry.internationalisme,
    entry.communisme,
    entry.regulation,
    entry.ecologie,
    entry.revolution,
  ]);
  const means = matrix[0].map(
    (_, i) =>
      matrix.reduce((sum, row) => sum + Number(row[i] || 0), 0) / matrix.length
  );
  const centeredMatrix = matrix.map((row) =>
    row.map((val, i) => Number(val || 0) - means[i])
  );
  const covMatrix = Array(8)
    .fill(0)
    .map(() => Array(8).fill(0));
  for (let i = 0; i < 8; i++) {
    for (let j = 0; j < 8; j++) {
      covMatrix[i][j] =
        centeredMatrix.reduce(
          (sum, row) => sum + Number(row[i]) * Number(row[j]),
          0
        ) /
        (matrix.length - 1);
    }
  }
  // Calcul des vecteurs et valeurs propres via la méthode de la puissance itérée
  function powerIteration(matrix: number[][], iterations: number = 100) {
    const n = matrix.length;
    let vector = Array(n)
      .fill(0)
      .map(() => Math.random());
    let length = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    vector = vector.map((v) => v / length);

    for (let i = 0; i < iterations; i++) {
      // Multiplication matrice-vecteur
      const newVector = Array(n).fill(0);
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
          newVector[i] += matrix[i][j] * vector[j];
        }
      }

      // Normalisation
      length = Math.sqrt(newVector.reduce((sum, v) => sum + v * v, 0));
      vector = newVector.map((v) => v / length);
    }

    // Calcul de la valeur propre
    const eigenvalue = vector.reduce((sum, v, i) => {
      let Av = 0;
      for (let j = 0; j < n; j++) {
        Av += matrix[i][j] * vector[j];
      }
      return sum + v * Av;
    }, 0);

    return { eigenvalue, eigenvector: vector };
  }

  // Calcul des 3 premiers composants principaux
  const components: { eigenvalue: number; eigenvector: number[] }[] = [];
  const remainingMatrix = covMatrix;
  for (let i = 0; i < 3; i++) {
    const { eigenvalue, eigenvector } = powerIteration(remainingMatrix);
    components.push({ eigenvalue, eigenvector });

    // Déflation : soustraction de la composante trouvée
    const n = remainingMatrix.length;
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        remainingMatrix[i][j] -= eigenvalue * eigenvector[i] * eigenvector[j];
      }
    }
  }

  // Projection des données sur les composantes principales
  let projectedData: ProjectedPoint[] = centeredMatrix.map((row, idx) => ({
    x: row.reduce((sum, val, i) => sum + val * components[0].eigenvector[i], 0),
    y: row.reduce((sum, val, i) => sum + val * components[1].eigenvector[i], 0),
    z: row.reduce((sum, val, i) => sum + val * components[2].eigenvector[i], 0),
    id: dataAvecMarqueurs[idx].id,
    color: dataAvecMarqueurs[idx].color,
    pseudo: dataAvecMarqueurs[idx].pseudo,
  }));

  // Décalage de l'origine pour centrer sur le point représentant le centre (id -3)
  const centerPoint = projectedData.find((point) => point.id === -3);
  if (centerPoint) {
    const offset = {
      x: centerPoint.x,
      y: centerPoint.y,
      z: centerPoint.z,
    };
    projectedData = projectedData.map((p) => ({
      ...p,
      x: p.x - offset.x,
      y: p.y - offset.y,
      z: p.z - offset.z,
    }));
  }

  // Normalisation pour avoir une distribution plus naturelle dans [-5, 5]
  if (projectedData.length > 0) {
    // Calculer l'écart-type pour chaque dimension
    const stats = {
      x: calculateStats(projectedData.map((p) => p.x)),
      y: calculateStats(projectedData.map((p) => p.y)),
      z: calculateStats(projectedData.map((p) => p.z)),
    };

    // Utiliser le plus grand écart-type comme facteur d'échelle
    const maxStd = Math.max(stats.x.std, stats.y.std, stats.z.std);
    const targetScale = 5;
    const scale = maxStd === 0 ? 1 : targetScale / maxStd;

    projectedData = projectedData.map((p) => ({
      ...p,
      x: p.x * scale,
      y: p.y * scale,
      z: p.z * scale,
    }));
  }

  return { projectedData, variance: [0.4, 0.3, 0.3] };
}

// Fonction utilitaire pour calculer moyenne et écart-type
function calculateStats(values: number[]) {
  const mean = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance =
    values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
  return {
    mean,
    std: Math.sqrt(variance),
  };
}

type ProjectedPoint = {
  x: number;
  y: number;
  z: number;
  id: number; // Remplace originalIndex
  color: string;
  pseudo: string;
};

function ThreeVisualization({
  data,
  onPointHover,
  onPointLeave,
}: ThreeVisualizationProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const pointsRef = useRef<THREE.Mesh[]>([]);
  const pointLabelsRef = useRef<THREE.Sprite[]>([]);
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const lastHoverIndexRef = useRef<number>(null);
  const dataRef = useRef(data);
  const extremeLineRef = useRef<THREE.Line | null>(null);
  const circleRef = useRef<THREE.Line | null>(null);
  const diskRef = useRef<THREE.Mesh | null>(null);
  const planeRef = useRef<THREE.Mesh | null>(null);
  const lastClickedPointRef = useRef<number>(null);
  dataRef.current = data;

  const projectedData = useMemo(() => {
    const pca = performPCA(data);
    return pca.projectedData;
  }, [data]);

  // Création de la scène, caméra, renderer, listeners : une seule fois
  useEffect(() => {
    if (!mountRef.current) return;
    const localMount = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(getColor("background", "secondary"));
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(
      75,
      localMount.clientWidth / localMount.clientHeight,
      0.1,
      1000
    );
    camera.position.set(5, 5, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(localMount.clientWidth, localMount.clientHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    localMount.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Éclairage amélioré
    const ambientLight = new THREE.AmbientLight(getColor("neutral", 300), 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(
      getColor("primary", 500),
      1
    );
    directionalLight.position.set(10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 512;
    directionalLight.shadow.mapSize.height = 512;
    scene.add(directionalLight);

    const pointLight1 = new THREE.PointLight(getColor("primary", 300), 0.5);
    pointLight1.position.set(-5, 3, 2);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(getColor("secondary", 600), 0.3);
    pointLight2.position.set(5, -3, -2);
    scene.add(pointLight2);

    // Création de la ligne entre les points extrêmes
    const lineMaterial = new THREE.LineBasicMaterial({
      color: getColor("primary", 700),
      opacity: 1,
      transparent: false,
    });
    const lineGeometry = new THREE.BufferGeometry();
    const line = new THREE.Line(lineGeometry, lineMaterial);
    scene.add(line);
    extremeLineRef.current = line;

    // Suppression de l'axesHelper qui était ici avant

    let isDragging = false;
    let isRightDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    const onMouseDown = (event: MouseEvent) => {
      if (event.button === 0) {
        // Clic gauche pour la rotation
        const rect = rendererRef.current!.domElement.getBoundingClientRect();
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y =
          -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycasterRef.current.setFromCamera(
          mouseRef.current,
          cameraRef.current!
        );
        const intersects = raycasterRef.current.intersectObjects(
          pointsRef.current
        );

        if (intersects.length > 0) {
          const point = intersects[0].object as THREE.Mesh;
          const pointId = point.userData.id;

          if (pointId === lastClickedPointRef.current) {
            if (circleRef.current) {
              sceneRef.current?.remove(circleRef.current);
              circleRef.current.geometry.dispose();
              (circleRef.current.material as THREE.Material).dispose();
              circleRef.current = null;
            }
            if (diskRef.current) {
              sceneRef.current?.remove(diskRef.current);
              diskRef.current.geometry.dispose();
              (diskRef.current.material as THREE.Material).dispose();
              diskRef.current = null;
            }
            if (planeRef.current) {
              sceneRef.current?.remove(planeRef.current);
              planeRef.current.geometry.dispose();
              (planeRef.current.material as THREE.Material).dispose();
              planeRef.current = null;
            }
            lastClickedPointRef.current = null;
          } else {
            updateCircle(
              extremeLineRef,
              planeRef,
              diskRef,
              circleRef,
              sceneRef,
              point.position
            );
            lastClickedPointRef.current = pointId;
          }
          isDragging = false;
        } else {
          isDragging = true;
          previousMousePosition = { x: event.clientX, y: event.clientY };
        }
      } else if (event.button === 2) {
        // Clic droit pour la translation
        isRightDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
        event.preventDefault();
      }
    };
    const onMouseMove = (event: MouseEvent) => {
      if (!rendererRef.current || !cameraRef.current) return;
      const rect = rendererRef.current.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        // Rotation avec clic gauche
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y,
        };
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(cameraRef.current.position);
        spherical.theta -= deltaMove.x * 0.01;
        spherical.phi += deltaMove.y * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        cameraRef.current.position.setFromSpherical(spherical);
        cameraRef.current.lookAt(0, 0, 0);
        previousMousePosition = { x: event.clientX, y: event.clientY };
      } else if (isRightDragging) {
        // Translation avec clic droit
        const deltaMove = {
          x: event.clientX - previousMousePosition.x,
          y: event.clientY - previousMousePosition.y,
        };

        // Calculer les vecteurs de déplacement dans l'espace de la caméra
        const right = new THREE.Vector3();
        const up = new THREE.Vector3();
        cameraRef.current.matrix.extractBasis(right, up, new THREE.Vector3());

        // Appliquer la translation
        const moveSpeed = 0.01 * cameraRef.current.position.length();
        cameraRef.current.position.add(
          right.multiplyScalar(-deltaMove.x * moveSpeed)
        );
        cameraRef.current.position.add(
          up.multiplyScalar(deltaMove.y * moveSpeed)
        );

        previousMousePosition = { x: event.clientX, y: event.clientY };
      } else {
        raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
        const intersects = raycasterRef.current.intersectObjects(
          pointsRef.current
        );
        if (intersects.length > 0) {
          const point = intersects[0].object as THREE.Mesh;
          const pointId = point.userData.id;
          if (lastHoverIndexRef.current !== pointId) {
            lastHoverIndexRef.current = pointId;
            const hoveredData = dataRef.current.find((d) => d.id === pointId);
            if (hoveredData) {
              onPointHover(hoveredData, {
                x: event.clientX,
                y: event.clientY,
              });
            }
          }
        } else {
          if (lastHoverIndexRef.current !== null) {
            lastHoverIndexRef.current = null;
            onPointLeave();
          }
        }
      }
    };
    const onMouseUp = () => {
      isDragging = false;
      isRightDragging = false;
    };
    const onWheel = (event: WheelEvent) => {
      if (!cameraRef.current) return;
      cameraRef.current.position.multiplyScalar(event.deltaY > 0 ? 1.1 : 0.9);
      cameraRef.current.position.clampLength(5, 50);
    };
    renderer.domElement.addEventListener("mousedown", onMouseDown);
    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("mouseup", onMouseUp);
    renderer.domElement.addEventListener("mouseleave", onMouseUp);
    renderer.domElement.addEventListener("wheel", onWheel);

    // Empêcher le menu contextuel du clic droit
    const onContextMenu = (event: Event) => {
      event.preventDefault();
    };
    renderer.domElement.addEventListener("contextmenu", onContextMenu);

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Mise à jour des échelles en fonction de la distance
      if (cameraRef.current) {
        pointsRef.current.forEach((point, index) => {
          const distance = cameraRef.current!.position.distanceTo(
            point.position
          );
          const scale = Math.max(0.3, 2.0 / Math.sqrt(distance));
          point.scale.setScalar(scale);

          // Mise à jour de l'échelle du label correspondant
          if (pointLabelsRef.current[index]) {
            const labelScale = Math.max(0.5, 2.0 / Math.sqrt(distance));
            pointLabelsRef.current[index].scale.set(
              1.5 * labelScale,
              0.7 * labelScale,
              1
            );
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize handler
    function handleResize() {
      if (mountRef.current && rendererRef.current && cameraRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        rendererRef.current.setSize(width, height);
        cameraRef.current.aspect = width / height;
        cameraRef.current.updateProjectionMatrix();
      }
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (localMount && renderer.domElement) {
        localMount.removeChild(renderer.domElement);
      }
      renderer.domElement.removeEventListener("mousedown", onMouseDown);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("mouseup", onMouseUp);
      renderer.domElement.removeEventListener("mouseleave", onMouseUp);
      renderer.domElement.removeEventListener("wheel", onWheel);
      renderer.domElement.removeEventListener("contextmenu", onContextMenu);
      renderer.dispose();
      cancelAnimationFrame(animationFrameId);
      if (circleRef.current) {
        sceneRef.current?.remove(circleRef.current);
        circleRef.current.geometry.dispose();
        (circleRef.current.material as THREE.Material).dispose();
        circleRef.current = null;
      }
      if (diskRef.current) {
        sceneRef.current?.remove(diskRef.current);
        diskRef.current.geometry.dispose();
        (diskRef.current.material as THREE.Material).dispose();
        diskRef.current = null;
      }
      if (planeRef.current) {
        sceneRef.current?.remove(planeRef.current);
        planeRef.current.geometry.dispose();
        (planeRef.current.material as THREE.Material).dispose();
        planeRef.current = null;
      }
    };
  }, [data, projectedData, onPointHover, onPointLeave]);

  // Mise à jour des points à chaque changement de data
  useEffect(() => {
    if (!sceneRef.current) return;

    pointsRef.current.forEach((point) => sceneRef.current!.remove(point));
    pointsRef.current = [];
    pointLabelsRef.current.forEach((label) => sceneRef.current!.remove(label));
    pointLabelsRef.current = [];

    projectedData.forEach((point) => {
      // Géométrie plus détaillée pour de meilleurs reflets
      const geometry = new THREE.SphereGeometry(0.3, 32, 32);

      // Matériau plus sophistiqué avec des effets de lumière
      const material = new THREE.MeshPhysicalMaterial({
        color: point.color,
        metalness: 0.3,
        roughness: 0.4,
        clearcoat: 0.5,
        clearcoatRoughness: 0.3,
        reflectivity: 0.5,
        envMapIntensity: 1.0,
        emissive: new THREE.Color(point.color).multiplyScalar(0.2),
      });

      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(point.x, point.y, point.z);
      sphere.castShadow = true;
      sphere.receiveShadow = true;
      sphere.userData = { id: point.id };
      sceneRef.current!.add(sphere);
      pointsRef.current.push(sphere);

      // Ajout du label texte (pseudo)
      if (point.pseudo) {
        const labelSprite = makeTextSprite(point.pseudo, {
          fontsize: 48,
          fontface: "system-ui, Helvetica, Arial, sans-serif",
          backgroundColor: hexToRgba(getColor("primary", 800), 0.85),
          textColor: hexToRgba(getColor("text", "inverse"), 1.0),
          shadow: true,
          padding: 16,
          borderRadius: 12,
        });
        labelSprite.position.set(point.x, point.y + 0.5, point.z); // Réduit l'offset vertical de 0.7 à 0.5
        sceneRef.current!.add(labelSprite);
        pointLabelsRef.current.push(labelSprite);
      }
    });
  }, [data, projectedData]);

  // Mise à jour de la ligne entre les points extrêmes
  useEffect(() => {
    if (!sceneRef.current) return;

    // Mise à jour de la ligne entre les points extrêmes
    if (extremeLineRef.current) {
      const leftPoint = projectedData.find((p) => p.id === -1);
      const rightPoint = projectedData.find((p) => p.id === -2);

      if (leftPoint && rightPoint) {
        const positions = new Float32Array([
          leftPoint.x,
          leftPoint.y,
          leftPoint.z,
          rightPoint.x,
          rightPoint.y,
          rightPoint.z,
        ]);

        extremeLineRef.current.geometry.setAttribute(
          "position",
          new THREE.BufferAttribute(positions, 3)
        );
      }
    }
  }, [data, projectedData]);

  return <div ref={mountRef} className="w-full h-full" />;
}

type textSpriteParameters = {
  fontface: string;
  fontsize: number;
  backgroundColor: { r: number; g: number; b: number; a: number };
  textColor: { r: number; g: number; b: number; a: number };
  shadow: boolean;
  padding: number;
  borderRadius: number;
};

// Fonction pour calculer le point le plus proche sur l'axe central
const getClosestPointOnAxis = (
  point: THREE.Vector3,
  extremeLineRef: RefObject<THREE.Line | null>
): THREE.Vector3 => {
  if (!extremeLineRef.current) return point.clone();

  const lineStart = new THREE.Vector3();
  const lineEnd = new THREE.Vector3();
  const positions = extremeLineRef.current.geometry.attributes.position;
  lineStart.fromBufferAttribute(positions, 0);
  lineEnd.fromBufferAttribute(positions, 1);

  const line = lineEnd.clone().sub(lineStart);
  const lineDir = line.clone().normalize();
  const pointToStart = point.clone().sub(lineStart);

  const projection = pointToStart.dot(lineDir);
  return lineStart.clone().add(lineDir.multiplyScalar(projection));
};

// Fonction pour créer/mettre à jour le cercle
function updateCircle(
  extremeLineRef: RefObject<THREE.Line | null>,
  planeRef: RefObject<THREE.Mesh | null>,
  diskRef: RefObject<THREE.Mesh | null>,
  circleRef: RefObject<THREE.Line | null>,
  sceneRef: RefObject<THREE.Scene | null>,
  point: THREE.Vector3
) {
  const centerPoint = getClosestPointOnAxis(point, extremeLineRef);
  const radius = point.distanceTo(centerPoint);

  // Obtenir le vecteur directeur de l'axe central
  const positions = extremeLineRef.current!.geometry.attributes.position;
  const lineStart = new THREE.Vector3().fromBufferAttribute(positions, 0);
  const lineEnd = new THREE.Vector3().fromBufferAttribute(positions, 1);
  const axisDir = lineEnd.clone().sub(lineStart).normalize();

  // Calculer le vecteur du rayon (du centre vers le point)
  const radiusDir = point.clone().sub(centerPoint).normalize();

  // Créer une base orthonormée pour le cercle
  const tangent = radiusDir;
  const binormal = new THREE.Vector3()
    .crossVectors(axisDir, tangent)
    .normalize();

  // Créer la géométrie du cercle et du disque
  const segments = 64;
  const circleGeometry = new THREE.BufferGeometry();
  const circlePositions = new Float32Array(segments * 3);

  // Générer les points du cercle
  for (let i = 0; i < segments; i++) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.cos(theta);
    const y = Math.sin(theta);

    const pos = centerPoint
      .clone()
      .add(tangent.clone().multiplyScalar(x * radius))
      .add(binormal.clone().multiplyScalar(y * radius));

    circlePositions[i * 3] = pos.x;
    circlePositions[i * 3 + 1] = pos.y;
    circlePositions[i * 3 + 2] = pos.z;
  }

  // Mettre à jour ou créer le cercle (contour)
  circleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(circlePositions, 3)
  );

  if (circleRef.current) {
    circleRef.current.geometry.dispose();
    circleRef.current.geometry = circleGeometry;
  } else {
    const material = new THREE.LineBasicMaterial({
      color: getColor("primary", 500),
      opacity: 0.8,
      transparent: true,
    });
    circleRef.current = new THREE.LineLoop(circleGeometry, material);
    sceneRef.current?.add(circleRef.current);
  }

  // Créer et orienter le disque et le plan
  const diskGeometry = new THREE.CircleGeometry(radius, segments);
  const planeGeometry = new THREE.PlaneGeometry(100, 100);

  // Construire une matrice de rotation qui aligne avec le plan perpendiculaire à l'axe
  const rotationMatrix = new THREE.Matrix4();
  const up = binormal;
  const forward = axisDir;
  const right = new THREE.Vector3().crossVectors(up, forward).normalize();

  rotationMatrix.makeBasis(right, up, forward);
  rotationMatrix.setPosition(centerPoint);

  diskGeometry.applyMatrix4(rotationMatrix);
  planeGeometry.applyMatrix4(rotationMatrix);

  // Mettre à jour ou créer le disque
  if (diskRef.current) {
    diskRef.current.geometry.dispose();
    diskRef.current.geometry = diskGeometry;
  } else {
    const diskMaterial = new THREE.MeshBasicMaterial({
      color: getColor("primary", 500),
      opacity: 0.4,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    diskRef.current = new THREE.Mesh(diskGeometry, diskMaterial);
    sceneRef.current?.add(diskRef.current);
  }

  // Mettre à jour ou créer le plan
  if (planeRef.current) {
    planeRef.current.geometry.dispose();
    planeRef.current.geometry = planeGeometry;
  } else {
    const planeMaterial = new THREE.MeshBasicMaterial({
      color: getColor("secondary", 700),
      opacity: 0.4,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    planeRef.current = new THREE.Mesh(planeGeometry, planeMaterial);
    sceneRef.current?.add(planeRef.current);
  }
}

// Fonction utilitaire pour créer un sprite texte
function makeTextSprite(message: string, parameters: textSpriteParameters) {
  const fontface = parameters.fontface;
  const fontsize = parameters.fontsize;
  const backgroundColor = parameters.backgroundColor;
  const textColor = parameters.textColor;
  const shadow = parameters.shadow;
  const padding = parameters.padding;
  const borderRadius = parameters.borderRadius;

  // Création du canvas
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;
  context.font = `bold ${fontsize}px ${fontface}`;
  const metrics = context.measureText(message);
  const textWidth = metrics.width;
  const textHeight = fontsize * 1.2;
  canvas.width = textWidth + padding * 2;
  canvas.height = textHeight + padding * 2;

  // Redéfinir le contexte après redimensionnement
  const ctx = canvas.getContext("2d")!;
  ctx.font = `bold ${fontsize}px ${fontface}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Fond arrondi
  ctx.save();
  ctx.beginPath();
  const w = canvas.width,
    h = canvas.height,
    r = borderRadius;
  ctx.moveTo(r, 0);
  ctx.lineTo(w - r, 0);
  ctx.quadraticCurveTo(w, 0, w, r);
  ctx.lineTo(w, h - r);
  ctx.quadraticCurveTo(w, h, w - r, h);
  ctx.lineTo(r, h);
  ctx.quadraticCurveTo(0, h, 0, h - r);
  ctx.lineTo(0, r);
  ctx.quadraticCurveTo(0, 0, r, 0);
  ctx.closePath();
  ctx.fillStyle = `rgba(${backgroundColor.r},${backgroundColor.g},${backgroundColor.b},${backgroundColor.a})`;
  ctx.fill();
  ctx.restore();

  // Ombre portée
  if (shadow) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.7)";
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2;
    ctx.fillStyle = `rgba(${textColor.r},${textColor.g},${textColor.b},${textColor.a})`;
    ctx.fillText(message, w / 2, h / 2);
    ctx.restore();
  }

  // Texte
  ctx.save();
  ctx.fillStyle = `rgba(${textColor.r},${textColor.g},${textColor.b},${textColor.a})`;
  ctx.fillText(message, w / 2, h / 2);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
  });
  const sprite = new THREE.Sprite(spriteMaterial);
  // Ajuste l'échelle pour que le texte soit lisible
  sprite.scale.set(2.5, 1.2, 1);
  return sprite;
}

export default ThreeVisualization;
