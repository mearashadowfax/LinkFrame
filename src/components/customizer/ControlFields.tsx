import { useEffect, useId, useState } from "react";
import { HelpCircle, Minus, Plus, Shuffle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const HEX_COLOR_PATTERN = /^#[0-9A-F]{6}$/i;

interface SliderFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
}

export function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: SliderFieldProps) {
  const id = useId();

  const updateValue = (nextValue: number) => {
    if (Number.isNaN(nextValue)) return;
    onChange(Math.min(max, Math.max(min, nextValue)));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <Label htmlFor={id}>{label}</Label>
        <Input
          id={id}
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(event) => updateValue(event.currentTarget.valueAsNumber)}
          className="h-8 w-20 rounded-full text-right tabular-nums corner-squircle"
          aria-label={`${label} value`}
        />
      </div>
      <Slider
        aria-label={label}
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(nextValue) =>
          onChange(typeof nextValue === "number" ? nextValue : nextValue[0])
        }
      />
    </div>
  );
}

interface ColorFieldProps {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
}

function randomColor() {
  return `#${Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 16).toString(16),
  )
    .join("")
    .toUpperCase()}`;
}

export function ColorField({
  label,
  description,
  value,
  onChange,
}: ColorFieldProps) {
  const id = useId();
  const [draft, setDraft] = useState(value);

  useEffect(() => setDraft(value), [value]);

  const commitDraft = () => {
    const normalized = draft.startsWith("#") ? draft : `#${draft}`;
    if (HEX_COLOR_PATTERN.test(normalized)) {
      onChange(normalized.toUpperCase());
    } else {
      setDraft(value);
    }
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        <Tooltip>
          <TooltipTrigger
            aria-label={`About ${label}`}
            className="cursor-help rounded-full text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <HelpCircle className="size-3.5" />
          </TooltipTrigger>
          <TooltipContent side="right">{description}</TooltipContent>
        </Tooltip>
      </div>
      <div className="relative">
        <input
          id={`${id}-picker`}
          type="color"
          value={value}
          onChange={(event) =>
            onChange(event.currentTarget.value.toUpperCase())
          }
          className="absolute inset-y-0 left-3 z-10 my-auto size-6 cursor-pointer overflow-hidden rounded-full border-0 bg-transparent p-0 corner-squircle"
          aria-label={`${label} color picker`}
        />
        <Input
          id={id}
          value={draft}
          onChange={(event) => {
            const nextValue = event.currentTarget.value;
            setDraft(nextValue);
            const normalized = nextValue.startsWith("#")
              ? nextValue
              : `#${nextValue}`;
            if (HEX_COLOR_PATTERN.test(normalized)) {
              onChange(normalized.toUpperCase());
            }
          }}
          onBlur={commitDraft}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitDraft();
              event.currentTarget.blur();
            }
          }}
          className="rounded-full pr-24 pl-12 font-mono uppercase corner-squircle"
          maxLength={7}
          spellCheck={false}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(randomColor())}
          className="absolute inset-y-0 right-1.5 my-auto active:not-aria-[haspopup]:translate-y-0"
        >
          <Shuffle data-icon="inline-start" />
          Random
        </Button>
      </div>
    </div>
  );
}

interface NumberStepperProps {
  label: string;
  value: number;
  values: readonly number[];
  onChange: (value: number) => void;
}

export function NumberStepper({
  label,
  value,
  values,
  onChange,
}: NumberStepperProps) {
  const id = useId();
  const currentIndex = values.indexOf(value);
  const decreaseDisabled = currentIndex <= 0;
  const increaseDisabled = currentIndex >= values.length - 1;

  return (
    <div className="space-y-2.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex overflow-hidden rounded-lg border border-input bg-background">
        <Input
          id={id}
          readOnly
          value={value}
          className="h-9 rounded-none border-0 bg-transparent tabular-nums shadow-none focus-visible:ring-0"
          aria-label={`${label} value`}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={decreaseDisabled}
          onClick={() => onChange(values[currentIndex - 1])}
          className="h-9 rounded-none border-l"
          aria-label={`Decrease ${label}`}
        >
          <Minus />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={increaseDisabled}
          onClick={() => onChange(values[currentIndex + 1])}
          className="h-9 rounded-none border-l"
          aria-label={`Increase ${label}`}
        >
          <Plus />
        </Button>
      </div>
    </div>
  );
}
