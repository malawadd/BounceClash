// AttractionForce_OnCollisionStay_Debug.js
// Same attraction/repulsion as original script, but only while colliding,
// and packaged as a callable function.

// @input float gravityConstant = 200 {"hint": "If negative, objects repel each other."}
// @input bool distanceIndependent = true
//        {"hint": "If true, F = G * m1 * m2 (no distance). If false, F = G * m1 * m2 / r^2."}

var mainObject = script.getSceneObject();
var mainBody = mainObject.getComponent("Physics.BodyComponent"); // may be dynamic or static
var G = script.gravityConstant;

// ---------- Core function (callable + debug) ----------

/**
 * Apply attraction/repulsion between main and other body.
 * - If mainBody is null, we treat mainObject as static and only move otherBody.
 * - If mainBody exists but dynamic = false, only otherBody will actually move.
 */
function applyAttractionBetween(mainBody, otherBody) {
    if (!otherBody) {
        print("[AttractionForce] otherBody is null");
        return;
    }

    var mainPos = mainObject.getTransform().getWorldPosition();
    var otherPos = otherBody.getTransform().getWorldPosition();

    var mainMass = 1.0;
    if (mainBody) {
        mainMass = mainBody.mass === 0 ? 1 : mainBody.mass;
    }
    var otherMass = otherBody.mass === 0 ? 1 : otherBody.mass;

    var dir = mainPos.sub(otherPos).normalize();
    var dist = otherPos.distance(mainPos);

    var forceMag;
    if (script.distanceIndependent) {
        // F = G * m1 * m2
        forceMag = G * mainMass * otherMass;
    } else {
        // F = G * m1 * m2 / r^2
        var r2 = Math.max(dist * dist, 0.0001);
        forceMag = G * mainMass * otherMass / r2;
    }

    var force = dir.uniformScale(forceMag);


    // Always push/pull the other body (must be dynamic to move)
    otherBody.addForce(force, Physics.ForceMode.Force);

    // Only move main if it has a body AND is dynamic
    if (mainBody && mainBody.dynamic) {
        mainBody.addForce(force.uniformScale(-1), Physics.ForceMode.Force);
    }
}

// Expose for other scripts:
// e.g. someScript.api.applyAttractionBetween(bodyA, bodyB)
script.api.applyAttractionBetween = applyAttractionBetween;

// ---------- Collision: every step while colliding ----------

function onCollisionStay(eventArgs) {
    var collision = eventArgs.collision;
    if (!collision || !collision.collider) {
        print("[AttractionForce] onCollisionStay: no collision or collider");
        return;
    }

    var otherObj = collision.collider.getSceneObject();
    var otherBody = otherObj.getComponent("Physics.BodyComponent");

    if (!otherBody) {
        print("[AttractionForce] Colliding with " + otherObj.name +
              " but it has no Physics.BodyComponent");
        return;
    }

    // This is called every physics step while objects are touching
    applyAttractionBetween(mainBody, otherBody);
}

// ---------- Init ----------

function init() {
    print("[AttractionForce] init on " + mainObject.name);

    if (mainBody) {
    } else {
        print("[AttractionForce] WARNING: main object has no Physics.BodyComponent; " +
              "will treat it as static and only move other bodies.");
    }

    var collider = mainBody ||
                   mainObject.getComponent("Physics.ColliderComponent");

    if (!collider || !collider.onCollisionStay) {
        return;
    }

    collider.onCollisionStay.add(onCollisionStay);
}

init();