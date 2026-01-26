// ProperGameOverManager.js
// Manages the final game over screen with both players' scores and winner announcement
// This script should be attached to a new SceneObject that displays when ALL turns are complete

// ------ INPUTS ------

// Reference to Turn Based component
//@input Component.ScriptComponent turnBased

// UI Text elements for displaying scores and winner
//@input Component.Text player1ScoreText {"label":"Player 1 Score Text"}
//@input Component.Text player2ScoreText {"label":"Player 2 Score Text"}
//@input Component.Text winnerAnnouncementText {"label":"Winner Announcement Text"}
//@input Component.Text turnStatusText {"label":"Turn Status Text", "hint":"Optional"}

// Optional: Container to show/hide entire game over screen
//@input SceneObject gameOverContainer {"label":"Game Over Container", "hint":"Optional"}

// ------ INITIALIZATION ------

// Auto-hide the screen at start
if (script.gameOverContainer) {
    script.gameOverContainer.enabled = false;
}

// ------ PUBLIC API ------

/**
 * Called when the entire game is over (all turns completed)
 * This calculates both players' scores and determines the winner
 */
function showFinalGameOver() {
    print("[ProperGameOverManager] showFinalGameOver called");

    if (!script.turnBased) {
        print("[ProperGameOverManager] ERROR: turnBased component not assigned!");
        return;
    }

    // Show the container
    if (script.gameOverContainer) {
        script.gameOverContainer.enabled = true;
    }

    // Get turn history and calculate scores
    calculateAndDisplayScores();
}

/**
 * Calculates scores from turn history and displays them
 */
function calculateAndDisplayScores() {
    var player0Score = 0;
    var player1Score = 0;

    // Get turn history (this is a Promise)
    var getHistoryPromise = typeof script.turnBased.getTurnHistory === "function"
        ? script.turnBased.getTurnHistory()
        : Promise.resolve([]);

    getHistoryPromise.then(function (history) {
        print("[ProperGameOverManager] Turn history received: " + JSON.stringify(history));

        // Sum up scores from turn history
        for (var i = 0; i < history.length; i++) {
            var entry = history[i];
            var vars = entry.userDefinedGameVariables || {};
            var score = typeof vars.score === "number" ? vars.score : 0;

            // Even turnCount = Player 0, Odd turnCount = Player 1
            if (entry.turnCount % 2 === 0) {
                player0Score += score;
                print("[ProperGameOverManager] Turn " + entry.turnCount + " (Player 0): +" + score);
            } else {
                player1Score += score;
                print("[ProperGameOverManager] Turn " + entry.turnCount + " (Player 1): +" + score);
            }
        }

        print("[ProperGameOverManager] Final Scores: P0=" + player0Score + ", P1=" + player1Score);

        // Display scores
        displayScores(player0Score, player1Score);

    }).catch(function (error) {
        print("[ProperGameOverManager] Error getting turn history: " + error);

        // Fallback: show error message
        if (script.winnerAnnouncementText) {
            script.winnerAnnouncementText.text = "Error calculating scores";
        }
    });
}

/**
 * Displays the scores and determines the winner
 */
function displayScores(player0Score, player1Score) {
    // Display Player 1 score
    if (script.player1ScoreText) {
        script.player1ScoreText.text = "Player 1: " + player0Score;
    }

    // Display Player 2 score
    if (script.player2ScoreText) {
        script.player2ScoreText.text = "Player 2: " + player1Score;
    }

    // Determine and display winner
    var winnerText = "";
    if (player0Score > player1Score) {
        winnerText = "🏆 PLAYER 1 WINS! 🏆";
    } else if (player1Score > player0Score) {
        winnerText = "🏆 PLAYER 2 WINS! 🏆";
    } else {
        winnerText = "🤝 IT'S A TIE! 🤝";
    }

    if (script.winnerAnnouncementText) {
        script.winnerAnnouncementText.text = winnerText;
    }

    print("[ProperGameOverManager] Winner: " + winnerText);
}

/**
 * Hide the game over screen (useful for replaying)
 */
function hideGameOver() {
    if (script.gameOverContainer) {
        script.gameOverContainer.enabled = false;
    }
}

// Expose public API
script.showFinalGameOver = showFinalGameOver;
script.hideGameOver = hideGameOver;

print("[ProperGameOverManager] Script initialized");
