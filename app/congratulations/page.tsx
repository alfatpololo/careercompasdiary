'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function Congratulations() {
  const router = useRouter();
  useAuth();

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4" 
      style={{
        backgroundImage: 'url(/Background_Mulai.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="bg-white bg-opacity-95 rounded-lg shadow-2xl p-12 max-w-2xl w-full text-center">
        <div className="text-7xl mb-6">🎉</div>
        
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Selamat! 🎊
        </h1>
        
        <p className="text-xl text-gray-600 mb-6">
          Anda telah menyelesaikan tahap START dengan baik! 🎊
        </p>
        
        <p className="text-lg text-gray-700 mb-4">
          Selamat! Anda sudah menyelesaikan seluruh proses pengisian evaluasi. 
          Tahap START telah dicentang dan stage berikutnya (Concern) sekarang sudah terbuka untuk Anda. ✨
        </p>
        
        <p className="text-base text-gray-600 mb-8">
          Lanjutkan perjalanan Anda dengan mengklik tombol di bawah untuk melihat Journey Map, 
          di mana Anda akan melihat centang hijau pada stage START dan bisa melanjutkan ke stage berikutnya.
        </p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push('/journey?refresh=true')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Lihat Journey Map
          </button>
        </div>
      </div>
    </div>
  );
}
