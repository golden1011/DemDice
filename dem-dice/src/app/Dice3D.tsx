'use client';

import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useState, useRef, useEffect } from "react";
import { Text } from "@react-three/drei";
import { MEANINGS } from './engine';

// Pre-compute quaternions for each face orientation
// Each quaternion rotates the dice so that face's normal points toward camera (0, 0, 1)
// For octahedron: manually define Euler rotations that make each face front-facing
// These rotations ensure each face ends up cleanly oriented toward the camera

// CANONICAL ORIENTATION: All dice end in the SAME pose
// We use ONE canonical quaternion that all faces rotate to
// The canonical pose: flat, front-facing, upright triangle

// Define canonical orientation using Euler angles
// This ensures all dice end in the exact same visual pose
const CANONICAL_EULER = new THREE.Euler(
  Math.acos(-1/3),  // Face angle (~70.53°) - brings a bottom face forward
  Math.PI / 2,       // Rotate 90° around Y to face camera
  0                  // No Z rotation
);

const CANONICAL_QUATERNION = new THREE.Quaternion().setFromEuler(CANONICAL_EULER);

// For each face value (1-8), compute the rotation needed to bring that face
// to the canonical orientation. All faces should end up looking identical.
function computeCanonicalQuaternions(): Record<number, THREE.Quaternion> {
  // Define the 6 vertices of an octahedron
  const vertices = [
    new THREE.Vector3(1, 0, 0),   // 0: right
    new THREE.Vector3(-1, 0, 0),  // 1: left
    new THREE.Vector3(0, 1, 0),   // 2: top
    new THREE.Vector3(0, -1, 0),  // 3: bottom
    new THREE.Vector3(0, 0, 1),   // 4: front
    new THREE.Vector3(0, 0, -1),  // 5: back
  ];
  
  // Define faces by vertex indices (winding order matters for normal direction)
  const faces = [
    [2, 4, 0],  // Face 1: top, front, right
    [2, 0, 5],  // Face 2: top, right, back
    [2, 5, 1],  // Face 3: top, back, left
    [2, 1, 4],  // Face 4: top, left, front
    [3, 0, 4],  // Face 5: bottom, right, front
    [3, 5, 0],  // Face 6: bottom, back, right
    [3, 1, 5],  // Face 7: bottom, left, back
    [3, 4, 1],  // Face 8: bottom, front, left
  ];
  
  const targetNormal = new THREE.Vector3(0, 0, 1); // Face normal points toward camera (+Z)
  const targetUp = new THREE.Vector3(0, 1, 0);     // Up direction is world up (+Y)
  const quaternions: Record<number, THREE.Quaternion> = {};
  
  for (let i = 0; i < 8; i++) {
    const [v1Idx, v2Idx, v3Idx] = faces[i];
    const v1 = vertices[v1Idx];
    const v2 = vertices[v2Idx];
    const v3 = vertices[v3Idx];
    
    // Compute face normal (pointing outward from the octahedron)
    const edge1 = new THREE.Vector3().subVectors(v2, v1);
    const edge2 = new THREE.Vector3().subVectors(v3, v1);
    const faceNormal = new THREE.Vector3().crossVectors(edge1, edge2).normalize();
    
    // Find the "up" direction for this face (toward the highest Y vertex = apex)
    const apex = [v1, v2, v3].reduce((max, v) => v.y > max.y ? v : max);
    const faceCenter = new THREE.Vector3()
      .add(v1)
      .add(v2)
      .add(v3)
      .multiplyScalar(1/3);
    const faceUp = new THREE.Vector3().subVectors(apex, faceCenter).normalize();
    
    // Step 1: Rotate face normal to point toward camera (targetNormal = +Z)
    const quat1 = new THREE.Quaternion();
    quat1.setFromUnitVectors(faceNormal, targetNormal);
    
    // Step 2: After rotating normal, align the up direction
    const rotatedUp = faceUp.clone().applyQuaternion(quat1);
    
    // Project rotatedUp onto the XY plane (perpendicular to camera direction)
    const projectedUp = rotatedUp.clone().sub(
      targetNormal.clone().multiplyScalar(rotatedUp.dot(targetNormal))
    );
    
    if (projectedUp.length() > 0.01) {
      projectedUp.normalize();
      const quat2 = new THREE.Quaternion();
      quat2.setFromUnitVectors(projectedUp, targetUp);
      
      // Combine: quat2 * quat1 (apply quat1 first, then quat2)
      const finalQuat = new THREE.Quaternion().multiply(quat2).multiply(quat1);
      finalQuat.normalize();
      quaternions[i + 1] = finalQuat;
    } else {
      // Up is parallel to camera, just use quat1
      quaternions[i + 1] = quat1.clone().normalize();
    }
  }
  
  return quaternions;
}

const faceQuaternions = computeCanonicalQuaternions();

