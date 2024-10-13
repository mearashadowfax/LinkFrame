import "@preline/tooltip/index.js";

const container = document.getElementById(
  "imageUploadContainer"
) as HTMLElement;
const imageUpload = document.getElementById("fileInput") as HTMLInputElement;
const browseButton = document.getElementById(
  "browseButton"
) as HTMLButtonElement;
const uploadInterface = document.getElementById(
  "uploadInterface"
) as HTMLElement;
const imagePreview = document.getElementById("imagePreview") as HTMLElement;
const progress = document.getElementById("progress") as HTMLElement;
const controls = document.getElementById("controls") as HTMLElement;

const elements = {
  rotationValue: document.getElementById("rotateValue") as HTMLInputElement,
  rotationSlider: document.getElementById("rotateSlider") as HTMLInputElement,
  scaleValue: document.getElementById("scaleValue") as HTMLInputElement,
  scaleSlider: document.getElementById("scaleSlider") as HTMLInputElement,
  frameThicknessValue: document.getElementById(
    "frameThicknessValue"
  ) as HTMLInputElement,
  frameThicknessSlider: document.getElementById(
    "frameThicknessSlider"
  ) as HTMLInputElement,
  startPositionValue: document.getElementById(
    "startPositionValue"
  ) as HTMLInputElement,
  startPositionSlider: document.getElementById(
    "startPositionSlider"
  ) as HTMLInputElement,
  endPositionValue: document.getElementById(
    "endPositionValue"
  ) as HTMLInputElement,
  endPositionSlider: document.getElementById(
    "endPositionSlider"
  ) as HTMLInputElement,
  textPlacementValue: document.getElementById(
    "textPlacementValue"
  ) as HTMLInputElement,
  textPlacementSlider: document.getElementById(
    "textPlacementSlider"
  ) as HTMLInputElement,
};

const resetButton = document.getElementById("resetButton") as HTMLButtonElement;
const startOverButton = document.getElementById(
  "startOverButton"
) as HTMLButtonElement;
const downloadButton = document.getElementById(
  "downloadButton"
) as HTMLButtonElement;
const frameTextInput = document.getElementById(
  "frameTextInput"
) as HTMLInputElement;
const hexInput2 = document.getElementById("hexInput2") as HTMLInputElement;
const hexInput3 = document.getElementById("hexInput3") as HTMLInputElement;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let image = new Image();
let rotation = 0;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let startPosition = 225;
let endPosition = 25;
let frameThickness = 50;
let textInput = "#ONTHEHUNT";
let fontSize = 32;
let letterSpacing = 0;
let textPlacement = 140;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let currentCanvasBackgroundColor = getRandomColor();

browseButton.addEventListener("click", () => imageUpload.click());
imageUpload.addEventListener("change", handleFileUpload);

// Drag-and-drop
container.addEventListener("dragenter", () =>
  container.classList.add("dragging")
);
container.addEventListener("dragover", (e) => {
  e.preventDefault();
  container.classList.add("dragging");
});
container.addEventListener("dragleave", () =>
  container.classList.remove("dragging")
);
container.addEventListener("drop", (e) => {
  e.preventDefault();
  const file = e.dataTransfer?.files[0];
  if (file) {
    handleFileUpload({ target: { files: [file] } } as unknown as Event);
    container.classList.remove("dragging");
  }
});

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];

  if (!file || !file.type.startsWith("image/")) {
    alert("Please upload a valid image file.");
    return;
  }

  progress.classList.add("flex");
  progress.classList.remove("hidden");
  uploadInterface.classList.add("hidden");
  controls.classList.add("hidden");

  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "canvas";
    canvas.className = "border border-slate-300";
    imagePreview.appendChild(canvas);
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    enableDragging(canvas);
  }
  displayImagePreview(file);
  imageUpload.value = "";
}

