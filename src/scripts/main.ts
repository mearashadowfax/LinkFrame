import "@preline/tooltip/index.js";

// Utility function for safe DOM element selection
function safeGetElement<T extends HTMLElement>(
  id: string,
  type: string
): T | null {
  const element = document.getElementById(id) as T | null;
  if (!element) {
    console.warn(`Element with id "${id}" not found. Expected type: ${type}`);
  }
  return element;
}

function safeQuerySelector<T extends HTMLElement>(
  selector: string,
  type: string
): T | null {
  const element = document.querySelector<T>(selector);
  if (!element) {
    console.warn(
      `Element with selector "${selector}" not found. Expected type: ${type}`
    );
  }
  return element;
}

// Debouncing function for performance
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };
}

// DOM Elements
const container = safeGetElement<HTMLElement>(
  "imageUploadContainer",
  "HTMLElement"
);
const imageUpload = safeGetElement<HTMLInputElement>(
  "fileInput",
  "HTMLInputElement"
);
const browseButton = safeGetElement<HTMLButtonElement>(
  "browseButton",
  "HTMLButtonElement"
);
const uploadInterface = safeGetElement<HTMLElement>(
  "uploadInterface",
  "HTMLElement"
);
const imagePreview = safeGetElement<HTMLElement>("imagePreview", "HTMLElement");
const progress = safeGetElement<HTMLElement>("progress", "HTMLElement");
const controls = safeGetElement<HTMLElement>("controls", "HTMLElement");

const elements = {
  rotationValue: safeGetElement<HTMLInputElement>(
    "rotateValue",
    "HTMLInputElement"
  ),
  rotationSlider: safeGetElement<HTMLInputElement>(
    "rotateSlider",
    "HTMLInputElement"
  ),
  scaleValue: safeGetElement<HTMLInputElement>(
    "scaleValue",
    "HTMLInputElement"
  ),
  scaleSlider: safeGetElement<HTMLInputElement>(
    "scaleSlider",
    "HTMLInputElement"
  ),
  frameThicknessValue: safeGetElement<HTMLInputElement>(
    "frameThicknessValue",
    "HTMLInputElement"
  ),
  frameThicknessSlider: safeGetElement<HTMLInputElement>(
    "frameThicknessSlider",
    "HTMLInputElement"
  ),
  startPositionValue: safeGetElement<HTMLInputElement>(
    "startPositionValue",
    "HTMLInputElement"
  ),
  startPositionSlider: safeGetElement<HTMLInputElement>(
    "startPositionSlider",
    "HTMLInputElement"
  ),
  endPositionValue: safeGetElement<HTMLInputElement>(
    "endPositionValue",
    "HTMLInputElement"
  ),
  endPositionSlider: safeGetElement<HTMLInputElement>(
    "endPositionSlider",
    "HTMLInputElement"
  ),
  textPlacementValue: safeGetElement<HTMLInputElement>(
    "textPlacementValue",
    "HTMLInputElement"
  ),
  textPlacementSlider: safeGetElement<HTMLInputElement>(
    "textPlacementSlider",
    "HTMLInputElement"
  ),
};

const resetButton = safeGetElement<HTMLButtonElement>(
  "resetButton",
  "HTMLButtonElement"
);
const startOverButton = safeGetElement<HTMLButtonElement>(
  "startOverButton",
  "HTMLButtonElement"
);
const downloadButton = safeGetElement<HTMLButtonElement>(
  "downloadButton",
  "HTMLButtonElement"
);
const frameTextInput = safeGetElement<HTMLInputElement>(
  "frameTextInput",
  "HTMLInputElement"
);
const hexInput1 = safeGetElement<HTMLInputElement>(
  "hexInput1",
  "HTMLInputElement"
);
const hexInput2 = safeGetElement<HTMLInputElement>(
  "hexInput2",
  "HTMLInputElement"
);
const hexInput3 = safeGetElement<HTMLInputElement>(
  "hexInput3",
  "HTMLInputElement"
);

// State variables
let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let image = new Image();
let rotation = 0;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let startPosition = 16;
let endPosition = 56;
let frameThickness = 50;
let textInput = "#ONTHEHUNT";
let fontSize = 44;
let letterSpacing = 0;
let textPlacement = 130;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let currentCanvasBackgroundColor = getRandomColor();

