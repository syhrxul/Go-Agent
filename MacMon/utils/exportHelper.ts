import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import XLSX from 'xlsx';

// Tipe data dari Context
import { Transaction, Budget } from '@/context/FinanceContext';

// Helper Format Rupiah
const formatRupiah = (num: number) => 'Rp ' + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

// --- 1. EXPORT TO PDF (Desain Lucu & Keren) ---
export const exportToPDF = async (
  transactions: Transaction[], 
  balance: number, 
  savings: number, 
  budgets: Budget[]
) => {
  const dateStr = new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  // Hitung Total Pemasukan & Pengeluaran
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  // HTML Template (Desain Cute & Clean)
  const htmlContent = `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
          body { font-family: 'Poppins', sans-serif; color: #444; padding: 20px; background-color: #fff; }
          
          /* Header Lucu */
          .header { text-align: center; margin-bottom: 30px; background-color: #FFDEE9; background-image: linear-gradient(0deg, #FFDEE9 0%, #B5FFFC 100%); padding: 30px; border-radius: 20px; }
          h1 { margin: 0; color: #555; font-size: 24px; }
          .subtitle { color: #777; font-size: 14px; margin-top: 5px; }

          /* Kartu Ringkasan */
          .summary-container { display: flex; justify-content: space-between; margin-bottom: 20px; gap: 10px; }
          .card { flex: 1; padding: 15px; border-radius: 15px; text-align: center; }
          .card-income { background-color: #E8F5E9; color: #2E7D32; }
          .card-expense { background-color: #FFEBEE; color: #C62828; }
          .card-balance { background-color: #E3F2FD; color: #1565C0; }
          .big-text { font-size: 18px; fontWeight: bold; margin-top: 5px; }

          /* Tabel Transaksi */
          table { width: 100%; border-collapse: collapse; margin-top: 10px; border-radius: 10px; overflow: hidden; }
          th { background-color: #6C5CE7; color: white; padding: 12px; text-align: left; font-size: 12px; }
          td { padding: 10px; border-bottom: 1px solid #eee; font-size: 12px; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          
          .amount-in { color: #27ae60; font-weight: bold; }
          .amount-out { color: #e74c3c; font-weight: bold; }
          .badge { padding: 3px 8px; border-radius: 10px; font-size: 10px; background: #eee; color: #555; }

          .section-title { margin-top: 30px; font-size: 16px; font-weight: bold; color: #6C5CE7; border-bottom: 2px solid #a29bfe; padding-bottom: 5px; display: inline-block; }
          
          .footer { margin-top: 50px; text-align: center; font-size: 10px; color: #aaa; }
        </style>
      </head>
      <body>
        
        <div class="header">
          <h1>✨ Laporan Keuangan ✨</h1>
          <div class="subtitle">${dateStr}</div>
        </div>

        <div class="summary-container">
          <div class="card card-income">
            <div>Pemasukan</div>
            <div class="big-text">+ ${formatRupiah(totalIncome)}</div>
          </div>
          <div class="card card-expense">
            <div>Pengeluaran</div>
            <div class="big-text">- ${formatRupiah(totalExpense)}</div>
          </div>
        </div>
        
        <div class="summary-container">
           <div class="card card-balance">
            <div>Sisa Saldo</div>
            <div class="big-text">${formatRupiah(balance)}</div>
          </div>
           <div class="card" style="background-color: #FFF3E0; color: #EF6C00;">
            <div>Tabungan</div>
            <div class="big-text">${formatRupiah(savings)}</div>
          </div>
        </div>

        <div class="section-title">📊 Riwayat Transaksi</div>
        <table>
          <tr>
            <th>Tanggal</th>
            <th>Keterangan</th>
            <th>Kategori</th>
            <th style="text-align: right;">Jumlah</th>
          </tr>
          ${transactions.map(t => `
            <tr>
              <td>${new Date(t.date).toLocaleDateString('id-ID')}</td>
              <td>${t.title}</td>
              <td>${t.category ? `<span class="badge">${t.category}</span>` : '-'}</td>
              <td style="text-align: right;" class="${t.type === 'income' ? 'amount-in' : 'amount-out'}">
                ${t.type === 'income' ? '+' : '-'} ${formatRupiah(t.amount)}
              </td>
            </tr>
          `).join('')}
        </table>

        <div class="footer">
          Dibuat otomatis oleh Aplikasi MacMon 🚀
        </div>

      </body>
    </html>
  `;

  // Generate & Share PDF
  try {
    const { uri } = await Print.printToFileAsync({ html: htmlContent });
    await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
  } catch (error) {
    console.log("Error generating PDF:", error);
  }
};

// --- 2. EXPORT TO EXCEL (Rapi & Mudah Dibaca) ---
export const exportToExcel = async (transactions: Transaction[]) => {
  // 1. Format Data agar Rapi di Excel
  const data = transactions.map(t => ({
    Tanggal: new Date(t.date).toLocaleDateString('id-ID') + ' ' + new Date(t.date).toLocaleTimeString('id-ID'),
    Jenis: t.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
    Keterangan: t.title,
    Kategori: t.category || '-',
    Nominal: t.amount,
  }));

  // 2. Buat Worksheet
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Laporan Keuangan");

  // 3. Generate File Excel (Base64)
  const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const uri = FileSystem.cacheDirectory + 'laporan_keuangan.xlsx';

  // 4. Simpan & Share
  try {
    await FileSystem.writeAsStringAsync(uri, wbout, { encoding: FileSystem.EncodingType.Base64 });
    await Sharing.shareAsync(uri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: 'Download Laporan Excel',
      UTI: 'com.microsoft.excel.xlsx'
    });
  } catch (error) {
    console.log("Error exporting Excel:", error);
  }
};