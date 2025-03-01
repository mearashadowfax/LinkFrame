import "@preline/tooltip/index.js";

// Debouncing function for performance
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
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
const container = document.getElementById("imageUploadContainer") as HTMLElement;
const imageUpload = document.getElementById("fileInput") as HTMLInputElement;
const browseButton = document.getElementById("browseButton") as HTMLButtonElement;
const uploadInterface = document.getElementById("uploadInterface") as HTMLElement;
const imagePreview = document.getElementById("imagePreview") as HTMLElement;
const progress = document.getElementById("progress") as HTMLElement;
const controls = document.getElementById("controls") as HTMLElement;

const elements = {
  rotationValue: document.getElementById("rotateValue") as HTMLInputElement,
  rotationSlider: document.getElementById("rotateSlider") as HTMLInputElement,
  scaleValue: document.getElementById("scaleValue") as HTMLInputElement,
  scaleSlider: document.getElementById("scaleSlider") as HTMLInputElement,
  frameThicknessValue: document.getElementById("frameThicknessValue") as HTMLInputElement,
  frameThicknessSlider: document.getElementById("frameThicknessSlider") as HTMLInputElement,
  startPositionValue: document.getElementById("startPositionValue") as HTMLInputElement,
  startPositionSlider: document.getElementById("startPositionSlider") as HTMLInputElement,
  endPositionValue: document.getElementById("endPositionValue") as HTMLInputElement,
  endPositionSlider: document.getElementById("endPositionSlider") as HTMLInputElement,
  textPlacementValue: document.getElementById("textPlacementValue") as HTMLInputElement,
  textPlacementSlider: document.getElementById("textPlacementSlider") as HTMLInputElement,
};

const resetButton = document.getElementById("resetButton") as HTMLButtonElement;
const startOverButton = document.getElementById("startOverButton") as HTMLButtonElement;
const downloadButton = document.getElementById("downloadButton") as HTMLButtonElement;
const frameTextInput = document.getElementById("frameTextInput") as HTMLInputElement;
const hexInput2 = document.getElementById("hexInput2") as HTMLInputElement;
const hexInput3 = document.getElementById("hexInput3") as HTMLInputElement;

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
  imageUpload.click();
}

function handleDragEnter() {
  container.classList.add("dragging");
}

function handleDragOver(e: DragEvent) {
  e.preventDefault();
  container.classList.add("dragging");
}

function handleDragLeave() {
  container.classList.remove("dragging");
}

