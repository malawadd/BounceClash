// NpcSpawner.js
// Event: Lens Initialized

//@input SceneObject[] npcTemplates       // list of template roots (NPC_Root, NPC_Root_2, ...)
//@input int npcCount = 3                // total NPCs to spawn
//@input SceneObject areaCenter          // center of spawn area
//@input float areaWidth = 400.0         // X size of area
//@input float areaDepth = 400.0         // Z size of area

if (!script.npcTemplates || script.npcTemplates.length === 0) {
    print("NpcSpawner: npcTemplates list is empty");
    return;
}
if (!script.areaCenter) {
    print("NpcSpawner: areaCenter not set");
    return;
}

// Optional: if you *really* want templates hidden, you can disable *just visuals* later.
// Do NOT disable the template roots here, or the spawner on them will stop running.

// Keep references if you want to access them later
script.spawnedNpcs = [];

function randomInRange(min, max) {
    return min + Math.random() * (max - min);
}

function pickRandomTemplate() {
    var idx = Math.floor(Math.random() * script.npcTemplates.length);
    return script.npcTemplates[idx];
}

// Spawn all NPCs once on Lens start
var initEvent = script.createEvent("OnStartEvent");
initEvent.bind(function () {
    var areaCenterPos = script.areaCenter.getTransform().getWorldPosition();

    for (var i = 0; i < script.npcCount; i++) {
        // 1) Pick a random template from the list
        var template = pickRandomTemplate();
        if (!template || !template.isenabled) {
            // skip disabled / null templates
            continue;
        }

        var templateTransform = template.getTransform();
        var templatePos = templateTransform.getWorldPosition();
        var groundY = templatePos.y;

        // 2) Duplicate template hierarchy under this spawner
        var spawnerRoot = script.getSceneObject();
        var npcCloneRoot = spawnerRoot.copyWholeHierarchy(template);
        npcCloneRoot.name = template.name + "_Clone_" + i;

        // 3) Compute random position inside area (X/Z, fixed Y from template)
        var halfW = script.areaWidth * 0.5;
        var halfD = script.areaDepth * 0.5;

        var x = randomInRange(areaCenterPos.x - halfW, areaCenterPos.x + halfW);
        var z = randomInRange(areaCenterPos.z - halfD, areaCenterPos.z + halfD);
        var spawnPos = new vec3(x, groundY, z);

        npcCloneRoot.getTransform().setWorldPosition(spawnPos);

        // 4) Store reference in list
        script.spawnedNpcs.push(npcCloneRoot);
    }

});