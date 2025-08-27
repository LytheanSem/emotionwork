import * as THREE from 'three'

export function FullGrid({ visible }: { visible: boolean }) {
  return (
    <group visible={visible}>
      {/* Main grid covering the entire floor */}
      <gridHelper
        args={[100, 100, '#3b82f6', '#93c5fd']}
        position={[0, 0.01, 0]}
      />

      {/* Center lines with different colors */}
      <mesh position={[0, 0.02, 0]}>
        <planeGeometry args={[100, 0.1]} />
        <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[100, 0.1]} />
        <meshBasicMaterial color="#ef4444" side={THREE.DoubleSide} />
      </mesh>

      {/* Border */}
      <lineSegments position={[0, 0.03, 0]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(100, 100)]} />
        <lineBasicMaterial color="#1e40af" />
      </lineSegments>
    </group>
  )
}