// Create a debounced version of redrawCanvas
const debouncedRedraw = debounce(redrawCanvas, 50);

// Event handling functions
function handleBrowseClick() {
  if (!imageUpload) return;
  imageUpload.click();
}

function handleDragEnter() {
  if (!container) return;
  container.classList.add("dragging");
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  if (!container) return;
  container.classList.add("dragging");
}

function handleDragLeave() {
  if (!container) return;
  container.classList.remove("dragging");
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFileUpload({ target: { files: [files[0]] } } as unknown as Event);
    if (container) {
      container.classList.remove("dragging");
    }
  }
}

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const files = input.files;

  if (!files || files.length === 0) {
    return;
  }

  const file = files[0];
  if (!file.type.startsWith("image/")) {
    alert("Please upload a valid image file.");
    return;
  }

  if (!progress || !uploadInterface || !controls || !imagePreview) {
    console.error("Required DOM elements not found");
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
  if (imageUpload) {
    imageUpload.value = "";
  }
}

function displayImagePreview(file: File) {
  const reader = new FileReader();

  reader.onload = (e) => {
    const result = e.target?.result;
    if (typeof result !== "string") return;

    image = new Image();
    image.onload = () => {
      if (!canvas) return;

      canvas.width = 400;
      canvas.height = 400;

      redrawCanvas();

      if (progress) {
        progress.classList.add("hidden");
      }
      if (imagePreview) {
        imagePreview.classList.remove("hidden");
      }
      if (uploadInterface) {
        uploadInterface.classList.add("hidden");
      }
      if (container) {
        container.classList.remove("border-dashed");
        container.classList.add("border-solid");
      }
      if (controls) {
        controls.classList.remove("hidden");
        controls.classList.add("flex");
      }
    };

    image.onerror = () => {
      alert("Failed to load image. Please try another file.");
      resetUploadState();
    };

    image.src = result;
  };

  reader.onerror = () => {
    alert("Error reading file. Please try again.");
    resetUploadState();
  };

  reader.readAsDataURL(file);
}

// Improved color management functions
function hexToRgb(hex: string) {
  // Remove # if present
  hex = hex.replace(/^#/, "");

  // Handle shorthand hex (#RGB)
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((h) => h + h)
      .join("");
  }

  // Validate hex format
  if (!/^[0-9A-F]{6}$/i.test(hex)) {
    // Return a default color if invalid
    return { r: 0, g: 0, b: 0 };
  }

  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}

function hexToRgba(hex: string, alpha: number = 1): string {
  const rgb = hexToRgb(hex);
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
}

function redrawCanvas() {
  if (!ctx || !canvas || !image.complete || image.naturalWidth === 0) return;

  requestAnimationFrame(() => {
    clearCanvas();
    applyBackground();
    drawImage();
    drawCircularArcAndText();
  });
}

function clearCanvas() {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
}

function applyBackground() {
  if (!ctx || !canvas) return;
  ctx.fillStyle = currentCanvasBackgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawImage() {
  if (!ctx || !canvas) return;

  ctx.save();
  ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(scale, scale);

  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  ctx.restore();
}

function drawCircularArcAndText() {
  if (!ctx || !canvas || !hexInput2) return;

  // Frame
  const arcWidth = frameThickness;
  let startArcAngle = Math.PI * (startPosition / 50);
  let endArcAngle = Math.PI * (endPosition / 50);

  if (endArcAngle < startArcAngle) {
    endArcAngle += 2 * Math.PI;
  }

  const totalArcAngle = endArcAngle - startArcAngle;

  ctx.lineWidth = arcWidth;
  const steps = 250;

  // Draw the arc with gradient opacity
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startArcAngle + t * totalArcAngle;

    let opacity = 1;
    if (t < 0.2) opacity = t * 7;
    else if (t > 0.7) opacity = (1 - t) * 7;

    ctx.beginPath();
    ctx.arc(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width / 2 - arcWidth / 2,
      angle,
      angle + totalArcAngle / steps,
      false
    );

    ctx.strokeStyle = hexToRgba(hexInput2.value, opacity);
    ctx.stroke();
  }

  // Draw the text
  drawCircularText();
}

