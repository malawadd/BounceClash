// Event: Update

//@input SceneObject sphere
//@input float fallSpeed = 300.0      // how fast it falls
//@input float fallThreshold = 0.1    // how far below ground before it starts falling

var sphereTransform = script.sphere.getTransform();

// Treat the starting Y as "ground" height
var groundY = sphereTransform.getWorldPosition().y;

// Remember last frame's position to compute movement
var prevPos = sphereTransform.getWorldPosition();

// State
var isFalling = false;

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(function() {
    var dt = getDeltaTime();
    var pos = sphereTransform.getWorldPosition();

    // ---- 1) Decide if we start falling ----
    if (!isFalling && pos.y < groundY - script.fallThreshold) {
        isFalling = true;
    }

    // ---- 2) Falling mode: straight down, no rolling ----
    if (isFalling) {
        pos.y -= script.fallSpeed * dt;
        sphereTransform.setWorldPosition(pos);
        prevPos = sphereTransform.getWorldPosition();
        return;
    }

    // ---- 3) Rolling while on the ground ----

    // Movement since last frame
    var delta = pos.sub(prevPos);

    // Only care about movement along the ground plane (X/Z)
    var deltaFlat = new vec3(delta.x, 0, delta.z);
    var distance = deltaFlat.length;

    if (distance > 0.0001) {
        var moveDir = deltaFlat.normalize();
        var up = vec3.up();
        var rollAxis = up.cross(moveDir).normalize(); // if rolling backwards, swap to up.cross(moveDir)

        // Approx radius from world scale (assuming uniform sphere)
        var radius = sphereTransform.getWorldScale().x * 0.5;
        var angle = distance / radius; // radians

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

