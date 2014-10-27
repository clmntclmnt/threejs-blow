var webgl,
    gui,
    globalAudio;

$(document).ready(init);

function init(){
    soundAllowed = false;
    globalAudio = {};

    getSoundFromMic();

    gui = new dat.GUI();
    gui.close();
    webgl = new Webgl(window.innerWidth, window.innerHeight);

    $(window).on('resize', resizeHandler);

    animate();

    // main.init();
}

function getSoundFromMic() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

    globalAudio.context = new AudioContext();

    navigator.getUserMedia({audio: true, video: false}, function(stream) {

        globalAudio.sourceNode = globalAudio.context.createMediaStreamSource(stream),
        globalAudio.audioStream = stream,
        globalAudio.analyserNode = globalAudio.context.createAnalyser(),
        globalAudio.javascriptNode = globalAudio.context.createScriptProcessor(256, 1, 1),
        globalAudio.amplitudeArray = new Uint8Array(globalAudio.analyserNode.frequencyBinCount);

        globalAudio.javascriptNode.onaudioprocess = function () {
            globalAudio.amplitudeArray = new Uint8Array(globalAudio.analyserNode.frequencyBinCount);
            globalAudio.analyserNode.getByteTimeDomainData(globalAudio.amplitudeArray);
        }

        globalAudio.sourceNode.connect(globalAudio.analyserNode);
        globalAudio.analyserNode.connect(globalAudio.javascriptNode);
        globalAudio.javascriptNode.connect(globalAudio.context.destination);
    }, callbackError);
}

function callbackError() {
    console.log('error');
}

function resizeHandler() {
    webgl.resize(window.innerWidth, window.innerHeight);
}

function samplesHandler(array) {
    globalAudio.minValue = 9999999;
    globalAudio.maxValue = 0;

    for (var i = 0; i < array.length; i++) {
        var value = array[i] / 256;
        if(value > globalAudio.maxValue) {
            globalAudio.maxValue = value;
        } else if(value < globalAudio.minValue) {
            globalAudio.minValue = value;
        }
    }
}

function animate() {
    requestAnimationFrame(animate);
    webgl.render(globalAudio);

    if(globalAudio.amplitudeArray === undefined) {
        return;
    }

    samplesHandler(globalAudio.amplitudeArray);
}

