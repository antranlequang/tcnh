import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Lazy initialization to avoid build-time errors
let auth: any;
let sheets: any;

function initializeGoogleSheets() {
  if (!auth) {
    // Kiểm tra biến môi trường
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT_KEY_JSON is not set');
    }
    if (!process.env.GOOGLE_SHEET_ID) {
      throw new Error('GOOGLE_SHEET_ID is not set');
    }

    // Parse service account JSON từ biến môi trường
    const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON);

    // Cấu hình Google Sheets API client
    auth = new google.auth.GoogleAuth({
      credentials: {
        ...serviceAccount,
        private_key: serviceAccount.private_key.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    sheets = google.sheets({ version: 'v4', auth });
  }
  return { auth, sheets };
}

// GET: Lấy dữ liệu từ Google Sheets
export async function GET(req: NextRequest) {
  try {
    const { sheets } = initializeGoogleSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:C', // chỉnh lại nếu cần
    });

    return NextResponse.json({
      success: true,
      data: response.data.values || [],
      message: 'Data retrieved successfully',
    });
  } catch (error) {
    console.error('Error reading Google Sheet:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to retrieve data from Google Sheets',
      },
      { status: 500 }
    );
  }
}

// POST: Ghi dữ liệu vào Google Sheets
export async function POST(req: NextRequest) {
  try {
    const { sheets } = initializeGoogleSheets();
    const body = await req.json();
    const { name, email, message } = body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: 'Sheet1!A:C', // chỉnh lại nếu cần
      valueInputOption: 'RAW',
      requestBody: {
        values: [[name, email, message, new Date().toISOString()]],
      },
    });

    return NextResponse.json({ success: true, message: 'Data submitted successfully' });
  } catch (error) {
    console.error('Error writing to Google Sheet:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to submit data to Google Sheets',
      },
      { status: 500 }
    );
  }
}