'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { GameButton } from '../components/GameUI';

type UserDoc = {
  role?: 'guru' | 'siswa';
};

type GuruUser = {
  id: string;
  email: string;
  username?: string;
  namaSekolah?: string;
  phone?: string;
  role?: 'guru' | 'siswa';
};

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, logout, user } = useAuth();
  const [userRole, setUserRole] = useState<'guru' | 'siswa' | null>(null);
  const [showGuruList, setShowGuruList] = useState(false);
  const [guruList, setGuruList] = useState<GuruUser[]>([]);
  const [loadingGuru, setLoadingGuru] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 5 item per halaman

  useEffect(() => {
    if (!user?.uid) {
      setUserRole(null);
      return;
    }
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/users?userId=${encodeURIComponent(user.uid)}`);
        if (res.ok) {
          const data = await res.json();
          if (active) {
            setUserRole((data.data as UserDoc)?.role || null);
          }
        }
      } catch (error) {
        console.error('[Home] Failed to fetch user role:', error);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.uid]);

  const fetchGuruList = async () => {
    setLoadingGuru(true);
    try {
      const res = await fetch('/api/users?role=guru');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setGuruList(data.data as GuruUser[]);
        }
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(errorData.error || 'Gagal memuat daftar guru');
      }
    } catch (error) {
      console.error('[Home] Failed to fetch guru list:', error);
      alert('Terjadi kesalahan saat memuat daftar guru');
    } finally {
      setLoadingGuru(false);
    }
  };

  const handleGuruBkClick = () => {
    if (isAuthenticated && userRole === 'guru') {
      router.push('/profile');
    } else {
      setShowGuruList(true);
      setCurrentPage(1); // Reset ke halaman 1 saat buka modal
      if (guruList.length === 0) {
        fetchGuruList();
      }
    }
  };

  // Menu dasar - semua user bisa lihat HASIL
  const navbarItems = userRole === 'guru' 
    ? ['HOME', 'TENTANG', 'HASIL']
    : ['HOME', 'TENTANG', 'HASIL', 'GURU BK/KONSELOR'];
  
  // Menu khusus untuk guru
  const guruMenuItems = userRole === 'guru' ? [
    'BIODATA GURU',
    'PANTAU AKTIFITAS',
    'DATA SISWA',
    'CMS INTRO',
    'CMS QUIZ',
    'CMS DEVELOPERS',
  ] : [];
  
  return (
    <div 
      className="min-h-screen w-full relative"
        style={{
          backgroundImage: 'url(/Background_Front.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
    >
      {/* Navbar */}
      <nav className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
        <div className="flex flex-wrap gap-1 sm:gap-2">
          {navbarItems.map((item) => (
            <GameButton 
              key={item} 
              className="px-2 py-1 text-[10px] sm:px-4 sm:py-2 sm:text-xs"
              onClick={() => {
                if (item === 'HOME') router.push('/');
                if (item === 'TENTANG') router.push('/tentang');
                if (item === 'GURU BK/KONSELOR') handleGuruBkClick();
                if (item === 'HASIL') router.push('/hasil');
              }}
            >
              {item}
            </GameButton>
          ))}
          
          {/* Menu khusus untuk guru */}
          {guruMenuItems.map((item) => (
            <GameButton 
              key={item} 
              className="px-2 py-1 text-[10px] sm:px-4 sm:py-2 sm:text-xs from-purple-400 to-purple-600"
              onClick={() => {
                if (item === 'BIODATA GURU') router.push('/guru/biodata');
                if (item === 'PANTAU AKTIFITAS') router.push('/guru/pantau-aktifitas');
                if (item === 'DATA SISWA') router.push('/guru/data-siswa');
                if (item === 'CMS INTRO') router.push('/guru/cms-intro');
                if (item === 'CMS QUIZ') router.push('/guru/cms-quiz');
                if (item === 'CMS DEVELOPERS') router.push('/guru/cms-developers');
              }}
            >
              {item}
            </GameButton>
          ))}
          
          {/* Conditional buttons based on login status */}
          {isAuthenticated ? (
            <>
              {userRole !== 'guru' && (
                <GameButton className="px-2 py-1 text-[10px] sm:px-4 sm:py-2 sm:text-xs" onClick={() => router.push('/profile')}>PROFIL</GameButton>
              )}
              <GameButton 
                className="px-2 py-1 text-[10px] sm:px-4 sm:py-2 sm:text-xs from-red-400 to-red-600" 
                onClick={async () => {
                  if (window.confirm('Apakah Anda yakin ingin logout?')) {
                    try {
                      await logout();
                      await new Promise(resolve => setTimeout(resolve, 500));
                      router.push('/login');
                    } catch (error) {
                      console.error('Logout error:', error);
                      alert('Terjadi kesalahan saat logout');
                    }
                  }
                }}
              >
                LOGOUT
              </GameButton>
            </>
          ) : (
            <>
              <GameButton className="px-2 py-1 text-[10px] sm:px-4 sm:py-2 sm:text-xs" onClick={() => router.push('/register')}>REGISTER</GameButton>
              <GameButton className="px-2 py-1 text-[10px] sm:px-4 sm:py-2 sm:text-xs" onClick={() => router.push('/login')}>LOGIN</GameButton>
            </>
          )}
        </div>
      </nav>

      {/* Modal Daftar Guru - Popup di tengah */}
      {showGuruList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => {
            setShowGuruList(false);
            setCurrentPage(1);
          }} />
          <div className="relative w-full max-w-md mx-4">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl border-4 border-blue-300 shadow-2xl">
            {/* Header dengan icon close */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-t-xl flex items-center justify-between">
              <h3 className="text-xl font-extrabold text-white">Daftar Guru BK/Konselor</h3>
              <button
                onClick={() => {
                  setShowGuruList(false);
                  setCurrentPage(1); // Reset ke halaman 1 saat tutup
                }}
                className="text-white hover:text-red-200 transition-colors p-1 rounded-full hover:bg-white/20"
                aria-label="Tutup"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {loadingGuru ? (
                <div className="text-center py-8">
                  <p className="text-gray-700 font-semibold">Memuat daftar guru...</p>
                </div>
              ) : guruList.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-700 font-semibold">Belum ada guru yang terdaftar</p>
                </div>
              ) : (() => {
                const totalPages = Math.ceil(guruList.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const currentGuruList = guruList.slice(startIndex, endIndex);

                return (
                  <>
                    <div className="space-y-3">
                      {currentGuruList.map((guru) => (
                        <div
                          key={guru.id}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-4"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-lg text-gray-800">
                                {guru.username || 'Nama tidak tersedia'}
                              </h3>
                              <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                                Guru BK
                              </span>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-700">
                                <span className="font-semibold">Email:</span> {guru.email}
                              </p>
                              {guru.namaSekolah && (
                                <p className="text-gray-700">
                                  <span className="font-semibold">Sekolah:</span> {guru.namaSekolah}
                                </p>
                              )}
                              {guru.phone && (
                                <p className="text-gray-700">
                                  <span className="font-semibold">Telepon:</span> {guru.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-4 flex items-center justify-between border-t border-blue-200 pt-4">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                            currentPage === 1
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          Sebelumnya
                        </button>
                        <span className="text-sm font-semibold text-gray-700">
                          Halaman {currentPage} dari {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded-lg font-semibold text-sm ${
                            currentPage === totalPages
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          Selanjutnya
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-col items-center justify-end min-h-screen pb-32">
        {/* Four Buttons */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          {[
            { text: 'Concern', top: true },
            { text: 'Control', top: true },
            { text: 'Curiosity', top: false },
            { text: 'Confidence', top: false }
          ].map((button) => (
            <GameButton key={button.text} className="w-48 h-16 text-lg">
              {button.text}
            </GameButton>
          ))}
        </div>

        {/* Start Button */}
        <GameButton className="px-12 py-4 text-xl" onClick={() => router.push('/journey')}>
          Ayo Mulai
        </GameButton>
      </div>
    </div>
  );
}