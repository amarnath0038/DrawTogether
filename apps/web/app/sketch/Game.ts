import { Tool } from "../components/Canvas";
import { getExistingShapes } from "./http";
import { getActualRoomId } from "../utils/room";

type Shape =
  | {
      type: "rect";
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | {
      type: "circle";
      centerX: number;
      centerY: number;
      radius: number;
    };

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingShapes: Shape[] = [];
  private undoneShapes: Shape[] = [];
  private roomId: string;
  private clicked: boolean = false;
  private startX = 0;
  private startY = 0;
  private selectedTool: Tool = "circle";
  private scale: number = 1;

  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomSlug: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomSlug;
    this.socket = socket;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  async init() {
    const actualRoomId = await getActualRoomId(this.roomId);
    if (!actualRoomId) {
      throw new Error("Invalid room slug.");
    }
    this.roomId = actualRoomId;
    this.existingShapes = await getExistingShapes(this.roomId);
    this.clearCanvas();
  }

  destroy() {
    this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
    this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
    this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  initHandlers() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingShapes.push(parsedShape.shape);
        this.clearCanvas();
      } else if (message.type === "undo") {
        this.undo(false);
      } else if (message.type === "redo") {
        this.redo(false);
      }
    };
  }

  clearCanvas() {
    const { width, height } = this.canvas;
    this.ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    this.ctx.clearRect(0, 0, width/this.scale, height/this.scale);

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, width/this.scale, height/this.scale);

    for (const shape of this.existingShapes) {
      this.ctx.strokeStyle = "white";
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(shape.centerX, shape.centerY, shape.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.offsetX/this.scale;
    this.startY = e.offsetY/this.scale;
  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    const endX = e.offsetX/this.scale;
    const endY = e.offsetY/this.scale;

    const width = endX - this.startX;
    const height = endY - this.startY;

    let shape: Shape | null = null;

    if (this.selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (this.selectedTool === "circle") {
      const radius = Math.max(width, height)/2;
      shape = {
        type: "circle",
        centerX: this.startX + radius,
        centerY: this.startY + radius,
        radius,
      };
    }
    if (!shape) {
      return;
    }
    this.existingShapes.push(shape);
    this.undoneShapes = [];

    this.socket.send(
      JSON.stringify({
        type: "chat",
        message: JSON.stringify({ shape }),
        roomId: this.roomId,
      })
    );
    this.clearCanvas();
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.clicked) return;

    const currX = e.offsetX/this.scale;
    const currY = e.offsetY/this.scale;
    const width = currX - this.startX;
    const height = currY - this.startY;

    this.clearCanvas();

    this.ctx.strokeStyle = "white";
    if (this.selectedTool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
    } else if (this.selectedTool === "circle") {
      const radius = Math.max(width, height)/2;
      const centerX = this.startX + radius;
      const centerY = this.startY + radius;
      this.ctx.beginPath();
      this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    }
  };

  initMouseHandlers() {
    this.canvas.addEventListener("mousedown", this.mouseDownHandler);
    this.canvas.addEventListener("mouseup", this.mouseUpHandler);
    this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
  }

  zoom(factor: number) {
    this.scale *= factor;
    this.clearCanvas();
  }

  resetZoom() {
    this.scale = 1;
    this.clearCanvas();
  }

  getScale() {
    return this.scale;
  }

  undo(broadcast = true) {
    const last = this.existingShapes.pop();
    if (last) {
      this.undoneShapes.push(last);
      this.clearCanvas();

      if (broadcast) {
        this.socket.send(JSON.stringify({
            type: "undo",
            roomId: this.roomId
        }));
      }
    }
  }

  redo(broadcast = true) {
    const restored = this.undoneShapes.pop();
    if (restored) {
      this.existingShapes.push(restored);
      this.clearCanvas();

      if (broadcast) {
        this.socket.send(JSON.stringify({
            type: "redo",
            roomId: this.roomId
        }));
      }
    }
  }
}
