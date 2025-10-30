'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuth();

  if (!user) {
    return (
      <div 
        className="min-h-screen w-full relative flex items-center justify-center"
        style={{
          backgroundImage: 'url(/Background_Front.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="bg-white bg-opacity-90 rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 backdrop-blur-sm text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Akses Ditolak</h2>
          <p className="text-gray-600 mb-6">Anda harus login terlebih dahulu</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  type OptionalProfile = {
    username?: string;
    role?: 'guru' | 'siswa';
    usia?: number;
    jenisKelamin?: string;
    phone?: string;
    alamat?: string;
    namaSekolah?: string;
  };
  const profile = user as unknown as OptionalProfile;

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
      <nav className="absolute top-4 right-4 z-10">
        <div className="flex space-x-2">
          {['HOME', 'TENTANG', 'GURU BK/KONSELOR', 'HASIL'].map((item) => (
            <button
              key={item}
              className="px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              style={{
                clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)'
              }}
              onClick={() => {
                if (item === 'HOME') router.push('/');
              }}
            >
              {item}
            </button>
          ))}
          
          <button
            className="px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            style={{
              clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)'
            }}
            onClick={() => router.push('/profile')}
          >
            PROFIL
          </button>
          <button
            className="px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            style={{
              clipPath: 'polygon(10% 0%, 90% 0%, 100% 50%, 90% 100%, 10% 100%, 0% 50%)'
            }}
            onClick={logout}
          >
            LOGOUT
          </button>
        </div>
      </nav>

      {/* Profile Content */}
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="bg-white bg-opacity-90 rounded-lg shadow-2xl p-8 max-w-2xl w-full backdrop-blur-sm">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">Profil Pengguna</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-800">
                {user.displayName || profile.username || user.email || user.uid}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-800">
                {user.email}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-800">
                {profile.role ? (profile.role === 'guru' ? 'Guru BK/Konselor' : 'Siswa') : '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Usia</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-800">
                {profile.usia ?? '-'} {profile.usia ? 'tahun' : ''}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Jenis Kelamin</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-800">
                {profile.jenisKelamin ?? '-'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone/WA</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-800">
                {profile.phone ?? '-'}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Alamat</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-800">
                {profile.alamat ?? '-'}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Nama Sekolah</label>
              <div className="px-3 py-2 bg-gray-100 rounded-md text-gray-800">
                {profile.namaSekolah ?? '-'}
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => router.push('/')}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Kembali ke Home
            </button>
            <button
              onClick={logout}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

