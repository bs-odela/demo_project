import { dbService } from './db.js';
import { emailService } from './emailService.js';

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

export const authService = {
  async login({ email, password }) {
    const user = await dbService.findUserByEmail(email);
    if (!user || user.password !== password) throw new Error('Invalid email or password');
    
    // Do not put sensitive fields into local storage in a real app, 
    // but for mock purposes we simulate a JWT payload
    const sessionUser = { ...user };
    delete sessionUser.password;
    localStorage.setItem('padhai_user', JSON.stringify(sessionUser));
    return sessionUser;
  },

  async signup(userData) {
    const existing = await dbService.findUserByEmail(userData.email);
    if (existing) throw new Error('Email already in use');

    const newUser = {
      id: crypto.randomUUID(),
      ...userData,
      streak: 1,
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    await dbService.put('users', newUser);
    
    const sessionUser = { ...newUser };
    delete sessionUser.password;
    localStorage.setItem('padhai_user', JSON.stringify(sessionUser));
    return sessionUser;
  },

  async requestSignupOtp(userData) {
    const existing = await dbService.findUserByEmail(userData.email);
    if (existing) throw new Error('Email already in use');
    
    const otp = generateOTP();
    const expiry = new Date(Date.now() + 5 * 60000); // 5 minutes

    const otpRequest = {
      id: userData.email, // using email as id
      otp,
      expiry: expiry.toISOString(),
      attempts: 0,
      signupData: userData
    };

    await dbService.put('otpRequests', otpRequest);
    await emailService.sendSignupOtp(userData.email, otp);
  },

  async verifySignupOtp(email, otpStr) {
    const request = await dbService.getById('otpRequests', email);
    if (!request) throw new Error('No pending signup found for this email. Please try signing up again.');

    if (new Date(request.expiry) < new Date()) {
      await dbService.delete('otpRequests', email);
      throw new Error('OTP has expired. Please request a new one.');
    }

    if (request.attempts >= 3) {
      await dbService.delete('otpRequests', email);
      throw new Error('Too many failed attempts. Please sign up again.');
    }

    if (request.otp !== otpStr) {
      request.attempts += 1;
      await dbService.put('otpRequests', request);
      throw new Error('Invalid OTP. Please try again.');
    }

    const newUser = {
      id: crypto.randomUUID(),
      ...request.signupData,
      streak: 1, // Start with a day 1 streak on account creation
      lastActive: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    await dbService.put('users', newUser);
    await dbService.delete('otpRequests', email);
    
    const sessionUser = { ...newUser };
    delete sessionUser.password;
    localStorage.setItem('padhai_user', JSON.stringify(sessionUser));
    return sessionUser;
  },

  logout() {
    localStorage.removeItem('padhai_user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('padhai_user');
    return user ? JSON.parse(user) : null;
  },
  
  async updateProfile(userId, updates) {
    const user = await dbService.getById('users', userId);
    if (!user) throw new Error('User not found');
    const updatedUser = { ...user, ...updates };
    await dbService.put('users', updatedUser);
    
    const currentUser = this.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
      const sessionUser = { ...updatedUser };
      delete sessionUser.password;
      localStorage.setItem('padhai_user', JSON.stringify(sessionUser));
    }
    return updatedUser;
  }
};
