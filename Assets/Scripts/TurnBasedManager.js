// @input SceneObject gameEndScene
// @input Component.Text p1ScoreText
// @input Component.Text p2ScoreText
// @input Component.Text winnerText


// Turn Based custom component instance (on the "Turn Based" Scene Object)
//@input Component.ScriptComponent turnBased

// Your existing GameController ScriptComponent (on the "GameController" Scene Object)
//@input Component.ScriptComponent gameController

// @input SceneObject turnEndScene

// Reference to the ProperGameOverManager (for final game over screen)
//@input Component.ScriptComponent properGameOverManager
// @input Component.ScriptComponent soundPlayer

script.turnEndScene.enabled = false;


var TURN_DURATION = 10.0;

// Called by the Turn Based component when a new turn starts
function startRound() {
    if (script.turnBased &&
        typeof script.turnBased.getTurnCount === "function" &&
        typeof script.turnBased.getCurrentUserIndex === "function") {

        script.turnBased.getTurnCount().then(function (turnCount) {
            script.turnBased.getCurrentUserIndex().then(function (userIndex) {
                print("[TurnBased] startRound: turnCount=" + turnCount +
                    ", currentUserIndex=" + userIndex);
            });
        });
    }
    if (!script.gameController || !script.gameController) {
        print("TurnBasedManager: gameController api missing");
        return;
    }

    // Force 10s for every network turn
    if (script.gameController.setTimerDuration) {
        script.gameController.setTimerDuration(TURN_DURATION);
    }

    // Reset this player's score
    if (script.gameController.setScore) {
        script.gameController.setScore(0);
    }

    // Start gameplay (enables NPC movement, hides start button, starts timer)
    if (script.gameController.startGame) {
        script.gameController.startGame();
    }
}
script.api.startRound = startRound;

// Called by GameController when its local 10s round is finished
// function onLocalRoundFinished(score) {
//     if (!script.turnBased) {
//         print("TurnBasedManager: turnBased component missing");
//         return;
//     }

//     // Save score into current turn variables under key "score"
//     if (typeof script.turnBased.setCurrentTurnVariable === "function") {
//         script.turnBased.setCurrentTurnVariable("score", score);
//     }

//     // Optional but nice: also set the dedicated score field
//     if (typeof script.turnBased.setScore === "function") {
//         script.turnBased.setScore(score);
//     }

//     // Complete the turn and trigger capture/send
//     if (typeof script.turnBased.endTurn === "function") {
//         script.turnBased.endTurn();
//     } else {
//         print("TurnBasedManager: endTurn() not available on Turn Based");
//     }
// }
// script.onLocalRoundFinished = onLocalRoundFinished;

function onLocalRoundFinished(_) {
    if (!script.turnBased) {
        print("TurnBasedManager: turnBased component missing");
        return;
    }
    if (!script.gameController || !script.gameController) {
        print("TurnBasedManager: gameController api missing");
        return;
    }

    // Always fetch the authoritative score from GameController
    var score = null;
    if (typeof script.gameController.getScore === "function") {
        score = script.gameController.getScore();
    }
    print("[TurnBasedManager] onLocalRoundFinished, final UI score = " + score);

    // Store score in turn variables
    if (typeof script.turnBased.setCurrentTurnVariable === "function") {
        script.turnBased.setCurrentTurnVariable("score", score);
    }

    // Optional: dedicated score field
    if (typeof script.turnBased.setScore === "function") {
        script.turnBased.setScore(score);
    }

    if (typeof script.turnBased.endTurn === "function") {
        script.turnBased.endTurn();
    } else {
        print("TurnBasedManager: endTurn() not available on Turn Based");
    }
}
script.onLocalRoundFinished = onLocalRoundFinished;

function showTurnEndScene() {
    if (script.turnEndScene) {
        script.turnEndScene.enabled = true;

         script.soundPlayer.api.stopByIndex(1);
    }
}
script.showTurnEndScene = showTurnEndScene;

// Debug: log when a turn ends (per-player turn, not whole game)
function onTurnEndDebug() {
    if (!script.turnBased) {
        return;
    }

    // getTurnCount() is async, getScore() is sync
    if (typeof script.turnBased.getTurnCount === "function") {
        script.turnBased.getTurnCount().then(function (turnCount) {
            var score = null;
            if (typeof script.turnBased.getScore === "function") {
                score = script.turnBased.getScore();
            }
            print("[TurnBased] TurnEnd: turnCount=" + turnCount + ", score=" + score);
            // Show turn-end UI
            // if (script.turnEndScene) {
            //     script.turnEndScene.enabled = true;
            // }



        }).catch(function (e) {
            print("[TurnBased] TurnEnd debug error in getTurnCount: " + e);
        });
    } else {
        print("[TurnBased] TurnEnd debug: getTurnCount() not available");
    }
}
// Called when the entire game is over (all turns completed)
// This will show the final game over screen with both players' total scores and winner
function onGameOverDebug() {
    if (!script.turnBased || !script.gameController) {
        print("[TurnBased] GameOver: missing components");
        return;
    }

    // Current player's final score from GameController UI
    var currentScore = 0;
    if (typeof script.gameController.getScore === "function") {
        currentScore = script.gameController.getScore();
    }

    var p0 = 0;
    var p1 = 0;
    var turnBased = script.turnBased;

    var getHistoryPromise = typeof turnBased.getTurnHistory === "function"
        ? turnBased.getTurnHistory()
        : Promise.resolve([]);

    getHistoryPromise.then(function(history) {
        // Sum all *completed* turns from history
        for (var i = 0; i < history.length; i++) {
            var entry = history[i];
            var vars = entry.userDefinedGameVariables || {};
            var score = typeof vars.score === "number" ? vars.score : 0;

            // Even turnCount -> Player 0, odd -> Player 1
            if (entry.turnCount % 2 === 0) {
                p0 += score;
            } else {
                p1 += score;
            }
        }

        // Add this device's final score to the correct player
        var getUserIndexPromise = typeof turnBased.getCurrentUserIndex === "function"
            ? turnBased.getCurrentUserIndex()
            : Promise.resolve(0);

        return getUserIndexPromise.then(function(userIndex) {
            if (userIndex === 0) {
                p0 += currentScore;
            } else {
                p1 += currentScore;
            }

            print("[TurnBased] Final totals: Player0=" + p0 + ", Player1=" + p1);

            // Update UI texts
            if (script.p1ScoreText) {
                script.p1ScoreText.text = "Player 1: " + p0.toString();
            }
            if (script.p2ScoreText) {
                script.p2ScoreText.text = "Player 2: " + p1.toString();
            }

            if (script.winnerText) {
                if (p0 > p1) {
                    script.winnerText.text = "Winner: Player 1";
                } else if (p1 > p0) {
                    script.winnerText.text = "Winner: Player 2";
                } else {
                    script.winnerText.text = "It's a tie!";
                }
            }

            // Hide per-turn screen and show final game over screen
            if (script.turnEndScene) {
                script.turnEndScene.enabled = false;
            }
            if (script.gameEndScene) {
                script.gameEndScene.enabled = true;
            }
        });
    }).catch(function(e) {
        print("[TurnBased] GameOver error: " + e);
    });
}
script.onGameOverDebug = onGameOverDebug;
