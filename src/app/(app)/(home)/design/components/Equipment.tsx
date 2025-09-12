// Equipment.tsx - Final fixed version
import { useState, useRef, useEffect } from 'react'
import { useFrame, useThree, ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { Equipment as EquipmentType } from '../types'
import {
  SpeakerModel,
  StageLightModel,
  StageModel,
  MicrophoneModel,
  TrussModel,
  PlatformModel,
  LEDParModel,
  MovingHeadModel,
  DJBoothModel,
  LaserModel,
  SmokeModel,
  VideoScreenModel,
  FogModel,
  StrobeModel,
  MonitorSpeakerModel,
  MicStandModel,
  SubwooferModel,
  CableRampModel,
  PowerDistributionModel,
  StageRiserModel,
  WirelessMicModel,
  HeadsetMicModel,
  LavalierMicModel,
  LineArrayModel,
  MixerModel,
  AmplifierModel,
  LightingConsoleModel,
  HazerModel,
  BubbleMachineModel,
  ConfettiCannonModel,
  ProjectorModel,
  LEDWallModel,
  BackdropModel,
  CurtainModel,
  ScaffoldingModel,
  BarricadeModel,
  CableTrayModel,
  GeneratorModel,
  UPSModel,
  WirelessTransmitterModel,
  WirelessReceiverModel,
} from './EquipmentModels'

export function Equipment({
  equipment,
  selected,
  onClick,
  onUpdate,
  onDragStart,
  onDragEnd,
  lightingColor,
}: {
  equipment: EquipmentType
  selected: boolean
  onClick: () => void
  onUpdate: (updates: Partial<EquipmentType>) => void
  onDragStart?: () => void
  onDragEnd?: () => void
  lightingColor?: string
}) {
  const ref = useRef<THREE.Group>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isPointerDown, setIsPointerDown] = useState(false)
  const [dragStartTime, setDragStartTime] = useState<number | null>(null)
  const [dragStartPosition, setDragStartPosition] = useState<THREE.Vector2 | null>(null)
  const { camera, raycaster, gl } = useThree()
  const [dragPlane] = useState(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
  )
  const [dragOffset, setDragOffset] = useState<THREE.Vector3 | null>(null)

  // Ensure equipment position stays locked when not dragging
  useEffect(() => {
    if (!isDragging && ref.current) {
      ref.current.position.set(equipment.position[0], equipment.position[1], equipment.position[2])
    }
  }, [equipment.position, isDragging])

  useFrame(({ mouse }) => {
    // Only move equipment if explicitly dragging (no automatic drag detection)
    if (!isDragging || !ref.current) return

    // Calculate mouse position in 3D space
    raycaster.setFromCamera(mouse, camera)
    const intersection = new THREE.Vector3()

    if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
      if (dragOffset) {
        intersection.sub(dragOffset)
      }

      // Snap to grid (0.5 units)
      const snappedPosition = new THREE.Vector3(
        Math.round(intersection.x * 2) / 2,
        equipment.position[1], // Keep original Y position for stacking
        Math.round(intersection.z * 2) / 2
      )

      // Only update if position actually changed
      const currentPos = ref.current.position
      if (currentPos.distanceTo(snappedPosition) > 0.01) {
        ref.current.position.copy(snappedPosition)
        onUpdate({
          position: [snappedPosition.x, snappedPosition.y, snappedPosition.z],
        })
      }
    }
  })

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()

    // Only select the equipment - no drag setup
    onClick()

    // Ensure equipment stays in its current position
    if (ref.current) {
      ref.current.position.set(equipment.position[0], equipment.position[1], equipment.position[2])
    }

    // Set up for potential dragging only if user holds and moves mouse
    setIsPointerDown(true)
    setDragStartTime(Date.now())
    
    // Get mouse position in normalized device coordinates (-1 to +1)
    const mouse = new THREE.Vector2(
      (e.clientX / window.innerWidth) * 2 - 1,
      -(e.clientY / window.innerHeight) * 2 + 1
    )
    setDragStartPosition(mouse.clone())

    // Calculate offset for smooth dragging (but don't start dragging yet)
    const worldPosition = new THREE.Vector3()
    ref.current?.getWorldPosition(worldPosition)

    raycaster.setFromCamera(mouse, camera)
    const intersection = new THREE.Vector3()
    if (raycaster.ray.intersectPlane(dragPlane, intersection)) {
      setDragOffset(intersection.clone().sub(worldPosition))
    }

    // Set cursor to default - no indication of dragging
    gl.domElement.style.cursor = 'default'
    document.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('pointermove', handlePointerMove)
  }

  const handlePointerMove = (e: PointerEvent) => {
    // Only start dragging if user is holding down and moves mouse significantly
    if (isPointerDown && !isDragging && dragStartTime && dragStartPosition) {
      const currentTime = Date.now()
      const timeDiff = currentTime - dragStartTime
      
      // Get current mouse position
      const currentMouse = new THREE.Vector2(
        (e.clientX / window.innerWidth) * 2 - 1,
        -(e.clientY / window.innerHeight) * 2 + 1
      )
      const mouseDiff = currentMouse.distanceTo(dragStartPosition)
      
      // Start dragging if user has held for 200ms AND moved mouse significantly
      if (timeDiff > 200 && mouseDiff > 0.1) {
        setIsDragging(true)
        onDragStart?.()
        gl.domElement.style.cursor = 'grabbing'
      }
    }
  }

  const handlePointerUp = () => {
    setIsDragging(false)
    setIsPointerDown(false)
    setDragStartTime(null)
    setDragStartPosition(null)
    setDragOffset(null)
    gl.domElement.style.cursor = 'default'
    onDragEnd?.()
    document.removeEventListener('pointerup', handlePointerUp)
    document.removeEventListener('pointermove', handlePointerMove)
  }

  const renderModel = () => {
    const { type, rotation, scale, color, id } = equipment
    const props = {
      position: [0, 0, 0] as [number, number, number],
      rotation,
      scale,
      color,
      id,
      lightingColor,
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
      case 'ledPar':
        return <LEDParModel {...props} />
      case 'movingHead':
        return <MovingHeadModel {...props} />
      case 'djBooth':
        return <DJBoothModel {...props} />
      case 'laser':
        return <LaserModel {...props} />
      case 'smoke':
        return <SmokeModel {...props} />
      case 'videoScreen':
        return <VideoScreenModel {...props} />
      case 'fog':
        return <FogModel {...props} />
      case 'strobe':
        return <StrobeModel {...props} />
      case 'monitorSpeaker':
        return <MonitorSpeakerModel {...props} />
      case 'micStand':
        return <MicStandModel {...props} />
      case 'subwoofer':
        return <SubwooferModel {...props} />
      case 'cableRamp':
        return <CableRampModel {...props} />
      case 'powerDistribution':
        return <PowerDistributionModel {...props} />
      case 'stageRiser':
        return <StageRiserModel {...props} />
      case 'wirelessMic':
        return <WirelessMicModel {...props} />
      case 'headsetMic':
        return <HeadsetMicModel {...props} />
      case 'lavalierMic':
        return <LavalierMicModel {...props} />
      case 'lineArray':
        return <LineArrayModel {...props} />
      case 'mixer':
        return <MixerModel {...props} />
      case 'amplifier':
        return <AmplifierModel {...props} />
      case 'lightingConsole':
        return <LightingConsoleModel {...props} />
      case 'hazer':
        return <HazerModel {...props} />
      case 'bubbleMachine':
        return <BubbleMachineModel {...props} />
      case 'confettiCannon':
        return <ConfettiCannonModel {...props} />
      case 'projector':
        return <ProjectorModel {...props} />
      case 'ledWall':
        return <LEDWallModel {...props} />
      case 'backdrop':
        return <BackdropModel {...props} />
      case 'curtain':
        return <CurtainModel {...props} />
      case 'scaffolding':
        return <ScaffoldingModel {...props} />
      case 'barricade':
        return <BarricadeModel {...props} />
      case 'cableTray':
        return <CableTrayModel {...props} />
      case 'generator':
        return <GeneratorModel {...props} />
      case 'ups':
        return <UPSModel {...props} />
      case 'wirelessTransmitter':
        return <WirelessTransmitterModel {...props} />
      case 'wirelessReceiver':
        return <WirelessReceiverModel {...props} />
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
