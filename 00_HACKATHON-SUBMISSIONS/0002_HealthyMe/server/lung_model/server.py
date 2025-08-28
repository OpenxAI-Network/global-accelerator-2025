from flask import Flask,render_template,request,jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
ALLOWED_EXTENSION=['txt','pdf','png','jpg']
import numpy as np
import cv2
from keras.models import load_model
# print(os.listdir('./server'))
# model=load_model("./server/lung_model/68_acc.h5")
model=load_model("/opt/render/project/src/server/lung_model/68_acc.h5")
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
            test_image=cv2.imread(image_name)
            test_image=cv2.resize(test_image,(150,150))
            test_image=test_image.reshape((1,150,150,3))
            val=model.predict(test_image)
            val=val[0][0]*100
            print(val)
            return {"Chance":val}
    except Exception as e:
        return {"error":str(e)}

if __name__=="__main__":
    app.run(debug=True)