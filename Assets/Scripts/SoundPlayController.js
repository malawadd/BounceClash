// Plays sounds by index using a list of AudioComponents

// Each AudioComponent should have its own AudioTrackAsset set in the Inspector.
// @input Component.AudioComponent[] audioComponents

// Optional: number of default loops (1 = once, -1 = infinite)
// @input int defaultLoops = 1

// Play a sound by index in the audioComponents array
function playByIndex(index, loops) {
    if (!script.audioComponents || script.audioComponents.length === 0) {
        print("SoundPlayerByIndex: No audioComponents assigned on script input.");
        return;
    }

    if (index < 0 || index >= script.audioComponents.length) {
        print("SoundPlayerByIndex: Index " + index + " is out of range.");
        return;
    }

    var ac = script.audioComponents[index];
    if (!ac) {
        print("SoundPlayerByIndex: audioComponents[" + index + "] is not set.");
        return;
    }

    var playCount = (loops === undefined || loops === null) ? script.defaultLoops : loops;
    // playCount: 1 = once, -1 = loop forever
    ac.play(playCount);
}

// Stop a specific index
function stopByIndex(index) {
    if (!script.audioComponents || index < 0 || index >= script.audioComponents.length) {
        return;
    }
    var ac = script.audioComponents[index];
    if (ac) {
        ac.stop(true); // stop and reset
    }
}

// Stop all sounds
function stopAll() {
    if (!script.audioComponents) {
        return;
    }
    for (var i = 0; i < script.audioComponents.length; i++) {
        if (script.audioComponents[i]) {
            script.audioComponents[i].stop(true);
        }
    }
}

// Expose API
script.api.playByIndex = playByIndex;
script.api.stopByIndex = stopByIndex;
script.api.stopAll = stopAll;

