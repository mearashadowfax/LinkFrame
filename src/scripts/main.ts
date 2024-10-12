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
const rotationValue = document.getElementById(
  "rotateValue"
) as HTMLInputElement;
const rotationSlider = document.getElementById(
  "rotateSlider"
) as HTMLInputElement;
const scaleValue = document.getElementById("scaleValue") as HTMLInputElement;
const scaleSlider = document.getElementById("scaleSlider") as HTMLInputElement;
const resetButton = document.getElementById("resetButton") as HTMLButtonElement;
const startOverButton = document.getElementById(
  "startOverButton"
) as HTMLButtonElement;
const downloadButton = document.getElementById(
  "downloadButton"
) as HTMLButtonElement;


// Arc parameters
const startPositionValue = document.getElementById("startPositionValue") as HTMLInputElement;
const endPositionValue = document.getElementById("endPositionValue") as HTMLInputElement;
const frameTextInput = document.getElementById("frameTextInput") as HTMLInputElement;
const fontSizeInput = document.getElementById("fontSizeInput") as HTMLInputElement;
const hexInput2 = document.getElementById("hexInput2") as HTMLInputElement;
const hexInput3 = document.getElementById("hexInput3") as HTMLInputElement;

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let image = new Image();
let rotation = 0;
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let dragStartX = 0;
let dragStartY = 0;
let currentCanvasBackgroundColor = getRandomColor();

// Show file dialog when clicking 'browse'
browseButton.addEventListener("click", () => imageUpload.click());

// Handle file selection
imageUpload.addEventListener("change", handleFileUpload);

// Drag-and-drop event listeners
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

// File upload handler
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

  // Create canvas element if not already created
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.id = "canvas";
    canvas.className = "border border-slate-300";
    imagePreview.appendChild(canvas);
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    // Enable dragging after image is loaded
    enableDragging(canvas);
  }

  // Display the image preview once it's loaded
  displayImagePreview(file);
  imageUpload.value = "";
}

