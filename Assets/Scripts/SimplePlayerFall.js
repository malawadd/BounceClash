// SimplePlayerFall.js
// Detects when the player leaves a specific platform object and
// unlocks the Character Controller's Y-axis so it can fall.
// Attach to Bitmoji Player (same object that has the Character Controller).

//@input Component.ScriptComponent characterController
//@input SceneObject playerBall {"label":"Player Ball"}
//@input SceneObject platform {"label":"Platform Object", "hint":"Drag the ground/platform SceneObject here. Bounds will be taken from its RenderMeshVisual AABB."}

//@input bool enableFalling = true {"label":"Enable Falling"}
//@input bool debugLogs = false {"label":"Verbose Debug Logs"}

var cc = script.characterController;
var playerSO = script.getSceneObject();

if (!cc) {
    print("[SimplePlayerFall] ERROR: characterController input not set.");
}

var supportsSetLockY = cc && typeof cc.setLockYAxis === "function";
var supportsGetLockY = cc && typeof cc.getLockYAxis === "function";

if (cc) {
    print("[SimplePlayerFall] characterController component found. supportsSetLockY=" + supportsSetLockY + ", supportsGetLockY=" + supportsGetLockY);
}

// Find a RenderMeshVisual on the platform (directly or on first child)
var platformVisual = null;
if (script.platform) {
    platformVisual = script.platform.getComponent("Component.RenderMeshVisual");
    if (!platformVisual && script.platform.getChildrenCount() > 0) {
        platformVisual = script.platform.getChild(0).getComponent("Component.RenderMeshVisual");
    }
}

if (!platformVisual && script.platform) {
    print("[SimplePlayerFall] WARNING: No RenderMeshVisual found on platform '" + script.platform.name + "'. Edge detection may not work.");
} else if (platformVisual) {
    if (script.debugLogs) {
        print("[SimplePlayerFall] Using RenderMeshVisual on platform '" + script.platform.name + "' for bounds.");
    }
}

var onPlatformPrev = true;
var yUnlocked = false;
var boundsMargin = 5.0; // small margin so we don't trigger on tiny numerical drift

function isPlayerAbovePlatformBounds() {
    if (!platformVisual || !playerSO) {
        return true; // if we can't measure, assume still "on"
    }

    var min = platformVisual.worldAabbMin();
    var max = platformVisual.worldAabbMax();
    var p   = playerSO.getTransform().getWorldPosition();

    // Check X/Z inside the platform's world-space AABB (with small margin)
    var insideX = (p.x >= min.x - boundsMargin) && (p.x <= max.x + boundsMargin);
    var insideZ = (p.z >= min.z - boundsMargin) && (p.z <= max.z + boundsMargin);

    return insideX && insideZ;
}

script.createEvent("UpdateEvent").bind(function(eventData) {
    if (!script.enableFalling || !cc || !supportsSetLockY) {
        return;
    }

    var dt = eventData.getDeltaTime();

    var onPlatformNow = isPlayerAbovePlatformBounds();

    if (script.debugLogs && platformVisual) {
        var min = platformVisual.worldAabbMin();
        var max = platformVisual.worldAabbMax();
        var p   = playerSO.getTransform().getWorldPosition();
        print("[SimplePlayerFall] Bounds check: onPlatform=" + onPlatformNow +
              ", playerPos=(" + p.x.toFixed(2) + "," + p.y.toFixed(2) + "," + p.z.toFixed(2) + ")" +
              ", minX=" + min.x.toFixed(2) + ", maxX=" + max.x.toFixed(2) +
              ", minZ=" + min.z.toFixed(2) + ", maxZ=" + max.z.toFixed(2));
    }

    // Edge detection: previously on platform, now outside its X/Z bounds
    if (!yUnlocked && onPlatformPrev && !onPlatformNow) {
        if (script.debugLogs) {
            print("[SimplePlayerFall] Platform edge detected by AABB -> calling setLockYAxis(false)...");
        }

        cc.setLockYAxis(false);
        yUnlocked = true;

        if (supportsGetLockY) {
            var lockState = cc.getLockYAxis();
            print("[SimplePlayerFall] setLockYAxis(false) called. getLockYAxis() now=" + lockState);
        } else {
            print("[SimplePlayerFall] setLockYAxis(false) called. getLockYAxis() getter not available.");
        }
    }

    onPlatformPrev = onPlatformNow;
});
