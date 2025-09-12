'use client'

import { useState } from 'react'

export default function UploadTest() {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<string>('')

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setResult('')

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('classId', 'finc3012')
      formData.append('title', 'FINC3017 Assessment Information')
      formData.append('documentType', 'syllabus')
      formData.append('uploaderId', 'cme3vycms0001ocl4sv9dagsd')

      const response = await fetch('/api/upload-documents', {
        method: 'POST',
        body: formData,
      })

      const data = await response.text()
      setResult(data)

      if (response.ok) {
        setResult('✅ RTF Upload Successful! Document processed and saved.')
      } else {
        setResult(`❌ Upload failed: ${data}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">RTF Upload Test</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select RTF File
              </label>
              <input
                type="file"
                accept=".rtf,.pdf,.doc,.docx,.txt"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {file && (
              <div className="p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Selected:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Type:</strong> {file.type || 'Unknown'}
                </p>
              </div>
            )}

            <button
              onClick={handleUpload}
              disabled={!file || uploading}
              className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload RTF Document'}
            </button>

            {result && (
              <div className="p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium mb-2">Result:</h3>
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">{result}</pre>
              </div>
            )}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">Test Instructions:</h3>
            <ol className="text-sm text-blue-800 space-y-1">
              <li>1. Select your RTF file using the file picker above</li>
              <li>2. Click "Upload RTF Document" to test the functionality</li>
              <li>3. The system will extract text from the RTF and save it to the database</li>
              <li>4. Check the result message for success/failure status</li>
            </ol>
          </div>

          <div className="mt-4">
            <a 
              href="/class/finc3012" 
              className="text-blue-600 hover:text-blue-800 underline"
            >
              ← Back to Class Page
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
