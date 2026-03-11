import subprocess
from recommender import save_history

def check_name(exercise_name):
    if "bicep curl" in exercise_name:
        return "Bicep Curl"
    elif "hammer curl" in exercise_name:
        return "Hammer Curl"
    elif "chest fly" in exercise_name:
        return "Chest Fly"
    elif "pushup" in exercise_name:
        return "Push-ups"
    elif "lunges" in exercise_name:
        return "Lunges"
    elif "squat" in exercise_name:
        return "Squats"
    elif "front raises" in exercise_name:
        return "Front Raises"    
    elif "lateral raises" in exercise_name:
        return "Lateral Raises"                
    else:
        return None

def launch_exercise(exercise_name):
    exercise_name = exercise_name.lower()
    matched_name = check_name(exercise_name)
    if matched_name:
            save_history(matched_name)
            return {
                "type": "exercise_redirect",
                "route": "/live-workout",
                "exercise": matched_name
            }
        
    return {
        "type": "message",
        "text": "Exercise not available yet."
    }    

    # if "bicep curl" in exercise_name:
    #     subprocess.run(["py", "exercises/bicep/bicep_curl.py"])
    #     save_history("bicep curl")

    # elif "hammer curl" in exercise_name:
    #     subprocess.run(["py", "exercises/bicep/hammer.py"])
    #     save_history("hammer curl")

    # elif "chest fly" in exercise_name:
    #     subprocess.run(["py", "exercises/chest/chest_fly.py"])
    #     save_history("chest fly")

    # elif "pushup" in exercise_name:
    #     subprocess.run(["py", "exercises/chest/pushupcheck.py"])
    #     save_history("pushup")

    # elif "lunges" in exercise_name:
    #     subprocess.run(["py", "exercises/leg/lunges.py"])
    #     save_history("lunges")

    # elif "squat" in exercise_name:
    #     subprocess.run(["py", "exercises/leg/squats.py"])
    #     save_history("squat")

    # elif "front raises" in exercise_name:
    #     subprocess.run(["py", "exercises/shoulder/front_raises.py"])
    #     save_history("front raises")    

    # elif "lateral raises" in exercise_name:
    #     subprocess.run(["py", "exercises/shoulder/lateral.py"])
    #     save_history("lateral raises")                

    # else:
    #     print("Exercise not available yet.")
