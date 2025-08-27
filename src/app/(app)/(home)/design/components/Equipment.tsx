import { useState, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Equipment as EquipmentType } from '../types'
import {
  SpeakerModel,
  StageLightModel,
  StageModel,
  MicrophoneModel,
  TrussModel,
  PlatformModel,
} from './EquipmentModels'

export function Equipment({
  equipment,
  selected,
  onClick,
  onUpdate,
}: {
  equipment: EquipmentType
  selected: boolean
  onClick: () => void
  onUpdate: (updates: Partial<EquipmentType>) => void
}) {
  const ref = useRef<THREE.Group>(null)
  const [isDragging, setIsDragging] = useState(false)
  const { camera, raycaster } = useThree()
  const [dragPlane] = useState(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  )

  useFrame(({ mouse }) => {
    if (!isDragging || !ref.current) return

    raycaster.setFromCamera(mouse, camera)
    const intersection = new THREE.Vector3()
    if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
      ref.current.position.copy(intersection)
      onUpdate({ position: [intersection.x, intersection.y, intersection.z] })
    }
  })

  const handlePointerDown = (e: { stopPropagation: () => void }) => {
    e.stopPropagation()
    setIsDragging(true)
    onClick()
    document.addEventListener('pointerup', handlePointerUp)
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    document.removeEventListener('pointerup', handlePointerUp)
  }

  const renderModel = () => {
    const { type, rotation, scale } = equipment
    const props = {
      position: [0, 0, 0] as [number, number, number],
      rotation,
      scale,
    }

    switch (type) {
      case 'speaker':
        return <SpeakerModel {...props} />
      case 'light':
        return <StageLightModel {...props} />
      case 'stage':
        return <StageModel {...props} />
      case 'microphone':
        return <MicrophoneModel {...props} />
      case 'truss':
        return <TrussModel {...props} />
      case 'platform':
        return <PlatformModel {...props} />
      default:
        return null
    }
  }

  return (
    <group
      ref={ref}
      position={equipment.position}
      onPointerDown={handlePointerDown}
    >
      {renderModel()}
      {selected && (
        <>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[1.2, 0.1, 1.2]} />
            <meshBasicMaterial color="yellow" transparent opacity={0.5} />
          </mesh>
          <mesh position={[0, 0, 0]} scale={equipment.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial
              color="cyan"
              wireframe
              transparent
              opacity={0.3}
            />
          </mesh>
        </>
      )}
      {isDragging && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[1.4, 0.1, 1.4]} />
          <meshBasicMaterial color="orange" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}
