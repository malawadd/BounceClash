//@input Component.ScriptComponent[] MoveTowardsPlayer
//@input Component.Text StartButton
//@input Component.ScriptComponent turnBasedManager  

// NPCFallScore_Multi_PerNPC.js
// Gives points when any NPC in a list falls below a certain Y level
// Each NPC can have its own point value

// NPCs to watch
// @input SceneObject[] npcs

// Optional: points for each NPC (same order as npcs array)
// If left empty or too short, we fall back to pointsPerFall
// @input int[] npcPoints {"label":"Points Per NPC", "hint":"Optional; index matches NPCs"}

// Y position at which we consider the NPC "fallen off the ground"
// Example: if your ground is around Y = 0, use -5 or -10
// @input float fallY = -10.0 {"label":"Fall Threshold Y"}

// Starting score
// @input int score = 0 {"label":"Starting Score"}

// Default points to add each time an NPC falls
// (used when npcPoints for that NPC is not set)
// @input int pointsPerFall = 1 {"label":"Default Points Per Fall"}

// Optional: Text component to display the score
// @input Component.Text scoreText {"label":"Score Text", "hint":"Optional"}


// function startGame() {

// //Enable movetowardsplayer script
//     for (var i = 0; i < script.MoveTowardsPlayer.length; i++) {
//     var sc = script.MoveTowardsPlayer[i];
//     if (!sc) {
//         continue;
//     }}
//     sc.enabled = true;

//     script.StartButton.enabled = false;
//     script.startTimer();

// }

// script.startGame = startGame;  // expose it



// // var currentScore = script.score;
// // // hasFallen[i] tracks if npcs[i] is currently considered "fallen"
// // var hasFallen = [];

// // function init() {
// //     if (script.npcs) {
// //         for (var i = 0; i < script.npcs.length; i++) {
// //             hasFallen[i] = false;
// //         }
// //     }

// //     updateScoreText();

// //     // Check NPC positions every frame
// //     script.createEvent("UpdateEvent").bind(onUpdate);

// //     // Expose API so other scripts can change the score
// //     script.addPoints = addPoints;
// //     script.setScore = setScore;
// //     script.getScore = function () {
// //         return currentScore;
// //     };
// // }

// // function onUpdate() {
// //     if (!script.npcs) {
// //         return;
// //     }

// //     for (var i = 0; i < script.npcs.length; i++) {
// //         var npc = script.npcs[i];
// //         if (!npc) {
// //             continue;
// //         }

// //         var npcTransform = npc.getTransform();
// //         var npcY = npcTransform.getWorldPosition().y;

// //         // NPC just fell below the threshold
// //         if (!hasFallen[i] && npcY < script.fallY) {
// //             hasFallen[i] = true;

// //             // Decide how many points this NPC gives
// //             var award = script.pointsPerFall;
// //             if (script.npcPoints && i < script.npcPoints.length) {
// //                 award = script.npcPoints[i];
// //             }

// //             addPoints(award);
// //         }

// //         // Reset flag if NPC comes back above the threshold
// //         if (hasFallen[i] && npcY >= script.fallY) {
// //             hasFallen[i] = false;
// //         }
// //     }
// // }

// // function addPoints(amount) {
// //     currentScore += amount;
// //     updateScoreText();
// // }

// // function setScore(value) {
// //     currentScore = value;
// //     updateScoreText();
// // }

// // function updateScoreText() {
// //     if (script.scoreText) {
// //         script.scoreText.text = currentScore.toString();
// //     }
// // }

// // init();


// // -----JS CODE-----
// // NPCFallScore_Multi_PerNPC_Timer.js
// // Multi‑NPC fall scoring + per‑NPC values + countdown timer

// // ---------- NPC / SCORE SETUP ----------

// // NPCs to watch
// // @input SceneObject[] npcs

// // Optional: points for each NPC (same order as npcs array)
// // If left empty or too short, we fall back to pointsPerFall
// // @input int[] npcPoints {"label":"Points Per NPC", "hint":"Index matches NPCs"}

// // Y position at which we consider the NPC "fallen off the ground"
// // Example: if your ground is around Y = 0, use -5 or -10
// // @input float fallY = -10.0 {"label":"Fall Threshold Y"}

// // Starting score
// // @input int score = 0 {"label":"Starting Score"}

