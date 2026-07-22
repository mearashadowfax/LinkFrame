import {
  useRef,
  type DragEvent,
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
} from "react";
import {
  Download,
  Fullscreen,
  RefreshCcw,
  Replace,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import type { UploadStatus } from "@/components/customizer/types";

interface UploadPanelProps {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  status: UploadStatus;
  uploadProgress: number;
  error: string | null;
  onFile: (file: File) => void;
  onReset: () => void;
  onDownload: () => void;
  onPointerDown: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerMove: (event: PointerEvent<HTMLCanvasElement>) => void;
  onPointerUp: (event: PointerEvent<HTMLCanvasElement>) => void;
}

const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp";

export function UploadPanel({
  canvasRef,
  status,
  uploadProgress,
  error,
  onFile,
  onReset,
  onDownload,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}: UploadPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isReady = status === "ready";
  const isLoading = status === "reading" || status === "decoding";

  const openFilePicker = () => fileInputRef.current?.click();

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const [file] = Array.from(event.dataTransfer.files);
    if (file) onFile(file);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFilePicker();
    }
  };

  return (
    <Card className="overflow-hidden rounded-[50px] corner-squircle">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Fullscreen className="size-5 text-primary" />
          Live preview
        </CardTitle>
        <CardDescription>
          Drag the image inside the preview to fine-tune its position.
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_TYPES}
          className="sr-only"
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            if (file) onFile(file);
            event.currentTarget.value = "";
          }}
        />

        {!isReady && (
          <div
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onKeyDown={handleKeyDown}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
            className="flex aspect-square w-full flex-col items-center justify-center rounded-[50px] border border-dashed border-border bg-muted/35 p-8 text-center transition-colors outline-none corner-squircle hover:border-primary/50 hover:bg-primary/5 focus-visible:ring-3 focus-visible:ring-ring/50"
            aria-label="Upload a profile image"
          >
            {isLoading ? (
              <div
                className="w-full max-w-xs space-y-5"
                role="status"
                aria-live="polite"
              >
                {status === "reading" ? (
                  <>
                    <Progress value={uploadProgress}>
                      <ProgressLabel>Reading image</ProgressLabel>
                      <ProgressValue />
                    </Progress>
                    <p className="text-sm text-muted-foreground">
                      Preparing your image…
                    </p>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <Spinner className="size-7 text-primary" />
                    <p className="text-sm font-medium">Rendering preview…</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <span className="mb-5 inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary corner-squircle">
                  <UploadCloud className="size-7" />
                </span>
                <p className="text-base font-semibold">
                  Drop your profile image here
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  or click to browse · JPG, PNG, or WebP · max 15 MB
                </p>
                <Button
                  type="button"
                  className="mt-6 rounded-full corner-squircle"
                  tabIndex={-1}
                >
                  Choose image
                </Button>
                {error && (
                  <p
                    className="mt-4 text-sm font-medium text-destructive"
                    role="alert"
                  >
                    {error}
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <canvas
          ref={canvasRef}
          className={
            isReady
              ? "aspect-square w-full touch-none rounded-full bg-muted shadow-inner"
              : "hidden"
          }
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onPointerLeave={onPointerUp}
          aria-label="Customized LinkedIn profile frame preview"
        />
      </CardContent>

      {isReady && (
        <CardFooter className="flex flex-wrap gap-2 border-t bg-muted/35 p-4 sm:px-6">
          <Button
            type="button"
            variant="outline"
            className="rounded-full corner-squircle"
            onClick={openFilePicker}
          >
            <Replace data-icon="inline-start" />
            Replace
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="rounded-full corner-squircle"
            onClick={onReset}
          >
            <RefreshCcw data-icon="inline-start" />
            Reset
          </Button>
          <Button
            type="button"
            onClick={onDownload}
            className="rounded-full corner-squircle sm:ml-auto"
          >
            <Download data-icon="inline-start" />
            Download PNG
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
