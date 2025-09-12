import { Equipment, EquipmentType } from '../types'

export interface StageTemplate {
  id: string
  name: string
  description: string
  category: 'wedding' | 'concert' | 'corporate' | 'party' | 'theater' | 'conference'
  equipment: Equipment[]
  thumbnail: string
}

// Helper function to create equipment with unique IDs
const createEquipment = (
  type: EquipmentType,
  position: [number, number, number],
  rotation: [number, number, number] = [0, 0, 0],
  scale: [number, number, number] = [1, 1, 1],
  color?: string,
  id?: number
): Equipment => ({
  id: id || Date.now() + Math.random() * 1000,
  type,
  position,
  rotation,
  scale,
  color,
})

export const stageTemplates: StageTemplate[] = [
  {
    id: 'empty-blank',
    name: 'Blank Canvas',
    description: 'Start from scratch with an empty stage - perfect for custom designs',
    category: 'corporate',
    thumbnail: '🎨',
    equipment: [],
  },
  {
    id: 'wedding-elegant',
    name: 'Dream Wedding',
    description: 'Romantic and elegant wedding setup with soft lighting, beautiful staging, and intimate atmosphere',
    category: 'wedding',
    thumbnail: '💒',
    equipment: [
      // Elegant stage with white finish
      createEquipment('stage', [0, 0, 0], [0, 0, 0], [6, 0.4, 5], '#ffffff'),
      createEquipment('stageRiser', [0, 0.4, 0], [0, 0, 0], [6, 0.3, 5], '#f8fafc'),
      
      // Graceful truss system with white finish
      createEquipment('truss', [-4.5, 3.5, -3.5], [0, 0, 0], [9, 0.4, 0.4], '#ffffff'),
      createEquipment('truss', [-4.5, 3.5, 3.5], [0, 0, 0], [9, 0.4, 0.4], '#ffffff'),
      createEquipment('truss', [-4.5, 3.5, 0], [0, 0, 0], [0.4, 0.4, 7], '#ffffff'),
      createEquipment('truss', [4.5, 3.5, -3.5], [0, 0, 0], [9, 0.4, 0.4], '#ffffff'),
      createEquipment('truss', [4.5, 3.5, 3.5], [0, 0, 0], [9, 0.4, 0.4], '#ffffff'),
      createEquipment('truss', [4.5, 3.5, 0], [0, 0, 0], [0.4, 0.4, 7], '#ffffff'),
      
      // Romantic LED Par lighting with warm colors
      createEquipment('ledPar', [-3.5, 4, -2.5], [0, Math.PI / 6, 0], [1.1, 1.1, 1.1]),
      createEquipment('ledPar', [3.5, 4, -2.5], [0, -Math.PI / 6, 0], [1.1, 1.1, 1.1]),
      createEquipment('ledPar', [-3.5, 4, 2.5], [0, Math.PI / 6, 0], [1.1, 1.1, 1.1]),
      createEquipment('ledPar', [3.5, 4, 2.5], [0, -Math.PI / 6, 0], [1.1, 1.1, 1.1]),
      createEquipment('ledPar', [-2, 4, -2.5], [0, Math.PI / 6, 0], [1.1, 1.1, 1.1]),
      createEquipment('ledPar', [2, 4, -2.5], [0, -Math.PI / 6, 0], [1.1, 1.1, 1.1]),
      createEquipment('ledPar', [-2, 4, 2.5], [0, Math.PI / 6, 0], [1.1, 1.1, 1.1]),
      createEquipment('ledPar', [2, 4, 2.5], [0, -Math.PI / 6, 0], [1.1, 1.1, 1.1]),
      
      // Soft spotlights for the couple
      createEquipment('light', [0, 4, 0], [0, 0, 0], [1.8, 1.2, 1.8]),
      createEquipment('light', [-1.5, 4, 0], [0, 0, 0], [1.2, 1, 1.2]),
      createEquipment('light', [1.5, 4, 0], [0, 0, 0], [1.2, 1, 1.2]),
      
      // Elegant audio system
      createEquipment('speaker', [-4, 2, -6], [0, Math.PI / 4, 0], [1.3, 1.3, 1.3], '#ffffff'),
      createEquipment('speaker', [4, 2, -6], [0, -Math.PI / 4, 0], [1.3, 1.3, 1.3], '#ffffff'),
      createEquipment('subwoofer', [-1.5, 0.8, -6], [0, 0, 0], [1.3, 1.3, 1.3], '#f8fafc'),
      createEquipment('subwoofer', [1.5, 0.8, -6], [0, 0, 0], [1.3, 1.3, 1.3], '#f8fafc'),
      
      // Monitor speakers for ceremony
      createEquipment('monitorSpeaker', [-2, 0.8, 2.5], [0, Math.PI, 0], [1.1, 1.1, 1.1], '#ffffff'),
      createEquipment('monitorSpeaker', [2, 0.8, 2.5], [0, Math.PI, 0], [1.1, 1.1, 1.1], '#ffffff'),
      
      // Wireless microphones for vows
      createEquipment('wirelessMic', [-1, 2.2, 0], [0, 0, 0], [0.9, 0.9, 0.9]),
      createEquipment('wirelessMic', [1, 2.2, 0], [0, 0, 0], [0.9, 0.9, 0.9]),
      createEquipment('micStand', [-1, 0, 0], [0, 0, 0], [1.1, 1.1, 1.1]),
      createEquipment('micStand', [1, 0, 0], [0, 0, 0], [1.1, 1.1, 1.1]),
      
      // Decorative backdrop
      createEquipment('backdrop', [0, 2.5, -3], [0, 0, 0], [7, 5, 0.1]),
      
      // Gentle atmospheric effects
      createEquipment('fog', [-2, 0.8, -5], [0, 0, 0], [1.1, 1.1, 1.1]),
      createEquipment('fog', [2, 0.8, -5], [0, 0, 0], [1.1, 1.1, 1.1]),
      createEquipment('hazer', [0, 0.8, -5], [0, 0, 0], [1.1, 1.1, 1.1]),
      
      // Power distribution
      createEquipment('powerDistribution', [-3, 0, -4], [0, 0, 0], [1.1, 1.1, 1.1]),
      createEquipment('powerDistribution', [3, 0, -4], [0, 0, 0], [1.1, 1.1, 1.1]),
      
      // Cable management
      createEquipment('cableRamp', [-1.5, 0, -3], [0, 0, 0], [3, 0.2, 0.6]),
      createEquipment('cableRamp', [1.5, 0, -3], [0, 0, 0], [3, 0.2, 0.6]),
    ],
  },
  {
    id: 'concert-rock',
    name: 'Epic Rock Concert',
    description: 'Professional rock concert setup with massive sound system, dynamic lighting, and atmospheric effects',
    category: 'concert',
    thumbnail: '🎸',
    equipment: [
      // Main stage with professional black finish
      createEquipment('stage', [0, 0, 0], [0, 0, 0], [10, 0.5, 6], '#1a1a1a'),
      createEquipment('stageRiser', [0, 0.5, 0], [0, 0, 0], [10, 0.4, 6], '#2c2c2c'),
      
      // Massive overhead truss system
      createEquipment('truss', [-6, 5, -5], [0, 0, 0], [12, 0.8, 0.8], '#2d3748'),
      createEquipment('truss', [-6, 5, 5], [0, 0, 0], [12, 0.8, 0.8], '#2d3748'),
      createEquipment('truss', [-6, 5, 0], [0, 0, 0], [0.8, 0.8, 10], '#2d3748'),
      createEquipment('truss', [6, 5, -5], [0, 0, 0], [12, 0.8, 0.8], '#2d3748'),
      createEquipment('truss', [6, 5, 5], [0, 0, 0], [12, 0.8, 0.8], '#2d3748'),
      createEquipment('truss', [6, 5, 0], [0, 0, 0], [0.8, 0.8, 10], '#2d3748'),
      
      // Side truss towers for additional lighting
      createEquipment('truss', [-7, 2.5, -3], [0, 0, 0], [0.8, 5, 0.8], '#1a202c'),
      createEquipment('truss', [-7, 2.5, 3], [0, 0, 0], [0.8, 5, 0.8], '#1a202c'),
      createEquipment('truss', [7, 2.5, -3], [0, 0, 0], [0.8, 5, 0.8], '#1a202c'),
      createEquipment('truss', [7, 2.5, 3], [0, 0, 0], [0.8, 5, 0.8], '#1a202c'),
      
      // Professional moving head lights - main truss
      createEquipment('movingHead', [-5, 5.5, -4], [0, Math.PI / 6, 0], [1.3, 1.3, 1.3]),
      createEquipment('movingHead', [-5, 5.5, 4], [0, -Math.PI / 6, 0], [1.3, 1.3, 1.3]),
      createEquipment('movingHead', [-3, 5.5, -4], [0, Math.PI / 6, 0], [1.3, 1.3, 1.3]),
      createEquipment('movingHead', [-3, 5.5, 4], [0, -Math.PI / 6, 0], [1.3, 1.3, 1.3]),
      createEquipment('movingHead', [0, 5.5, -4], [0, Math.PI / 6, 0], [1.3, 1.3, 1.3]),
      createEquipment('movingHead', [0, 5.5, 4], [0, -Math.PI / 6, 0], [1.3, 1.3, 1.3]),
      createEquipment('movingHead', [3, 5.5, -4], [0, Math.PI / 6, 0], [1.3, 1.3, 1.3]),
      createEquipment('movingHead', [3, 5.5, 4], [0, -Math.PI / 6, 0], [1.3, 1.3, 1.3]),
      createEquipment('movingHead', [5, 5.5, -4], [0, Math.PI / 6, 0], [1.3, 1.3, 1.3]),
      createEquipment('movingHead', [5, 5.5, 4], [0, -Math.PI / 6, 0], [1.3, 1.3, 1.3]),
      
      // Side tower moving heads
      createEquipment('movingHead', [-7, 4, -2], [0, Math.PI / 4, 0], [1.2, 1.2, 1.2]),
      createEquipment('movingHead', [-7, 4, 2], [0, -Math.PI / 4, 0], [1.2, 1.2, 1.2]),
      createEquipment('movingHead', [7, 4, -2], [0, Math.PI / 4, 0], [1.2, 1.2, 1.2]),
      createEquipment('movingHead', [7, 4, 2], [0, -Math.PI / 4, 0], [1.2, 1.2, 1.2]),
      
      // Strobe and laser effects
      createEquipment('strobe', [-2, 5.5, 0], [0, 0, 0], [1.3, 1.3, 1.3]),
      createEquipment('strobe', [2, 5.5, 0], [0, 0, 0], [1.3, 1.3, 1.3]),
      createEquipment('laser', [0, 5.5, 0], [0, 0, 0], [1.3, 1.3, 1.3]),
      
      // LED Par cans for color wash
      createEquipment('ledPar', [-4, 4, -6], [0, Math.PI / 2, 0], [1.3, 1.3, 1.3]),
      createEquipment('ledPar', [-2, 4, -6], [0, Math.PI / 2, 0], [1.3, 1.3, 1.3]),
      createEquipment('ledPar', [0, 4, -6], [0, Math.PI / 2, 0], [1.3, 1.3, 1.3]),
      createEquipment('ledPar', [2, 4, -6], [0, Math.PI / 2, 0], [1.3, 1.3, 1.3]),
      createEquipment('ledPar', [4, 4, -6], [0, Math.PI / 2, 0], [1.3, 1.3, 1.3]),
      createEquipment('ledPar', [-4, 4, 6], [0, -Math.PI / 2, 0], [1.3, 1.3, 1.3]),
      createEquipment('ledPar', [-2, 4, 6], [0, -Math.PI / 2, 0], [1.3, 1.3, 1.3]),
      createEquipment('ledPar', [0, 4, 6], [0, -Math.PI / 2, 0], [1.3, 1.3, 1.3]),
      createEquipment('ledPar', [2, 4, 6], [0, -Math.PI / 2, 0], [1.3, 1.3, 1.3]),
      createEquipment('ledPar', [4, 4, 6], [0, -Math.PI / 2, 0], [1.3, 1.3, 1.3]),
      
      // Massive line array sound system
      createEquipment('lineArray', [-6, 4, -8], [0, Math.PI / 4, 0], [1.8, 1.8, 1.8], '#dc2626'),
      createEquipment('lineArray', [6, 4, -8], [0, -Math.PI / 4, 0], [1.8, 1.8, 1.8], '#dc2626'),
      createEquipment('lineArray', [-6, 2, -8], [0, Math.PI / 4, 0], [1.8, 1.8, 1.8], '#dc2626'),
      createEquipment('lineArray', [6, 2, -8], [0, -Math.PI / 4, 0], [1.8, 1.8, 1.8], '#dc2626'),
      
      // Subwoofer array
      createEquipment('subwoofer', [-4, 1.2, -8], [0, 0, 0], [2, 2, 2], '#1a1a1a'),
      createEquipment('subwoofer', [-2, 1.2, -8], [0, 0, 0], [2, 2, 2], '#1a1a1a'),
      createEquipment('subwoofer', [0, 1.2, -8], [0, 0, 0], [2, 2, 2], '#1a1a1a'),
      createEquipment('subwoofer', [2, 1.2, -8], [0, 0, 0], [2, 2, 2], '#1a1a1a'),
      createEquipment('subwoofer', [4, 1.2, -8], [0, 0, 0], [2, 2, 2], '#1a1a1a'),
      
      // Monitor speakers for performers
      createEquipment('monitorSpeaker', [-3, 0.8, 3], [0, Math.PI, 0], [1.3, 1.3, 1.3], '#374151'),
      createEquipment('monitorSpeaker', [-1, 0.8, 3], [0, Math.PI, 0], [1.3, 1.3, 1.3], '#374151'),
      createEquipment('monitorSpeaker', [1, 0.8, 3], [0, Math.PI, 0], [1.3, 1.3, 1.3], '#374151'),
      createEquipment('monitorSpeaker', [3, 0.8, 3], [0, Math.PI, 0], [1.3, 1.3, 1.3], '#374151'),
      
      // Effects machines for atmosphere
      createEquipment('smoke', [-3, 0.8, -7], [0, 0, 0], [1.3, 1.3, 1.3]),
      createEquipment('smoke', [3, 0.8, -7], [0, 0, 0], [1.3, 1.3, 1.3]),
      createEquipment('fog', [-1, 0.8, -7], [0, 0, 0], [1.3, 1.3, 1.3]),
      createEquipment('fog', [1, 0.8, -7], [0, 0, 0], [1.3, 1.3, 1.3]),
      createEquipment('hazer', [0, 0.8, -7], [0, 0, 0], [1.3, 1.3, 1.3]),
      
      // Professional microphones and stands
      createEquipment('microphone', [-3, 2, 0], [0, 0, 0], [0.9, 0.9, 0.9]),
      createEquipment('microphone', [-1, 2, 0], [0, 0, 0], [0.9, 0.9, 0.9]),
      createEquipment('microphone', [1, 2, 0], [0, 0, 0], [0.9, 0.9, 0.9]),
      createEquipment('microphone', [3, 2, 0], [0, 0, 0], [0.9, 0.9, 0.9]),
      createEquipment('micStand', [-3, 0, 0], [0, 0, 0], [1.1, 1.1, 1.1]),
      createEquipment('micStand', [-1, 0, 0], [0, 0, 0], [1.1, 1.1, 1.1]),
      createEquipment('micStand', [1, 0, 0], [0, 0, 0], [1.1, 1.1, 1.1]),
      createEquipment('micStand', [3, 0, 0], [0, 0, 0], [1.1, 1.1, 1.1]),
      
      // Power distribution and infrastructure
      createEquipment('powerDistribution', [-5, 0, -4], [0, 0, 0], [1.3, 1.3, 1.3]),
      createEquipment('powerDistribution', [5, 0, -4], [0, 0, 0], [1.3, 1.3, 1.3]),
      createEquipment('cableRamp', [-2, 0, -3], [0, 0, 0], [4, 0.3, 0.8]),
      createEquipment('cableRamp', [2, 0, -3], [0, 0, 0], [4, 0.3, 0.8]),
    ],
  },
  {
    id: 'corporate-presentation',
    name: 'Corporate Presentation',
    description: 'Professional corporate event with clear audio and video',
    category: 'corporate',
    thumbnail: '🏢',
    equipment: [
      // Main stage
      createEquipment('stage', [0, 0, 0], [0, 0, 0], [5, 0.2, 3]),
      createEquipment('stageRiser', [0, 0.2, 0], [0, 0, 0], [5, 0.1, 3]),
      
      // Video screens
      createEquipment('videoScreen', [-2, 2, -2], [0, 0, 0], [2, 1.5, 0.2]),
      createEquipment('videoScreen', [2, 2, -2], [0, 0, 0], [2, 1.5, 0.2]),
      
      // Professional lighting
      createEquipment('light', [-2, 3, -1], [0, Math.PI / 4, 0], [1, 1, 1]),
      createEquipment('light', [2, 3, -1], [0, -Math.PI / 4, 0], [1, 1, 1]),
      createEquipment('light', [0, 3, 0], [0, 0, 0], [1.5, 1, 1.5]),
      createEquipment('ledPar', [-1, 2, -3], [0, Math.PI / 2, 0], [1, 1, 1]),
      createEquipment('ledPar', [1, 2, -3], [0, -Math.PI / 2, 0], [1, 1, 1]),
      
      // Clear audio system
      createEquipment('speaker', [-3, 1.5, -4], [0, Math.PI / 3, 0], [1, 1, 1]),
      createEquipment('speaker', [3, 1.5, -4], [0, -Math.PI / 3, 0], [1, 1, 1]),
      createEquipment('monitorSpeaker', [-1, 0.5, 1], [0, Math.PI, 0], [0.8, 0.8, 0.8]),
      createEquipment('monitorSpeaker', [1, 0.5, 1], [0, Math.PI, 0], [0.8, 0.8, 0.8]),
      
      // Microphones
      createEquipment('microphone', [0, 1.5, 0], [0, 0, 0], [0.8, 0.8, 0.8]),
      createEquipment('micStand', [0, 0, 0], [0, 0, 0], [1, 1, 1]),
      
      // Infrastructure
      createEquipment('powerDistribution', [-2, 0, -3], [0, 0, 0], [1, 1, 1]),
      createEquipment('cableRamp', [-1, 0, -2], [0, 0, 0], [2, 0.2, 0.5]),
      createEquipment('cableRamp', [1, 0, -2], [0, 0, 0], [2, 0.2, 0.5]),
    ],
  },
  {
    id: 'party-dance',
    name: 'Dance Party',
    description: 'High-energy dance party with DJ booth and party lighting',
    category: 'party',
    thumbnail: '🎉',
    equipment: [
      // Main stage
      createEquipment('stage', [0, 0, 0], [0, 0, 0], [4, 0.2, 3]),
      
      // DJ Booth
      createEquipment('djBooth', [0, 0.2, 0], [0, 0, 0], [2, 1, 1.5]),
      
      // Party lighting
      createEquipment('movingHead', [-2, 2.5, -2], [0, Math.PI / 4, 0], [1, 1, 1]),
      createEquipment('movingHead', [2, 2.5, -2], [0, -Math.PI / 4, 0], [1, 1, 1]),
      createEquipment('movingHead', [-2, 2.5, 2], [0, Math.PI / 4, 0], [1, 1, 1]),
      createEquipment('movingHead', [2, 2.5, 2], [0, -Math.PI / 4, 0], [1, 1, 1]),
      createEquipment('strobe', [0, 2.5, 0], [0, 0, 0], [1, 1, 1]),
      createEquipment('laser', [0, 2.5, -1], [0, 0, 0], [1, 1, 1]),
      
      // LED Par cans for color
      createEquipment('ledPar', [-1, 1.5, -3], [0, Math.PI / 2, 0], [1, 1, 1]),
      createEquipment('ledPar', [1, 1.5, -3], [0, -Math.PI / 2, 0], [1, 1, 1]),
      createEquipment('ledPar', [-1, 1.5, 3], [0, Math.PI / 2, 0], [1, 1, 1]),
      createEquipment('ledPar', [1, 1.5, 3], [0, -Math.PI / 2, 0], [1, 1, 1]),
      
      // Sound system
      createEquipment('speaker', [-3, 1.5, -4], [0, Math.PI / 4, 0], [1.5, 1.5, 1.5]),
      createEquipment('speaker', [3, 1.5, -4], [0, -Math.PI / 4, 0], [1.5, 1.5, 1.5]),
      createEquipment('subwoofer', [-1, 0.5, -4], [0, 0, 0], [1.5, 1.5, 1.5]),
      createEquipment('subwoofer', [1, 0.5, -4], [0, 0, 0], [1.5, 1.5, 1.5]),
      
      // Effects
      createEquipment('smoke', [-1, 0.5, -3], [0, 0, 0], [1, 1, 1]),
      createEquipment('smoke', [1, 0.5, -3], [0, 0, 0], [1, 1, 1]),
      createEquipment('fog', [0, 0.5, -3], [0, 0, 0], [1, 1, 1]),
    ],
  },
  {
    id: 'theater-drama',
    name: 'Theater Drama',
    description: 'Theatrical production with dramatic lighting and clear audio',
    category: 'theater',
    thumbnail: '🎭',
    equipment: [
      // Main stage
      createEquipment('stage', [0, 0, 0], [0, 0, 0], [6, 0.3, 4]),
      createEquipment('stageRiser', [0, 0.3, 0], [0, 0, 0], [6, 0.2, 4]),
      
      // Truss system
      createEquipment('truss', [-4, 3, -3], [0, 0, 0], [8, 0.5, 0.5]),
      createEquipment('truss', [-4, 3, 3], [0, 0, 0], [8, 0.5, 0.5]),
      createEquipment('truss', [-4, 3, 0], [0, 0, 0], [0.5, 0.5, 6]),
      
      // Theatrical lighting
      createEquipment('light', [-3, 3.5, -2], [0, Math.PI / 4, 0], [1.5, 1, 1.5]),
      createEquipment('light', [-3, 3.5, 2], [0, -Math.PI / 4, 0], [1.5, 1, 1.5]),
      createEquipment('light', [-1, 3.5, -2], [0, Math.PI / 4, 0], [1.5, 1, 1.5]),
      createEquipment('light', [-1, 3.5, 2], [0, -Math.PI / 4, 0], [1.5, 1, 1.5]),
      createEquipment('light', [1, 3.5, -2], [0, Math.PI / 4, 0], [1.5, 1, 1.5]),
      createEquipment('light', [1, 3.5, 2], [0, -Math.PI / 4, 0], [1.5, 1, 1.5]),
      createEquipment('light', [0, 3.5, 0], [0, 0, 0], [2, 1, 2]),
      
      // LED Par for color
      createEquipment('ledPar', [-2, 2, -3], [0, Math.PI / 2, 0], [1, 1, 1]),
      createEquipment('ledPar', [-2, 2, 3], [0, -Math.PI / 2, 0], [1, 1, 1]),
      createEquipment('ledPar', [2, 2, -3], [0, Math.PI / 2, 0], [1, 1, 1]),
      createEquipment('ledPar', [2, 2, 3], [0, -Math.PI / 2, 0], [1, 1, 1]),
      
      // Clear audio system
      createEquipment('speaker', [-4, 2, -5], [0, Math.PI / 4, 0], [1, 1, 1]),
      createEquipment('speaker', [4, 2, -5], [0, -Math.PI / 4, 0], [1, 1, 1]),
      createEquipment('monitorSpeaker', [-1, 0.5, 1], [0, Math.PI, 0], [0.8, 0.8, 0.8]),
      createEquipment('monitorSpeaker', [1, 0.5, 1], [0, Math.PI, 0], [0.8, 0.8, 0.8]),
      
      // Microphones
      createEquipment('microphone', [-1, 1.5, 0], [0, 0, 0], [0.8, 0.8, 0.8]),
      createEquipment('microphone', [1, 1.5, 0], [0, 0, 0], [0.8, 0.8, 0.8]),
      createEquipment('micStand', [-1, 0, 0], [0, 0, 0], [1, 1, 1]),
      createEquipment('micStand', [1, 0, 0], [0, 0, 0], [1, 1, 1]),
      
      // Effects
      createEquipment('fog', [-1, 0.5, -4], [0, 0, 0], [1, 1, 1]),
      createEquipment('fog', [1, 0.5, -4], [0, 0, 0], [1, 1, 1]),
    ],
  },
  {
    id: 'conference-tech',
    name: 'Tech Conference',
    description: 'Modern tech conference with multiple screens and professional setup',
    category: 'conference',
    thumbnail: '💻',
    equipment: [
      // Main stage
      createEquipment('stage', [0, 0, 0], [0, 0, 0], [6, 0.2, 4]),
      createEquipment('stageRiser', [0, 0.2, 0], [0, 0, 0], [6, 0.1, 4]),
      
      // Multiple video screens
      createEquipment('videoScreen', [-3, 2.5, -2], [0, 0, 0], [2.5, 1.8, 0.2]),
      createEquipment('videoScreen', [0, 2.5, -2], [0, 0, 0], [2.5, 1.8, 0.2]),
      createEquipment('videoScreen', [3, 2.5, -2], [0, 0, 0], [2.5, 1.8, 0.2]),
      
      // Professional lighting
      createEquipment('light', [-2, 3.5, -1], [0, Math.PI / 4, 0], [1, 1, 1]),
      createEquipment('light', [2, 3.5, -1], [0, -Math.PI / 4, 0], [1, 1, 1]),
      createEquipment('light', [0, 3.5, 0], [0, 0, 0], [1.5, 1, 1.5]),
      createEquipment('ledPar', [-1, 2, -3], [0, Math.PI / 2, 0], [1, 1, 1]),
      createEquipment('ledPar', [1, 2, -3], [0, -Math.PI / 2, 0], [1, 1, 1]),
      
      // Clear audio system
      createEquipment('speaker', [-4, 1.5, -5], [0, Math.PI / 3, 0], [1, 1, 1]),
      createEquipment('speaker', [4, 1.5, -5], [0, -Math.PI / 3, 0], [1, 1, 1]),
      createEquipment('monitorSpeaker', [-1, 0.5, 1], [0, Math.PI, 0], [0.8, 0.8, 0.8]),
      createEquipment('monitorSpeaker', [1, 0.5, 1], [0, Math.PI, 0], [0.8, 0.8, 0.8]),
      
      // Microphones
      createEquipment('microphone', [0, 1.5, 0], [0, 0, 0], [0.8, 0.8, 0.8]),
      createEquipment('micStand', [0, 0, 0], [0, 0, 0], [1, 1, 1]),
      
      // Infrastructure
      createEquipment('powerDistribution', [-2, 0, -3], [0, 0, 0], [1, 1, 1]),
      createEquipment('powerDistribution', [2, 0, -3], [0, 0, 0], [1, 1, 1]),
      createEquipment('cableRamp', [-1, 0, -2], [0, 0, 0], [2, 0.2, 0.5]),
      createEquipment('cableRamp', [1, 0, -2], [0, 0, 0], [2, 0.2, 0.5]),
    ],
  },
]

// Helper function to get templates by category
export const getTemplatesByCategory = (category: string) => {
  return stageTemplates.filter(template => template.category === category)
}

// Helper function to get all categories
export const getTemplateCategories = () => {
  return [...new Set(stageTemplates.map(template => template.category))]
}

// Helper function to load a template
export const loadTemplate = (templateId: string): Equipment[] => {
  const template = stageTemplates.find(t => t.id === templateId)
  if (!template) {
    throw new Error(`Template with id ${templateId} not found`)
  }
  
  // Generate new IDs for all equipment to avoid conflicts
  return template.equipment.map((equipment, index) => ({
    ...equipment,
    id: Date.now() + index * 1000 + Math.random() * 100,
  }))
}
