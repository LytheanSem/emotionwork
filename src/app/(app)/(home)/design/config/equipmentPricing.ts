import { EquipmentType } from '../types'

export interface EquipmentPricing {
  type: EquipmentType
  name: string
  dailyRate: number
  weeklyRate: number
  monthlyRate: number
  currency: string
  category: string
}

export const equipmentPricing: EquipmentPricing[] = [
  // Audio Equipment
  { type: 'speaker', name: 'Professional Speaker', dailyRate: 25, weeklyRate: 150, monthlyRate: 500, currency: 'USD', category: 'Audio' },
  { type: 'subwoofer', name: 'Subwoofer', dailyRate: 35, weeklyRate: 200, monthlyRate: 650, currency: 'USD', category: 'Audio' },
  { type: 'monitorSpeaker', name: 'Monitor Speaker', dailyRate: 20, weeklyRate: 120, monthlyRate: 400, currency: 'USD', category: 'Audio' },
  { type: 'lineArray', name: 'Line Array System', dailyRate: 150, weeklyRate: 800, monthlyRate: 2500, currency: 'USD', category: 'Audio' },
  { type: 'microphone', name: 'Professional Microphone', dailyRate: 15, weeklyRate: 80, monthlyRate: 250, currency: 'USD', category: 'Audio' },
  { type: 'wirelessMic', name: 'Wireless Microphone', dailyRate: 25, weeklyRate: 140, monthlyRate: 450, currency: 'USD', category: 'Audio' },
  { type: 'headsetMic', name: 'Headset Microphone', dailyRate: 20, weeklyRate: 110, monthlyRate: 350, currency: 'USD', category: 'Audio' },
  { type: 'lavalierMic', name: 'Lavalier Microphone', dailyRate: 18, weeklyRate: 100, monthlyRate: 320, currency: 'USD', category: 'Audio' },
  { type: 'micStand', name: 'Microphone Stand', dailyRate: 8, weeklyRate: 40, monthlyRate: 120, currency: 'USD', category: 'Audio' },
  { type: 'djBooth', name: 'DJ Booth', dailyRate: 80, weeklyRate: 450, monthlyRate: 1400, currency: 'USD', category: 'Audio' },
  { type: 'mixer', name: 'Audio Mixer', dailyRate: 40, weeklyRate: 220, monthlyRate: 700, currency: 'USD', category: 'Audio' },
  { type: 'amplifier', name: 'Power Amplifier', dailyRate: 30, weeklyRate: 160, monthlyRate: 500, currency: 'USD', category: 'Audio' },
  { type: 'wirelessTransmitter', name: 'Wireless Transmitter', dailyRate: 20, weeklyRate: 110, monthlyRate: 350, currency: 'USD', category: 'Audio' },
  { type: 'wirelessReceiver', name: 'Wireless Receiver', dailyRate: 20, weeklyRate: 110, monthlyRate: 350, currency: 'USD', category: 'Audio' },

  // Lighting Equipment
  { type: 'light', name: 'Stage Light', dailyRate: 20, weeklyRate: 110, monthlyRate: 350, currency: 'USD', category: 'Lighting' },
  { type: 'ledPar', name: 'LED Par Light', dailyRate: 25, weeklyRate: 140, monthlyRate: 450, currency: 'USD', category: 'Lighting' },
  { type: 'movingHead', name: 'Moving Head Light', dailyRate: 45, weeklyRate: 250, monthlyRate: 800, currency: 'USD', category: 'Lighting' },
  { type: 'strobe', name: 'Strobe Light', dailyRate: 30, weeklyRate: 160, monthlyRate: 500, currency: 'USD', category: 'Lighting' },
  { type: 'laser', name: 'Laser System', dailyRate: 80, weeklyRate: 450, monthlyRate: 1400, currency: 'USD', category: 'Lighting' },
  { type: 'lightingConsole', name: 'Lighting Console', dailyRate: 60, weeklyRate: 320, monthlyRate: 1000, currency: 'USD', category: 'Lighting' },

  // Effects Equipment
  { type: 'smoke', name: 'Smoke Machine', dailyRate: 25, weeklyRate: 140, monthlyRate: 450, currency: 'USD', category: 'Effects' },
  { type: 'fog', name: 'Fog Machine', dailyRate: 30, weeklyRate: 160, monthlyRate: 500, currency: 'USD', category: 'Effects' },
  { type: 'hazer', name: 'Hazer', dailyRate: 35, weeklyRate: 190, monthlyRate: 600, currency: 'USD', category: 'Effects' },
  { type: 'bubbleMachine', name: 'Bubble Machine', dailyRate: 20, weeklyRate: 110, monthlyRate: 350, currency: 'USD', category: 'Effects' },
  { type: 'confettiCannon', name: 'Confetti Cannon', dailyRate: 40, weeklyRate: 220, monthlyRate: 700, currency: 'USD', category: 'Effects' },

  // Video Equipment
  { type: 'videoScreen', name: 'Video Screen', dailyRate: 50, weeklyRate: 280, monthlyRate: 900, currency: 'USD', category: 'Video' },
  { type: 'ledWall', name: 'LED Wall', dailyRate: 200, weeklyRate: 1100, monthlyRate: 3500, currency: 'USD', category: 'Video' },
  { type: 'projector', name: 'Projector', dailyRate: 40, weeklyRate: 220, monthlyRate: 700, currency: 'USD', category: 'Video' },

  // Structure Equipment
  { type: 'stage', name: 'Stage Platform', dailyRate: 60, weeklyRate: 320, monthlyRate: 1000, currency: 'USD', category: 'Structure' },
  { type: 'platform', name: 'Platform', dailyRate: 40, weeklyRate: 220, monthlyRate: 700, currency: 'USD', category: 'Structure' },
  { type: 'stageRiser', name: 'Stage Riser', dailyRate: 30, weeklyRate: 160, monthlyRate: 500, currency: 'USD', category: 'Structure' },
  { type: 'truss', name: 'Truss System', dailyRate: 25, weeklyRate: 140, monthlyRate: 450, currency: 'USD', category: 'Structure' },
  { type: 'scaffolding', name: 'Scaffolding', dailyRate: 35, weeklyRate: 190, monthlyRate: 600, currency: 'USD', category: 'Structure' },
  { type: 'backdrop', name: 'Backdrop', dailyRate: 20, weeklyRate: 110, monthlyRate: 350, currency: 'USD', category: 'Structure' },
  { type: 'curtain', name: 'Curtain', dailyRate: 15, weeklyRate: 80, monthlyRate: 250, currency: 'USD', category: 'Structure' },
  { type: 'barricade', name: 'Barricade', dailyRate: 10, weeklyRate: 50, monthlyRate: 150, currency: 'USD', category: 'Structure' },

  // Infrastructure Equipment
  { type: 'powerDistribution', name: 'Power Distribution', dailyRate: 40, weeklyRate: 220, monthlyRate: 700, currency: 'USD', category: 'Infrastructure' },
  { type: 'cableRamp', name: 'Cable Ramp', dailyRate: 8, weeklyRate: 40, monthlyRate: 120, currency: 'USD', category: 'Infrastructure' },
  { type: 'cableTray', name: 'Cable Tray', dailyRate: 12, weeklyRate: 60, monthlyRate: 180, currency: 'USD', category: 'Infrastructure' },
  { type: 'generator', name: 'Generator', dailyRate: 100, weeklyRate: 550, monthlyRate: 1750, currency: 'USD', category: 'Infrastructure' },
  { type: 'ups', name: 'UPS System', dailyRate: 50, weeklyRate: 280, monthlyRate: 900, currency: 'USD', category: 'Infrastructure' },
]

