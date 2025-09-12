import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Position, Rotation, Scale } from '../types'

// Enhanced Speaker Model with LED rings and better colors
export function SpeakerModel({
  position,
  rotation,
  scale = [1, 1, 1],
  color,
  id,
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
  color?: string
  id?: number
}) {
  const ringRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ringRef.current) {
      ;(
        ringRef.current.material as THREE.MeshStandardMaterial
      ).emissiveIntensity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2
    }
  })

  // Professional speaker colors
  const speakerColors = [
    { body: '#1a1a1a', cone: '#2c2c2c', accent: '#444' }, // Professional black
    { body: '#dc2626', cone: '#ef4444', accent: '#f87171' }, // Concert red
    { body: '#374151', cone: '#4b5563', accent: '#6b7280' }, // Studio gray
    { body: '#7c3aed', cone: '#8b5cf6', accent: '#a78bfa' }, // Modern purple
    { body: '#1e40af', cone: '#3b82f6', accent: '#60a5fa' }, // Blue professional
    { body: '#059669', cone: '#10b981', accent: '#34d399' }, // Green modern
  ]
  
  // Use custom color if provided, otherwise use deterministic selection based on ID
  const colors = color ? 
    { body: color, cone: color, accent: color } : 
    speakerColors[Math.abs((id || 0)) % speakerColors.length] || speakerColors[0]

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Speaker body - modern design */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.35, 0.3, 0.9, 16]} />
        <meshStandardMaterial color={colors.body} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Main speaker cone */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.28, 0.25, 0.15, 16]} />
        <meshStandardMaterial color={colors.cone} roughness={0.8} />
      </mesh>

      {/* Tweeter */}
      <mesh position={[0, -0.1, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.08, 0.05, 8]} />
        <meshStandardMaterial color="#333" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* LED ring indicator */}
      <mesh ref={ringRef} position={[0, -0.3, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 16]} />
        <meshStandardMaterial
          color="#00ff88"
          emissive="#00ff88"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Professional stand */}
      <mesh position={[0, -0.7, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.08, 0.5, 8]} />
        <meshStandardMaterial color={colors.accent} roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Tripod base */}
      <mesh position={[0, -0.95, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.05, 3]} />
        <meshStandardMaterial color="#333" roughness={0.6} metalness={0.7} />
      </mesh>
    </group>
  )
}

// Enhanced Stage Light with realistic beam
export function StageLightModel({
  position,
  rotation,
  scale = [1, 1, 1],
  lightingColor,
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
  lightingColor?: string
}) {
  const lightRef = useRef<THREE.SpotLight>(null)
  const beamRef = useRef<THREE.Mesh>(null)
  const lensRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (lightRef.current && beamRef.current && lensRef.current) {
      const intensity = 0.8 + Math.sin(state.clock.elapsedTime * 3) * 0.2
      
      // Use custom lighting color if provided, otherwise use animated hue
      if (lightingColor) {
        const color = new THREE.Color(lightingColor)
        lightRef.current.color = color
        ;(beamRef.current.material as THREE.MeshBasicMaterial).color = color
        ;(lensRef.current.material as THREE.MeshStandardMaterial).emissive = color
      } else {
        const hue = (state.clock.elapsedTime * 0.3) % 1
        lightRef.current.color.setHSL(hue, 0.8, 0.7)
        ;(beamRef.current.material as THREE.MeshBasicMaterial).color.setHSL(hue, 0.8, 0.5)
        ;(lensRef.current.material as THREE.MeshStandardMaterial).emissive.setHSL(hue, 0.8, 0.3)
      }
      
      lightRef.current.intensity = intensity * 2
      ;(beamRef.current.material as THREE.MeshBasicMaterial).opacity = intensity * 0.4
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Light housing - professional fixture */}
      <mesh castShadow>
        <cylinderGeometry args={[0.25, 0.2, 0.5, 12]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Lens assembly */}
      <mesh ref={lensRef} position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.08, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Front glass */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.02, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          transparent
          opacity={0.8}
          roughness={0.1}
        />
      </mesh>

      {/* Cooling fins */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, -0.1 - i * 0.05, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.02, 8]} />
          <meshStandardMaterial color="#444" roughness={0.6} />
        </mesh>
      ))}

      {/* Mounting bracket */}
      <mesh position={[0, -0.4, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.4]} />
        <meshStandardMaterial color="#555" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Light beam effect */}
      <mesh ref={beamRef} position={[0, 0.5, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.8, 2, 8, 1, true]} />
        <meshBasicMaterial
          color={lightingColor || "#ffff88"}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Actual spotlight */}
      <spotLight
        ref={lightRef}
        position={[0, 0.3, 0]}
        target-position={[0, -2, 0]}
        angle={Math.PI / 6}
        penumbra={0.3}
        intensity={2}
        color={lightingColor || "#ffff88"}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </group>
  )
}

