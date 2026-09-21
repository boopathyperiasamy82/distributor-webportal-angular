import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { MenuService } from '../../../core/services/menu.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-user-privileges',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-privileges.component.html',
  styleUrls: ['./user-privileges.component.scss']
})
export class UserPrivilegesComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private menuService = inject(MenuService);
  private titleService = inject(Title);

  activeTab = signal<'menu' | 'app'>('menu');
  users = signal<any[]>([]);
  menuGroups = signal<any[]>([]);
  selectedUsername = signal('');
  selectedUserAccess = signal<Set<string>>(new Set());
  saving = signal(false);
  generatingLedger = signal(false);
  successMessage = signal('');
  editSellingRate = signal(false);

  get sourceMode(): string { return this.auth.getSource(); }
  get distrCode(): string { return this.auth.getUser()?.username || ''; }

  ngOnInit(): void {
    this.titleService.setTitle('User Privileges - BSR Solutions');
    this.loadUsers();
    this.menuService.loadMenus().subscribe((items: any[]) => {
      const groups = items.filter((m: any) => !m.parentCode).map(g => ({
        ...g,
        children: items.filter((m: any) => m.parentCode === g.menuCode)
      }));
      this.menuGroups.set(groups);
    });
  }

  loadUsers(): void {
    this.api.getConfigUsers('ALL', this.sourceMode).subscribe({
      next: (res: any) => this.users.set(res.users || res.records || []),
      error: () => {}
    });
  }

  onUserSelect(): void {
    const user = this.users().find((u: any) => u.username === this.selectedUsername());
    if (user) {
      const codes = (user.menuAccess || '').split(',').map((s: string) => s.trim()).filter(Boolean);
      this.selectedUserAccess.set(new Set(codes));
      this.editSellingRate.set(user.editSellingRate === 'Y');
    }
  }

  toggleMenu(code: string): void {
    const s = new Set(this.selectedUserAccess());
    s.has(code) ? s.delete(code) : s.add(code);
    this.selectedUserAccess.set(s);
  }

  hasAccess(code: string): boolean {
    return this.selectedUserAccess().has(code);
  }

  savePrivileges(): void {
    if (!this.selectedUsername()) { alert('Please select a user first.'); return; }
    this.saving.set(true);
    const menuAccess = Array.from(this.selectedUserAccess()).join(',');
    this.api.saveConfigPrivileges(this.selectedUsername(), menuAccess, this.sourceMode).subscribe({
      next: (res: any) => {
        this.saving.set(false);
        if (res?.status === 'success') { 
          this.successMessage.set('Privileges saved successfully!'); 
          setTimeout(() => this.successMessage.set(''), 3000); 
        } else alert(res?.message || 'Failed');
      },
      error: (err: any) => { this.saving.set(false); alert(err.message); }
    });
  }

  generateStockLedger(): void {
    this.generatingLedger.set(true);
    this.api.generateStockLedger(this.distrCode, this.sourceMode).subscribe({
      next: (res: any) => {
        this.generatingLedger.set(false);
        alert(res?.message || 'Stock Ledger generated successfully!');
      },
      error: (err: any) => { this.generatingLedger.set(false); alert(err.message); }
    });
  }
}