// Display image preview
function displayImagePreview(file: File) {
  const reader = new FileReader();

  reader.onload = (e) => {
    image.src = e.target?.result as string;
    image.onload = () => {
      // Set canvas dimensions
      canvas!.width = 400;
      canvas!.height = 400;

      // Image is fully loaded, so we can safely redraw the canvas now
      redrawCanvas();
      // Hide the progress indicator and show the canvas
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
  hex = hex.replace(/^#/, '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

// Redraw the canvas
function redrawCanvas() {
  if (!ctx || !image.complete || image.naturalWidth === 0) return;

  requestAnimationFrame(() => {
    if (ctx && canvas) {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fill canvas background with color if needed
      ctx.fillStyle = currentCanvasBackgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Apply transformations (rotation and scale)
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(canvas.width / 2 + offsetX, canvas.height / 2 + offsetY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(scale, scale);

      // Draw the image centered on the canvas
      ctx.drawImage(image, -image.width / 2, -image.height / 2);

      // Restore the default transformation matrix
      ctx.setTransform(1, 0, 0, 1, 0, 0);
    }

    // Draw the circular arc
    drawCircularArcAndText();
  });
}

function drawCircularArcAndText() {
  if (!ctx || !canvas) return;

  // Create the banner arc
  const arcWidth = (canvas.width / 2) * 0.3; // Adjust this value to change the thickness of the arc
  const startArcAngle = (Math.PI * parseFloat(startPositionValue.value)) / 6; // Adjust start angle based on input
  const endArcAngle = (Math.PI * parseFloat(endPositionValue.value)) / 6; // Adjust end angle based on input
  const totalArcAngle = startArcAngle - endArcAngle;

  ctx.lineWidth = arcWidth;
  const steps = 300; // Number of segments to create the gradient effect

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = startArcAngle - t * totalArcAngle;

    // Calculate opacity for solid middle 80% and quick fade at ends
    let opacity: number;
    if (t < 0.2) {
      opacity = t * 7; // Quick fade in
    } else if (t > 0.7) {
      opacity = (1 - t) * 7; // Quick fade out
    } else {
      opacity = 1; // Solid middle
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

    const color = hexInput2.value; // Color from input
    ctx.strokeStyle = rgba(
      hexToRgb(color).r,
      hexToRgb(color).g,
      hexToRgb(color).b,
      opacity
    );
    ctx.stroke();
  }

  // Draw the text along the arc
  const text = frameTextInput.value;
  const textLength = text.length;
  const textRadius = canvas.width / 2 - arcWidth / 2;
  const anglePerChar = Math.PI * 0.1; // Example letter spacing

  const totalAngle = anglePerChar * textLength;

  ctx.font = `${fontSizeInput.value}px Arial`; // Font size from input
  ctx.fillStyle = "#000"; // Text color can be customizable later
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const startAngle = Math.PI * 1.61 - totalAngle / 2; // Center the text
  ctx.save();
  ctx.translate(canvas.width / 2, canvas.height / 2);

  for (let i = 0; i < text.length; i++) {
    const angle = startAngle - i * anglePerChar;
    ctx.save();
    ctx.rotate(angle);
    ctx.fillText(text[i], textRadius, 0); // Draw text at the calculated angle and radius
    ctx.restore();
  }
  
  ctx.restore();
}

// Enable dragging of the canvas
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

// Event listener for the rotation input field
rotationValue.addEventListener("input", () => {
  rotation = parseFloat(rotationValue.value);
  rotationSlider.value = rotationValue.value;
  redrawCanvas();
});

// Event listener for the rotation slider
rotationSlider.addEventListener("input", () => {
  rotation = parseFloat(rotationSlider.value);
  rotationValue.value = rotationSlider.value;
  redrawCanvas();
});

// Event listener for the rotation input field
scaleValue.addEventListener("input", () => {
  scale = parseFloat(scaleValue.value);
  scaleSlider.value = scaleValue.value;
  redrawCanvas();
});

// Event listener for the rotation slider
scaleSlider.addEventListener("input", () => {
  scale = parseFloat(scaleSlider.value);
  scaleValue.value = scaleSlider.value;
  redrawCanvas();
});

resetButton.addEventListener("click", () => {
  // Reset transformations
  rotation = 0;
  scale = 1;
  offsetX = 0;
  offsetY = 0;

  // Reset input values
  rotationValue.value = rotation.toString();
  scaleValue.value = scale.toString();
  rotationSlider.value = rotation.toString();
  scaleSlider.value = scale.toString();
  redrawCanvas();
});

// Start over with the image upload
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
}

// Function to generate a random color (hex format)
function getRandomColor(): string {
  const letters = "0123456789ABCDEF";
  return `#${Array.from({ length: 6 }, () => letters[Math.floor(Math.random() * 16)]).join("")}`;
}

// Function to set the color and update either the canvas background or a section
function setColor(section: ColorSection, color: string) {
  section.hexInput.value = color;
  section.hexInput.placeholder = color;
  section.colorPicker.value = color;

  if (section.isForCanvas) {
    setCanvasBackgroundColor(color);
  }
}


function setCanvasBackgroundColor(color: string) {
  if (currentCanvasBackgroundColor !== color) {
    currentCanvasBackgroundColor = color; // Update only if it's different

    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas!.width, canvas!.height); // Set the background
    }

    redrawCanvas(); // Redraw the canvas to reflect the new background color
  }
}

function attachEventListenersToSection(section: ColorSection) {
  section.randomBtn.addEventListener("click", () => {
    const randomColor = getRandomColor();
    setColor(section, randomColor); // Set new random color
  });

  section.hexInput.addEventListener("input", (e) => {
    const value = (e.target as HTMLInputElement).value;
    if (/^#[0-9A-F]{6}$/i.test(value)) {
      setColor(section, value); // Set color based on hex input
    }
  });

  section.colorPicker.addEventListener("input", (e) => {
    const color = (e.target as HTMLInputElement).value;
    setColor(section, color); // Set color based on color picker
  });
}

const sections = [
  {
    hexInputId: "hexInput1",
    colorPickerId: "colorPicker1",
    randomBtnId: "randomBtn1",
    isForCanvas: true,
  },
  {
    hexInputId: "hexInput2",
    colorPickerId: "colorPicker2",
    randomBtnId: "randomBtn2",
    isForCanvas: false,
  },
  {
    hexInputId: "hexInput3",
    colorPickerId: "colorPicker3",
    randomBtnId: "randomBtn3",
    isForCanvas: false,
  },
];

sections.forEach(({ hexInputId, colorPickerId, randomBtnId, isForCanvas }) => {
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
    };

    const randomColor = getRandomColor();
    setColor(section, randomColor);

    attachEventListenersToSection(section);
  } else {
    console.error(
      `One or more elements not found for section: ${hexInputId}, ${colorPickerId}, ${randomBtnId}`
    );
  }
});

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
  const value = letterSpacingValues[currentIndexLetterSpacing];
  inputElementLetterSpacing!.value = value.toString();
  console.log(`Current letter spacing: ${value}em`);
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
  const value = fontSizeValues[currentFontSizeIndex];
  inputElementFontSize!.value = value.toString();
  console.log(`Current font size: ${value}px`);
}

// Getting the button element by id with strict typing
const btnToTop = document.getElementById(
  "btnToTop"
) as HTMLButtonElement | null;

// Check if the current device is mobile
const isMobile: boolean = window.innerWidth < 1024;

// Only add scroll functionality if it's a mobile device
if (isMobile && btnToTop) {
  window.onscroll = () => scrollFunction();
}

// Function to show/hide the button based on scroll position
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

// Scroll to the top when the button is clicked
btnToTop?.addEventListener("click", () => topFunction());

function topFunction() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}
