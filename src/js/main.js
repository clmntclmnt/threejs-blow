var webgl,
    gui,
    globalAudio,
    soundAllowed,
    isStarted,
    ui,
    animationDone,
    soundListening,
    isAllStopped,
    animationDone,
    browsers;

$(document).ready(init);

function init(){
    isStarted = false;
    isAllStopped = false;
    soundAllowed = false;
    animationDone = false;
    globalAudio = {};
    ui = {};
    browsers = {};
    console.log(browsers);

    // gui = new dat.GUI();
    webgl = new Webgl(window.innerWidth, window.innerHeight);

    $(window).on('resize', resizeHandler);

    detectBrowsers();
    bindUI();
    animateIntroScene();
    animate();

    if(browsers.isSafari || browsers.isIE) {
        throwBrowserException();
        return;
    }

    bindEvents();

    // main.init();
}

function detectBrowsers() {
    browsers.isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
        // Opera 8.0+ (UA detection to detect Blink/v8-powered Opera)
    browsers.isFirefox = typeof InstallTrigger !== 'undefined';   // Firefox 1.0+
    browsers.isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
        // At least Safari 3+: "[object HTMLElementConstructor]"
    browsers.isChrome = !!window.chrome && !browsers.isOpera;              // Chrome 1+
    browsers.isIE = /*@cc_on!@*/false || !!document.documentMode; // At least IE6
}

function throwBrowserException() {
    ui.$body.on('click', ui.$btnStart, $.proxy(animateException));
}

function bindUI() {
    ui.$win = $(window);
    ui.$body = $('body');
    ui.$blockIntro = $('.js-intro');
    ui.$btnStart = '.js-start';
    ui.$indicatorHand = $('.js-click-please');
    ui.$blockMic = $('.js-microphone-please');
    ui.$blockEnd = $('.js-end');
    ui.$blockExc = $('.js-no-way');
}

function bindEvents() {
    ui.$body.on('click', ui.$btnStart, $.proxy(animateOutroScene));
}

function animateIntroScene() {
    TweenMax.from(ui.$blockIntro, 2, {y: 100, opacity: 0, ease: Expo.easeInOut});
    TweenMax.to(ui.$blockIntro, 2, {y: 0, opacity: 1, ease: Expo.easeInOut});
}

function animateOutroScene(e) {
    e.preventDefault();

    TweenMax.from(ui.$blockIntro, 1.5, {y: 0, opacity: 1, ease: Expo.easeInOut});
    TweenMax.to(ui.$blockIntro, 1.5, {y: 50, opacity: 0, ease: Expo.easeInOut, onComplete: function(){ $(this._targets[0]).css('display', 'none'); } });

    isStarted = true;
}

function animateAllowMic() {
    TweenMax.from(ui.$blockMic, 2, {y: 100, opacity: 0, ease: Expo.easeInOut});
    TweenMax.to(ui.$blockMic, 2, {y: 0, opacity: 1, ease: Expo.easeInOut});
}

function animateOutAllowMic() {
    TweenMax.from(ui.$blockMic, 1.5, {y: 0, opacity: 1, ease: Expo.easeInOut});
    TweenMax.to(ui.$blockMic, 1.5, {y: 50, opacity: 0, ease: Expo.easeInOut});
}

function animateEnd() {
    TweenMax.from(ui.$blockEnd, 2, {y: 100, opacity: 0, ease: Expo.easeInOut});
    TweenMax.to(ui.$blockEnd, 2, {y: 0, opacity: 1, ease: Expo.easeInOut});
}

function animateException(e) {
    e.preventDefault();

    TweenMax.from(ui.$blockIntro, 1.5, {y: 0, opacity: 1, ease: Expo.easeInOut});
    TweenMax.to(ui.$blockIntro, 1.5, {y: 50, opacity: 0, ease: Expo.easeInOut, onComplete: function(){ $(this._targets[0]).css('display', 'none'); } });

    TweenMax.from(ui.$blockExc, 1.5, {y: 100, opacity: 0, ease: Expo.easeInOut});
    TweenMax.to(ui.$blockExc, 1.5, {y: 0, opacity: 1, ease: Expo.easeInOut});
}

function animateIndicator(way) {
    if(way == 'in') {
        TweenMax.to(ui.$indicatorHand, 1, {opacity: 1, ease: Expo.easeInOut});

        var tween = TweenMax.to(ui.$indicatorHand, 1, {y: 30, ease: Expo.easeInOut, repeat: -1});
        tween.yoyo(true);
    } else {
        TweenMax.to(ui.$indicatorHand, 0.1, {opacity: 0, ease: Expo.easeInOut, onComplete: setAnimationDone});
    }
}

function setAnimationDone() {
    animationDone = true;
}

function getSoundFromMic() {
    window.AudioContext = window.AudioContext || window.webkitAudioContext;

    navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);

    globalAudio.context = new AudioContext();

    navigator.getUserMedia({audio: true}, function(stream) {

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
        soundListening = false;
        return;
    } else {
        soundListening = true;
    }

    samplesHandler(globalAudio.amplitudeArray);
}


