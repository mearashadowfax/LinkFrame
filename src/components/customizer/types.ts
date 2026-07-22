export const CANVAS_SIZE = 800;

export interface Point {
  x: number;
  y: number;
}

export interface EditorSettings {
  rotation: number;
  scale: number;
  backgroundColor: string;
  frameColor: string;
  frameThickness: number;
  startPosition: number;
  endPosition: number;
  frameText: string;
  textColor: string;
  fontSize: number;
  letterSpacing: number;
  textPlacement: number;
  imageOffset: Point;
}

export const DEFAULT_SETTINGS: EditorSettings = {
  rotation: 0,
  scale: 1,
  backgroundColor: "#E8F1FF",
  frameColor: "#0EA5E9",
  frameThickness: 50,
  startPosition: 16,
  endPosition: 56,
  frameText: "#ONTHEHUNT",
  textColor: "#0F172A",
  fontSize: 44,
  letterSpacing: 0,
  textPlacement: 130,
  imageOffset: { x: 0, y: 0 },
};

export type UploadStatus = "empty" | "reading" | "decoding" | "ready";
