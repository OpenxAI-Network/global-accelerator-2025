from flask import Flask,render_template,request,jsonify
from flask_cors import CORS
import PyPDF2 as py
import google.generativeai as genai
ALLOWED_EXTENSION=['txt','pdf','png','jpg']
app=Flask(__name__)
CORS(app)
@app.route('/verify-pdf',methods=['POST'])
def upload_media():

    try:
        if request.method=='POST':
            # print("request",request.form)
            print("API HITTED")
            image=request.files['image']
            image_name=image.filename
            image.save(image_name)
            pdf=open(image_name,'rb')
            text=py.PdfReader(pdf)
            page1=text.pages[0]
            text=page1.extract_text()
            if("HealthifyMe" in text):
                return  {"success":True,"verified":True}
            genai.configure(api_key="AIzaSyA0t6gUe_PJqpKlapb3tC5QDIhNQJco22Y")
            model = genai.GenerativeModel("gemini-1.5-flash")
            response = model.generate_content(f"The Report is Orignal or not only tell true or false {text} ")
            text=response.text
            if(text[0]=='T'):
                return {"success":True,"verified":True}
            else:
                return {"success":True,"verified":False}
    except Exception as e:
        return {"success":False,"error":str(e)}

if __name__=="__main__":
    app.run(debug=True)