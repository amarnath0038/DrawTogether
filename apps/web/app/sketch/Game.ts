import { Tool } from "../components/Canvas";
import { getExistingShapes } from "./http";

type Shape =
  | {
      type: "pencil";
      points: [number,number][];
    }
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
      radiusX: number;
      radiusY: number;
    }
  | {
    type: "triangle";
    points: [number,number][]; // 3 pnts (x,y)
    }
  | {
    type: "rhombus";
    points: [number,number][]; // 4 pnts (x,y)
    }
  | {
    type: "line";
    start: [number,number];
    end: [number,number];
    }
  | {
    type: "arrow";
    start: [number,number];
    end: [number,number];
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
  private selectedTool: Tool = "pencil";
  private scale: number = 1;
  private pencilPoints: [number,number][] = [];
  private lastErasePoint: { x: number; y: number } | null = null;

  socket: WebSocket;

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.roomId = roomId;
    this.socket = socket;
    this.init();
    this.initHandlers();
    this.initMouseHandlers();
  }

  async init() {
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
      } else if (message.type === "clear") {
        this.clearAllShapes(false);
      }
    };
  }
  private drawArrow(start: [number, number], end: [number, number]) {
    const [x1, y1] = start;
    const [x2, y2] = end;

    const headlen = 10;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    this.ctx.lineTo(
      x2 - headlen * Math.cos(angle - Math.PI/6),
      y2 - headlen * Math.sin(angle - Math.PI/6)
    );
    this.ctx.moveTo(x2, y2);
    this.ctx.lineTo(
      x2 - headlen * Math.cos(angle + Math.PI/6),
      y2 - headlen * Math.sin(angle + Math.PI/6)
    );
    this.ctx.stroke();
    this.ctx.closePath();
  }

  private pointInPolygon(x: number, y: number, points: { x: number; y: number }[]): boolean {
    let inside = false;
    for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
      const p1 = points[i];
      const p2 = points[j]
      if (!p1 || !p2) {
        continue;
      }
      const xi = p1.x, yi = p1.y;
      const xj = p2.x, yj = p2.y;

      const intersect =
        yi > y !== yj > y &&
        x < ((xj - xi) * (y - yi))/(yj - yi + Number.EPSILON) + xi;

      if (intersect) {
        inside = !inside;
      }
    }
    return inside;
  }

  
  private pointNearLine(
    x: number,
    y: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    threshold: number
  ): boolean {
    // Calc dist from point to line 
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;
    if (len_sq !== 0) param = dot/len_sq;

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }
    const dx = x - xx;
    const dy = y - yy;
    return dx * dx + dy * dy <= threshold * threshold;
  }

  private getIntermediatePoints(x1: number, y1: number, x2: number, y2: number, spacing = 4): {x: number, y: number}[] {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance/spacing);
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const t = i/steps;
      points.push({
        x: x1 + t * dx,
        y: y1 + t * dy,
      });
    }
  return points;
}


  private hitTest(shape: Shape, x: number, y: number): boolean {
  console.log("HitTest >> Checking shape:", shape, "at", x, y);

  switch (shape.type) {
    case "pencil": {
      const hit = shape.points.some(([px, py]) => {
        const dx = x - px;
        const dy = y - py;
        return dx * dx + dy * dy <= 25; // radius squared(5px)
      });
      return hit;
    }

    case "rect": {
      const hit =
        x >= shape.x &&
        x <= shape.x + shape.width &&
        y >= shape.y &&
        y <= shape.y + shape.height;
      return hit;
    }

    case "circle": {
      const dx = x - shape.centerX;
      const dy = y - shape.centerY;
      const hit = (dx * dx) / (shape.radiusX * shape.radiusX) + (dy * dy) / (shape.radiusY * shape.radiusY) <= 1;
      return hit;
    }

    case "triangle":
    case "rhombus": {
      const polyPoints = shape.points.map(([px, py]) => ({ x: px, y: py }));
      const hit = this.pointInPolygon(x, y, polyPoints);
      return hit;
    }

    case "line":
    case "arrow": {
      const hit = this.pointNearLine(
        x,
        y,
        shape.start[0],
        shape.start[1],
        shape.end[0],
        shape.end[1],
        5 // px tolerance
      );
      return hit;
    }

    default:
      console.warn("Hitlist ka shape nahi pata:", shape);
      return false;
  }
}

  
  private eraseShapeAt(x: number, y: number) {
    for (let i = this.existingShapes.length - 1; i >= 0; i--) {
      const shape = this.existingShapes[i];
      if (!shape) {
        return;
      }
      console.log("Checking shape", shape);
      if (this.hitTest(shape, x, y)) {
        this.existingShapes.splice(i, 1);
        this.clearCanvas();
        this.socket.send(JSON.stringify({
          type: "chat",
          message: JSON.stringify({ deletedShapeIndex: i }), 
          roomId: this.roomId
        }));
        return;
      }
    }
  }


  clearCanvas() {
    const { width, height } = this.canvas;
    this.ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    this.ctx.clearRect(0, 0, width/this.scale, height/this.scale);

    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, width/this.scale, height/this.scale);

    for (const shape of this.existingShapes) {
      this.ctx.strokeStyle = "white";
      if (shape.type === "pencil") {
        this.ctx.beginPath();
        if (shape.points.length > 0 && shape.points[0] !== undefined) {
          const [x0,y0] = shape.points[0];
          this.ctx.moveTo(x0,y0);
          for (const [x, y] of shape.points.slice(1)) {
            this.ctx.lineTo(x, y);
          }
          this.ctx.stroke();
          this.ctx.closePath();
        }
      } else if (shape.type === "line") {
        const { start, end } = shape;
        this.ctx.beginPath();
        this.ctx.moveTo(...start);
        this.ctx.lineTo(...end);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "arrow") {
        this.drawArrow(shape.start, shape.end);
      } else if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        this.ctx.beginPath();
        this.ctx.ellipse(shape.centerX, shape.centerY, shape.radiusX, shape.radiusY, 0, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.closePath();
      } else if (shape.type === "triangle" || shape.type === "rhombus") {
        this.ctx.beginPath();
        const [first, ...rest] = shape.points;
        if (!first) {
          return;
        }
        this.ctx.moveTo(first[0], first[1]);
        for (const [x, y] of rest) {
          this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.stroke();
      }
    }
  }

  mouseDownHandler = (e: MouseEvent) => {
    this.clicked = true;
    this.startX = e.offsetX/this.scale;
    this.startY = e.offsetY/this.scale;
    console.log("Selected tool:", this.selectedTool);
    if (this.selectedTool === "pencil") {
      this.pencilPoints = [[this.startX, this.startY]];
    } else if (this.selectedTool === "eraser") {
      this.eraseShapeAt(this.startX, this.startY);
      this.lastErasePoint = { x: this.startX, y: this.startY };
      return;
    }

  };

  mouseUpHandler = (e: MouseEvent) => {
    this.clicked = false;
    this.lastErasePoint = null;
    const endX = e.offsetX/this.scale;
    const endY = e.offsetY/this.scale;

    const width = endX - this.startX;
    const height = endY - this.startY;

    let shape: Shape | null = null;

    if (this.selectedTool === "pencil") {
      shape = {
        type: "pencil",
        points: this.pencilPoints
      };
    } else if (this.selectedTool === "line") {
      shape = {
        type: "line",
        start: [this.startX, this.startY],
        end: [endX, endY]
      };
    } else if (this.selectedTool === "arrow") {
      shape = {
        type: "arrow",
        start: [this.startX, this.startY],
        end: [endX, endY]
      };
    } else if (this.selectedTool === "rect") {
      shape = {
        type: "rect",
        x: this.startX,
        y: this.startY,
        width,
        height,
      };
    } else if (this.selectedTool === "circle") {
      const centerX = (this.startX + endX)/2;
      const centerY = (this.startY + endY)/2;
      const radiusX = Math.abs((endX - this.startX))/2;
      const radiusY = Math.abs(endY - this.startY)/2;
      shape = {
        type: "circle",
        centerX,
        centerY,
        radiusX,
        radiusY
      };
    } else if (this.selectedTool === "triangle") {
      const midX = (this.startX + endX)/2;
      const topY = Math.min(this.startY, endY);
      const bottomY = Math.max(this.startY, endY);
      shape = {
        type: "triangle",
        points: [
          [midX, this.startY], // top vertex
          [this.startX, endY], // b-l
          [endX, endY]         // b-r
        ]
      };
    } else if (this.selectedTool === "rhombus") {
      const midX = (this.startX + endX)/2;
      const midY = (this.startY + endY)/2;
      shape = {
        type: "rhombus",
        points: [
          [midX, this.startY], // t
          [this.startX, midY], // l
          [midX, endY],        // b
          [endX, midY]         // r
        ]
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

    if (this.selectedTool === "eraser") {
      if (this.lastErasePoint) {
        const points = this.getIntermediatePoints(this.lastErasePoint.x, this.lastErasePoint.y, currX, currY);
        for (const p of points) {
          this.eraseShapeAt(p.x, p.y);
        }
      }

      this.lastErasePoint = { x: currX, y: currY };
      return; 
    }
    if (this.selectedTool === "pencil" && this.clicked) {
      const x = e.offsetX / this.scale;
      const y = e.offsetY / this.scale;
      this.pencilPoints.push([x, y]);
      this.clearCanvas();
      
      this.ctx.beginPath();
      if (this.pencilPoints.length > 0 && this.pencilPoints[0] !== undefined) {
        this.ctx.moveTo(...this.pencilPoints[0]);
      }
      for (const [px, py] of this.pencilPoints.slice(1)) {
        this.ctx.lineTo(px, py);
      }
      this.ctx.stroke();
    } else if (this.selectedTool === "line") {
      this.ctx.beginPath();
      this.ctx.moveTo(this.startX, this.startY);
      this.ctx.lineTo(currX, currY);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "arrow") {
      this.drawArrow([this.startX, this.startY], [currX, currY]);
    } else if (this.selectedTool === "rect") {
      this.ctx.strokeRect(this.startX, this.startY, width, height);
    } else if (this.selectedTool === "circle") {
      const centerX = (this.startX + currX)/2;
      const centerY = (this.startY + currY)/2;
      const radiusX = Math.abs(currX - this.startX)/2;
      const radiusY = Math.abs(currY - this.startY)/2;
      this.ctx.beginPath();
      this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.closePath();
    } else if (this.selectedTool === "triangle") {
      const midX = (this.startX + currX)/2;
      this.ctx.beginPath();
      this.ctx.moveTo(midX, this.startY);
      this.ctx.lineTo(this.startX, currY);
      this.ctx.lineTo(currX, currY);
      this.ctx.closePath();
      this.ctx.stroke();
    } else if (this.selectedTool === "rhombus") {
      const midX = (this.startX + currX)/2;
      const midY = (this.startY + currY)/2;
      this.ctx.beginPath();
      this.ctx.moveTo(midX, this.startY);
      this.ctx.lineTo(currX, midY);
      this.ctx.lineTo(midX, currY);
      this.ctx.lineTo(this.startX, midY);
      this.ctx.closePath();
      this.ctx.stroke();
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

  clearAllShapes(broadcast = true) {
    this.existingShapes = [];
    this.undoneShapes = [];
    this.clearCanvas();

    if (broadcast) {
      this.socket.send(JSON.stringify({
        type: "clear",
        roomId: this.roomId,
      }));
    }
  }

}


