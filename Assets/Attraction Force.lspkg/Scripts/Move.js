// by DEPARTD
// departd.de

// Move.js
// Version: 1.0.0
// Event: On Awake
// Description: Moves the object in a circle with easing.

const onUpdate = script.createEvent("UpdateEvent");

let totalTime = 0;
const duration = 3;

onUpdate.bind(function(eventData) {
    totalTime += eventData.getDeltaTime();

    const normalizedTime = (totalTime % duration) / duration;

    const easedTime = 0.5 - Math.cos(normalizedTime * Math.PI * 2) / 2;

    const r = 10.0;
    const x = r * Math.sin(easedTime * 2 * Math.PI);
    const y = r * Math.cos(easedTime * 2 * Math.PI);
    const z = r / 2 * Math.cos(easedTime * 2 * Math.PI);

    script.sceneObject.getTransform().setLocalPosition(new vec3(x, y, z));
});