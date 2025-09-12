import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { useState, useEffect } from 'react'
import {
  RotateCw,
  Move3d,
  ZoomIn,
  ZoomOut,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Palette,
  Ruler,
  Maximize,
  Download,
} from 'lucide-react'
import { Equipment } from '../types'

interface ControlsPanelProps {
  selectedEquipment: Equipment | undefined
  rotateSelected: () => void
  scaleSelected: (axis: 'x' | 'y' | 'z' | 'all', delta: number) => void
  setScaleValue: (axis: 'x' | 'y' | 'z' | 'all', value: number) => void
  resetScale: () => void
  deleteSelected: () => void
  moveUpSelected: () => void
  moveDownSelected: () => void
  moveLeftSelected: () => void
  moveRightSelected: () => void
  updateEquipmentColor: (id: number, color: string) => void
  venueDimensions: { width: number; depth: number; height: number }
  setVenueDimensions: (dimensions: { width: number; depth: number; height: number }) => void
  scaleDesignToVenue: () => void
  venueBoundaryVisible: boolean
  setVenueBoundaryVisible: (visible: boolean) => void
  lightingColor: string
  setLightingColor: (color: string) => void
  exportDesign: (format: 'png' | 'jpeg' | 'svg' | 'pdf') => void
}

export default function ControlsPanel({
  selectedEquipment,
  rotateSelected,
  scaleSelected,
  setScaleValue,
  resetScale,
  deleteSelected,
  moveUpSelected,
  moveDownSelected,
  moveLeftSelected,
  moveRightSelected,
  updateEquipmentColor,
  venueDimensions,
  setVenueDimensions,
  scaleDesignToVenue,
  venueBoundaryVisible,
  setVenueBoundaryVisible,
  lightingColor,
  setLightingColor,
  exportDesign,
}: ControlsPanelProps) {
  // Local state for input values to allow proper editing
  const [widthInput, setWidthInput] = useState(venueDimensions.width.toString())
  const [depthInput, setDepthInput] = useState(venueDimensions.depth.toString())
  const [heightInput, setHeightInput] = useState(venueDimensions.height.toString())

  // Update local state when venueDimensions change
  useEffect(() => {
    setWidthInput(venueDimensions.width.toString())
    setDepthInput(venueDimensions.depth.toString())
    setHeightInput(venueDimensions.height.toString())
  }, [venueDimensions])
  return (
    <div className="p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Controls</h2>

      <div className="space-y-4">

        {selectedEquipment && (
          <>
            {/* Equipment Info */}
            <div>
              <Label>Selected Equipment</Label>
              <div className="mt-2 p-3 border rounded bg-blue-50 text-blue-800 capitalize font-medium">
                {selectedEquipment.type}
              </div>
            </div>

            {/* Position Info */}
            <div>
              <Label>Position</Label>
              <div className="mt-2 text-sm font-mono bg-gray-50 text-gray-600 p-2 rounded">
                X: {selectedEquipment.position[0].toFixed(2)}
                <br />
                Y: {selectedEquipment.position[1].toFixed(2)}
                <br />
                Z: {selectedEquipment.position[2].toFixed(2)}
              </div>
            </div>

            {/* Movement Controls */}
            <div>
              <Label>Movement Controls</Label>
              <div className="grid grid-cols-2 gap-1 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={moveUpSelected}
                  className="flex-1"
                >
                  <ArrowUp className="h-3 w-3 mr-1" /> Up
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={moveDownSelected}
                  className="flex-1"
                >
                  <ArrowDown className="h-3 w-3 mr-1" /> Down
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={moveLeftSelected}
                  className="flex-1"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" /> Left
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={moveRightSelected}
                  className="flex-1"
                >
                  <ArrowRight className="h-3 w-3 mr-1" /> Right
                </Button>
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
                  <span className="text-sm font-mono w-12 text-gray-600">
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
                    <span className="text-sm font-mono w-12 text-gray-600">
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

            {/* Enhanced Color Picker */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Equipment Color
              </Label>
              
              {/* Custom Color Input */}
              <div className="flex gap-2">
                <input
                  type="color"
                  value={selectedEquipment.color || '#2c2c2c'}
                  onChange={(e) => updateEquipmentColor(selectedEquipment.id, e.target.value)}
                  className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateEquipmentColor(selectedEquipment.id, '')}
                  className="flex-1"
                >
                  Reset
                </Button>
              </div>

              {/* Color Presets */}
              <div className="space-y-2">
                <Label className="text-sm text-gray-600">Color Presets</Label>
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { name: 'Black', color: '#1a1a1a' },
                    { name: 'White', color: '#ffffff' },
                    { name: 'Gray', color: '#6b7280' },
                    { name: 'Red', color: '#ef4444' },
                    { name: 'Blue', color: '#3b82f6' },
                    { name: 'Green', color: '#10b981' },
                    { name: 'Yellow', color: '#f59e0b' },
                    { name: 'Purple', color: '#8b5cf6' },
                    { name: 'Pink', color: '#ec4899' },
                    { name: 'Orange', color: '#f97316' },
                    { name: 'Indigo', color: '#6366f1' },
                    { name: 'Teal', color: '#14b8a6' },
                  ].map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => updateEquipmentColor(selectedEquipment.id, preset.color)}
                      className="w-8 h-8 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>

              {/* Equipment-Specific Color Themes */}
              {selectedEquipment.type === 'speaker' && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Speaker Themes</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { name: 'Professional', color: '#1a1a1a' },
                      { name: 'Concert', color: '#dc2626' },
                      { name: 'Studio', color: '#374151' },
                      { name: 'Modern', color: '#7c3aed' },
                    ].map((theme) => (
                      <Button
                        key={theme.name}
                        variant="outline"
                        size="sm"
                        onClick={() => updateEquipmentColor(selectedEquipment.id, theme.color)}
                        className="text-xs"
                      >
                        {theme.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedEquipment.type === 'stage' && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Stage Themes</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { name: 'Wood', color: '#8B4513' },
                      { name: 'Black', color: '#1a1a1a' },
                      { name: 'White', color: '#ffffff' },
                      { name: 'Blue', color: '#1a365d' },
                    ].map((theme) => (
                      <Button
                        key={theme.name}
                        variant="outline"
                        size="sm"
                        onClick={() => updateEquipmentColor(selectedEquipment.id, theme.color)}
                        className="text-xs"
                      >
                        {theme.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {selectedEquipment.type === 'truss' && (
                <div className="space-y-2">
                  <Label className="text-sm text-gray-600">Truss Themes</Label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      { name: 'Steel', color: '#2d3748' },
                      { name: 'Black', color: '#1a202c' },
                      { name: 'Blue', color: '#2b6cb0' },
                      { name: 'Bronze', color: '#744210' },
                    ].map((theme) => (
                      <Button
                        key={theme.name}
                        variant="outline"
                        size="sm"
                        onClick={() => updateEquipmentColor(selectedEquipment.id, theme.color)}
                        className="text-xs"
                      >
                        {theme.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Venue Dimensions Section */}
        <div className="border-t pt-4">
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
            <Ruler className="h-4 w-4" />
            Venue Dimensions
          </h3>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="venue-width">Width (meters)</Label>
              <Input
                id="venue-width"
                type="number"
                value={widthInput}
                onChange={(e) => {
                  setWidthInput(e.target.value)
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value)
                  if (!isNaN(value) && value >= 5 && value <= 100) {
                    setVenueDimensions({
                      ...venueDimensions,
                      width: value
                    })
                  } else {
                    setWidthInput(venueDimensions.width.toString())
                  }
                }}
                min="5"
                max="100"
                step="0.5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="venue-depth">Depth (meters)</Label>
              <Input
                id="venue-depth"
                type="number"
                value={depthInput}
                onChange={(e) => {
                  setDepthInput(e.target.value)
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value)
                  if (!isNaN(value) && value >= 5 && value <= 100) {
                    setVenueDimensions({
                      ...venueDimensions,
                      depth: value
                    })
                  } else {
                    setDepthInput(venueDimensions.depth.toString())
                  }
                }}
                min="5"
                max="100"
                step="0.5"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="venue-height">Height (meters)</Label>
              <Input
                id="venue-height"
                type="number"
                value={heightInput}
                onChange={(e) => {
                  setHeightInput(e.target.value)
                }}
                onBlur={(e) => {
                  const value = parseFloat(e.target.value)
                  if (!isNaN(value) && value >= 3 && value <= 50) {
                    setVenueDimensions({
                      ...venueDimensions,
                      height: value
                    })
                  } else {
                    setHeightInput(venueDimensions.height.toString())
                  }
                }}
                min="3"
                max="50"
                step="0.5"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                onClick={scaleDesignToVenue}
                className="w-full"
                variant="outline"
              >
                <Maximize className="mr-2 h-4 w-4" />
                Scale Design
              </Button>
              <Button
                onClick={() => {
                  const newDimensions = {
                    width: 20,
                    depth: 15,
                    height: 8
                  }
                  setVenueDimensions(newDimensions)
                  setWidthInput('20')
                  setDepthInput('15')
                  setHeightInput('8')
                }}
                className="w-full"
                variant="outline"
              >
                Reset
              </Button>
            </div>
          </div>
        </div>

        {/* Stage Settings Section */}
        <div className="border-t pt-4">
          <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Stage Settings
          </h3>
          
          <div className="space-y-4">
            {/* Venue Boundary Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="venue-boundary-toggle">Show Venue Boundary</Label>
                <p className="text-sm text-gray-500">
                  Toggle the entire venue boundary cube (walls, floor, and lines)
                </p>
              </div>
              <Switch
                id="venue-boundary-toggle"
                checked={venueBoundaryVisible}
                onCheckedChange={setVenueBoundaryVisible}
              />
            </div>

            {/* Lighting Color Picker - Only show when lighting equipment is selected */}
            {selectedEquipment && ['light', 'ledPar', 'movingHead', 'strobe', 'laser'].includes(selectedEquipment.type) && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="lighting-color">Lighting Animation Color</Label>
                  <p className="text-sm text-gray-500">
                    Choose the color for {selectedEquipment.type === 'light' ? 'Stage Light' : 
                    selectedEquipment.type === 'ledPar' ? 'LED Par' :
                    selectedEquipment.type === 'movingHead' ? 'Moving Head' :
                    selectedEquipment.type === 'strobe' ? 'Strobe' :
                    selectedEquipment.type === 'laser' ? 'Laser' : 'Lighting'} animations
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="lighting-color"
                    type="color"
                    value={lightingColor}
                    onChange={(e) => setLightingColor(e.target.value)}
                    className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Input
                      value={lightingColor}
                      onChange={(e) => setLightingColor(e.target.value)}
                      placeholder="#ff0000"
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
                    '#ff8000', '#8000ff', '#00ff80', '#ff0080', '#80ff00', '#0080ff'
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => setLightingColor(color)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Equipment Color Picker - Show for colorable equipment */}
            {selectedEquipment && [
              'platform', 'stageRiser', 'backdrop', 'curtain', 'barricade', 'scaffolding',
              'videoScreen', 'ledWall', 'smoke', 'fog', 'hazer', 'bubbleMachine', 'confettiCannon',
              'speaker', 'djBooth', 'mixer', 'amplifier', 'generator', 'ups'
            ].includes(selectedEquipment.type) && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="equipment-color">Equipment Color</Label>
                  <p className="text-sm text-gray-500">
                    Choose the color for {selectedEquipment.type === 'platform' ? 'Platform' :
                    selectedEquipment.type === 'stageRiser' ? 'Stage Riser' :
                    selectedEquipment.type === 'backdrop' ? 'Backdrop' :
                    selectedEquipment.type === 'curtain' ? 'Curtain' :
                    selectedEquipment.type === 'barricade' ? 'Barricade' :
                    selectedEquipment.type === 'scaffolding' ? 'Scaffolding' :
                    selectedEquipment.type === 'videoScreen' ? 'Video Screen' :
                    selectedEquipment.type === 'ledWall' ? 'LED Wall' :
                    selectedEquipment.type === 'smoke' ? 'Smoke Machine' :
                    selectedEquipment.type === 'fog' ? 'Fog Machine' :
                    selectedEquipment.type === 'hazer' ? 'Hazer' :
                    selectedEquipment.type === 'bubbleMachine' ? 'Bubble Machine' :
                    selectedEquipment.type === 'confettiCannon' ? 'Confetti Cannon' :
                    selectedEquipment.type === 'speaker' ? 'Speaker' :
                    selectedEquipment.type === 'djBooth' ? 'DJ Booth' :
                    selectedEquipment.type === 'mixer' ? 'Mixer' :
                    selectedEquipment.type === 'amplifier' ? 'Amplifier' :
                    selectedEquipment.type === 'generator' ? 'Generator' :
                    selectedEquipment.type === 'ups' ? 'UPS' : 'Equipment'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    id="equipment-color"
                    type="color"
                    value={selectedEquipment.color || '#2c2c2c'}
                    onChange={(e) => updateEquipmentColor(selectedEquipment.id, e.target.value)}
                    className="w-12 h-8 rounded border border-gray-300 cursor-pointer"
                  />
                  <div className="flex-1">
                    <Input
                      value={selectedEquipment.color || '#2c2c2c'}
                      onChange={(e) => updateEquipmentColor(selectedEquipment.id, e.target.value)}
                      placeholder="#2c2c2c"
                      className="text-sm"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    '#2c2c2c', '#ffffff', '#dc2626', '#059669', '#1e40af', '#7c3aed',
                    '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6', '#f97316'
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => updateEquipmentColor(selectedEquipment.id, color)}
                      className="w-6 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Export Design</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportDesign('png')}
              className="border-gray-200 hover:border-gray-300 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              PNG
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportDesign('pdf')}
              className="border-gray-200 hover:border-gray-300 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
