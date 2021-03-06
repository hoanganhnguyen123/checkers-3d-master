var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x1a2a5a, 1);
document.body.appendChild(renderer.domElement);

var board = new Board();
board.build(scene);

var vFOV = camera.fov * Math.PI / 180; // convert vertical fov to radians
var height = 2 * Math.tan(vFOV / 2) * 10; // visible height
var aspect = window.innerWidth / window.innerHeight;
var width = height * aspect;

var ambientLight = new THREE.AmbientLight(0x0c0c0c);
scene.add(ambientLight);

var spotLight = new THREE.SpotLight(0xffffff);
spotLight.position.set(0, 0, 10);
spotLight.castShadow = true;

scene.add(spotLight);

var raycaster = new THREE.Raycaster();
var mouse = { x: 0, y: 0 };

var black = document.createElement('div');
black.setAttribute('id', 'black');
black.style.position = 'absolute';
//text2.style.zIndex = 1;    // if you still don't see the label, try uncommenting this
black.style.color = '#D1D1D1';
black.style.width = 100;
black.style.height = 100;
black.style.fontSize = '24px';
black.innerHTML = "<table>" +
    "<tr style='font-weight:bold;'><td>WHITE</td><td>( 12 Left )</td></tr>" +
    "<tr style='color: black'><td>RED</td><td>( 12 Left )</td></tr>" +
    "</table>";

black.style.border = "thick solid #aa7243";
black.style.backgroundColor = "#7a5230";
black.style.top = 1.5 + '%';
black.style.left = 1 + '%';
black.style.padding = "1%";


document.body.appendChild(black);
// document.body.appendChild(red);

var grabbed = false;

controls = new THREE.OrbitControls(camera);
controls.addEventListener('change', render);


$(document).ready(function() {
    $(document.body).mousedown(function(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        //2. set the picking ray from the camera position and mouse coordinates
        raycaster.setFromCamera(mouse, camera);

        //3. compute intersections
        var intersects = raycaster.intersectObjects(scene.children);

        for (var i = 0; i < intersects.length; i++) {
            if (intersects[i].object['checkersObject'] == 'Piece') {
                console.log(intersects[i]);
                // console.log(intersects[i]);
                var success = board.grab(intersects[i].object["col"], intersects[i].object["row"]);
                if (success) {
                    board.showLegals(intersects[i].object["col"], intersects[i].object["row"], scene);
                    grabbed = true;
                }
            } else if (intersects[i].object['checkersObject'] == 'Tile') {
                controls.enabled = false;
            }

        }

        board.moveHolding(scene, camera, mouse.x, mouse.y);
    });

    $(document.body).mousemove(function(event) {

        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        board.moveHolding(scene, camera, mouse.x, mouse.y);
    });

    $(document.body).mouseup(function(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        //2. set the picking ray from the camera position and mouse coordinates
        raycaster.setFromCamera(mouse, camera);

        //3. compute intersections
        var intersects = raycaster.intersectObjects(scene.children);

        for (var i = 0; i < intersects.length; i++) {

            if (intersects[i].object['checkersObject'] == 'Tile') {
                // console.log(intersects[i]);
                var success = board.drop(intersects[i].object["col"], intersects[i].object["row"], scene);
                if (success) {
                    grabbed = false;
                }

            } else {
                // board.drop(board.holding.mesh['col'], board.holding.mesh['row']);
            }

            board.unshowLegals(scene);
            /*
             An intersection has the following properties :
             - object : intersected object (THREE.Mesh)
             - distance : distance from camera to intersection (number)
             - face : intersected face (THREE.Face3)
             - faceIndex : intersected face index (number)
             - point : intersection point (THREE.Vector3)
             - uv : intersection point in the object's UV coordinates (THREE.Vector2)
             */
        }
        controls.enabled = true;

    });

    render();
});


$(window).resize(function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

var origin = camera.position;
var animate = true;
var clock = new THREE.Clock();

function rotateAnimation() {

    camera.position.y += clock.getElapsedTime() * 2.5;
    camera.position.z += clock.getElapsedTime() * 2.5;
}

function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
}