// Stage Model
export function StageModel({
  position,
  rotation,
  scale = [1, 1, 1],
  color,
  id,
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
  color?: string
  id?: number
}) {
  // Color variations for different stage types
  const stageColors = [
    { base: '#2c2c2c', surface: '#1a1a1a', edge: '#444' }, // Dark professional
    { base: '#8B4513', surface: '#D2691E', edge: '#A0522D' }, // Wood brown
    { base: '#1a365d', surface: '#2c5282', edge: '#2b6cb0' }, // Blue corporate
    { base: '#553c9a', surface: '#7c3aed', edge: '#8b5cf6' }, // Purple modern
    { base: '#7c2d12', surface: '#dc2626', edge: '#ef4444' }, // Red dramatic
    { base: '#be185d', surface: '#ec4899', edge: '#f472b6' }, // Pink elegant
  ]
  
  // Use custom color if provided, otherwise use deterministic selection based on ID
  const colors = color ? 
    { base: color, surface: color, edge: color } : 
    (stageColors[Math.abs((id || 0)) % stageColors.length] || stageColors[0])
  
  // Debug logging
  console.log('StageModel colors:', colors, 'id:', id, 'color:', color)
  
  // Ensure colors object has all required properties with absolute fallbacks
  const safeColors = {
    base: (colors && colors.base) ? colors.base : '#2c2c2c',
    surface: (colors && colors.surface) ? colors.surface : '#1a1a1a', 
    edge: (colors && colors.edge) ? colors.edge : '#444'
  }
  
  console.log('StageModel safeColors:', safeColors)
  
  // Final safety check - ensure we have valid colors
  if (!safeColors || !safeColors.base) {
    console.error('StageModel: safeColors is invalid, using fallback')
    return (
      <group position={position} rotation={rotation} scale={scale}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[6, 0.5, 4]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.6} metalness={0.3} />
        </mesh>
      </group>
    )
  }
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main stage platform */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[6, 0.5, 4]} />
        <meshStandardMaterial color={safeColors.base} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Stage surface */}
      <mesh position={[0, 0.26, 0]}>
        <boxGeometry args={[5.8, 0.02, 3.8]} />
        <meshStandardMaterial color={safeColors.surface} roughness={0.8} />
      </mesh>

      {/* Support legs */}
      {[
        [-2.5, -2],
        [2.5, -2],
        [-2.5, 2],
        [2.5, 2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.4, z]} castShadow>
          <cylinderGeometry args={[0.1, 0.1, 0.3, 8]} />
          <meshStandardMaterial color={safeColors.edge} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// Microphone Model
export function MicrophoneModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Microphone body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.15, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Grille */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>

      {/* Cable */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.4, 8]} />
        <meshStandardMaterial color="#000" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Platform Model
export function PlatformModel({
  position,
  rotation,
  scale = [1, 1, 1],
  color,
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
  color?: string
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Platform surface */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial color={color || "#444"} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Support structure */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 0.4, 8]} />
        <meshStandardMaterial color="#555" roughness={0.8} />
      </mesh>
    </group>
  )
}

// LED Par Light
export function LEDParModel({
  position,
  rotation,
  scale = [1, 1, 1],
  lightingColor,
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
  lightingColor?: string
}) {
  const ledRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (ledRef.current) {
      if (lightingColor) {
        const color = new THREE.Color(lightingColor)
        ;(ledRef.current.material as THREE.MeshStandardMaterial).color = color
        ;(ledRef.current.material as THREE.MeshStandardMaterial).emissive = color
      } else {
        const hue = (state.clock.elapsedTime * 0.5) % 1
        ;(ledRef.current.material as THREE.MeshStandardMaterial).color.setHSL(
          hue,
          0.8,
          0.5
        )
        ;(ledRef.current.material as THREE.MeshStandardMaterial).emissive.setHSL(
          hue,
          0.8,
          0.3
        )
      }
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* LED housing */}
      <mesh castShadow>
        <cylinderGeometry args={[0.3, 0.28, 0.2, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* LED array */}
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2
        const x = Math.cos(angle) * 0.15
        const z = Math.sin(angle) * 0.15
        return (
          <mesh
            key={i}
            ref={i === 0 ? ledRef : undefined}
            position={[x, 0.08, z]}
          >
            <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
            <meshStandardMaterial
              color={lightingColor || "#ff0088"}
              emissive={lightingColor || "#ff0088"}
              emissiveIntensity={0.5}
            />
          </mesh>
        )
      })}

      {/* Center LED */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.02, 8]} />
        <meshStandardMaterial
          color={lightingColor || "#0088ff"}
          emissive={lightingColor || "#0088ff"}
          emissiveIntensity={0.7}
        />
      </mesh>

      {/* Mounting clamp */}
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.35]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Moving Head Light
export function MovingHeadModel({
  position,
  rotation,
  scale = [1, 1, 1],
  lightingColor,
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
  lightingColor?: string
}) {
  const headRef = useRef<THREE.Group>(null)
  const beamRef = useRef<THREE.Mesh>(null)
  const lensRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.5
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.3
    }
    if (beamRef.current && lensRef.current) {
      const intensity = 0.4 + Math.sin(state.clock.elapsedTime * 4) * 0.2
      
      if (lightingColor) {
        const color = new THREE.Color(lightingColor)
        ;(beamRef.current.material as THREE.MeshBasicMaterial).color = color
        ;(lensRef.current.material as THREE.MeshStandardMaterial).emissive = color
      } else {
        const hue = (state.clock.elapsedTime * 0.4) % 1
        ;(beamRef.current.material as THREE.MeshBasicMaterial).color.setHSL(hue, 0.9, 0.6)
        ;(lensRef.current.material as THREE.MeshStandardMaterial).emissive.setHSL(hue, 0.9, 0.4)
      }
      
      ;(beamRef.current.material as THREE.MeshBasicMaterial).opacity = intensity
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Base */}
      <mesh castShadow>
        <cylinderGeometry args={[0.2, 0.25, 0.3, 12]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.4} metalness={0.8} />
      </mesh>

      {/* Moving head */}
      <group ref={headRef} position={[0, 0.25, 0]}>
        <mesh castShadow>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Lens */}
        <mesh ref={lensRef} position={[0, 0, 0.16]}>
          <cylinderGeometry args={[0.12, 0.12, 0.05, 16]} />
          <meshStandardMaterial color="#333" transparent opacity={0.8} />
        </mesh>

        {/* Light beam */}
        <mesh
          ref={beamRef}
          position={[0, 0, 0.5]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <coneGeometry args={[1.2, 3, 8, 1, true]} />
          <meshBasicMaterial
            color="#ff4488"
            transparent
            opacity={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Spot light */}
        <spotLight
          position={[0, 0, 0.2]}
          target-position={[0, 0, 3]}
          angle={Math.PI / 5}
          penumbra={0.5}
          intensity={3}
          color={lightingColor || "#ff4488"}
          castShadow
        />
      </group>
    </group>
  )
}

