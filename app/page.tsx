'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { GameButton } from '../components/GameUI';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, logout } = useAuth();
  
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
            <GameButton key={item} className="px-4 py-2 text-xs">
              {item}
            </GameButton>
          ))}
          
          {/* Conditional buttons based on login status */}
          {isAuthenticated ? (
            <>
              <GameButton className="px-4 py-2 text-xs" onClick={() => router.push('/profile')}>PROFIL</GameButton>
              <GameButton className="px-4 py-2 text-xs from-red-400 to-red-600" onClick={logout}>LOGOUT</GameButton>
            </>
          ) : (
            <>
              <GameButton className="px-4 py-2 text-xs" onClick={() => router.push('/register')}>REGISTER</GameButton>
              <GameButton className="px-4 py-2 text-xs" onClick={() => router.push('/login')}>LOGIN</GameButton>
            </>
          )}
        </div>
      </nav>


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