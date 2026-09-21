import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-stock-ledger',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-ledger.component.html',
  styleUrls: ['./stock-ledger.component.scss']
})
export class StockLedgerComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  ledgerData = signal<any[]>([]);
  loading = signal(false);
  generating = signal(false);
  selectedDate = signal(new Date().toISOString().split('T')[0]);

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void {
    this.titleService.setTitle('Stock Ledger - BSR Solutions');
    this.loadLedger();
  }

  loadLedger(): void {
    if (!this.selectedDate()) return;
    this.loading.set(true);
    this.api.getStockLedger(this.selectedDate(), this.distrCode, this.sourceMode).subscribe({
      next: (res: any) => { this.ledgerData.set(res.records || []); this.loading.set(false); },
      error: () => { this.loading.set(false); }
    });
  }

  generateLedger(): void {
    this.generating.set(true);
    this.api.generateStockLedger(this.distrCode, this.sourceMode).subscribe({
      next: (res: any) => { 
        this.generating.set(false); 
        alert(res?.message || 'Stock Ledger generated successfully!');
        this.loadLedger();
      },
      error: (err: any) => { this.generating.set(false); alert(err.message); }
    });
  }
}
