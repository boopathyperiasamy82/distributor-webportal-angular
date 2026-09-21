import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  username: string;
  name: string;
  role: string;
  userType: string;
  distrCode: string;
  cmpCode: string;
  menuAccess: string;
  editSellingRate: string;
  enableInitiateTransaction: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);

  currentUser = signal<User | null>(null);

  constructor() {
    this.initSession();
  }

  private initSession() {
    const userJson = sessionStorage.getItem('webportal_user');
    if (userJson) {
      try {
        this.currentUser.set(JSON.parse(userJson));
      } catch (e) {
        this.currentUser.set(null);
      }
    }
  }

  saveSession(user: User, token: string, source: 'xml' | 'mysql' | 'oracle') {
    sessionStorage.setItem('webportal_user', JSON.stringify(user));
    sessionStorage.setItem('webportal_token', token);
    sessionStorage.setItem('webportal_source', source);
    this.currentUser.set(user);
  }

  getUser(): User | null {
    return this.currentUser();
  }

  getToken(): string | null {
    return sessionStorage.getItem('webportal_token');
  }

  getSource(): 'xml' | 'mysql' | 'oracle' {
    return (sessionStorage.getItem('webportal_source') as 'xml' | 'mysql' | 'oracle') || 'xml';
  }

  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  clearSession() {
    sessionStorage.removeItem('webportal_user');
    sessionStorage.removeItem('webportal_token');
    sessionStorage.removeItem('webportal_source');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  getMenuAccess(): Set<string> {
    const user = this.getUser();
    if (!user || !user.menuAccess || user.menuAccess.trim() === '*' || user.role === 'ROLE_ADMIN' || user.role === 'Admin') {
      return new Set<string>(['*']);
    }
    const codes = user.menuAccess.split(',').map(m => m.trim()).filter(Boolean);
    return new Set<string>(codes.length > 0 ? codes : ['*']);
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'Admin';
  }

  getUserType(): string {
    return this.getUser()?.userType || '';
  }
}