function drawCircularText() {
  if (!ctx || !canvas || !hexInput3) return;

  const text = textInput;
  const textLength = text.length;
  const textRadius = canvas.width / 2 - frameThickness / 2.2;

  const baseAnglePerChar = (Math.PI / textLength) * 0.6;
  const anglePerChar = baseAnglePerChar + letterSpacing;
  const totalTextAngle = anglePerChar * textLength;
  const textColor = hexInput3.value;

  ctx.font = `bold ${fontSize}px ui-monospace, monospace`;
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const mappedTextPlacement = (textPlacement / 100) * Math.PI - Math.PI / 2;
  const textStartAngle = Math.PI - totalTextAngle / 2 + mappedTextPlacement;

  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  for (let i = 0; i < text.length; i++) {
    const angle = textStartAngle - i * anglePerChar;
    ctx.save();
    ctx.rotate(angle);
    ctx.translate(0, -textRadius);
    ctx.scale(1.1, 1);
    ctx.rotate(Math.PI / 1);
    ctx.fillText(text[i], 0, 0);
    ctx.restore();
  }

  ctx.restore();
}

// Drag and drop functionality
function enableDragging(canvas: HTMLCanvasElement) {
  canvas.style.cursor = "grab";

  // Define named handlers for easier cleanup
  function handleMouseDown(e: MouseEvent) {
    startDragging(e.offsetX, e.offsetY);
  }

  function handleMouseMove(e: MouseEvent) {
    if (isDragging) {
      drag(e.offsetX, e.offsetY);
    }
  }

  function handleMouseUp() {
    stopDragging();
  }

  function handleTouchStart(e: TouchEvent) {
    if (e.touches.length !== 1) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    startDragging(touch.clientX - rect.left, touch.clientY - rect.top);
    e.preventDefault();
  }

  function handleTouchMove(e: TouchEvent) {
    if (!isDragging || e.touches.length !== 1) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    drag(touch.clientX - rect.left, touch.clientY - rect.top);
    e.preventDefault();
  }

  function handleTouchEnd() {
    stopDragging();
  }

  // Attach event listeners
  canvas.addEventListener("mousedown", handleMouseDown);
  canvas.addEventListener("mousemove", handleMouseMove);
  canvas.addEventListener("mouseup", handleMouseUp);
  canvas.addEventListener("mouseleave", handleMouseUp);
  canvas.addEventListener("touchstart", handleTouchStart);
  canvas.addEventListener("touchmove", handleTouchMove);
  canvas.addEventListener("touchend", handleTouchEnd);
  canvas.addEventListener("touchcancel", handleTouchEnd);

  // Store handlers for cleanup
  (canvas as any)._eventHandlers = {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

function startDragging(x: number, y: number) {
  if (!canvas) return;

  isDragging = true;
  dragStartX = x - offsetX;
  dragStartY = y - offsetY;
  canvas.style.cursor = "grabbing";
}

function drag(x: number, y: number) {
  offsetX = x - dragStartX;
  offsetY = y - dragStartY;
  redrawCanvas();
}

function stopDragging() {
  if (!canvas) return;

  isDragging = false;
  canvas.style.cursor = "grab";
}

// Enhanced setupSliderAndInput with null checks
function setupSliderAndInput(
  slider: HTMLInputElement | null,
  input: HTMLInputElement | null,
  updateFn: (value: number) => void
) {
  if (!slider || !input) {
    console.warn("Slider or input element not found, skipping setup");
    return { handleSliderInput: null, handleInputChange: null };
  }

  function handleSliderInput() {
    if (!slider || !input) return;
    const value = parseFloat(slider.value);
    input.value = value.toString();
    updateFn(value);
    debouncedRedraw();
  }

  function handleInputChange() {
    if (!slider || !input) return;
    const value = parseFloat(input.value);
    slider.value = value.toString();
    updateFn(value);
    redrawCanvas();
  }

  slider.addEventListener("input", handleSliderInput);
  input.addEventListener("input", handleInputChange);

  return { handleSliderInput, handleInputChange };
}

// Reset and download functions
function resetControls() {
  rotation = 0;
  scale = 1;
  frameThickness = 50;
  startPosition = 16;
  endPosition = 56;
  textInput = "#ONTHEHUNT";
  fontSize = 44;
  letterSpacing = 0;
  textPlacement = 130;

  if (elements.rotationValue)
    elements.rotationValue.value = rotation.toString();
  if (elements.rotationSlider)
    elements.rotationSlider.value = rotation.toString();
  if (elements.scaleValue) elements.scaleValue.value = scale.toString();
  if (elements.scaleSlider) elements.scaleSlider.value = scale.toString();
  if (elements.frameThicknessValue)
    elements.frameThicknessValue.value = frameThickness.toString();
  if (elements.frameThicknessSlider)
    elements.frameThicknessSlider.value = frameThickness.toString();
  if (elements.startPositionValue)
    elements.startPositionValue.value = startPosition.toString();
  if (elements.startPositionSlider)
    elements.startPositionSlider.value = startPosition.toString();
  if (elements.endPositionValue)
    elements.endPositionValue.value = endPosition.toString();
  if (elements.endPositionSlider)
    elements.endPositionSlider.value = endPosition.toString();
  if (elements.textPlacementValue)
    elements.textPlacementValue.value = textPlacement.toString();
  if (elements.textPlacementSlider)
    elements.textPlacementSlider.value = textPlacement.toString();
  if (frameTextInput) frameTextInput.value = textInput;

  redrawCanvas();
}

function handleStartOver() {
  resetUploadState();
  // Delay the click event to ensure state is reset before opening file dialog
  setTimeout(() => {
    if (imageUpload) {
      imageUpload.click();
    }
  }, 0);
}

function handleDownload() {
  if (!canvas) return;

  try {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "linkedin-profile-frame.png";
    link.click();
  } catch (error) {
    console.error("Error downloading image:", error);
    alert("Failed to download the image. Please try again.");
  }
}

function resetUploadState() {
  if (imageUpload) {
    imageUpload.value = "";
  }
  image = new Image();
  offsetX = 0;
  offsetY = 0;

  if (imagePreview) {
    imagePreview.classList.add("hidden");
  }
  if (uploadInterface) {
    uploadInterface.classList.remove("hidden");
  }
  if (controls) {
    controls.classList.add("hidden");
  }
  if (progress) {
    progress.classList.add("hidden");
  }
  if (container) {
    container.classList.remove("border-solid", "border-slate-100");
    container.classList.add("border-dashed", "border-slate-300");
  }

  resetControls();

  if (canvas && ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Clean up event listeners
    const handlers = (canvas as any)._eventHandlers || {};
    if (handlers.handleMouseDown) {
      canvas.removeEventListener("mousedown", handlers.handleMouseDown);
      canvas.removeEventListener("mousemove", handlers.handleMouseMove);
      canvas.removeEventListener("mouseup", handlers.handleMouseUp);
      canvas.removeEventListener("mouseleave", handlers.handleMouseUp);
      canvas.removeEventListener("touchstart", handlers.handleTouchStart);
      canvas.removeEventListener("touchmove", handlers.handleTouchMove);
      canvas.removeEventListener("touchend", handlers.handleTouchEnd);
      canvas.removeEventListener("touchcancel", handlers.handleTouchEnd);
    }

    // Remove the canvas element
    if (canvas.parentNode) {
      canvas.parentNode.removeChild(canvas);
    }

    canvas = null;
    ctx = null;
  }
}

// Color utilities
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
    if (hexInput2) {
      hexInput2.value = color;
    }
    redrawCanvas();
  } else if (section.isForText) {
    if (hexInput3) {
      hexInput3.value = color;
    }
    redrawCanvas();
  }
}

