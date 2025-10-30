'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { GameBadge } from '../../components/GameUI';

export default function JourneyMap() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [latestPass, setLatestPass] = useState<Record<string, { score: number; passed: boolean; createdAt: string }>>({});
  const [startDone, setStartDone] = useState<boolean>(false);
  const [stageDone, setStageDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function fetchStatus() {
      if (!user) return;
      try {
        const res = await fetch(`/api/stage?userId=${encodeURIComponent(user.uid)}`);
        if (res.ok) {
          const data = await res.json();
          setLatestPass(data.latest || {});
        }

        // Fetch start progress
        const prog = await fetch(`/api/progress?userId=${encodeURIComponent(user.uid)}`);
        if (prog.ok) {
          const pdata = await prog.json();
          const progArr: Array<{ levelId: string; completed: boolean }> = pdata?.data?.progress || [];
          const startItem = progArr.find((p) => p.levelId === 'start' && p.completed);
          setStartDone(!!startItem);
          const doneMap: Record<string, boolean> = {};
          for (const p of progArr) {
            if (['concern','control','curiosity','confidence'].includes(p.levelId)) {
              doneMap[p.levelId] = !!p.completed;
            }
          }
          setStageDone(doneMap);
        }
      } catch (e) {
        console.error('Failed to load stage status', e);
      }
    }
    fetchStatus();
  }, [user]);

  const unlocked = useMemo(() => {
    // Start always unlocked. Next stage unlocked only if previous passed
    const passedConcern = (latestPass['concern']?.passed === true) || stageDone['concern'] === true;
    const passedControl = (latestPass['control']?.passed === true) || stageDone['control'] === true;
    const passedCuriosity = (latestPass['curiosity']?.passed === true) || stageDone['curiosity'] === true;
    const passedConfidence = (latestPass['confidence']?.passed === true) || stageDone['confidence'] === true;
    return {
      start: true,
      concern: startDone, // buka setelah START selesai
      control: passedConcern,
      curiosity: passedConcern && passedControl,
      confidence: passedConcern && passedControl && passedCuriosity,
      adaptabilitas: passedConcern && passedControl && passedCuriosity && passedConfidence,
    } as Record<string, boolean>;
  }, [latestPass, startDone, stageDone]);

  const stages = [
    { 
      id: 'start', 
      name: 'Start', 
      position: { top: '70%', left: '10%' },
      stats: { lolos: 0, gagal: 0 },
      completed: true
    },
    { 
      id: 'concern', 
      name: 'Concern', 
      position: { top: '60%', left: '25%' },
      stats: { lolos: 0, gagal: 0 },
      completed: false
    },
    { 
      id: 'control', 
      name: 'Control', 
      position: { top: '78%', left: '52%' },
      stats: { lolos: 0, gagal: 0 },
      completed: false
    },
    { 
      id: 'curiosity', 
      name: 'Curiosity', 
      position: { top: '25%', left: '44%' },
      stats: { lolos: 0, gagal: 0 },
      completed: false
    },
    { 
      id: 'confidence', 
      name: 'Confidence', 
      position: { top: '65%', left: '75%' },
      stats: { lolos: 0, gagal: 0 },
      completed: false
    },
    { 
      id: 'adaptabilitas', 
      name: 'Adaptabilitas Career', 
      position: { top: '25%', left: '85%' },
      stats: { lolos: 0, gagal: 0 },
      completed: false
    }
  ];

  const handleStageClick = (stageId: string) => {
    if (!isAuthenticated) {
      alert('Anda harus login terlebih dahulu untuk mengakses stage ini');
      router.push('/login');
      return;
    }
    
    // Gate by unlock status
    if (!unlocked[stageId]) return;

    if (stageId === 'start') router.push('/quiz/concern?intro=1');
    else if (stageId === 'adaptabilitas') router.push('/adaptabilitas');
    else router.push(`/quiz/${stageId}?mode=assessment`);
  };

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

      {/* Interactive Stage Buttons */}
      {stages.map((stage) => (
        <div
          key={stage.id}
          className={`absolute z-20 group ${unlocked[stage.id] ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
          style={{
            top: stage.position.top,
            left: stage.position.left,
            transform: 'translate(-50%, -50%)'
          }}
          onClick={() => handleStageClick(stage.id)}
        >
          {/* Stage Button styled like game badge */}
          <div className={`
            relative transition-all duration-200 transform ${unlocked[stage.id] ? 'hover:scale-110' : ''}
            rounded-2xl border-4 border-white/70 shadow-[0_6px_0_rgba(0,0,0,0.25)] px-4 py-2
            ${stage.id === 'start' ? 'bg-gradient-to-b from-yellow-300 to-yellow-500' : ''}
            ${stage.id === 'concern' ? (unlocked['concern'] ? 'bg-gradient-to-b from-sky-400 to-blue-600' : 'bg-gray-400') : ''}
            ${stage.id === 'control' ? (unlocked['control'] ? 'bg-gradient-to-b from-emerald-400 to-emerald-600' : 'bg-gray-400') : ''}
            ${stage.id === 'curiosity' ? (unlocked['curiosity'] ? 'bg-gradient-to-b from-purple-400 to-purple-600' : 'bg-gray-400') : ''}
            ${stage.id === 'confidence' ? (unlocked['confidence'] ? 'bg-gradient-to-b from-orange-400 to-orange-600' : 'bg-gray-400') : ''}
            ${stage.id === 'adaptabilitas' ? (unlocked['adaptabilitas'] ? 'bg-gradient-to-b from-pink-400 to-pink-600' : 'bg-gray-400') : ''}
          `}>
            <div className="text-white font-extrabold text-sm text-center tracking-wide drop-shadow">
              {stage.name}
            </div>
            
            {/* Stats */}
            {stage.stats.lolos > 0 && (
              <div className="text-xs text-white mt-1 text-center">
                <div>LOLOS: {stage.stats.lolos}</div>
                <div>GAGAL: {stage.stats.gagal}</div>
              </div>
            )}
            
            {/* Completion Indicator */}
            {(latestPass[stage.id]?.passed || (stage.id==='start' && startDone)) && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-white">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            )}
          </div>
          
          {/* Hover Tooltip */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
            <GameBadge className="bg-black/70 border-white text-white">Klik untuk {unlocked[stage.id] ? 'memulai' : 'membuka'} {stage.name}</GameBadge>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <div className="absolute bottom-8 right-8 z-10 flex space-x-4">
        {/* Home Button */}
        <button
          onClick={() => router.push('/')}
          className="w-12 h-12 bg-white bg-opacity-90 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 flex items-center justify-center"
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
            router.push('/quiz/concern');
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
