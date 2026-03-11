"use client";

import { memo, useState, useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface GlbPlanetProps {
  url: string;
  scale: number;
}

const GlbPlanet = memo(function GlbPlanet({ url, scale }: GlbPlanetProps) {
  const [scene, setScene] = useState<THREE.Group | null>(null);

  useEffect(() => {
    if (!url) return;
    const loader = new GLTFLoader();
    loader.load(url, (gltf) => {
      const box = new THREE.Box3().setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0) gltf.scene.scale.setScalar(scale / maxDim);
      setScene(gltf.scene);
    });
  }, [url, scale]);

  if (!scene) {
    return (
      <mesh scale={scale}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#888888" wireframe transparent opacity={0.4} />
      </mesh>
    );
  }
  return <primitive object={scene} />;
});

export default GlbPlanet;