interface DiceMeshProps {
  value?: number;
  rolling: boolean;
  diceColor: 'cyan' | 'purple' | 'orange' | 'gold';
  onRollComplete?: () => void;
  showWin?: boolean;
}

function DiceMesh({ value, rolling, diceColor, onRollComplete, showWin = false }: DiceMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [targetQuat, setTargetQuat] = useState<THREE.Quaternion | null>(null);
  const [animProgress, setAnimProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const colors = {
    cyan: '#06b6d4',
    purple: '#a855f7',
    orange: '#fb923c',
    gold: '#fbbf24'
  };

  useEffect(() => {
    if (rolling) {
      // Start rolling animation
      setIsAnimating(true);
      setAnimProgress(0);
      setTargetQuat(null);
      
      // Add some random initial spin
      if (meshRef.current) {
        const randomQuat = new THREE.Quaternion().setFromEuler(
          new THREE.Euler(
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2,
            Math.random() * Math.PI * 2
          )
        );
        meshRef.current.quaternion.copy(randomQuat);
      }
    } else if (value && !rolling) {
      // Map value to face (octahedron has 8 faces, so map values > 8 to faces 1-8)
      // Use modulo to cycle through faces for values > 8
      const faceIndex = ((value - 1) % 8) + 1;
      const target = faceQuaternions[faceIndex];
      if (target && meshRef.current) {
        // Clone and normalize the quaternion to ensure we have a fresh, valid copy
        const targetClone = target.clone().normalize();
        
        // Reset animation state
        setAnimProgress(0);
        setIsAnimating(true);
        setTargetQuat(targetClone);
        
        // Ensure we start from the current quaternion state (not Euler rotations)
        // This prevents issues when transitioning from rolling to settling
        if (meshRef.current.quaternion) {
          meshRef.current.quaternion.normalize();
        }
      }
    }
  }, [rolling, value]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (rolling) {
      // Fast spinning during roll - compound rotation on all axes
      // Use Euler rotation for chaotic spinning effect
      const speed = 15;
      meshRef.current.rotation.x += delta * speed;
      meshRef.current.rotation.y += delta * speed * 1.3;
      meshRef.current.rotation.z += delta * speed * 0.9;
      // Update quaternion from Euler to keep it in sync
      meshRef.current.quaternion.setFromEuler(meshRef.current.rotation);
    } else if (targetQuat && isAnimating) {
      // Smooth interpolation to target using slerp with easing (25% longer: 0.8s * 1.25 = 1.0s)
      const duration = 1.0; // Total animation duration in seconds
      let t = animProgress + delta / duration;
      t = Math.min(t, 1);
      
      // Apply ease-out easing for smooth deceleration
      const easedT = 1 - Math.pow(1 - t, 3); // Cubic ease-out
      
      // Use slerp for smooth quaternion interpolation
      const currentQuat = meshRef.current.quaternion.clone();
      if (targetQuat) {
        // Ensure target quaternion is normalized
        const normalizedTarget = targetQuat.clone().normalize();
        currentQuat.slerp(normalizedTarget, easedT);
        currentQuat.normalize(); // Ensure result is normalized
        meshRef.current.quaternion.copy(currentQuat);
      }
      
      setAnimProgress(t);
      
      if (t >= 1) {
        // Ensure we're exactly at target - use clone and normalize to avoid reference issues
        if (targetQuat) {
          const finalQuat = targetQuat.clone().normalize();
          meshRef.current.quaternion.copy(finalQuat);
          // Force update to ensure the quaternion is applied
          meshRef.current.updateMatrixWorld(true);
        }
        setIsAnimating(false);
        setTargetQuat(null);
        if (onRollComplete) {
          onRollComplete();
        }
      }
    }
  });

  return (
    <group>
      <mesh ref={meshRef} castShadow receiveShadow>
        <octahedronGeometry args={[2, 0]} />
        <meshStandardMaterial 
          color={colors[diceColor]} 
          metalness={0.3}
          roughness={0.4}
          emissive={colors[diceColor]}
          emissiveIntensity={0.2}
        />
      </mesh>
      <DiceNumber value={showWin ? undefined : value} rolling={rolling} diceColor={diceColor} showWin={showWin} />
    </group>
  );
}

interface DiceNumberProps {
  value?: number;
  rolling: boolean;
  diceColor: 'cyan' | 'purple' | 'orange' | 'gold';
  showWin?: boolean;
}

