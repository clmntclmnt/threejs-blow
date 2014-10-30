var Webgl = (function(){

    function Webgl(width, height){
        this.t = 0;
        this.valueToDesc = 0.8;
        this.lightDirection = true;
        this.destination = 0;
        this.stopExecuted = false;

        this.buildPhysicsScene();
        this.buildGround();
        this.buildPhysicsMaterial();
        this.buildBall();

        this.setupSounds();

        this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
        this.camera.position.z = -400;
        this.camera.position.y = 200;

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0x000000);
        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;
        this.renderer.shadowMapType = THREE.PCFShadowMap;
        this.renderer.shadowMapAutoUpdate = true;

        $('.three').append(this.renderer.domElement);

        // Lights
        this.scene.add( new THREE.AmbientLight( 0x000000) );

        this.landLight = new THREE.SpotLight(0x0B1340);
        this.landLight.intensity = .5;
        this.landLight.position.set(0, 2000, 0);
        this.landLight.target.position.copy(this.scene.position);
        this.landLight.shadowCameraTop = -700;
        this.landLight.shadowCameraLeft = -700;
        this.landLight.shadowCameraRight = 700;
        this.landLight.shadowCameraBottom = 700;
        this.landLight.shadowCameraNear = 20;
        this.landLight.shadowCameraFar = 3000;
        this.landLight.shadowBias = -.00001;
        this.landLight.shadowMapWidth = this.landLight.shadowMapHeight = 1024;
        this.landLight.shadowDarkness = .25;
        this.landLight.castShadow = true;
        this.landLight.shadowCameraVisible = false;
        this.scene.add(this.landLight);

        this.farLight = new THREE.SpotLight(0xffa500);
        this.farLight.intensity = .5;
        this.farLight.position.set(0, 300, 2000);
        this.farLight.castShadow = false;
        this.farLight.shadowBias = -.0001;
        this.scene.add(this.farLight);

        this.farLight2 = new THREE.SpotLight(0xff0000);
        this.farLight2.intensity = .5;
        this.farLight2.position.set(0, 300, 3000);
        this.farLight2.castShadow = false;
        this.farLight2.shadowBias = -.0001;
        this.scene.add(this.farLight2);

        this.farLight3 = new THREE.SpotLight(0xfffff0);
        this.farLight3.intensity = .5;
        this.farLight3.position.set(0, 300, 4000);
        this.farLight3.castShadow = false;
        this.farLight3.shadowBias = -.0001;
        this.scene.add(this.farLight3);

        this.farLight4 = new THREE.SpotLight(0xfff0f0);
        this.farLight4.intensity = .5;
        this.farLight4.position.set(0, 300, 5000);
        this.farLight4.castShadow = false;
        this.farLight4.shadowBias = -.0001;
        this.scene.add(this.farLight4);

        this.farLight5 = new THREE.SpotLight(0x00ff00);
        this.farLight5.intensity = .5;
        this.farLight5.position.set(0, 300, 6000);
        this.farLight5.castShadow = false;
        this.farLight5.shadowBias = -.0001;
        this.scene.add(this.farLight5);

        // Controls
        this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );
        this.initPostProcessing();
    };

    Webgl.prototype.Sound = function ( sources, radius, volume ) {
        var audio = document.createElement( 'audio' );

        for ( var i = 0; i < sources.length; i ++ ) {

            var source = document.createElement( 'source' );
            source.src = sources[ i ];

            audio.appendChild( source );
            audio.volume = volume;

        }

        this.position = new THREE.Vector3();

        this.play = function () {

            audio.play();

        }

        this.pause = function() {

            audio.pause();

        }

        this.update = function ( camera ) {

            var distance = this.position.distanceTo( camera.position );

            if ( distance <= radius ) {

                audio.volume = volume * ( 1 - distance / radius );

            } else {

                audio.volume = 0;

            }

        }
    };

    Webgl.prototype.initPostProcessing = function() {
        this.effects = [];

        this.composer = new THREE.EffectComposer(this.renderer);
        this.renderModel = new THREE.RenderPass(this.scene,this.camera);
        this.renderModel.renderToScreen = false;
        this.composer.addPass(this.renderModel);

        this.glitchEffect = new THREE.GlitchPass();
        this.glitchEffect.renderToScreen = false;
        this.effects.push(this.glitchEffect);

        this.bloomEffect = new THREE.BloomPass(1.3);
        this.bloomEffect.renderToScreen = false;
        this.effects.push(this.bloomEffect);

        this.copyPass = new THREE.ShaderPass(THREE.CopyShader);
        this.effects.push(this.copyPass)

        for(var i=0,j=this.effects.length; i<j; i++){
            this.composer.addPass(this.effects[i]);
        }
    };

    Webgl.prototype.stopEffects = function () {
        for(var i = 0, j = this.effects.length; i<j; i++){
            this.effects[i].renderToScreen = false;
            console.log('stopped', i);
        }
        this.stopExecuted = true;
    };

    Webgl.prototype.startEffect = function (name) {
        switch(name) {
            case 'glitch':
                this.effects[0].enabled = true;
                this.effects[0].renderToScreen = true;
            break;
            case 'bloom':
                this.effects[0].enabled = false;
                this.effects[2].renderToScreen = true;
            break;
            case 'glitchbloom':
                this.effects[0].enabled = true;
                this.effects[2].renderToScreen = true;
            break;
        }
    };

    Webgl.prototype.setupSounds = function() {
        this.sound1 = new this.Sound( ['assets/sounds/eva.mp3'], 200, 0.5 );
    };

    Webgl.prototype.buildPhysicsScene = function () {
        Physijs.scripts.worker = 'assets/lib/physijs/physijs_worker.js';
        Physijs.scripts.ammo = '../ammo.js/builds/ammo.js'; // must be relative to physijs_worker.js

        this.scene = new Physijs.Scene({reportsize: 50, fixedTimeStep: 1 / 60});
        this.scene.setGravity(new THREE.Vector3( 0, -500, 0 ));
    };


    Webgl.prototype.moveBall = function(value) {
            this.destination += ((value*70) - this.destination) * 0.1;
            ball.setLinearVelocity( new THREE.Vector3(0,0,this.destination) );
    };

    Webgl.prototype.followBall = function (value, audioObject) {
        this.camera.position.z += ((value - 400) - this.camera.position.z) * 0.2;
    }

    Webgl.prototype.buildGround = function () {
        var groundGeometry = new THREE.PlaneBufferGeometry(10000, 10000, 10, 10);
        groundGeometry.computeFaceNormals();
        groundGeometry.computeVertexNormals();
        var groundMaterial = Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: 0x999999,
                wireframe: false,
                shininess: 25,
                color: 0xffffff,
                emissive: 0x111111
            }),
            .8, // high friction
            .8 // high restitution
        );

        var ground = new Physijs.BoxMesh(groundGeometry, groundMaterial);

        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        ground.castShadow = true;

        this.scene.add( ground );
    };

    Webgl.prototype.buildPhysicsWall = function(width, height, depth, x, y, z) {
        var physicsMesh, wallGeometry;
        wallGeometry = new THREE.CubeGeometry(width, height, depth);
        wallGeometry.computeFaceNormals();
        wallGeometry.computeVertexNormals();
        physicsMesh = new Physijs.BoxMesh(wallGeometry, physicsMaterial, 0);
        physicsMesh.castShadow = true;
        physicsMesh.receiveShadow = true;
        physicsMesh.position.set(x, y, z);
        return physicsMesh;
    };

    Webgl.prototype.buildPhysicsMaterial = function() {
        physicsMaterial = Physijs.createMaterial(
            new THREE.MeshLambertMaterial({
                color: 0xdddddd,
                emissive: 0x007844,
                ambient: 0x000000,
                shininess: 100,
                specular: 0xcccccc,
                shading: THREE.SmoothShading
            }),
            .8, // high friction
            .8 // high restitution
        );
    };

    Webgl.prototype.buildPhysicsWall = function(width, height, depth, x, y, z) {
        var physicsMesh,
            wallGeometry;

        wallGeometry = new THREE.BoxGeometry(width, height, depth);
        wallGeometry.computeFaceNormals();
        wallGeometry.computeVertexNormals();
        physicsMesh = new Physijs.BoxMesh(wallGeometry, physicsMaterial, 0);
        physicsMesh.castShadow = true;
        physicsMesh.receiveShadow = true;
        physicsMesh.position.set(x, y, z);

        return physicsMesh;
    };

    Webgl.prototype.buildBall = function() {
        var ballCanvas = document.createElement('canvas');
        ballCanvas.width = 64;
        ballCanvas.height = 64;
        var ballContext = ballCanvas.getContext('2d');

        ballContext.fillStyle = "#ffa500";
        ballContext.fillRect(0, 0, ballCanvas.width, ballCanvas.height/2);
        ballContext.fillStyle = "#005aff";
        ballContext.fillRect(0, ballCanvas.height/2, ballCanvas.width, ballCanvas.height/2);

        var ballTexture = new THREE.Texture( ballCanvas );
        ballTexture.needsUpdate = true;

        var ballMaterial = Physijs.createMaterial(
        new THREE.MeshLambertMaterial({
            map: ballTexture,
            shininess: 10,
            color: 0xdddddd,
            emissive: 0xffffff,
            side: THREE.FrontSide,
            depthTest: false
        }),
        .6, // mid friction
        .5 // mid restitution
        );
        ballMaterial.map.wrapS = ballMaterial.map.wrapT = THREE.RepeatWrapping;
        ballMaterial.map.repeat.set( 1, 1 );

        ball = new Physijs.SphereMesh(
            new THREE.SphereGeometry( 30, 32, 32 ),
            ballMaterial,
            100
        );

        ball.position.y = 500;
        ball.receiveShadow = true;
        ball.castShadow = true;
        this.scene.add( ball );
    };

    Webgl.prototype.resize = function(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    Webgl.prototype.blowMovesScene = function (audioObject) {
        if(audioObject.maxValue !== NaN){
            (audioObject.maxValue > 0.8) ? this.moveBall(audioObject.maxValue / 0.2) : this.moveBall(0);
        }
    };

    Webgl.prototype.render = function(audioObject) {
        this.renderer.render(this.scene, this.camera);
        if(!isStarted){
            return;
        }

        this.sound1.play();
        this.scene.simulate();

        if(ball.position.y == 30 && !soundAllowed) {
            soundAllowed = true;
            animateIndicator('in');
            getSoundFromMic();
            animateAllowMic();
            this.camera.position.z = ball.position.z - 400;
        }

        if(ball.position.z == 0 && soundListening) {
            animateOutAllowMic();
            animateIndicator('out');
        }

        if(soundAllowed && !isAllStopped) {
            this.blowMovesScene(audioObject);
            this.followBall(ball.position.z, audioObject);
        }

        if(ball.position.z > 4000 && !isAllStopped) {
            isAllStopped = true;
            animateEnd();
        }

        if(ball.position.z > 4000 && isAllStopped) {
            this.moveBall(0);
        }

        if(ball.position.z > 30) {
            this.renderer.clear();
            this.composer.render();
        }

        if(ball.position.z > 30 && ball.position.z < 1500) {
            if(this.stopExecuted) {
                return;
            }

            this.stopEffects();
            this.startEffect('glitch');
        }

        if(ball.position.z > 1500 && ball.position.z < 1550) {
            this.stopExecuted = false;
        }

        if(ball.position.z > 1550 && ball.position.z < 3000) {
            if(this.stopExecuted) {
                return;
            }

            this.stopEffects();
            this.startEffect('bloom');
        }

        if(ball.position.z > 3000 && ball.position.z < 3100) {
            this.stopExecuted = false;
        }

        if(ball.position.z > 3100 && ball.position.z < 4000) {
            if(this.stopExecuted) {
                return;
            }

            this.stopEffects();
            this.startEffect('glitchbloom');
        }
    };

    return Webgl;

})();
