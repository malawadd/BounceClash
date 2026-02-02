// PlayerFallController.js
// Handles unlocking Y-axis when player should fall
// Attach this to the Bitmoji Player object (same level as Character Controller)

//@input Component.ScriptComponent characterController {"label":"Character Controller"}
//@input SceneObject playerBall {"label":"Player Ball (Sphere)"}

// Falling settings (mimics NPC behavior)
//@input bool enableFalling = true {"label":"Enable Falling"}
//@input float groundY = 0.0 {"label":"Ground Y Position"}
//@input float fallThreshold = -5.0 {"label":"Fall Threshold Y", "hint":"Start falling when Y < this value"}

var hasFallen = false;

script.createEvent("UpdateEvent").bind(onUpdate);

function onUpdate() {
    if (!script.enableFalling || hasFallen) {
        return;
    }

    if (!script.characterController || !script.playerBall) {
        return;
    }

    // Check if player ball has dropped below ground threshold
    var ballY = script.playerBall.getTransform().getWorldPosition().y;

    if (ballY < script.fallThreshold) {
        // Trigger falling - unlock Y axis
        hasFallen = true;
        unlockYAxis();
        print("[PlayerFallController] Player falling! Unlocked Y-axis at ballY=" + ballY.toFixed(1));
    }
}

function unlockYAxis() {
    if (!script.characterController || !script.characterController.api) {
        print("[PlayerFallController] Character Controller API not found");
        return;
    }

    // Try to access the movement axis settings
    // The exact API might vary - check Lens Studio docs or inspector
    if (typeof script.characterController.api.setMovementAxisEnabled === "function") {
        script.characterController.api.setMovementAxisEnabled("y", true);
        print("[PlayerFallController] Y-axis unlocked via API");
    } else if (script.characterController.movementAxisY !== undefined) {
        script.characterController.movementAxisY = true;
        print("[PlayerFallController] Y-axis unlocked via property");
    } else {
        print("[PlayerFallController] WARNING: Could not find Y-axis lock property");
        print("[PlayerFallController] You may need to manually unlock Y in Character Controller when testing");
    }
}

// Expose API for GameController to check if player has fallen
script.hasFallen = function () {
    return hasFallen;
};

print("[PlayerFallController] Script initialized. Enable Falling: " + script.enableFalling);
