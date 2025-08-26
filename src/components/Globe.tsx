"use client";
import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, Line } from "@react-three/drei";
import * as THREE from "three";
import ClientOnly from "@/components/ClientOnly";
import { useEffect, useState } from "react";
import { simState, addHistory } from "@/lib/state";
import { useSnapshot } from "valtio";
import { geoEquirectangular, geoPath } from "d3-geo";

export type GlobeProps = {
  radius?: number;
  pollutionIndex?: number; // 0..1
  oceanAcid?: number; // 0..1.2 (optional)
  iceMeltPct?: number; // ignored here but accepted for compatibility
};

function Atmosphere({ radius = 1 }: { radius?: number }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          c: { value: 0.4 },
          p: { value: 3.0 },
          glowColor: { value: new THREE.Color(0x93c5fd) },
          viewVector: { value: new THREE.Vector3(0, 0, 1) },
        },
        vertexShader: `
          uniform vec3 viewVector;
          uniform float c;
          uniform float p;
          varying float intensity;
          void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormel = normalize(normalMatrix * viewVector);
            intensity = pow(c - dot(vNormal, vNormel), p);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 glowColor;
          varying float intensity;
          void main() {
            gl_FragColor = vec4(glowColor * intensity, intensity);
          }
        `,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        transparent: true,
      }),
    []
  );
  return (
    <mesh scale={radius * 1.06}>
      <sphereGeometry args={[1, 64, 64]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function Earth({ radius = 1, pollutionIndex = 0 }: GlobeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [dayMap, bumpMap, specMap, nightMap] = useLoader(THREE.TextureLoader, [
    "/textures/earth_daymap.jpg",
    "/textures/earth_bump.jpg",
    "/textures/earth_specular.jpg",
    "/textures/earth_night.jpg",
  ]);

  const material = useMemo(
    () =>
      new THREE.MeshPhongMaterial({
        map: dayMap ?? undefined,
        bumpMap: bumpMap ?? undefined,
        bumpScale: 0.07,
        specularMap: specMap ?? undefined,
        specular: new THREE.Color(0x222222),
        shininess: 10,
        emissiveMap: nightMap ?? undefined,
        emissive: new THREE.Color(0x111111),
        emissiveIntensity: 0.55,
      }),
    [dayMap, bumpMap, specMap, nightMap]
  );

  // Rotation handled at parent level so borders and earth stay aligned

  return (
    <group>
      <mesh ref={meshRef} scale={radius}>
        <sphereGeometry args={[1, 128, 128]} />
        <primitive object={material} attach="material" />
      </mesh>
      {pollutionIndex > 0 && (
        <mesh scale={radius * 1.004}>
          <sphereGeometry args={[1, 128, 128]} />
          <meshStandardMaterial
            color={new THREE.Color('#9ca3af').lerp(new THREE.Color('#6b7280'), pollutionIndex)}
            transparent
            opacity={Math.min(0.6, pollutionIndex * 0.7)}
            roughness={1}
            metalness={0}
          />
        </mesh>
      )}
      <Atmosphere radius={radius} />
    </group>
  );
}

function CountryBorders({ radius = 1, onSelect }: { radius?: number; onSelect?: (isoA3: string) => void }) {
  const [features, setFeatures] = useState<any[]>([]);
  useEffect(() => {
    fetch("/data/world.geojson")
      .then((r) => r.json())
      .then((g) => setFeatures(g.features ?? []))
      .catch(() => setFeatures([]));
  }, []);

  const projection = useMemo(() => geoEquirectangular().fitSize([1024, 512], { type: "Sphere" } as any), []);
  const pathGen = useMemo(() => geoPath(projection), [projection]);

  const lines = useMemo(() => {
    const result: { points: THREE.Vector3[]; iso: string }[] = [];
    features.forEach((f) => {
      const coords = pathGen.bounds(f);
      if (!coords) return;
      const path = pathGen(f) as string | null;
      if (!path) return;
      // Convert GeoJSON to sphere coordinates by sampling path's projected points is complex.
      // Simpler approach: iterate geometry coordinates directly.
      const geom = f.geometry;
      const multi = geom.type === 'MultiPolygon' ? geom.coordinates : [geom.coordinates];
      multi.forEach((poly: any) => {
        poly.forEach((ring: any) => {
          const pts: THREE.Vector3[] = ring.map((lnglat: number[]) => {
            const [lng, lat] = lnglat;
            const phi = (90 - lat) * (Math.PI / 180);
            const theta = (lng + 180) * (Math.PI / 180);
            const x = -radius * Math.sin(phi) * Math.cos(theta);
            const z = radius * Math.sin(phi) * Math.sin(theta);
            const y = radius * Math.cos(phi);
            return new THREE.Vector3(x, y, z);
          });
          result.push({ points: pts, iso: f.properties.ISO_A3 || f.properties.iso_a3 || '' });
        });
      });
    });
    return result;
  }, [features, pathGen, radius]);

  return (
    <group>
      {lines.map((l, idx) => (
        <Line key={idx} points={l.points} color="#94a3b8" lineWidth={1.2} onClick={() => onSelect?.(l.iso)} />
      ))}
    </group>
  );
}

function Scene({ radius = 1, pollutionIndex = 0, oceanAcid = 0 }: GlobeProps) {
  const groupRef = useRef<THREE.Group>(null);
  const snap = useSnapshot(simState);
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    if (snap.autoRotate) {
      groupRef.current.rotation.y += snap.rotationSpeed * delta * 60;
    }
    if (snap.targetLatLng) {
      const { lat, lng } = snap.targetLatLng;
      const targetY = THREE.MathUtils.degToRad(-lng);
      const targetX = THREE.MathUtils.degToRad(lat);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, 0.05);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, 0.05);
    }
  });
  return (
    <group ref={groupRef}>
      <Earth radius={radius} pollutionIndex={pollutionIndex} />
      <CountryBorders
        radius={radius * 1.002}
        onSelect={(iso) => {
          if (iso) {
            simState.mode = 'country';
            simState.countryCode = iso;
            addHistory(`Selected country ${iso}.`);
          }
        }}
      />
    </group>
  );
}

export default function Globe({ radius = 1, pollutionIndex = 0, oceanAcid = 0, iceMeltPct = 0 }: GlobeProps) {
  return (
    <ClientOnly fallback={<div className="h-[60vh] w-full bg-black" />}>
      <Canvas camera={{ position: [0, 0, 3.2], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1.2} />
        <Suspense fallback={null}>
          <Scene radius={radius} pollutionIndex={pollutionIndex} oceanAcid={oceanAcid} />
          <Stars radius={50} depth={20} count={2000} factor={4} fade />
        </Suspense>
        <OrbitControls enablePan={false} enableZoom zoomSpeed={0.5} />
      </Canvas>
    </ClientOnly>
  );
}


