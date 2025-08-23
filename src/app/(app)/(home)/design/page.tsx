"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";
import {
  Download,
  Grid3x3,
  Moon,
  Move3d,
  PanelLeft,
  PanelRight,
  RotateCw,
  Save,
  Sun,
  Trash2,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

// Lazy load heavy 3D components
const Canvas = dynamic(
  () => import("@react-three/fiber").then((mod) => ({ default: mod.Canvas })),
  { ssr: false }
);
const OrbitControls = dynamic(
  () =>
    import("@react-three/drei").then((mod) => ({ default: mod.OrbitControls })),
  { ssr: false }
);

// Equipment Models with Scale Support
function SpeakerModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position;
  rotation: Rotation;
  scale?: Scale;
}) {
  const { scene } = useGLTF("/models/speaker.glb");
  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

function StageLightModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position;
  rotation: Rotation;
  scale?: Scale;
}) {
  const { scene } = useGLTF("/models/stage-light.glb");
  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

function StageModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position;
  rotation: Rotation;
  scale?: Scale;
}) {
  const { scene } = useGLTF("/models/stage-platform.glb");
  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

function MicrophoneModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position;
  rotation: Rotation;
  scale?: Scale;
}) {
  const { scene } = useGLTF("/models/microphone.glb");
  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

function TrussModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position;
  rotation: Rotation;
  scale?: Scale;
}) {
  const { scene } = useGLTF("/models/truss.glb");
  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

function PlatformModel({
  position,
  rotation,
  scale = [1, 1, 1],
}: {
  position: Position;
  rotation: Rotation;
  scale?: Scale;
}) {
  const { scene } = useGLTF("/models/platform.glb");
  return (
    <primitive
      object={scene.clone()}
      position={position}
      rotation={rotation}
      scale={scale}
    />
  );
}

// Import useGLTF hook
import { useGLTF } from "@react-three/drei";

type EquipmentType =
  | "speaker"
  | "light"
  | "stage"
  | "microphone"
  | "truss"
  | "platform";
type Position = [number, number, number];
type Rotation = [number, number, number];
type Scale = [number, number, number];

interface Equipment {
  id: number;
  type: EquipmentType;
  position: Position;
  rotation: Rotation;
  scale: Scale;
}

interface SavedDesign {
  name: string;
  equipment: Equipment[];
  date: string;
}

// Full Grid Component
function FullGrid({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <group>
      <gridHelper
        args={[100, 100, "#3b82f6", "#93c5fd"]}
        position={[0, 0.01, 0]}
      />
      <mesh position={[0, 0.02, 0]}>
        <planeGeometry args={[100, 0.1]} />
        <meshBasicMaterial color="#ef4444" side={2} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[100, 0.1]} />
        <meshBasicMaterial color="#ef4444" side={2} />
      </mesh>
    </group>
  );
}

