// Event: Update

//@input SceneObject sphere
//@input float fallSpeed = 300.0      // how fast it falls
//@input float fallThreshold = 0.1    // how far below ground before it starts falling

var sphereTransform = script.sphere.getTransform();

// Treat the starting Y as "ground" height
var groundY = sphereTransform.getWorldPosition().y;

// Remember last frame's position to compute movement
var prevPos = sphereTransform.getWorldPosition();

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(onUpdate);

function onUpdate() {
    var pos = sphereTransform.getWorldPosition();

    // 1. Movement since last frame
    var delta = pos.sub(prevPos);

    // Only care about movement along the ground plane (X/Z)
    var deltaFlat = new vec3(delta.x, 0, delta.z);
    var distance = deltaFlat.length;

    if (distance > 0.0001) {
        var moveDir = deltaFlat.normalize();
        var up = vec3.up();

        // Axis to roll around is perpendicular to up and movement direction
        var rollAxis = up.cross(moveDir).normalize();

        // 2. Radius (either from world scale or manual)
        var radius = script.useScaleForRadius
            ? sphereTransform.getWorldScale().x * 0.5   // assuming uniform scale
            : script.manualRadius;

        var angle = distance / radius; // radians

        // 3. Apply incremental rotation
        var currentRot = sphereTransform.getWorldRotation();
        var deltaRot = quat.angleAxis(angle, rollAxis);
        sphereTransform.setWorldRotation(deltaRot.multiply(currentRot));
    }

    // Keep sphere locked to ground height while not falling
    pos.y = groundY;
    sphereTransform.setWorldPosition(pos);

    // Store for next frame
    prevPos = sphereTransform.getWorldPosition();
});

