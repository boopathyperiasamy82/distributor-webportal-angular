import { Injectable, signal } from '@angular/core';

export interface Theme {
  id: string;
  label: string;
  accent: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  themes = signal<Theme[]>([
    { id: 'light-slate', label: 'Light Slate', accent: '#0ea5e9' },
    { id: 'nordic-mint', label: 'Nordic Mint', accent: '#10b981' },
    { id: 'sunset-breeze', label: 'Sunset Breeze', accent: '#f59e0b' },
    { id: 'lavender-mist', label: 'Lavender Mist', accent: '#8b5cf6' },
    { id: 'sakura-blossom', label: 'Sakura Blossom', accent: '#ec4899' },
    { id: 'carbon-dark', label: 'Carbon Dark', accent: '#0ea5e9' },
    { id: 'ocean-deep', label: 'Ocean Deep', accent: '#06b6d4' },
    { id: 'forest-sage', label: 'Forest Sage', accent: '#22c55e' }
  ]);

  currentTheme = signal<string>('light-slate');

  constructor() {
    this.init();
  }

  init() {
    const saved = localStorage.getItem('webportal_theme');
    if (saved) {
      this.applyTheme(saved);
    } else {
      this.applyTheme('light-slate');
    }
  }

  applyTheme(themeId: string) {
    this.currentTheme.set(themeId);
    document.documentElement.setAttribute('data-theme', themeId);
    localStorage.setItem('webportal_theme', themeId);
  }
}
