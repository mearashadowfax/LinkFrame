    const imageUpload = document.getElementById("image-upload")
    const imageXShiftInput = document.getElementById("image-x-shift")
    const imageYShiftInput = document.getElementById("image-y-shift")
    const downloadBtn = document.getElementById("download-btn")
    const canvas = document.getElementById("canvas")
    const ctx = canvas.getContext("2d")
    const profilePreview = document.getElementById("profile-preview")
    const arcColorInput = document.getElementById("arc-color")
    const arcColorHexCodeInput = document.getElementById("color-code")
    const arcStartInput = document.getElementById("arc-start")
    const arcEndInput = document.getElementById("arc-end")
    const textColorInput = document.getElementById("text-color")
    const textColorHexCodeInput = document.getElementById('text-color-code');
    const bannerTextInput = document.getElementById("banner-text")
    const fontSizeInput = document.getElementById("font-size")
    const letterSpacingInput = document.getElementById("letter-spacing")
    const wordShiftInput = document.getElementById("word-shift")

    let image;
    
    const overlayImageUpload = document.getElementById("overlay-image-upload");
    let overlayImage;

    // Update the overlayImageUpload event listener to crop the image to a square
    overlayImageUpload.addEventListener("change", function (event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          overlayImage = new Image();
          overlayImage.src = e.target.result;
          overlayImage.onload = function () {
            const squareSize = Math.min(overlayImage.width, overlayImage.height);
            const x = (overlayImage.width - squareSize) / 2;
            const y = (overlayImage.height - squareSize) / 2;

            const canvas = document.createElement("canvas");
            canvas.width = squareSize;
            canvas.height = squareSize;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(overlayImage, x, y, squareSize, squareSize, 0, 0, squareSize, squareSize);

            overlayImage.src = canvas.toDataURL();
            updatePreview();
          };
        };
        reader.readAsDataURL(file);
      }
    });

    imageUpload.addEventListener("change", function (event) {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = function (e) {
          image = new Image()
          image.src = e.target.result
          image.onload = function () {
            const size = 600
            const radius = size / 2

            // Set canvas size to the image size
            canvas.width = size
            canvas.height = size

            updatePreview();
          }
        }
        reader.readAsDataURL(file)
      }
    })
    
    imageXShiftInput.addEventListener("input", function () {
      updatePreview();
    });

    imageYShiftInput.addEventListener("input", function () {
      updatePreview();
    });

    arcColorInput.addEventListener("input", function () {
      updatePreview();
    });
    
    arcColorInput.addEventListener('input', () => {
      arcColorHexCodeInput.value = arcColorInput.value;
    });

    arcColorHexCodeInput.addEventListener('input', () => {
      arcColorInput.value = arcColorHexCodeInput.value;
      updatePreview();
    });
    
    arcStartInput.addEventListener("input", function () {
      updatePreview();
    });
    
    arcEndInput.addEventListener("input", function () {
      updatePreview();
    });
    
    textColorInput.addEventListener("input", function () {
      updatePreview();
    });
    
    textColorInput.addEventListener('input', () => {
      textColorHexCodeInput.value = textColorInput.value;
    });

    textColorHexCodeInput.addEventListener('input', () => {
      textColorInput.value = textColorHexCodeInput.value;
      updatePreview();
    });

    bannerTextInput.addEventListener("input", function () {
      updatePreview();
    });
    
    fontSizeInput.addEventListener("input", function () {
      updatePreview();
    });
    
    letterSpacingInput.addEventListener("input", function () {
      updatePreview();
    });
    
    wordShiftInput.addEventListener("input", function () {
      updatePreview();
    });

    
    // Set default image
    const defaultImage = new Image();

    defaultImage.src = 'placeholder-image.png';
    defaultImage.onload = function() {
      profilePreview.src = defaultImage.src;
      profilePreview.style.display = "block";
      image = defaultImage; // Set the image variable to the default image
      canvas.width = 600
      canvas.height = 600
      // setTimeout(updatePreview, 100); // Run updatePreview() after a 100ms delay
      if (canvas.width > 0 && canvas.height > 0) {
          updatePreview(); // Call updatePreview() directly
      } else {
      setTimeout(updatePreview, 100); // Run updatePreview() after a 100ms delay if canvas is not ready
      }
    };

    function updatePreview() {
      // Clear canvas and create a circular clipping path
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      
      // Resize the image to a square
      const squareSize = Math.min(image.width, image.height);
      const x = (image.width - squareSize) / 2;
      const y = (image.height - squareSize) / 2;

      // Draw the profile image within the circular clipping path
      // ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      // ctx.drawImage(image, x, y, squareSize, squareSize, 0, 0, canvas.width, canvas.height);
      // Draw the profile image within the circular clipping path
      ctx.drawImage(image, x + parseFloat(imageXShiftInput.value), y + parseFloat(imageYShiftInput.value), squareSize, squareSize, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Create the banner arc (bottom-left quadrant outline with gradient)
      const arcWidth = canvas.width / 2 * 0.3; // Adjust this value to change the thickness of the arc
      const startArcAngle = Math.PI * `${arcStartInput.value}` / 6; // 9 o'clock position
      const endArcAngle = Math.PI * `${arcEndInput.value}` / 6; // 4 o'clock position
      const totalArcAngle = startArcAngle - endArcAngle;
      const steps = 300; // Number of segments to create the gradient effect

      ctx.lineWidth = arcWidth;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const angle = startArcAngle - t * totalArcAngle;

        // Calculate opacity for solid middle 80% and quick fade at ends
        let opacity;
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
        ctx.strokeStyle = `rgba(${hexToRgb(arcColorInput.value).r}, ${hexToRgb(arcColorInput.value).g}, ${hexToRgb(arcColorInput.value).b}, ${opacity})`;
        ctx.stroke();
      }
      
      if (overlayImage) {
        const overlaySize = 150; // Adjust this value to change the size of the overlay image
        const overlayX = canvas.width - overlaySize / 2 - canvas.width / 4;
        const overlayY = canvas.height / 2 - overlaySize / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(overlayX + overlaySize / 2, overlayY + overlaySize / 2, overlaySize / 2, 0, Math.PI * 2, true);
        ctx.clip();
        ctx.drawImage(overlayImage, overlayX, overlayY, overlaySize, overlaySize);
        ctx.restore();
      }

      // Add curved text along the arc
      const text = bannerTextInput.value;
      const textLength = text.length;
      const textRadius = canvas.width / 2 - arcWidth / 2;
      const anglePerChar = (Math.PI * parseFloat(letterSpacingInput.value)) / 10;

      totalAngle = anglePerChar * textLength;

      ctx.font = `bolder ${fontSizeInput.value}px Arial`;
      ctx.fillStyle = textColorInput.value;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      // Calculate the angle for the text arc
      // const startAngle = Math.PI * 1.47; // Start from 9 o'clock
      const startAngle = Math.PI * 1.61 - (totalAngle / 2) + (Math.PI * 0.9 - totalAngle) / 2; // Center the text
      const endAngle = Math.PI * 0.95; // End at 6 o'clock
      const arcAngle = endAngle - startAngle;

      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);

      /*
      for (let i = 0; i < text.length; i++) {
        const angle = startAngle - i * anglePerChar;
        ctx.save();
        ctx.rotate(angle);
        ctx.translate(0, -textRadius);
        ctx.rotate(Math.PI / 1); // Rotate each character to face outward
        ctx.fillText(text[i], 0, 0);
        ctx.restore();
        */
        
        // Define a custom kerning table for the Arial font
        /*const kerningTable = {
          'I': { 'A': -0.05, 'E': -0.05, 'O': -0.05, 'N': -0.05 }, // Adjust kerning for narrow letters
          'A': { 'I': -0.05, 'E': -0.05, 'O': -0.05 },
          'E': { 'I': -0.05, 'A': -0.05, 'O': -0.05 },
          'O': { 'I': -0.05, 'A': -0.05, 'E': -0.05 },
          'D': { 'I': -0.05, },
          'N': { 'D': -0.05, },
          'K': { 'I': -0.05, },
        };
        const char = text[i];
        const nextChar = text[i + 1];
        const kerningAdjustment = kerningTable[char] && kerningTable[char][nextChar] ? kerningTable[char][nextChar] : 0;
        */
        

        for (let i = 0; i < text.length; i++) {
        const angle = startAngle - i * anglePerChar + parseFloat(wordShiftInput.value);
        ctx.save();
        ctx.rotate(angle);
        ctx.translate(0, -textRadius);
        ctx.rotate(Math.PI / 1); // Rotate each character to face outward

        ctx.fillText(text[i], 0, 0);
        ctx.restore();
      }
      ctx.restore();

      // Show preview of the image
      // profilePreview.src = canvas.toDataURL("image/png");
      // profilePreview.style.display = "block";
      
      // Show preview of the image
      if (image) {
        profilePreview.src = canvas.toDataURL("image/png");
      } else {
        profilePreview.src = defaultImage.src;
        
      }
      profilePreview.style.display = "block";

      // Enable download button
      downloadBtn.disabled = false;
      downloadBtn.classList.remove('bg-gray-500', 'hover:bg-gray-700', 'cursor-not-allowed');
      downloadBtn.classList.add('bg-green-500', 'hover:bg-green-700');
    }

    downloadBtn.addEventListener("click", function () {
      // Trigger download
      const link = document.createElement("a");
      link.href = canvas.toDataURL("image/png");
      link.download = "profile-image.png";
      link.click();
    })

    function hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }
    
    const removeImageButton = document.getElementById("remove-image");
    removeImageButton.addEventListener("click", function () {
      imageUpload.value = "";
      image = null;
      // Clear the canvas and show the default image
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      profilePreview.src = defaultImage.src;
      profilePreview.style.display = "block";
    });
    
    const fileInput = document.getElementById('image-upload');
    const removeButton = document.getElementById('remove-image');
    const fileNameSpan = document.getElementById('file-name');

    fileInput.addEventListener('change', (e) => {
      const fileName = e.target.files[0].name;
      fileNameSpan.textContent = fileName;
      removeButton.style.display = 'block';
    });

    removeButton.addEventListener('click', () => {
      fileInput.value = '';
      fileNameSpan.textContent = '';
      removeButton.style.display = 'none';
    });
    
    const removeOverlayButton = document.getElementById('remove-overlay-image');
    const overlayFileNameSpan = document.getElementById('overlay-file-name');

    overlayImageUpload.addEventListener('change', (e) => {
      const fileName = e.target.files[0].name;
      overlayFileNameSpan.textContent = fileName;
      removeOverlayButton.style.display = 'block';
    });

    removeOverlayButton.addEventListener('click', () => {
      overlayImageUpload.value = '';
      overlayFileNameSpan.textContent = '';
      removeOverlayButton.style.display = 'none';
      overlayImage = null;
      updatePreview();
    });
    
    const tabButtons = document.querySelectorAll('#tab-1, #tab-2, #tab-3');
    const tabContents = document.querySelectorAll('#tab-content-1, #tab-content-2, #tab-content-3');
    const tabUnderlines = document.querySelectorAll('#tab-1-underline, #tab-2-underline, #tab-3-underline');

    tabButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        tabButtons.forEach((btn) => btn.classList.remove('bg-gray-300'));
        // button.classList.add('bg-gray-300');
        tabUnderlines.forEach((underline) => underline.classList.remove('bg-blue-600'));
        tabUnderlines[index].classList.add('bg-blue-600');
        tabContents.forEach((content) => content.classList.add('hidden'));
        tabContents[index].classList.remove('hidden');
      });
    });
    
    function addShiftListeners(plusIconSelector, minusIconSelector, inputFieldSelector) {
      const plusIcon = document.querySelector(plusIconSelector);
      const minusIcon = document.querySelector(minusIconSelector);
      const inputField = document.querySelector(inputFieldSelector);

      // Prevent text selection on mousedown
      plusIcon.addEventListener('mousedown', (event) => {
        event.preventDefault();
      });

      minusIcon.addEventListener('mousedown', (event) => {
        event.preventDefault();
      });

      // Handle the click events
      plusIcon.addEventListener('click', () => {
        inputField.stepUp();
        updatePreview();
      });

      minusIcon.addEventListener('click', () => {
        inputField.stepDown();
        updatePreview();
      });
    }

    // Now you can use this function for any input field with its corresponding icons
    addShiftListeners('.image-x-shift-plus-icon', '.image-x-shift-minus-icon', '#image-x-shift');
    addShiftListeners('.image-y-shift-plus-icon', '.image-y-shift-minus-icon', '#image-y-shift');
    addShiftListeners('.word-shift-plus-icon', '.word-shift-minus-icon', '#word-shift');
    addShiftListeners('.font-size-plus-icon', '.font-size-minus-icon', '#font-size');
    addShiftListeners('.letter-spacing-plus-icon', '.letter-spacing-minus-icon', '#letter-spacing');
    addShiftListeners('.arc-start-plus-icon', '.arc-start-minus-icon', '#arc-start');
    addShiftListeners('.arc-end-plus-icon', '.arc-end-minus-icon', '#arc-end');

    /*
    const colorInput = document.getElementById('arc-color');
    const colorCodeSpan = document.getElementById('color-code');
    // const colorSwatchSpan = document.getElementById('color-swatch');

    colorInput.addEventListener('input', () => {
      colorCodeSpan.textContent = colorInput.value;
      // colorSwatchSpan.style.backgroundColor = colorInput.value;
    });

    // Initialize the color code span and color swatch span with the initial value
    colorCodeSpan.textContent = colorInput.value;
    // colorSwatchSpan.style.backgroundColor = colorInput.value;
    
    const colorInputText = document.getElementById('text-color');
    const colorCodeSpanText = document.getElementById('text-color-code');

    colorInputText.addEventListener('input', () => {
    colorCodeSpanText.textContent = colorInputText.value;
    });

    // Initialize the color code span and color swatch span with the initial value
    colorCodeSpanText.textContent = colorInputText.value;
    */
  