(function () {
    "use strict";
    const customImageBtn = document.getElementById("customImage");

    const uploadWindow = document.getElementById("customImageUploaderWin");
    const fileSelect = document.getElementById("customImageFile");
    const fileConfirm = document.getElementById("customImageConfirm");

    const cropperWindow = document.getElementById("customImageCropperWin");
    const imageCanvas = document.getElementById("originalImage");
    const maskCanvas = document.getElementById("croppingMask");

    const cropCrop = document.getElementById("cropCrop");
    const cropConfirm = document.getElementById("cropConfirm");

    customImageBtn.addEventListener("click", function () {
        openWindow(uploadWindow);
    });

    window.createCropperFor = function(src) {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // So cropping from Pixabay URLs works
        img.src = src;
        img.addEventListener("load", function () {
            imageCanvas.width = maskCanvas.width = img.width;
            imageCanvas.height = maskCanvas.height = img.height;
            const imageCtx = imageCanvas.getContext("2d");
            imageCtx.drawImage(img, 0, 0, img.width, img.height);
            openWindow(cropperWindow);
            const draw = initDraw();

            function cropCropListener() {
                if (!draw.hasDrawnAnything()) return;
                const maskCtx = maskCanvas.getContext("2d");
                const maskImageData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height);
                const imageImageData = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);
                let xCropFrom = maskCanvas.width, xCropTo = 0;
                let yCropFrom = 0, yCropTo = 0;
                for (let i = 0; i < maskImageData.data.length; i += 4) {
                    if (maskImageData.data[i + 3] < 100) {
                        imageImageData.data[i + 3] = 0;
                    } else {
                        const x = (i / 4) % maskCanvas.width;
                        const y = Math.ceil((i / 4) / maskCanvas.width);
                        if (x < xCropFrom) xCropFrom = x;
                        if (x > xCropTo) xCropTo = x;
                        if (yCropFrom === 0) yCropFrom = y;
                        yCropTo = y;
                    }
                }
                imageCanvas.width = maskCanvas.width = xCropTo - xCropFrom;
                imageCanvas.height = maskCanvas.height = yCropTo - yCropFrom;
                imageCtx.putImageData(imageImageData, -xCropFrom, -yCropFrom);
                draw.reset();
            }

            cropCrop.addEventListener("click", cropCropListener);

            cropConfirm.addEventListener("click", function cropConfirmListener() {
                cropCropListener();
                const url = imageCanvas.toDataURL();
                let currentImages = [];
                localforage.getItem("images", function (err, data) {
                    if (data !== null) {
                        currentImages = data.split("|");
                    }
                    currentImages.push(url);
                    localforage.setItem("images", currentImages.join("|"));
                    closeWindow(cropperWindow);
                    closeWindow(uploadWindow);
                });
                cropCrop.removeEventListener("click", cropCropListener);
                cropConfirm.removeEventListener("click", cropConfirmListener);
                selectedImage = url;
                renderCard();
            });
        });
        img.addEventListener("error", function () {
            fileConfirm.innerHTML = "Error processing image";
        });
    }

    fileConfirm.addEventListener("click", function () {
        if (fileSelect.files && fileSelect.files[0]) {
            const file = fileSelect.files[0];
            const reader = new FileReader();
            reader.addEventListener("load", function() {
                createCropperFor(reader.result);
            });
            reader.addEventListener("error", function () {
                fileConfirm.innerHTML = "Error processing file";
            });
            reader.readAsDataURL(file);
        } else {
            fileConfirm.innerHTML = "No file selected!";
        }
    });

})();