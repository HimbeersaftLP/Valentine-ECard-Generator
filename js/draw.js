"use strict";

function initDraw() {
    const canvas = document.getElementById("croppingMask");
    const penSize = document.getElementById("penSize");

    const c = canvas.getContext("2d");

    let isclicking = false;
    let mouseupped = true;
    let lastx = 0;
    let lasty = 0;

    let hasDrawnAnything = false;

    canvas.addEventListener("mousedown", function () {
        isclicking = true;
    });

    canvas.addEventListener("touchstart", function () {
        isclicking = true;
    });

    canvas.addEventListener("mouseup", function () {
        isclicking = false;
        mouseupped = true;
    });

    canvas.addEventListener("touchend", function () {
        isclicking = false;
        mouseupped = true;
    });

    canvas.addEventListener("mousemove", function (e) {
        if (isclicking) {
            const rect = canvas.getBoundingClientRect();
            const factor = canvas.width / rect.width;
            const x = (e.clientX - rect.left) * factor;
            const y = (e.clientY - rect.top) * factor;
            if (!mouseupped) drawLine(lastx, lasty, x, y);
            lastx = x;
            lasty = y;
            mouseupped = false;
        }
    });

    canvas.addEventListener("touchmove", function (e) {
        e.preventDefault();
        if (isclicking) {
            const rect = canvas.getBoundingClientRect();
            const factor = canvas.width / rect.width;
            const x = (e.targetTouches.item(0).clientX - rect.left) * factor;
            const y = (e.targetTouches.item(0).clientY - rect.top) * factor;
            if (!mouseupped) drawLine(lastx, lasty, x, y);
            lastx = x;
            lasty = y;
            mouseupped = false;
        }
    });

    function drawLine(xf, yf, xt, yt) {
        c.beginPath();
        c.moveTo(xf, yf);
        c.lineTo(xt, yt);
        c.stroke();
        hasDrawnAnything = true;
    }

    function setSize(size) {
        c.lineWidth = size;
    }

    penSize.addEventListener("change", function () {
        setSize(penSize.value);
    });

    function clearCanvas() {
        c.fillStyle = "rgba(0, 0, 0, 0)";
        c.fillRect(0, 0, canvas.width, canvas.height);
    }

    function resetCanvas() {
        clearCanvas();
        c.strokeStyle = "red";
        c.lineCap = "round";
        penSize.min = canvas.width / 25;
        penSize.max = canvas.width / 3;
        penSize.value = canvas.width / 10;
        setSize(penSize.value);
        hasDrawnAnything = false;
    }

    function getHasDrawnAnything() {
        return hasDrawnAnything;
    }

    resetCanvas();

    return {
        reset: resetCanvas,
        hasDrawnAnything: getHasDrawnAnything
    }
}