// DJ Booth/Console
export function DJBoothModel({
  position,
  rotation,
  scale = [1, 1, 1],
  color,
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
  color?: string
}) {
  const screenRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (screenRef.current) {
      ;(
        screenRef.current.material as THREE.MeshStandardMaterial
      ).emissiveIntensity = 0.2 + Math.sin(state.clock.elapsedTime * 6) * 0.1
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main console */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 0.8, 1.2]} />
        <meshStandardMaterial color={color || "#2c2c2c"} roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Angled top surface */}
      <mesh position={[0, 0.35, -0.1]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[1.8, 0.1, 1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Screen */}
      <mesh ref={screenRef} position={[0, 0.42, 0.3]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[0.8, 0.5, 0.02]} />
        <meshStandardMaterial
          color="#000"
          emissive="#0066ff"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Mixer knobs */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0.42, -0.2]} rotation={[-0.2, 0, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.02, 8]} />
          <meshStandardMaterial color="#666" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}

      {/* Turntables */}
      <mesh position={[-0.5, 0.42, 0]} rotation={[-0.2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
        <meshStandardMaterial color="#333" roughness={0.1} metalness={0.9} />
      </mesh>
      <mesh position={[0.5, 0.42, 0]} rotation={[-0.2, 0, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.02, 32]} />
        <meshStandardMaterial color="#333" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Support legs */}
      {[
        [-0.8, 0.4],
        [0.8, 0.4],
        [-0.8, -0.4],
        [0.8, -0.4],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.6, z]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.8, 8]} />
          <meshStandardMaterial color="#555" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// Laser Machine
export function LaserModel({
  position,
  rotation,
  scale = [1, 1, 1],
  lightingColor,
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
  lightingColor?: string
}) {
  const laserRef = useRef<THREE.Group>(null)
  const beamRef = useRef<THREE.Mesh>(null)
  const emitterRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (laserRef.current) {
      laserRef.current.rotation.y = state.clock.elapsedTime * 2
    }
    if (beamRef.current && emitterRef.current) {
      const opacity = 0.6 + Math.sin(state.clock.elapsedTime * 8) * 0.4
      
      if (lightingColor) {
        const color = new THREE.Color(lightingColor)
        ;(beamRef.current.material as THREE.MeshBasicMaterial).color = color
        ;(emitterRef.current.material as THREE.MeshStandardMaterial).emissive = color
      } else {
        const hue = (state.clock.elapsedTime * 0.8) % 1
        ;(beamRef.current.material as THREE.MeshBasicMaterial).color.setHSL(hue, 1.0, 0.5)
        ;(emitterRef.current.material as THREE.MeshStandardMaterial).emissive.setHSL(hue, 1.0, 0.6)
      }
      
      ;(beamRef.current.material as THREE.MeshBasicMaterial).opacity = opacity
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Laser housing */}
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.3, 0.6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Rotating laser head */}
      <group ref={laserRef} position={[0, 0.2, 0]}>
        <mesh ref={emitterRef}>
          <cylinderGeometry args={[0.08, 0.08, 0.15, 8]} />
          <meshStandardMaterial
            color={lightingColor || "#ff0000"}
            emissive={lightingColor || "#ff0000"}
            emissiveIntensity={0.5}
          />
        </mesh>

        {/* Laser beams */}
        <mesh
          ref={beamRef}
          position={[0, 0, 0.3]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.01, 0.01, 10, 8]} />
          <meshBasicMaterial color={lightingColor || "#ff0000"} transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.01, 0.01, 10, 8]} />
          <meshBasicMaterial color={lightingColor || "#00ff00"} transparent opacity={0.6} />
        </mesh>
      </group>

      {/* Control panel */}
      <mesh position={[0, 0, 0.31]}>
        <boxGeometry args={[0.2, 0.15, 0.02]} />
        <meshStandardMaterial
          color="#000"
          emissive="#00ffff"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  )
}

// Smoke Machine
export function SmokeModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  const smokeRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (smokeRef.current) {
      smokeRef.current.position.y =
        0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1
      ;(smokeRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.2 + Math.sin(state.clock.elapsedTime * 3) * 0.1
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Machine body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.3, 0.4]} />
        <meshStandardMaterial color="#333" roughness={0.6} metalness={0.5} />
      </mesh>

      {/* Fluid tank */}
      <mesh position={[0, 0.08, -0.15]}>
        <cylinderGeometry args={[0.08, 0.08, 0.25, 8]} />
        <meshStandardMaterial color="#444" transparent opacity={0.8} />
      </mesh>

      {/* Fluid inside tank */}
      <mesh position={[0, 0.08, -0.15]}>
        <cylinderGeometry args={[0.07, 0.07, 0.2, 8]} />
        <meshStandardMaterial color="#0088ff" transparent opacity={0.6} />
      </mesh>

      {/* Nozzle */}
      <mesh position={[0, 0.2, 0.25]}>
        <cylinderGeometry args={[0.05, 0.03, 0.15, 8]} />
        <meshStandardMaterial color="#666" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Smoke effect */}
      <mesh ref={smokeRef} position={[0, 0.3, 0.35]}>
        <sphereGeometry args={[0.3, 8, 6]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
      </mesh>

      {/* Control knob */}
      <mesh position={[0.2, 0.05, 0.21]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01, 8]} />
        <meshStandardMaterial color="#888" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  )
}

