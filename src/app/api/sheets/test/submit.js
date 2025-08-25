import { google } from "googleapis";

const serviceAccount = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON);

const auth = new google.auth.GoogleAuth({
  credentials: serviceAccount,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"]
});

const sheets = google.sheets({ version: "v4", auth });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    // Lấy dữ liệu từ form
    const { name, email, message } = req.body;

    // Ghi dữ liệu vào Google Sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "Sheet1!A:C", // thay đổi nếu bạn có nhiều cột
      valueInputOption: "RAW",
      requestBody: {
        values: [[name, email, message, new Date().toISOString()]],
      },
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error writing to Google Sheet:", error);
    res.status(500).json({ success: false, error: error.message });
  }
}