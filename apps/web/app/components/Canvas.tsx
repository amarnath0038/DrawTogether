import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import {
  Circle,
  Pencil,
  Square,
  Plus,
  Minus,
  Undo,
  Redo,
} from "lucide-react";
import { Game } from "../sketch/Game";

export type Tool = "circle" | "rect" | "pencil";

export function Canvas({
  roomId,
  socket,
}: {
  socket: WebSocket;
  roomId: string;
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
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  scale: number;
  onUndo: () => void;
  onRedo: () => void;
}) {
  return (
    <>
      {/* Tool selection top center */}
      <div
        className="fixed top-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 px-4 py-1 bg-zinc-800 shadow-lg rounded-lg z-50"
      >
        <IconButton
          onClick={() => setSelectedTool("pencil")}
          activated={selectedTool === "pencil"}
          icon={<Pencil size={20} />}
        />
        <IconButton
          onClick={() => setSelectedTool("rect")}
          activated={selectedTool === "rect"}
          icon={<Square size={20} />}
        />
        <IconButton
          onClick={() => setSelectedTool("circle")}
          activated={selectedTool === "circle"}
          icon={<Circle size={20} />}
        />
        <div className="w-[1px] h-6 bg-zinc-600 mx-2" />
        <IconButton onClick={onUndo} icon={<Undo size={20} />} activated={false} />
        <IconButton onClick={onRedo} icon={<Redo size={20} />} activated={false} />
      </div>

      {/* Zoom control bottom left */}
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

