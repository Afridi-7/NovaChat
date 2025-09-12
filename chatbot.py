# from langchain_google_genai import ChatGoogleGenerativeAI
# from langchain_core.runnables.history import RunnableWithMessageHistory
# from langchain_community.chat_message_histories import ChatMessageHistory
# from langchain_core.prompts import load_prompt
# from dotenv import load_dotenv

# load_dotenv()

# model = ChatGoogleGenerativeAI(model="gemini-1.5-flash")


# prompt = load_prompt("template.json")

# # Memory store (per user/session)
# store = {}

# def get_history(session_id: str) -> ChatMessageHistory:
#     if session_id not in store:
#         store[session_id] = ChatMessageHistory()
#     return store[session_id]
# # Combine LLM + prompt + memory
# conversation = RunnableWithMessageHistory(
#     prompt | model,
#     get_history,
#     input_messages_key="input",   # where user input goes
#     history_messages_key="history" # where chat history is stored
# )

# # Chat loop
# session_id = "afridi-session"


# while True:
#     user_input = input("You: ")
#     if user_input.lower() in ['exit', 'quit']:
#         break
#     try:
#         response = conversation.invoke(
#         {"input": user_input},
#         config={"configurable": {"session_id": session_id}}
#         )
#         print("Chatbot: ",response["content"] if isinstance(response, dict) else response.content)

#     except Exception as e:
#          print("⚠️ Error:", str(e))



from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.prompts import load_prompt
from dotenv import load_dotenv

load_dotenv()

model = ChatGoogleGenerativeAI(model="gemini-1.5-flash")
prompt = load_prompt("template.json")

store = {}

def get_history(session_id: str) -> ChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]

conversation = RunnableWithMessageHistory(
    prompt | model,
    get_history,
    input_messages_key="input",
    history_messages_key="history"
)

def chat(session_id: str, user_input: str) -> str:
    """One chat turn → returns AI reply text only"""
    response = conversation.invoke(
        {"input": user_input},
        config={"configurable": {"session_id": session_id}}
    )
    return response["content"] if isinstance(response, dict) else response.content


# 🟢 Only run the loop if file is executed directly, not when imported
if __name__ == "__main__":
    session_id = "afridi-session"
    while True:
        user_input = input("You: ")
        if user_input.lower() in ["exit", "quit"]:
            break
        try:
            reply = chat(session_id, user_input)
            print("Chatbot:", reply)
        except Exception as e:
            print("⚠️ Error:", str(e))


