export type EquipmentType =
  | 'speaker'
  | 'light'
  | 'stage'
  | 'microphone'
  | 'truss'
  | 'platform'
export type Position = [number, number, number]
export type Rotation = [number, number, number]
export type Scale = [number, number, number]

export interface Equipment {
  id: number
  type: EquipmentType
  position: Position
  rotation: Rotation
  scale: Scale
}

export interface SavedDesign {
  name: string
  equipment: Equipment[]
  date: string
}
