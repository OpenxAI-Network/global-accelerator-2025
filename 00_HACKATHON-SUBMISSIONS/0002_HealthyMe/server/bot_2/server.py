from flask import Flask, request, jsonify
from transformers import AutoModelForCausalLM, AutoTokenizer
from flask_cors import CORS, cross_origin
# Initialize the Flask app
app = Flask(__name__)
cors = CORS(app) # allow CORS for all domains on all routes.
app.config['CORS_HEADERS'] = 'Content-Type'

# Load the tokenizer and model
tokenizer = AutoTokenizer.from_pretrained("openai-community/gpt2")
model = AutoModelForCausalLM.from_pretrained("./server/bot_2/models/")  # Ensure "models" is the correct path

# Define a route for text generation
@app.route('/generate', methods=['POST'])
def generate_text():
    try:
        # Get the prompt from the POST request
        data = request.json
        print("My data is::::",data)
        if not data or 'prompt' not in data:
            return jsonify({"success": False, "error": "Missing 'prompt' in request"}), 400
        
        prompt = data['prompt']

        # Tokenize and generate response
        prompt_embeddings = tokenizer(prompt, return_tensors="pt")
        res = model.generate(
            **prompt_embeddings,
            max_length=70,  # Adjust as needed
            num_beams=5,
            no_repeat_ngram_size=2,
            early_stopping=True
        )

        # Decode the response
        output = tokenizer.decode(res[0], skip_special_tokens=True)
    
        output=output[len(prompt):-1]
        # Return the response
        return jsonify({"success": True, "response": output}),200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Run the Flask app
if __name__ == '__main__':
    app.run(port=1234,debug=True)
