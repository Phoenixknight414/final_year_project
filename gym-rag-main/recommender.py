import json
import random
from datetime import datetime

MUSCLE_GROUPS = {
    "squat": "legs",
    "pushup": "chest",
    "plank": "core",
    "burpees": "full_body",
    "jumping_jacks": "cardio"
}

def load_profile():
    with open("user_profile.json", "r") as f:
        return json.load(f)

def load_history():
    with open("workout_history.json", "r") as f:
        return json.load(f)

def save_history(exercise):
    history = load_history()

    history.append({
        "date": datetime.now().strftime("%Y-%m-%d"),
        "exercise": exercise
    })

    with open("workout_history.json", "w") as f:
        json.dump(history, f, indent=4)

def recommend_workout():
    profile = load_profile()
    history = load_history()

    goal = profile["goal"]

    if goal == "fat_loss":
        options = ["jumping_jacks", "burpees", "squat"]

    elif goal == "muscle_gain":
        options = ["pushup", "squat"]

    else:
        options = ["squat", "pushup", "plank"]

    if not history:
        return random.choice(options)

    last_exercise = history[-1]["exercise"]
    last_muscle = MUSCLE_GROUPS.get(last_exercise)

    filtered = [
        ex for ex in options
        if ex != last_exercise
        and MUSCLE_GROUPS.get(ex) != last_muscle
    ]

    if not filtered:
        filtered = options

    return random.choice(filtered)
