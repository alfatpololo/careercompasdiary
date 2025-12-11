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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    setIsMenuOpen(false); // Tutup menu saat klik
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
      className="min-h-screen w-full relative overflow-x-hidden home-background"
    >
      {/* Navbar */}
      <nav className="absolute top-2 right-2 sm:top-3 sm:right-3 md:top-4 md:right-4 lg:top-4 lg:right-4 z-50">
        {/* Hamburger Menu Button - Mobile & Tablet Only */}
        <div className="lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-xl p-2.5 sm:p-3 shadow-[0_4px_0_#0f5132] hover:translate-y-[1px] active:translate-y-[2px] border-4 border-white/60"
            aria-label="Toggle menu"
          >
            <svg 
              className="w-6 h-6 sm:w-7 sm:h-7 text-white" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Mobile/Tablet Menu Dropdown */}
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                onClick={() => setIsMenuOpen(false)}
              />
              <div className="absolute top-12 sm:top-14 right-0 w-[calc(100vw-1rem)] max-w-64 sm:max-w-72 bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl border-4 border-emerald-400 shadow-2xl z-50 max-h-[85vh] overflow-y-auto">
                <div className="p-3 sm:p-4 space-y-2">
                  {navbarItems.map((item) => (
                    <GameButton 
                      key={item} 
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base justify-start"
                      onClick={() => {
                        setIsMenuOpen(false);
                        if (item === 'HOME') router.push('/');
                        if (item === 'TENTANG') router.push('/tentang');
                        if (item === 'GURU BK/KONSELOR') {
                          handleGuruBkClick();
                          setIsMenuOpen(false);
                        }
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
                      className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base justify-start from-purple-400 to-purple-600"
                      onClick={() => {
                        setIsMenuOpen(false);
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
                        <GameButton 
                          className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base justify-start" 
                          onClick={() => {
                            setIsMenuOpen(false);
                            router.push('/profile');
                          }}
                        >
                          PROFIL
                        </GameButton>
                      )}
                      <GameButton 
                        className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base justify-start from-red-400 to-red-600" 
                        onClick={async () => {
                          setIsMenuOpen(false);
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
                      <GameButton 
                        className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base justify-start" 
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push('/register');
                        }}
                      >
                        REGISTER
                      </GameButton>
                      <GameButton 
                        className="w-full px-4 py-2.5 sm:py-3 text-sm sm:text-base justify-start" 
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push('/login');
                        }}
                      >
                        LOGIN
                      </GameButton>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Desktop Menu - All Buttons Visible */}
        <div className="hidden lg:flex flex-wrap gap-2 justify-end">
          {navbarItems.map((item) => (
            <GameButton 
              key={item} 
              className="px-4 py-2 text-sm"
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
              className="px-4 py-2 text-sm from-purple-400 to-purple-600"
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
                <GameButton className="px-4 py-2 text-sm" onClick={() => router.push('/profile')}>PROFIL</GameButton>
              )}
              <GameButton 
                className="px-4 py-2 text-sm from-red-400 to-red-600" 
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
              <GameButton className="px-4 py-2 text-sm" onClick={() => router.push('/register')}>REGISTER</GameButton>
              <GameButton className="px-4 py-2 text-sm" onClick={() => router.push('/login')}>LOGIN</GameButton>
            </>
          )}
        </div>
      </nav>

      {/* Modal Daftar Guru - Popup di tengah */}
      {showGuruList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6">
          <div className="absolute inset-0 bg-black/50" onClick={() => {
            setShowGuruList(false);
            setCurrentPage(1);
          }} />
          <div className="relative w-full max-w-xs sm:max-w-md md:max-w-lg mx-2 sm:mx-4">
            <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl sm:rounded-2xl border-2 sm:border-4 border-blue-300 shadow-2xl">
            {/* Header dengan icon close */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-3 sm:p-4 rounded-t-lg sm:rounded-t-xl flex items-center justify-between">
              <h3 className="text-base sm:text-lg md:text-xl font-extrabold text-white pr-2">Daftar Guru BK/Konselor</h3>
              <button
                onClick={() => {
                  setShowGuruList(false);
                  setCurrentPage(1); // Reset ke halaman 1 saat tutup
                }}
                className="text-white hover:text-red-200 transition-colors p-1 rounded-full hover:bg-white/20 flex-shrink-0"
                aria-label="Tutup"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-3 sm:p-4 max-h-[50vh] sm:max-h-[60vh] md:max-h-[70vh] overflow-y-auto">
              {loadingGuru ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-700 font-semibold text-sm sm:text-base">Memuat daftar guru...</p>
                </div>
              ) : guruList.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <p className="text-gray-700 font-semibold text-sm sm:text-base">Belum ada guru yang terdaftar</p>
                </div>
              ) : (() => {
                const totalPages = Math.ceil(guruList.length / itemsPerPage);
                const startIndex = (currentPage - 1) * itemsPerPage;
                const endIndex = startIndex + itemsPerPage;
                const currentGuruList = guruList.slice(startIndex, endIndex);

                return (
                  <>
                    <div className="space-y-2 sm:space-y-3">
                      {currentGuruList.map((guru) => (
                        <div
                          key={guru.id}
                          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg sm:rounded-xl border-2 border-blue-200 p-3 sm:p-4"
                        >
                          <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <h3 className="font-bold text-base sm:text-lg text-gray-800 break-words">
                                {guru.username || 'Nama tidak tersedia'}
                              </h3>
                              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-500 text-white text-[10px] sm:text-xs font-semibold rounded-full whitespace-nowrap">
                                Guru BK
                              </span>
                            </div>
                            <div className="space-y-1 text-xs sm:text-sm">
                              <p className="text-gray-700 break-words">
                                <span className="font-semibold">Email:</span> {guru.email}
                              </p>
                              {guru.namaSekolah && (
                                <p className="text-gray-700 break-words">
                                  <span className="font-semibold">Sekolah:</span> {guru.namaSekolah}
                                </p>
                              )}
                              {guru.phone && (
                                <p className="text-gray-700 break-words">
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
                      <div className="mt-3 sm:mt-4 flex items-center justify-between border-t border-blue-200 pt-3 sm:pt-4 gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                          disabled={currentPage === 1}
                          className={`px-2 sm:px-3 py-1 rounded-lg font-semibold text-xs sm:text-sm ${
                            currentPage === 1
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-blue-500 text-white hover:bg-blue-600'
                          }`}
                        >
                          Sebelumnya
                        </button>
                        <span className="text-xs sm:text-sm font-semibold text-gray-700 text-center">
                          Halaman {currentPage} dari {totalPages}
                        </span>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-2 sm:px-3 py-1 rounded-lg font-semibold text-xs sm:text-sm ${
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
      <div className="flex flex-col items-center justify-center sm:justify-end min-h-screen px-4 sm:px-4 md:px-6 lg:px-8 w-full max-w-full overflow-x-hidden pb-0 sm:pb-16 md:pb-20 lg:pb-24 xl:pb-32">
        <div className="flex flex-col items-center -mt-16 sm:mt-0">
          {/* Four Buttons */}
          <div className="grid grid-cols-2 gap-3 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 mb-5 sm:mb-6 md:mb-8 lg:mb-10 xl:mb-12 w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-2xl mx-auto">
          {[
            { text: 'Concern', top: true },
            { text: 'Control', top: true },
            { text: 'Curiosity', top: false },
            { text: 'Confidence', top: false }
          ].map((button) => (
            <GameButton 
              key={button.text} 
              className="w-full h-11 sm:h-12 md:h-14 lg:h-16 xl:h-20 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-extrabold"
            >
              {button.text}
            </GameButton>
          ))}
        </div>

          {/* Start Button */}
          <GameButton 
            className="px-8 sm:px-8 md:px-10 lg:px-12 xl:px-14 py-3 sm:py-3 md:py-3.5 lg:py-4 xl:py-5 text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl w-full max-w-[200px] sm:max-w-xs md:max-w-sm lg:max-w-md xl:max-w-lg font-extrabold mx-auto" 
            onClick={() => router.push('/journey')}
          >
            Ayo Mulai
          </GameButton>
        </div>
      </div>
    </div>
  );
}