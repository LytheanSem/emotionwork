import { useState, useEffect, useCallback } from 'react'
import { Equipment, SavedDesign, EquipmentType, Scale } from '../types' // Import from types

export const useDesignStore = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(
    null
  )
  const [designName, setDesignName] = useState('My Stage Design')
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([])

  // Load saved designs from localStorage
  useEffect(() => {
    const designs = JSON.parse(localStorage.getItem('stageDesigns') || '[]')
    setSavedDesigns(designs)
  }, [])

  // Save design to localStorage
  const saveDesign = useCallback(() => {
    try {
      const design: SavedDesign = {
        name: designName,
        equipment,
        date: new Date().toISOString(),
      }

      const updatedDesigns = [...savedDesigns, design]
      localStorage.setItem('stageDesigns', JSON.stringify(updatedDesigns))
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
        localStorage.setItem('stageDesigns', JSON.stringify(newDesigns))
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

  const updateEquipment = useCallback(
    (id: number, updates: Partial<Equipment>) => {
      setEquipment((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      )
    },
    []
  )

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

  return {
    equipment,
    setEquipment,
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
  }
}