// Professional Video Screen
export function VideoScreenModel({
  position,
  rotation,
  scale = [1, 1, 1],
  color,
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
  color?: string
}) {
  const screenRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (screenRef.current) {
      const time = state.clock.elapsedTime
      ;(
        screenRef.current.material as THREE.MeshStandardMaterial
      ).emissiveIntensity = 0.3 + Math.sin(time * 4) * 0.1
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Screen frame */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 2, 0.15]} />
        <meshStandardMaterial color={color || "#1a1a1a"} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Screen surface */}
      <mesh ref={screenRef} position={[0, 0, 0.08]}>
        <boxGeometry args={[2.8, 1.8, 0.02]} />
        <meshStandardMaterial
          color="#000"
          emissive="#4400ff"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Corner mounts */}
      {[
        [-1.4, 0.9],
        [1.4, 0.9],
        [-1.4, -0.9],
        [1.4, -0.9],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, -0.1]}>
          <cylinderGeometry args={[0.04, 0.04, 0.1, 6]} />
          <meshStandardMaterial color="#666" roughness={0.8} />
        </mesh>
      ))}

      {/* Support structure */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.1]} />
        <meshStandardMaterial color="#555" roughness={0.8} />
      </mesh>
      <mesh position={[0, -1.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
        <meshStandardMaterial color="#444" roughness={0.7} />
      </mesh>
    </group>
  )
}

// Fog Machine
export function FogModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  const fogRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (fogRef.current) {
      fogRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 2) * 0.2
      )
      ;(fogRef.current.material as THREE.MeshBasicMaterial).opacity =
        0.15 + Math.sin(state.clock.elapsedTime * 1.5) * 0.05
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Machine housing */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.4, 0.5]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.5} metalness={0.6} />
      </mesh>

      {/* Heating element indicator */}
      <mesh position={[0.3, 0.1, 0.2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.05, 8]} />
        <meshStandardMaterial
          color="#ff4400"
          emissive="#ff4400"
          emissiveIntensity={0.8}
        />
      </mesh>

      {/* Output nozzle */}
      <mesh position={[0, 0.25, 0.3]}>
        <cylinderGeometry args={[0.08, 0.06, 0.2, 8]} />
        <meshStandardMaterial color="#444" roughness={0.4} />
      </mesh>

      {/* Fog effect */}
      <mesh ref={fogRef} position={[0, 0.5, 0.6]}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshBasicMaterial color="#f0f0f0" transparent opacity={0.2} />
      </mesh>

      {/* Control panel */}
      <mesh position={[-0.2, 0.1, 0.26]}>
        <boxGeometry args={[0.15, 0.08, 0.02]} />
        <meshStandardMaterial
          color="#000"
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

// Strobe Light
export function StrobeModel({
  position,
  rotation,
  scale = [1, 1, 1],
  lightingColor,
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
  lightingColor?: string
}) {
  const strobeRef = useRef<THREE.Mesh>(null)
  const [isFlashing, setIsFlashing] = useState(false)

  useFrame((state) => {
    if (strobeRef.current) {
      const flash = Math.floor(state.clock.elapsedTime * 8) % 2 === 0
      setIsFlashing(flash)
      
      const material = strobeRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = flash ? 2 : 0.1
      
      if (lightingColor) {
        material.emissive = new THREE.Color(lightingColor)
      } else {
        const hue = (state.clock.elapsedTime * 0.6) % 1
        material.emissive.setHSL(hue, 0.8, 0.7)
      }
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Housing */}
      <mesh castShadow>
        <boxGeometry args={[0.4, 0.3, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Strobe tube */}
      <mesh ref={strobeRef} position={[0, 0, 0.12]}>
        <boxGeometry args={[0.35, 0.25, 0.05]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={isFlashing ? 2 : 0.1}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Mounting bracket */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.1, 8]} />
        <meshStandardMaterial color="#666" roughness={0.6} />
      </mesh>

      {/* Reflector */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[0.38, 0.28, 0.02]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.1} metalness={0.9} />
      </mesh>
    </group>
  )
}

// Enhanced Truss System
export function TrussModel({
  position,
  rotation,
  scale = [1, 1, 1],
  color,
  id,
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
  color?: string
  id?: number
}) {
  // Professional truss colors
  const trussColors = [
    { main: '#2d3748', accent: '#4a5568' }, // Dark gray
    { main: '#1a202c', accent: '#2d3748' }, // Charcoal
    { main: '#2b6cb0', accent: '#3182ce' }, // Blue
    { main: '#744210', accent: '#975a16' }, // Bronze
    { main: '#553c9a', accent: '#7c3aed' }, // Purple
  ]
  
  // Use custom color if provided, otherwise use deterministic selection based on ID
  const colors = color ? 
    { main: color, accent: color } : 
    trussColors[Math.abs((id || 0)) % trussColors.length] || trussColors[0]
  
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main truss beams */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 0.12, 0.12]} />
        <meshStandardMaterial color={colors.main} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[3, 0.12, 0.12]} />
        <meshStandardMaterial color={colors.main} roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Diagonal braces */}
      {[-1, -0.5, 0, 0.5, 1].map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[0.4, 0.05, 0.05]} />
            <meshStandardMaterial color={colors.accent} roughness={0.4} metalness={0.6} />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[0.4, 0.05, 0.05]} />
            <meshStandardMaterial color={colors.accent} roughness={0.4} metalness={0.6} />
          </mesh>
        </group>
      ))}

      {/* Mounting clamps */}
      {[-1.2, 0, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0.15, 0]}>
          <boxGeometry args={[0.08, 0.06, 0.2]} />
          <meshStandardMaterial color={colors.accent} roughness={0.3} metalness={0.8} />
        </mesh>
      ))}

      {/* Vertical supports */}
      <mesh position={[-1.5, -0.8, 0]}>
        <boxGeometry args={[0.1, 1.6, 0.1]} />
        <meshStandardMaterial color={colors.main} roughness={0.3} metalness={0.7} />
      </mesh>
      <mesh position={[1.5, -0.8, 0]}>
        <boxGeometry args={[0.1, 1.6, 0.1]} />
        <meshStandardMaterial color={colors.main} roughness={0.3} metalness={0.7} />
      </mesh>
    </group>
  )
}