function DiceNumber({ value, rolling, diceColor, showWin = false }: DiceNumberProps) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  
  useEffect(() => {
    if (showWin && !rolling) {
      // Create canvas texture for "WIN" text
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      
      if (context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = 'bold 180px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        const text = 'WIN';
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        
        // Golden gradient for WIN
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#fbbf24');
        gradient.addColorStop(0.5, '#f59e0b');
        gradient.addColorStop(1, '#d97706');
        
        // Draw glow effect
        context.strokeStyle = 'rgba(251, 191, 36, 0.8)';
        context.lineWidth = 30;
        context.strokeText(text, x, y);
        
        context.strokeStyle = 'rgba(0, 0, 0, 0.9)';
        context.lineWidth = 20;
        context.strokeText(text, x, y);
        
        context.fillStyle = gradient;
        context.fillText(text, x, y);
        
        const newTexture = new THREE.CanvasTexture(canvas);
        newTexture.needsUpdate = true;
        setTexture(newTexture);
        
        return () => {
          newTexture.dispose();
        };
      }
    } else if (value && !rolling) {
      // Create canvas texture for the number
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const context = canvas.getContext('2d');
      
      if (context) {
        // Clear canvas with transparency
        context.clearRect(0, 0, canvas.width, canvas.height);
        
        // Set font size first (50% of original 420px = 210px)
        context.font = 'bold 210px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        
        // Draw cool glowing text with gradient
        const text = value.toString();
        const x = canvas.width / 2;
        const y = canvas.height / 2;
        
        // Create gradient for cool effect
        const gradient = context.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.5, '#e0e7ff');
        gradient.addColorStop(1, '#c7d2fe');
        
        // Draw glow effect (multiple outlines)
        context.strokeStyle = 'rgba(139, 92, 246, 0.8)'; // Purple glow
        context.lineWidth = 25;
        context.strokeText(text, x, y);
        
        context.strokeStyle = 'rgba(59, 130, 246, 0.6)'; // Blue glow
        context.lineWidth = 20;
        context.strokeText(text, x, y);
        
        context.strokeStyle = 'rgba(0, 0, 0, 0.9)'; // Black outline
        context.lineWidth = 15;
        context.strokeText(text, x, y);
        
        // Draw gradient fill
        context.fillStyle = gradient;
        context.fillText(text, x, y);
        
        const newTexture = new THREE.CanvasTexture(canvas);
        newTexture.needsUpdate = true;
        setTexture(newTexture);
        
        return () => {
          newTexture.dispose();
        };
      }
    } else {
      setTexture(null);
    }
  }, [value, rolling, showWin]);

  // Position number on the front face (always at z = distance, facing camera)
  // The number is positioned in front of the dice center, so it appears on the front face
  const distance = 2.4; // Slightly in front of the dice surface

  if ((!value && !showWin) || rolling || !texture) return null;

  return (
    <mesh 
      position={[0, 0, distance]}
      rotation={[0, 0, 0]}
    >
      <planeGeometry args={[1.8, 1.8]} />
      <meshBasicMaterial 
        map={texture} 
        transparent 
        alphaTest={0.1}
        depthWrite={false}
      />
    </mesh>
  );
}

interface Dice3DProps {
  value?: number;
  rolling: boolean;
  diceColor: 'cyan' | 'purple' | 'orange' | 'gold';
  label: string;
  icon: string;
  diceType?: 8 | 10 | 12 | 20;
  isGolden?: boolean;
  hasAnyGolden?: boolean;
}

export default function Dice3D({ value, rolling, diceColor, label, icon, diceType = 8, isGolden = false, hasAnyGolden = false }: Dice3DProps) {
  const [rollComplete, setRollComplete] = useState(false);

  const colorClasses = {
    cyan: { label: 'text-cyan-400', meaning: 'text-cyan-500/60' },
    purple: { label: 'text-purple-400', meaning: 'text-purple-500/60' },
    orange: { label: 'text-orange-400', meaning: 'text-orange-500/60' },
    gold: { label: 'text-yellow-400', meaning: 'text-yellow-500/60' }
  };

  const colors = colorClasses[diceColor];

  return (
    <div className="flex flex-col items-center gap-0.5">
      <div className="w-[225px] h-[225px] md:w-[275px] md:h-[275px]">
        <Canvas
          camera={{ position: [0, 0, 7], fov: 50 }}
          gl={{ antialias: true, alpha: true }}
        >
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={0.8} />
          <directionalLight position={[-5, -5, -5]} intensity={0.3} />
          <DiceMesh 
            value={(hasAnyGolden && !isGolden) ? undefined : (isGolden ? undefined : value)} 
            rolling={rolling} 
            diceColor={diceColor}
            onRollComplete={() => setRollComplete(true)}
            showWin={isGolden && !rolling && value !== undefined}
          />
        </Canvas>
      </div>

      <div className={`text-base md:text-lg tracking-widest uppercase ${colors.label} flex items-center gap-1.5 font-bold -mt-4`}>
        <span className="text-2xl md:text-3xl">{icon}</span>
        <span>{label}</span>
      </div>
      
      {value && !hasAnyGolden && (
        <div className="flex items-center gap-1.5">
          <div className={`text-lg ${colors.meaning}`}>
            →
          </div>
          <div className={`text-base md:text-lg uppercase ${colors.meaning} tracking-tight font-semibold`}>
            {MEANINGS[diceType][value].split(' ')[0]}
          </div>
        </div>
      )}
    </div>
  );
}

