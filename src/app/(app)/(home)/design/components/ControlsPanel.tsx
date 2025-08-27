import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { RotateCw, Move3d, ZoomIn, ZoomOut, Trash2 } from 'lucide-react'
import { Equipment } from '../types'

interface ControlsPanelProps {
  darkMode: boolean
  actionMode: string
  setActionMode: (mode: 'move' | 'rotate' | 'scale') => void
  selectedEquipment: Equipment | undefined
  rotateSelected: () => void
  scaleSelected: (axis: 'x' | 'y' | 'z' | 'all', delta: number) => void
  setScaleValue: (axis: 'x' | 'y' | 'z' | 'all', value: number) => void
  resetScale: () => void
  deleteSelected: () => void
}

export function ControlsPanel({
  darkMode,
  actionMode,
  setActionMode,
  selectedEquipment,
  rotateSelected,
  scaleSelected,
  setScaleValue,
  resetScale,
  deleteSelected,
}: ControlsPanelProps) {
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Controls</h2>

      <div className="space-y-4">
        {/* Action Mode */}
        <div>
          <Label>Action Mode</Label>
          <div className="flex gap-1 mt-2">
            <Button
              variant={actionMode === 'move' ? 'default' : 'outline'}
              onClick={() => setActionMode('move')}
              className="flex-1 text-xs"
              size="sm"
            >
              <Move3d className="mr-1 h-3 w-3" /> Move
            </Button>
            <Button
              variant={actionMode === 'rotate' ? 'default' : 'outline'}
              onClick={() => setActionMode('rotate')}
              className="flex-1 text-xs"
              size="sm"
            >
              <RotateCw className="mr-1 h-3 w-3" /> Rotate
            </Button>
            <Button
              variant={actionMode === 'scale' ? 'default' : 'outline'}
              onClick={() => setActionMode('scale')}
              className="flex-1 text-xs"
              size="sm"
            >
              <ZoomIn className="mr-1 h-3 w-3" /> Scale
            </Button>
          </div>
        </div>

        {selectedEquipment && (
          <>
            {/* Equipment Info */}
            <div>
              <Label>Selected Equipment</Label>
              <div
                className={`mt-2 p-3 border rounded ${darkMode ? 'bg-blue-900 border-blue-700 text-blue-100' : 'bg-blue-50 text-blue-800'} capitalize font-medium`}
              >
                {selectedEquipment.type}
              </div>
            </div>

            {/* Position Info */}
            <div>
              <Label>Position</Label>
              <div
                className={`mt-2 text-sm font-mono ${darkMode ? 'bg-gray-700 text-gray-200' : 'bg-gray-50 text-gray-600'} p-2 rounded`}
              >
                X: {selectedEquipment.position[0].toFixed(2)}
                <br />
                Y: {selectedEquipment.position[1].toFixed(2)}
                <br />
                Z: {selectedEquipment.position[2].toFixed(2)}
              </div>
            </div>

            {/* Scale Controls */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Scale Controls</Label>
                <Button variant="outline" size="sm" onClick={resetScale}>
                  Reset
                </Button>
              </div>

              {/* Uniform Scale */}
              <div>
                <Label className="text-sm">Uniform Scale</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Slider
                    value={[selectedEquipment.scale[0]]}
                    onValueChange={(value) => setScaleValue('all', value[0])}
                    min={0.1}
                    max={3}
                    step={0.1}
                    className="flex-1"
                  />
                  <span
                    className={`text-sm font-mono w-12 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}
                  >
                    {selectedEquipment.scale[0].toFixed(1)}
                  </span>
                </div>
              </div>

              {/* Individual Axis Controls */}
              {(['x', 'y', 'z'] as const).map((axis, index) => (
                <div key={axis}>
                  <Label className="text-sm">{axis.toUpperCase()} Scale</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scaleSelected(axis, -0.1)}
                    >
                      <ZoomOut className="h-3 w-3" />
                    </Button>
                    <Slider
                      value={[selectedEquipment.scale[index]]}
                      onValueChange={(value) => setScaleValue(axis, value[0])}
                      min={0.1}
                      max={3}
                      step={0.1}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => scaleSelected(axis, 0.1)}
                    >
                      <ZoomIn className="h-3 w-3" />
                    </Button>
                    <span
                      className={`text-sm font-mono w-12 ${darkMode ? 'text-gray-200' : 'text-gray-600'}`}
                    >
                      {selectedEquipment.scale[index].toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Quick Scale Buttons */}
              <div className="grid grid-cols-3 gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScaleValue('all', 0.5)}
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScaleValue('all', 1)}
                >
                  100%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScaleValue('all', 2)}
                >
                  200%
                </Button>
              </div>
            </div>

            {/* Rotation */}
            <Button
              variant="outline"
              className="w-full"
              onClick={rotateSelected}
            >
              <RotateCw className="mr-2 h-4 w-4" /> Rotate 45°
            </Button>

            {/* Delete */}
            <Button
              variant="destructive"
              className="w-full"
              onClick={deleteSelected}
            >
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