// Monitor/Wedge Speaker
export function MonitorSpeakerModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  const statusRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (statusRef.current) {
      ;(
        statusRef.current.material as THREE.MeshStandardMaterial
      ).emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 4) * 0.2
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Wedge-shaped body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.4, 0.6]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Angled front face */}
      <mesh position={[0, 0.1, 0.35]} rotation={[-0.3, 0, 0]}>
        <boxGeometry args={[0.75, 0.5, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} />
      </mesh>

      {/* Main driver */}
      <mesh position={[0, 0.05, 0.38]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.18, 0.08, 16]} />
        <meshStandardMaterial color="#333" roughness={0.7} />
      </mesh>

      {/* Tweeter */}
      <mesh position={[0, 0.25, 0.42]} rotation={[-0.3, 0, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.03, 8]} />
        <meshStandardMaterial color="#444" roughness={0.2} metalness={0.8} />
      </mesh>

      {/* Status LED */}
      <mesh ref={statusRef} position={[0.3, 0, 0.32]}>
        <cylinderGeometry args={[0.01, 0.01, 0.02, 8]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.6}
        />
      </mesh>

      {/* Protective corners */}
      {[
        [-0.4, 0.2, 0.3],
        [0.4, 0.2, 0.3],
        [-0.4, -0.2, 0.3],
        [0.4, -0.2, 0.3],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.05, 0.05, 0.05]} />
          <meshStandardMaterial color="#666" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// Microphone Stand
export function MicStandModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Base */}
      <mesh position={[0, -0.9, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.2, 0.05, 3]} />
        <meshStandardMaterial color="#333" roughness={0.7} metalness={0.5} />
      </mesh>

      {/* Main pole */}
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
        <meshStandardMaterial color="#444" roughness={0.6} metalness={0.8} />
      </mesh>

      {/* Boom arm */}
      <mesh position={[0.3, 0.7, 0]} rotation={[0, 0, -0.3]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.6, 8]} />
        <meshStandardMaterial color="#555" roughness={0.6} metalness={0.8} />
      </mesh>

      {/* Microphone */}
      <mesh position={[0.55, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.15, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
      </mesh>

      {/* Mic grille */}
      <mesh position={[0.55, 0.63, 0]}>
        <sphereGeometry args={[0.04, 8, 6]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>

      {/* Adjustment clamp */}
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.06, 0.06, 0.06]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Subwoofer
export function SubwooferModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  const coneRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (coneRef.current) {
      coneRef.current.position.z =
        0.05 + Math.sin(state.clock.elapsedTime * 12) * 0.02
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main cabinet */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Large driver */}
      <mesh ref={coneRef} position={[0, 0, 0.52]}>
        <cylinderGeometry args={[0.4, 0.35, 0.1, 16]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
      </mesh>

      {/* Driver surround */}
      <mesh position={[0, 0, 0.51]}>
        <torusGeometry args={[0.42, 0.03, 8, 16]} />
        <meshStandardMaterial color="#333" roughness={0.9} />
      </mesh>

      {/* Port tube */}
      <mesh position={[0, -0.3, 0.52]}>
        <cylinderGeometry args={[0.08, 0.08, 0.2, 12]} />
        <meshStandardMaterial color="#000" roughness={0.2} />
      </mesh>

      {/* Protective corners */}
      {[
        [-0.5, 0.5, 0.5],
        [0.5, 0.5, 0.5],
        [-0.5, -0.5, 0.5],
        [0.5, -0.5, 0.5],
      ].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y, z]}>
          <boxGeometry args={[0.08, 0.08, 0.08]} />
          <meshStandardMaterial color="#444" roughness={0.9} />
        </mesh>
      ))}

      {/* Logo/Brand plate */}
      <mesh position={[0, 0.35, 0.52]}>
        <boxGeometry args={[0.2, 0.05, 0.01]} />
        <meshStandardMaterial
          color="#666"
          emissive="#0066ff"
          emissiveIntensity={0.2}
        />
      </mesh>
    </group>
  )
}

// Cable Ramp/Protector
export function CableRampModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main ramp body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 0.1, 0.3]} />
        <meshStandardMaterial color="#ffff00" roughness={0.6} />
      </mesh>

      {/* Angled edges */}
      <mesh position={[-1.05, 0.02, 0]} rotation={[0, 0, 0.3]}>
        <boxGeometry args={[0.1, 0.06, 0.3]} />
        <meshStandardMaterial color="#ffff00" roughness={0.6} />
      </mesh>
      <mesh position={[1.05, 0.02, 0]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.1, 0.06, 0.3]} />
        <meshStandardMaterial color="#ffff00" roughness={0.6} />
      </mesh>

      {/* Cable channels */}
      <mesh position={[0, -0.02, 0]}>
        <boxGeometry args={[1.8, 0.03, 0.25]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>

      {/* Warning stripes */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.06, 0]}>
          <boxGeometry args={[0.15, 0.01, 0.32]} />
          <meshStandardMaterial color="#000" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// Power Distribution Unit
