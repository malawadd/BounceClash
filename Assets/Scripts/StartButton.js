// StartButton.js

// @input Component.InteractionComponent interaction
// @input Component.ScriptComponent turnBasedManager   // drag TurnBasedManager ScriptComponent here

function onTapped() {
    if (!script.turnBasedManager ||
        !script.turnBasedManager.api ||
        !script.turnBasedManager.api.startRound) {
        return;
    }

    script.turnBasedManager.api.startRound();

    // Hide this button once game starts
    script.getSceneObject().enabled = false;
}

var onStart = script.createEvent("OnStartEvent");
onStart.bind(function () {
    if (script.interaction) {
        script.interaction.onTap.add(onTapped); // NOTE: no ()
    }
});