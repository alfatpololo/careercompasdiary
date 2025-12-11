'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { GameCard, GameBadge, GameButton, LoadingSpinner } from '../../../components/GameUI';
import { weightedStageOrder, weightedAssessment, type WeightedStageId, getCategoryInfo } from '../../../lib/stageContent';

type TeacherStageId = 'start' | 'concern' | 'control' | 'curiosity' | 'confidence' | 'adapt';
const TEACHER_STAGE_ORDER: TeacherStageId[] = ['start', 'concern', 'control', 'curiosity', 'confidence', 'adapt'];

const STAGE_META: Record<TeacherStageId, { label: string; color: string }> = {
  start: { label: 'Start', color: 'bg-blue-500' },
  concern: { label: 'Concern', color: 'bg-sky-500' },
  control: { label: 'Control', color: 'bg-emerald-500' },
  curiosity: { label: 'Curiosity', color: 'bg-purple-500' },
  confidence: { label: 'Confidence', color: 'bg-orange-500' },
  adapt: { label: 'Adaptabilitas', color: 'bg-yellow-500' },
};

type StudentSummary = {
  id: string;
  name: string;
  email?: string;
  school?: string;
  highestStage: TeacherStageId;
  stageFlags: Record<TeacherStageId, boolean>;
  prePercent: number;
  postPercent: number;
  lastUpdated?: string;
  avatar: string;
};

type UserDoc = {
  id: string;
  username?: string;
  email?: string;
  namaSekolah?: string;
};

function formatDate(value?: unknown): string {
  if (!value) return '-';
  if (typeof value === 'string') {
    try {
      return new Date(value).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return value;
    }
  }
  return String(value);
}

function getAvatarInitial(name?: string, email?: string) {
  const source = name || email || '?';
  return source.trim().charAt(0).toUpperCase();
}

