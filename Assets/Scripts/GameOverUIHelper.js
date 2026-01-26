// GameOverUIHelper.js
// Optional helper script to create a nice-looking game over screen with animations
// This demonstrates how to enhance the basic game over with visual polish

//@input Component.Text player1Text
//@input Component.Text player2Text
//@input Component.Text winnerText
//@input Component.ScriptComponent tweenManager {"hint":"Optional: TweenManager for animations"}

// Animation durations
var FADE_IN_DURATION = 0.5;
var SCORE_COUNT_DURATION = 1.5;
var WINNER_REVEAL_DELAY = 2.0;

/**
 * Animate the game over screen reveal
 * Call this from ProperGameOverManager.displayScores()
 */
function animateReveal(p1Score, p2Score, winner) {
    print("[GameOverUIHelper] Starting animations");

    // Start with everything invisible
    if (script.player1Text) {
        setTextAlpha(script.player1Text, 0);
    }
    if (script.player2Text) {
        setTextAlpha(script.player2Text, 0);
    }
    if (script.winnerText) {
        setTextAlpha(script.winnerText, 0);
    }

    // Sequence:
    // 1. Fade in player scores (0.5s)
    // 2. Count up scores (1.5s)
    // 3. Reveal winner with scale animation (after 2s)

    delayedCall(0.1, function () {
        fadeInText(script.player1Text, FADE_IN_DURATION);
        fadeInText(script.player2Text, FADE_IN_DURATION);

        // Animate score counting
        animateScoreCount(script.player1Text, 0, p1Score, SCORE_COUNT_DURATION, "Player 1: ");
        animateScoreCount(script.player2Text, 0, p2Score, SCORE_COUNT_DURATION, "Player 2: ");
    });

    delayedCall(WINNER_REVEAL_DELAY, function () {
        fadeInText(script.winnerText, 0.3);
        scaleInText(script.winnerText);
    });
}

/**
 * Fade in a text element
 */
function fadeInText(textComponent, duration) {
    if (!textComponent) return;

    // If TweenManager is available, use it
    if (script.tweenManager && script.tweenManager.api) {
        // Use TweenManager fade
        var tweenType = script.tweenManager.api.TweenType;
        if (tweenType && tweenType.Alpha) {
            // Create tween from 0 to 1 alpha
            // (This is pseudo-code, actual TweenManager API may differ)
            print("[GameOverUIHelper] Using TweenManager for fade (implement based on your TweenManager)");
        }
    } else {
        // Fallback: simple lerp over time
        var startTime = getTime();
        var startAlpha = 0;
        var endAlpha = 1;

        var updateEvent = script.createEvent("UpdateEvent");
        updateEvent.bind(function () {
            var elapsed = getTime() - startTime;
            var progress = Math.min(elapsed / duration, 1.0);
            var currentAlpha = startAlpha + (endAlpha - startAlpha) * progress;

            setTextAlpha(textComponent, currentAlpha);

            if (progress >= 1.0) {
                updateEvent.enabled = false;
            }
        });
    }
}

/**
 * Scale in a text element with bounce effect
 */
function scaleInText(textComponent) {
    if (!textComponent) return;

    var textObj = textComponent.getSceneObject();
    var transform = textObj.getTransform();

    // Start small
    transform.setLocalScale(new vec3(0.5, 0.5, 0.5));

    // Animate to normal size with overshoot
    var startTime = getTime();
    var duration = 0.5;

    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(function () {
        var elapsed = getTime() - startTime;
        var progress = Math.min(elapsed / duration, 1.0);

        // Elastic ease-out for bounce effect
        var scale = elasticEaseOut(progress);
        transform.setLocalScale(new vec3(scale, scale, scale));

        if (progress >= 1.0) {
            updateEvent.enabled = false;
        }
    });
}

/**
 * Animate counting from start to end value
 */
function animateScoreCount(textComponent, startValue, endValue, duration, prefix) {
    if (!textComponent) return;

    var startTime = getTime();

    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(function () {
        var elapsed = getTime() - startTime;
        var progress = Math.min(elapsed / duration, 1.0);

        var currentValue = Math.floor(startValue + (endValue - startValue) * progress);
        textComponent.text = prefix + currentValue.toString();

        if (progress >= 1.0) {
            textComponent.text = prefix + endValue.toString();
            updateEvent.enabled = false;
        }
    });
}

/**
 * Set text alpha (opacity)
 */
function setTextAlpha(textComponent, alpha) {
    if (!textComponent) return;

    var color = textComponent.textFill.color;
    textComponent.textFill.color = new vec4(color.r, color.g, color.b, alpha);
}

/**
 * Delayed function call
 */
function delayedCall(seconds, callback) {
    var startTime = getTime();
    var updateEvent = script.createEvent("UpdateEvent");
    updateEvent.bind(function () {
        if (getTime() - startTime >= seconds) {
            callback();
            updateEvent.enabled = false;
        }
    });
}

/**
 * Elastic ease-out for bouncy animation
 */
function elasticEaseOut(t) {
    var p = 0.3;
    return Math.pow(2, -10 * t) * Math.sin((t - p / 4) * (2 * Math.PI) / p) + 1;
}

// Expose public API
script.animateReveal = animateReveal;

print("[GameOverUIHelper] Script initialized");
