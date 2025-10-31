'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import { GameButton, GameCard } from '../../components/GameUI';

export default function Login() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.username, formData.password);
      alert('Login berhasil!');
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      alert('Terjadi kesalahan saat login');
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
                if (item === 'REGISTER') router.push('/register');
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </nav>

      {/* Form Container */}
      <GameCard className="max-w-md w-full mx-4 backdrop-blur-sm">
        <h2 className="text-3xl font-extrabold text-center text-white drop-shadow mb-6">Login</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-extrabold text-white mb-2 drop-shadow">Email</label>
            <input
              type="email"
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

          {/* Submit Button */}
          <GameButton type="submit" className="w-full">Login</GameButton>

          {/* Register Link */}
          <p className="text-center text-white/90 font-semibold">
            Belum punya akun?{' '}
            <span onClick={() => router.push('/register')} className="underline cursor-pointer">Daftar di sini</span>
          </p>
        </form>
      </GameCard>
    </div>
  );
}
