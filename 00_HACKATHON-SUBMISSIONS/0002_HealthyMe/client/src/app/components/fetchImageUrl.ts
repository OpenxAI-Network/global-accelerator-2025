const fetchImageURL=async(imageUrl:string,fileInput:any)=>{
    // const fileInput:any = document.getElementById("fileInput"); 
        console.log("My File Input is:::::::::",fileInput);
        if (fileInput!=null) {
            const file = fileInput.files[0];
            console.log("my File is:::::::::"+file);
            const formData = new FormData();
            formData.append("file", file);
            try {
              const response = await  fetch("http://localhost:3000/api/firebase", {
                method: "POST",
                body: formData // Ensure formData is an instance of FormData
              });
            
              const data = await response.json();
              console.log("My Data Coming OutSide is::::", data);
            
              return data.url;
            } catch (error) {
              console.error("Error:", error);
              return "NO PHOTO";
            }
            
  }
}
export default fetchImageURL