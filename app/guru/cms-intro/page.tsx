'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameBadge, GameButton, LoadingSpinner } from '../../../components/GameUI';
import { weightedStageOrder, weightedIntroSlides, type WeightedStageId } from '../../../lib/stageContent';

type AdaptabilitasStage = 'start' | 'adaptabilitas-karier';
type AllStageType = WeightedStageId | AdaptabilitasStage;

const ADAPTABILITAS_STAGES: AdaptabilitasStage[] = ['start', 'adaptabilitas-karier'];

// Default content untuk adaptabilitas intro (dari adaptabilitas-intro/page.tsx)
const defaultAdaptabilitasContent = [
  {
    id: 'introduction',
    title: 'Adaptabilitas Karier',
    content: `Adaptabilitas karier adalah kemampuan seseorang untuk merencanakan, mengatur, mengeksplorasi, dan mewujudkan transisi karier serta menghadapi perubahan dunia kerja. Dalam terminologi Savickas, adaptabilitas karier terdiri dari empat sumber daya psikologis utama :

Concern (Kepedulian/Perencanaan masa depan) yaitu kesiapan dan perhatian terhadap masa depan karier dengan memikirkan arah, mempersiapkan tujuan karier.
Control (Kendali/Keputusan diri) yaitu kemampuan mengambil tanggung jawab, membuat keputusan, dan mengelola tindakan untuk mencapai tujuan karier.
Curiosity (Rasa ingin tahu/Eksplorasi) yaitu dorongan mencari informasi, mencoba pekerjaan atau skill baru, dan mengeksplorasi jalur karier.
Confidence (Kepercayaan diri/Evaluasi kemampuan) yaitu keyakinan pada kemampuan diri untuk mengambil tindakan, menyelesaikan tugas, dan mengatasi hambatan.

Keempat sumber daya psikologis tersebut menunjukkan bahwa adaptabilitas karier adalah kemampuan merencanakan, mengendalikan, mengeksplorasi, dan percaya diri ketika menghadapi perubahan kerja.`
  },
  {
    id: 'purpose',
    title: 'Tujuan Adaptabilitas Karier',
    content: `Tujuan utama dari adaptabilitas karier ini adalah untuk menumbuhkan kesiapan siswa SMK agar mampu menyesuaikan diri dengan tuntutan dunia kerja atau bahkan berwirausaha di era modern yang serba cepat ini. Terdapat dua tujuan diantaranya adalah. 

1. Tujuan umum
Menumbuhkan kesiapan siswa SMK agar mampu menyesuaikan diri, merencanakan, dan mengambil langkah konkrit menuju dunia kerja di era modern.

2. Tujuan khusus
• Siswa dapat memahami dan menjelaskan 4 dimensi adaptabilitas karier (concern, control, curiosity, confidence).
• Siswa mampu membuat rencana karier sederhana (jangka panjang atau jangka pendek) yang realistis dan terukur.
• Siswa menunjukkan minimal 3 tindakan eksplorasi profesi (kunjungan industri, magang mini, wawancara profesional).
• Siswa meningkatkan skor reflektif/asesmen adaptabilitas (pre–post) melalui kegiatan terstruktur.
• Siswa mempraktikkan teknik pengambilan keputusan saat studi kasus transisi kerja (role-play).`
  },
  {
    id: 'characteristics',
    title: 'Karakteristik Adaptabilitas Karier',
    content: `Siswa yang memiliki adaptabilitas karier tinggi umumnya menunjukkan perilaku atau karakteristik berikut :

1. Memikirkan masa depan dan membuat target (perencanaan).
2. Bertanggung jawab atas pilihan kariernya (inisiatif dan kontrol).
3. Aktif mencoba hal baru dan bertanya tentang profesi (eksploratif).
4. Yakin pada kemampuan diri ketika menghadapi tantangan (resiliensi dan self-efficacy).
5. Fleksibel terhadap perubahan tugas/teknologi dan mau belajar keterampilan baru.
6. Mencari umpan balik dan memperbaiki rencana setelah kegagalan.`
  },
  {
    id: 'factors',
    title: 'Faktor-faktor Adaptabilitas Karier',
    content: `1. Internal (individual)
• Kepribadian (terbuka terhadap pengalaman baru, tanggung jawab).
• Kompetensi teknis dan soft skills (komunikasi, problem solving).
• Self-efficacy dan motivasi (percaya diri, memiliki semangat untuk maju).
• Pengalaman sebelumnya (magang, proyek, part-time).

2. Keluarga & Sosial
• Dukungan orang tua, ekspektasi keluarga.
• Jaringan sosial dan relasi profesional (mentor, alumni).

3. Sekolah & Pendidikan vokasi
• Kualitas kurikulum praktik dan orientasi industri.
• Ketersediaan bimbingan karir, modul adaptabilitas, dan fasilitas praktek.

4. Lingkungan kerja & ekonomi
• Perubahan teknologi, kebutuhan kompetensi baru, peluang kerja regional.
• Kebijakan pendidikan/ketenagakerjaan dan kondisi pasar kerja.

5. Kultural & Nilai
• Norma budaya mengenai pekerjaan (prioritas stabilitas vs. entrepreneurship).`
  },
  {
    id: 'guidance',
    title: 'Menumbuhkan Adaptabilitas Karier Siswa',
    content: `Kerangka teoretis untuk menumbuhkan adaptabilitas karier pada siswa SMK menekankan pengembangan keempat sumber daya adaptif Savickas melalui pengalaman penguasaan, refleksi naratif, penguatan self-efficacy, siklus pembelajaran pengalaman, dukungan ekologi, serta mekanisme monitoring dan umpan balik yang etis. Prioritas teoretisnya adalah menumbuhkan orientasi masa depan yang realistis (concern), memperkuat kapasitas pengambilan keputusan dan regulasi diri (control), menumbuhkan disposisi eksploratif (curiosity), dan membangun bukti pengalaman yang memperkuat keyakinan diri (confidence).`
  }
];

