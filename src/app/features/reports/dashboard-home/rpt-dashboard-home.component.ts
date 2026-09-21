import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-rpt-dashboard-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './rpt-dashboard-home.component.html',
  styleUrls: ['./rpt-dashboard-home.component.scss']
})
export class RptDashboardHomeComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  kpiData = signal<any>(null);
  loading = signal(false);
  period = signal('TODAY');

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void {
    this.titleService.setTitle('Reports Dashboard - BSR Solutions');
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getDashboardKPIs(this.distrCode, this.sourceMode, this.period()).subscribe({
      next: (res: any) => { this.kpiData.set(res.data || res); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }
}
