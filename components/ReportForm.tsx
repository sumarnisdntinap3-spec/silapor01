
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bidang, Laporan, LaporanFoto } from '../types';
import { suggestReportContent } from '../services/geminiService';

interface ReportFormProps {
  user: User;
  bidang: Bidang[];
  onSave: (laporan: Laporan) => void;
}

const ReportForm: React.FC<ReportFormProps> = ({ user, bidang, onSave }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [fotos, setFotos] = useState<LaporanFoto[]>([]);

  const [form, setForm] = useState({
    namaSekolah: '',
    jenjang: 'SD',
    kecamatan: '',
    tanggalKunjungan: new Date().toISOString().split('T')[0],
    bidangId: bidang[0]?.id || '',
    uraianTemuan: '',
    rekomendasi: '',
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file: any) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotos(prev => [...prev, { id: Math.random().toString(36), url: reader.result as string }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAiSuggest = async () => {
    if (!form.namaSekolah) {
      alert("Isi nama sekolah terlebih dahulu untuk konteks AI.");
      return;
    }
    setAiLoading(true);
    const context = `Sekolah: ${form.namaSekolah} (${form.jenjang}), Kecamatan: ${form.kecamatan}, Uraian: ${form.uraianTemuan || 'kosong'}`;
    const result = await suggestReportContent(context);
    if (result) {
      setForm(prev => ({ ...prev, uraianTemuan: result.findings, rekomendasi: result.recommendations }));
    }
    setAiLoading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const newLaporan: Laporan = {
      id: `LAP-${Date.now()}`,
      userId: user.id,
      userName: user.fullName,
      bidangId: form.bidangId,
      namaSekolah: form.namaSekolah,
      jenjang: form.jenjang,
      kecamatan: form.kecamatan,
      tanggalKunjungan: form.tanggalKunjungan,
      uraianTemuan: form.uraianTemuan,
      rekomendasi: form.rekomendasi,
      status: 'Terkirim',
      fotos: fotos,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setTimeout(() => {
      onSave(newLaporan);
      setLoading(false);
      navigate('/');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-black text-slate-900 uppercase">Input Laporan Kunjungan</h1>
        <button onClick={() => navigate(-1)} className="text-slate-400 font-bold hover:text-slate-600">&larr; Batal</button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl p-8 md:p-12 space-y-8 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Sekolah Sasaran</label>
            <input 
              required
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
              placeholder="Contoh: SMP Negeri 1 Magetan"
              value={form.namaSekolah}
              onChange={e => setForm({ ...form, namaSekolah: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Jenjang</label>
            <select 
              required
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 bg-slate-50"
              value={form.jenjang}
              onChange={e => setForm({ ...form, jenjang: e.target.value })}
            >
              <option value="TK">TK (Taman Kanak-Kanak)</option>
              <option value="SD">SD (Sekolah Dasar)</option>
              <option value="SMP">SMP (Sekolah Menengah Pertama)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kecamatan</label>
            <input 
              required
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
              placeholder="Masukkan wilayah kecamatan..."
              value={form.kecamatan}
              onChange={e => setForm({ ...form, kecamatan: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tanggal Kunjungan</label>
            <input 
              required
              type="date"
              className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800"
              value={form.tanggalKunjungan}
              onChange={e => setForm({ ...form, tanggalKunjungan: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bidang Tujuan Laporan</label>
          <select 
            className="w-full px-5 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 bg-slate-50"
            value={form.bidangId}
            onChange={e => setForm({ ...form, bidangId: e.target.value })}
          >
            {bidang.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
          </select>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-50">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Uraian Temuan</label>
            <button 
              type="button" 
              onClick={handleAiSuggest}
              disabled={aiLoading}
              className="text-[10px] font-black bg-blue-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-blue-700 disabled:opacity-50"
            >
              {aiLoading ? '🧠 Memproses...' : '✨ Perbaiki dengan AI'}
            </button>
          </div>
          <textarea 
            required
            rows={5}
            placeholder="Deskripsikan temuan Anda di lapangan secara detail..."
            className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
            value={form.uraianTemuan}
            onChange={e => setForm({ ...form, uraianTemuan: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rekomendasi Awal</label>
          <textarea 
            required
            rows={3}
            placeholder="Langkah-langkah yang disarankan untuk sekolah/dinas..."
            className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-medium text-slate-700"
            value={form.rekomendasi}
            onChange={e => setForm({ ...form, rekomendasi: e.target.value })}
          />
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Foto Bukti Kegiatan (Max 500KB/foto)</label>
          <div className="flex flex-wrap gap-4">
            {fotos.map((f, i) => (
              <div key={f.id} className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200 group">
                <img src={f.url} className="w-full h-full object-cover" alt="Bukti" />
                <button 
                  type="button"
                  onClick={() => setFotos(fotos.filter((_, idx) => idx !== i))}
                  className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ))}
            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:bg-slate-50 hover:border-blue-400 transition-colors">
              <span className="text-2xl text-slate-300">+</span>
              <span className="text-[8px] font-black text-slate-400 uppercase">Upload</span>
              <input type="file" multiple accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
        </div>

        <button 
          disabled={loading}
          className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-2xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? 'MENYIMPAN LAPORAN...' : 'KIRIM LAPORAN KE DINAS'}
        </button>
      </form>
    </div>
  );
};

export default ReportForm;
