import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import {
  Circle,
  Pencil,
  ArrowRight,
  Square,
  Triangle,
  Diamond,
  Plus,
  Minus,
  Undo,
  Redo,
  Users,
  Trash2,
  Eraser
} from "lucide-react";
import { Game } from "../sketch/Game";

export type Tool = "pencil" | "line" | "arrow" | "rect" | "circle" | "triangle" | "rhombus" | "eraser";

export function Canvas({
  roomId,
  socket,
  onCollaborate
}: {
  socket: WebSocket;
  roomId: string;
  onCollaborate: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [game, setGame] = useState<Game>();
  const [selectedTool, setSelectedTool] = useState<Tool>("circle");
  const [scale, setScale] = useState(1);

  useEffect(() => {
    game?.setTool(selectedTool);
  }, [selectedTool, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(canvasRef.current, roomId, socket);
      setGame(g);

      const interval = setInterval(() => {
        setScale(g.getScale());
      }, 100);

      return () => {
        clearInterval(interval);
        g.destroy();
      };
    }
  }, [canvasRef]);

  const handleZoomIn = () => {
    game?.zoom(1.1);
  };

  const handleZoomOut = () => {
    game?.zoom(0.9);
  };

  const handleResetZoom = () => {
    game?.resetZoom();
  };

  return (
    <div className="h-screen w-screen relative bg-zinc-900">
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} />
      <Topbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetZoom={handleResetZoom}
        scale={scale}
        onUndo={() => game?.undo()}
        onRedo={() => game?.redo()}
        onClear={() => game?.clearAllShapes()}
        onCollaborate={onCollaborate}
      />
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  scale,
  onUndo,
  onRedo,
  onClear,
  onCollaborate
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  scale: number;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onCollaborate: () => void;
}) {
  return (
    <>
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-[1px] px-3 py-0.2 bg-zinc-800 shadow-lg rounded-lg z-50">
        <IconButton
          onClick={() => setSelectedTool("pencil")}
          activated={selectedTool === "pencil"}
          title={"Pencil"}
          icon={<Pencil size={20} />}
        />
        <IconButton
          onClick={() => setSelectedTool("rect")}
          activated={selectedTool === "rect"}
          title={"Rectangle"}
          icon={<Square size={20} />}
        />
        <IconButton
          onClick={() => setSelectedTool("circle")}
          activated={selectedTool === "circle"}
          title={"Circle"}
          icon={<Circle size={20} />}
        />
        <IconButton
          onClick={() => setSelectedTool("triangle")}
          activated={selectedTool === "triangle"}
          title={"Triangle"}
          icon={<Triangle size={20} />}
        />
        <IconButton
          onClick={() => setSelectedTool("rhombus")}
          activated={selectedTool === "rhombus"}
          title={"Rhombus"}
          icon={<Diamond size={20} />}
        />
        <IconButton
          onClick={() => setSelectedTool("line")}
          activated={selectedTool === "line"}
          title={"Line"}
          icon={<Minus size={20} />}
        />
        <IconButton
          onClick={() => setSelectedTool("arrow")}
          activated={selectedTool === "arrow"}
          title={"Arrow"}
          icon={<ArrowRight size={20} />}
        />
        <IconButton
          onClick={() => setSelectedTool("eraser")}
          activated={selectedTool === "eraser"}
          title={"Eraser"}
          icon={<Eraser size={20} />}
        />
        <div className="w-[1px] h-6 bg-zinc-600 mx-2" />
        <IconButton onClick={onUndo} icon={<Undo size={20} />} activated={false} title={"Undo"} />
        <IconButton onClick={onRedo} icon={<Redo size={20} />} activated={false} title={"Redo"} />
        <IconButton onClick={onClear} icon={<Trash2 size={20} />} activated={false} title={"Delete canvas"} />
        <IconButton onClick={onCollaborate} activated={false} icon={<Users size={20} />} title={"Collaborate"} />
      </div>

      {/*Zoom*/}
      <div className="fixed bottom-4 left-4 flex items-center gap-3 px-4 py-2 bg-zinc-800 shadow-lg rounded-lg z-50">
        <button
          onClick={onZoomOut}
          className="p-2 rounded hover:bg-zinc-700 transition-colors"
          title="Zoom Out"
        >
          <Minus size={18} className="text-white" />
        </button>
        <span
          className="text-white text-sm min-w-[50px] text-center cursor-pointer"
          title="Reset Zoom"
          onClick={onResetZoom}
        >
          {new Intl.NumberFormat("en-GB", { style: "percent" }).format(scale)}
        </span>
        <button
          onClick={onZoomIn}
          className="p-2 rounded hover:bg-zinc-700 transition-colors"
          title="Zoom In"
        >
          <Plus size={18} className="text-white" />
        </button>
      </div>
    </>
  );
}

