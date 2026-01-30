// Max van Leeuwen
// maxvanleeuwen.com/lensstudio-butterflies
// ig: @max.van.leeuwen
// tw: @maksvanleeuwen



// --- How to use the butterfly asset:
// 
// It works without any coding!
// If you want to change parameters for the butterflies on runtime, this is what you could use:
//
//
//
// - Spawn a number of butterflies (n is a whole number). This function is called on start if 'spawnOnStart' is more than 0.
// 	script.spawnButterflies(n)
//
//
//
// - Remove all currently instanced butterflies
// 	script.removeButterflies()
//
//
//
// - Get or set the butterfly moving speed
// 	script.movingSpeed
//
//
//
// - Get or set the 'hyperactive' character trait of the butterflies
// 	script.directionalSpeed
//
//
//
// - Get or set the random sizes of newly spawned butterflies (vec2 containing min, max)
// 	script.randomSize
//
//
//
// - Get or set the strength at which butterflies follow the transform
// 	script.followStrength
//
//
//
// - Get or set the radius around the followed transform to stay in (world space)
// 	script.followRadius
//
//
//
// - Get or set the transform for butterflies to follow (uses position only, default is this Butterfly Controller's Transform)
// 	script.followTransform
//
//
//
// - Get or set whether butterflies should always be above ground level (world y = 0)
// 	script.alwaysAboveGround
//
//
//
// - Get or set whether butterflies should land on the world mesh occasionally (world mesh generation/lidar needed) - when ebabled, script.deviceTrackingComponent is required for it to work!
// 	script.landOnWorldMesh
//
//
//
// - Get or set whether butterflies should avoid collisions with the world mesh (slower, especially when there are a lot of butterflies flying around)
// 	script.avoidCollision
//
//
//
// - Get or set the Device Tracking Component needed (necessary when landing on world mesh is enabled)
// 	script.deviceTrackingComponent
//
//
//
// - Get or set the world mesh classifications that butterflies can land on (indices, from lensstudio.snapchat.com/api/classes/TrackedMeshFaceClassification)
// 	script.landOnClassifications
//
//
//
// - Get the array of currently instanced butterfly Scene Objects
// 	script.butterflies
//
//
//
//
//
// ---
// @ui {"widget":"label", "label":"Use the position of this object to"}
// @ui {"widget":"label", "label":"control the butterflies' path."}
// @ui {"widget":"label", "label":""}

//@ui {"widget":"label", "label":"Spawning,  Moving"}
//@ui {"widget":"separator"}

//@input int spawnOnStart = 30 {"min":0, "max":100}
//@input float movingSpeed = 80 {"min":0}
//@input float directionalSpeed = 10 {"min":0}


//@ui {"widget":"label", "label":""}
//@ui {"widget":"label", "label":"Visuals"}
//@ui {"widget":"separator"}
//@input vec2 randomSize = {0.5, 1.0} {"min":0}


//@ui {"widget":"label", "label":""}
//@ui {"widget":"label", "label":"Area"}
//@ui {"widget":"separator"}

//@input float followStrength = 1 {"min":0}
//@input float followRadius = 50 {"min":0}
//@input bool alwaysAboveGround = true

//@ui {"widget":"label", "label":""}
//@ui {"widget":"label", "label":"Land on world mesh (world mesh, slower)"}
//@ui {"widget":"separator"}
//@input bool landOnWorldMesh = false
//@input bool avoidCollision = false {"label":"Avoid Collision (slow)", "showIf":"landOnWorldMesh"}
//@input Component.DeviceTracking deviceTracking {"showIf":"landOnWorldMesh"}
//@ui {"widget":"group_start", "label":"land on", "showIf":"landOnWorldMesh"}
//@input bool landOnWall {"label":"wall", "hint":"index: 1"}
//@input bool landOnFloor = false {"label":"floor", "hint":"index: 2"}
//@input bool landOnCeiling = false {"label":"ceiling", "hint":"index: 3"}
//@input bool landOnTable = true {"label":"table", "hint":"index: 4"}
//@input bool landOnSeat = true {"label":"seat", "hint":"index: 5"}
//@input bool landOnWindow = false {"label":"window", "hint":"index: 6"}
//@input bool landOnDoor = false {"label":"door", "hint":"index: 7"}
//@ui {"widget":"group_end", "showIf":"landOnWorldMesh"}


