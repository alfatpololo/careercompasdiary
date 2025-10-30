'use client';

import { useState } from 'react';

interface TextToSpeechProps {
  text: string;
  className?: string;
}

export function TextToSpeech({ text, className = '' }: TextToSpeechProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speakText = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID'; // Indonesian language
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Browser Anda tidak mendukung text-to-speech');
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  return (
    <button
      onClick={isSpeaking ? stopSpeaking : speakText}
      className={`${className} flex items-center justify-center transition-all`}
      title={isSpeaking ? 'Stop membaca' : 'Baca teks'}
    >
      <svg 
        className={`w-6 h-6 ${isSpeaking ? 'text-red-500' : 'text-blue-600'}`}
        fill="currentColor" 
        viewBox="0 0 24 24"
      >
        {isSpeaking ? (
          <path d="M6 6h4v12H6V6zm8 0h4v12h-4V6z"/>
        ) : (
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v2.58c-1.94.42-3.4 1.77-3.4 3.76 0 2.16 1.81 3.36 4.03 3.9 1.42.29 2.33.73 2.33 1.55 0 .82-.77 1.47-2.03 1.47-1.39 0-2.01-.61-2.03-1.84H6.34c.04 1.77 1.34 2.94 3.56 3.36V19h2.31v-2.82c1.73-.35 3.23-1.71 3.23-3.78 0-2.02-1.61-3.06-3.99-3.54z"/>
        )}
      </svg>
    </button>
  );
}

