// PlayerFollowBall.js
// Makes the Bitmoji player follow their ball's position (like NPCs do)
// This allows the ball's physics to handle falling naturally

//@input SceneObject playerBall {"label":"Player Ball (with Physics Body)"}
//@input bool enableFalling = true {"label":"Enable Falling", "hint":"Toggle to disable falling behavior"}
//@input float yOffset = 0.0 {"label":"Y Offset", "hint":"Height above ball"}

var playerTransform = script.getSceneObject().getTransform();
var ballTransform = script.playerBall ? script.playerBall.getTransform() : null;

// Store initial offset in world space
var initialOffset = null;

script.createEvent("OnStartEvent").bind(function () {
    if (ballTransform && playerTransform) {
        initialOffset = playerTransform.getWorldPosition().sub(ballTransform.getWorldPosition());
        print("[PlayerFollowBall] Initial offset calculated: " + initialOffset.toString());
    }
});

script.createEvent("UpdateEvent").bind(function () {
    if (!script.enableFalling) {
        return; // Falling disabled - don't follow ball
    }

    if (!ballTransform || !initialOffset) {
        return;
    }

    // Follow ball's position with the same offset (like NPCs)
    var ballPos = ballTransform.getWorldPosition();
    var newPos = ballPos.add(initialOffset);

    // Apply custom Y offset if needed
    newPos.y += script.yOffset;

    playerTransform.setWorldPosition(newPos);
});

print("[PlayerFollowBall] Script initialized. Enable Falling: " + script.enableFalling);
