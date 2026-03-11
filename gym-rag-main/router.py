exercise_keywords = [
    "bicep curl",
    "hammer curl",
    "chest fly",
    "pushup",
    "lunges",
    "squat",
    "front raises",
    "lateral raises"
]

perform_verbs = [
    "do",
    "start",
    "perform",
    "begin",
    "launch",
    "open",
    "execute",
    "run"
]

question_verbs = [
    "how",
    "teach",
    "what",
    "why",
    "guide",
    "explain",
    "tips"
]

def detect_intent(query):
    query = query.lower()

    exercise_found = None
    for ex in exercise_keywords:
        if ex in query:
            exercise_found = ex
            break

    if exercise_found:

        # check if user wants explanation
        for verb in question_verbs:
            if verb in query:
                return "question"
            
        # check if user wants to perform
        for verb in perform_verbs:
            if verb in query:
                return "exercise"

        # fallback rule
        return "question"

    if "recommend" in query:
        return "recommend"

    return "question"