// // Default points to add each time an NPC falls
// // (used when npcPoints for that NPC is not set)
// // @input int pointsPerFall = 1 {"label":"Default Points Per Fall"}

// // Optional: Text component to display the score
// // @input Component.Text scoreText {"label":"Score Text", "hint":"Optional"}

// // ---------- TIMER SETUP ----------

// // How long the countdown should last (seconds)
// // @input float timerDuration = 20.0 {"label":"Timer Duration (sec)"}

// // Start the countdown automatically when the Lens starts?
// // @input bool autoStartTimer = true {"label":"Start Timer On Lens Start"}

// // Optional: Text component to display remaining time (seconds)
// // @input Component.Text timerText {"label":"Timer Text", "hint":"Optional"}

// // Optional: Text component to show "Game Over" when time runs out
// // @input Component.Text gameOverText {"label":"Game Over Text", "hint":"Optional"}

// // ---------- INTERNAL STATE ----------

// var currentScore = script.score;
// // hasFallen[i] tracks if npcs[i] is currently considered "fallen"
// var hasFallen = [];

// // Timer state
// var timeRemaining = 0.0;
// var timerRunning = false;
// var isGameOver = false;

// // ---------- INIT ----------

// function init() {
//     // Init NPC flags
//     if (script.npcs) {
//         for (var i = 0; i < script.npcs.length; i++) {
//             hasFallen[i] = false;
//         }
//     }

//     // Init timer
//     timeRemaining = script.timerDuration;
//     updateTimerText();

//     updateScoreText();

//     // Single UpdateEvent drives both timer + scoring
//     script.createEvent("UpdateEvent").bind(onUpdate);

//     // Expose API to other scripts (score)
//     script.addPoints = addPoints;
//     script.setScore = setScore;
//     script.getScore = function () { return currentScore; };

//     // Expose API to other scripts (timer)
//     script.startTimer = startTimer;            // startTimer(seconds?) – see below
//     script.resetTimer = resetTimer;
//     script.getTimeRemaining = function () { return timeRemaining; };
//     script.setTimerDuration = function (seconds) {
//         script.timerDuration = seconds;
//         if (!timerRunning && !isGameOver) {
//             timeRemaining = seconds;
//             updateTimerText();
//         }
//     };
//     script.isGameOver = function () { return isGameOver; };

//     // Auto‑start timer on lens start if enabled
//     if (script.autoStartTimer) {
//         startTimer(script.timerDuration);
//     }
// }

// // ---------- UPDATE LOOP ----------

// function onUpdate(eventData) {
//     var dt = eventData.getDeltaTime();

//     // --- Timer logic ---
//     if (timerRunning && !isGameOver) {
//         timeRemaining -= dt;
//         if (timeRemaining <= 0) {
//             timeRemaining = 0;
//             timerRunning = false;
//             onGameOver();
//         }
//         updateTimerText();
//     }

//     // After game over, no more scoring
//     if (isGameOver) {
//         return;
//     }

//     // --- NPC fall scoring ---
//     if (!script.npcs) {
//         return;
//     }

//     for (var i = 0; i < script.npcs.length; i++) {
//         var npc = script.npcs[i];
//         if (!npc) {
//             continue;
//         }

//         var npcY = npc.getTransform().getWorldPosition().y;

//         // NPC just fell below the threshold
//         if (!hasFallen[i] && npcY < script.fallY) {
//             hasFallen[i] = true;

//             // Decide how many points this NPC gives
//             var award = script.pointsPerFall;
//             if (script.npcPoints && i < script.npcPoints.length) {
//                 award = script.npcPoints[i];
//             }

//             addPoints(award);
//         }

//         // Reset flag if NPC comes back above the threshold
//         if (hasFallen[i] && npcY >= script.fallY) {
//             hasFallen[i] = false;
//         }
//     }
// }

// // ---------- SCORE HELPERS ----------

// function addPoints(amount) {
//     currentScore += amount;
//     updateScoreText();
// }

// function setScore(value) {
//     currentScore = value;
//     updateScoreText();
// }

// function updateScoreText() {
//     if (script.scoreText) {
//         script.scoreText.text = currentScore.toString();
//     }
// }

// // ---------- TIMER HELPERS ----------

