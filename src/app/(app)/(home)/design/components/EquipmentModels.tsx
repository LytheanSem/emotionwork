import { Position, Rotation, Scale } from '../types'

export function SpeakerModel({
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
      {/* Speaker body */}
      <mesh>
        <cylinderGeometry args={[0.3, 0.3, 0.8, 8]} />
        <meshStandardMaterial color="#2c2c2c" />
      </mesh>
      {/* Speaker cone */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.1, 8]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Speaker stand */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  )
}

export function StageLightModel({
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
      {/* Light housing */}
      <mesh>
        <cylinderGeometry args={[0.2, 0.15, 0.4, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Light lens */}
      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#666" transparent opacity={0.7} />
      </mesh>
      {/* Light beam effect */}
      <mesh position={[0, 0.3, 0]}>
        <coneGeometry args={[0.3, 0.8, 8]} />
        <meshStandardMaterial color="#ffff00" transparent opacity={0.3} />
      </mesh>
      {/* Mounting bracket */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.3]} />
        <meshStandardMaterial color="#555" />
      </mesh>
    </group>
  )
}

export function StageModel({
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
      {/* Main stage platform */}
      <mesh>
        <boxGeometry args={[2, 0.2, 2]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      {/* Stage edge trim */}
      <mesh position={[0, 0.1, 0]}>
        <ringGeometry args={[0.9, 1, 8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* Stage supports */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.4, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0.5, -0.3, 0.5]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[-0.5, -0.3, 0.5]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0.5, -0.3, -0.5]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[-0.5, -0.3, -0.5]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  )
}

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
      {/* Microphone head */}
      <mesh>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {/* Microphone body */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.4, 8]} />
        <meshStandardMaterial color="#666" />
      </mesh>
      {/* Microphone stand */}
      <mesh position={[0, -0.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color="#888" />
      </mesh>
      {/* Stand base */}
      <mesh position={[0, -0.8, 0]}>
        <cylinderGeometry args={[0.15, 0.15, 0.05, 8]} />
        <meshStandardMaterial color="#555" />
      </mesh>
    </group>
  )
}

export function TrussModel({
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
      {/* Main truss beam */}
      <mesh>
        <boxGeometry args={[2, 0.1, 0.1]} />
        <meshStandardMaterial color="#2c2c2c" />
      </mesh>
      {/* Vertical supports */}
      <mesh position={[0.8, -0.3, 0]}>
        <boxGeometry args={[0.05, 0.6, 0.05]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[-0.8, -0.3, 0]}>
        <boxGeometry args={[0.05, 0.6, 0.05]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      {/* Cross braces */}
      <mesh position={[0.4, -0.15, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.8, 0.03, 0.03]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      <mesh position={[-0.4, -0.15, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.8, 0.03, 0.03]} />
        <meshStandardMaterial color="#555" />
      </mesh>
      {/* Mounting brackets */}
      <mesh position={[0.8, -0.6, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-0.8, -0.6, 0]}>
        <boxGeometry args={[0.1, 0.1, 0.2]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  )
}

export function PlatformModel({
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
      <mesh>
        <boxGeometry args={[1.5, 0.1, 1.5]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>
      {/* Platform edge */}
      <mesh position={[0, 0.05, 0]}>
        <ringGeometry args={[0.7, 0.75, 8]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      {/* Platform supports */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0.4, -0.2, 0.4]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[-0.4, -0.2, 0.4]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0.4, -0.2, -0.4]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[-0.4, -0.2, -0.4]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
        <meshStandardMaterial color="#444" />
      </mesh>
    </group>
  )
}