function setCanvasBackgroundColor(color: string) {
  if (currentCanvasBackgroundColor !== color) {
    currentCanvasBackgroundColor = color;
    redrawCanvas();
  }
}

function attachEventListenersToSection(section: ColorSection) {
  function handleRandomClick() {
    const randomColor = getRandomColor();
    setColor(section, randomColor);
  }

  function handleHexInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setColor(section, value);
    }
  }

  function handleColorPicker(e: Event) {
    const color = (e.target as HTMLInputElement).value;
    setColor(section, color);
  }

  section.randomBtn.addEventListener("click", handleRandomClick);
  section.hexInput.addEventListener("input", handleHexInput);
  section.colorPicker.addEventListener("input", handleColorPicker);

  // Store the handlers for cleanup
  (section as any)._eventHandlers = {
    handleRandomClick,
    handleHexInput,
    handleColorPicker,
  };
}

// Letter spacing and font size controls
const letterSpacingValues = [
  -0.3, -0.25, -0.2, -0.15, -0.1, -0.075, -0.05, -0.025, 0, 0.025, 0.05, 0.075,
  0.1, 0.15, 0.2, 0.25, 0.3,
];
let currentIndexLetterSpacing = 8;

const inputElementLetterSpacing = document.querySelector<HTMLInputElement>(
  "[data-hs-input-letter-spacing]"
);
const decreaseButtonLetterSpacing = document.querySelector<HTMLButtonElement>(
  "[data-hs-input-letter-spacing-decrement]"
);
const increaseButtonLetterSpacing = document.querySelector<HTMLButtonElement>(
  "[data-hs-input-letter-spacing-increment]"
);

