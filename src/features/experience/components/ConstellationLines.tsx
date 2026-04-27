import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments
} from 'three';
import {
  getStarCatalogLoader,
  raHoursDecDegreesToRenderFrame,
  type ConstellationCatalog
} from '../../solar-system/domain/starCatalog';

type ConstellationLinesProps = {
  /** Whether to show constellation lines */
  visible?: boolean;
  /** Line color */
  color?: string;
  /** Line opacity (0-1) */
  opacity?: number;
};

// Same radius as star field to keep in sync
const CONSTELLATION_SPHERE_RADIUS = 50_000;

/**
 * Renders constellation line overlays using a single pre-computed LineSegments object.
 * Lines connect stars following IAU constellation patterns.
 * Geometry is computed once on load and only the position is updated per frame.
 */
export function ConstellationLines({
  visible = true,
  color = '#4488aa',
  opacity = 0.4
}: ConstellationLinesProps) {
  const linesRef = useRef<LineSegments>(null);
  const { camera } = useThree();
  const [catalog, setCatalog] = useState<ConstellationCatalog | null>(null);

  // Load constellation catalog on mount
  useEffect(() => {
    const loader = getStarCatalogLoader();
    loader.loadConstellations().then(setCatalog).catch(console.error);
  }, []);

  // Build geometry from catalog - computed once and reused
  const { geometry, material } = useMemo(() => {
    if (!catalog) {
      return { geometry: null, material: null };
    }

    // Count total line segments (each line strip has n-1 segments for n points)
    let totalSegments = 0;
    for (const constellation of catalog.constellations) {
      for (const lineStrip of constellation.lines) {
        if (lineStrip.length >= 2) {
          totalSegments += lineStrip.length - 1;
        }
      }
    }

    // Each segment has 2 vertices, each vertex has 3 components
    const positions = new Float32Array(totalSegments * 2 * 3);
    let idx = 0;

    for (const constellation of catalog.constellations) {
      for (const lineStrip of constellation.lines) {
        for (let i = 0; i < lineStrip.length - 1; i++) {
          const point1 = lineStrip[i];
          const point2 = lineStrip[i + 1];
          if (!point1 || !point2) continue;

          const [ra1, dec1] = point1;
          const [ra2, dec2] = point2;

          const [x1, y1, z1] = raHoursDecDegreesToRenderFrame(ra1, dec1);
          const [x2, y2, z2] = raHoursDecDegreesToRenderFrame(ra2, dec2);

          // Start vertex
          positions[idx++] = x1 * CONSTELLATION_SPHERE_RADIUS;
          positions[idx++] = y1 * CONSTELLATION_SPHERE_RADIUS;
          positions[idx++] = z1 * CONSTELLATION_SPHERE_RADIUS;

          // End vertex
          positions[idx++] = x2 * CONSTELLATION_SPHERE_RADIUS;
          positions[idx++] = y2 * CONSTELLATION_SPHERE_RADIUS;
          positions[idx++] = z2 * CONSTELLATION_SPHERE_RADIUS;
        }
      }
    }

    const geom = new BufferGeometry();
    geom.setAttribute('position', new BufferAttribute(positions, 3));

    const mat = new LineBasicMaterial({
      color: new Color(color),
      transparent: true,
      opacity: opacity,
      depthWrite: false,
      blending: AdditiveBlending,
      toneMapped: false
    });

    return { geometry: geom, material: mat };
  }, [catalog, color, opacity]);

  // Disable automatic matrix updates - we'll do it manually to stay in sync with camera
  useEffect(() => {
    if (linesRef.current) {
      linesRef.current.matrixAutoUpdate = false;
    }
  }, [geometry]);

  // Keep constellation lines centered on camera - update matrix directly before render
  useFrame(() => {
    if (linesRef.current) {
      const lines = linesRef.current;
      lines.position.copy(camera.position);
      lines.updateMatrix();
      lines.updateMatrixWorld();
    }
  });

  if (!visible || !geometry || !material) {
    return null;
  }

  return (
    <lineSegments
      ref={linesRef}
      geometry={geometry}
      material={material}
      frustumCulled={false}
      renderOrder={-2}
    />
  );
}
