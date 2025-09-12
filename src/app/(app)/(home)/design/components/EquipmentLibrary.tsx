// EquipmentLibrary.tsx - Simplified without dark mode
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2, ChevronDown, ChevronRight, Star } from 'lucide-react'
import { EquipmentType, SavedDesign } from '../types'
import { useState } from 'react'
import { stageTemplates, loadTemplate } from '../templates/stageTemplates'

interface EquipmentLibraryProps {
  savedDesigns: SavedDesign[]
  addEquipment: (type: EquipmentType) => void
  loadDesign: (design: SavedDesign) => void
  deleteDesign: (index: number) => void
  loadTemplate?: (templateId: string) => void
}

const equipmentCategories = {
  Audio: [
    { type: 'speaker' as EquipmentType, label: 'Speaker', icon: '🔊' },
    { type: 'subwoofer' as EquipmentType, label: 'Subwoofer', icon: '🔈' },
    { type: 'monitorSpeaker' as EquipmentType, label: 'Monitor', icon: '📢' },
    { type: 'lineArray' as EquipmentType, label: 'Line Array', icon: '📡' },
    { type: 'microphone' as EquipmentType, label: 'Microphone', icon: '🎤' },
    { type: 'wirelessMic' as EquipmentType, label: 'Wireless Mic', icon: '🎙️' },
    { type: 'headsetMic' as EquipmentType, label: 'Headset Mic', icon: '🎧' },
    { type: 'lavalierMic' as EquipmentType, label: 'Lavalier Mic', icon: '📿' },
    { type: 'micStand' as EquipmentType, label: 'Mic Stand', icon: '🎙️' },
    { type: 'djBooth' as EquipmentType, label: 'DJ Booth', icon: '🎛️' },
    { type: 'mixer' as EquipmentType, label: 'Mixer', icon: '🎚️' },
    { type: 'amplifier' as EquipmentType, label: 'Amplifier', icon: '🔊' },
    { type: 'wirelessTransmitter' as EquipmentType, label: 'Wireless TX', icon: '📡' },
    { type: 'wirelessReceiver' as EquipmentType, label: 'Wireless RX', icon: '📻' },
  ],
  Lighting: [
    { type: 'light' as EquipmentType, label: 'Stage Light', icon: '💡' },
    { type: 'ledPar' as EquipmentType, label: 'LED Par', icon: '🌈' },
    { type: 'movingHead' as EquipmentType, label: 'Moving Head', icon: '🔄' },
    { type: 'strobe' as EquipmentType, label: 'Strobe', icon: '⚡' },
    { type: 'laser' as EquipmentType, label: 'Laser', icon: '🔴' },
    { type: 'lightingConsole' as EquipmentType, label: 'Lighting Console', icon: '🎛️' },
  ],
  Effects: [
    { type: 'smoke' as EquipmentType, label: 'Smoke Machine', icon: '💨' },
    { type: 'fog' as EquipmentType, label: 'Fog Machine', icon: '🌫️' },
    { type: 'hazer' as EquipmentType, label: 'Hazer', icon: '🌫️' },
    { type: 'bubbleMachine' as EquipmentType, label: 'Bubble Machine', icon: '🫧' },
    { type: 'confettiCannon' as EquipmentType, label: 'Confetti Cannon', icon: '🎊' },
  ],
  Video: [
    { type: 'videoScreen' as EquipmentType, label: 'Video Screen', icon: '📺' },
    { type: 'ledWall' as EquipmentType, label: 'LED Wall', icon: '🖥️' },
    { type: 'projector' as EquipmentType, label: 'Projector', icon: '📽️' },
  ],
  Structure: [
    { type: 'stage' as EquipmentType, label: 'Stage', icon: '🎭' },
    { type: 'platform' as EquipmentType, label: 'Platform', icon: '🟫' },
    { type: 'stageRiser' as EquipmentType, label: 'Stage Riser', icon: '📐' },
    { type: 'truss' as EquipmentType, label: 'Truss', icon: '⛓️' },
    { type: 'scaffolding' as EquipmentType, label: 'Scaffolding', icon: '🏗️' },
    { type: 'backdrop' as EquipmentType, label: 'Backdrop', icon: '🖼️' },
    { type: 'curtain' as EquipmentType, label: 'Curtain', icon: '🎭' },
    { type: 'barricade' as EquipmentType, label: 'Barricade', icon: '🚧' },
  ],
  Infrastructure: [
    {
      type: 'powerDistribution' as EquipmentType,
      label: 'Power Distribution',
      icon: '🔌',
    },
    { type: 'cableRamp' as EquipmentType, label: 'Cable Ramp', icon: '⚠️' },
    { type: 'cableTray' as EquipmentType, label: 'Cable Tray', icon: '📦' },
    { type: 'generator' as EquipmentType, label: 'Generator', icon: '⚡' },
    { type: 'ups' as EquipmentType, label: 'UPS', icon: '🔋' },
  ],
}