function displayImagePreview(file: File) {
  const reader = new FileReader();

  reader.onload = (e) => {
    image.src = e.target?.result as string;
    image.onload = () => {
      canvas!.width = 400;
      canvas!.height = 400;

      redrawCanvas();
      progress.classList.add("hidden");
      imagePreview.classList.remove("hidden");
      uploadInterface.classList.add("hidden");
      container.classList.remove("border-dashed");
      container.classList.add("border-solid");
      controls.classList.remove("hidden");
      controls.classList.add("flex");
    };
  };

  reader.readAsDataURL(file);
}

function rgba(r: number, g: number, b: number, a: number): string {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function hexToRgb(hex: string) {
  hex = hex.replace(/^#/, "");
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

function redrawCanvas() {
  if (!ctx || !image.complete || image.naturalWidth === 0) return;

  requestAnimationFrame(() => {
    if (ctx && canvas) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // ctx.save();

      // const centerX = canvas.width / 2;
      // const centerY = canvas.height / 2;
      // const radius = canvas.width / 2;

      // ctx.beginPath();
      // ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      // ctx.clip();

      ctx.fillStyle = currentCanvasBackgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      ctx.drawImage(image, -image.width / 2, -image.height / 2);

      ctx.setTransform(1, 0, 0, 1, 0, 0);

      drawCircularArcAndText();

      // ctx.restore();

      // drawBackgroundOutsideCircle(
      //   ctx,
      //   centerX,
      //   centerY,
      //   radius,
      //   currentCanvasBackgroundColor
      // );
    }
  });
}

// function drawBackgroundOutsideCircle(
//   ctx: CanvasRenderingContext2D,
//   centerX: number,
//   centerY: number,
//   radius: number,
//   currentCanvasBackgroundColor: string
// ): void {
//   ctx.save();

//   // background color outside the circle
//   ctx.beginPath();
//   ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);  // Full canvas rectangle
//   ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);   // Circle in the middle
//   ctx.fillStyle = currentCanvasBackgroundColor;       // Set background color
//   ctx.fill("evenodd"); // Fill outside the circle

//   ctx.restore();
// }

function drawCircularArcAndText() {
  if (!ctx || !canvas) return;
  // Frame
  const arcWidth = frameThickness;
  const startArcAngle = (Math.PI * startPosition) / 180;
  const endArcAngle = (Math.PI * endPosition) / 180;
  const totalArcAngle = startArcAngle - endArcAngle;

  ctx.lineWidth = arcWidth;
  const steps = 250;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startArcAngle - t * totalArcAngle;

    // solid middle 80% and fade at ends
    let opacity;
    if (t < 0.2) {
      opacity = t * 7;
    } else if (t > 0.7) {
      opacity = (1 - t) * 7;
    } else {
      opacity = 1;
    }

    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2 - arcWidth / 2,
      angle,
      angle - totalArcAngle / steps,
      true
    );

    const color = hexInput2.value;
    ctx.strokeStyle = rgba(
      hexToRgb(color).r,
      hexToRgb(color).g,
      hexToRgb(color).b,
      opacity
    );
    ctx.stroke();
  }

  const text = textInput;
  const textLength = text.length;
  const textRadius = canvas.width / 2 - arcWidth / 2;

  const baseAnglePerChar = (Math.PI / textLength) * 0.75;
  const anglePerChar = baseAnglePerChar + letterSpacing;
  const totalAngle = anglePerChar * textLength;
  const textColor = hexInput3.value;

  ctx.font = `bolder ${fontSize}px Helvetica`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const mappedTextPlacement = (textPlacement / 100) * Math.PI - Math.PI / 2;

  const startAngle = Math.PI - totalAngle / 2 + mappedTextPlacement;
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  for (let i = 0; i < text.length; i++) {
    const angle = startAngle - i * anglePerChar;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -textRadius);
    ctx.rotate(Math.PI / 1);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }
}
// Enable dragging
function enableDragging(canvas: HTMLCanvasElement) {
  canvas.style.cursor = "grab";

  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    dragStartX = e.offsetX - offsetX;
    dragStartY = e.offsetY - offsetY;
    canvas.style.cursor = "grabbing";
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isDragging) {
      offsetX = e.offsetX - dragStartX;
      offsetY = e.offsetY - dragStartY;
      redrawCanvas();
    }
  });

  canvas.addEventListener("mouseup", () => {
    isDragging = false;
    canvas.style.cursor = "grab";
  });

  canvas.addEventListener("mouseleave", () => {
    isDragging = false;
    canvas.style.cursor = "grab";
  });
}