export function getEquipmentPricing(type: EquipmentType): EquipmentPricing | undefined {
  return equipmentPricing.find(pricing => pricing.type === type)
}

export function calculateTotalCost(equipment: Array<{ type: EquipmentType; quantity?: number }>, duration: 'daily' | 'weekly' | 'monthly' = 'daily'): {
  total: number
  breakdown: Array<{
    type: EquipmentType
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
    category: string
  }>
  currency: string
} {
  const breakdown: Array<{
    type: EquipmentType
    name: string
    quantity: number
    unitPrice: number
    totalPrice: number
    category: string
  }> = []

  let total = 0
  let currency = 'USD'

  // Count equipment by type
  const equipmentCount: Record<EquipmentType, number> = {} as Record<EquipmentType, number>
  equipment.forEach(item => {
    const quantity = item.quantity || 1
    equipmentCount[item.type] = (equipmentCount[item.type] || 0) + quantity
  })

  // Calculate costs
  Object.entries(equipmentCount).forEach(([type, quantity]) => {
    const pricing = getEquipmentPricing(type as EquipmentType)
    if (pricing) {
      const unitPrice = duration === 'daily' ? pricing.dailyRate : 
                       duration === 'weekly' ? pricing.weeklyRate : 
                       pricing.monthlyRate
      
      const totalPrice = unitPrice * quantity
      total += totalPrice
      currency = pricing.currency

      breakdown.push({
        type: type as EquipmentType,
        name: pricing.name,
        quantity,
        unitPrice,
        totalPrice,
        category: pricing.category
      })
    }
  })

  return { total, breakdown, currency }
}
