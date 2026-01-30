
// DEPARTD | departd.de
// Daniel Petho
// 
// AttractionForce.js
// Version: 1.0.0
// Event: On Awake
// Description: 
//              Attraction / repulsion force between two objects or between one main object and many objects. Based on the formula of F = G * m1 * m2 / r^2
//
// Usage: 
//        1. Attach this script to the main object and add the objects you want to attract / repel to the objects array.
//        2. Make sure every object has a Physics Body Component.
//        3. For best results set the gravity to zero in the Physics World Settings.
//
//        To repel the objects, set the gravityConstant to a negative value.
//        For a static object, set the dynamic property of the Physics Body Component to false.
//        Set distanceIndependent to false if you want the force to be inversely proportional to the square of the distance between the objects (like in real life). In that case, make sure to adjust the gravitational constant. 
//        Play with physics materials, gravityConstant, and other physics settings to achieve the simulation you want.

// @ui { "widget": "label", "label": "Attraction / Repulsion Force" }
// @ui { "widget": "label", "label": "by DEPARTD | dåepartd.de" }
// @ui { "widget": "label", "label": "" }
// @ui { "widget": "label", "label": "Check script comments for usage." }
// @ui { "widget": "label", "label": "" }
// @ui { "widget": "separator" }

// @input float gravityConstant = 200 {"hint": "The gravitational constant. If negative, the objects will repel each other."}
// @input boolean distanceIndependent = true {"hint": "If true, the force will be independent of the distance between the objects. If false, the force will be inversely proportional to the square of the distance between the objects. Make sure to adjust the gravitational constant in that case."}
// @input SceneObject[] objects

const mainObject = script.getSceneObject();
const G = script.gravityConstant;
const objects = script.objects;

let mainBodyComponent;
let mainMass;

const onUpdate = script.createEvent("UpdateEvent");
onUpdate.bind(function(eventData) {
    const mainObjectPosition = mainObject.getTransform().getWorldPosition();

    // iterate through the objects
    objects.forEach((object) => {

        if (object == null) {
            return;
        }
        
        const objectPosition = object.getTransform().getWorldPosition();
        const objectBodyComponent = object.getComponent("Physics.BodyComponent");
        const objectMass = objectBodyComponent.mass;

        const forceDirection = mainObjectPosition.sub(objectPosition).normalize();

        let forceMagnitude;

        if (!script.distanceIndependent) {
            // F = G * m1 * m2 / r^2
            forceMagnitude = G * objectMass * mainMass / Math.pow(objectPosition.distance(mainObjectPosition), 2);        
        } else {
            // otherwise F = G * m1 * m2 (no distance dependency). Not realistic, but it looks much smoother :)
            forceMagnitude = G * objectMass * mainMass;
        }

        const forceVector = forceDirection.uniformScale(forceMagnitude);

        objectBodyComponent.addForce(forceVector, Physics.ForceMode.Force);

        // apply the opposite force to the main object
        // you can comment this out if you want the main object to be static, or you can set the dynamic property of the Physics Body Component to false
        mainBodyComponent.addForce(forceVector.uniformScale(-1), Physics.ForceMode.Force);
    });
});


// initialize the script
function init() {

    // check if the main object has a Physics Body Component
    if (mainObject.getComponent("Physics.BodyComponent") == null) {
        print("ERROR: This script requires a Physics Body Component attached to the main object.");
        return;
    }

    // get the Physics Body Component of the main object
    mainBodyComponent = mainObject.getComponent("Physics.BodyComponent");
    mainMass = mainBodyComponent.mass == 0 ? 1 : mainBodyComponent.mass;

    objects.forEach((object) => {
        if (object == null) {
            return;
        }
        // check if the objects have a Physics Body Component
        if (object.getComponent("Physics.BodyComponent") == null) {
            print("ERROR: " + object.name + " requires a Physics Body Component.");
            return;
        }
    });
}

init();