// Named functions for proper event listener cleanup
function handleIncreaseLetterSpacing() {
  adjustSpacing("increase");
}

function handleDecreaseLetterSpacing() {
  adjustSpacing("decrease");
}

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
  if (inputElementLetterSpacing) {
    inputElementLetterSpacing.value = letterSpacing.toString();
  }
  redrawCanvas();
}

const fontSizeValues = [16, 20, 24, 32, 34, 36, 40, 44, 48, 52, 56];
let currentFontSizeIndex = 7;

const inputElementFontSize = document.querySelector<HTMLInputElement>(
  "[data-hs-input-font-size]"
);
const decreaseButtonFontSize = document.querySelector<HTMLButtonElement>(
  "[data-hs-input-font-size-decrement]"
);
const increaseButtonFontSize = document.querySelector<HTMLButtonElement>(
  "[data-hs-input-font-size-increment]"
);

// Named functions for proper event listener cleanup
function handleIncreaseFontSize() {
  adjustFontSize("increase");
}

function handleDecreaseFontSize() {
  adjustFontSize("decrease");
}

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
  if (inputElementFontSize) {
    inputElementFontSize.value = fontSize.toString();
  }
  redrawCanvas();
}

// Scroll to top functionality for mobile
const btnToTop = document.getElementById(
  "btnToTop"
) as HTMLButtonElement | null;
const isMobile: boolean = window.innerWidth < 1024;

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

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

