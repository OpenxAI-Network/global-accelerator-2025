from flask import Flask,render_template,request,jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
ALLOWED_EXTENSION=['txt','pdf','png','jpg','wav','mp3','mp4','mpeg']
import numpy as np
import librosa
import cv2
from keras.models import load_model
# print(os.listdir("./server/heatbeat_pred/68_acc.h5"))
model=load_model("./server/lung_model/heartbeat_model.h5")

app=Flask(__name__)
CORS(app)
def librosa_extractor(filename):
    try:
        librosa_data,libraosa_sample_rate=librosa.load(filename)
        mfcc_extracted=librosa.feature.mfcc(y=librosa_data,sr=libraosa_sample_rate,n_mfcc=40)
        mfcc_transformed=np.mean(mfcc_extracted.T,axis=0)
        return mfcc_transformed
    except Exception as e:
        print(e)
        return None
@app.route('/',methods=['POST'])
def upload_media():
    
    try:
        if request.method=='POST':
            # print("request",request.form)
            print("API HITTED")
            
            audio=request.files['audio']
            print(audio)
            audio_name=audio.filename
            audio.save(audio_name)
            audio_extractor_features=librosa_extractor(audio_name)
            predict_data=np.array(audio_extractor_features)
            predict_data=predict_data.reshape((1,40))
            my_pred=model.predict(predict_data)
            val=np.argmax(my_pred)
            if(val==0):
                val="Healthy"
            else:
                val="UnHealthy"
            print(val)
            return {"success":True,"Chance":val}
    except Exception as e:
        return {"success":False,"error":str(e)}

if __name__=="__main__":
    app.run(debug=True,port=7000)