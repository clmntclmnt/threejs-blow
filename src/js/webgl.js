var Webgl = (function(){

    function Webgl(width, height){
        this.t = 0;
        this.valueToDesc = 0.8;
        this.lightDirection = true;


        this.buildPhysicsScene();
        this.buildGround();
        this.buildPhysicsMaterial();
        this.buildBall();

        this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
        this.camera.position.z = -400;
        this.camera.position.y = 200;

        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0xeeeeee);
        this.renderer.shadowMapEnabled = true;
        this.renderer.shadowMapSoft = true;
        this.renderer.shadowMapType = THREE.PCFShadowMap;
        this.renderer.shadowMapAutoUpdate = true;

        $('.three').append(this.renderer.domElement);

        // Lights
        this.scene.add( new THREE.AmbientLight( 0x666666) );
        var light = new THREE.SpotLight(0x000fff);
        light.intensity = .5;
        light.position.set(0, 1000, 0);
        light.target.position.copy(this.scene.position);
        light.shadowCameraTop = -700;
        light.shadowCameraLeft = -700;
        light.shadowCameraRight = 700;
        light.shadowCameraBottom = 700;
        light.shadowCameraNear = 20;
        light.shadowCameraFar = 1400;
        light.shadowBias = -.0001;
        light.shadowMapWidth = light.shadowMapHeight = 1024;
        light.shadowDarkness = .25;
        light.castShadow = true;
        light.shadowCameraVisible = false;
        this.scene.add(light);

        // GUI
        gui.add(this.camera.position, 'x');
        gui.add(this.camera.position, 'y');
        gui.add(this.camera.position, 'z');


        // Controls
        this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );
        // this.controls.addEventListener('change', this.render );
        // this.controls.target.set( 0, 0, 0 )
    };

    Webgl.prototype.tossBall = function() {
        var xSpeed = Math.random() * 600 - 300;
        var zSpeed = Math.random() * 600 - 300;
        ball.setLinearVelocity( new THREE.Vector3(xSpeed,300,zSpeed) );
    };

    Webgl.prototype.buildPhysicsScene = function () {
        Physijs.scripts.worker = 'assets/lib/physijs/physijs_worker.js';
        Physijs.scripts.ammo = '../ammo.js/builds/ammo.js'; // must be relative to physijs_worker.js

        this.scene = new Physijs.Scene({reportsize: 50, fixedTimeStep: 1 / 60});
        this.scene.setGravity(new THREE.Vector3( 0, -500, 0 ));
    };

    Webgl.prototype.moveBall = function(value) {
        ball.setLinearVelocity( new THREE.Vector3(0,0,value*500) );
    };

    Webgl.prototype.followBall = function (value) {
        // console.log(value, this.camera.position.z);
        this.camera.position.z = value - 400;

        // Try tween camera
        // console.log(TweenMax);
        // TweenMax.to(this.camera.position, {z: (value-400)}, 200);
        // console.log(light);
    }

    Webgl.prototype.buildGround = function () {
        var groundGeometry = new THREE.PlaneBufferGeometry(1000, 20000, 10, 10);
        groundGeometry.computeFaceNormals();
        groundGeometry.computeVertexNormals();
        var groundMaterial = Physijs.createMaterial(
            new THREE.MeshPhongMaterial({
                color: 0x999999,
                wireframe: false,
                shininess: 25,
                color: 0xdddddd,
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

    // create a material to share between segments of the physics walls -------------------------------
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

    // create a physics wall of a certain size, at a certain location ---------------------------------
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


    // build the ball and draw its texture with a 2d canvas -------------------------------------------
    Webgl.prototype.buildBall = function() {
        // create a canvas to draw the ball's texture
        var ballCanvas = document.createElement('canvas');
        ballCanvas.width = 64;
        ballCanvas.height = 64;
        var ballContext = ballCanvas.getContext('2d');

        // draw 2 colored halves of the 2d canvas
        ballContext.fillStyle = "#f8ae44";
        ballContext.fillRect(0, 0, ballCanvas.width, ballCanvas.height/2);
        ballContext.fillStyle = "#ffda4e";
        ballContext.fillRect(0, ballCanvas.height/2, ballCanvas.width, ballCanvas.height/2);

        // create the THREE texture object with our canvas
        var ballTexture = new THREE.Texture( ballCanvas );
        ballTexture.needsUpdate = true;

        // create the physijs-enabled material with some decent friction & bounce properties
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

        // create the physics-enabled sphere mesh, and start it up in the air
        ball = new Physijs.SphereMesh(
            new THREE.SphereGeometry( 30, 32, 32 ),
            ballMaterial,
            100
        );

        ball.position.y = 500;
        ball.receiveShadow = true;
        ball.castShadow = true;
        // ball.physics().addEventListener( 'collision', this.handleCollision );
        this.scene.add( ball );
    };

    Webgl.prototype.resize = function(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    Webgl.prototype.blowMovesScene = function (audioObject) {
        if(audioObject.maxValue !== NaN){
            (audioObject.maxValue > 0.8) ? this.moveBall(audioObject.maxValue) : this.moveBall(0);
        }
    };

    Webgl.prototype.render = function(audioObject) {
        this.renderer.render(this.scene, this.camera);
        this.scene.simulate();

        // this.controls.update();
        // console.log(this.camera.position.z);

        if(ball.position.y == 30 && !soundAllowed) {
            soundAllowed = true;
            getSoundFromMic();
            this.camera.position.z = ball.position.z - 400;
            // return;
        }

        if(soundAllowed) {
            this.blowMovesScene(audioObject);
            this.followBall(ball.position.z);
        }

        if(ball.position.y >= 31) {
            // return;
        }
    };

    return Webgl;

})();
