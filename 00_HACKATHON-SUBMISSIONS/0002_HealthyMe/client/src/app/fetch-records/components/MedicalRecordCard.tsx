import { useEffect, useState } from "react";
import fetchImageUrl from "./fetchImageUrl";

export function MedicalRecordCard({ record}:any) {
  console.log("My Medical Record Download is:::::", record.recordUrl);

  const [imgUrl, setImgUrl] = useState("");
  const [isDownloading, setIsDownloading] = useState(false); // Track download state

  useEffect(() => {
    async function fetchUrl() {
      const url:any = await fetchImageUrl(record.recordUrl); // Fetch the IPFS URL
      setImgUrl(url);
    }
    fetchUrl();
  }, [record.recordUrl]);

  const handleDownload = () => {
    if (imgUrl) {
      setIsDownloading(true); // Start the download animation
      const link = document.createElement('a');
      link.href = imgUrl;
      link.download = record.title; // Set the default filename for the downloaded file
      link.click(); // Trigger the download
      link.remove(); // Clean up after the download trigger
      setIsDownloading(false); // End the download animation
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
    >
      <div className="relative h-40">
        <img
          src="https://health-e.in/wp-content/uploads/2023/09/medical-records.webp"
          alt={record.title}
          className="object-cover w-full h-full"
        />
      </div>
      <div className="p-4">
        <h4 className="text-lg font-semibold text-gray-800 mb-2">{record.title}</h4>
        <p className="text-sm text-gray-600">Date: {record.checkupDate}</p>
        <p className="text-sm text-gray-600">Expiry: {record.expiryDate}</p>
        <p className="text-sm text-gray-600">Record Id: {record.rId}</p>
      </div>
      <button
        style={{
          background: "linear-gradient(135deg, rgb(45, 206, 137) 0%, rgb(0, 147, 233) 100%)",
        }}
        className="relative rounded-md px-4 py-3 text-base font-medium text-white transition-colors hover:[text-shadow:0_0_10px_#fff] ml-5 mb-2"
        onClick={handleDownload}
      >
        {isDownloading ? (
          <div className="animate-spin w-6 h-6 border-t-4 border-white border-solid rounded-full border-t-transparent mx-auto"></div>
        ) : (
          "Download"
        )}
      </button>
    </div>
  );
}
