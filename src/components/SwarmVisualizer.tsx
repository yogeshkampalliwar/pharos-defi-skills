import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Line, OrbitControls, Float, Html } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

const AGENTS = [
  { id: 'orchestrator', label: 'Orchestrator', position: [0, 1.5, 0], color: '#f0a500' },
  { id: 'defi', label: 'DeFi Agent', position: [-2, -1, 1], color: '#AA3BFF' },
  { id: 'deployer', label: 'Deployer', position: [2, -1, -1], color: '#FF2A2A' }
];

// Helper to draw connecting lines
const Connections = () => {
  const points1 = useMemo(() => [new THREE.Vector3(0, 1.5, 0), new THREE.Vector3(-2, -1, 1)], []);
  const points2 = useMemo(() => [new THREE.Vector3(0, 1.5, 0), new THREE.Vector3(2, -1, -1)], []);
  const points3 = useMemo(() => [new THREE.Vector3(-2, -1, 1), new THREE.Vector3(2, -1, -1)], []);

  return (
    <>
      <Line points={points1} color="#ffffff" opacity={0.3} transparent lineWidth={2} />
      <Line points={points2} color="#ffffff" opacity={0.3} transparent lineWidth={2} />
      <Line points={points3} color="#ffffff" opacity={0.3} transparent lineWidth={2} />
    </>
  );
};

// Data Particles moving along connections
const DataParticle = ({ start, end, color, speed, delay }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      const t = ((state.clock.getElapsedTime() * speed) + delay) % 1;
      meshRef.current.position.lerpVectors(start, end, t);
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.06, 16, 16]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
    </mesh>
  );
};

const Particles = () => {
  const p1 = useMemo(() => new THREE.Vector3(0, 1.5, 0), []);
  const p2 = useMemo(() => new THREE.Vector3(-2, -1, 1), []);
  const p3 = useMemo(() => new THREE.Vector3(2, -1, -1), []);

  return (
    <>
      <DataParticle start={p1} end={p2} color="#f0a500" speed={0.5} delay={0} />
      <DataParticle start={p1} end={p2} color="#f0a500" speed={0.5} delay={0.5} />
      
      <DataParticle start={p1} end={p3} color="#FF2A2A" speed={0.6} delay={0.2} />
      <DataParticle start={p1} end={p3} color="#FF2A2A" speed={0.6} delay={0.7} />
      
      <DataParticle start={p2} end={p3} color="#AA3BFF" speed={0.4} delay={0.1} />
    </>
  );
}

// Individual Agent Node
const AgentNode = ({ position, color, label }: any) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.5;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <mesh position={position} ref={meshRef}>
        <icosahedronGeometry args={[0.4, 1]} />
        <meshStandardMaterial 
          color={color} 
          emissive={color}
          emissiveIntensity={3} // High intensity for bloom
          wireframe
        />
        <Html distanceFactor={10} position={[0, -0.8, 0]} center>
          <div className="bg-space-900/90 backdrop-blur-md px-3 py-1 rounded border border-white/20 text-xs font-mono text-white whitespace-nowrap shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            {label}
          </div>
        </Html>
      </mesh>
      
      {/* Glow effect fallback */}
      <Sphere args={[0.6, 32, 32]} position={position}>
        <meshBasicMaterial color={color} transparent opacity={0.1} />
      </Sphere>
    </Float>
  );
};

// Main Scene
const Scene = () => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.2;
    }
  });

  return (
    <group ref={groupRef}>
      <Connections />
      <Particles />
      {AGENTS.map((agent) => (
        <AgentNode key={agent.id} {...agent} />
      ))}
      <EffectComposer>
        <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
      </EffectComposer>
    </group>
  );
};

export const SwarmVisualizer = () => {
  return (
    <div className="absolute inset-0 z-0 bg-space-950">
      <Canvas camera={{ position: [0, 0, 7], fov: 45 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Scene />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate 
          autoRotateSpeed={0.8}
        />
      </Canvas>
    </div>
  );
};