elements.rotationValue.addEventListener("input", () => {
  rotation = parseFloat(elements.rotationValue.value);
  elements.rotationSlider.value = elements.rotationValue.value;
  redrawCanvas();
});

elements.rotationSlider.addEventListener("input", () => {
  rotation = parseFloat(elements.rotationSlider.value);
  elements.rotationValue.value = elements.rotationSlider.value;
  redrawCanvas();
});

elements.scaleValue.addEventListener("input", () => {
  scale = parseFloat(elements.scaleValue.value);
  elements.scaleSlider.value = elements.scaleValue.value;
  redrawCanvas();
});

elements.scaleSlider.addEventListener("input", () => {
  scale = parseFloat(elements.scaleSlider.value);
  elements.scaleValue.value = elements.scaleSlider.value;
  redrawCanvas();
});

elements.frameThicknessValue.addEventListener("input", () => {
  frameThickness = parseFloat(elements.frameThicknessValue.value);
  elements.frameThicknessSlider.value = elements.frameThicknessValue.value;
  redrawCanvas();
});

elements.frameThicknessSlider.addEventListener("input", () => {
  frameThickness = parseFloat(elements.frameThicknessSlider.value);
  elements.frameThicknessValue.value = elements.frameThicknessSlider.value;
  redrawCanvas();
});

elements.startPositionValue.addEventListener("input", () => {
  startPosition = parseFloat(elements.startPositionValue.value);
  elements.startPositionSlider.value = elements.startPositionValue.value;
  redrawCanvas();
});

elements.startPositionSlider.addEventListener("input", () => {
  startPosition = parseFloat(elements.startPositionSlider.value);
  elements.startPositionValue.value = elements.startPositionSlider.value;
  redrawCanvas();
});

elements.endPositionValue.addEventListener("input", () => {
  endPosition = parseFloat(elements.endPositionValue.value);
  elements.endPositionSlider.value = elements.endPositionValue.value;
  redrawCanvas();
});

elements.endPositionSlider.addEventListener("input", () => {
  endPosition = parseFloat(elements.endPositionSlider.value);
  elements.endPositionValue.value = elements.endPositionSlider.value;
  redrawCanvas();
});

frameTextInput.addEventListener("input", () => {
  textInput = frameTextInput.value;
  redrawCanvas();
});

elements.textPlacementValue.addEventListener("input", () => {
  textPlacement = parseFloat(elements.textPlacementValue.value);
  elements.textPlacementSlider.value = elements.textPlacementValue.value;
  redrawCanvas();
});

elements.textPlacementSlider.addEventListener("input", () => {
  textPlacement = parseFloat(elements.textPlacementSlider.value);
  elements.textPlacementValue.value = elements.textPlacementSlider.value;
  redrawCanvas();
});

resetButton.addEventListener("click", () => {
  rotation = 0;
  scale = 1;
  frameThickness = 50;
  startPosition = 200;
  endPosition = 45;
  textInput = "#ONTHEHUNT";
  fontSize = 32;
  letterSpacing = 0;
  textPlacement = 140;

  elements.rotationValue.value = rotation.toString();
  elements.rotationSlider.value = rotation.toString();
  elements.scaleValue.value = scale.toString();
  elements.scaleSlider.value = scale.toString();
  elements.frameThicknessValue.value = frameThickness.toString();
  elements.frameThicknessSlider.value = frameThickness.toString();
  elements.startPositionValue.value = startPosition.toString();
  elements.startPositionSlider.value = startPosition.toString();
  elements.endPositionValue.value = endPosition.toString();
  elements.endPositionSlider.value = endPosition.toString();
  elements.textPlacementValue.value = textPlacement.toString();
  elements.textPlacementSlider.value= textPlacement.toString();
  frameTextInput.value = textInput.toString();
  redrawCanvas();
});

