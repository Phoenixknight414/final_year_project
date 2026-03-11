import os
os.environ["HF_HUB_DISABLE_SYMLINKS_WARNING"] = "1"
from router import detect_intent
from recommender import recommend_workout
from exercise_launcher import launch_exercise
from rag import get_rag_answer
from faster_whisper import WhisperModel
import json
import tempfile
from fastapi import FastAPI, WebSocket
from fastapi.websockets import WebSocketDisconnect
import asyncio

app = FastAPI()

print("[READY] AI Fitness Trainer Ready!")

model = WhisperModel(
    "base",          # best accuracy
    device="cpu",
    compute_type="int8"  # important for speed on CPU
)
    
@app.websocket("/ws/audio")
async def audio_ws(websocket: WebSocket):
    await websocket.accept()

    audio_buffer = bytearray()

    try:
        while True:
            msg = await websocket.receive()

            # Receive audio chunks
            if msg.get("bytes") is not None:
                audio_buffer.extend(msg["bytes"])

            # When frontend sends stop
            elif msg.get("text") is not None:
                data = json.loads(msg["text"])

                if data.get("type") == "stop":

                    # Save to temp file
                    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
                        f.write(audio_buffer)
                        temp_path = f.name

                    segments, info = await asyncio.to_thread(
                        model.transcribe,
                        temp_path,
                        language="en"
                    )

                    transcript = ""
                    for segment in segments:
                        transcript += segment.text   

                    await websocket.send_json({
                    "type": "final_transcript",
                    "text": transcript
                })

                # 2️⃣ Generate trainer reply (LLM)
                #reply = get_rag_answer(transcript)
                intent = detect_intent(transcript)
                if intent == "recommend": 
                    response = recommend_workout() 
                elif intent == "exercise": 
                    response = launch_exercise(transcript) 
                else: 
                    response = get_rag_answer(transcript) 
            
                if intent == "exercise":
                    await websocket.send_json(response)

                # 3️⃣ Send assistant reply
                if intent != "exercise":
                    await asyncio.sleep(0.02)
                    await websocket.send_json({
                        "type": "assistant",
                        "text": response
                    })

                os.remove(temp_path)

                audio_buffer = bytearray()

    except WebSocketDisconnect:
        pass


@app.websocket("/ws/trainer")
async def trainer_ws(websocket: WebSocket):
    print("🔌 Client connected to trainer websocket")
    await websocket.accept()

    try:
        while True:
            data = await websocket.receive_json()
            user_text = data["message"]
            assistantId = data["assistantId"]

            intent = detect_intent(user_text)
            if intent == "recommend": 
                response = recommend_workout() 
            elif intent == "exercise": 
                response = launch_exercise(user_text) 
            else: 
                response = get_rag_answer(user_text) 
            
            if intent == "exercise":
                await websocket.send_json(response)

            if intent != "exercise":
                for char in response:
                    await asyncio.sleep(0.02)
                    await websocket.send_json({
                        "type": "stream",
                        "token": char,
                        "assistantId": assistantId
                    })
            await websocket.send_json({"type": "done", "assistantId": assistantId})
    except WebSocketDisconnect:
        pass