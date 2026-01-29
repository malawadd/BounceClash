//@input Component.ColliderComponent sphere1Collider
//@input Component.ColliderComponent sphere2Collider
//@input Asset.Matter bouncyMatter
//@input float initialSpeed = 50.0

// Set up the colliders with high bounciness for a bounce effect
if (script.bouncyMatter) {
    script.bouncyMatter.dynamicBounciness = 2.0; // High bounciness for both spheres
    script.sphere1Collider.matter = script.bouncyMatter;
    script.sphere2Collider.matter = script.bouncyMatter;
}

// Give the spheres initial velocities towards each other
script.sphere1Collider.velocity = new vec3(script.initialSpeed, 0, 0); // Right
script.sphere2Collider.velocity = new vec3(-script.initialSpeed, 0, 0); // Left

// Handle collision event to reverse velocities (simulate bounce)
function onCollisionEnter(eventData) {
    // Get current velocities
    var v1 = script.sphere1Collider.velocity;
    var v2 = script.sphere2Collider.velocity;

    // Swap velocities for a simple elastic collision
    script.sphere1Collider.velocity = v2;
    script.sphere2Collider.velocity = v1;
}

// Bind the collision event for both spheres
script.sphere1Collider.onCollisionEnter.add(onCollisionEnter);
script.sphere2Collider.onCollisionEnter.add(onCollisionEnter);

// Optional: Enable debug draw to visualize colliders
script.sphere1Collider.debugDrawEnabled = true;
script.sphere2Collider.debugDrawEnabled = true;