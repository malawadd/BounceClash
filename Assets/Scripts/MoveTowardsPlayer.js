// Event: Update

//@input SceneObject sphere
//@input SceneObject player
//@input float speed = 50.0
//@input float fallSpeed = 300.0
//@input float fallThreshold = 0.1



function startGame() {
    // your existing start logic
    print("test");

}

script.startGame = startGame;  // expose it

// --- Input sanity check ---
if (!script.sphere) {
    print("GameController: sphere input is NOT set");
    return;
}
if (!script.player) {
    print("GameController: player input is NOT set");
    return;
}

var rootObj = script.getSceneObject();
var rootTransform = rootObj.getTransform();
var sphereTransform = script.sphere.getTransform();
var playerTransform = script.player.getTransform();

var groundY = rootTransform.getWorldPosition().y;
var isFalling = false;

print("GameController: initialized on " + rootObj.name);

var updateEvent = script.createEvent("UpdateEvent");
updateEvent.bind(function () {
    var dt = getDeltaTime();
    var rootPos = rootTransform.getWorldPosition();

    // Debug: show we are actually updating
    // Comment this out later if too spammy
    // print("Update, rootPos: " + rootPos.toString());

    if (!isFalling && rootPos.y < groundY - script.fallThreshold) {
        isFalling = true;
        print("GameController: switched to falling");
    }

    if (isFalling) {
        rootPos.y -= script.fallSpeed * dt;
        rootTransform.setWorldPosition(rootPos);
        return;
    }

    var playerPos = playerTransform.getWorldPosition();
    var step = script.speed * dt;

    var flatTarget = new vec3(playerPos.x, groundY, playerPos.z);
    var newPos = rootPos.moveTowards(flatTarget, step);
    newPos.y = groundY;

    var delta = newPos.sub(rootPos);
    var distance = delta.length;

    if (distance > 0.0001) {
        var moveDir = delta.normalize();
        var up = vec3.up();
        var rollAxis = up.cross(moveDir).normalize();

        var radius = sphereTransform.getWorldScale().x * 0.5;
        var angle = distance / radius;

        var currentRot = sphereTransform.getWorldRotation();
        var deltaRot = quat.angleAxis(angle, rollAxis);
        sphereTransform.setWorldRotation(deltaRot.multiply(currentRot));
    }

    rootTransform.setWorldPosition(newPos);
});