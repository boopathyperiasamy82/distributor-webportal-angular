import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-collection',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './collection.component.html',
  styleUrls: ['./collection.component.scss']
})
export class CollectionComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  collections = signal<any[]>([]);
  loading = signal(false);
  showModal = signal(false);
  submitting = signal(false);
  selectedDate = signal(new Date().toISOString().split('T')[0]);
  currentMode = signal('ALL');
  masterCustomers = signal<any[]>([]);

  // Modal
  selectedCustomer = signal('');
  collAmount = signal<number | null>(null);
  paymentMode = signal('Cash Payment');
  referenceNo = signal('');
  remarks = signal('');

  paymentModes = ['Cash Payment', 'Cheque Payment', 'UPI / Digital QR', 'Bank Transfer / NEFT'];
  modeTabs = ['ALL', 'Cash', 'Cheque', 'UPI'];

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  totalAmount = computed(() => this.collections().reduce((s: number, c: any) => s + parseFloat(c.amount || c.collectionAmount || 0), 0));

  ngOnInit(): void {
    this.titleService.setTitle('Collection - BSR Solutions');
    this.loadCollections();
    this.api.getMasterData('customer', this.distrCode, this.sourceMode).subscribe((r: any) => this.masterCustomers.set(r.records || []));
  }

  loadCollections(): void {
    this.loading.set(true);
    // Placeholder as instructed
    setTimeout(() => { this.collections.set([]); this.loading.set(false); }, 500);
  }

  openModal(): void { this.showModal.set(true); this.selectedCustomer.set(''); this.collAmount.set(null); this.paymentMode.set('Cash Payment'); this.referenceNo.set(''); this.remarks.set(''); }
  closeModal(): void { this.showModal.set(false); }

  submitCollection(): void {
    if (!this.selectedCustomer() || !this.collAmount()) { alert('Please fill required fields.'); return; }
    this.submitting.set(true);
    setTimeout(() => { this.submitting.set(false); this.closeModal(); alert('Collection recorded successfully!'); this.loadCollections(); }, 800);
  }

  formatCurrency(v: number): string {
    return `₹ ${v.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  }
}
