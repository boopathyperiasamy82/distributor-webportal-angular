import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-inventory-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-summary.component.html',
  styleUrls: ['./inventory-summary.component.scss']
})
export class InventorySummaryComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  summaryData = signal<any[]>([]);
  loading = signal(false);

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  totalSkus = signal(0);
  totalValue = signal(0);
  outOfStock = signal(0);

  ngOnInit(): void {
    this.titleService.setTitle('Inventory Summary - BSR Solutions');
    this.loadSummary();
  }

  loadSummary(): void {
    this.loading.set(true);
    this.api.getMasterData('inventory_summary', this.distrCode, this.sourceMode).subscribe({
      next: (res: any) => { 
        const records = res.records || [];
        this.summaryData.set(records);
        this.totalSkus.set(records.length);
        this.totalValue.set(records.reduce((sum: number, r: any) => sum + (r.StockValue || r.stock_value || 0), 0));
        this.outOfStock.set(records.filter((r: any) => (r.StockQty || r.stock_qty || 0) <= 0).length);
        this.loading.set(false); 
      },
      error: () => { this.loading.set(false); }
    });
  }
}
