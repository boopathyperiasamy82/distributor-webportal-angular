import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-sales-strategy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-strategy.component.html',
  styleUrls: ['./sales-strategy.component.scss']
})
export class SalesStrategyComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  strategyData = signal<any>(null);
  loading = signal(false);
  customerSearch = signal('');

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void {
    this.titleService.setTitle('Sales Strategy - BSR Solutions');
    this.loadStrategy();
  }

  loadStrategy(): void {
    this.loading.set(true);
    this.api.getSalesStrategy(this.distrCode, this.sourceMode).subscribe({
      next: (res: any) => { this.strategyData.set(res.data || res); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }
}
