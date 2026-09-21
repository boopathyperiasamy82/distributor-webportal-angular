import { Component, HostListener, OnInit, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { MenuService } from '../../core/services/menu.service';
import { ThemeService } from '../../core/services/theme.service';
import { ApiService } from '../../core/services/api.service';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './shell.component.html',
  styleUrls: ['./shell.component.scss']
})
export class ShellComponent implements OnInit {
  auth = inject(AuthService);
  menuService = inject(MenuService);
  themeService = inject(ThemeService);
  api = inject(ApiService);
  router = inject(Router);

  sidebarCollapsed = signal(false);
  profileDropdownOpen = signal(false);
  themePanelOpen = signal(false);
  commandSearchQuery = signal('');
  commandPaletteOpen = signal(false);
  menuItems = signal<any[]>([]);
  expandedGroups = signal<Set<string>>(new Set<string>());

  user = this.auth.currentUser;

  allFlatMenus = computed(() => {
    const flat: any[] = [];
    for (const group of this.menuItems()) {
      if (group.children) {
        for (const child of group.children) {
          flat.push({
            groupName: group.menuDescription,
            code: child.menuCode,
            desc: child.menuDescription,
            route: this.menuService.getRouteForCode(child.menuCode)
          });
        }
      }
    }
    return flat;
  });

  filteredCommandMenus = computed(() => {
    const q = this.commandSearchQuery().toLowerCase().trim();
    if (!q) return this.allFlatMenus();
    return this.allFlatMenus().filter(m =>
      m.desc.toLowerCase().includes(q) || m.groupName.toLowerCase().includes(q) || m.code.toLowerCase().includes(q)
    );
  });

  @HostListener('window:keydown', ['$event'])
  handleGlobalShortcut(e: KeyboardEvent): void {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      this.commandPaletteOpen.update(v => !v);
    }
  }

  userInitials = computed(() => {
    const name = this.user()?.name || this.user()?.username || 'User';
    return name.substring(0, 2).toUpperCase();
  });

  get greeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
  
  themes = this.themeService.themes;
  currentTheme = this.themeService.currentTheme;

  ngOnInit(): void {
    const allowedCodes = this.auth.getMenuAccess();
    this.menuService.loadMenus().subscribe((items: any[]) => {
      const tree = this.menuService.buildMenuTree(items, allowedCodes);
      this.menuItems.set(tree);
      const expanded = new Set<string>();
      for (const group of tree) {
        if (!group.parentCode) {
          expanded.add(group.menuCode);
        }
      }
      this.expandedGroups.set(expanded);
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleGroup(menuCode: string): void {
    const current = new Set(this.expandedGroups());
    if (current.has(menuCode)) {
      current.delete(menuCode);
    } else {
      current.add(menuCode);
    }
    this.expandedGroups.set(current);
  }

  isGroupExpanded(menuCode: string): boolean {
    return this.expandedGroups().has(menuCode);
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }

  navigateToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  applyTheme(themeId: string): void {
    this.themeService.applyTheme(themeId);
  }

  logout(): void {
    this.api.logout().subscribe(() => {
      this.auth.clearSession();
      this.router.navigate(['/login']);
    });
  }

  getRouteForCode(menuCode: string): string {
    return this.menuService.getRouteForCode(menuCode) || '';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    
    const profileWrapper = document.getElementById('profile-wrapper');
    if (profileWrapper && !profileWrapper.contains(target)) {
      this.profileDropdownOpen.set(false);
    }

    const themeWrapper = document.getElementById('theme-wrapper');
    if (themeWrapper && !themeWrapper.contains(target)) {
      this.themePanelOpen.set(false);
    }
  }
}