// Equipment Component
function Equipment({
  equipment,
  selected,
  onClick,
  onUpdate,
}: {
  equipment: Equipment;
  selected: boolean;
  onClick: () => void;
  onUpdate: (updates: Partial<Equipment>) => void;
}) {
  const ref = useRef<{ position: { x: number; y: number; z: number } }>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setIsDragging(true);
    onClick();
    document.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerUp = () => {
    if (isDragging && ref.current) {
      // Update position when dragging ends
      onUpdate({
        position: [
          ref.current.position.x,
          ref.current.position.y,
          ref.current.position.z,
        ],
      });
    }
    setIsDragging(false);
    document.removeEventListener("pointerup", handlePointerUp);
  };

  const renderModel = () => {
    const { type, rotation, scale } = equipment;
    const props = { position: [0, 0, 0] as Position, rotation, scale };

    switch (type) {
      case "speaker":
        return <SpeakerModel {...props} />;
      case "light":
        return <StageLightModel {...props} />;
      case "stage":
        return <StageModel {...props} />;
      case "microphone":
        return <MicrophoneModel {...props} />;
      case "truss":
        return <TrussModel {...props} />;
      case "platform":
        return <PlatformModel {...props} />;
      default:
        return null;
    }
  };

  return (
    <group
      ref={ref}
      position={equipment.position}
      onPointerDown={handlePointerDown}
    >
      {renderModel()}
      {selected && (
        <>
          <mesh position={[0, 0.1, 0]}>
            <boxGeometry args={[1.2, 0.1, 1.2]} />
            <meshBasicMaterial color="yellow" transparent opacity={0.5} />
          </mesh>
          <mesh position={[0, 0, 0]} scale={equipment.scale}>
            <boxGeometry args={[1, 1, 1]} />
            <meshBasicMaterial
              color="cyan"
              wireframe
              transparent
              opacity={0.3}
            />
          </mesh>
        </>
      )}
      {isDragging && (
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[1.4, 0.1, 1.4]} />
          <meshBasicMaterial color="orange" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// Main component with reduced complexity
export default function StageDesigner() {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(
    null
  );
  const [designName, setDesignName] = useState("My Stage Design");
  const [actionMode, setActionMode] = useState<"move" | "rotate" | "scale">(
    "move"
  );
  const [gridVisible, setGridVisible] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [savedDesigns, setSavedDesigns] = useState<SavedDesign[]>([]);

  // Load saved designs from localStorage
  useEffect(() => {
    try {
      const designs = JSON.parse(localStorage.getItem("stageDesigns") || "[]");
      setSavedDesigns(designs);
    } catch (error) {
      console.error("Error loading designs:", error);
    }
  }, []);

  // Save design to localStorage
  const saveDesign = useCallback(() => {
    try {
      const design: SavedDesign = {
        name: designName,
        equipment,
        date: new Date().toISOString(),
      };
      const updatedDesigns = [...savedDesigns, design];
      localStorage.setItem("stageDesigns", JSON.stringify(updatedDesigns));
      setSavedDesigns(updatedDesigns);
      alert("Design saved successfully!");
    } catch (error) {
      console.error("Error saving design:", error);
      alert("Failed to save design. Please try again.");
    }
  }, [designName, equipment, savedDesigns]);

  const loadDesign = useCallback((design: SavedDesign) => {
    setDesignName(design.name);
    setEquipment(design.equipment);
    setSelectedEquipmentId(null);
  }, []);

  const deleteDesign = useCallback((index: number) => {
    if (confirm("Are you sure you want to delete this design?")) {
      setSavedDesigns((prev) => {
        const newDesigns = [...prev];
        newDesigns.splice(index, 1);
        localStorage.setItem("stageDesigns", JSON.stringify(newDesigns));
        return newDesigns;
      });
    }
  }, []);

  const addEquipment = useCallback((type: EquipmentType) => {
    const newEquipment: Equipment = {
      id: Date.now(),
      type,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };
    setEquipment((prev) => [...prev, newEquipment]);
    setSelectedEquipmentId(newEquipment.id);
  }, []);

  const updateEquipment = useCallback(
    (id: number, updates: Partial<Equipment>) => {
      setEquipment((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const deleteSelected = useCallback(() => {
    if (selectedEquipmentId !== null) {
      setEquipment((prev) =>
        prev.filter((item) => item.id !== selectedEquipmentId)
      );
      setSelectedEquipmentId(null);
    }
  }, [selectedEquipmentId]);

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
            };
          }
          return item;
        })
      );
    }
  }, [selectedEquipmentId]);

  const scaleSelected = useCallback(
    (axis: "x" | "y" | "z" | "all", delta: number) => {
      if (selectedEquipmentId !== null) {
        setEquipment((prev) =>
          prev.map((item) => {
            if (item.id === selectedEquipmentId) {
              let newScale = [...item.scale] as Scale;
              if (axis === "all") {
                newScale = [
                  Math.max(0.1, item.scale[0] + delta),
                  Math.max(0.1, item.scale[1] + delta),
                  Math.max(0.1, item.scale[2] + delta),
                ];
              } else {
                const axisIndex = axis === "x" ? 0 : axis === "y" ? 1 : 2;
                newScale[axisIndex] = Math.max(
                  0.1,
                  item.scale[axisIndex] + delta
                );
              }
              return { ...item, scale: newScale };
            }
            return item;
          })
        );
      }
    },
    [selectedEquipmentId]
  );

  const setScaleValue = useCallback(
    (axis: "x" | "y" | "z" | "all", value: number) => {
      if (selectedEquipmentId !== null) {
        setEquipment((prev) =>
          prev.map((item) => {
            if (item.id === selectedEquipmentId) {
              let newScale = [...item.scale] as Scale;
              if (axis === "all") {
                newScale = [value, value, value];
              } else {
                const axisIndex = axis === "x" ? 0 : axis === "y" ? 1 : 2;
                newScale[axisIndex] = value;
              }
              return { ...item, scale: newScale };
            }
            return item;
          })
        );
      }
    },
    [selectedEquipmentId]
  );

  const resetScale = useCallback(() => {
    if (selectedEquipmentId !== null) {
      updateEquipment(selectedEquipmentId, { scale: [1, 1, 1] });
    }
  }, [selectedEquipmentId, updateEquipment]);

  // Simplified export function
  const exportDesign = useCallback(
    async (format: "png" | "jpeg" | "svg" | "pdf") => {
      try {
        alert(
          `Export as ${format.toUpperCase()} is not yet implemented. This feature will be available soon!`
        );
      } catch (error) {
        console.error(`Error exporting ${format}:`, error);
        alert(`Failed to export as ${format}. Please try again.`);
      }
    },
    [designName, darkMode]
  );

  const selectedEquipment = equipment.find(
    (item) => item.id === selectedEquipmentId
  );

  return (
    <div
      className={`flex flex-col h-screen ${darkMode ? "dark bg-gray-900" : "bg-white"}`}
    >
      <header
        className={`border-b p-4 flex justify-between items-center ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"}`}
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
          <Button variant="outline" onClick={() => exportDesign("png")}>
            <Download className="mr-2 h-4 w-4" /> PNG
          </Button>
          <Button variant="outline" onClick={() => exportDesign("jpeg")}>
            <Download className="mr-2 h-4 w-4" /> JPG
          </Button>
          <Button variant="outline" onClick={() => exportDesign("pdf")}>
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
          className={`w-64 border-r transition-all duration-300 ${leftSidebarOpen ? "translate-x-0" : "-translate-x-full"} ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} h-full absolute left-0 z-10`}
        >
          <div className="p-4 h-full flex flex-col">
            <h2 className="text-lg font-semibold mb-4">Equipment Library</h2>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {(
                [
                  "speaker",
                  "light",
                  "stage",
                  "microphone",
                  "truss",
                  "platform",
                ] as EquipmentType[]
              ).map((type) => (
                <Button
                  key={type}
                  variant="outline"
                  className="h-24 flex flex-col items-center justify-center"
                  onClick={() => addEquipment(type)}
                >
                  <div
                    className={`w-12 h-12 ${darkMode ? "bg-gray-700" : "bg-gray-200"} mb-2 rounded flex items-center justify-center`}
                  >
                    <span className="text-lg">
                      {type === "speaker" && "🔊"}
                      {type === "light" && "💡"}
                      {type === "stage" && "🎭"}
                      {type === "microphone" && "🎤"}
                      {type === "truss" && "⛓️"}
                      {type === "platform" && "🟫"}
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
                    className={`p-2 border rounded mb-2 cursor-pointer ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
                  >
                    <div className="flex justify-between items-start">
                      <div
                        className="flex-1 truncate"
                        onClick={() => loadDesign(design)}
                      >
                        <div className="font-medium truncate">
                          {design.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(design.date).toLocaleDateString()}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDesign(index);
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
        </aside>

        {/* 3D Canvas */}
        <section
          className={`flex-1 transition-all duration-300 ${leftSidebarOpen ? "ml-64" : "ml-0"} ${rightSidebarOpen ? "mr-80" : "mr-0"}`}
        >
          <Suspense
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                Loading 3D Canvas...
              </div>
            }
          >
            <Canvas
              camera={{ position: [10, 10, 10], fov: 50 }}
              style={{ background: darkMode ? "#1a1a1a" : "#f8fafc" }}
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
          </Suspense>

          {/* Controls Overlay */}
          <div
            className={`absolute top-4 left-4 ${darkMode ? "bg-gray-800" : "bg-white"} bg-opacity-90 p-2 rounded-lg shadow-md`}
          >
            <Button
              variant={gridVisible ? "default" : "outline"}
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
          className={`w-80 border-l transition-all duration-300 ${rightSidebarOpen ? "translate-x-0" : "translate-x-full"} ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white"} h-full absolute right-0 z-10`}
        >
          <div className="p-4 h-full overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Controls</h2>

            <div className="space-y-4">
              {/* Action Mode */}
              <div>
                <Label>Action Mode</Label>
                <div className="flex gap-1 mt-2">
                  <Button
                    variant={actionMode === "move" ? "default" : "outline"}
                    onClick={() => setActionMode("move")}
                    className="flex-1 text-xs"
                    size="sm"
                  >
                    <Move3d className="mr-1 h-3 w-3" /> Move
                  </Button>
                  <Button
                    variant={actionMode === "rotate" ? "default" : "outline"}
                    onClick={() => setActionMode("rotate")}
                    className="flex-1 text-xs"
                    size="sm"
                  >
                    <RotateCw className="mr-1 h-3 w-3" /> Rotate
                  </Button>
                  <Button
                    variant={actionMode === "scale" ? "default" : "outline"}
                    onClick={() => setActionMode("scale")}
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
                      className={`mt-2 p-3 border rounded ${darkMode ? "bg-blue-900 border-blue-700 text-blue-100" : "bg-blue-50 text-blue-800"} capitalize font-medium`}
                    >
                      {selectedEquipment.type}
                    </div>
                  </div>

                  {/* Position Info */}
                  <div>
                    <Label>Position</Label>
                    <div
                      className={`mt-2 text-sm font-mono ${darkMode ? "bg-gray-700 text-gray-200" : "bg-gray-50 text-gray-600"} p-2 rounded`}
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
                          onValueChange={(value) =>
                            setScaleValue("all", value[0])
                          }
                          min={0.1}
                          max={3}
                          step={0.1}
                          className="flex-1"
                        />
                        <span
                          className={`text-sm font-mono w-12 ${darkMode ? "text-gray-200" : "text-gray-600"}`}
                        >
                          {selectedEquipment.scale[0].toFixed(1)}
                        </span>
                      </div>
                    </div>

                    {/* Individual Axis Controls */}
                    {(["x", "y", "z"] as const).map((axis, index) => (
                      <div key={axis}>
                        <Label className="text-sm">
                          {axis.toUpperCase()} Scale
                        </Label>
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
                            onValueChange={(value) =>
                              setScaleValue(axis, value[0])
                            }
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
                            className={`text-sm font-mono w-12 ${darkMode ? "text-gray-200" : "text-gray-600"}`}
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
                        onClick={() => setScaleValue("all", 0.5)}
                      >
                        50%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScaleValue("all", 1)}
                      >
                        100%
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setScaleValue("all", 2)}
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
        </aside>
      </main>
    </div>
  );
}
