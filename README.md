# Password Vault - Secure Password Manager

A privacy-first password manager with client-side encryption, built with Next.js, TypeScript, and MongoDB.

## Features

###  Completed Features
- **Password Generator**: Customizable length, character sets, exclude similar characters
- **Secure Authentication**: Email/password registration and login
- **Client-side Encryption**: All sensitive data encrypted before storage using AES encryption
- **Vault Management**: Add, edit, delete password entries
- **Search & Filter**: Full-text search and tag-based filtering
- **Copy to Clipboard**: Auto-clearing clipboard after 15 seconds
- **Password Visibility Toggle**: Show/hide passwords securely
- **Responsive UI**: Clean, minimal interface optimized for speed

###  Security Features
- **Client-side Encryption**: Uses AES encryption (CryptoJS) to encrypt all sensitive vault data
- **JWT Authentication**: Secure session management with HTTP-only cookies
- **Password Hashing**: bcrypt with salt rounds for password storage
- **No Plaintext Storage**: Server never stores unencrypted passwords or sensitive data

###  User Experience
- **Instant Password Generation**: Real-time password creation with strength indicator
- **Auto-clearing Clipboard**: Passwords automatically cleared after 15 seconds
- **Visual Feedback**: Copy confirmations, loading states, error handling
- **Keyboard Shortcuts**: Efficient navigation and actions

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB
- **Encryption**: CryptoJS (AES encryption)
- **Authentication**: JWT + bcrypt
- **Styling**: Tailwind CSS
- **Icons**: Lucide React

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- MongoDB (local or cloud instance)

### Installation

1. **Clone and install dependencies**:
   ```bash
   cd password-vault
   npm install
   ```

2. **Environment Setup**:
   Create `.env.local` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/password-vault
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   ENCRYPTION_KEY=your-32-character-encryption-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. **Start MongoDB**:
   ```bash
   # If using local MongoDB
   mongod
   
   # Or use MongoDB Atlas cloud service
   ```

4. **Run the application**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   Visit [http://localhost:3000](http://localhost:3000)

## Usage

1. **Sign Up**: Create account with email and secure password
2. **Generate Passwords**: Use the built-in generator with customizable options
3. **Save Credentials**: Store website login credentials securely
4. **Search & Filter**: Find passwords quickly using search or tags
5. **Copy Safely**: Click copy button - passwords auto-clear from clipboard

## Crypto Implementation

**Encryption Library**: CryptoJS (AES-256)
**Why**: Industry-standard AES encryption with good browser support and TypeScript compatibility. All sensitive vault data (passwords, usernames, URLs, notes) are encrypted client-side before transmission to the server.

## Database Schema

```javascript
// Users Collection
{
  _id: ObjectId,
  email: String,
  password: String (bcrypt hashed),
  createdAt: Date
}

// Vault Items Collection  
{
  _id: ObjectId,
  userId: String,
  title: String,
  username: String (encrypted),
  password: String (encrypted), 
  url: String (encrypted),
  notes: String (encrypted),
  tags: Array<String>,
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user
- `GET /api/vault` - Get all vault items
- `POST /api/vault` - Create vault item
- `PUT /api/vault/[id]` - Update vault item
- `DELETE /api/vault/[id]` - Delete vault item

## Deployment

The application can be deployed to:
- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- **Heroku**

Make sure to:
1. Set environment variables in production
2. Use strong, unique encryption keys
3. Configure MongoDB connection for production
4. Enable HTTPS in production

## Security Considerations

- All sensitive data encrypted before leaving the client
- No plaintext passwords stored on server
- JWT tokens in HTTP-only cookies
- Input validation and sanitization
- Rate limiting recommended for production
- Regular security audits recommended

## License

MIT License - feel free to use for personal or commercial projects.