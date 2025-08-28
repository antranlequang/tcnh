import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    // Fetch all submissions from Supabase
    const { data: submissions, error } = await supabase
      .from('submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching submissions:', error);
      return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
    }

    // Prepare data for Excel export
    const excelData = submissions.map((submission, index) => ({
      'STT': index + 1,
      'Tên': submission.name,
      'MSSV': submission.student_id || '',
      'Lớp': submission.class_name || '',
      'Khoa': submission.faculty || '',
      'Email': submission.email || '',
      'Nội dung': submission.content,
      'Ẩn danh': submission.is_anonymous ? 'Có' : 'Không',
      'Có hình ảnh': submission.image_url ? 'Có' : 'Không',
      'URL hình ảnh': submission.image_url || '',
      'Thời gian tạo': new Date(submission.created_at).toLocaleString('vi-VN'),
      'ID': submission.id
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths for better readability
    const colWidths = [
      { wch: 5 },   // STT
      { wch: 20 },  // Tên
      { wch: 12 },  // MSSV
      { wch: 15 },  // Lớp
      { wch: 30 },  // Khoa
      { wch: 25 },  // Email
      { wch: 50 },  // Nội dung
      { wch: 10 },  // Ẩn danh
      { wch: 12 },  // Có hình ảnh
      { wch: 40 },  // URL hình ảnh
      { wch: 20 },  // Thời gian tạo
      { wch: 40 }   // ID
    ];
    worksheet['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'A80 Submissions');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { 
      type: 'buffer', 
      bookType: 'xlsx' 
    });

    // Create filename with current date
    const currentDate = new Date().toISOString().split('T')[0];
    const filename = `a80-submissions-${currentDate}.xlsx`;

    // Return Excel file
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': excelBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error in GET /api/a80/export:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}