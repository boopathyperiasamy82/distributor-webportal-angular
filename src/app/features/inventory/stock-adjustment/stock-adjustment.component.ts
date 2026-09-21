import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-adjustment.component.html',
  styleUrls: ['./stock-adjustment.component.scss']
})
export class StockAdjustmentComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  currentView = signal<'list' | 'entry'>('list');
  adjustments = signal<any[]>([]);
  loading = signal(false);
  submitting = signal(false);
  currentStatus = signal('ALL');

  // Master
  masterProducts = signal<any[]>([]);

  // Entry Form
  adjNo = signal('');
  adjDate = signal(new Date().toISOString().split('T')[0]);
  remarks = signal('');
  selectedProduct = signal('');
  adjQty = signal<number | null>(null);
  adjType = signal('Addition');
  reason = signal('Physical Count Variance');
  entryItems = signal<any[]>([]);

  reasons = ['Physical Count Variance', 'Damage / Breakage', 'Expired', 'Promotional Use'];

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void {
    this.titleService.setTitle('Stock Adjustment - BSR Solutions');
    this.loadAdjustments();
    this.api.getMasterData('product', this.distrCode, this.sourceMode).subscribe((r: any) => this.masterProducts.set(r.records || []));
  }

  loadAdjustments(): void {
    this.loading.set(true);
    const sf = this.currentStatus() === 'ALL' ? '' : this.currentStatus();
    this.api.getStockAdjustments(sf, this.distrCode, this.sourceMode).subscribe({
      next: (res: any) => { this.adjustments.set(res.adjustments || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  openInitiate(): void {
    this.entryItems.set([]);
    this.selectedProduct.set(''); this.adjQty.set(null); this.remarks.set('');
    const now = new Date();
    this.adjNo.set(`ADJ-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`);
    this.adjDate.set(now.toISOString().split('T')[0]);
    this.currentView.set('entry');
  }

  addItem(): void {
    if (!this.selectedProduct() || !this.adjQty()) return;
    const prod = this.masterProducts().find((p: any) => (p.ProductCode || p.product_code) === this.selectedProduct());
    if (!prod) return;
    const items = [...this.entryItems()];
    items.push({
      lineNo: items.length + 1,
      prodCode: this.selectedProduct(),
      prodName: prod.ProductName || prod.product_name,
      uom: prod.BaseUOM || 'PCS',
      type: this.adjType(),
      qty: this.adjQty(),
      reason: this.reason()
    });
    this.entryItems.set(items);
    this.selectedProduct.set(''); this.adjQty.set(null);
  }

  removeItem(idx: number): void {
    this.entryItems.set(this.entryItems().filter((_, i) => i !== idx));
  }

  submitAdjustment(): void {
    if (this.entryItems().length === 0) { alert('Add at least one item'); return; }
    this.submitting.set(true);
    const header = { adjNo: this.adjNo(), adjDate: this.adjDate(), remarks: this.remarks(), distrCode: this.distrCode, status: 'Pending' };
    this.api.submitStockAdjustment({ header, items: this.entryItems() }, this.sourceMode).subscribe({
      next: (res: any) => {
        this.submitting.set(false);
        if (res?.status === 'success') { alert('Submitted successfully!'); this.currentView.set('list'); this.loadAdjustments(); }
        else alert(res?.message || 'Failed');
      },
      error: () => { this.submitting.set(false); }
    });
  }

  updateStatus(adjNo: string, status: string): void {
    this.api.updateStockAdjustmentStatus(adjNo, status, this.sourceMode).subscribe({
      next: (res: any) => { if (res?.status === 'success') this.loadAdjustments(); }
    });
  }
}
