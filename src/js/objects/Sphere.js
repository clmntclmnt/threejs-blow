var Sphere = (function(){

    function Sphere(){
        THREE.Object3D.call(this);

        var geometry = new THREE.SphereGeometry(2, 64, 48);
        var material = new THREE.MeshLambertMaterial({color: 0x5f5f5f});
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.overdraw = true;
        this.add(this.mesh);
    }

    Sphere.prototype = new THREE.Object3D;
    Sphere.prototype.constructor = Sphere;

    Sphere.prototype.update = function() {
    };

    return Sphere;
})();
