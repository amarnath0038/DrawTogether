export interface Point {
  x: number;
  y: number;
}

export interface DrawingObject {
  id: string;
  type: 'rectangle' | 'circle' | 'ellipse' | 'square' | 'rhombus' | 'line' | 'arrow' | 'freehand' | 'text';
  start: Point;
  end: Point;
  strokeColor: string;
  fillColor: string;
  points?: Point[]; 
  text?: string; 
  selected?: boolean;
}

export type Tool = 'select' | 'rectangle' | 'circle' | 'ellipse' | 'square' | 'rhombus' | 'line' | 'arrow' | 'freehand' | 'text' | 'group-select';

export interface CanvasState {
  tool: Tool;
  objects: DrawingObject[];
  selectedObjects: string[];
  isDrawing: boolean;
  currentObject: DrawingObject | null;
  strokeColor: string;
  fillColor: string;
  isDragging: boolean;
  dragStart: Point | null;
  groupSelection: boolean;
}

export type CanvasAction =
  | { type: 'SET_TOOL'; payload: Tool }
  | { type: 'SET_STROKE_COLOR'; payload: string }
  | { type: 'SET_FILL_COLOR'; payload: string }
  | { type: 'SET_DEFAULT_COLORS'; payload: { strokeColor: string; fillColor: string } }
  | { type: 'START_DRAWING'; payload: DrawingObject }
  | { type: 'UPDATE_CURRENT_OBJECT'; payload: DrawingObject }
  | { type: 'FINISH_DRAWING'; payload?: DrawingObject }
  | { type: 'ADD_OBJECT'; payload: DrawingObject }
  | { type: 'UPDATE_OBJECTS'; payload: DrawingObject[] }
  | { type: 'SELECT_OBJECTS'; payload: string[] }
  | { type: 'START_DRAG'; payload: Point }
  | { type: 'END_DRAG' }
  | { type: 'SET_GROUP_SELECTION'; payload: boolean };