export default function DataSiswa() {
  const router = useRouter();
  const { user } = useAuth();
  const [studentSummaries, setStudentSummaries] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentDetails, setStudentDetails] = useState<{ stages: Array<{ stage: string; score: number; passed: boolean; createdAt?: string | Date }>; quizzes: Array<{ isPosttest?: boolean; percent?: number; createdAt?: string | Date }>; diaries: Array<{ stage?: string; judul?: string; createdAt?: string | Date }>; evaluations: Array<{ type?: string; createdAt?: string | Date; answers?: number[] }> } | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [downloadingStudentId, setDownloadingStudentId] = useState<string | null>(null);

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

        // Fetch students
        const res = await fetch('/api/users?role=siswa');
        if (!res.ok) {
          throw new Error('Gagal memuat data siswa');
        }
        const data = await res.json();
        const students: UserDoc[] = data.data || [];

        const summaries = await Promise.all(
          students.map(async (student) => {
            try {
              const [stageRes, quizRes, diaryRes] = await Promise.all([
                fetch(`/api/stage?userId=${encodeURIComponent(student.id)}`),
                fetch(`/api/quiz?userId=${encodeURIComponent(student.id)}`),
                fetch(`/api/diary?userId=${encodeURIComponent(student.id)}&stage=adaptabilitas`),
              ]);

              const stageData = stageRes.ok ? await stageRes.json() : { attempts: [] };
              const quizData = quizRes.ok ? await quizRes.json() : { results: [] };
              const diaryData = diaryRes.ok ? await diaryRes.json() : { diaries: [] };

              const attempts = stageData.attempts || [];
              const stagePassed = new Set(
                attempts.filter((a: { passed?: boolean }) => a.passed).map((a: { stage: string }) => a.stage as WeightedStageId),
              );
              const postPercents = attempts
                .filter((a: { stage: string }) => (weightedStageOrder as readonly string[]).includes(a.stage))
                .map((a: { stage: string; score: number }) => {
                  const max = weightedAssessment[a.stage as WeightedStageId].length * 40;
                  return Math.round((a.score / max) * 100);
                });
              const postPercent =
                postPercents.length > 0
                  ? Math.round(postPercents.reduce((acc: number, val: number) => acc + val, 0) / postPercents.length)
                  : 0;

              const preDoc = quizData.results?.[0];
              const scores = preDoc?.scores ?? {};
              const prePercentRaw = weightedStageOrder.map((stage) => {
                const max = 30;
                const score = scores[stage] ?? 0;
                return Math.round((score / max) * 100);
              });
              const prePercent =
                prePercentRaw.length > 0
                  ? Math.round(prePercentRaw.reduce((acc: number, val: number) => acc + val, 0) / prePercentRaw.length)
                  : 0;

              let highestStage: TeacherStageId = 'start';
              weightedStageOrder.forEach((stage) => {
                if (stagePassed.has(stage)) {
                  highestStage = stage as TeacherStageId;
                }
              });
              const adaptDone = (diaryData.diaries || []).length > 0;
              if (adaptDone) highestStage = 'adapt';

              const stageFlags: Record<TeacherStageId, boolean> = {
                start: true,
                concern: stagePassed.has('concern'),
                control: stagePassed.has('control'),
                curiosity: stagePassed.has('curiosity'),
                confidence: stagePassed.has('confidence'),
                adapt: adaptDone,
              };

              const lastAttempt = attempts[0];

              return {
                id: student.id,
                name: (student as { username?: string; name?: string; email?: string }).username || (student as { name?: string; email?: string }).name || student.email || 'Siswa Tanpa Nama',
                email: student.email,
                school: (student as { namaSekolah?: string }).namaSekolah,
                highestStage,
                stageFlags,
                prePercent,
                postPercent,
                lastUpdated: lastAttempt?.createdAt,
                avatar: getAvatarInitial((student as { username?: string; name?: string; email?: string }).username || (student as { name?: string; email?: string }).name || student.email, student.email),
              };
            } catch (error) {
              console.error('Error processing student:', error);
              return null;
            }
          }),
        );

        if (active) {
          setStudentSummaries(summaries.filter((s) => s !== null) as StudentSummary[]);
        }
      } catch (error) {
        if (active) {
          setError(error instanceof Error ? error.message : 'Terjadi kesalahan');
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [user, router]);

  const handleStudentClick = async (studentId: string) => {
    if (selectedStudent === studentId) {
      setSelectedStudent(null);
      setStudentDetails(null);
      return;
    }

    setSelectedStudent(studentId);
    setLoadingDetails(true);
    try {
      const [stageRes, quizRes, diaryRes, evalRes] = await Promise.all([
        fetch(`/api/stage?userId=${encodeURIComponent(studentId)}`),
        fetch(`/api/quiz?userId=${encodeURIComponent(studentId)}`),
        fetch(`/api/diary?userId=${encodeURIComponent(studentId)}`),
        fetch(`/api/evaluation?userId=${encodeURIComponent(studentId)}`),
      ]);

      const stageData = stageRes.ok ? await stageRes.json() : { attempts: [] };
      const quizData = quizRes.ok ? await quizRes.json() : { results: [] };
      const diaryData = diaryRes.ok ? await diaryRes.json() : { diaries: [] };
      const evalData = evalRes.ok ? await evalRes.json() : { evaluations: [] };

      setStudentDetails({
        stages: stageData.attempts || [],
        quizzes: quizData.results || [],
        diaries: diaryData.diaries || [],
        evaluations: evalData.evaluations || [],
      });
    } catch (error) {
      console.error('Error fetching student details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleDownloadReport = async (student: StudentSummary) => {
    setDownloadingStudentId(student.id);
    try {
      // Dynamic import jsPDF
      const { jsPDF } = await import('jspdf');
      
      // Fetch all data for the student
      const [stageRes, quizRes, diaryRes, evalRes] = await Promise.all([
        fetch(`/api/stage?userId=${encodeURIComponent(student.id)}`),
        fetch(`/api/quiz?userId=${encodeURIComponent(student.id)}`),
        fetch(`/api/diary?userId=${encodeURIComponent(student.id)}`),
        fetch(`/api/evaluation?userId=${encodeURIComponent(student.id)}`),
        fetch(`/api/users?userId=${encodeURIComponent(student.id)}`),
      ]);

      const stageData = stageRes.ok ? await stageRes.json() : { attempts: [] };
      const quizData = quizRes.ok ? await quizRes.json() : { results: [] };
      const diaryData = diaryRes.ok ? await diaryRes.json() : { diaries: [] };
      const evalData = evalRes.ok ? await evalRes.json() : { evaluations: [] };
      // const userData = userRes.ok ? await userRes.json() : { data: null };
      const stages = stageData.attempts || [];
      const quizzes = quizData.results || [];
      const diaries = diaryData.diaries || [];
      const evaluations = evalData.evaluations || [];

      // Create PDF
      const doc = new jsPDF();
      let yPosition = 20;
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      const lineHeight = 7;

      // Helper function to add text with word wrap
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, color: string = '#000000') => {
        // Sanitize text - remove control characters but keep % for percentages
        // Remove only problematic control characters, not % symbol
        let sanitizedText = String(text || '').replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
        // Remove multiple consecutive % that are used as separators (like %%%%%)
        // But keep % when it's part of a percentage (like 50%, 100%)
        // Strategy: Replace multiple % (2 or more) with empty string, but preserve single % that follows a digit
        sanitizedText = sanitizedText.replace(/%{2,}/g, ''); // Remove all multiple % (used as separators)
        // Note: Single % after a number (like "50%") will remain because it's not part of %{2,} pattern
        sanitizedText = sanitizedText.trim();
        if (!sanitizedText) return;
        
        doc.setFontSize(fontSize);
        doc.setTextColor(color);
        if (isBold) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        
        try {
          const lines = doc.splitTextToSize(sanitizedText, maxWidth);
          lines.forEach((line: string) => {
            if (yPosition > 280) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, margin, yPosition);
            yPosition += lineHeight;
          });
        } catch (error) {
          console.warn('Error adding text to PDF:', error);
          // Fallback: try adding text directly without split
          if (yPosition > 280) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(sanitizedText.substring(0, 100), margin, yPosition);
          yPosition += lineHeight;
        }
      };

      // Title
      addText('REKAP HASIL TEST SISWA', 18, true, '#1e40af');
      yPosition += 5;

      // Informasi Siswa
      addText('INFORMASI SISWA', 14, true, '#059669');
      addText('---------------------------------------------------', 10, false, '#6b7280');
      addText(`Nama: ${student.name}`, 11, true);
      addText(`Email: ${student.email || '-'}`, 10);
      addText(`Sekolah: ${student.school || '-'}`, 10);
      addText(`Tahap Tertinggi: ${STAGE_META[student.highestStage].label}`, 10);
      addText(`Pretest: ${student.prePercent}%`, 10);
      addText(`Posttest: ${student.postPercent}%`, 10);
      addText(`Stage Selesai: ${TEACHER_STAGE_ORDER.filter((s) => student.stageFlags[s]).length}/${TEACHER_STAGE_ORDER.length}`, 10);
      addText(`Pembaruan Terakhir: ${formatDate(student.lastUpdated)}`, 10);
      yPosition += 5;

      // Pretest & Posttest
      addText('PRETEST & POSTTEST', 14, true, '#059669');
      addText('---------------------------------------------------', 10, false, '#6b7280');
      if (quizzes.length > 0) {
        quizzes.forEach((quiz: { isPosttest?: boolean; createdAt?: string | Date; total?: number; percent?: number; scores?: Record<string, number>; category?: string }, idx: number) => {
          addText(`${quiz.isPosttest ? 'Posttest' : 'Pretest'} #${idx + 1}`, 11, true);
          addText(`  Tanggal: ${formatDate(quiz.createdAt)}`, 10);
          addText(`  Total Score: ${quiz.total || 0}`, 10);
          addText(`  Persentase: ${quiz.percent || 0}%`, 10);
          if (quiz.scores) {
            addText(`  Detail Score:`, 10, true);
            Object.entries(quiz.scores).forEach(([stage, score]: [string, number | string]) => {
              addText(`    • ${stage}: ${score}`, 9);
            });
          }
          // Convert category to Indonesian label
          let categoryLabel = '-';
          if (quiz.category) {
            try {
              // Map Indonesian category to English ScoreCategory
              const categoryMap: Record<string, 'Very High' | 'High' | 'Low' | 'Very Low'> = {
                'Sangat Tinggi': 'Very High',
                'Tinggi': 'High',
                'Rendah': 'Low',
                'Sangat Rendah': 'Very Low',
                'Very High': 'Very High',
                'High': 'High',
                'Low': 'Low',
                'Very Low': 'Very Low'
              };
              const englishCategory = categoryMap[quiz.category] || quiz.category as 'Very High' | 'High' | 'Low' | 'Very Low';
              const categoryInfo = getCategoryInfo(englishCategory);
              categoryLabel = categoryInfo.label;
            } catch {
              categoryLabel = quiz.category;
            }
          }
          addText(`  Kategori: ${categoryLabel}`, 10);
          yPosition += 3;
        });
      } else {
        addText('Belum ada data pretest/posttest', 10, false, '#6b7280');
      }
      yPosition += 5;

      // Stage Attempts
      addText('STAGE ATTEMPTS (ASSESSMENT)', 14, true, '#059669');
      addText('---------------------------------------------------', 10, false, '#6b7280');
      if (stages.length > 0) {
        stages.forEach((attempt: { stage: string; score: number; passed: boolean; createdAt?: string | Date; answers?: number[] }, idx: number) => {
          addText(`Attempt #${idx + 1}`, 11, true);
          addText(`  Stage: ${attempt.stage}`, 10);
          addText(`  Score: ${attempt.score}`, 10);
          addText(`  Status: ${attempt.passed ? 'LULUS ✓' : 'BELUM LULUS ✗'}`, 10, false, attempt.passed ? '#059669' : '#dc2626');
          addText(`  Tanggal: ${formatDate(attempt.createdAt)}`, 10);
          if (attempt.answers && Array.isArray(attempt.answers)) {
            addText(`  Jawaban: ${attempt.answers.join(', ')}`, 9);
          }
          yPosition += 3;
        });
      } else {
        addText('Belum ada data stage attempts', 10, false, '#6b7280');
      }
      yPosition += 5;

      // Diaries
      addText('CATATAN HARIAN (DIARY)', 14, true, '#059669');
      addText('---------------------------------------------------', 10, false, '#6b7280');
      if (diaries.length > 0) {
        diaries.forEach((diary: { stage?: string; judul?: string; tanggal?: string | Date; createdAt?: string | Date; isi?: string }, idx: number) => {
          addText(`Diary #${idx + 1}`, 11, true);
          addText(`  Stage: ${diary.stage || '-'}`, 10);
          addText(`  Judul: ${diary.judul || '-'}`, 10);
          addText(`  Tanggal: ${formatDate(diary.tanggal || diary.createdAt)}`, 10);
          if (diary.isi) {
            addText(`  Isi:`, 10, true);
            const isiLines = (diary.isi || '').split('\n');
            isiLines.forEach((line: string) => {
              if (line.trim()) {
                addText(`    ${line}`, 9);
              }
            });
          }
          addText(`  Dibuat: ${formatDate(diary.createdAt)}`, 10);
          yPosition += 3;
        });
      } else {
        addText('Belum ada data diary', 10, false, '#6b7280');
      }
      yPosition += 5;

      // Evaluations
      addText('EVALUASI', 14, true, '#059669');
      addText('---------------------------------------------------', 10, false, '#6b7280');
      if (evaluations.length > 0) {
        evaluations.forEach((evaluation: { type?: string; createdAt?: string | Date; answers?: number[] }, idx: number) => {
          addText(`Evaluasi #${idx + 1}`, 11, true);
          addText(`  Tipe: ${evaluation.type || '-'}`, 10);
          addText(`  Tanggal: ${formatDate(evaluation.createdAt)}`, 10);
          if (evaluation.answers && Array.isArray(evaluation.answers)) {
            addText(`  Jawaban: ${evaluation.answers.join(', ')}`, 9);
          }
          yPosition += 3;
        });
      } else {
        addText('Belum ada data evaluasi', 10, false, '#6b7280');
      }
      yPosition += 5;

      // Summary
      addText('RINGKASAN', 14, true, '#059669');
      addText('---------------------------------------------------', 10, false, '#6b7280');
      addText(`Total Stage Attempts: ${stages.length}`, 10);
      addText(`Total Quiz Results: ${quizzes.length}`, 10);
      addText(`Total Diaries: ${diaries.length}`, 10);
      addText(`Total Evaluations: ${evaluations.length}`, 10);
      addText(`Stage Completion:`, 10, true);
      TEACHER_STAGE_ORDER.forEach((stage) => {
        const status = student.stageFlags[stage] ? 'Selesai ✓' : 'Belum Selesai ✗';
        const color = student.stageFlags[stage] ? '#059669' : '#6b7280';
        addText(`  • ${STAGE_META[stage].label}: ${status}`, 10, false, color);
      });

      // Footer
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor('#6b7280');
        doc.text(
          `Halaman ${i} dari ${totalPages} - Generated: ${new Date().toLocaleString('id-ID')}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
      }

      // Save PDF
      const fileName = `Rekap_Test_${student.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Terjadi kesalahan saat mengunduh rekap. Silakan coba lagi.');
    } finally {
      setDownloadingStudentId(null);
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Front.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <LoadingSpinner size="lg" text="Memuat data..." fullScreen={false} />
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
            <h2 className="text-2xl font-extrabold">Tampilan Data Siswa</h2>
            <GameBadge className="bg-blue-500/80 border-white">Daftar Siswa</GameBadge>
          </div>

          {error ? (
            <div className="text-center font-semibold text-red-600 py-8">{error}</div>
          ) : studentSummaries.length === 0 ? (
            <div className="text-center font-semibold text-gray-600 py-8">
              Belum ada data siswa yang tersedia.
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-auto pr-2">
              {studentSummaries.map((student) => (
                <div key={student.id} className="space-y-3">
                  <div
                    onClick={() => handleStudentClick(student.id)}
                    className="border-2 border-white/60 bg-white/70 rounded-2xl p-4 cursor-pointer hover:bg-white/90 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-700 font-bold flex items-center justify-center">
                          {student.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{student.name}</p>
                          <p className="text-xs text-gray-500">{student.email || 'Email tidak tersedia'}</p>
                          <p className="text-xs text-gray-500">{student.school || 'Sekolah belum dicatat'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-gray-500">Tahap Saat Ini</p>
                          <p className="text-sm font-bold text-emerald-600">{STAGE_META[student.highestStage].label}</p>
                          <p className="text-xs text-gray-500">Pembaruan: {formatDate(student.lastUpdated)}</p>
                        </div>
                        <GameButton
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadReport(student);
                          }}
                          disabled={downloadingStudentId === student.id}
                          className="from-green-500 to-emerald-600 text-[10px] sm:text-xs px-2 py-1 sm:px-3 sm:py-2"
                          title="Download Rekap Test"
                        >
                          {downloadingStudentId === student.id ? '⏳ Mengunduh...' : '📥 Download'}
                        </GameButton>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 mt-3">
                      {TEACHER_STAGE_ORDER.map((stage) => (
                        <div
                          key={stage}
                          className={`h-3 flex-1 rounded-full ${
                            student.stageFlags[stage] ? STAGE_META[stage].color : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[10px] sm:text-xs font-semibold text-gray-600 mt-3">
                      <span>Pretest: {student.prePercent}%</span>
                      <span>Posttest: {student.postPercent}%</span>
                      <span>
                        Stage Selesai: {TEACHER_STAGE_ORDER.filter((s) => student.stageFlags[s]).length}/
                        {TEACHER_STAGE_ORDER.length}
                      </span>
                      <span>
                        Adaptabilitas: {student.stageFlags.adapt ? 'Refleksi tersimpan' : 'Belum ada catatan'}
                      </span>
                    </div>
                  </div>

                  {selectedStudent === student.id && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-4 space-y-4">
                      {loadingDetails ? (
                        <div className="text-center font-semibold text-gray-600">Memuat detail progress...</div>
                      ) : studentDetails ? (
                        <div className="space-y-4">
                          <h4 className="font-bold text-lg text-gray-800">Detail Progress</h4>

                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Stage Attempts ({studentDetails.stages.length})</h5>
                            <div className="space-y-2 max-h-40 overflow-auto">
                              {studentDetails.stages.slice(0, 5).map((attempt: { stage: string; score: number; passed: boolean; createdAt?: string | Date }, idx: number) => (
                                <div key={idx} className="bg-white rounded p-2 text-xs text-gray-800">
                                  <span className="font-semibold">{attempt.stage}:</span> Score {attempt.score}, 
                                  {attempt.passed ? ' Lulus ✅' : ' Belum Lulus ⚠️'} - {formatDate(attempt.createdAt)}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Quiz Results ({studentDetails.quizzes.length})</h5>
                            <div className="space-y-2 max-h-40 overflow-auto">
                              {studentDetails.quizzes.slice(0, 5).map((quiz: { isPosttest?: boolean; percent?: number; createdAt?: string | Date }, idx: number) => (
                                <div key={idx} className="bg-white rounded p-2 text-xs text-gray-800">
                                  {quiz.isPosttest ? 'Posttest' : 'Pretest'}: {quiz.percent}% - {formatDate(quiz.createdAt)}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Diaries ({studentDetails.diaries.length})</h5>
                            <div className="space-y-2 max-h-40 overflow-auto">
                              {studentDetails.diaries.slice(0, 5).map((diary: { stage?: string; judul?: string; createdAt?: string | Date }, idx: number) => (
                                <div key={idx} className="bg-white rounded p-2 text-xs text-gray-800">
                                  {diary.stage || 'Unknown'}: {diary.judul || 'No title'} - {formatDate(diary.createdAt)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center font-semibold text-gray-600">Tidak ada data detail</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </GameCard>
      </div>
    </div>
  );
}

