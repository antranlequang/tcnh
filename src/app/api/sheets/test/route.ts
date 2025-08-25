import { NextRequest, NextResponse } from 'next/server';
import { getSheetData } from '@/lib/google-sheets';
import { google } from "googleapis";

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON);

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

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