startOverButton.addEventListener("click", () => {
  resetUploadState();
  // Delay the click event to ensure state is reset before opening file dialog
  setTimeout(() => {
    imageUpload.click();
  }, 0);
});

downloadButton.addEventListener("click", function () {
  if (!canvas || !ctx) return;
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "linkedin-profile-frame.png";
  link.click();
});

function resetUploadState() {
  imageUpload.value = "";
  image = new Image();
  imagePreview.classList.add("hidden");
  uploadInterface.classList.remove("hidden");
  controls.classList.add("hidden");
  progress.classList.add("hidden");
  container.classList.remove("border-solid", "border-slate-100");
  container.classList.add("border-dashed", "border-slate-300");
  rotation = 0;
  scale = 1;
  offsetX = 0;
  offsetY = 0;

  if (canvas && ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

// Color section interface and utilities
interface ColorSection {
  hexInput: HTMLInputElement;
  colorPicker: HTMLInputElement;
  randomBtn: HTMLButtonElement;
  isForCanvas: boolean;
  isForFrame: boolean;
  isForText: boolean;
}

function getRandomColor(): string {
  const letters = "0123456789ABCDEF";
  return `#${Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * 16)]).join("")}`;
}

function setColor(section: ColorSection, color: string) {
  section.hexInput.value = color;
  section.hexInput.placeholder = color;
  section.colorPicker.value = color;

  if (section.isForCanvas) {
    setCanvasBackgroundColor(color);
  } else if (section.isForFrame) {
    hexInput2.value = color;
    redrawCanvas();
  } else if (section.isForText) {
    hexInput3.value = color;
    redrawCanvas();
  }
}

function setCanvasBackgroundColor(color: string) {
  if (currentCanvasBackgroundColor !== color) {
    currentCanvasBackgroundColor = color;

    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas!.width, canvas!.height);
    }

    redrawCanvas();
  }
}

function attachEventListenersToSection(section: ColorSection) {
  section.randomBtn.addEventListener("click", () => {
    const randomColor = getRandomColor();
    setColor(section, randomColor);
  });

  section.hexInput.addEventListener("input", (e) => {
    const value = (e.target as HTMLInputElement).value;
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setColor(section, value);
    }
  });

  section.colorPicker.addEventListener("input", (e) => {
    const color = (e.target as HTMLInputElement).value;
    setColor(section, color);
  });
}

const sections = [
  {
    hexInputId: "hexInput1",
    colorPickerId: "colorPicker1",
    randomBtnId: "randomBtn1",
    isForCanvas: true,
    isForFrame: false,
    isForText: false,
  },
  {
    hexInputId: "hexInput2",
    colorPickerId: "colorPicker2",
    randomBtnId: "randomBtn2",
    isForCanvas: false,
    isForFrame: true,
    isForText: false,
  },
  {
    hexInputId: "hexInput3",
    colorPickerId: "colorPicker3",
    randomBtnId: "randomBtn3",
    isForCanvas: false,
    isForFrame: false,
    isForText: true,
  },
];