// Initialize the application
function initApp() {
  // Check for critical DOM elements
  const criticalElements = [
    { element: container, name: "container" },
    { element: imageUpload, name: "imageUpload" },
    { element: browseButton, name: "browseButton" },
    { element: uploadInterface, name: "uploadInterface" },
    { element: imagePreview, name: "imagePreview" },
    { element: progress, name: "progress" },
    { element: controls, name: "controls" },
  ];

  const missingElements = criticalElements.filter(({ element }) => !element);
  if (missingElements.length > 0) {
    console.error(
      "Critical DOM elements missing:",
      missingElements.map(({ name }) => name)
    );
    return; // Exit early if critical elements are missing
  }

  // Set initial values
  if (inputElementLetterSpacing) {
    inputElementLetterSpacing.value =
      letterSpacingValues[currentIndexLetterSpacing].toString();
  }

  if (inputElementFontSize) {
    inputElementFontSize.value =
      fontSizeValues[currentFontSizeIndex].toString();
  }

  // Attach event listeners with null checks
  if (browseButton) {
    browseButton.addEventListener("click", handleBrowseClick);
  }
  if (imageUpload) {
    imageUpload.addEventListener("change", handleFileUpload);
  }

  // Drag-and-drop listeners
  if (container) {
    container.addEventListener("dragenter", handleDragEnter);
    container.addEventListener("dragover", handleDragOver);
    container.addEventListener("dragleave", handleDragLeave);
    container.addEventListener("drop", handleDrop);
  }

  // Setup slider and input pairs
  setupSliderAndInput(
    elements.rotationSlider,
    elements.rotationValue,
    (value) => {
      rotation = value;
    }
  );
  setupSliderAndInput(elements.scaleSlider, elements.scaleValue, (value) => {
    scale = value;
  });
  setupSliderAndInput(
    elements.frameThicknessSlider,
    elements.frameThicknessValue,
    (value) => {
      frameThickness = value;
    }
  );
  setupSliderAndInput(
    elements.startPositionSlider,
    elements.startPositionValue,
    (value) => {
      startPosition = value;
    }
  );
  setupSliderAndInput(
    elements.endPositionSlider,
    elements.endPositionValue,
    (value) => {
      endPosition = value;
    }
  );
  setupSliderAndInput(
    elements.textPlacementSlider,
    elements.textPlacementValue,
    (value) => {
      textPlacement = value;
    }
  );

  // Text input
  if (frameTextInput) {
    frameTextInput.addEventListener("input", () => {
      if (frameTextInput) {
        textInput = frameTextInput.value.toUpperCase();
        redrawCanvas();
      }
    });
  }

  // Button listeners
  if (resetButton) {
    resetButton.addEventListener("click", resetControls);
  }
  if (startOverButton) {
    startOverButton.addEventListener("click", handleStartOver);
  }
  if (downloadButton) {
    downloadButton.addEventListener("click", handleDownload);
  }

  // Letter spacing and font size controls
  if (decreaseButtonLetterSpacing && increaseButtonLetterSpacing) {
    increaseButtonLetterSpacing.addEventListener(
      "click",
      handleIncreaseLetterSpacing
    );
    decreaseButtonLetterSpacing.addEventListener(
      "click",
      handleDecreaseLetterSpacing
    );
  }

  if (decreaseButtonFontSize && increaseButtonFontSize) {
    increaseButtonFontSize.addEventListener("click", handleIncreaseFontSize);
    decreaseButtonFontSize.addEventListener("click", handleDecreaseFontSize);
  }

  // Initialize color sections
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
      const hexInput = safeGetElement<HTMLInputElement>(
        hexInputId,
        "HTMLInputElement"
      );
      const colorPicker = safeGetElement<HTMLInputElement>(
        colorPickerId,
        "HTMLInputElement"
      );
      const randomBtn = safeGetElement<HTMLButtonElement>(
        randomBtnId,
        "HTMLButtonElement"
      );

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

  // Set up scroll to top for mobile
  if (isMobile && btnToTop) {
    window.onscroll = scrollFunction;
    btnToTop.addEventListener("click", topFunction);
  }
}

// Initialize the application when the DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);

// Clean up function for when the component is destroyed or page is unloaded
function cleanup() {
  // Remove all event listeners with null checks
  if (browseButton) {
    browseButton.removeEventListener("click", handleBrowseClick);
  }
  if (imageUpload) {
    imageUpload.removeEventListener("change", handleFileUpload);
  }

  if (container) {
    container.removeEventListener("dragenter", handleDragEnter);
    container.removeEventListener("dragover", handleDragOver);
    container.removeEventListener("dragleave", handleDragLeave);
    container.removeEventListener("drop", handleDrop);
  }

  if (resetButton) {
    resetButton.removeEventListener("click", resetControls);
  }
  if (startOverButton) {
    startOverButton.removeEventListener("click", handleStartOver);
  }
  if (downloadButton) {
    downloadButton.removeEventListener("click", handleDownload);
  }

  if (decreaseButtonLetterSpacing && increaseButtonLetterSpacing) {
    increaseButtonLetterSpacing.removeEventListener(
      "click",
      handleIncreaseLetterSpacing
    );
    decreaseButtonLetterSpacing.removeEventListener(
      "click",
      handleDecreaseLetterSpacing
    );
  }

  if (decreaseButtonFontSize && increaseButtonFontSize) {
    increaseButtonFontSize.removeEventListener("click", handleIncreaseFontSize);
    decreaseButtonFontSize.removeEventListener("click", handleDecreaseFontSize);
  }

  // Clean up canvas if it exists
  if (canvas) {
    resetUploadState();
  }

  // Remove window scroll handler if it exists
  if (isMobile) {
    window.onscroll = null;
    if (btnToTop) {
      btnToTop.removeEventListener("click", topFunction);
    }
  }
}

// Add unload listener to clean up on page unload
window.addEventListener("beforeunload", cleanup);

