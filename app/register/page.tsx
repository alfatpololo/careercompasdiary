'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GameCard, GameButton } from '../../components/GameUI';

export default function Register() {
  const router = useRouter();
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
    
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('Registrasi berhasil!');
        router.push('/login');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Terjadi kesalahan saat registrasi');
    }
  };

  return (
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
      <nav className="absolute top-4 right-4 z-10">
        <div className="flex space-x-2">
          {['HOME', 'TENTANG', 'GURU BK/KONSELOR', 'HASIL', 'PROFIL', 'REGISTER', 'LOGIN'].map((item) => (
            <button
              key={item}
              className="px-3 py-2 text-xs font-semibold text-white bg-gradient-to-r from-green-500 to-blue-500 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              onClick={() => {
                if (item === 'HOME') router.push('/');
                if (item === 'LOGIN') router.push('/login');
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      {/* Form Container */}
      <GameCard className="max-w-5xl w-full mx-4 backdrop-blur-sm">
        <h2 className="text-3xl font-extrabold text-center text-white drop-shadow mb-6">Registrasi</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid md:grid-cols-2 gap-3 max-h-[60vh] overflow-auto pr-2">
          {/* Role Selection */}
          <div className="md:col-span-2">
            <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Daftar sebagai:</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-xl bg-white/90 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
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
              className="w-full px-3 py-2 rounded-xl bg-white/90 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
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
              className="w-full px-3 py-2 rounded-xl bg-white/90 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
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
              className="w-full px-3 py-2 rounded-xl bg-white/90 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
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
              className="w-full px-3 py-2 rounded-xl bg-white/90 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
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
              className="w-full px-3 py-2 rounded-xl bg-white/90 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
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
              className="w-full px-3 py-2 rounded-xl bg-white/90 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
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
              className="w-full px-3 py-2 rounded-xl bg-white/90 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
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
              className="w-full px-3 py-2 rounded-xl bg-white/90 focus:outline-none focus:ring-4 focus:ring-emerald-300 border-4 border-white/70"
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
  );
}
