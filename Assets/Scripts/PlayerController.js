// MovementAndFallController.js

// @input SceneObject sphere
// @input Component.ScriptComponent joystick
// @input float moveSpeed = 200.0

// Gravity (negative value, cm/s^2)
// @input float gravity = -300.0

// Enable player falling (mimics NPC behavior)
// @input bool enableFalling = true
// @input float fallThreshold = 0.1 {"showIf":"enableFalling","showIfValue":true}
// @input float fallSpeed = 300.0 {"showIf":"enableFalling","showIfValue":true}

var sphereObj = script.sphere || script.getSceneObject();
var sphereTransform = sphereObj.getTransform();

// Ground height: use the sphere's starting center Y so it doesn't sink
var groundY = sphereTransform.getWorldPosition().y;

// vertical state
var isFalling = false;
var verticalVel = 0.0;

script.createEvent("UpdateEvent").bind(onUpdate);

function onUpdate() {
    var dt = getDeltaTime();
    if (dt <= 0) {
        return;
    }

    if (!script.joystick || !script.joystick.api || !script.joystick.api.direction) {
        return;
    }

    var pos = sphereTransform.getWorldPosition();

    // ---------- 1) Horizontal movement from joystick ----------
    var dir2 = script.joystick.api.direction; // vec2 in [-1,1]

    if (Math.abs(dir2.x) > 0.01 || Math.abs(dir2.y) > 0.01) {
        var moveDir = new vec3(dir2.x, 0, -dir2.y); // x, -y -> X,Z
        moveDir = moveDir.normalize();
        pos = pos.add(moveDir.uniformScale(script.moveSpeed * dt));
    }

    // ---------- 2) Decide if we should start falling (like NPCs) ----------

    // Simple check: if Y drops below ground threshold, start falling
    // This mimics exactly how NPCs fall in MoveTowardsPlayer.js
    if (script.enableFalling && !isFalling && pos.y < groundY - script.fallThreshold) {
        isFalling = true;
        print("[PlayerController] Player started falling at Y=" + pos.y.toFixed(1));
    }

    // ---------- 3) Vertical motion (grounded vs falling) ----------

    if (isFalling) {
        // Fall fast (like NPCs)
        pos.y -= script.fallSpeed * dt;
    } else {
        // grounded: keep center at initial height
        pos.y = groundY;
        verticalVel = 0.0;
    }

    sphereTransform.setWorldPosition(pos);
}