// function startTimer(seconds) {
//     // If a value is passed, use it; otherwise use current duration
//     if (typeof seconds === "number") {
//         timeRemaining = seconds;
//     } else {
//         timeRemaining = script.timerDuration;
//     }
//     isGameOver = false;
//     timerRunning = true;
//     updateTimerText();

//     // Clear any previous game over text
//     if (script.gameOverText) {
//         script.gameOverText.text = "";
//     }
// }
// script.startTimer = startTimer;  // expose it

// function resetTimer() {
//     isGameOver = false;
//     timerRunning = false;
//     timeRemaining = script.timerDuration;
//     updateTimerText();

//     if (script.gameOverText) {
//         script.gameOverText.text = "";
//     }
// }

// function updateTimerText() {
//     if (script.timerText) {
//         var secondsLeft = Math.ceil(timeRemaining);
//         if (secondsLeft < 0) {
//             secondsLeft = 0;
//         }
//         script.timerText.text = secondsLeft.toString();
//     }
// }

// function onGameOver() {
//     isGameOver = true;

//     if (script.gameOverText) {
//         script.gameOverText.text = "Game Over";
//     } else {
//         print("[Game] Game Over");
//     }
// }

// // ---------- RUN ----------

// init();

// -----JS CODE-----
// GameController.js
// Handles: Start button, NPC movement, scoring, countdown timer, game over

// ---------- GAME OBJECT / UI INPUTS ----------

// Scripts that move NPCs towards the player (disabled at start, enabled on game start)
//@input Component.ScriptComponent[] MoveTowardsPlayer

// Start button text (we'll hide/disable it when the game starts)
//@input Component.Text StartButton

// ---------- NPC / SCORE SETUP ----------

// NPCs to watch
// @input SceneObject[] npcs

// Optional: points for each NPC (same order as npcs array)
// If left empty or too short, we fall back to pointsPerFall
// @input int[] npcPoints {"label":"Points Per NPC", "hint":"Index matches NPCs"}

// Y position at which we consider the NPC "fallen off the ground"
// Example: if your ground is around Y = 0, use -5 or -10
// @input float fallY = -10.0 {"label":"Fall Threshold Y"}

// Starting score
// @input int score = 0 {"label":"Starting Score"}

// Default points to add each time an NPC falls
// (used when npcPoints for that NPC is not set)
// @input int pointsPerFall = 1 {"label":"Default Points Per Fall"}

// Optional: Text component to display the score
// @input Component.Text scoreText {"label":"Score Text", "hint":"Optional"}

// ---------- TIMER SETUP ----------

// How long the countdown should last (seconds)
// @input float timerDuration = 20.0 {"label":"Timer Duration (sec)"}

// Start the countdown automatically when the Lens starts?
// Usually false if you want to start only when button pressed
// @input bool autoStartTimer = false {"label":"Start Timer On Lens Start"}

// Optional: Text component to display remaining time (seconds)
// @input Component.Text timerText {"label":"Timer Text", "hint":"Optional"}

// Optional: Text component to show "Game Over" when time runs out
// @input Component.Text gameOverText {"label":"Game Over Text", "hint":"Optional"}

// ---------- INTERNAL STATE ----------



var currentScore = script.score;
// hasFallen[i] tracks if npcs[i] is currently considered "fallen"
var hasFallen = [];

// Timer state
var timeRemaining = 0.0;
var timerRunning = false;
var isGameOver = false;

// ---------- GAME START BUTTON ----------

function startGame() {
    // Enable MoveTowardsPlayer scripts
    if (script.MoveTowardsPlayer) {
        for (var i = 0; i < script.MoveTowardsPlayer.length; i++) {
            var sc = script.MoveTowardsPlayer[i];
            if (!sc) {
                continue;
            }
            sc.enabled = true;
        }
    }

    // Disable / hide the start button when game begins
    if (script.StartButton) {
        script.StartButton.enabled = false;
    }

    // Start the countdown timer
    startTimer(); // uses current timerDuration
}

script.startGame = startGame;  // Expose startGame to other scripts / UI

// ---------- INIT ----------