export function EquipmentLibrary({
  savedDesigns,
  addEquipment,
  loadDesign,
  deleteDesign,
  loadTemplate,
}: EquipmentLibraryProps) {
  const [expandedCategories, setExpandedCategories] = useState<
    Record<string, boolean>
  >({
    Templates: true,
    Audio: true,
    Lighting: true,
    Effects: false,
    Video: false,
    Structure: true,
    Infrastructure: false,
  })

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }))
  }

  const handleLoadTemplate = (templateId: string) => {
    if (loadTemplate) {
      try {
        const templateEquipment = loadTemplate(templateId)
        // Clear current equipment and load template
        if (confirm('This will replace your current design. Continue?')) {
          loadTemplate(templateId)
        }
      } catch (error) {
        console.error('Error loading template:', error)
        alert('Failed to load template. Please try again.')
      }
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex-shrink-0">
        <h2 className="text-lg font-medium text-gray-900">Equipment</h2>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-6">
          {/* Templates Section */}
          <div className="mb-8">
            <button
              onClick={() => toggleCategory('Templates')}
              className="w-full flex items-center justify-between p-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Templates
              </h3>
              {expandedCategories.Templates ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>

          {expandedCategories.Templates && (
            <div className="grid grid-cols-1 gap-3 mt-4">
              {stageTemplates.map((template) => (
                <Button
                  key={template.id}
                  variant="outline"
                  className="h-14 flex items-center gap-3 p-3 text-left border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                  onClick={() => handleLoadTemplate(template.id)}
                >
                  <div className="text-lg">{template.thumbnail}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{template.name}</div>
                    <div className="text-gray-500 text-xs">{template.category}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
          </div>

          {/* Equipment Categories */}
          {Object.entries(equipmentCategories).map(([category, items]) => (
            <div key={category} className="mb-8">
              <button
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between p-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                <h3 className="text-sm font-medium">{category}</h3>
                {expandedCategories[category] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {expandedCategories[category] && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {items.map(({ type, label, icon }) => (
                    <Button
                      key={type}
                      variant="outline"
                      className="h-16 flex flex-col items-center justify-center text-xs border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
                      onClick={() => addEquipment(type)}
                    >
                      <div className="w-6 h-6 mb-1 flex items-center justify-center">
                        <span className="text-sm">{icon}</span>
                      </div>
                      <span className="text-center leading-tight font-medium">{label}</span>
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="border-t border-gray-100 p-6 flex-shrink-0">
        <h3 className="text-sm font-medium mb-4 text-gray-900">Saved Designs</h3>
        <ScrollArea className="max-h-40">
          {savedDesigns.length > 0 ? (
            savedDesigns.map((design, index) => (
              <div
                key={index}
                className="p-3 border border-gray-200 rounded-lg mb-2 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div
                    className="flex-1 truncate"
                    onClick={() => loadDesign(design)}
                  >
                    <div className="font-medium truncate text-sm">{design.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(design.date).toLocaleDateString()}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteDesign(index)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500">No saved designs</p>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}
