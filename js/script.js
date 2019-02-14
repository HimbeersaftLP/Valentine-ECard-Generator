"use strict";
let heads = false;
let stillrendering = false;
const textscale = 80;
const imagebtn = document.getElementById("image");
const picker = document.getElementById("imagePicker");
const scategory = document.getElementById("category");
const imagesl = document.getElementById("images");
let selectedImage = "";
const ttext = document.getElementById("mtext");
const tto = document.getElementById("to");
const tfrom = document.getElementById("from");
const fstyle = document.getElementById("fontstyle");
const font = document.getElementById("font");
const fsize = document.getElementById("size");
const bcolor = document.getElementById("backcl");
const tcolor = document.getElementById("textcl");
const saveImageBtn = document.getElementById("saveImage");
const saveImageWin = document.getElementById("saveImageWindow");
const saveImageClose = document.getElementById("saveImageClose");
const saveImageImage = document.getElementById("saveImageImg");

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", {alpha: false});
ctx.textBaseline = "middle";

const xhr = new XMLHttpRequest();
xhr.onreadystatechange = function () {
    if (this.readyState === 4 && this.status === 200) {
        heads = JSON.parse(this.responseText);
        scategory.removeChild(scategory.childNodes[1]);
        for (const category in heads) {
            addOption(scategory, category, category);
        }
        addOption(scategory, "Uploaded", "Uploaded Images");
        updateImglist();
    }
};
xhr.open("GET", "./images/images.json", true);
xhr.send();

function addOption(elem, val, text) {
    const opt = document.createElement("option");
    opt.value = val;
    const desc = document.createTextNode(text);
    opt.appendChild(desc);
    elem.appendChild(opt);
}

scategory.onchange = function () {
    updateImglist();
};

function updateImglist() {
    if (!heads) return;
    while (imagesl.firstChild) {
        imagesl.removeChild(imagesl.firstChild);
    }
    if (scategory.value === "Uploaded") {
        localforage.getItem("images", function (err, data) {
            if (err) return;
            const currentImages = data.split("|");
            for (let i = 0; i < currentImages.length; i++) {
                addImageOption("Upload #" + (i + 1), currentImages[i]);
            }
        });
    } else {
        for (const name in heads[scategory.value]) {
            let image = heads[scategory.value][name];
            addImageOption(image.name, "./images/" + name + ".png", image.source);
        }
    }
    updateFont();
}

function addImageOption(name, url, source) {
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
        imageDetails.appendChild(document.createTextNode("Source: " + source));
        imageInfo.appendChild(imageDetails);
    }

    pickerElement.appendChild(img);
    pickerElement.appendChild(imageInfo);
    imagesl.appendChild(pickerElement);
}

saveImageBtn.addEventListener("click", function () {
    saveImageWin.style.display = "";
    saveImageImage.src = canvas.toDataURL();
});
saveImageClose.addEventListener("click", function () {
    saveImageWin.style.display = "none";
});
imagebtn.addEventListener("click", function () {
    picker.style.display = "";
    updateImglist();
});
imagesl.addEventListener("click", function (e) {
    let p = e.target;
    while (p.className !== "pickerElement") {
        p = p.parentElement;
    }
    selectedImage = p.getAttribute("data-image-url");
    picker.style.display = "none";
    renderCard();
});
ttext.oninput = renderCard;
tto.oninput = renderCard;
tfrom.oninput = renderCard;
fstyle.onchange = updateFont;
font.onchange = updateFont;
fsize.onchange = updateFont;

function setFontSize(size) {
    ctx.font = fstyle.value + " " + size + "px " + font.value;
}

function updateFont(rerender = true) {
    setFontSize(textscale * fsize.value);
    if (rerender) renderCard();
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
    updateFont(false);
}