function init() {
    // Init NPC flags
    if (script.npcs) {
        for (var i = 0; i < script.npcs.length; i++) {
            hasFallen[i] = false;
        }
    }

    // Init timer
    timeRemaining = script.timerDuration;
    updateTimerText();

    // Init score display
    updateScoreText();

    // Single UpdateEvent drives both timer + scoring
    script.createEvent("UpdateEvent").bind(onUpdate);

    // Expose API to other scripts (score)
    script.addPoints = addPoints;
    script.setScore = setScore;
    script.getScore = function () { return currentScore; };

    // Expose API to other scripts (timer)
    script.startTimer = startTimer;   // startTimer(seconds?) – see below
    script.resetTimer = resetTimer;
    script.getTimeRemaining = function () { return timeRemaining; };
    script.setTimerDuration = function (seconds) {
        script.timerDuration = seconds;
        if (!timerRunning && !isGameOver) {
            timeRemaining = seconds;
            updateTimerText();
        }
    };
    script.isGameOver = function () { return isGameOver; };

    // Auto‑start timer on lens start if enabled
    if (script.autoStartTimer) {
        startTimer(script.timerDuration);
    }
}

// ---------- UPDATE LOOP ----------

function onUpdate(eventData) {
    var dt = eventData.getDeltaTime();

    // --- Timer logic ---
    if (timerRunning && !isGameOver) {
        timeRemaining -= dt;
        if (timeRemaining <= 0) {
            timeRemaining = 0;
            timerRunning = false;
            onGameOver();
        }
        updateTimerText();
    }

    // After game over, no more scoring
    if (isGameOver) {
        return;
    }

    // --- NPC fall scoring ---
    if (!script.npcs) {
        return;
    }

    for (var i = 0; i < script.npcs.length; i++) {
        var npc = script.npcs[i];
        if (!npc) {
            continue;
        }

        var npcY = npc.getTransform().getWorldPosition().y;

        // NPC just fell below the threshold
        if (!hasFallen[i] && npcY < script.fallY) {
            hasFallen[i] = true;

            // Decide how many points this NPC gives
            var award = script.pointsPerFall;
            if (script.npcPoints && i < script.npcPoints.length) {
                award = script.npcPoints[i];
            }

            addPoints(award);
        }

        // Reset flag if NPC comes back above the threshold
        if (hasFallen[i] && npcY >= script.fallY) {
            hasFallen[i] = false;
        }
    }
}

// ---------- SCORE HELPERS ----------

function addPoints(amount) {
    currentScore += amount;
    updateScoreText();
}

function setScore(value) {
    currentScore = value;
    updateScoreText();
}

function updateScoreText() {
    if (script.scoreText) {
        script.scoreText.text = "SCORE: " + currentScore.toString();
    }
}

// ---------- TIMER HELPERS ----------

function startTimer(seconds) {
    // If a value is passed, use it; otherwise use current duration
    if (typeof seconds === "number") {
        timeRemaining = seconds;
    } else {
        timeRemaining = script.timerDuration;
    }
    isGameOver = false;
    timerRunning = true;
    updateTimerText();

    // Clear any previous game over text
    if (script.gameOverText) {
        script.gameOverText.text = "";
    }
}

function resetTimer() {
    isGameOver = false;
    timerRunning = false;
    timeRemaining = script.timerDuration;
    updateTimerText();

    if (script.gameOverText) {
        script.gameOverText.text = "";
    }
}

function updateTimerText() {
    if (script.timerText) {
        var secondsLeft = Math.ceil(timeRemaining);
        if (secondsLeft < 0) {
            secondsLeft = 0;
        }
        script.timerText.text = "Timer: " + secondsLeft.toString();
    }
}

function onGameOver() {
    isGameOver = true;

    // Stop NPC movement scripts when game is over
    if (script.MoveTowardsPlayer) {
        for (var i = 0; i < script.MoveTowardsPlayer.length; i++) {
            var sc = script.MoveTowardsPlayer[i];
            if (!sc) {
                continue;
            }
            sc.enabled = false;
        }
    }

    if (script.gameOverText) {
        script.gameOverText.text = "Game Over";
    } else {
        print("[Game] Game Over");
    }

   
    if (script.turnBasedManager &&
        script.turnBasedManager &&
        script.turnBasedManager.onLocalRoundFinished) {
        script.turnBasedManager.onLocalRoundFinished(currentScore);
    }
}

// ---------- RUN ----------

init();