export function PowerDistributionModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  const statusRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (statusRef.current) {
      ;(
        statusRef.current.material as THREE.MeshStandardMaterial
      ).emissiveIntensity = 0.5 + Math.sin(state.clock.elapsedTime * 3) * 0.3
    }
  })

  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.3, 0.25]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.4} metalness={0.7} />
      </mesh>

      {/* Power outlets */}
      {[-0.5, -0.17, 0.17, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.13]}>
          <boxGeometry args={[0.08, 0.12, 0.02]} />
          <meshStandardMaterial color="#000" roughness={0.2} />
        </mesh>
      ))}

      {/* Status indicators */}
      {[-0.5, -0.17, 0.17, 0.5].map((x, i) => (
        <mesh
          key={i}
          ref={i === 0 ? statusRef : undefined}
          position={[x, 0.08, 0.13]}
        >
          <cylinderGeometry args={[0.01, 0.01, 0.01, 8]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#00ff00' : '#ff0000'}
            emissive={i % 2 === 0 ? '#00ff00' : '#ff0000'}
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}

      {/* Main power cable */}
      <mesh position={[-0.8, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
        <meshStandardMaterial color="#000" roughness={0.8} />
      </mesh>

      {/* Mounting brackets */}
      <mesh position={[-0.7, -0.2, 0]}>
        <boxGeometry args={[0.05, 0.1, 0.05]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      <mesh position={[0.7, -0.2, 0]}>
        <boxGeometry args={[0.05, 0.1, 0.05]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Stage Riser/Platform
export function StageRiserModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Platform surface */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 0.2, 3]} />
        <meshStandardMaterial color="#333" roughness={0.7} metalness={0.2} />
      </mesh>

      {/* Support legs */}
      {[
        [-1.8, -1.2],
        [1.8, -1.2],
        [-1.8, 1.2],
        [1.8, 1.2],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, -0.5, z]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshStandardMaterial color="#555" roughness={0.8} />
        </mesh>
      ))}

      {/* Cross bracing */}
      <mesh position={[0, -0.7, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[0.05, 0.05, 3.5]} />
        <meshStandardMaterial color="#666" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.7, 0]} rotation={[0, -Math.PI / 4, 0]}>
        <boxGeometry args={[0.05, 0.05, 3.5]} />
        <meshStandardMaterial color="#666" roughness={0.9} />
      </mesh>

      {/* Non-slip surface texture */}
      <mesh position={[0, 0.11, 0]}>
        <boxGeometry args={[3.8, 0.01, 2.8]} />
        <meshStandardMaterial color="#444" roughness={0.9} />
      </mesh>

      {/* Edge trim */}
      <mesh position={[0, 0.05, 1.5]}>
        <boxGeometry args={[4, 0.1, 0.02]} />
        <meshStandardMaterial color="#666" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.05, -1.5]}>
        <boxGeometry args={[4, 0.1, 0.02]} />
        <meshStandardMaterial color="#666" roughness={0.6} />
      </mesh>
      <mesh position={[2, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[3, 0.1, 0.02]} />
        <meshStandardMaterial color="#666" roughness={0.6} />
      </mesh>
      <mesh position={[-2, 0.05, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[3, 0.1, 0.02]} />
        <meshStandardMaterial color="#666" roughness={0.6} />
      </mesh>
    </group>
  )
}

// Wireless Microphone
export function WirelessMicModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Microphone body */}
      <mesh castShadow>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
      </mesh>
      
      {/* Grille */}
      <mesh position={[0, 0.12, 0]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      
      {/* Antenna */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.3, 8]} />
        <meshStandardMaterial color="#000" roughness={0.8} />
      </mesh>
      
      {/* LED indicator */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.01, 8]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.5}
        />
      </mesh>
    </group>
  )
}

// Headset Microphone
export function HeadsetMicModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Headband */}
      <mesh castShadow>
        <torusGeometry args={[0.3, 0.02, 8, 16]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      
      {/* Microphone boom */}
      <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[0.01, 0.01, 0.2, 8]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      
      {/* Microphone capsule */}
      <mesh position={[0.35, 0, 0]}>
        <sphereGeometry args={[0.02, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  )
}

// Lavalier Microphone
export function LavalierMicModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Microphone capsule */}
      <mesh castShadow>
        <sphereGeometry args={[0.02, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
      </mesh>
      
      {/* Cable */}
      <mesh position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.2, 8]} />
        <meshStandardMaterial color="#000" roughness={0.8} />
      </mesh>
      
      {/* Clip */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.03, 0.01, 0.02]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Line Array Speaker
export function LineArrayModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main cabinet */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.3, 1.5, 0.4]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.7} />
      </mesh>
      
      {/* Multiple drivers */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[0, 0.5 - i * 0.25, 0.22]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 16]} />
          <meshStandardMaterial color="#2c2c2c" roughness={0.8} />
        </mesh>
      ))}
      
      {/* Mounting points */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[0.1, 0.05, 0.1]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      <mesh position={[0, -0.7, 0]}>
        <boxGeometry args={[0.1, 0.05, 0.1]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Audio Mixer
export function MixerModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main console */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 0.3, 1]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.6} metalness={0.4} />
      </mesh>
      
      {/* Channel strips */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.15, 0]}>
          <boxGeometry args={[0.15, 0.1, 0.8]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
      
      {/* Faders */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.2, 0.3]}>
          <boxGeometry args={[0.02, 0.05, 0.4]} />
          <meshStandardMaterial color="#666" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
      
      {/* Master section */}
      <mesh position={[0, 0.15, -0.3]}>
        <boxGeometry args={[0.4, 0.1, 0.2]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
      </mesh>
    </group>
  )
}

