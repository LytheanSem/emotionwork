"use client";
import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";

import ControlsPanel from "@/app/(app)/(home)/design/components/ControlsPanel";
import { Equipment } from "@/app/(app)/(home)/design/components/Equipment";
import { EquipmentLibrary } from "@/app/(app)/(home)/design/components/EquipmentLibrary";
import { FullGrid } from "@/app/(app)/(home)/design/components/FullGrid";
import { useDesignStore } from "@/app/(app)/(home)/design/hooks/useDesignStore";
import { loadTemplate } from "@/app/(app)/(home)/design/templates/stageTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSession } from "next-auth/react";
import { shouldHandleGlobalShortcut } from "@/lib/keyboard-utils";
import { Grid3x3, PanelLeft, PanelRight } from "lucide-react";

export default function StageDesigner() {
  const { status } = useSession();
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
  } = useDesignStore();

  const [gridVisible, setGridVisible] = useState(true);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [controlsEnabled, setControlsEnabled] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rendererRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sceneRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cameraRef = useRef<any>(null);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedEquipmentId) return;

      // Early-return when typing in inputs, textareas, or contenteditable
      if (!shouldHandleGlobalShortcut()) return;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          moveUpSelected();
          break;
        case "ArrowDown":
          e.preventDefault();
          moveDownSelected();
          break;
        case "ArrowLeft":
          e.preventDefault();
          moveLeftSelected();
          break;
        case "ArrowRight":
          e.preventDefault();
          moveRightSelected();
          break;
        case "Delete":
          e.preventDefault();
          deleteSelected();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedEquipmentId, moveUpSelected, moveDownSelected, moveLeftSelected, moveRightSelected, deleteSelected]);

  const handleLoadTemplate = useCallback(
    (templateId: string) => {
      try {
        const templateEquipment = loadTemplate(templateId);
        setEquipment(templateEquipment);
        setSelectedEquipmentId(null);
        setDesignName(`Template: ${templateId}`);
      } catch (error) {
        console.error("Error loading template:", error);
        alert("Failed to load template. Please try again.");
      }
    },
    [setEquipment, setSelectedEquipmentId, setDesignName]
  );

  // Auth gating: only allow logged-in users to access the playground
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-cyan-100/80 text-lg">Loading your playground...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-4 z-0">
        <div className="max-w-md w-full bg-white/95 rounded-2xl shadow-2xl border border-cyan-500/20 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Playground access</h1>
          <p className="text-gray-600 mb-6">
            Sign in to use the interactive 3D playground and experiment with stage designs.
          </p>
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => (window.location.href = "/sign-in")}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500"
            >
              Go to sign in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const selectedEquipment = equipment.find((item) => item.id === selectedEquipmentId);

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
            <h1 className="text-xl font-medium text-gray-900">Playground</h1>
          </div>

          {/* Center */}
          <div className="flex-1 max-w-xs mx-8">
            <Input
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="text-center border-gray-200 focus:border-gray-400 transition-colors"
              placeholder="Untitled playground"
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
            leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } bg-white fixed left-0 z-10 overflow-hidden`}
          style={{
            top: "5rem",
            height: "calc(100vh - 5rem - 4rem)",
            bottom: "4rem",
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
            leftSidebarOpen ? "ml-80" : "ml-0"
          } ${rightSidebarOpen ? "mr-80" : "mr-0"} bg-white m-4 rounded-xl shadow-sm border border-gray-100`}
          ref={canvasRef}
        >
          <Canvas
            shadows={true}
            camera={{ position: [10, 10, 10], fov: 50 }}
            style={{ background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" }}
            gl={{ preserveDrawingBuffer: true, antialias: true }}
            onCreated={({ gl, scene, camera }) => {
              rendererRef.current = gl;
              sceneRef.current = scene;
              cameraRef.current = camera;
              // Ensure the renderer preserves the drawing buffer for export
              gl.domElement.style.display = "block";
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
              variant={gridVisible ? "default" : "outline"}
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
            rightSidebarOpen ? "translate-x-0" : "translate-x-full"
          } bg-white fixed right-0 z-10 overflow-hidden`}
          style={{
            top: "5rem",
            height: "calc(100vh - 5rem - 4rem)",
            bottom: "4rem",
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
          />
        </aside>
      </main>
    </div>
  );
}
