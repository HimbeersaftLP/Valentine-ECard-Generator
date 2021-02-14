// Very hacky hack that preloads fonts so that they show up the first time they are drawn
(function () {
    "use strict";
    const preloadCanvas = document.getElementById("fontPreloader");
    const preloadCanvasCtx = preloadCanvas.getContext("2d");

    preloadCanvasCtx.font = "10px Comic Neue";
    preloadCanvasCtx.fillText(".", 0, 0);

    preloadCanvasCtx.font = "bold 10px Comic Neue";
    preloadCanvasCtx.fillText(".", 0, 0);

    preloadCanvasCtx.font = "oblique 10px Comic Neue";
    preloadCanvasCtx.fillText(".", 0, 0);

    preloadCanvasCtx.font = "oblique bold 10px Comic Neue";
    preloadCanvasCtx.fillText(".", 0, 0);

    document.body.removeChild(preloadCanvas);

    updateFont();
})();