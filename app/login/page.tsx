'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { GameButton, GameCard, LoadingOverlay } from '../../components/GameUI';

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

export default function Login() {
  const router = useRouter();
  const { login, user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'guru' | 'siswa' | null>(null);
  const [showGuruList, setShowGuruList] = useState(false);
  const [guruList, setGuruList] = useState<GuruUser[]>([]);
  const [loadingGuru, setLoadingGuru] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 5 item per halaman
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

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
        console.error('[Login] Failed to fetch user role:', error);
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
      console.error('[Login] Failed to fetch guru list:', error);
      alert('Terjadi kesalahan saat memuat daftar guru');
    } finally {
      setLoadingGuru(false);
    }
  };

  const handleGuruBkClick = () => {
    if (user && userRole === 'guru') {
      router.push('/profile');
    } else {
      setShowGuruList(true);
      setCurrentPage(1); // Reset ke halaman 1 saat buka modal
      if (guruList.length === 0) {
        fetchGuruList();
      }
    }
  };

  // Navbar items berdasarkan status login - SELALU tampilkan navbar
  // Menu GURU BK/KONSELOR SELALU ditampilkan (untuk siswa, guru, dan belum login) !IMPORTANT!
  // TIDAK bergantung pada userRole, hanya bergantung pada user (login status)
  const navbarItems = useMemo(() => {
    // Menu dasar - untuk guru, tidak tampilkan HASIL dan GURU BK/KONSELOR
    const items: string[] = userRole === 'guru'
      ? ['HOME', 'TENTANG']
      : ['HOME', 'TENTANG', 'HASIL', 'GURU BK/KONSELOR'];
    
    // Menu khusus untuk guru
    if (userRole === 'guru') {
      items.push('BIODATA GURU', 'PANTAU AKTIFITAS', 'DATA SISWA', 'CMS INTRO', 'CMS QUIZ', 'CMS INTRO EVALUASI');
    }
    
    // Jika user sudah login (baik siswa maupun guru) - TIDAK peduli userRole
    if (user) {
      if (userRole !== 'guru') {
        items.push('PROFIL');
      }
      items.push('LOGOUT');
    } else {
      // Jika belum login
      items.push('REGISTER');
      items.push('LOGIN');
    }
    
    return items;
  }, [user, userRole]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      alert('Login berhasil!');
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Terjadi kesalahan saat login';
      
      if (error && typeof error === 'object' && 'code' in error) {
        const firebaseError = error as { code?: string; message?: string };
        if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/user-not-found') {
          errorMessage = 'Email tidak terdaftar atau password salah.\n\nSetelah reset Firebase, semua akun telah dihapus.\nSilakan daftar ulang dengan email baru atau klik "Daftar di sini" untuk membuat akun baru.';
        } else if (firebaseError.code === 'auth/wrong-password') {
          errorMessage = 'Password salah. Silakan coba lagi.';
        } else if (firebaseError.code === 'auth/user-disabled') {
          errorMessage = 'Akun ini telah dinonaktifkan. Hubungi administrator.';
        } else if (firebaseError.code === 'auth/too-many-requests') {
          errorMessage = 'Terlalu banyak percobaan login yang gagal. Silakan coba lagi nanti.';
        } else if (firebaseError.message) {
          errorMessage = firebaseError.message;
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay isLoading={loading} text="Memproses login..." />
      <div 
        className="min-h-screen w-full relative flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url(/Background_Front.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Navbar - SELALU tampilkan dengan styling konsisten */}
        <nav className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
          <div className="flex space-x-1 sm:space-x-2 flex-wrap gap-1">
            {navbarItems && navbarItems.length > 0 ? (
              navbarItems.map((item) => {
                // LOGOUT button dengan styling merah
                if (item === 'LOGOUT') {
                  return (
                    <GameButton
                      key={item}
                      className="px-2 py-1 text-[10px] sm:px-4 sm:py-2 sm:text-xs from-red-400 to-red-600"
                      onClick={async () => {
                        if (window.confirm('Apakah Anda yakin ingin logout?')) {
                          try {
                            await logout();
                            // Tunggu sebentar untuk menampilkan animasi
                            await new Promise(resolve => setTimeout(resolve, 800));
                            router.push('/login');
                          } catch (error) {
                            console.error('Logout error:', error);
                            alert('Terjadi kesalahan saat logout');
                          }
                        }
                      }}
                    >
                      {item}
                    </GameButton>
                  );
                }
                // Button lainnya dengan styling standar
                return (
                  <GameButton
                    key={item}
                    className="px-2 py-1 text-[10px] sm:px-4 sm:py-2 sm:text-xs"
                    onClick={() => {
                      if (item === 'HOME') router.push('/');
                      if (item === 'TENTANG') router.push('/tentang');
                      if (item === 'GURU BK/KONSELOR') handleGuruBkClick();
                      if (item === 'HASIL') router.push('/results');
                      if (item === 'BIODATA GURU') router.push('/guru/biodata');
                      if (item === 'PANTAU AKTIFITAS') router.push('/guru/pantau-aktifitas');
                      if (item === 'DATA SISWA') router.push('/guru/data-siswa');
                      if (item === 'CMS INTRO') router.push('/guru/cms-intro');
                      if (item === 'CMS QUIZ') router.push('/guru/cms-quiz');
                      if (item === 'CMS INTRO EVALUASI') router.push('/guru/cms-evaluation');
                      if (item === 'PROFIL') router.push('/profile');
                      if (item === 'REGISTER') router.push('/register');
                      if (item === 'LOGIN') router.push('/login');
                    }}
                  >
                    {item}
                  </GameButton>
                );
              })
            ) : (
              <div className="text-white text-xs">Loading navbar...</div>
            )}
          </div>
        </nav>

      {/* Form Container */}
      <GameCard className="max-w-md w-full mx-4 backdrop-blur-sm">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white drop-shadow mb-6">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-xl bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-xl bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
              required
            />
          </div>

          {/* Submit Button */}
          <GameButton type="submit" className="w-full">Login</GameButton>

          {/* Register Link */}
          <p className="text-center text-white/90 font-semibold">
            Belum punya akun?{' '}
            <span onClick={() => router.push('/register')} className="underline cursor-pointer">Daftar di sini</span>
          </p>
        </form>
      </GameCard>

      {/* Modal Daftar Guru - Popup di tengah */}
      {showGuruList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => {
            setShowGuruList(false);
            setCurrentPage(1);
          }} />
          <div className="relative w-full max-w-md">
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
    </div>
    </>
  );
}
