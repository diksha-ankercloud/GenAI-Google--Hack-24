import os
from dotenv import load_dotenv
import base64
from langchain_core.prompts import HumanMessagePromptTemplate, ChatPromptTemplate
from langchain_core.messages import SystemMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from vertexai.preview.generative_models import grounding as preview_grounding
import vertexai
from vertexai.generative_models import (
    GenerativeModel,
    Tool,
    grounding,
)
from flask import Flask, request, jsonify

app = Flask(__name__)

# Load environment variables
load_dotenv()

def initialize_environment():
    """Initialize environment variables and Google Cloud settings."""
    os.environ['GOOGLE_APPLICATION_CREDENTIALS'] = "C:/Users/DELL/Downloads/13-Google-GenAI-Hack-24/GenAI-Google--Hack-24/vision-forge-414908-d792f2fc2ff6.json"
    
    PROJECT_ID = "vision-forge-414908"
    REGION = "us-central1"
    vertexai.init(project=PROJECT_ID, location=REGION)

def create_genai_model():
    """Create and return a GenerativeModel instance."""
    return GenerativeModel("gemini-1.5-flash-001")

def get_product_info(product):
    """Retrieve product information using Google Search Retrieval."""
    model_ground = create_genai_model()
    prompt = f"only give me the nutritional (benefits/harms) content regarding the consumption of {product}. Also if there is any recent news regarding if the {product} has some false claims. Also find if the product is from a small business or not."
    tool = Tool.from_google_search_retrieval(grounding.GoogleSearchRetrieval())
    response = model_ground.generate_content(prompt, tools=[tool])
    return response.candidates[0].content.parts[0].text

def create_chat_model():
    """Create and return a ChatGoogleGenerativeAI instance."""
    return ChatGoogleGenerativeAI(
        model="gemini-1.5-flash-001",
        temperature=0,
        max_tokens=None,
        timeout=None,
        max_retries=2
    )

def create_chat_prompt():
    """Create and return a ChatPromptTemplate instance."""
    return ChatPromptTemplate.from_messages([
        SystemMessage(content='''You are a well-experienced dietician and nutritionist. You will be given the age, height, weight, and dietary precautions and goals of the person.
                        You will be given a product and its ingredients to analyze. The goal is to categorize how often the product can be consumed, whether it fits the user's diet, and if it follows sustainability practices. 
                        Respond based on health analysis using appropriate tags.'''),
        HumanMessagePromptTemplate.from_template(
            template='''The person's info is:
                Age: {age}, Gender: {gender}, Weight: {weight}, Height: {height}, Dietary Type: {diet_type}, Health Goal: {health_goal}, Allergens: {allergen}.
                Product info: {product_info_str}, Image: {image_data}'''
        ),
    ])

def process_image(image_file):
    """Process the uploaded image file and return base64 encoded data."""
    return base64.b64encode(image_file.read()).decode("utf-8")

def analyze_product(user_info, product_info, image_data):
    """Analyze the product based on user info and product details."""
    chat_model = create_chat_model()
    chat_prompt = create_chat_prompt()
    chain = chat_prompt | chat_model

    response = chain.invoke({
        "image_data": image_data,
        "age": user_info["age"],
        "weight": user_info["weight"],
        "gender": user_info["gender"],
        "height": user_info["height"],
        "diet_type": user_info["diet_type"],
        "health_goal": user_info["health_goal"],
        "allergen": user_info["allergen"],
        "product_info_str": product_info
    })

    return response.content

@app.route('/analyze_product', methods=['POST'])
def analyze_product_endpoint():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No JSON data provided"}), 400

    user_info = {
        "age": data.get('age'),
        "weight": data.get('weight'),
        "gender": data.get('gender'),
        "height": data.get('height'),
        "diet_type": data.get('diet_type'),
        "health_goal": data.get('health_goal'),
        "allergen": data.get('allergen')
    }
    
    product_name = data.get('product_name')
    image_data_base64 = data.get('image_data')

    if not product_name or not image_data_base64:
        return jsonify({"error": "Missing required parameters: product_name or image_data"}), 400

    product_info = get_product_info(product_name)
    result = analyze_product(user_info, product_info, image_data_base64)

    return jsonify({"analysis": result})

if __name__ == "__main__":
    initialize_environment()
    app.run(host='0.0.0.0', port=5000, debug=True)
