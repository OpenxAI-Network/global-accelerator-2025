import { useState } from 'react'
import { Loader2, Download } from 'lucide-react'

export function RecordModal({ record, onClose }:any) {
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownload = async () => {
    setIsDownloading(true)
    // Simulate download delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    // Here you would typically fetch the actual file and trigger a download
    setIsDownloading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-bold text-gray-800 mb-4">{record.title}</h3>
        <div className="relative h-64 mb-4">
          <img
            src={record.imageUrl}
            alt={record.title}
            className="object-contain rounded-lg w-full h-full"
          />
        </div>
        <p className="text-gray-600 mb-2">Date: {record.date}</p>
        <p className="text-gray-600 mb-2">Expiry: {record.expiry}</p>
        <p className="text-gray-600 mb-4">Status: {record.status}</p>
        <div className="flex justify-between">
          <button
            className="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-300 flex items-center"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-2" />
                Download
              </>
            )}
          </button>
          <button
            className="py-2 px-4 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors duration-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