// Amplifier
export function AmplifierModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.4, 0.8]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.4} metalness={0.7} />
      </mesh>
      
      {/* Ventilation slots */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-0.6 + i * 0.3, 0.2, 0.41]}>
          <boxGeometry args={[0.2, 0.02, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
      
      {/* Power indicator */}
      <mesh position={[0.6, 0.2, 0.41]}>
        <cylinderGeometry args={[0.01, 0.01, 0.01, 8]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Input/output connectors */}
      <mesh position={[-0.7, 0, 0.41]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial color="#000" roughness={0.2} />
      </mesh>
      <mesh position={[0.7, 0, 0.41]}>
        <boxGeometry args={[0.1, 0.1, 0.02]} />
        <meshStandardMaterial color="#000" roughness={0.2} />
      </mesh>
    </group>
  )
}

// Lighting Console
export function LightingConsoleModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main console */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2.5, 0.4, 1.2]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.6} metalness={0.4} />
      </mesh>
      
      {/* Screen */}
      <mesh position={[0, 0.2, 0.5]}>
        <boxGeometry args={[0.8, 0.5, 0.02]} />
        <meshStandardMaterial
          color="#000"
          emissive="#0066ff"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Fader banks */}
      {[-0.8, -0.4, 0, 0.4, 0.8].map((x, i) => (
        <mesh key={i} position={[x, 0.2, 0.2]}>
          <boxGeometry args={[0.15, 0.05, 0.4]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.8} />
        </mesh>
      ))}
      
      {/* Control buttons */}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 0.2, -0.3]}>
          <cylinderGeometry args={[0.02, 0.02, 0.01, 8]} />
          <meshStandardMaterial color="#666" roughness={0.3} metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

// Hazer Machine
export function HazerModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Machine body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.35, 0.45]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.5} metalness={0.6} />
      </mesh>
      
      {/* Output nozzle */}
      <mesh position={[0, 0.2, 0.25]}>
        <cylinderGeometry args={[0.06, 0.04, 0.15, 8]} />
        <meshStandardMaterial color="#444" roughness={0.4} />
      </mesh>
      
      {/* Control panel */}
      <mesh position={[-0.2, 0.1, 0.23]}>
        <boxGeometry args={[0.12, 0.06, 0.02]} />
        <meshStandardMaterial
          color="#000"
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Fluid level indicator */}
      <mesh position={[0.25, 0.05, -0.15]}>
        <cylinderGeometry args={[0.02, 0.02, 0.25, 8]} />
        <meshStandardMaterial color="#444" transparent opacity={0.8} />
      </mesh>
    </group>
  )
}

// Bubble Machine
export function BubbleMachineModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Machine body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.3, 0.4]} />
        <meshStandardMaterial color="#ff6b6b" roughness={0.6} />
      </mesh>
      
      {/* Bubble wand */}
      <mesh position={[0, 0.2, 0.25]}>
        <cylinderGeometry args={[0.05, 0.05, 0.1, 8]} />
        <meshStandardMaterial color="#333" roughness={0.4} />
      </mesh>
      
      {/* Fan */}
      <mesh position={[0, 0.15, 0.3]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 8]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      
      {/* Control knob */}
      <mesh position={[0.2, 0.05, 0.21]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01, 8]} />
        <meshStandardMaterial color="#888" roughness={0.2} metalness={0.9} />
      </mesh>
    </group>
  )
}

// Confetti Cannon
export function ConfettiCannonModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Cannon body */}
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.2, 0.8, 12]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.4} metalness={0.7} />
      </mesh>
      
      {/* Trigger mechanism */}
      <mesh position={[0, 0.1, 0.4]}>
        <boxGeometry args={[0.1, 0.05, 0.1]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      
      {/* Muzzle */}
      <mesh position={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.2} metalness={0.9} />
      </mesh>
      
      {/* Base */}
      <mesh position={[0, -0.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.1, 8]} />
        <meshStandardMaterial color="#444" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Projector
export function ProjectorModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.3, 0.6]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.4} metalness={0.7} />
      </mesh>
      
      {/* Lens */}
      <mesh position={[0, 0, 0.35]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 16]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.1} metalness={0.9} />
      </mesh>
      
      {/* Ventilation */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[-0.3 + i * 0.3, 0.15, 0.31]}>
          <boxGeometry args={[0.2, 0.02, 0.02]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
      ))}
      
      {/* Control buttons */}
      <mesh position={[0.3, 0.1, 0.31]}>
        <boxGeometry args={[0.05, 0.02, 0.02]} />
        <meshStandardMaterial color="#666" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  )
}

