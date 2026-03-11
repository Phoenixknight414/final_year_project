import os
import hashlib
import json
from groq import Groq
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import TextLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from dotenv import load_dotenv
load_dotenv()


# ===== CONFIG =====
DATA_FOLDER = "data"
INDEX_FOLDER = "faiss_index"
HASH_FILE = os.path.join(INDEX_FOLDER, "hash.txt")


# ===== Initialize Groq client =====
client = Groq(
    api_key = os.getenv("GROQ_API_KEY")
)


# ===== Load embeddings =====
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

# ===== Function to calculate folder hash =====
def calculate_folder_hash(folder):
    hash_md5 = hashlib.md5()

    if not os.path.exists(folder):
        return ""

    for root, dirs, files in os.walk(folder):
        for file in sorted(files):
            if file.endswith(".txt"):
                path = os.path.join(root, file)
                with open(path, "rb") as f:
                    hash_md5.update(f.read())

    return hash_md5.hexdigest()


# ===== Load or rebuild FAISS =====
def load_or_build_faiss():

    current_hash = calculate_folder_hash(DATA_FOLDER)

    # If index exists and hash matches → load
    if os.path.exists(INDEX_FOLDER) and os.path.exists(HASH_FILE):

        with open(HASH_FILE, "r") as f:
            saved_hash = f.read()

        if saved_hash == current_hash:
            print("✅ Using existing FAISS index")
            return FAISS.load_local(
                INDEX_FOLDER,
                embeddings,
                allow_dangerous_deserialization=True
            )

    # Otherwise rebuild index
    print("🔄 Exercise folder changed. Rebuilding FAISS index...")

    documents = []

    for file in os.listdir(DATA_FOLDER):
        if file.endswith(".txt"):
            loader = TextLoader(os.path.join(DATA_FOLDER, file))
            documents.extend(loader.load())

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    docs = splitter.split_documents(documents)

    vectorstore = FAISS.from_documents(docs, embeddings)

    vectorstore.save_local(INDEX_FOLDER)

    os.makedirs(INDEX_FOLDER, exist_ok=True)

    with open(HASH_FILE, "w") as f:
        f.write(current_hash)

    print("✅ FAISS index rebuilt")

    return vectorstore


# ===== Load FAISS automatically =====
vectorstore = load_or_build_faiss()

retriever = vectorstore.as_retriever(search_kwargs={"k": 10})

# profile loadre function
def load_user_profile():
    try:
        with open("user_profile.json", "r") as f:
            return json.load(f)
    except:
        return {}

# ===== RAG function =====
def get_rag_answer(query):

    docs = retriever.invoke(query)

    context = "\n".join([doc.page_content for doc in docs]) if docs else ""

    profile = load_user_profile()

    profile_context = f"""
User Profile:
Name: {profile.get("name", "")}
Goal: {profile.get("goal", "")}
Experience: {profile.get("experience", "")}
Weekly Frequency: {profile.get("weekly_frequency", "")}
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "You are an AI gym trainer. Use exercise data AND user profile to answer."
            },
            {
                "role": "user",
                "content": f"""
{profile_context}

Exercise data:
{context}

Question:
{query}
"""
            }
        ],
        temperature=0.3
    )

    return response.choices[0].message.content