// Input validation functions
function validateHexColor(hex: string): boolean {
  if (!hex || typeof hex !== "string") return false;

  // Remove # if present
  const cleanHex = hex.replace(/^#/, "");

  // Check if it's a valid hex color (3 or 6 characters, only hex digits)
  return /^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(cleanHex);
}

function validateNumericInput(
  value: string,
  min: number,
  max: number
): boolean {
  const num = parseFloat(value);
  return !isNaN(num) && num >= min && num <= max;
}

function sanitizeTextInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  // Remove potentially harmful characters and limit length
  return input
    .replace(/[<>"/\\&]/g, "")
    .substring(0, 100)
    .toUpperCase();
}

// Error boundary wrapper for critical functions
function withErrorBoundary<T extends (...args: any[]) => any>(
  fn: T,
  fallback?: () => void,
  errorMessage?: string
): T {
  return ((...args: Parameters<T>) => {
    try {
      return fn(...args);
    } catch (error) {
      console.error(errorMessage || `Error in ${fn.name}:`, error);
      if (fallback) {
        fallback();
      }
      return undefined;
    }
  }) as T;
}

// Enhanced color management with validation
function setColorWithValidation(section: ColorSection, color: string) {
  if (!validateHexColor(color)) {
    console.warn(`Invalid hex color: ${color}, using default`);
    color = getRandomColor();
  }

  // Ensure color starts with #
  if (!color.startsWith("#")) {
    color = "#" + color;
  }

  setColor(section, color);
}

// Enhanced text input handler with validation
function handleTextInputWithValidation(input: HTMLInputElement) {
  if (!input) return;

  const sanitizedValue = sanitizeTextInput(input.value);
  if (sanitizedValue !== input.value) {
    input.value = sanitizedValue;
  }

  textInput = sanitizedValue || "#ONTHEHUNT";
  redrawCanvas();
}

// Loading state management
function showLoadingState(message: string = "Processing...") {
  if (progress) {
    progress.classList.add("flex");
    progress.classList.remove("hidden");

    // Add loading message if element exists
    const loadingText = progress.querySelector(".loading-text");
    if (loadingText) {
      loadingText.textContent = message;
    }
  }
}

function hideLoadingState() {
  if (progress) {
    progress.classList.add("hidden");
    progress.classList.remove("flex");
  }
}

// Enhanced file upload with better error handling and loading states
const enhancedHandleFileUpload = withErrorBoundary(
  function (event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];

    // Enhanced file validation
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file (JPG, PNG, GIF, etc.).");
      return;
    }

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("File size too large. Please upload an image smaller than 10MB.");
      return;
    }

    if (!progress || !uploadInterface || !controls || !imagePreview) {
      console.error("Required DOM elements not found");
      return;
    }

    showLoadingState("Uploading image...");
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
    if (imageUpload) {
      imageUpload.value = "";
    }
  },
  () => {
    hideLoadingState();
    alert("An error occurred while uploading the image. Please try again.");
  },
  "Enhanced file upload error"
);

// Enhanced image preview with loading states
const enhancedDisplayImagePreview = withErrorBoundary(
  function (file: File) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result !== "string") return;

      showLoadingState("Processing image...");

      image = new Image();
      image.onload = () => {
        if (!canvas) return;

        canvas.width = 400;
        canvas.height = 400;

        redrawCanvas();

        hideLoadingState();

        if (imagePreview) {
          imagePreview.classList.remove("hidden");
        }
        if (uploadInterface) {
          uploadInterface.classList.add("hidden");
        }
        if (container) {
          container.classList.remove("border-dashed");
          container.classList.add("border-solid");
        }
        if (controls) {
          controls.classList.remove("hidden");
          controls.classList.add("flex");
        }
      };

      image.onerror = () => {
        hideLoadingState();
        alert("Failed to load image. Please try another file.");
        resetUploadState();
      };

      image.src = result;
    };

    reader.onerror = () => {
      hideLoadingState();
      alert("Error reading file. Please try again.");
      resetUploadState();
    };

    reader.readAsDataURL(file);
  },
  () => {
    hideLoadingState();
    alert("An error occurred while processing the image. Please try again.");
  },
  "Enhanced image preview error"
);
