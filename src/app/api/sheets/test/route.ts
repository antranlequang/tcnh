import { NextRequest, NextResponse } from 'next/server';
import { getSheetData } from '@/lib/google-sheets';

export async function GET(request: NextRequest) {
  try {
    const data = await getSheetData();
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Data retrieved successfully'
    });
  } catch (error) {
    console.error('Error in sheets test API:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Failed to retrieve data from Google Sheets'
    }, { status: 500 });
  }
}
