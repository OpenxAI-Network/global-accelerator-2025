import { NextRequest, NextResponse } from 'next/server'
import pool from '../../../../lib/database'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const { content } = await req.json()

    if (!pool) {
      // Demo mode - just return success since localStorage is handled on client side
      return NextResponse.json({ 
        success: true, 
        message: 'Answer updated successfully',
        demo: true 
      })
    }

    const query = `
      UPDATE answers 
      SET content = $1, updated_at = NOW()
      WHERE id = $2
    `
    await pool.query(query, [content, id])

    return NextResponse.json({ 
      success: true, 
      message: 'Answer updated successfully' 
    })
  } catch (error) {
    console.error('Error updating answer:', error)
    return NextResponse.json(
      { success: false, message: 'Error updating answer' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!pool) {
      // Demo mode - just return success since localStorage is handled on client side
      return NextResponse.json({ 
        success: true, 
        message: 'Answer deleted successfully',
        demo: true 
      })
    }

    await pool.query('DELETE FROM answers WHERE id = $1', [id])

    return NextResponse.json({ 
      success: true, 
      message: 'Answer deleted successfully' 
    })
  } catch (error) {
    console.error('Error deleting answer:', error)
    return NextResponse.json(
      { success: false, message: 'Error deleting answer' },
      { status: 500 }
    )
  }
}
