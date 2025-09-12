import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const content = searchParams.get('content')
    const documentType = searchParams.get('type')
    const title = searchParams.get('title')

    if (!content) {
      return NextResponse.json({ error: 'Document content is required' }, { status: 400 })
    }

    const fileContent = `// Source Document from AI Assistant
// Document Type: ${documentType || 'Unknown'}
// Title: ${title || 'Unknown'}
// Generated on: ${new Date().toISOString()}

${content}

// End of source document
`
    const response = new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${params.filename}"`,
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
    return response
  } catch (error) {
    console.error('Error serving source document:', error)
    return NextResponse.json({ error: 'Failed to serve source document' }, { status: 500 })
  }
}
