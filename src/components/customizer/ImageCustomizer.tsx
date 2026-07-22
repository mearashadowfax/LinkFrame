import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from "react";
import { Frame, ImageIcon, Type } from "lucide-react";

import { ColorField, NumberStepper, SliderField } from "./ControlFields";
import { UploadPanel } from "./UploadPanel";
import {
  CANVAS_SIZE,
  DEFAULT_SETTINGS,
  type EditorSettings,
  type UploadStatus,
} from "./types";
import { downloadCanvas, renderCanvas } from "./canvas";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";

const FONT_SIZES = [16, 20, 24, 32, 34, 36, 40, 44, 48, 52, 56] as const;
const LETTER_SPACING = [
  -0.3, -0.25, -0.2, -0.15, -0.1, -0.075, -0.05, -0.025, 0, 0.025, 0.05, 0.075,
  0.1, 0.15, 0.2, 0.25, 0.3,
] as const;
const MAX_FILE_SIZE = 15 * 1024 * 1024;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

interface DragState {
  pointerId: number;
  x: number;
  y: number;
}

function ControlCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="rounded-[50px] corner-squircle">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

export default function ImageCustomizer() {
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [status, setStatus] = useState<UploadStatus>("empty");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const uploadRequestRef = useRef(0);

  const updateSetting = <Key extends keyof EditorSettings>(
    key: Key,
    value: EditorSettings[Key],
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    if (canvasRef.current && image) {
      renderCanvas(canvasRef.current, image, settings);
    }
  }, [image, settings]);

  const handleFile = useCallback((file: File) => {
    setError(null);

    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setError("Choose a JPG, PNG, or WebP image.");
      setStatus("empty");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Choose an image smaller than 15 MB.");
      setStatus("empty");
      return;
    }

    const requestId = uploadRequestRef.current + 1;
    uploadRequestRef.current = requestId;
    const reader = new FileReader();

    setStatus("reading");
    setUploadProgress(0);

    reader.onprogress = (event) => {
      if (requestId !== uploadRequestRef.current || !event.lengthComputable) {
        return;
      }
      setUploadProgress(Math.round((event.loaded / event.total) * 100));
    };

    reader.onerror = () => {
      if (requestId !== uploadRequestRef.current) return;
      setError("The image could not be read. Please try another file.");
      setStatus("empty");
    };

    reader.onload = () => {
      if (
        requestId !== uploadRequestRef.current ||
        typeof reader.result !== "string"
      ) {
        return;
      }

      setUploadProgress(100);
      setStatus("decoding");
      const nextImage = new Image();

      nextImage.onload = () => {
        if (requestId !== uploadRequestRef.current) return;
        setSettings((current) => ({
          ...current,
          imageOffset: { x: 0, y: 0 },
        }));
        setImage(nextImage);
        setStatus("ready");
      };
      nextImage.onerror = () => {
        if (requestId !== uploadRequestRef.current) return;
        setError("The image format could not be decoded.");
        setStatus("empty");
      };
      nextImage.src = reader.result;
    };

    reader.readAsDataURL(file);
  }, []);

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    event.currentTarget.style.cursor = "grabbing";
  };

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const scale = CANVAS_SIZE / rect.width;
    const deltaX = (event.clientX - drag.x) * scale;
    const deltaY = (event.clientY - drag.y) * scale;

    dragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    setSettings((current) => ({
      ...current,
      imageOffset: {
        x: current.imageOffset.x + deltaX,
        y: current.imageOffset.y + deltaY,
      },
    }));
  };

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current?.pointerId !== event.pointerId) return;
    dragRef.current = null;
    event.currentTarget.style.cursor = "grab";
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  const handleDownload = async () => {
    if (!canvasRef.current) return;
    try {
      await downloadCanvas(canvasRef.current);
    } catch {
      setError("The PNG could not be created. Please try again.");
    }
  };

  return (
    <TooltipProvider>
      <section
        id="customizer"
        className="relative mx-auto grid w-full max-w-7xl items-start gap-6 px-4 pb-20 sm:px-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(28rem,1.2fr)] lg:gap-8 lg:px-8 lg:pb-28"
      >
        <div className="space-y-4">
          <ControlCard
            icon={<ImageIcon className="size-4.5" />}
            title="Image"
            description="Adjust the photo's position, angle, and scale."
          >
            <SliderField
              label="Rotation"
              value={settings.rotation}
              min={-180}
              max={180}
              onChange={(value) => updateSetting("rotation", value)}
            />
            <Separator />
            <SliderField
              label="Scale"
              value={settings.scale}
              min={0.1}
              max={1.9}
              step={0.1}
              onChange={(value) => updateSetting("scale", value)}
            />
            <ColorField
              label="Background"
              description="Visible behind the image when it does not fill the frame."
              value={settings.backgroundColor}
              onChange={(value) => updateSetting("backgroundColor", value)}
            />
          </ControlCard>

          <ControlCard
            icon={<Frame className="size-4.5" />}
            title="Frame"
            description="Shape and color the circular accent."
          >
            <ColorField
              label="Frame color"
              description="Choose the color used for the circular frame."
              value={settings.frameColor}
              onChange={(value) => updateSetting("frameColor", value)}
            />
            <SliderField
              label="Thickness"
              value={settings.frameThickness}
              min={0}
              max={100}
              onChange={(value) => updateSetting("frameThickness", value)}
            />
            <Separator />
            <SliderField
              label="Start position"
              value={settings.startPosition}
              min={0}
              max={100}
              onChange={(value) => updateSetting("startPosition", value)}
            />
            <SliderField
              label="End position"
              value={settings.endPosition}
              min={0}
              max={100}
              onChange={(value) => updateSetting("endPosition", value)}
            />
          </ControlCard>

          <ControlCard
            icon={<Type className="size-4.5" />}
            title="Text"
            description="Add a short message around the profile frame."
          >
            <div className="space-y-2.5">
              <Label htmlFor="frame-text">Frame text</Label>
              <Input
                id="frame-text"
                value={settings.frameText}
                maxLength={32}
                className="rounded-full! corner-squircle!"
                placeholder="#ONTHEHUNT"
                onChange={(event) =>
                  updateSetting(
                    "frameText",
                    event.currentTarget.value.toUpperCase(),
                  )
                }
              />
            </div>
            <ColorField
              label="Text color"
              description="Choose a high-contrast color for readable frame text."
              value={settings.textColor}
              onChange={(value) => updateSetting("textColor", value)}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberStepper
                label="Font size"
                value={settings.fontSize}
                values={FONT_SIZES}
                onChange={(value) => updateSetting("fontSize", value)}
              />
              <NumberStepper
                label="Letter spacing"
                value={settings.letterSpacing}
                values={LETTER_SPACING}
                onChange={(value) => updateSetting("letterSpacing", value)}
              />
            </div>
            <SliderField
              label="Text placement"
              value={settings.textPlacement}
              min={0}
              max={200}
              onChange={(value) => updateSetting("textPlacement", value)}
            />
          </ControlCard>
        </div>

        <div className="lg:sticky lg:top-8">
          <UploadPanel
            canvasRef={canvasRef}
            status={status}
            uploadProgress={uploadProgress}
            error={error}
            onFile={handleFile}
            onReset={() => setSettings(DEFAULT_SETTINGS)}
            onDownload={handleDownload}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          />
        </div>
      </section>
    </TooltipProvider>
  );
}
