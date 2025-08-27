import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash2 } from 'lucide-react'
import { EquipmentType, SavedDesign } from '../types'

interface EquipmentLibraryProps {
  darkMode: boolean
  savedDesigns: SavedDesign[]
  addEquipment: (type: EquipmentType) => void
  loadDesign: (design: SavedDesign) => void
  deleteDesign: (index: number) => void
}

export function EquipmentLibrary({
  darkMode,
  savedDesigns,
  addEquipment,
  loadDesign,
  deleteDesign,
}: EquipmentLibraryProps) {
  return (
    <div className="p-4 h-full flex flex-col">
      <h2 className="text-lg font-semibold mb-4">Equipment Library</h2>
      <div className="grid grid-cols-2 gap-2 mb-6">
        {(
          [
            'speaker',
            'light',
            'stage',
            'microphone',
            'truss',
            'platform',
          ] as EquipmentType[]
        ).map((type) => (
          <Button
            key={type}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center"
            onClick={() => addEquipment(type)}
          >
            <div
              className={`w-12 h-12 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'} mb-2 rounded flex items-center justify-center`}
            >
              <span className="text-lg">
                {type === 'speaker' && '🔊'}
                {type === 'light' && '💡'}
                {type === 'stage' && '🎭'}
                {type === 'microphone' && '🎤'}
                {type === 'truss' && '⛓️'}
                {type === 'platform' && '🟫'}
              </span>
            </div>
            <span className="capitalize text-sm">{type}</span>
          </Button>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">Saved Designs</h2>
      <ScrollArea className="flex-1">
        {savedDesigns.length > 0 ? (
          savedDesigns.map((design, index) => (
            <div
              key={index}
              className={`p-2 border rounded mb-2 cursor-pointer ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <div className="flex justify-between items-start">
                <div
                  className="flex-1 truncate"
                  onClick={() => loadDesign(design)}
                >
                  <div className="font-medium truncate">{design.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(design.date).toLocaleDateString()}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteDesign(index)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500">No saved designs yet</p>
        )}
      </ScrollArea>
    </div>
  )
}
