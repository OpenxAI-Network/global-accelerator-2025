from flask import Flask,render_template,request,jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
ALLOWED_EXTENSION=['txt','pdf','png','jpg']
import numpy as np
import cv2
from keras.models import load_model
print(os.listdir('./server'))
model=load_model("./server/bone_detect_pred/bone_fracture.h5")
app=Flask(__name__)
CORS(app)
@app.route('/',methods=['POST'])
def upload_media():
    
    try:
        if request.method=='POST':
            # print("request",request.form)
            print("API HITTED")
            image=request.files['image']
            image_name=image.filename
            image.save(image_name)
            image = cv2.imread(image_name)  # Read the image in BGR format
            image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)  # Convert to RGB
            image = cv2.resize(image, (250, 250))  # Resize to the model's 
            grayscale_image = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            grayscale_image = grayscale_image.reshape((1, 250, 250, 1))
            grayscale_image = grayscale_image.astype('float32') / 255.0
            predictions = model.predict(grayscale_image)
            val=predictions[0][0]*100
            print(val)
            return {"Chance":val}
    except Exception as e:
        return {"error":str(e)}

if __name__=="__main__":
    app.run(debug=True,port=1234)