'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { GameCard, GameButton, LoadingOverlay } from '../../components/GameUI';

type UserDoc = {
  role?: 'guru' | 'siswa';
};

export default function Register() {
  const router = useRouter();
  const { register: firebaseRegister, user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [userRole, setUserRole] = useState<'guru' | 'siswa' | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    usia: '',
    jenisKelamin: '',
    alamat: '',
    namaSekolah: '',
    email: '',
    phone: '',
    role: 'siswa' // default role
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      // Step 1: Create user di Firebase Auth dulu
      const authResult = await firebaseRegister(formData.email, formData.password);
      const userId = authResult?.user?.uid;
      
      if (!userId) {
        throw new Error('User ID tidak ditemukan setelah registrasi');
      }

      console.log('[Register] Firebase Auth user created with UID:', userId);
      
      // Step 2: Simpan data tambahan ke Firestore via API dengan userId dari Firebase Auth
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: userId // Kirim userId dari Firebase Auth
        }),
      });

      if (!response.ok) {
        const apiData = await response.json().catch(() => ({}));
        console.error('[Register] Failed to save user data:', apiData);
        console.warn('Firebase Auth user created, but Firestore document failed. User ID:', userId);
        throw new Error(apiData.message || 'Gagal menyimpan data pengguna');
      }

      const apiData = await response.json();
      console.log('[Register] User document saved successfully:', apiData);
      
      // Tunggu sebentar untuk menampilkan loading dan animasi sukses (lebih cepat)
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Redirect ke login tanpa alert yang mengganggu
      router.push('/login');
    } catch (error) {
      console.error('[Register] Registration error:', error);
      setLoading(false); // Reset loading jika error
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      if (errorMessage.includes('email-already-in-use') || errorMessage.includes('email sudah')) {
        alert('Email sudah terdaftar. Silakan login atau gunakan email lain.');
      } else if (errorMessage.includes('Gagal menyimpan')) {
        alert('Registrasi berhasil, tapi ada masalah menyimpan data. Silakan login dan coba lagi.');
      } else {
        alert(`Terjadi kesalahan: ${errorMessage}`);
      }
    }
  };

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
        console.error('[Register] Failed to fetch user role:', error);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.uid]);

  // Menu dasar - untuk guru, tidak tampilkan HASIL dan GURU BK/KONSELOR
  const navbarItems = userRole === 'guru'
    ? ['HOME', 'TENTANG', 'BIODATA GURU', 'PANTAU AKTIFITAS', 'DATA SISWA', 'CMS INTRO', 'CMS QUIZ', 'LOGOUT']
    : ['HOME', 'TENTANG', 'HASIL', 'GURU BK/KONSELOR', 'PROFIL', 'REGISTER', 'LOGIN'];
  
  // Jika user sudah login dan bukan guru, tambahkan PROFIL dan LOGOUT
  if (user && userRole !== 'guru') {
    if (!navbarItems.includes('PROFIL')) {
      navbarItems.push('PROFIL');
    }
    if (!navbarItems.includes('LOGOUT')) {
      navbarItems.push('LOGOUT');
    }
    // Hapus REGISTER dan LOGIN jika sudah login
    const registerIndex = navbarItems.indexOf('REGISTER');
    if (registerIndex > -1) navbarItems.splice(registerIndex, 1);
    const loginIndex = navbarItems.indexOf('LOGIN');
    if (loginIndex > -1) navbarItems.splice(loginIndex, 1);
  }

  return (
    <>
      <LoadingOverlay isLoading={loading} text="Memproses registrasi..." />
      <div 
        className="min-h-screen w-full relative flex items-center justify-center p-4"
        style={{
          backgroundImage: 'url(/Background_Front.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {/* Navbar */}
      <nav className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
        <div className="flex space-x-1 sm:space-x-2 flex-wrap gap-1">
          {navbarItems.map((item) => (
            <button
              key={item}
              className="px-2 py-1 text-[10px] sm:px-3 sm:py-2 sm:text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              onClick={() => {
                if (item === 'HOME') router.push('/');
                if (item === 'TENTANG') router.push('/tentang');
                if (item === 'GURU BK/KONSELOR') router.push('/profile');
                if (item === 'HASIL') router.push('/results');
                if (item === 'BIODATA GURU') router.push('/guru/biodata');
                if (item === 'PANTAU AKTIFITAS') router.push('/guru/pantau-aktifitas');
                if (item === 'DATA SISWA') router.push('/guru/data-siswa');
                if (item === 'CMS INTRO') router.push('/guru/cms-intro');
                if (item === 'CMS QUIZ') router.push('/guru/cms-quiz');
                if (item === 'PROFIL') router.push('/profile');
                if (item === 'REGISTER') router.push('/register');
                if (item === 'LOGIN') router.push('/login');
                if (item === 'LOGOUT') {
                  if (window.confirm('Apakah Anda yakin ingin logout?')) {
                    logout().then(() => {
                      router.push('/login');
                    }).catch((error) => {
                      console.error('Logout error:', error);
                      alert('Terjadi kesalahan saat logout');
                    });
                  }
                }
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      {/* Form Container */}
      <GameCard className="max-w-5xl w-full mx-4 backdrop-blur-sm">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-white drop-shadow mb-6">Registrasi</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid md:grid-cols-2 gap-3 max-h-[60vh] overflow-auto pr-2">
          {/* Role Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Daftar sebagai:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-xl bg-white/90 text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
              required
            >
              <option value="siswa">Siswa</option>
              <option value="guru">Guru BK/Konselor</option>
            </select>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
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

          {/* Usia */}
          <div>
            <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Usia</label>
            <input
              type="number"
              name="usia"
              value={formData.usia}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-xl bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
              required
            />
          </div>

          {/* Jenis Kelamin */}
          <div>
            <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Jenis Kelamin</label>
            <select
              name="jenisKelamin"
              value={formData.jenisKelamin}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-xl bg-white/90 text-gray-800 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
              required
            >
              <option value="">Pilih Jenis Kelamin</option>
              <option value="Laki-laki">Laki-laki</option>
              <option value="Perempuan">Perempuan</option>
            </select>
          </div>

          {/* Alamat */}
          <div className="md:col-span-2">
            <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Alamat</label>
            <textarea
              name="alamat"
              value={formData.alamat}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 rounded-xl bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
              required
            />
          </div>
          {/* Nama Sekolah */}
          <div>
            <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Nama Sekolah</label>
            <input
              type="text"
              name="namaSekolah"
              value={formData.namaSekolah}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-xl bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
              required
            />
          </div>

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

          {/* Phone/WA */}
          <div>
            <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Phone/WhatsApp</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-xl bg-white/90 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
              required
            />
          </div>
          </div>

          {/* Submit Button */}
          <GameButton type="submit" className="w-full">Daftar</GameButton>

          {/* Login Link */}
          <p className="text-center text-white/90 font-semibold">
            Sudah punya akun?{' '}
            <span onClick={() => router.push('/login')} className="underline cursor-pointer">Login di sini</span>
          </p>
        </form>
      </GameCard>
    </div>
    </>
  );
}
