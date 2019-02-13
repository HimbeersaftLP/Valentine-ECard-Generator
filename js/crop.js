"use strict";
(function () {
    const customImageBtn = document.getElementById("customImage");

    const uploadWindow = document.getElementById("customImageUploader");
    const fileSelect = document.getElementById("customImageFile");
    const fileConfirm = document.getElementById("customImageConfirm");

    const cropperWindow = document.getElementById("customImageCropper");
    const imageCanvas = document.getElementById("originalImage");
    const maskCanvas = document.getElementById("croppingMask");

    const cropCrop = document.getElementById("cropCrop");
    const cropConfirm = document.getElementById("cropConfirm");

    customImageBtn.addEventListener("click", () => {
        uploadWindow.style.display = "";
    });

    fileConfirm.addEventListener("click", () => {
        if (fileSelect.files && fileSelect.files[0]) {
            const file = fileSelect.files[0];
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                const img = new Image();
                img.src = reader.result;
                img.addEventListener("load", () => {
                    imageCanvas.width = maskCanvas.width = img.width;
                    imageCanvas.height = maskCanvas.height = img.height;
                    const imageCtx = imageCanvas.getContext("2d");
                    imageCtx.drawImage(img, 0, 0, img.width, img.height);
                    cropperWindow.style.display = "";
                    const draw = initDraw();

                    function cropCropListener() {
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
                        const url = imageCanvas.toDataURL();
                        let currentImages = [];
                        localforage.getItem("images", function (err, data) {
                            if (data !== null) {
                                currentImages = data.split("|");
                            }
                            currentImages.push(url);
                            localforage.setItem("images", currentImages.join("|"));
                            cropperWindow.style.display = "none";
                            uploadWindow.style.display = "none";
                        });
                        cropCrop.removeEventListener("click", cropCropListener);
                        cropConfirm.removeEventListener("click", cropConfirmListener);
                        selectedImage = url;
                        renderCard();
                    });
                });
                img.addEventListener("error", () => {
                    fileConfirm.innerHTML = "Error processing image";
                });
            });
            reader.addEventListener("error", () => {
                fileConfirm.innerHTML = "Error processing file";
            });
            reader.readAsDataURL(file);
        } else {
            fileConfirm.innerHTML = "No file selected!";
        }
    });

})();