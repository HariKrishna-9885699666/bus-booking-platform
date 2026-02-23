'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

const BUS_COLOR = '#e85d04';
const BUS_ACCENT = '#ff6b35';
const WHEEL_COLOR = '#1a1a2e';

function BusModel() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.15) * 0.1;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.4}>
      <group ref={groupRef} position={[0, 0, 0]}>
        {/* Bus body - main box */}
        <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 1, 1]} />
          <meshStandardMaterial color={BUS_COLOR} metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Bus roof/cabin */}
        <mesh position={[0.3, 1.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 0.5, 0.9]} />
          <meshStandardMaterial color={BUS_ACCENT} metalness={0.2} roughness={0.7} />
        </mesh>
        {/* Front face accent */}
        <mesh position={[-1.26, 0.8, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.02, 0.6, 0.8]} />
          <meshStandardMaterial color={BUS_ACCENT} metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Wheels */}
        <mesh position={[-0.7, 0.25, 0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
          <meshStandardMaterial color={WHEEL_COLOR} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[-0.7, 0.25, -0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
          <meshStandardMaterial color={WHEEL_COLOR} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.7, 0.25, 0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
          <meshStandardMaterial color={WHEEL_COLOR} metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh position={[0.7, 0.25, -0.55]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.25, 0.15, 16]} />
          <meshStandardMaterial color={WHEEL_COLOR} metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </Float>
  );
}

const PARTICLE_COUNT = 80;

function FloatingParticles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8,
        ] as [number, number, number],
        scale: 0.02 + Math.random() * 0.03,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return temp;
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      const t = state.clock.elapsedTime + p.phase;
      dummy.position.set(
        p.position[0] + Math.sin(t * 0.3) * 0.5,
        p.position[1] + Math.cos(t * 0.4) * 0.3,
        p.position[2]
      );
      dummy.scale.setScalar(p.scale * (0.8 + Math.sin(t * 2) * 0.2));
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, PARTICLE_COUNT]} frustumCulled={false}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#ff8c42" transparent opacity={0.8} />
    </instancedMesh>
  );
}

function Scene() {
  return (
    <>
      <color attach="background" args={['#0a0e1a']} />
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#ff8c42" />
      <pointLight position={[-5, 3, 5]} intensity={0.6} color="#e85d04" />
      <pointLight position={[0, -2, 3]} intensity={0.4} color="#ff6b35" />
      <Stars radius={50} depth={50} count={1500} factor={2} saturation={0.5} fade speed={1} />
      <BusModel />
      <FloatingParticles />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 4}
      />
    </>
  );
}

export default function Hero3D() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Dark gradient background */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: 'linear-gradient(135deg, #0a0e1a 0%, #16213e 40%, #0f3460 70%, #0a0e1a 100%)',
        }}
      />

      {/* 3D Canvas */}
      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 6], fov: 50 }}
          gl={{ antialias: true, alpha: false }}
          dpr={[1, 2]}
        >
          <React.Suspense
            fallback={
              <mesh>
                <boxGeometry args={[1, 1, 1]} />
                <meshBasicMaterial color="#e85d04" wireframe />
              </mesh>
            }
          >
            <Scene />
          </React.Suspense>
        </Canvas>
      </div>

      {/* Glassmorphism text overlay */}
      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6">
        <motion.div
          className="rounded-2xl border border-white/20 bg-white/10 px-8 py-6 backdrop-blur-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.h1
            className="text-center text-4xl font-bold tracking-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Your Journey Starts Here
          </motion.h1>
          <motion.p
            className="mt-4 text-center text-lg text-white/90 md:text-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            Book bus tickets across Telangana & Andhra Pradesh
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}
