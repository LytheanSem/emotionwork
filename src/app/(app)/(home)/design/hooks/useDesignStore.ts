// useDesignStore.ts - Fixed version
import { useState, useCallback, useEffect } from 'react'
import { Equipment, SavedDesign, EquipmentType, Scale } from '../types'

// Storage keys
const STORAGE_KEYS = {
  EQUIPMENT: 'stageDesigner_equipment',
  SELECTED_ID: 'stageDesigner_selectedId',
  DESIGN_NAME: 'stageDesigner_designName',
  SAVED_DESIGNS: 'stageDesigner_savedDesigns',
  VENUE_DIMENSIONS: 'stageDesigner_venueDimensions',
  VENUE_BOUNDARY_VISIBLE: 'stageDesigner_venueBoundaryVisible',
  LIGHTING_COLOR: 'stageDesigner_lightingColor',
}

// Helper function to safely access localStorage
const getStorageItem = <T>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') {
    return defaultValue
  }
  try {
    const saved = localStorage.getItem(key)
    return saved ? JSON.parse(saved) : defaultValue
  } catch (error) {
    console.error('Error reading from localStorage:', error)
    return defaultValue
  }
}

// Helper function to safely set localStorage
const setStorageItem = <T>(key: string, value: T): void => {
  if (typeof window === 'undefined') {
    return
  }
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error('Error writing to localStorage:', error)
  }
}

