
// Turn Based custom component instance (on the "Turn Based" Scene Object)
//@input Component.ScriptComponent turnBased

// Your existing GameController ScriptComponent (on the "GameController" Scene Object)
//@input Component.ScriptComponent gameController

var TURN_DURATION = 10.0;

// Called by the Turn Based component when a new turn starts
function startRound() {
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
script.startRound = startRound;

// Called by GameController when its local 10s round is finished
function onLocalRoundFinished(score) {
    if (!script.turnBased) {
        print("TurnBasedManager: turnBased component missing");
        return;
    }

    // Save score into current turn variables under key "score"
    if (typeof script.turnBased.setCurrentTurnVariable === "function") {
        script.turnBased.setCurrentTurnVariable("score", score);
    }

    // Optional but nice: also set the dedicated score field
    if (typeof script.turnBased.setScore === "function") {
        script.turnBased.setScore(score);
    }

    // Complete the turn and trigger capture/send
    if (typeof script.turnBased.endTurn === "function") {
        script.turnBased.endTurn();
    } else {
        print("TurnBasedManager: endTurn() not available on Turn Based");
    }
}
script.onLocalRoundFinished = onLocalRoundFinished;

// Debug: log when a turn ends (per-player turn, not whole game)
function onTurnEndDebug() {
    if (!script.turnBased) {
        return;
    }

    // getTurnCount() is async, getScore() is sync
    if (typeof script.turnBased.getTurnCount === "function") {
        script.turnBased.getTurnCount().then(function(turnCount) {
            var score = null;
            if (typeof script.turnBased.getScore === "function") {
                score = script.turnBased.getScore();
            }
            print("[TurnBased] TurnEnd: turnCount=" + turnCount + ", score=" + score);
        }).catch(function(e) {
            print("[TurnBased] TurnEnd debug error in getTurnCount: " + e);
        });
    } else {
        print("[TurnBased] TurnEnd debug: getTurnCount() not available");
    }
}
script.onTurnEndDebug = onTurnEndDebug;

// Debug: log full history and winner when the game is over
function onGameOverDebug() {
    if (!script.turnBased || typeof script.turnBased.getTurnHistory !== "function") {
        print("[TurnBased] GameOver debug: getTurnHistory() not available");
        return;
    }

    script.turnBased.getTurnHistory().then(function(history) {
        if (!history || history.length === 0) {
            print("[TurnBased] GameOver: no turn history");
            return;
        }

        print("[TurnBased] Full turn history: " + JSON.stringify(history));

        var p0 = 0;
        var p1 = 0;

        for (var i = 0; i < history.length; i++) {
            var entry = history[i];
            // We stored score as a turn variable under the key "score"
            var vars = entry.userDefinedGameVariables;
            var score = (vars && typeof vars.score === "number") ? vars.score : null;

            if (score === null) {
                continue;
            }

            // Even turnCount -> user 0, odd -> user 1 (per Turn Based docs)
            if (entry.turnCount % 2 === 0) {
                p0 += score;
            } else {
                p1 += score;
            }

            print("[TurnBased] Turn " + entry.turnCount + ": user " +
                  (entry.turnCount % 2) + " score=" + score);
        }

        print("[TurnBased] Totals: Player0=" + p0 + ", Player1=" + p1);

        if (p0 > p1) {
            print("[TurnBased] Winner: Player 0");
        } else if (p1 > p0) {
            print("[TurnBased] Winner: Player 1");
        } else {
            print("[TurnBased] Result: tie");
        }
    }).catch(function(e) {
        print("[TurnBased] GameOver debug error in getTurnHistory: " + e);
    });
}
script.onGameOverDebug = onGameOverDebug;