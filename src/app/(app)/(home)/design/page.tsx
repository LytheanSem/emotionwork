'use client'
import { useState, useRef, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { toPng, toJpeg, toSvg } from 'html-to-image'
import { PDFDocument, rgb } from 'pdf-lib'
import {
  Download,
  Save,
  PanelLeft,
  PanelRight,
  Sun,
  Moon,
  Grid3x3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDesignStore } from './hooks/useDesignStore'
import { Equipment } from './components/Equipment' // Import from components
import { FullGrid } from './components/FullGrid'
import { EquipmentLibrary } from './components/EquipmentLibrary'
import { ControlsPanel } from './components/ControlsPanel'

// ... rest of the component code remains the same

export default function StageDesigner() {
  const {
    equipment,
    selectedEquipmentId,
    setSelectedEquipmentId,
    designName,
    setDesignName,
    savedDesigns,
    saveDesign,
    loadDesign,
    deleteDesign,
    addEquipment,
    updateEquipment,
    deleteSelected,
    rotateSelected,
    scaleSelected,
    setScaleValue,
    resetScale,
  } = useDesignStore()

  const [actionMode, setActionMode] = useState<'move' | 'rotate' | 'scale'>(
    'move'
  )
  const [gridVisible, setGridVisible] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true)
  const canvasRef = useRef<HTMLDivElement>(null)

  const exportDesign = useCallback(
    async (format: 'png' | 'jpeg' | 'svg' | 'pdf') => {
      // Get the canvas container specifically
      const canvasContainer = document.querySelector(
        '.canvas-container'
      ) as HTMLElement
      if (!canvasContainer) {
        console.error('Canvas container not found')
        alert('Failed to export: Canvas not found')
        return
      }

      try {
        let dataUrl: string

        if (format === 'pdf') {
          // First capture as PNG
          const pngData = await toPng(canvasContainer, {
            backgroundColor: darkMode ? '#1a1a1a' : '#f8fafc',
            style: {
              transform: 'scale(1)',
              transformOrigin: 'top left',
            },
          })

          const pdfDoc = await PDFDocument.create()
          const page = pdfDoc.addPage([800, 600])

          const pngImage = await pdfDoc.embedPng(pngData)
          page.drawImage(pngImage, {
            x: 50,
            y: 50,
            width: 700,
            height: 500,
          })

          page.drawText(designName, {
            x: 50,
            y: 30,
            size: 20,
            color: rgb(0, 0, 0),
          })

          const pdfBytes = await pdfDoc.save()
          // Extract the buffer with proper typing
          const buffer = pdfBytes.buffer as ArrayBuffer
          const blob = new Blob([buffer], { type: 'application/pdf' })
          dataUrl = URL.createObjectURL(blob)
        } else {
          // For image formats
          const options = {
            backgroundColor: darkMode ? '#1a1a1a' : '#f8fafc',
            style: {
              transform: 'scale(1)',
              transformOrigin: 'top left',
            },
          }

          switch (format) {
            case 'png':
              dataUrl = await toPng(canvasContainer, options)
              break
            case 'jpeg':
              dataUrl = await toJpeg(canvasContainer, options)
              break
            case 'svg':
              dataUrl = await toSvg(canvasContainer, options)
              break
            default:
              throw new Error(`Unsupported format: ${format}`)
          }
        }

        const link = document.createElement('a')
        link.download = `${designName.replace(/[^a-z0-9]/gi, '_')}.${format}`
        link.href = dataUrl
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Clean up the URL object after a delay
        setTimeout(() => URL.revokeObjectURL(dataUrl), 100)
      } catch (error) {
        console.error(`Error exporting ${format}:`, error)
        alert(`Failed to export as ${format}. Please try again.`)
      }
    },
    [designName, darkMode]
  )

  const selectedEquipment = equipment.find(
    (item) => item.id === selectedEquipmentId
  )

  return (
    <div
      className={`flex flex-col h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-white'}`}
    >
      <header
        className={`border-b p-4 flex justify-between items-center ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
          >
            <PanelLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">3D Stage Designer</h1>
        </div>
        <div className="flex gap-2">
          <Input
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            className="w-64"
            placeholder="Design name"
          />
          <Button variant="outline" onClick={() => exportDesign('png')}>
            <Download className="mr-2 h-4 w-4" /> PNG
          </Button>
          <Button variant="outline" onClick={() => exportDesign('jpeg')}>
            <Download className="mr-2 h-4 w-4" /> JPG
          </Button>
          <Button variant="outline" onClick={() => exportDesign('pdf')}>
            <Download className="mr-2 h-4 w-4" /> PDF
          </Button>
          <Button variant="outline" onClick={saveDesign}>
            <Save className="mr-2 h-4 w-4" /> Save
          </Button>
          <Button
            variant="outline"
            onClick={() => setDarkMode(!darkMode)}
            className="px-3"
          >
            {darkMode ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          >
            <PanelRight className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        {/* Equipment Library */}
        <aside
          className={`w-64 border-r transition-all duration-300 ${leftSidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} h-full absolute left-0 z-10`}
        >
          <EquipmentLibrary
            darkMode={darkMode}
            savedDesigns={savedDesigns}
            addEquipment={addEquipment}
            loadDesign={loadDesign}
            deleteDesign={deleteDesign}
          />
        </aside>

        {/* 3D Canvas */}
        <section
          className={`flex-1 transition-all duration-300 ${leftSidebarOpen ? 'ml-64' : 'ml-0'} ${rightSidebarOpen ? 'mr-80' : 'mr-0'}`}
          ref={canvasRef}
        >
          <Canvas
            camera={{ position: [10, 10, 10], fov: 50 }}
            style={{ background: darkMode ? '#1a1a1a' : '#f8fafc' }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <OrbitControls makeDefault />
            <FullGrid visible={gridVisible} />

            {equipment.map((item) => (
              <Equipment
                key={item.id}
                equipment={item}
                selected={item.id === selectedEquipmentId}
                onClick={() => setSelectedEquipmentId(item.id)}
                onUpdate={(updates) => updateEquipment(item.id, updates)}
              />
            ))}
          </Canvas>

          {/* Controls Overlay */}
          <div
            className={`absolute top-4 left-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} bg-opacity-90 p-2 rounded-lg shadow-md`}
          >
            <Button
              variant={gridVisible ? 'default' : 'outline'}
              size="sm"
              onClick={() => setGridVisible(!gridVisible)}
              className="flex items-center gap-1"
            >
              <Grid3x3 className="h-3.5 w-3.5" />
              <span className="text-xs">Grid</span>
            </Button>
          </div>
        </section>

        {/* Controls Panel */}
        <aside
          className={`w-80 border-l transition-all duration-300 ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'} ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} h-full absolute right-0 z-10`}
        >
          <ControlsPanel
            darkMode={darkMode}
            actionMode={actionMode}
            setActionMode={setActionMode}
            selectedEquipment={selectedEquipment}
            rotateSelected={rotateSelected}
            scaleSelected={scaleSelected}
            setScaleValue={setScaleValue}
            resetScale={resetScale}
            deleteSelected={deleteSelected}
          />
        </aside>
      </main>
    </div>
  )
}
