'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { GameBadge, LoadingSpinner } from '../../components/GameUI';

export default function JourneyMap() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [latestPass, setLatestPass] = useState<Record<string, { score: number; passed: boolean; createdAt: string }>>({});
  const [startDone, setStartDone] = useState<boolean>(false);
  const [stageDone, setStageDone] = useState<Record<string, boolean>>({});
  const [stageStats, setStageStats] = useState<Record<string, { lolos: number; gagal: number }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [isGuru, setIsGuru] = useState<boolean | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!user) {
      console.log('[Journey] No user, skipping fetch');
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      console.log('[Journey] Fetching status for user:', user.uid);
      
      // Check if user is guru
      try {
        const userRes = await fetch(`/api/users?userId=${encodeURIComponent(user.uid)}`);
        if (userRes.ok) {
          const userData = await userRes.json();
          setIsGuru(userData.data?.role === 'guru');
        }
      } catch (error) {
        console.error('[Journey] Error checking user role:', error);
      }
      
      const res = await fetch(`/api/stage?userId=${encodeURIComponent(user.uid)}`);
      let latestPassData: Record<string, { score: number; passed: boolean; createdAt: string }> = {};
      if (res.ok) {
        try {
          const data = await res.json();
          console.log('[Journey] Stage data:', data);
          latestPassData = data.latest || {};
          setLatestPass(latestPassData);
          
          // Calculate retry statistics from attempts
          const attempts: Array<{ stage: string; passed: boolean }> = data.attempts || [];
          const stats: Record<string, { lolos: number; gagal: number }> = {};
          
          attempts.forEach((attempt) => {
            if (!stats[attempt.stage]) {
              stats[attempt.stage] = { lolos: 0, gagal: 0 };
            }
            if (attempt.passed) {
              stats[attempt.stage].lolos++;
            } else {
              stats[attempt.stage].gagal++;
            }
          });
          
          setStageStats(stats);
        } catch (jsonError) {
          console.error('[Journey] Failed to parse stage JSON:', jsonError);
        }
      } else {
        try {
          const errorText = await res.text();
          console.error('[Journey] Failed to fetch stage:', res.status, errorText);
        } catch {
          console.error('[Journey] Failed to fetch stage:', res.status);
        }
      }

      // Fetch start progress - TRACK USER PROGRESS
      const prog = await fetch(`/api/progress?userId=${encodeURIComponent(user.uid)}`);
      if (prog.ok) {
        try {
          const pdata = await prog.json();
          console.log('[Journey] Progress API response:', JSON.stringify(pdata, null, 2));
          
          // Pastikan data structure benar
          const progArr: Array<{ levelId: string; completed: boolean; score?: number }> = 
            (pdata?.data?.progress && Array.isArray(pdata.data.progress)) 
              ? pdata.data.progress 
              : [];
          
          console.log('[Journey] Progress array (length:', progArr.length, '):', progArr);
          
          // Cari progress START - cek levelId === 'start' dan completed === true
          const startItem = progArr.find((p) => {
            const matches = p.levelId === 'start' && p.completed === true;
            if (matches) {
              console.log('[Journey] Found START progress item:', p);
            }
            return matches;
          });
          
          const isStartDone = !!startItem;
          console.log('[Journey] ⭐ START progress check:', {
            found: !!startItem,
            startItem: startItem || null,
            isStartDone,
            totalProgressItems: progArr.length,
            allProgress: progArr.map(p => ({ levelId: p.levelId, completed: p.completed }))
          });
          
          setStartDone(isStartDone);
          
          // Track stage completion untuk stage lain - HANYA jika ada assessment passed
          // JANGAN gunakan progress.completed karena itu bisa dari quiz pengenalan
          // Gunakan latestPassData yang dari stage_attempts dengan passed=true
          const doneMap: Record<string, boolean> = {};
          // doneMap hanya diisi dari latestPassData, bukan dari progress.completed
          // karena progress.completed bisa true dari quiz pengenalan START (yang salah)
          for (const stageId of ['concern','control','curiosity','confidence']) {
            doneMap[stageId] = latestPassData[stageId]?.passed === true; // HANYA dari assessment passed
          }
          console.log('[Journey] ✅ Stage completion map (from latestPassData only):', {
            doneMap,
            latestPassData
          });
          setStageDone(doneMap);
        } catch (jsonError) {
          console.error('[Journey] ❌ Failed to parse progress JSON:', jsonError);
          setStartDone(false);
        }
      } else {
        try {
          const errorText = await prog.text();
          console.error('[Journey] ❌ Failed to fetch progress:', prog.status, errorText);
        } catch {
          console.error('[Journey] ❌ Failed to fetch progress:', prog.status);
        }
        setStartDone(false);
      }
    } catch (e) {
      console.error('[Journey] Failed to load stage status', e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Force refresh if refresh query param is present
  useEffect(() => {
    if (typeof window === 'undefined' || !user) return;
    
    const urlParams = new URLSearchParams(window.location.search);
    const refresh = urlParams.get('refresh');
    if (refresh === 'true') {
      console.log('[Journey] Force refresh from query param');
      fetchStatus();
      // Remove query param from URL
      router.replace('/journey', { scroll: false });
    }
  }, [user, fetchStatus, router]);

  // Refresh when page becomes visible or gets focus (when user comes back from other page)
  useEffect(() => {
    if (!user) return;
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchStatus();
      }
    };
    const handleFocus = () => {
      fetchStatus();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, fetchStatus]);

  const unlocked = useMemo(() => {
    // LOGIKA SEQUENTIAL UNLOCK SEDERHANA & STRICT:
    // 1. START → CONCERN (kalau START selesai SEMUA tahap, CONCERN unlock)
    // 2. CONCERN → CONTROL (kalau CONCERN passed assessment, CONTROL unlock)
    // 3. CONTROL → CURIOSITY (kalau CONTROL passed assessment, CURIOSITY unlock)
    // 4. CURIOSITY → CONFIDENCE (kalau CURIOSITY passed assessment, CONFIDENCE unlock)
    // 5. CONFIDENCE → ADAPTABILITAS (kalau CONFIDENCE passed assessment, ADAPTABILITAS unlock)
    
    // Cek apakah START sudah selesai SEMUA tahap (quiz → intro → diary → evaluation)
    // START progress hanya diset di evaluation-result setelah semua tahap selesai
    const isStartDone = startDone === true;
    
    // Cek apakah stage assessment sudah PASSED (nilai minimal terpenuhi) - STRICT CHECK
    const concernPassed = !!latestPass['concern'] && latestPass['concern'].passed === true;
    const controlPassed = !!latestPass['control'] && latestPass['control'].passed === true;
    const curiosityPassed = !!latestPass['curiosity'] && latestPass['curiosity'].passed === true;
    const confidencePassed = !!latestPass['confidence'] && latestPass['confidence'].passed === true;
    
    // Unlock map - SEMUA LOCKED dulu (default), baru unlock satu per satu secara SEQUENTIAL
    const unlockMap: Record<string, boolean> = {
      start: true,           // START selalu unlocked (awal game)
      concern: false,        // CONCERN locked sampai START selesai SEMUA tahap
      control: false,        // CONTROL locked sampai CONCERN passed assessment
      curiosity: false,      // CURIOSITY locked sampai CONTROL passed assessment
      confidence: false,     // CONFIDENCE locked sampai CURIOSITY passed assessment
      adaptabilitas: false,  // ADAPTABILITAS locked sampai CONFIDENCE passed assessment
    };
    
    // Unlock sequential satu per satu - KETAT
    // Hanya unlock jika kondisi sebelumnya benar-benar terpenuhi
    if (isStartDone) {
      unlockMap.concern = true;  // Unlock CONCERN hanya kalau START selesai SEMUA tahap
    }
    
    // CONTROL hanya unlock jika CONCERN sudah passed (assessment)
    if (concernPassed) {
      unlockMap.control = true;
    }
    
    // CURIOSITY hanya unlock jika CONTROL sudah passed
    if (controlPassed) {
      unlockMap.curiosity = true;
    }
    
    // CONFIDENCE hanya unlock jika CURIOSITY sudah passed
    if (curiosityPassed) {
      unlockMap.confidence = true;
    }
    
    // ADAPTABILITAS hanya unlock jika CONFIDENCE sudah passed
    if (confidencePassed) {
      unlockMap.adaptabilitas = true;
    }
    
    console.log('[Journey] 🔒 Sequential Unlock (STRICT):', {
      startDone: isStartDone,
      concernPassed,
      controlPassed,
      curiosityPassed,
      confidencePassed,
      latestPassKeys: Object.keys(latestPass),
      unlockMap
    });
    
    return unlockMap;
  }, [latestPass, startDone]);

  const stages = useMemo(() => [
    { 
      id: 'start', 
      name: 'Start', 
      position: { top: '70%', left: '10%' },
      stats: stageStats['start'] || { lolos: 0, gagal: 0 },
      completed: startDone
    },
    { 
      id: 'concern', 
      name: 'Concern', 
      position: { top: '60%', left: '25%' },
      stats: stageStats['concern'] || { lolos: 0, gagal: 0 },
      completed: stageDone['concern'] || false
    },
    { 
      id: 'control', 
      name: 'Control', 
      position: { top: '78%', left: '52%' },
      stats: stageStats['control'] || { lolos: 0, gagal: 0 },
      completed: stageDone['control'] || false
    },
    { 
      id: 'curiosity', 
      name: 'Curiosity', 
      position: { top: '25%', left: '44%' },
      stats: stageStats['curiosity'] || { lolos: 0, gagal: 0 },
      completed: stageDone['curiosity'] || false
    },
    { 
      id: 'confidence', 
      name: 'Confidence', 
      position: { top: '65%', left: '75%' },
      stats: stageStats['confidence'] || { lolos: 0, gagal: 0 },
      completed: stageDone['confidence'] || false
    },
    { 
      id: 'adaptabilitas', 
      name: 'Adaptabilitas Career', 
      position: { top: '25%', left: '85%' },
      stats: { lolos: 0, gagal: 0 }, // Adaptabilitas tidak track stats
      completed: false
    }
  ], [stageStats, startDone, stageDone]);

  const handleStageClick = (stageId: string) => {
    if (!isAuthenticated) {
      alert('Anda harus login terlebih dahulu untuk mengakses stage ini');
      router.push('/login');
      return;
    }
    
    // If user is guru, redirect to evaluation page
    if (isGuru === true) {
      console.log('[Journey] ✅ Guru detected, redirecting to evaluation');
      router.push(`/guru/evaluation/${stageId}`);
      return;
    }
    
    // START - jika sudah selesai, langsung ke hasil pretest
    if (stageId === 'start') {
      if (startDone) {
        console.log('[Journey] ✅ START already completed, showing pretest results');
        router.push('/results/prepost?view=pretest');
        return;
      }
      console.log('[Journey] ✅ Navigating to START');
      router.push('/adaptabilitas');
      return;
    }
    
    // Adaptabilitas - cek apakah semua stage sudah selesai untuk posttest
    if (stageId === 'adaptabilitas') {
      // Check if all stages are completed (concern, control, curiosity, confidence all passed)
      const allStagesCompleted = ['concern', 'control', 'curiosity', 'confidence'].every(
        stage => latestPass[stage]?.passed === true
      );
      
      if (allStagesCompleted) {
        // Cek apakah sudah ada posttest dengan mengecek quiz_results
        const checkPosttest = async () => {
          if (!user?.uid) return;
          try {
            const quizRes = await fetch(`/api/quiz?userId=${encodeURIComponent(user.uid)}`);
            if (quizRes.ok) {
              const quizData = await quizRes.json();
              const results = quizData.results || [];
              
              // Cari posttest (isPosttest === true)
              const hasPosttest = results.some((result: { isPosttest?: boolean }) => result.isPosttest === true);
              
              if (hasPosttest) {
                console.log('[Journey] ✅ Posttest already completed, showing posttest results');
                router.push('/results/prepost?view=posttest');
              } else {
                console.log('[Journey] ✅ All stages completed, redirecting to posttest');
                router.push('/adaptabilitas-posttest');
              }
            } else {
              // Jika error, tetap redirect ke posttest
              console.log('[Journey] ✅ All stages completed, redirecting to posttest');
              router.push('/adaptabilitas-posttest');
            }
          } catch (error) {
            console.error('[Journey] Error checking posttest:', error);
            // Jika error, tetap redirect ke posttest
            router.push('/adaptabilitas-posttest');
          }
        };
        
        checkPosttest();
        return;
      } else {
        // Jika belum semua stage selesai, tidak bisa akses adaptabilitas
        alert('Selesaikan semua stage terlebih dahulu (Concern, Control, Curiosity, Confidence) untuk mengakses Posttest Adaptabilitas Karier');
        return;
      }
    }
    
    // Gate by unlock status - EXPLICIT check untuk stage lain
    const isUnlocked = unlocked[stageId] === true;
    if (!isUnlocked) {
      console.log('[Journey] ❌ Stage LOCKED:', stageId);
      console.log('[Journey] Unlocked map:', unlocked);
      console.log('[Journey] Latest pass:', latestPass);
      console.log('[Journey] Start done:', startDone);
      alert(`Stage ${stageId} masih terkunci. Selesaikan stage sebelumnya terlebih dahulu.`);
      return;
    }

    // Check if stage is already completed - if yes, show results instead
    const stagePassed = latestPass[stageId]?.passed === true;
    
    if (stagePassed) {
      console.log('[Journey] ✅ Stage already completed, showing results:', stageId);
      // Individual stage results → Show specific stage result
      if (['concern', 'control', 'curiosity', 'confidence'].includes(stageId)) {
        router.push(`/results/adaptability?stage=${stageId}`);
      } else {
        router.push('/results/adaptability');
      }
      return;
    }

    console.log('[Journey] ✅ Navigating to stage:', stageId, 'isUnlocked:', isUnlocked);
    router.push(`/quiz/${stageId}?mode=assessment`);
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen w-full relative flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Mulai.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <LoadingSpinner size="lg" text="Memuat Journey Map..." fullScreen={false} />
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >

      {/* Mobile/Tablet: Vertical Layout */}
      <div className="lg:hidden absolute top-1/2 left-0 right-0 z-20 px-4 sm:px-6 md:px-8 overflow-y-auto max-h-[70vh] transform -translate-y-1/2">
        <div className="flex flex-col gap-3 sm:gap-4 md:gap-5 justify-center items-center w-full">
          {stages.map((stage) => {
            // EXPLICIT check: pastikan unlocked[stage.id] selalu boolean, bukan undefined
            // START selalu bisa diklik meskipun sudah selesai
            // Guru bisa akses semua stage untuk evaluasi
            const isStageUnlocked = stage.id === 'start' ? true : (unlocked[stage.id] === true);
            const canClick = isGuru === true || stage.id === 'start' || isStageUnlocked;
            
            return (
            <div
              key={stage.id}
              className={`relative group w-full max-w-xs mx-auto ${canClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              onClick={() => canClick && handleStageClick(stage.id)}
            >
              <div className={`
                relative transition-all duration-200 transform ${canClick ? 'hover:scale-105' : ''}
                rounded-2xl border-4 border-white/70 shadow-[0_6px_0_rgba(0,0,0,0.25)] px-4 py-3 sm:px-5 sm:py-3.5
                ${stage.id === 'start' ? 'bg-gradient-to-b from-yellow-300 to-yellow-500' : ''}
                ${stage.id === 'concern' ? (isStageUnlocked ? 'bg-gradient-to-b from-sky-400 to-blue-600' : 'bg-gray-400') : ''}
                ${stage.id === 'control' ? (isStageUnlocked ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gray-400') : ''}
                ${stage.id === 'curiosity' ? (isStageUnlocked ? 'bg-gradient-to-b from-purple-400 to-purple-600' : 'bg-gray-400') : ''}
                ${stage.id === 'confidence' ? (isStageUnlocked ? 'bg-gradient-to-b from-orange-400 to-orange-600' : 'bg-gray-400') : ''}
                ${stage.id === 'adaptabilitas' ? (isStageUnlocked ? 'bg-gradient-to-b from-pink-400 to-pink-600' : 'bg-gray-400') : ''}
              `}>
                <div className="text-white font-extrabold text-sm sm:text-base text-center tracking-wide drop-shadow">
                  {stage.name}
                </div>
                
                {stage.id !== 'start' && stage.id !== 'adaptabilitas' && (stage.stats.lolos > 0 || stage.stats.gagal > 0) && (
                  <div className="text-xs text-white mt-2 text-center font-bold bg-black/30 px-2 py-1 rounded">
                    <div>LOLOS: {stage.stats.lolos}</div>
                    <div>GAGAL: {stage.stats.gagal}</div>
                  </div>
                )}
                
                {((stage.id === 'start' && startDone) || 
                  (stage.id !== 'start' && stage.id !== 'adaptabilitas' && latestPass[stage.id]?.passed === true) ||
                  (stage.id !== 'start' && stage.id !== 'adaptabilitas' && stageDone[stage.id] === true)) && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg animate-pulse">
                    <span className="text-white text-base font-bold">✓</span>
                  </div>
                )}
                
                {!canClick && stage.id !== 'start' && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 bg-opacity-90 rounded-full flex items-center justify-center z-10 border-2 border-white">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                )}
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* Desktop: Absolute Positioning (Original Layout) */}
      {stages.map((stage) => {
        const isStageUnlocked = stage.id === 'start' ? true : (unlocked[stage.id] === true);
        const canClick = isGuru === true || stage.id === 'start' || isStageUnlocked;
        
        return (
        <div
          key={stage.id}
          className={`hidden lg:block absolute z-20 group ${canClick ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
          style={{
            top: stage.position.top,
            left: stage.position.left,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={() => canClick && handleStageClick(stage.id)}
        >
          <div className={`
            relative transition-all duration-200 transform ${canClick ? 'hover:scale-110' : ''}
            rounded-2xl border-4 border-white/70 shadow-[0_6px_0_rgba(0,0,0,0.25)] px-4 py-2
            ${stage.id === 'start' ? 'bg-gradient-to-b from-yellow-300 to-yellow-500' : ''}
            ${stage.id === 'concern' ? (isStageUnlocked ? 'bg-gradient-to-b from-sky-400 to-blue-600' : 'bg-gray-400') : ''}
            ${stage.id === 'control' ? (isStageUnlocked ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gray-400') : ''}
            ${stage.id === 'curiosity' ? (isStageUnlocked ? 'bg-gradient-to-b from-purple-400 to-purple-600' : 'bg-gray-400') : ''}
            ${stage.id === 'confidence' ? (isStageUnlocked ? 'bg-gradient-to-b from-orange-400 to-orange-600' : 'bg-gray-400') : ''}
            ${stage.id === 'adaptabilitas' ? (isStageUnlocked ? 'bg-gradient-to-b from-pink-400 to-pink-600' : 'bg-gray-400') : ''}
          `}>
            <div className="text-white font-extrabold text-sm text-center tracking-wide drop-shadow">
              {stage.name}
            </div>
            
            {stage.id !== 'start' && stage.id !== 'adaptabilitas' && (stage.stats.lolos > 0 || stage.stats.gagal > 0) && (
              <div className="text-xs text-white mt-1 text-center font-bold bg-black/30 px-2 py-1 rounded">
                <div>LOLOS: {stage.stats.lolos}</div>
                <div>GAGAL: {stage.stats.gagal}</div>
              </div>
            )}
            
            {((stage.id === 'start' && startDone) || 
              (stage.id !== 'start' && stage.id !== 'adaptabilitas' && latestPass[stage.id]?.passed === true) ||
              (stage.id !== 'start' && stage.id !== 'adaptabilitas' && stageDone[stage.id] === true)) && (
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center ring-4 ring-white shadow-lg animate-pulse">
                <span className="text-white text-base font-bold">✓</span>
              </div>
            )}
            
            {!canClick && stage.id !== 'start' && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 bg-opacity-90 rounded-full flex items-center justify-center z-10 border-2 border-white">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            )}
          </div>
          
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            <GameBadge className="bg-black/70 border-white text-white">Klik untuk {canClick ? (stage.id === 'start' && startDone ? 'mengulang' : 'memulai') : 'membuka'} {stage.name}</GameBadge>
          </div>
        </div>
        );
      })}

      {/* Navigation Buttons */}
      <div className="absolute bottom-8 right-8 z-10 flex flex-wrap gap-2 justify-end">
        {/* Leaderboard - hanya untuk siswa */}
        {isAuthenticated && isGuru === false && (
          <button
            onClick={() => router.push('/leaderboard')}
            className="px-4 py-2 bg-amber-500 bg-opacity-90 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:bg-amber-600 transition-all duration-200 transform hover:scale-105 flex items-center gap-1"
            title="Papan Peringkat"
          >
            <span>🏆</span>
            <span className="hidden sm:inline">Peringkat</span>
          </button>
        )}
        {/* Refresh Button */}
        <button
          onClick={() => fetchStatus()}
          className="w-12 h-12 bg-blue-500 bg-opacity-90 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
          title="Refresh status"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        
        {/* Home Button */}
        <button
          onClick={() => router.push('/')}
          className="w-12 h-12 bg-white bg-opacity-90 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
          title="Home"
        >
          <svg className="w-6 h-6 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        </button>
        
        {/* Next Button */}
        <button
          onClick={() => {
            if (!isAuthenticated) {
              alert('Anda harus login terlebih dahulu');
              router.push('/login');
              return;
            }
            // Navigate to first available stage
            if (unlocked.concern) {
              router.push('/quiz/concern?mode=assessment');
            } else if (startDone) {
              router.push('/quiz/concern?mode=assessment');
            } else {
              router.push('/adaptabilitas');
            }
          }}
          className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg shadow-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-105"
        >
          NEXT
        </button>
      </div>


      {/* Login Prompt Overlay */}
      {!isAuthenticated && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Login Required</h3>
            <p className="text-gray-600 mb-6">
              Anda harus login terlebih dahulu untuk mengakses Career Compass Journey
            </p>
            <div className="flex space-x-4 justify-center">
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/register')}
                className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
