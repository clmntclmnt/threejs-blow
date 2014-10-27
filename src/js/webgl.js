var Webgl = (function(){

    function Webgl(width, height){
        this.t = 0;

        // Basic three.js setup

        this.scene = new THREE.Scene();

        this.camera = new THREE.PerspectiveCamera(50, width / height, 1, 10000);
        this.camera.position.z = 50;

        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(width, height);
        this.renderer.setClearColor(0xFFA500);

        $('.three').append(this.renderer.domElement);

        // Directly add objects
        this.someObject = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), new THREE.MeshLambertMaterial({map: THREE.ImageUtils.loadTexture('assets/materials/cubeTexture.jpg')}));
        this.someObject.position.set(0, 0, 0);
        this.someObject.overdraw = true;
        this.scene.add(this.someObject);

        // Or create container classes for them to simplify your code
        // this.someOtherObject = new Sphere();
        // this.someOtherObject.position.set(0, 0, 0);
        // this.scene.add(this.someOtherObject);

        // Lights
        // this.ambientLight = new THREE.AmbientLight(0xbbbbbb);
        // this.scene.add(this.ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff);
        this.directionalLight.position.set(0, -100, 1000).normalize();
        // this.directionalLight.rotation.x = 50;

        this.scene.add(this.directionalLight);

        console.log(this.directionalLight.intensity);

        this.helperDirectionalLightHelper = new THREE.DirectionalLightHelper(this.directionalLight, 10);

        this.scene.add(this.helperDirectionalLightHelper);

        // Controls
        this.controls = new THREE.TrackballControls( this.camera, this.renderer.domElement );
        // this.controls.addEventListener('change', this.render );
        // this.controls.target.set( 0, 0, 0 )
    }

    Webgl.prototype.resize = function(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    };

    Webgl.prototype.render = function(audioObject) {
        this.renderer.render(this.scene, this.camera);

        this.someObject.rotation.y += ((audioObject.maxValue/10) > 0.05) ? (audioObject.maxValue/10) : 0.0;
        // this.directionalLight.intensity = lightIntensity;

        this.controls.update();
    };

    return Webgl;

})();
