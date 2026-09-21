import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-salesman-incentive',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './salesman-incentive.component.html',
  styleUrls: ['./salesman-incentive.component.scss']
})
export class SalesmanIncentiveComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  incentiveData = signal<any[]>([]);
  loading = signal(false);

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void {
    this.titleService.setTitle('Salesman Incentive - BSR Solutions');
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    this.api.getSalesmanIncentives(this.distrCode, '', '', this.sourceMode).subscribe({
      next: (res: any) => { this.incentiveData.set(res.data || res); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }
}