export default function CMSIntro() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedStage, setSelectedStage] = useState<AllStageType>('start');
  const [isAdaptabilitasMode, setIsAdaptabilitasMode] = useState(true);
  const [slides, setSlides] = useState<Array<{ key: string; title: string; paragraphs: string[] }>>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      router.push('/login');
      return;
    }

    // Check if user is guru
    let active = true;
    (async () => {
      try {
        const userRes = await fetch(`/api/users?userId=${encodeURIComponent(user.uid)}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData.data?.role !== 'guru') {
            router.push('/profile');
            return;
          }
        }
        if (active) setChecking(false);
        loadIntroSlides();
      } catch (error) {
        console.error('Error checking user:', error);
        if (active) setChecking(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, router]);

  useEffect(() => {
    if (!checking) {
      loadIntroSlides();
    }
  }, [selectedStage, checking, isAdaptabilitasMode]);

  const loadIntroSlides = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (isAdaptabilitasMode) {
        // Load adaptabilitas intro content
        // Map stage names: 'start' -> 'adaptabilitas-pretest', 'adaptabilitas-karier' -> 'adaptabilitas-posttest'
        const apiStage = selectedStage === 'start' ? 'adaptabilitas-pretest' : 
                        selectedStage === 'adaptabilitas-karier' ? 'adaptabilitas-posttest' : 
                        selectedStage;
        const res = await fetch(`/api/cms/intro?stage=${apiStage}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            setSlides(data.data);
          } else {
            // Convert default content to slide format
            const defaultSlides = defaultAdaptabilitasContent.map((section, idx) => ({
              key: section.id,
              title: section.title,
              paragraphs: section.content.split('\n').filter(p => p.trim())
            }));
            setSlides(defaultSlides);
          }
        } else {
          // Fallback to default
          const defaultSlides = defaultAdaptabilitasContent.map((section, idx) => ({
            key: section.id,
            title: section.title,
            paragraphs: section.content.split('\n').filter(p => p.trim())
          }));
          setSlides(defaultSlides);
        }
      } else {
        // Load weighted stage intro slides
        const res = await fetch(`/api/cms/intro?stage=${selectedStage}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data && data.data.length > 0) {
            setSlides(data.data);
          } else {
            const defaultSlides = weightedIntroSlides[selectedStage as WeightedStageId];
            setSlides(defaultSlides.map(s => ({ ...s })));
          }
        } else {
          const defaultSlides = weightedIntroSlides[selectedStage as WeightedStageId];
          setSlides(defaultSlides.map(s => ({ ...s })));
        }
      }
    } catch (error) {
      console.error('Error loading intro slides:', error);
      if (isAdaptabilitasMode) {
        const defaultSlides = defaultAdaptabilitasContent.map((section, idx) => ({
          key: section.id,
          title: section.title,
          paragraphs: section.content.split('\n').filter(p => p.trim())
        }));
        setSlides(defaultSlides);
      } else {
        const defaultSlides = weightedIntroSlides[selectedStage as WeightedStageId];
        setSlides(defaultSlides.map(s => ({ ...s })));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      // Map stage names for API: 'start' -> 'adaptabilitas-pretest', 'adaptabilitas-karier' -> 'adaptabilitas-posttest'
      const apiStage = selectedStage === 'start' ? 'adaptabilitas-pretest' : 
                      selectedStage === 'adaptabilitas-karier' ? 'adaptabilitas-posttest' : 
                      selectedStage;
      
      const res = await fetch('/api/cms/intro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: apiStage, slides }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage('Intro slides berhasil disimpan!');
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage(`Error: ${data.error || 'Gagal menyimpan'}`);
      }
    } catch (error) {
      console.error('Error saving intro slides:', error);
      setMessage('Terjadi kesalahan saat menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const updateSlide = (index: number, field: 'title' | 'paragraphs', value: string | string[]) => {
    const newSlides = [...slides];
    newSlides[index] = { ...newSlides[index], [field]: value };
    setSlides(newSlides);
  };

  const addSlide = () => {
    setSlides([...slides, { key: `new-${Date.now()}`, title: '', paragraphs: [''] }]);
  };

  const removeSlide = (index: number) => {
    if (confirm('Hapus slide ini?')) {
      setSlides(slides.filter((_, i) => i !== index));
    }
  };

  if (checking) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Front.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <LoadingSpinner size="lg" text="Memuat..." fullScreen={false} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{
        backgroundImage: 'url(/Background_Front.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="mb-4">
          <GameButton onClick={() => router.push('/')} className="from-blue-500 to-blue-600">
            ← Kembali ke Home
          </GameButton>
        </div>
        <GameCard className="bg-white/90 border-4 border-white/70 space-y-4 text-gray-800">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold">CMS Edit Intro</h2>
            <GameBadge className="bg-purple-500/80 border-white">Content Management</GameBadge>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {/* Start button - di awal */}
            <button
              onClick={() => {
                setSelectedStage('start');
                setIsAdaptabilitasMode(true);
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                selectedStage === 'start' && isAdaptabilitasMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Start
            </button>
            
            {/* Weighted stages */}
            <div className="flex gap-2 border-l-2 border-gray-300 pl-2">
              {weightedStageOrder.map((stage) => (
                <button
                  key={stage}
                  onClick={() => {
                    setSelectedStage(stage);
                    setIsAdaptabilitasMode(false);
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                    selectedStage === stage && !isAdaptabilitasMode
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {stage.charAt(0).toUpperCase() + stage.slice(1)}
                </button>
              ))}
            </div>
            
            {/* Adaptabilitas Karier button - di akhir */}
            <button
              onClick={() => {
                setSelectedStage('adaptabilitas-karier');
                setIsAdaptabilitasMode(true);
              }}
              className={`px-4 py-2 rounded-lg font-semibold text-sm border-l-2 border-gray-300 pl-2 ${
                selectedStage === 'adaptabilitas-karier' && isAdaptabilitasMode
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Adaptabilitas Karier
            </button>
          </div>

          {message && (
            <div className={`p-3 rounded-lg ${message.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
              {message}
            </div>
          )}

          {loading ? (
            <div className="text-center py-8">Memuat data...</div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-auto pr-2">
              {slides.map((slide, slideIndex) => (
                <div key={slideIndex} className="border-2 border-gray-300 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">Slide {slideIndex + 1}</h3>
                    <button
                      onClick={() => removeSlide(slideIndex)}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Hapus
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Judul</label>
                    <input
                      type="text"
                      value={slide.title || ''}
                      onChange={(e) => updateSlide(slideIndex, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1">Paragraf (satu per baris)</label>
                    <textarea
                      value={Array.isArray(slide.paragraphs) ? slide.paragraphs.join('\n') : slide.paragraphs || ''}
                      onChange={(e) => {
                        const paragraphs = e.target.value.split('\n').filter(p => p.trim());
                        updateSlide(slideIndex, 'paragraphs', paragraphs);
                      }}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}

              <button
                onClick={addSlide}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                + Tambah Slide
              </button>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <GameButton onClick={handleSave} disabled={saving} className="from-green-500 to-emerald-600">
              {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </GameButton>
            <GameButton onClick={loadIntroSlides} className="from-gray-400 to-gray-600">
              Reset
            </GameButton>
          </div>
        </GameCard>
      </div>
    </div>
  );
}


