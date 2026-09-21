import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-executive-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './executive-analytics.component.html',
  styleUrls: ['./executive-analytics.component.scss']
})
export class ExecutiveAnalyticsComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  analyticsData = signal<any>(null);
  loading = signal(false);

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void {
    this.titleService.setTitle('Executive Analytics - BSR Solutions');
    this.loadAnalytics();
  }

  loadAnalytics(): void {
    this.loading.set(true);
    this.api.getExecutiveAnalytics(this.distrCode, this.sourceMode).subscribe({
      next: (res: any) => { this.analyticsData.set(res.data || res); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }
}