// LED Wall
export function LEDWallModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main panel */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 1.5, 0.1]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* LED array */}
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((x) => 
        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map((y) => (
          <mesh key={`${x}-${y}`} position={[-0.8 + x * 0.16, -0.6 + y * 0.08, 0.06]}>
            <boxGeometry args={[0.01, 0.01, 0.01]} />
            <meshStandardMaterial
              color="#00ff00"
              emissive="#00ff00"
              emissiveIntensity={0.3}
            />
          </mesh>
        ))
      )}
      
      {/* Frame */}
      <mesh position={[0, 0, -0.05]}>
        <boxGeometry args={[2.1, 1.6, 0.02]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Backdrop
export function BackdropModel({
  position,
  rotation,
  scale = [1, 1, 1],
  color,
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
  color?: string
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Backdrop material */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 3, 0.02]} />
        <meshStandardMaterial color={color || "#ffffff"} roughness={0.8} />
      </mesh>
      
      {/* Frame */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[4.1, 3.1, 0.02]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      
      {/* Support legs */}
      <mesh position={[-1.8, -1.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2.8, 8]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      <mesh position={[1.8, -1.4, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 2.8, 8]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Curtain
export function CurtainModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Curtain material */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[3, 2.5, 0.05]} />
        <meshStandardMaterial color="#8b0000" roughness={0.9} />
      </mesh>
      
      {/* Curtain rod */}
      <mesh position={[0, 1.3, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 3.2, 8]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      
      {/* Brackets */}
      <mesh position={[-1.5, 1.3, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#888" roughness={0.8} />
      </mesh>
      <mesh position={[1.5, 1.3, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#888" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Scaffolding
export function ScaffoldingModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Vertical posts */}
      {[-1, 1].map((x, i) => (
        <mesh key={i} position={[x, 0, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 3, 8]} />
          <meshStandardMaterial color="#666" roughness={0.8} />
        </mesh>
      ))}
      
      {/* Horizontal beams */}
      {[0, 1, 2].map((y, i) => (
        <mesh key={i} position={[0, -1 + y * 1, 0]}>
          <boxGeometry args={[2.1, 0.05, 0.05]} />
          <meshStandardMaterial color="#666" roughness={0.8} />
        </mesh>
      ))}
      
      {/* Diagonal braces */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[2.8, 0.03, 0.03]} />
        <meshStandardMaterial color="#777" roughness={0.9} />
      </mesh>
    </group>
  )
}

// Barricade
export function BarricadeModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main barrier */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 1, 0.1]} />
        <meshStandardMaterial color="#ffff00" roughness={0.6} />
      </mesh>
      
      {/* Warning stripes */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-0.8 + i * 0.4, 0, 0.06]}>
          <boxGeometry args={[0.2, 0.05, 0.02]} />
          <meshStandardMaterial color="#000" roughness={0.5} />
        </mesh>
      ))}
      
      {/* Support legs */}
      <mesh position={[-0.8, -0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      <mesh position={[0.8, -0.5, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Cable Tray
export function CableTrayModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main tray */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 0.1, 0.2]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      
      {/* Side walls */}
      <mesh position={[0, 0.05, 0.1]}>
        <boxGeometry args={[2, 0.1, 0.02]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.05, -0.1]}>
        <boxGeometry args={[2, 0.1, 0.02]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      
      {/* Mounting brackets */}
      <mesh position={[-0.8, -0.1, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#888" roughness={0.8} />
      </mesh>
      <mesh position={[0.8, -0.1, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="#888" roughness={0.8} />
      </mesh>
    </group>
  )
}

// Generator
export function GeneratorModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 0.8, 1]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.4} metalness={0.7} />
      </mesh>
      
      {/* Engine cover */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1.2, 0.3, 0.8]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.8} />
      </mesh>
      
      {/* Exhaust pipe */}
      <mesh position={[0.6, 0.7, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.3, 8]} />
        <meshStandardMaterial color="#333" roughness={0.8} />
      </mesh>
      
      {/* Control panel */}
      <mesh position={[-0.6, 0.3, 0.4]}>
        <boxGeometry args={[0.2, 0.15, 0.05]} />
        <meshStandardMaterial
          color="#000"
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Wheels */}
      <mesh position={[-0.6, -0.5, 0.4]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
      <mesh position={[0.6, -0.5, 0.4]}>
        <cylinderGeometry args={[0.1, 0.1, 0.05, 8]} />
        <meshStandardMaterial color="#666" roughness={0.8} />
      </mesh>
    </group>
  )
}

// UPS (Uninterruptible Power Supply)
export function UPSModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main unit */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.4, 0.6]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.4} metalness={0.7} />
      </mesh>
      
      {/* Display screen */}
      <mesh position={[0, 0.15, 0.31]}>
        <boxGeometry args={[0.3, 0.15, 0.02]} />
        <meshStandardMaterial
          color="#000"
          emissive="#00ff00"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* Status LEDs */}
      <mesh position={[0.2, 0.1, 0.31]}>
        <cylinderGeometry args={[0.01, 0.01, 0.01, 8]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Power outlets */}
      <mesh position={[0, 0, 0.31]}>
        <boxGeometry args={[0.2, 0.1, 0.02]} />
        <meshStandardMaterial color="#000" roughness={0.2} />
      </mesh>
    </group>
  )
}

// Wireless Transmitter
export function WirelessTransmitterModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.2, 0.3]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.4} metalness={0.7} />
      </mesh>
      
      {/* Antenna */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.3, 8]} />
        <meshStandardMaterial color="#000" roughness={0.8} />
      </mesh>
      
      {/* LED indicators */}
      <mesh position={[0.1, 0.05, 0.16]}>
        <cylinderGeometry args={[0.01, 0.01, 0.01, 8]} />
        <meshStandardMaterial
          color="#00ff00"
          emissive="#00ff00"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Control knobs */}
      <mesh position={[-0.1, 0.05, 0.16]}>
        <cylinderGeometry args={[0.02, 0.02, 0.01, 8]} />
        <meshStandardMaterial color="#666" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  )
}

// Wireless Receiver
export function WirelessReceiverModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position
  rotation: Rotation
  scale?: Scale
}) {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* Main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.2, 0.3]} />
        <meshStandardMaterial color="#2c2c2c" roughness={0.4} metalness={0.7} />
      </mesh>
      
      {/* Antenna */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.3, 8]} />
        <meshStandardMaterial color="#000" roughness={0.8} />
      </mesh>
      
      {/* LED indicators */}
      <mesh position={[0.1, 0.05, 0.16]}>
        <cylinderGeometry args={[0.01, 0.01, 0.01, 8]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.5}
        />
      </mesh>
      
      {/* Output connector */}
      <mesh position={[0, 0, 0.16]}>
        <boxGeometry args={[0.05, 0.05, 0.02]} />
        <meshStandardMaterial color="#000" roughness={0.2} />
      </mesh>
    </group>
  )
}