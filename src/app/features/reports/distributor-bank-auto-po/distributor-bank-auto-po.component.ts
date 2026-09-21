import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-distributor-bank-auto-po',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './distributor-bank-auto-po.component.html',
  styleUrls: ['./distributor-bank-auto-po.component.scss']
})
export class DistributorBankAutoPoComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  bankData = signal<any>(null);
  loading = signal(false);

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void {
    this.titleService.setTitle('Bank Auto PO - BSR Solutions');
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    // Placeholder for bank API
    setTimeout(() => {
      this.bankData.set({
        odLimit: 5000000,
        odUtilized: 3500000,
        interestSaved: 12500,
        recommendations: [
          { prod: 'Product A', qty: 500, timing: 'Next Tuesday', savings: 4500, aiRecommended: true },
          { prod: 'Product B', qty: 200, timing: 'Tomorrow', savings: 1200, aiRecommended: true },
          { prod: 'Product C', qty: 1000, timing: 'End of Month', savings: 8000, aiRecommended: true }
        ]
      });
      this.loading.set(false);
    }, 800);
  }
}
