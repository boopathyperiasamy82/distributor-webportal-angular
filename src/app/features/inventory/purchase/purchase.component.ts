import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './purchase.component.html',
  styleUrls: ['./purchase.component.scss']
})
export class PurchaseComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  currentView = signal<'list' | 'entry' | 'edit'>('list');
  currentStatus = signal('Pending');
  allPurchases = signal<any[]>([]);
  entryLineItems = signal<any[]>([]);
  activeEditingInvoice = signal<any>(null);
  activeEditingItems = signal<any[]>([]);
  loading = signal(false);
  submitting = signal(false);
  searchQuery = signal('');

  // Master data
  masterSuppliers = signal<any[]>([]);
  masterProducts = signal<any[]>([]);
  masterProductUoms = signal<any[]>([]);

  // Entry form fields
  purRefNo = signal('');
  purDate = signal(new Date().toISOString().split('T')[0]);
  selectedSupplierCode = signal('');
  selectedProductCode = signal('');
  selectedUomCode = signal('');
  inputQty = signal<number | null>(null);
  availableUoms = signal<any[]>([]);

  filteredPurchases = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.allPurchases().filter(p =>
      !q || (p.purchaseRefNo || '').toLowerCase().includes(q) ||
      (p.status || '').toLowerCase().includes(q)
    );
  });

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void {
    this.titleService.setTitle('Purchase Invoice - BSR Solutions');
    this.loadPurchases();
    this.loadMasterData();
  }

  loadPurchases(): void {
    this.loading.set(true);
    const statusFilter = this.currentStatus() === 'ALL' ? '' : this.currentStatus();
    this.api.getPurchases(this.distrCode, statusFilter, this.sourceMode).subscribe({
      next: (res: any) => {
        this.allPurchases.set(res.purchases || []);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  loadMasterData(): void {
    this.api.getMasterData('supplier', this.distrCode, this.sourceMode).subscribe((r: any) => this.masterSuppliers.set(r.records || []));
    this.api.getMasterData('product', this.distrCode, this.sourceMode).subscribe((r: any) => this.masterProducts.set(r.records || []));
    this.api.getMasterData('product_uoms', this.distrCode, this.sourceMode).subscribe((r: any) => this.masterProductUoms.set(r.records || []));
  }

  setStatus(status: string): void {
    this.currentStatus.set(status);
    this.loadPurchases();
  }

  openInitiateView(): void {
    this.entryLineItems.set([]);
    this.selectedSupplierCode.set('');
    this.selectedProductCode.set('');
    this.selectedUomCode.set('');
    this.inputQty.set(null);
    this.availableUoms.set([]);
    const now = new Date();
    const fallback = `PUR-${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`;
    this.purRefNo.set(fallback);
    this.purDate.set(now.toISOString().split('T')[0]);
    this.api.getNextPurchaseNo(this.distrCode, this.sourceMode).subscribe((r: any) => {
      if (r?.status === 'success' && r.purchaseRefNo) this.purRefNo.set(r.purchaseRefNo);
    });
    this.currentView.set('entry');
  }

  onProductChange(): void {
    const prodCode = this.selectedProductCode();
    const matching = this.masterProductUoms().filter((u: any) => u.ProductCode === prodCode);
    if (matching.length > 0) {
      this.availableUoms.set(matching);
      const base = matching.find((u: any) => u.IsBaseUOM === 'Y') || matching[0];
      this.selectedUomCode.set(base?.UOMCode || '');
    } else {
      const prod = this.masterProducts().find((p: any) => (p.ProductCode || p.product_code) === prodCode);
      const baseUom = prod?.BaseUOM || prod?.base_uom || 'PCS';
      this.availableUoms.set([{ UOMCode: baseUom, UOMDescription: baseUom, IsBaseUOM: 'Y', ConversionFactor: 1.0, PurchasePrice: prod?.PurchaseRate || prod?.purchase_rate || 0 }]);
      this.selectedUomCode.set(baseUom);
    }
  }

  addEntryLine(): void {
    const prodCode = this.selectedProductCode();
    const qty = this.inputQty();
    if (!prodCode || !qty || qty <= 0) return;

    const prod = this.masterProducts().find((p: any) => (p.ProductCode || p.product_code) === prodCode);
    if (!prod) return;
    const prodName = prod.ProductName || prod.product_name || 'Unknown';
    const baseUom = prod.BaseUOM || prod.base_uom || 'PCS';
    let prate = parseFloat(prod.PurchaseRate || prod.purchase_rate || 0);
    let convFactor = 1.0;
    const selectedUom = this.availableUoms().find((u: any) => u.UOMCode === this.selectedUomCode());
    if (selectedUom) {
      if (selectedUom.ConversionFactor) convFactor = parseFloat(selectedUom.ConversionFactor);
      if (selectedUom.PurchasePrice) prate = parseFloat(selectedUom.PurchasePrice);
    }
    const baseQty = Math.round(qty * convFactor);
    const taxPerc = 12.0;
    const gross = parseFloat(((qty * convFactor) * prate).toFixed(2));
    const tax = parseFloat((gross * taxPerc / 100).toFixed(2));
    const net = parseFloat((gross + tax).toFixed(2));

    const existing = this.entryLineItems().findIndex((i: any) => i.prodCode === prodCode && i.inputUom === this.selectedUomCode());
    const items = [...this.entryLineItems()];
    if (existing >= 0) {
      items[existing] = { ...items[existing], inputQty: items[existing].inputQty + qty };
      items[existing].qty = Math.round(items[existing].inputQty * items[existing].conversionFactor);
      items[existing].grossValue = parseFloat(((items[existing].inputQty * items[existing].conversionFactor) * prate).toFixed(2));
      items[existing].taxValue = parseFloat((items[existing].grossValue * taxPerc / 100).toFixed(2));
      items[existing].netValue = parseFloat((items[existing].grossValue + items[existing].taxValue).toFixed(2));
    } else {
      items.push({ lineNo: items.length + 1, prodCode, productName: prodName, uom: baseUom, inputUom: this.selectedUomCode() || baseUom, inputQty: qty, conversionFactor: convFactor, qty: baseQty, salableQty: baseQty, unsalableQty: 0, offerQty: 0, purchaseRate: prate, taxPercentage: taxPerc, grossValue: gross, taxValue: tax, netValue: net });
    }
    this.entryLineItems.set(items);
    this.selectedProductCode.set('');
    this.selectedUomCode.set('');
    this.inputQty.set(null);
    this.availableUoms.set([]);
  }

  removeLineItem(idx: number): void {
    const items = this.entryLineItems().filter((_, i) => i !== idx);
    this.entryLineItems.set(items);
  }

  get totalGross(): number { return this.entryLineItems().reduce((s, i) => s + i.grossValue, 0); }
  get totalTax(): number { return this.entryLineItems().reduce((s, i) => s + i.taxValue, 0); }
  get totalNet(): number { return this.entryLineItems().reduce((s, i) => s + i.netValue, 0); }

  async submitInitiatedPurchase(): Promise<void> {
    const suppCode = this.selectedSupplierCode() || 'SUP001';
    let lines = this.entryLineItems();
    if (lines.length === 0) {
      const firstProd = this.masterProducts()[0];
      const prodCode = firstProd?.ProductCode || firstProd?.product_code || 'PROD011';
      const prodName = firstProd?.ProductName || firstProd?.product_name || 'Premium Rice (5 Kg)';
      const rate = parseFloat(firstProd?.PurchaseRate || firstProd?.purchase_rate || '400');
      lines = [{ lineNo: 1, prodCode, productName: prodName, uom: 'BAG', inputQty: 1, qty: 1, purchaseRate: rate, grossValue: rate, taxValue: rate * 0.12, netValue: rate * 1.12 }];
    }

    this.submitting.set(true);
    const supplier = this.masterSuppliers().find((s: any) => (s.SupplierCode || s.supplier_code) === suppCode);
    const header = {
      purchaseRefNo: this.purRefNo(),
      purchaseDate: this.purDate(),
      cmpCode: 'CMP001',
      distrCode: this.distrCode || 'boopathy',
      supplierCode: suppCode,
      supplierName: supplier?.SupplierName || supplier?.supplier_name || 'Standard Supplier',
      totalGross: this.totalGross > 0 ? this.totalGross.toFixed(2) : '400.00',
      totalTax: this.totalTax > 0 ? this.totalTax.toFixed(2) : '48.00',
      totalNet: this.totalNet > 0 ? this.totalNet.toFixed(2) : '448.00',
      status: 'Pending'
    };

    this.api.initiatePurchase(header, lines, this.sourceMode).subscribe({
      next: (res: any) => {
        this.submitting.set(false);
        if (res?.status === 'success') {
          alert(`Purchase Invoice ${res.purchaseRefNo || this.purRefNo()} submitted successfully!`);
          this.currentView.set('list');
          this.loadPurchases();
        } else {
          alert(`Failed: ${res?.message || 'Unknown error'}`);
        }
      },
      error: (err: any) => {
        this.submitting.set(false);
        alert(`Error: ${err.message}`);
      }
    });
  }

  openInvoiceEditor(invoice: any): void {
    this.activeEditingInvoice.set(invoice);
    this.currentView.set('edit');
    this.activeEditingItems.set([]);
    this.api.getPurchaseDetails(invoice.purchaseRefNo, this.sourceMode).subscribe({
      next: (res: any) => this.activeEditingItems.set(res.details || []),
      error: () => {}
    });
  }

  updateItemQty(idx: number, field: 'salableQty' | 'unsalableQty' | 'offerQty', value: number): void {
    const items = [...this.activeEditingItems()];
    items[idx] = { ...items[idx], [field]: value };
    const item = items[idx];
    const gross = parseFloat((item.purchaseRate * item.salableQty).toFixed(2));
    const tax = parseFloat((gross * item.taxPercentage / 100).toFixed(2));
    items[idx] = { ...item, grossValue: gross, taxValue: tax, netValue: gross + tax };
    this.activeEditingItems.set(items);
  }

  get editTotalGross(): number { return this.activeEditingItems().reduce((s, i) => s + (i.grossValue || 0), 0); }
  get editTotalTax(): number { return this.activeEditingItems().reduce((s, i) => s + (i.taxValue || 0), 0); }
  get editTotalNet(): number { return this.activeEditingItems().reduce((s, i) => s + (i.netValue || 0), 0); }

  async saveInvoice(): Promise<void> {
    if (!this.activeEditingInvoice()) return;
    this.submitting.set(true);
    this.api.savePurchaseInvoice(this.activeEditingInvoice().purchaseRefNo, this.activeEditingItems(), this.sourceMode).subscribe({
      next: (res: any) => {
        this.submitting.set(false);
        if (res?.status === 'success') {
          alert(`Invoice ${this.activeEditingInvoice().purchaseRefNo} saved successfully!`);
          this.currentView.set('list');
          this.loadPurchases();
        } else {
          alert(`Failed: ${res?.message}`);
        }
      },
      error: (err: any) => { this.submitting.set(false); alert(err.message); }
    });
  }

  updateStatus(refNo: string, status: string): void {
    this.api.updatePurchaseStatus(refNo, status, this.sourceMode).subscribe({
      next: (res: any) => {
        if (res?.status === 'success') this.loadPurchases();
        else alert(res?.message);
      }
    });
  }

  statusTabs = ['Pending', 'Confirmed', 'Cancelled', 'ALL'];
}
