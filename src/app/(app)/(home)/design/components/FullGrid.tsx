import * as THREE from 'three'

interface VenueDimensions {
  width: number
  depth: number
  height: number
}

export function FullGrid({ 
  visible, 
  venueDimensions,
  showVenueBoundary = true
}: { 
  visible: boolean
  venueDimensions?: VenueDimensions
  showVenueBoundary?: boolean
}) {
  const { width = 20, depth = 15, height = 8 } = venueDimensions || {}
  
  return (
    <group visible={visible}>
      {/* Venue boundary visualization - conditionally rendered */}
      {showVenueBoundary && (
        <group>
          {/* Venue floor */}
          <mesh position={[0, 0, 0]} receiveShadow>
            <planeGeometry args={[width, depth]} />
            <meshStandardMaterial 
              color="#f8fafc" 
              transparent 
              opacity={0.3}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Venue walls */}
          {/* Back wall */}
          <mesh position={[0, height/2, -depth/2]} castShadow receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial 
              color="#e2e8f0" 
              transparent 
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Front wall */}
          <mesh position={[0, height/2, depth/2]} castShadow receiveShadow>
            <planeGeometry args={[width, height]} />
            <meshStandardMaterial 
              color="#e2e8f0" 
              transparent 
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Left wall */}
          <mesh position={[-width/2, height/2, 0]} castShadow receiveShadow rotation={[0, Math.PI/2, 0]}>
            <planeGeometry args={[depth, height]} />
            <meshStandardMaterial 
              color="#e2e8f0" 
              transparent 
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Right wall */}
          <mesh position={[width/2, height/2, 0]} castShadow receiveShadow rotation={[0, Math.PI/2, 0]}>
            <planeGeometry args={[depth, height]} />
            <meshStandardMaterial 
              color="#e2e8f0" 
              transparent 
              opacity={0.2}
              side={THREE.DoubleSide}
            />
          </mesh>
          
          {/* Venue boundary lines */}
          <lineSegments position={[0, 0.01, 0]}>
            <edgesGeometry args={[new THREE.PlaneGeometry(width, depth)]} />
            <lineBasicMaterial color="#3b82f6" linewidth={2} />
          </lineSegments>
          
          {/* Corner markers */}
          {[
            [-width/2, 0.02, -depth/2],
            [width/2, 0.02, -depth/2],
            [-width/2, 0.02, depth/2],
            [width/2, 0.02, depth/2]
          ].map((position, index) => (
            <mesh key={index} position={position as [number, number, number]}>
              <boxGeometry args={[0.2, 0.04, 0.2]} />
              <meshStandardMaterial color="#3b82f6" />
            </mesh>
          ))}
        </group>
      )}

      {/* Main grid with venue-appropriate size */}
      <gridHelper
        args={[Math.max(width, depth) * 1.5, Math.max(width, depth) * 1.5, '#4b5563', '#9ca3af']}
        position={[0, 0.005, 0]}
      />

      {/* Center lines */}
      <lineSegments position={[0, 0.02, 0]}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[
              new Float32Array([
                -width/2, 0, 0, width/2, 0, 0, 
                0, 0, -depth/2, 0, 0, depth/2
              ]),
              3,
            ]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ef4444" linewidth={2} />
      </lineSegments>

      {/* Dimension labels */}
      <group position={[0, 0.1, 0]}>
        {/* Width label */}
        <mesh position={[0, 0, -depth/2 - 1]}>
          <planeGeometry args={[width, 0.2]} />
          <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
        </mesh>
        
        {/* Depth label */}
        <mesh position={[-width/2 - 1, 0, 0]} rotation={[0, Math.PI/2, 0]}>
          <planeGeometry args={[depth, 0.2]} />
          <meshBasicMaterial color="#10b981" transparent opacity={0.8} />
        </mesh>
      </group>
    </group>
  )
}
