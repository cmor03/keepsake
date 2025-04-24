import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Generate JWT token
export const generateToken = (userId) => {
  return jwt.sign({ userId }, JWT_SECRET, {
    expiresIn: '30d',
  });
};

// Set JWT token in cookie
export const setTokenCookie = async (token) => {
  const cookieStore = await cookies();
  cookieStore.set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
};

// Get token from cookie
export const getTokenFromCookie = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  return token;
};

// Verify and decode token
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
};

// Clear token cookie (logout)
export const clearTokenCookie = async () => {
  const cookieStore = await cookies();
  cookieStore.delete('token');
};

// Check if user is authenticated based on cookie
export const isAuthenticated = async () => {
  const token = await getTokenFromCookie();
  if (!token) return false;
  
  const decoded = verifyToken(token);
  return !!decoded;
};

// Check if user is admin
export const isAdmin = async (User, userId) => {
  try {
    const user = await User.findById(userId);
    return user?.isAdmin === true;
  } catch {
    return false;
  }
}; 