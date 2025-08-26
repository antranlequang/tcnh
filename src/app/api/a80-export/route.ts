import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const secretKey = url.searchParams.get('key');
    
    if (secretKey !== 'admin-export-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({ 
      message: 'Export endpoint ready',
      instructions: 'Use POST method with localStorage data to export'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const secretKey = url.searchParams.get('key');
    
    if (secretKey !== 'admin-export-2024') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { comments } = body;

    if (!comments || !Array.isArray(comments)) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    const XLSX = require('xlsx');

    const worksheetData = comments.map((comment: any) => ({
      'Tên': comment.name,
      'MSSV': comment.studentId || '',
      'Email': comment.email || '',
      'Khoa': comment.faculty || '',
      'Lớp': comment.className || '',
      'Nội dung': comment.content,
      'Thời gian': new Date(comment.timestamp).toLocaleString('vi-VN')
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    
    const columnWidths = [
      { wch: 20 }, // Tên
      { wch: 15 }, // MSSV
      { wch: 25 }, // Email
      { wch: 20 }, // Khoa
      { wch: 15 }, // Lớp
      { wch: 50 }, // Nội dung
      { wch: 20 }  // Thời gian
    ];
    worksheet['!cols'] = columnWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'A80 Comments');

    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    const fileName = `a80-comments-${new Date().toISOString().split('T')[0]}.xlsx`;

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });

  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}