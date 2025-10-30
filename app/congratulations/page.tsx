'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function Congratulations() {
  const router = useRouter();
  const { user } = useAuth();

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
          Anda telah menyelesaikan seluruh kuesioner Career Compass DIARY dengan baik!
        </p>
        
        <p className="text-lg text-gray-700 mb-4">
          Terima kasih atas partisipasi dan kejujuran Anda dalam mengisi kuesioner ini. 🌟
        </p>
        
        <p className="text-base text-gray-600 mb-8">
          Hasil yang Anda peroleh akan membantu Anda memahami lebih dalam tentang adaptabilitas karier Anda.
        </p>

        <div className="flex justify-center space-x-4">
          <button
            onClick={() => router.push('/quiz/concern')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors flex items-center"
          >
            Mulai Concern
          </button>
          
          <button
            onClick={() => router.push('/journey')}
            className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors"
          >
            Kembali ke Journey
          </button>
        </div>
      </div>
    </div>
  );
}
