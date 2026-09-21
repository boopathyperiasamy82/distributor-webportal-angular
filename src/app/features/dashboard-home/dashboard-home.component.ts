import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-home.component.html',
  styleUrls: ['./dashboard-home.component.scss']
})
export class DashboardHomeComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private titleService = inject(Title);

  loading = signal(true);
  periodFilter = signal('MTD');
  kpiData = signal<any>(null);
  user = this.auth.currentUser;

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  get todayDate(): string {
    return new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  }

  formatCurrency(value: number): string {
    if (!value) return '₹ 0.00';
    if (value >= 10000000) return `₹ ${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `₹ ${(value / 100000).toFixed(2)} L`;
    return `₹ ${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }

  ngOnInit(): void {
    this.titleService.setTitle('BSR Solutions - Dashboard');
    this.loadKPIs();
  }

  loadKPIs(): void {
    this.loading.set(true);
    const user = this.auth.getUser();
    const distrCode = user?.username || '';
    const sourceMode = this.auth.getSource();
    this.api.getDashboardKPIs(distrCode, sourceMode, this.periodFilter()).subscribe({
      next: (data: any) => { this.kpiData.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  setPeriodFilter(filter: string): void {
    this.periodFilter.set(filter);
    this.loadKPIs();
  }

  navigate(route: string): void {
    this.router.navigate([route]);
  }
}
