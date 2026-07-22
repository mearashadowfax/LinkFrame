import {
  CANVAS_SIZE,
  type EditorSettings,
} from "@/components/customizer/types";

const DESIGN_SIZE = 400;
const DESIGN_SCALE = CANVAS_SIZE / DESIGN_SIZE;

function drawImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  settings: EditorSettings,
) {
  const coverScale = Math.max(
    CANVAS_SIZE / image.naturalWidth,
    CANVAS_SIZE / image.naturalHeight,
  );
  const imageScale = coverScale * settings.scale;

  context.save();
  context.translate(
    CANVAS_SIZE / 2 + settings.imageOffset.x,
    CANVAS_SIZE / 2 + settings.imageOffset.y,
  );
  context.rotate((settings.rotation * Math.PI) / 180);
  context.scale(imageScale, imageScale);
  context.drawImage(image, -image.naturalWidth / 2, -image.naturalHeight / 2);
  context.restore();
}

function hexToRgba(hex: string, alpha: number): string {
  const value = hex.replace("#", "");
  const normalized =
    value.length === 3
      ? value
          .split("")
          .map((character) => character.repeat(2))
          .join("")
      : value;
  const color = Number.parseInt(normalized, 16);

  return `rgba(${(color >> 16) & 255}, ${(color >> 8) & 255}, ${color & 255}, ${Math.min(1, Math.max(0, alpha))})`;
}

function drawFrame(
  context: CanvasRenderingContext2D,
  settings: EditorSettings,
) {
  const lineWidth = settings.frameThickness * DESIGN_SCALE;
  const startAngle = Math.PI * (settings.startPosition / 50);
  let endAngle = Math.PI * (settings.endPosition / 50);

  if (endAngle < startAngle) {
    endAngle += Math.PI * 2;
  }

  const totalAngle = endAngle - startAngle;
  if (totalAngle <= 0) return;

  const radius = CANVAS_SIZE / 2 - lineWidth / 2;
  const steps = 250;

  context.lineWidth = lineWidth;
  context.lineCap = "butt";

  for (let index = 0; index <= steps; index += 1) {
    const progress = index / steps;
    let opacity = 1;
    if (progress < 0.2) opacity = progress * 7;
    else if (progress > 0.7) opacity = (1 - progress) * 7;

    context.beginPath();
    context.arc(
      CANVAS_SIZE / 2,
      CANVAS_SIZE / 2,
      radius,
      startAngle + progress * totalAngle,
      startAngle + (progress + 1 / steps) * totalAngle,
    );
    context.strokeStyle = hexToRgba(settings.frameColor, opacity);
    context.stroke();
  }
}

function drawText(context: CanvasRenderingContext2D, settings: EditorSettings) {
  const text = settings.frameText.trim().toUpperCase();
  if (!text) return;

  const fontSize = settings.fontSize * DESIGN_SCALE;
  const radius =
    CANVAS_SIZE / 2 - (settings.frameThickness * DESIGN_SCALE) / 2.2;
  const baseAnglePerCharacter = (Math.PI / text.length) * 0.6;
  const anglePerCharacter = baseAnglePerCharacter + settings.letterSpacing;
  const totalTextAngle = anglePerCharacter * text.length;
  const placement = (settings.textPlacement / 100) * Math.PI - Math.PI / 2;
  const startAngle = Math.PI - totalTextAngle / 2 + placement;

  context.save();
  context.translate(CANVAS_SIZE / 2, CANVAS_SIZE / 2);
  context.font = `700 ${fontSize}px "Geist Variable", sans-serif`;
  context.fillStyle = settings.textColor;
  context.textAlign = "center";
  context.textBaseline = "middle";

  Array.from(text).forEach((character, index) => {
    const angle = startAngle - index * anglePerCharacter;
    context.save();
    context.rotate(angle);
    context.translate(0, -radius);
    context.rotate(Math.PI);
    context.fillText(character, 0, 0);
    context.restore();
  });

  context.restore();
}

export function renderCanvas(
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  settings: EditorSettings,
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.fillStyle = settings.backgroundColor;
  context.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

  drawImage(context, image, settings);
  drawFrame(context, settings);
  drawText(context, settings);
}

export async function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename = "linkedin-profile-frame.png",
) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Unable to create the image file."));
      }
    }, "image/png");
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