//@ui {"widget":"label", "label":""}
//@input bool advanced = false
//@ui {"widget":"separator"}

//@input SceneObject[] objectsToSpawn {"showIf" : "advanced"}



script.spawnButterflies = spawnButterflies;
script.removeButterflies = removeButterflies;

script.movingSpeed = script.movingSpeed;
script.directionalSpeed = script.directionalSpeed;
script.randomSize = script.randomSize;

script.followStrength = script.followStrength;
script.followRadius = script.followRadius;
script.followTransform = script.getSceneObject().getTransform();

script.alwaysAboveGround = script.alwaysAboveGround;
script.landOnWorldMesh = script.landOnWorldMesh;
script.avoidCollision = script.avoidCollision;
script.deviceTrackingComponent = script.deviceTracking;
script.landOnClassifications = getClassifications();

script.butterflies = [];



function init() {
	for (var i = 0; i < script.objectsToSpawn.length; i++) {
		script.objectsToSpawn[i].enabled = false;
	}

	if (script.landOnWorldMesh && !script.deviceTrackingComponent) {
		print("Butterflies landing on World Mesh only works if the Tracking Component has been specified!");
	}
}
init();



function start() {
	if (script.spawnOnStart > 0) {
		spawnButterflies(script.spawnOnStart);
	}
}
delay(start);



function spawnButterflies(amount) {
	for (var i = 0; i < amount; i++) {
		var newButterfly = makeButterfly(i);
		script.butterflies.push(newButterfly);
	}
}



function removeButterflies() {
	for (var i = 0; i < script.butterflies.length; i++) {
		script.butterflies[i].destroy();
	}
	script.butterflies = [];
}



function makeButterfly(index) {
	if (script.objectsToSpawn.length == 0) {
		print("Please set objects to copy");
		return null;
	}
	var randomIdx = Math.floor(Math.random() * script.objectsToSpawn.length);

	var p = script.followTransform.getWorldPosition();
	var r = script.followRadius;

	var _x = (Math.random() * 2 - 1) * r + p.x;
	var _y = (Math.random() * 2 - 1) * r + p.y;
	var _z = (Math.random() * 2 - 1) * r + p.z;
	var newPos = new vec3(_x, _y, _z);

	var objCopy = script.getSceneObject().copyWholeHierarchy(script.objectsToSpawn[randomIdx]);
	objCopy.getTransform().setWorldPosition(newPos);

	var newS = Math.random() * (script.randomSize.y - script.randomSize.x) + script.randomSize.x;
	var newScale = new vec3(newS, newS, newS);
	objCopy.getTransform().setWorldScale(newScale);

	objCopy.enabled = true;
	var objCopyScript = objCopy.getComponent("Component.ScriptComponent");
	objCopyScript.start(script);
	objCopyScript.thisButterflyIndex = index;

	return objCopy;
}



function getClassifications() {
	var classifications = [];
	if (script.landOnWall) classifications.push(1);
	if (script.landOnFloor) classifications.push(2);
	if (script.landOnCeiling) classifications.push(3);
	if (script.landOnTable) classifications.push(4);
	if (script.landOnSeat) classifications.push(5);
	if (script.landOnWindow) classifications.push(6);
	if (script.landOnDoor) classifications.push(7);
	return classifications;
}



function delay(func) { // delays a function 1 frame
	var wait = 1;
	function onUpdate() {
		if (wait <= 0) {
			script.removeEvent(waitEvent);
			func();
		}
		wait--;
	}
	var waitEvent = script.createEvent("UpdateEvent");
	waitEvent.bind(onUpdate);
}