"use strict";
let stillrendering = false;
const textscale = 80;
const listCustomBtn = document.getElementById("listCustom");
const customImagePickerWin = document.getElementById("customImagePickerWin");
const customImageList = document.getElementById("customImages");
let selectedImage = "";
const ttext = document.getElementById("mtext");
const tto = document.getElementById("to");
const tfrom = document.getElementById("from");
const fstyle = document.getElementById("fontstyle");
const font = document.getElementById("font");
const fsize = document.getElementById("sizeText");
const fsizeSlider = document.getElementById("sizeSlider");
const bcolor = document.getElementById("backcl");
const tcolor = document.getElementById("textcl");
const saveImageBtn = document.getElementById("saveImage");
const saveImageWin = document.getElementById("saveImageWin");
const saveImageImage = document.getElementById("saveImageImg");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", {alpha: false});
ctx.textBaseline = "middle";

function openWindow(w) {
    document.body.className = "winOpen";
    w.style.display = "";
}

function closeWindow(w) {
    document.body.className ="";
    w.style.display = "none";
}

const windows = document.getElementsByClassName("window");
for (let i = 0; i < windows.length; i++) {
    const w = windows[i];
    const b = document.createElement("button");
    b.className = "windowCloseBtn";
    b.innerHTML = "&times;";
    b.addEventListener("click", function() {
        closeWindow(w);
    });
    w.insertBefore(b, w.firstChild);
};

function updateCustomImageList() {
    while (customImageList.firstChild) {
        customImageList.removeChild(customImageList.firstChild);
    }
    localforage.getItem("images", function (err, data) {
        if (err || data === null) return;
        const currentImages = data.split("|");
        for (let i = 0; i < currentImages.length; i++) {
            addImageOption(customImageList, "Upload #" + (i + 1), currentImages[i]);
        }
    });
    updateFont();
}

function addImageOption(listElement, name, url, source) {
    if (!selectedImage) selectedImage = url;

    const pickerElement = document.createElement("div");
    pickerElement.className = "pickerElement";
    pickerElement.setAttribute("data-image-url", url);

    const img = document.createElement("img");
    img.src = url;

    const imageInfo = document.createElement("div");
    imageInfo.className = "imageInfo";
    imageInfo.appendChild(document.createTextNode(name));

    if (source) {
        const imageDetails = document.createElement("small");
        imageDetails.appendChild(document.createTextNode("Source: "));
        const imageSourceLink = document.createElement("a");
        imageSourceLink.href = source;
        imageSourceLink.appendChild(document.createTextNode(source));
        imageDetails.appendChild(imageSourceLink);
        imageInfo.appendChild(imageDetails);
    } else {
        const imageDelete = document.createElement("button");
        imageDelete.appendChild(document.createTextNode("Delete"));
        imageInfo.appendChild(imageDelete);
    }

    pickerElement.appendChild(img);
    pickerElement.appendChild(imageInfo);
    listElement.appendChild(pickerElement);
}
saveImageBtn.addEventListener("click", function () {
    openWindow(saveImageWin);
    saveImageImage.src = canvas.toDataURL();
});
listCustomBtn.addEventListener("click", function () {
    openWindow(customImagePickerWin);
    updateCustomImageList();
});

customImageList.addEventListener("click", function (e) {
    let p = e.target;
    while (p.className !== "pickerElement") {
        p = p.parentElement;
    }
    selectedImage = p.getAttribute("data-image-url");
    if (e.target.tagName === "BUTTON") {
        localforage.getItem("images", function (err, data) {
            if (err) return;
            let currentImages = data.split("|");
            currentImages = currentImages.filter(function (img) {
                return img !== selectedImage;
            });
            data = currentImages.join("|");
            if (data === "") data = null;
            localforage.setItem("images", data, updateCustomImageList);
        });
        return;
    }
    closeWindow(customImagePickerWin);
    renderCard();
});

ttext.oninput = renderCard;
tto.oninput = renderCard;
tfrom.oninput = renderCard;
fstyle.onchange = updateFont;
font.onchange = updateFont;
fsize.onchange = updateFont;

fsizeSlider.addEventListener("input", function() {
    fsize.value = fsizeSlider.value;
    updateFont();
});

function setFontSize(size) {
    ctx.font = fstyle.value + " " + size + "px " + font.value;
}

function updateFont() {
    setFontSize(textscale * fsize.value);
    renderCard();
}

function renderImage() {
    if (stillrendering) return;
    stillrendering = true;
    const img = new Image();
    img.src = selectedImage;
    img.onload = function () {
        ctx.drawImage(img,
            0, canvas.height / 4,
            (img.width > img.height) ? (canvas.height / 2) : ((canvas.height / 2) * (img.width / img.height)),
            (img.height > img.width) ? (canvas.height / 2) : ((canvas.height / 2) * (img.height / img.width))
        );
        stillrendering = false;
    };
    img.onerror = function () {
        stillrendering = false;
    };
}

function renderText() {
    if (!ttext.value) return;
    multiLineText(ttext.value, canvas.height / 2);
}

function renderFromTo() {
    if (!tto.value && !tfrom.value) return;
    let text = tto.value ? ("To: " + tto.value + "\n") : "";
    text += tfrom.value ? ("From: " + tfrom.value) : "";
    text += tfrom.value && !tto.value ? "\n" : "";
    multiLineTextScaled(text, 0, 360, 720);
}

function renderCard() {
    ctx.fillStyle = "#" + bcolor.value;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#" + tcolor.value;
    renderText();
    renderFromTo();
    renderImage();
}

function multiLineText(text, x) {
    text = autoBreak(text);
    const lines = text.split("\n");
    let y = canvas.height / 2 - (lines.length * textscale * fsize.value) / 2 + textscale / 2 * fsize.value;
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y);
        y += fsize.value * textscale;
    }
}

function autoBreak(text) {
    const lines = text.split("\n");
    for (let i = 0; i < lines.length; i++) {
        let chars = autoBreakLine(lines[i], lines[i].length - 1);
        if (chars < lines[i].length - 1) {
            lines.splice(i + 1, 0, lines[i].substr(chars));
            lines[i] = lines[i].substr(0, chars);
        }
    }
    return lines.join("\n");
}

function autoBreakLine(text, substr) {
    const newText = text.substr(0, substr);
    if (ctx.measureText(newText).width > canvas.width - canvas.height / 2) {
        substr -= 1;
        return autoBreakLine(text, substr);
    }
    return substr;
}

function multiLineTextScaled(text, x, ymin, ymax) {
    ymin += canvas.height / 4;
    const lines = text.split("\n");
    const space = ymax - ymin;
    const size = space / lines.length;
    setFontSize(size);
    let y = ymin + size / 2;
    for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], x, y);
        y += size;
    }
    setFontSize(textscale * fsize.value);
}