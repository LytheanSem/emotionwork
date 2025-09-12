export type EquipmentType =
  | 'speaker'
  | 'light'
  | 'stage'
  | 'microphone'
  | 'truss'
  | 'platform'
  | 'ledPar'
  | 'movingHead'
  | 'djBooth'
  | 'laser'
  | 'smoke'
  | 'videoScreen'
  | 'fog'
  | 'strobe'
  | 'monitorSpeaker'
  | 'micStand'
  | 'subwoofer'
  | 'cableRamp'
  | 'powerDistribution'
  | 'stageRiser'
  | 'wirelessMic'
  | 'headsetMic'
  | 'lavalierMic'
  | 'lineArray'
  | 'mixer'
  | 'amplifier'
  | 'lightingConsole'
  | 'hazer'
  | 'bubbleMachine'
  | 'confettiCannon'
  | 'projector'
  | 'ledWall'
  | 'backdrop'
  | 'curtain'
  | 'scaffolding'
  | 'barricade'
  | 'cableTray'
  | 'generator'
  | 'ups'
  | 'wirelessTransmitter'
  | 'wirelessReceiver'

export type Position = [number, number, number]
export type Rotation = [number, number, number]
export type Scale = [number, number, number]

export interface Equipment {
  id: number
  type: EquipmentType
  position: Position
  rotation: Rotation
  scale: Scale
  color?: string // Custom color for the equipment
}

export interface SavedDesign {
  name: string
  equipment: Equipment[]
  date: string
}