function handleDrop(e: DragEvent) {
  e.preventDefault();
  const files = e.dataTransfer?.files;
  if (files && files.length > 0) {
    handleFileUpload({ target: { files: [files[0]] } } as unknown as Event);
    container.classList.remove("dragging");
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
    const result = e.target?.result;
    if (typeof result !== 'string') return;
    
    image = new Image();
    image.onload = () => {
      if (!canvas) return;
      
      canvas.width = 400;
      canvas.height = 400;

      redrawCanvas();
      progress.classList.add("hidden");
      imagePreview.classList.remove("hidden");
      uploadInterface.classList.add("hidden");
      container.classList.remove("border-dashed");
      container.classList.add("border-solid");
      controls.classList.remove("hidden");
      controls.classList.add("flex");
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
  hex = hex.replace(/^#/, '');
  
  // Handle shorthand hex (#RGB)
  if (hex.length === 3) {
    hex = hex.split('').map(h => h + h).join('');
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
  if (!ctx || !canvas) return;
  
  // Frame
  const arcWidth = frameThickness;
  let startArcAngle = (Math.PI * (startPosition / 50));
  let endArcAngle = (Math.PI * (endPosition / 50));

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
  if (!ctx || !canvas) return;
  
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

// Setup slider and input pairs
function setupSliderAndInput(
  slider: HTMLInputElement,
  input: HTMLInputElement,
  updateFn: (value: number) => void
) {
  function handleSliderInput() {
    const value = parseFloat(slider.value);
    input.value = value.toString();
    updateFn(value);
    debouncedRedraw();
  }
  
  function handleInputChange() {
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
  elements.textPlacementSlider.value = textPlacement.toString();
  frameTextInput.value = textInput;
  
  redrawCanvas();
}

function handleStartOver() {
  resetUploadState();
  // Delay the click event to ensure state is reset before opening file dialog
  setTimeout(() => {
    imageUpload.click();
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
  imageUpload.value = "";
  image = new Image();
  offsetX = 0;
  offsetY = 0;
  
  imagePreview.classList.add("hidden");
  uploadInterface.classList.remove("hidden");
  controls.classList.add("hidden");
  progress.classList.add("hidden");
  container.classList.remove("border-solid", "border-slate-100");
  container.classList.add("border-dashed", "border-slate-300");
  
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
    handleColorPicker
  };
}

// Letter spacing and font size controls
const letterSpacingValues = [-0.3, -0.25, -0.2, -0.15, -0.1, -0.075, -0.05, -0.025, 0, 0.025, 0.05, 0.075, 0.1, 0.15, 0.2, 0.25, 0.3];
let currentIndexLetterSpacing = 8;

const inputElementLetterSpacing = document.querySelector<HTMLInputElement>("[data-hs-input-letter-spacing]");
const decreaseButtonLetterSpacing = document.querySelector<HTMLButtonElement>("[data-hs-input-letter-spacing-decrement]");
const increaseButtonLetterSpacing = document.querySelector<HTMLButtonElement>("[data-hs-input-letter-spacing-increment]");

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

const inputElementFontSize = document.querySelector<HTMLInputElement>("[data-hs-input-font-size]");
const decreaseButtonFontSize = document.querySelector<HTMLButtonElement>("[data-hs-input-font-size-decrement]");
const increaseButtonFontSize = document.querySelector<HTMLButtonElement>("[data-hs-input-font-size-increment]");

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
const btnToTop = document.getElementById("btnToTop") as HTMLButtonElement | null;
const isMobile: boolean = window.innerWidth < 1024;

function scrollFunction() {
  if (!btnToTop) return;

  if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
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
  // Set initial values
  if (inputElementLetterSpacing) {
    inputElementLetterSpacing.value = letterSpacingValues[currentIndexLetterSpacing].toString();
  }
  
  if (inputElementFontSize) {
    inputElementFontSize.value = fontSizeValues[currentFontSizeIndex].toString();
  }
  
  // Attach event listeners
  browseButton.addEventListener("click", handleBrowseClick);
  imageUpload.addEventListener("change", handleFileUpload);
  
  // Drag-and-drop listeners
  container.addEventListener("dragenter", handleDragEnter);
  container.addEventListener("dragover", handleDragOver);
  container.addEventListener("dragleave", handleDragLeave);
  container.addEventListener("drop", handleDrop);
  
  // Setup slider and input pairs
  setupSliderAndInput(elements.rotationSlider, elements.rotationValue, value => { rotation = value; });
  setupSliderAndInput(elements.scaleSlider, elements.scaleValue, value => { scale = value; });
  setupSliderAndInput(elements.frameThicknessSlider, elements.frameThicknessValue, value => { frameThickness = value; });
  setupSliderAndInput(elements.startPositionSlider, elements.startPositionValue, value => { startPosition = value; });
  setupSliderAndInput(elements.endPositionSlider, elements.endPositionValue, value => { endPosition = value; });
  setupSliderAndInput(elements.textPlacementSlider, elements.textPlacementValue, value => { textPlacement = value; });
  
  // Text input
  frameTextInput.addEventListener("input", () => {
    textInput = frameTextInput.value.toUpperCase();
    redrawCanvas();
  });
  
  // Button listeners
  resetButton.addEventListener("click", resetControls);
  startOverButton.addEventListener("click", handleStartOver);
  downloadButton.addEventListener("click", handleDownload);
  
  // Letter spacing and font size controls
  if (decreaseButtonLetterSpacing && increaseButtonLetterSpacing) {
    increaseButtonLetterSpacing.addEventListener("click", () => adjustSpacing("increase"));
    decreaseButtonLetterSpacing.addEventListener("click", () => adjustSpacing("decrease"));
  }
  
  if (decreaseButtonFontSize && increaseButtonFontSize) {
    increaseButtonFontSize.addEventListener("click", () => adjustFontSize("increase"));
    decreaseButtonFontSize.addEventListener("click", () => adjustFontSize("decrease"));
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

  sections.forEach(({ hexInputId, colorPickerId, randomBtnId, isForCanvas, isForFrame, isForText }) => {
    const hexInput = document.getElementById(hexInputId) as HTMLInputElement;
    const colorPicker = document.getElementById(colorPickerId) as HTMLInputElement;
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
  });
  
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
  // Remove all event listeners
  browseButton.removeEventListener("click", handleBrowseClick);
  imageUpload.removeEventListener("change", handleFileUpload);
  
  container.removeEventListener("dragenter", handleDragEnter);
  container.removeEventListener("dragover", handleDragOver);
  container.removeEventListener("dragleave", handleDragLeave);
  container.removeEventListener("drop", handleDrop);
  
  resetButton.removeEventListener("click", resetControls);
  startOverButton.removeEventListener("click", handleStartOver);
  downloadButton.removeEventListener("click", handleDownload);
  
  if (decreaseButtonLetterSpacing && increaseButtonLetterSpacing) {
    increaseButtonLetterSpacing.removeEventListener("click", () => adjustSpacing("increase"));
    decreaseButtonLetterSpacing.removeEventListener("click", () => adjustSpacing("decrease"));
  }
  
  if (decreaseButtonFontSize && increaseButtonFontSize) {
    increaseButtonFontSize.removeEventListener("click", () => adjustFontSize("increase"));
    decreaseButtonFontSize.removeEventListener("click", () => adjustFontSize("decrease"));
  }
  
  // Clean up canvas if it exists
  if (canvas) {
    resetUploadState();
  }
  
  // Remove window scroll handler if it exists
  if (isMobile) {
    window.onscroll = null;
    btnToTop?.removeEventListener("click", topFunction);
  }
}

// Add unload listener to clean up on page unload
window.addEventListener("beforeunload", cleanup);