sections.forEach(
  ({
    hexInputId,
    colorPickerId,
    randomBtnId,
    isForCanvas,
    isForFrame,
    isForText,
  }) => {
    const hexInput = document.getElementById(hexInputId) as HTMLInputElement;
    const colorPicker = document.getElementById(
      colorPickerId
    ) as HTMLInputElement;
    const randomBtn = document.getElementById(randomBtnId) as HTMLButtonElement;

    if (hexInput && colorPicker && randomBtn) {
      const section: ColorSection = {
        hexInput,
        colorPicker,
        randomBtn,
        isForCanvas,
        isForFrame,
        isForText,
      };

      const randomColor = getRandomColor();
      setColor(section, randomColor);

      attachEventListenersToSection(section);
    }
  }
);

// Letter spacing and font size adjustments

const letterSpacingValues = [-0.05, -0.025, 0, 0.025, 0.05, 0.1];
let currentIndexLetterSpacing = 2;

const inputElementLetterSpacing = document.querySelector<HTMLInputElement>(
  "[data-hs-input-letter-spacing]"
);
const decreaseButtonLetterSpacing = document.querySelector<HTMLButtonElement>(
  "[data-hs-input-letter-spacing-decrement]"
);
const increaseButtonLetterSpacing = document.querySelector<HTMLButtonElement>(
  "[data-hs-input-letter-spacing-increment]"
);

inputElementLetterSpacing!.value =
  letterSpacingValues[currentIndexLetterSpacing].toString();

increaseButtonLetterSpacing!.addEventListener("click", () =>
  adjustSpacing("increase")
);
decreaseButtonLetterSpacing!.addEventListener("click", () =>
  adjustSpacing("decrease")
);

function adjustSpacing(action: "increase" | "decrease") {
  const increment = action === "increase" ? 1 : -1;
  currentIndexLetterSpacing = Math.max(
    0,
    Math.min(
      letterSpacingValues.length - 1,
      currentIndexLetterSpacing + increment
    )
  );
  updateLetterSpacing();
}

function updateLetterSpacing() {
  letterSpacing = letterSpacingValues[currentIndexLetterSpacing];
  inputElementLetterSpacing!.value = letterSpacing.toString();
  redrawCanvas();
}

const fontSizeValues = [16, 20, 24, 32, 36, 40, 48];
let currentFontSizeIndex = 3;

const inputElementFontSize = document.querySelector<HTMLInputElement>(
  "[data-hs-input-font-size]"
);
const decreaseButtonFontSize = document.querySelector<HTMLButtonElement>(
  "[data-hs-input-font-size-decrement]"
);
const increaseButtonFontSize = document.querySelector<HTMLButtonElement>(
  "[data-hs-input-font-size-increment]"
);

inputElementFontSize!.value = fontSizeValues[currentFontSizeIndex].toString();

increaseButtonFontSize!.addEventListener("click", () =>
  adjustFontSize("increase")
);
decreaseButtonFontSize!.addEventListener("click", () =>
  adjustFontSize("decrease")
);

function adjustFontSize(action: "increase" | "decrease") {
  const increment = action === "increase" ? 1 : -1;
  currentFontSizeIndex = Math.max(
    0,
    Math.min(fontSizeValues.length - 1, currentFontSizeIndex + increment)
  );
  updateFontSize();
}

function updateFontSize() {
  fontSize = fontSizeValues[currentFontSizeIndex];
  inputElementFontSize!.value = fontSize.toString();
  redrawCanvas();
}

const btnToTop = document.getElementById(
  "btnToTop"
) as HTMLButtonElement | null;

const isMobile: boolean = window.innerWidth < 1024;

if (isMobile && btnToTop) {
  window.onscroll = () => scrollFunction();
}

// Function to show/hide the button
function scrollFunction() {
  if (!btnToTop) return;

  if (
    document.body.scrollTop > 200 ||
    document.documentElement.scrollTop > 200
  ) {
    btnToTop.classList.remove("scale-0", "opacity-0");
    btnToTop.classList.add("scale-100", "opacity-100");
  } else {
    btnToTop.classList.remove("scale-100", "opacity-100");
    btnToTop.classList.add("scale-0", "opacity-0");
  }
}

btnToTop?.addEventListener("click", () => topFunction());

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
