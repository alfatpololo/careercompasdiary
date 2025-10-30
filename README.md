# Quiz Game Backend - Next.js + Firebase

A Next.js 15 backend API for a quiz game built with GDevelop. This project provides authentication, user management, and progress tracking for quiz games.

## 🚀 Features

- **User Authentication**: Register and login with Firebase Auth
- **Progress Tracking**: Save and retrieve quiz progress by level
- **User Management**: Get user data and manage roles (guru/siswa)
- **RESTful API**: Clean API endpoints for GDevelop integration
- **TypeScript**: Full type safety throughout the application
- **Firebase Integration**: Auth + Firestore for data persistence

## 📁 Project Structure

```
project/
├── app/
│   ├── api/
│   │   ├── register/route.ts    # User registration
│   │   ├── login/route.ts       # User authentication
│   │   ├── progress/route.ts    # Progress management
│   │   └── users/route.ts       # User data management
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── lib/
│   └── firebase.ts              # Firebase configuration
├── types/
│   └── user.ts                  # TypeScript interfaces
├── .env.example                 # Environment variables template
└── README.md                    # This file
```

## 🛠️ Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Firebase Project Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication:
   - Go to Authentication > Sign-in method
   - Enable Email/Password provider
4. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Set up security rules (see below)

### 3. Get Firebase Configuration

#### Client Configuration:
1. Go to Project Settings > General
2. Scroll down to "Your apps" section
3. Click "Add app" > Web app
4. Copy the config values

#### Admin Configuration:
1. Go to Project Settings > Service accounts
2. Click "Generate new private key"
3. Download the JSON file
4. Extract the values from the JSON

### 4. Environment Variables

1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Fill in your Firebase configuration:
```env
# Firebase Client Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_actual_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_actual_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_actual_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_actual_app_id

# Firebase Admin Configuration
FIREBASE_ADMIN_PROJECT_ID=your_actual_project_id
FIREBASE_ADMIN_CLIENT_EMAIL=your_service_account_email
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_actual_private_key\n-----END PRIVATE KEY-----\n"
```

### 5. Firestore Security Rules

Add these rules to your Firestore database:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 6. Run the Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST /api/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "siswa"
}
```

**Response:**
```json
{
  "success": true,
  "data": { "userId": "firebase_user_id" },
  "message": "User registered successfully"
}
```

#### Login User
```http
POST /api/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "firebase_custom_token",
    "userId": "firebase_user_id"
  },
  "message": "Login successful"
}
```

### Progress Management

#### Get User Progress
```http
GET /api/progress?userId=firebase_user_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "progress": [
      {
        "levelId": 1,
        "score": 85,
        "completed": true,
        "completedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Update User Progress
```http
POST /api/progress
Content-Type: application/json

{
  "userId": "firebase_user_id",
  "levelId": 1,
  "score": 90,
  "completed": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "progress": [
      {
        "levelId": 1,
        "score": 90,
        "completed": true,
        "completedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  },
  "message": "Progress updated successfully"
}
```

### User Management

#### Get User Data
```http
GET /api/users?userId=firebase_user_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "firebase_user_id",
    "email": "user@example.com",
    "role": "siswa",
    "progress": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

## 🎮 GDevelop Integration

### Example GDevelop JavaScript Code

#### Register User
```javascript
// In GDevelop
const registerUser = async (email, password, role) => {
  try {
    const response = await fetch('http://localhost:3000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
        role: role
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('User registered:', data.data.userId);
      return data.data.userId;
    } else {
      console.error('Registration failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
};
```

#### Login User
```javascript
const loginUser = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Login successful:', data.data.userId);
      return data.data;
    } else {
      console.error('Login failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
};
```

#### Save Progress
```javascript
const saveProgress = async (userId, levelId, score, completed) => {
  try {
    const response = await fetch('http://localhost:3000/api/progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        levelId: levelId,
        score: score,
        completed: completed
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Progress saved successfully');
      return true;
    } else {
      console.error('Save failed:', data.error);
      return false;
    }
  } catch (error) {
    console.error('Network error:', error);
    return false;
  }
};
```

#### Load Progress
```javascript
const loadProgress = async (userId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/progress?userId=${userId}`);
    const data = await response.json();
    
    if (data.success) {
      console.log('Progress loaded:', data.data.progress);
      return data.data.progress;
    } else {
      console.error('Load failed:', data.error);
      return [];
    }
  } catch (error) {
    console.error('Network error:', error);
    return [];
  }
};
```

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Data Structure

#### User Document in Firestore
```json
{
  "email": "user@example.com",
  "role": "siswa",
  "progress": [
    {
      "levelId": 1,
      "score": 85,
      "completed": true,
      "completedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

This is a standard Next.js application and can be deployed to any platform that supports Node.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📝 License

MIT License - feel free to use this project for your quiz games!

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.# careercompasdiary
# careercompasdiary
