'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { PDFDocument, rgb } from 'pdf-lib'

import { PanelLeft, PanelRight, Grid3x3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDesignStore } from '@/app/(app)/(home)/design/hooks/useDesignStore'
import { Equipment } from '@/app/(app)/(home)/design/components/Equipment'
import { FullGrid } from '@/app/(app)/(home)/design/components/FullGrid'
import { EquipmentLibrary } from '@/app/(app)/(home)/design/components/EquipmentLibrary'
import ControlsPanel from '@/app/(app)/(home)/design/components/ControlsPanel'
import { loadTemplate } from '@/app/(app)/(home)/design/templates/stageTemplates'
import { calculateTotalCost } from '@/app/(app)/(home)/design/config/equipmentPricing'
import { shouldHandleGlobalShortcut } from '@/lib/keyboard-utils'

export default function StageDesigner() {
  const {
    equipment,
    setEquipment,
    selectedEquipmentId,
    setSelectedEquipmentId,
    designName,
    setDesignName,
    savedDesigns,
    venueDimensions,
    setVenueDimensions,
    venueBoundaryVisible,
    setVenueBoundaryVisible,
    lightingColor,
    setLightingColor,
    saveDesign,
    loadDesign,
    deleteDesign,
    addEquipment,
    updateEquipment,
    updateEquipmentColor,
    scaleDesignToVenue,
    deleteSelected,
    rotateSelected,
    scaleSelected,
    setScaleValue,
    resetScale,
    moveUpSelected,
    moveDownSelected,
    moveLeftSelected,
    moveRightSelected,
  } = useDesignStore()

  const [gridVisible, setGridVisible] = useState(true)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const [controlsEnabled, setControlsEnabled] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rendererRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameraRef = useRef<any>(null)

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedEquipmentId) return
      
      // Early-return when typing in inputs, textareas, or contenteditable
      if (!shouldHandleGlobalShortcut()) return

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          moveUpSelected()
          break
        case 'ArrowDown':
          e.preventDefault()
          moveDownSelected()
          break
        case 'ArrowLeft':
          e.preventDefault()
          moveLeftSelected()
          break
        case 'ArrowRight':
          e.preventDefault()
          moveRightSelected()
          break
        case 'Delete':
          e.preventDefault()
          deleteSelected()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    selectedEquipmentId,
    moveUpSelected,
    moveDownSelected,
    moveLeftSelected,
    moveRightSelected,
    deleteSelected,
  ])

  const exportDesign = useCallback(
    async (format: 'png' | 'jpeg' | 'svg' | 'pdf') => {
      // Store original grid visibility outside try block
      const originalGridVisible = gridVisible
      
      try {
        
        // Hide grid for clean export
        setGridVisible(false)
        await new Promise(resolve => setTimeout(resolve, 100))

        // Get the Three.js canvas
        let canvas = document.querySelector('canvas')
        if (!canvas) {
          const canvasContainer = canvasRef.current
          if (canvasContainer) {
            canvas = canvasContainer.querySelector('canvas')
          }
        }
        if (!canvas) {
          throw new Error('Canvas not found')
        }

        // Create a temporary renderer for export with fixed camera angle
        if (rendererRef.current && sceneRef.current) {
          // Calculate stage bounds to fit everything in view
          const bounds = {
            minX: -venueDimensions.width / 2 - 5,
            maxX: venueDimensions.width / 2 + 5,
            minZ: -venueDimensions.depth / 2 - 5,
            maxZ: venueDimensions.depth / 2 + 5,
            minY: 0,
            maxY: venueDimensions.height + 5
          }

          // Create orthographic camera for consistent top-down view
          const aspect = canvas.width / canvas.height
          const frustumSize = Math.max(
            bounds.maxX - bounds.minX,
            bounds.maxZ - bounds.minZ,
            bounds.maxY - bounds.minY
          ) * 1.2 // Add some padding

          const camera = new (await import('three')).OrthographicCamera(
            -frustumSize * aspect / 2,
            frustumSize * aspect / 2,
            frustumSize / 2,
            -frustumSize / 2,
            0.1,
            1000
          )

          // Position camera for optimal top-down view
          camera.position.set(
            (bounds.minX + bounds.maxX) / 2,
            bounds.maxY + 10,
            (bounds.minZ + bounds.maxZ) / 2
          )
          camera.lookAt(
            (bounds.minX + bounds.maxX) / 2,
            0,
            (bounds.minZ + bounds.maxZ) / 2
          )

          // Render with the export camera
          rendererRef.current.render(sceneRef.current, camera)
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        const link = document.createElement('a')
        let dataUrl: string

        if (format === 'pdf') {
          // Create PDF with design information and pricing
          const pdfDoc = await PDFDocument.create()
          const page = pdfDoc.addPage([800, 1000]) // Larger page for more content
          const { height, width } = page.getSize()
          
          // Header
          page.drawText(`Visual Emotionwork Co., Ltd`, {
            x: 50,
            y: height - 40,
            size: 16,
            color: rgb(0.2, 0.4, 0.8),
          })
          
          page.drawText(`Stage Design Quote: ${designName}`, {
            x: 50,
            y: height - 70,
            size: 20,
            color: rgb(0, 0, 0),
          })
          
          // Design Information
          page.drawText(`Design Information:`, {
            x: 50,
            y: height - 110,
            size: 14,
            color: rgb(0, 0, 0),
          })
          
          page.drawText(`Equipment Count: ${equipment.length}`, {
            x: 50,
            y: height - 130,
            size: 12,
            color: rgb(0, 0, 0),
          })
          
          page.drawText(`Venue Dimensions: ${venueDimensions.width}m x ${venueDimensions.depth}m x ${venueDimensions.height}m`, {
            x: 50,
            y: height - 150,
            size: 12,
            color: rgb(0, 0, 0),
          })
          
          // Calculate pricing
          const pricing = calculateTotalCost(equipment.map(item => ({ type: item.type })))
          
          // Pricing Section
          page.drawText(`Equipment Pricing (${pricing.currency}):`, {
            x: 50,
            y: height - 190,
            size: 14,
            color: rgb(0, 0, 0),
          })
          
          // Group by category
          const categories = pricing.breakdown.reduce((acc, item) => {
            if (!acc[item.category]) acc[item.category] = []
            acc[item.category].push(item)
            return acc
          }, {} as Record<string, typeof pricing.breakdown>)
          
          let yPos = height - 220
          
          Object.entries(categories).forEach(([category, items]) => {
            // Category header
            page.drawText(`${category}:`, {
              x: 50,
              y: yPos,
              size: 12,
              color: rgb(0.2, 0.4, 0.8),
            })
            yPos -= 20
            
            // Items in category
            items.forEach(item => {
              if (yPos > 100) {
                const itemText = `${item.name} (${item.quantity}x)`
                const priceText = `${pricing.currency} ${item.totalPrice.toFixed(2)}`
                
                page.drawText(itemText, {
                  x: 70,
                  y: yPos,
                  size: 10,
                  color: rgb(0, 0, 0),
                })
                
                page.drawText(priceText, {
                  x: width - 120,
                  y: yPos,
                  size: 10,
                  color: rgb(0, 0, 0),
                })
                
                yPos -= 15
              }
            })
            
            yPos -= 10
          })
          
          // Total
          page.drawText(`Total Cost: ${pricing.currency} ${pricing.total.toFixed(2)}`, {
            x: 50,
            y: yPos - 20,
            size: 16,
            color: rgb(0.8, 0.2, 0.2),
          })
          
          // Pricing options
          const dailyPricing = calculateTotalCost(equipment.map(item => ({ type: item.type })), 'daily')
          const weeklyPricing = calculateTotalCost(equipment.map(item => ({ type: item.type })), 'weekly')
          const monthlyPricing = calculateTotalCost(equipment.map(item => ({ type: item.type })), 'monthly')
          
          yPos -= 60
          page.drawText(`Pricing Options:`, {
            x: 50,
            y: yPos,
            size: 14,
            color: rgb(0, 0, 0),
          })
          
          page.drawText(`Daily Rate: ${dailyPricing.currency} ${dailyPricing.total.toFixed(2)}`, {
            x: 50,
            y: yPos - 20,
            size: 12,
            color: rgb(0, 0, 0),
          })
          
          page.drawText(`Weekly Rate: ${weeklyPricing.currency} ${weeklyPricing.total.toFixed(2)}`, {
            x: 50,
            y: yPos - 40,
            size: 12,
            color: rgb(0, 0, 0),
          })
          
          page.drawText(`Monthly Rate: ${monthlyPricing.currency} ${monthlyPricing.total.toFixed(2)}`, {
            x: 50,
            y: yPos - 60,
            size: 12,
            color: rgb(0, 0, 0),
          })
          
          // Contact Information
          yPos -= 100
          page.drawText(`Contact Information:`, {
            x: 50,
            y: yPos,
            size: 14,
            color: rgb(0, 0, 0),
          })
          
          page.drawText(`Phone: (+855) 98 505079`, {
            x: 50,
            y: yPos - 20,
            size: 12,
            color: rgb(0, 0, 0),
          })
          
          page.drawText(`Email: visualemotion@gmail.com`, {
            x: 50,
            y: yPos - 40,
            size: 12,
            color: rgb(0, 0, 0),
          })
          
          page.drawText(`Address: #633, St 75K, S/K Kakap, Khan Posenchey, Phnom Penh City`, {
            x: 50,
            y: yPos - 60,
            size: 12,
            color: rgb(0, 0, 0),
          })
          
          const pdfBytes = await pdfDoc.save()
          dataUrl = `data:application/pdf;base64,${btoa(String.fromCharCode(...pdfBytes))}`
        } else if (format === 'svg') {
          // Create SVG representation
          const svgContent = `
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
              <rect width="800" height="600" fill="#f8fafc"/>
              <text x="50" y="40" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#1e293b">${designName}</text>
              <text x="50" y="70" font-family="Arial, sans-serif" font-size="14" fill="#64748b">Equipment Count: ${equipment.length} | Generated: ${new Date().toLocaleDateString()}</text>
              
              ${equipment.map((item, index) => {
                const x = 50 + (index % 8) * 90
                const y = 120 + Math.floor(index / 8) * 80
                const colors = {
                  speaker: '#3b82f6', light: '#f59e0b', stage: '#10b981', microphone: '#ef4444',
                  truss: '#6b7280', platform: '#8b5cf6', ledPar: '#06b6d4', movingHead: '#f97316',
                  djBooth: '#ec4899', laser: '#dc2626', smoke: '#64748b', videoScreen: '#1f2937',
                  fog: '#9ca3af', strobe: '#fbbf24', monitorSpeaker: '#3b82f6', micStand: '#6b7280',
                  subwoofer: '#1e40af', cableRamp: '#fbbf24', powerDistribution: '#059669', stageRiser: '#7c3aed'
                }
                const color = colors[item.type as keyof typeof colors] || '#6b7280'
                return `
                  <g>
                    <rect x="${x}" y="${y}" width="80" height="60" fill="${color}" stroke="#374151" stroke-width="1" rx="4"/>
                    <text x="${x + 5}" y="${y + 20}" font-family="Arial, sans-serif" font-size="10" fill="white" font-weight="bold">${item.type.replace(/([A-Z])/g, ' $1').trim()}</text>
                    <text x="${x + 5}" y="${y + 35}" font-family="Arial, sans-serif" font-size="8" fill="white">Pos: ${item.position.map(p => p.toFixed(1)).join(', ')}</text>
                    <text x="${x + 5}" y="${y + 50}" font-family="Arial, sans-serif" font-size="8" fill="white">Scale: ${item.scale.map(s => s.toFixed(1)).join(', ')}</text>
                  </g>
                `
              }).join('')}
            </svg>
          `
          dataUrl = URL.createObjectURL(new Blob([svgContent], { type: 'image/svg+xml' }))
        } else {
          // For PNG/JPEG, capture the canvas
          dataUrl = canvas.toDataURL(`image/${format === 'jpeg' ? 'jpeg' : format}`, 1.0)
        }

        const fileName = `${designName.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.${format}`
        link.download = fileName
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up the URL after a delay
        setTimeout(() => URL.revokeObjectURL(dataUrl), 1000)
        
        // Show success message
        alert(`Design exported successfully as ${fileName}`)
        
        // Restore grid visibility
        setGridVisible(originalGridVisible)
      } catch (error) {
        console.error(`Error exporting ${format}:`, error)
        alert(`Failed to export as ${format}. Please try again. Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        
        // Restore grid visibility even if export failed
        setGridVisible(originalGridVisible)
      }
    },
    [designName, equipment, venueDimensions, gridVisible, setGridVisible]
  )

  const handleLoadTemplate = useCallback((templateId: string) => {
    try {
      const templateEquipment = loadTemplate(templateId)
      setEquipment(templateEquipment)
      setSelectedEquipmentId(null)
      setDesignName(`Template: ${templateId}`)
    } catch (error) {
      console.error('Error loading template:', error)
      alert('Failed to load template. Please try again.')
    }
  }, [setEquipment, setSelectedEquipmentId, setDesignName])

  const selectedEquipment = equipment.find(
    (item) => item.id === selectedEquipmentId
  )

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Minimal Header */}
      <header className="bg-white border-b border-gray-100 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl font-medium text-gray-900">Stage Designer</h1>
          </div>

          {/* Center */}
          <div className="flex-1 max-w-xs mx-8">
            <Input
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="text-center border-gray-200 focus:border-gray-400 transition-colors"
              placeholder="Untitled Design"
            />
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <Button 
              onClick={saveDesign}
              size="sm"
              className="bg-gray-900 hover:bg-gray-800 text-white transition-colors"
            >
              Save
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              <PanelRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden bg-gray-50 relative">
        {/* Equipment Library */}
        <aside
          className={`w-80 border-r border-gray-100 transition-all duration-300 ${
            leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } bg-white fixed left-0 z-10 overflow-hidden`}
          style={{ 
            top: '5rem', 
            height: 'calc(100vh - 5rem - 4rem)',
            bottom: '4rem'
          }}
        >
          <EquipmentLibrary
            savedDesigns={savedDesigns}
            addEquipment={addEquipment}
            loadDesign={loadDesign}
            deleteDesign={deleteDesign}
            loadTemplate={handleLoadTemplate}
          />
        </aside>

        {/* 3D Canvas */}
        <section
          className={`canvas-container flex-1 transition-all duration-300 ${
            leftSidebarOpen ? 'ml-80' : 'ml-0'
          } ${rightSidebarOpen ? 'mr-80' : 'mr-0'} bg-white m-4 rounded-xl shadow-sm border border-gray-100`}
          ref={canvasRef}
        >
          <Canvas
            shadows={true}
            camera={{ position: [10, 10, 10], fov: 50 }}
            style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
            gl={{ preserveDrawingBuffer: true, antialias: true }}
            onCreated={({ gl, scene, camera }) => {
              rendererRef.current = gl
              sceneRef.current = scene
              cameraRef.current = camera
              // Ensure the renderer preserves the drawing buffer for export
              gl.domElement.style.display = 'block'
            }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight
              position={[10, 10, 5]}
              intensity={1}
              castShadow={true}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-bias={-0.0001}
              shadow-normalBias={0.02}
              shadow-radius={4}
            />

            <FullGrid 
              visible={gridVisible} 
              venueDimensions={venueDimensions} 
              showVenueBoundary={venueBoundaryVisible}
            />

            {equipment.map((item) => (
              <Equipment
                key={item.id}
                equipment={item}
                selected={item.id === selectedEquipmentId}
                onClick={() => setSelectedEquipmentId(item.id)}
                onUpdate={(updates) => updateEquipment(item.id, updates)}
                onDragStart={() => setControlsEnabled(false)}
                onDragEnd={() => setControlsEnabled(true)}
                lightingColor={lightingColor}
              />
            ))}

            <OrbitControls
              ref={controlsRef}
              enabled={controlsEnabled}
              enablePan={controlsEnabled}
              enableZoom={controlsEnabled}
              enableRotate={controlsEnabled}
            />
          </Canvas>

          {/* Grid Toggle */}
          <div className="absolute top-4 left-4">
            <Button
              variant={gridVisible ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGridVisible(!gridVisible)}
              className="bg-white/95 hover:bg-white shadow-sm border-gray-200 transition-colors"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
          </div>
        </section>

        {/* Controls Panel */}
        <aside
          className={`w-80 border-l border-gray-100 transition-all duration-300 ${
            rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          } bg-white fixed right-0 z-10 overflow-hidden`}
          style={{ 
            top: '5rem', 
            height: 'calc(100vh - 5rem - 4rem)',
            bottom: '4rem'
          }}
        >
            <ControlsPanel
              selectedEquipment={selectedEquipment}
              equipment={equipment}
              designName={designName}
              rotateSelected={rotateSelected}
              scaleSelected={scaleSelected}
              setScaleValue={setScaleValue}
              resetScale={resetScale}
              deleteSelected={deleteSelected}
              moveUpSelected={moveUpSelected}
              moveDownSelected={moveDownSelected}
              moveLeftSelected={moveLeftSelected}
              moveRightSelected={moveRightSelected}
              updateEquipmentColor={updateEquipmentColor}
              venueDimensions={venueDimensions}
              setVenueDimensions={setVenueDimensions}
              scaleDesignToVenue={scaleDesignToVenue}
              venueBoundaryVisible={venueBoundaryVisible}
              setVenueBoundaryVisible={setVenueBoundaryVisible}
              lightingColor={lightingColor}
              setLightingColor={setLightingColor}
              exportDesign={exportDesign}
            />
        </aside>
      </main>
    </div>
  )
}
