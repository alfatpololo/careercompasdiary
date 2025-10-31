export interface User {
  id: string;
  email: string;
  role: 'guru' | 'siswa';
  progress: Progress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Progress {
  levelId: string;
  score: number;
  completed: boolean;
  completedAt?: Date;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'guru' | 'siswa';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ProgressRequest {
  userId: string;
  levelId: string;
  score: number;
  completed: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