export const useDesignStore = () => {
  // Initialize state with default values, load from localStorage after mount
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(
    null
  )
  const [designName, setDesignName] = useState('My Stage Design')
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([])
  const [venueDimensions, setVenueDimensions] = useState({
    width: 20, // meters
    depth: 15, // meters
    height: 8, // meters
  })
  const [venueBoundaryVisible, setVenueBoundaryVisible] = useState(true)
  const [lightingColor, setLightingColor] = useState('#ff0000') // Default red color
  const [isHydrated, setIsHydrated] = useState(false)

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    setEquipment(getStorageItem(STORAGE_KEYS.EQUIPMENT, []))
    setSelectedEquipmentId(getStorageItem(STORAGE_KEYS.SELECTED_ID, null))
    setDesignName(getStorageItem(STORAGE_KEYS.DESIGN_NAME, 'My Stage Design'))
    setSavedDesigns(getStorageItem(STORAGE_KEYS.SAVED_DESIGNS, []))
    const savedVenueDimensions = getStorageItem(STORAGE_KEYS.VENUE_DIMENSIONS, {
      width: 20,
      depth: 15,
      height: 8,
    })
    console.log('Loading venue dimensions from localStorage:', savedVenueDimensions)
    setVenueDimensions(savedVenueDimensions)
    setVenueBoundaryVisible(getStorageItem(STORAGE_KEYS.VENUE_BOUNDARY_VISIBLE, true))
    setLightingColor(getStorageItem(STORAGE_KEYS.LIGHTING_COLOR, '#ff0000'))
    setIsHydrated(true)
  }, [])

  // Save to localStorage whenever state changes (only after hydration)
  useEffect(() => {
    if (isHydrated) {
      setStorageItem(STORAGE_KEYS.EQUIPMENT, equipment)
    }
  }, [equipment, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      setStorageItem(STORAGE_KEYS.SELECTED_ID, selectedEquipmentId)
    }
  }, [selectedEquipmentId, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      setStorageItem(STORAGE_KEYS.DESIGN_NAME, designName)
    }
  }, [designName, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      setStorageItem(STORAGE_KEYS.SAVED_DESIGNS, savedDesigns)
    }
  }, [savedDesigns, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      console.log('Saving venue dimensions to localStorage:', venueDimensions)
      setStorageItem(STORAGE_KEYS.VENUE_DIMENSIONS, venueDimensions)
    }
  }, [venueDimensions, isHydrated])


  useEffect(() => {
    if (isHydrated) {
      setStorageItem(STORAGE_KEYS.VENUE_BOUNDARY_VISIBLE, venueBoundaryVisible)
    }
  }, [venueBoundaryVisible, isHydrated])

  useEffect(() => {
    if (isHydrated) {
      setStorageItem(STORAGE_KEYS.LIGHTING_COLOR, lightingColor)
    }
  }, [lightingColor, isHydrated])

  // MOVE updateEquipment to the top to fix the declaration order issue
  const updateEquipment = useCallback(
    (id: number, updates: Partial<Equipment>) => {
      setEquipment((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      )
    },
    []
  )

  // ... rest of the file remains the same (all the other functions)
  // Add stacking functions
  const moveUpSelected = useCallback(() => {
    if (selectedEquipmentId !== null) {
      setEquipment((prev) =>
        prev.map((item) => {
          if (item.id === selectedEquipmentId) {
            return {
              ...item,
              position: [
                item.position[0],
                item.position[1] + 0.5,
                item.position[2],
              ],
            }
          }
          return item
        })
      )
    }
  }, [selectedEquipmentId])

  const moveDownSelected = useCallback(() => {
    if (selectedEquipmentId !== null) {
      setEquipment((prev) =>
        prev.map((item) => {
          if (item.id === selectedEquipmentId && item.position[1] > 0) {
            return {
              ...item,
              position: [
                item.position[0],
                Math.max(0, item.position[1] - 0.5),
                item.position[2],
              ],
            }
          }
          return item
        })
      )
    }
  }, [selectedEquipmentId])

  // Left/Right movement functions
  const moveLeftSelected = useCallback(() => {
    if (selectedEquipmentId !== null) {
      const selectedEq = equipment.find((e) => e.id === selectedEquipmentId)
      if (selectedEq) {
        updateEquipment(selectedEquipmentId, {
          position: [
            selectedEq.position[0] - 0.5,
            selectedEq.position[1],
            selectedEq.position[2],
          ],
        })
      }
    }
  }, [selectedEquipmentId, equipment, updateEquipment])

  const moveRightSelected = useCallback(() => {
    if (selectedEquipmentId !== null) {
      const selectedEq = equipment.find((e) => e.id === selectedEquipmentId)
      if (selectedEq) {
        updateEquipment(selectedEquipmentId, {
          position: [
            selectedEq.position[0] + 0.5,
            selectedEq.position[1],
            selectedEq.position[2],
          ],
        })
      }
    }
  }, [selectedEquipmentId, equipment, updateEquipment])

  // Save design to localStorage
  const saveDesign = useCallback(() => {
    try {
      const design: SavedDesign = {
        name: designName,
        equipment,
        date: new Date().toISOString(),
      }

      // Check if design with same name already exists
      const existingIndex = savedDesigns.findIndex((d) => d.name === designName)
      let updatedDesigns: SavedDesign[]

      if (existingIndex !== -1) {
        // Update existing design
        updatedDesigns = [...savedDesigns]
        updatedDesigns[existingIndex] = design
      } else {
        // Add new design
        updatedDesigns = [...savedDesigns, design]
      }

      setSavedDesigns(updatedDesigns)
      alert('Design saved successfully!')
    } catch (error) {
      console.error('Error saving design:', error)
      alert('Failed to save design. Please try again.')
    }
  }, [designName, equipment, savedDesigns])

  const loadDesign = useCallback((design: SavedDesign) => {
    setDesignName(design.name)
    setEquipment(design.equipment)
    setSelectedEquipmentId(null)
  }, [])

  // Delete saved design
  const deleteDesign = useCallback((index: number) => {
    if (confirm('Are you sure you want to delete this design?')) {
      setSavedDesigns((prev) => {
        const newDesigns = [...prev]
        newDesigns.splice(index, 1)
        return newDesigns
      })
    }
  }, [])

  const addEquipment = useCallback((type: EquipmentType) => {
    const newEquipment: Equipment = {
      id: Date.now(),
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    }
    setEquipment((prev) => [...prev, newEquipment])
    setSelectedEquipmentId(newEquipment.id)
  }, [])

  const deleteSelected = useCallback(() => {
    if (selectedEquipmentId !== null) {
      setEquipment((prev) =>
        prev.filter((item) => item.id !== selectedEquipmentId)
      )
      setSelectedEquipmentId(null)
    }
  }, [selectedEquipmentId])

  const rotateSelected = useCallback(() => {
    if (selectedEquipmentId !== null) {
      setEquipment((prev) =>
        prev.map((item) => {
          if (item.id === selectedEquipmentId) {
            return {
              ...item,
              rotation: [
                item.rotation[0],
                item.rotation[1] + Math.PI / 4,
                item.rotation[2],
              ],
            }
          }
          return item
        })
      )
    }
  }, [selectedEquipmentId])

  const scaleSelected = useCallback(
    (axis: 'x' | 'y' | 'z' | 'all', delta: number) => {
      if (selectedEquipmentId !== null) {
        setEquipment((prev) =>
          prev.map((item) => {
            if (item.id === selectedEquipmentId) {
              let newScale = [...item.scale] as Scale
              if (axis === 'all') {
                newScale = [
                  Math.max(0.1, item.scale[0] + delta),
                  Math.max(0.1, item.scale[1] + delta),
                  Math.max(0.1, item.scale[2] + delta),
                ]
              } else {
                const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
                newScale[axisIndex] = Math.max(
                  0.1,
                  item.scale[axisIndex] + delta
                )
              }
              return { ...item, scale: newScale }
            }
            return item
          })
        )
      }
    },
    [selectedEquipmentId]
  )

  const setScaleValue = useCallback(
    (axis: 'x' | 'y' | 'z' | 'all', value: number) => {
      if (selectedEquipmentId !== null) {
        setEquipment((prev) =>
          prev.map((item) => {
            if (item.id === selectedEquipmentId) {
              let newScale = [...item.scale] as Scale
              if (axis === 'all') {
                newScale = [value, value, value]
              } else {
                const axisIndex = axis === 'x' ? 0 : axis === 'y' ? 1 : 2
                newScale[axisIndex] = value
              }
              return { ...item, scale: newScale }
            }
            return item
          })
        )
      }
    },
    [selectedEquipmentId]
  )

  const resetScale = useCallback(() => {
    if (selectedEquipmentId !== null) {
      updateEquipment(selectedEquipmentId, { scale: [1, 1, 1] })
    }
  }, [selectedEquipmentId, updateEquipment])

  // Clear all equipment
  const clearAll = useCallback(() => {
    if (confirm('Are you sure you want to clear all equipment?')) {
      setEquipment([])
      setSelectedEquipmentId(null)
      setDesignName('My Stage Design')
    }
  }, [])

  // Update equipment color
  const updateEquipmentColor = useCallback(
    (id: number, color: string) => {
      updateEquipment(id, { color })
    },
    [updateEquipment]
  )

  // Scale design to fit venue dimensions
  const scaleDesignToVenue = useCallback(() => {
    if (equipment.length === 0) return

    // Find the current bounds of the design
    const positions = equipment.map(eq => eq.position)
    const minX = Math.min(...positions.map(p => p[0]))
    const maxX = Math.max(...positions.map(p => p[0]))
    const minZ = Math.min(...positions.map(p => p[2]))
    const maxZ = Math.max(...positions.map(p => p[2]))

    const currentWidth = maxX - minX
    const currentDepth = maxZ - minZ

    // Calculate scale factors (leave some margin)
    const scaleX = (venueDimensions.width * 0.8) / currentWidth
    const scaleZ = (venueDimensions.depth * 0.8) / currentDepth
    const scaleFactor = Math.min(scaleX, scaleZ, 1) // Don't scale up, only down

    // Apply scaling to all equipment
    setEquipment(prev => prev.map(eq => ({
      ...eq,
      position: [
        eq.position[0] * scaleFactor,
        eq.position[1],
        eq.position[2] * scaleFactor
      ] as [number, number, number],
      scale: [
        eq.scale[0] * scaleFactor,
        eq.scale[1],
        eq.scale[2] * scaleFactor
      ] as [number, number, number]
    })))
  }, [equipment, venueDimensions])

  return {
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
    clearAll,
  }
}
