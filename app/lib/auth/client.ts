/**
 * Centralized client-side authentication utilities
 * Handles token and user management in localStorage
 */

import { UserWithoutPassword } from '@/types';

export const AuthClient = {
  // Token management
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('token', token);
  },

  removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
  },

  // User management
  getUser(): UserWithoutPassword | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as UserWithoutPassword;
    } catch {
      return null;
    }
  },

  setUser(user: UserWithoutPassword): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeUser(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
  },

  // Combined auth actions
  login(token: string, user: UserWithoutPassword): void {
    this.setToken(token);
    this.setUser(user);
  },

  logout(): void {
    this.removeToken();
    this.removeUser();
  },

  // Auth state check
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  },

  // Clear all auth data
  clearAll(): void {
    this.removeToken();
    this.removeUser();
  }
};
