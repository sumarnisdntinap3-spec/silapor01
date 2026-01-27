
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, UserRole, Laporan, Bidang, LaporanStatus } from '../types';
import { analyzeReport } from '../services/geminiService';

interface ReportDetailProps {
  user: User;
  laporan: Laporan[];
  bidang: Bidang[];
  onUpdate: (laporan: Laporan) => void;
  onDelete: (id: string) => void;
}

const ReportDetail: React.FC<ReportDetailProps> = ({ user, laporan, bidang, onUpdate, onDelete }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const report = laporan.find(l => l.id === id);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [feedback, setFeedback] = useState(report?.feedbackKabid || '');

  useEffect(() => {
    if (report && user.role === UserRole.BIDANG && report.status === 'Terkirim') {
      onUpdate({ ...report, status: 'Dibaca', updatedAt: new Date().toISOString() });
    }
  }, [id, user.role]);

  if (!report) return <div className="text-center py-20 font-bold text-slate-400 tracking-widest uppercase">Laporan tidak ditemukan.</div>;

  const handleSaveResponse = (newStatus: LaporanStatus) => {
    if (!feedback.trim() && newStatus === 'Ditindaklanjuti') {
      alert("Harap berikan tanggapan/catatan tindak lanjut sebelum menyelesaikan laporan.");
      return;
    }

    onUpdate({ 
      ...report, 
      status: newStatus, 
      feedbackKabid: feedback,
      updatedAt: new Date().toISOString() 
    });
    alert(`Laporan berhasil diperbarui dengan status: ${newStatus}`);
  };

  const handleAiAnalysis = async () => {
    setIsAnalyzing(true);
    const analysis = await analyzeReport(report.uraianTemuan, report.rekomendasi);
    setAiAnalysis(analysis);
    setIsAnalyzing(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn pb-20 print:p-0">
      <div className="flex items-center justify-between print:hidden">
        <button onClick={() => navigate(-1)} className="font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest text-xs">&larr; Kembali</button>
        <div className="flex gap-4">
          <button onClick={handlePrint} className="bg-white px-4 py-2 rounded-lg shadow-sm border border-slate-200 text-xs font-bold hover:bg-slate-50">CETAK PDF</button>
          {user.role === UserRole.ADMIN && (
            <button onClick={() => { if(confirm("Hapus laporan ini?")) { onDelete(report.id); navigate('/'); } }} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-xs font-bold hover:bg-red-600 hover:text-white transition-colors">HAPUS LAPORAN</button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col md:flex-row min-h-[600px]">
        {/* Sidebar Info */}
        <div className="w-full md:w-80 bg-slate-900 text-white p-10 space-y-8 print:hidden">
          <div>
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Meta Data Laporan</p>
            <div className="space-y-4">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-500">ID Laporan</span>
                <span className="font-mono text-sm">{report.id}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-500">Jenjang & Wilayah</span>
                <span className="text-sm font-bold">{report.jenjang || '-'} / {report.kecamatan || '-'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-500">Status Saat Ini</span>
                <span className="text-sm font-black text-blue-400 uppercase">{report.status}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-500">Bidang Terkait</span>
                <span className="text-sm font-bold">{bidang.find(b => b.id === report.bidangId)?.nama}</span>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-800">
            <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Pengirim</p>
            <p className="font-bold">{report.userName}</p>
            <p className="text-xs text-slate-400 mt-1">{new Date(report.createdAt).toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-grow p-10 md:p-16 space-y-12 bg-white">
          <header>
            <div className="flex items-center gap-2 mb-2">
               <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">
                {report.jenjang}
              </span>
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest">
                Kec. {report.kecamatan}
              </span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-none mb-2">{report.namaSekolah}</h2>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              Laporan Kunjungan Tanggal {new Date(report.tanggalKunjungan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </header>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
              <span className="w-4 h-0.5 bg-blue-600 mr-2"></span> Temuan Lapangan
            </h3>
            <div className="bg-slate-50 p-6 rounded-2xl text-slate-700 leading-relaxed whitespace-pre-wrap font-medium border border-slate-100">
              {report.uraianTemuan}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center">
              <span className="w-4 h-0.5 bg-emerald-600 mr-2"></span> Rekomendasi Pengawas
            </h3>
            <div className="bg-emerald-50/50 p-6 rounded-2xl text-emerald-900 leading-relaxed whitespace-pre-wrap font-medium border border-emerald-100">
              {report.rekomendasi}
            </div>
          </section>

          {report.fotos.length > 0 && (
            <section className="space-y-4 print:hidden">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Dokumentasi Foto</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {report.fotos.map(f => (
                  <img key={f.id} src={f.url} className="w-full aspect-square object-cover rounded-xl shadow-sm border border-slate-100" alt="Bukti" />
                ))}
              </div>
            </section>
          )}

          {user.role === UserRole.BIDANG && (
            <div className="bg-slate-900 rounded-3xl p-8 text-white space-y-6 shadow-2xl print:hidden">
              <div className="flex items-center justify-between">
                <h4 className="text-xl font-black tracking-tight">✨ Asisten Analisis Gemini AI</h4>
                {!aiAnalysis && (
                  <button 
                    onClick={handleAiAnalysis} 
                    disabled={isAnalyzing}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-[10px] font-black transition-all"
                  >
                    {isAnalyzing ? 'MENGANALISIS...' : 'JALANKAN ANALISIS AI'}
                  </button>
                )}
              </div>
              {aiAnalysis && (
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap italic bg-white/5 p-6 rounded-xl">
                  {aiAnalysis}
                </div>
              )}
            </div>
          )}

          {user.role === UserRole.BIDANG && (
            <div className="pt-10 border-t border-slate-100 space-y-6 print:hidden">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs">✍️</div>
                <h4 className="font-black text-slate-800 uppercase tracking-widest text-xs">Menu Tanggapi Laporan</h4>
              </div>
              <textarea 
                placeholder="Berikan arahan, catatan tindak lanjut, atau verifikasi dari Bidang..."
                className="w-full px-6 py-5 rounded-3xl border border-slate-200 focus:ring-4 focus:ring-blue-100 outline-none font-medium text-slate-700 bg-slate-50/50 min-h-[150px] transition-all"
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
              />
              <div className="flex flex-wrap gap-4">
                <button 
                  onClick={() => handleSaveResponse('Diterima')} 
                  className="bg-amber-100 text-amber-700 px-6 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-amber-200 transition-all active:scale-95 tracking-widest shadow-sm"
                >
                  Terima Laporan
                </button>
                <button 
                  onClick={() => handleSaveResponse('Ditindaklanjuti')} 
                  className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[10px] uppercase hover:bg-blue-700 transition-all active:scale-95 tracking-widest shadow-xl"
                >
                  Selesai & Tandai Ditindaklanjuti
                </button>
              </div>
            </div>
          )}

          {report.feedbackKabid && (
            <div className="pt-10 border-t border-slate-100">
              <h4 className="font-black text-slate-400 uppercase tracking-widest text-[10px] mb-4 flex items-center">
                <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                Catatan Resmi Kepala Bidang
              </h4>
              <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-blue-900 font-bold italic leading-relaxed relative z-10 text-sm">
                  "{report.feedbackKabid}"
                </p>
                <div className="mt-4 flex items-center gap-2 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[8px] text-white font-black">KB</div>
                  <span className="text-[10px] font-black text-blue-700 uppercase tracking-tighter">Kepala Bidang Terkait</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportDetail;
