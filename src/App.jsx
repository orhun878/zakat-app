import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Trash2, ClipboardCopy, Users, Coins, Wheat, RefreshCcw, AlertTriangle, FileSpreadsheet } from 'lucide-react';

const App = () => {
  // Mengambil data dari localStorage saat pertama kali load
  const [dataZakat, setDataZakat] = useState(() => {
    const saved = localStorage.getItem('zakat_baiturrahim_data');
    return saved ? JSON.parse(saved) : [];
  });

  const [formData, setFormData] = useState({
    nama: '',
    jumlahJiwa: 1,
    jenisZakat: 'Beras', // Opsi Beras langsung tampil pertama
    keterangan: 'Lunas'
  });

  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const NOMINAL_UANG = 40000;
  const NOMINAL_BERAS = 2.5;

  // Menyimpan data ke localStorage setiap kali ada perubahan pada dataZakat
  useEffect(() => {
    localStorage.setItem('zakat_baiturrahim_data', JSON.stringify(dataZakat));
  }, [dataZakat]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.nama) return;

    const newEntry = {
      id: Date.now(),
      ...formData,
      totalZakat: formData.jenisZakat === 'Uang' 
        ? formData.jumlahJiwa * NOMINAL_UANG 
        : formData.jumlahJiwa * NOMINAL_BERAS
    };

    setDataZakat([newEntry, ...dataZakat]);
    // Reset form ke nilai default (Beras)
    setFormData({ ...formData, nama: '', jumlahJiwa: 1, jenisZakat: 'Beras', keterangan: 'Lunas' });
  };

  const deleteEntry = (id) => {
    setDataZakat(dataZakat.filter(item => item.id !== id));
  };

  const resetAllData = () => {
    setDataZakat([]);
    setShowConfirmReset(false);
  };

  const totals = useMemo(() => {
    return dataZakat.reduce((acc, curr) => {
      if (curr.jenisZakat === 'Uang') {
        acc.uang += curr.totalZakat;
      } else {
        acc.beras += curr.totalZakat;
      }
      acc.jiwa += parseInt(curr.jumlahJiwa);
      return acc;
    }, { uang: 0, beras: 0, jiwa: 0 });
  }, [dataZakat]);

  const copyToWhatsApp = () => {
    if (dataZakat.length === 0) {
      alert('Belum ada data untuk disalin.');
      return;
    }

    let text = `📋 *LAPORAN PENERIMAAN ZAKAT FITRAH*\n📌 *Masjid Baiturrahim*\n━━━━━━━━━━━━━━━━━━━\n\n`;
    
    dataZakat.forEach((item, index) => {
      text += `${index + 1}. *${item.nama}*\n`;
      text += `   ↳ *Jiwa:* ${item.jumlahJiwa} Orang\n`;
      text += `   ↳ *Total:* ${item.jenisZakat === 'Uang' ? 'Rp ' + item.totalZakat.toLocaleString() : item.totalZakat + ' Kg Beras'}\n`;
      text += `   ↳ *Ket:* ${item.keterangan}\n\n`;
    });

    text += `━━━━━━━━━━━━━━━━━━━\n`;
    text += `✅ *REKAPITULASI AKHIR:*\n`;
    text += `👥 Total Jiwa: ${totals.jiwa} Orang\n`;
    text += `💰 Total Uang: Rp ${totals.uang.toLocaleString()}\n`;
    text += `🌾 Total Beras: ${totals.beras.toFixed(1)} Kg\n`;

    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    
    alert('Format laporan WhatsApp berhasil disalin!');
  };

  const exportToCSV = () => {
    if (dataZakat.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    // Header CSV
    const headers = ['Nama Muzakki', 'Jumlah Jiwa', 'Jenis Zakat', 'Total Nominal/Berat', 'Keterangan', 'Waktu'];
    
    // Baris data
    const rows = dataZakat.map(item => [
      `"${item.nama}"`,
      item.jumlahJiwa,
      item.jenisZakat,
      item.jenisZakat === 'Uang' ? item.totalZakat : `${item.totalZakat} Kg`,
      item.keterangan,
      new Date(item.id).toLocaleString('id-ID')
    ]);

    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Zakat_Baiturrahim_${new Date().toLocaleDateString('id-ID')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-green-600 text-white p-6 rounded-2xl shadow-lg mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold mb-1">Buku Kas Zakat Baiturrahim</h1>
            <p className="text-sm opacity-90">Pencatatan Digital Zakat Fitrah 1447 H</p>
          </div>
          <button 
            onClick={() => setShowConfirmReset(true)}
            className="p-2 bg-green-700 hover:bg-red-600 rounded-lg transition-colors group"
            title="Reset Semua Data"
          >
            <RefreshCcw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
          </button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-500 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Jiwa</p>
              <p className="text-xl font-bold">{totals.jiwa}</p>
            </div>
            <Users className="text-blue-500 opacity-20" size={40} />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-green-500 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Uang</p>
              <p className="text-xl font-bold">Rp {totals.uang.toLocaleString()}</p>
            </div>
            <Coins className="text-green-500 opacity-20" size={40} />
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-orange-500 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Beras</p>
              <p className="text-xl font-bold">{totals.beras.toFixed(1)} Kg</p>
            </div>
            <Wheat className="text-orange-500 opacity-20" size={40} />
          </div>
        </div>

        {/* Form Input */}
        <div className="bg-white p-6 rounded-2xl shadow-sm mb-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
            <Plus size={20} className="text-green-600" /> Input Data Muzakki
          </h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nama Muzakki</label>
              <input 
                type="text" 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                placeholder="Contoh: Izza Ramadhan"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jumlah Jiwa</label>
              <input 
                type="number" 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition"
                value={formData.jumlahJiwa}
                min="1"
                onChange={(e) => setFormData({...formData, jumlahJiwa: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Jenis Zakat</label>
              <select 
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none transition appearance-none"
                value={formData.jenisZakat}
                onChange={(e) => setFormData({...formData, jenisZakat: e.target.value})}
              >
                <option value="Beras">Beras (2,5 Kg)</option>
                <option value="Uang">Uang (Rp 40.000)</option>
              </select>
            </div>
            <div className="flex items-end">
              <button 
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-md shadow-green-100 transition duration-200 flex items-center justify-center gap-2"
              >
                <Plus size={18} /> Simpan Data
              </button>
            </div>
          </form>
        </div>

        {/* List Data */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 md:p-6 border-b flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50/50">
            <h2 className="text-lg font-semibold text-gray-800">Daftar Rekapitulasi</h2>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button 
                onClick={exportToCSV}
                className="bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 px-4 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition"
              >
                <FileSpreadsheet size={18} /> Eksport CSV
              </button>
              <button 
                onClick={copyToWhatsApp}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition shadow-lg shadow-blue-100"
              >
                <ClipboardCopy size={18} /> Salin Laporan WhatsApp
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Nama</th>
                  <th className="px-6 py-4 text-center">Jiwa</th>
                  <th className="px-6 py-4">Total Zakat</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dataZakat.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center opacity-30">
                        <Wheat size={48} className="mb-2" />
                        <p>Belum ada muzakki yang terdaftar.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  dataZakat.map((item) => (
                    <tr key={item.id} className="hover:bg-green-50/30 transition group">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-800">{item.nama}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{new Date(item.id).toLocaleTimeString()}</p>
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-600">{item.jumlahJiwa}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${item.jenisZakat === 'Uang' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {item.jenisZakat === 'Uang' ? `Rp ${item.totalZakat.toLocaleString()}` : `${item.totalZakat} Kg Beras`}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{item.keterangan}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => deleteEntry(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors p-2"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Konfirmasi Reset */}
        {showConfirmReset && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="flex items-center gap-3 text-red-600 mb-4">
                <AlertTriangle size={32} />
                <h3 className="text-xl font-bold">Hapus Semua Data?</h3>
              </div>
              <p className="text-gray-600 mb-6">Tindakan ini akan menghapus seluruh daftar muzakki secara permanen dari browser ini. Anda yakin?</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowConfirmReset(false)}
                  className="flex-1 py-2.5 rounded-lg font-bold text-gray-500 hover:bg-gray-100 transition"
                >
                  Batal
                </button>
                <button 
                  onClick={resetAllData}
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold shadow-lg shadow-red-100 transition"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 text-center text-gray-400 text-xs italic space-y-1">
          <p>"Barangsiapa yang memudahkan urusan saudaranya, Allah akan memudahkan urusannya di dunia dan akhirat."</p>
          <p className="font-semibold text-green-600/50 not-italic">Panitia Zakat Masjid Baiturrahim</p>
        </div>
      </div>
    </div>
  );
};

export default App;