import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-export',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);
  
  selectedEntity = signal('product');
  selectedFormat = signal('csv');
  exporting = signal(false);
  downloadUrl = signal('');
  exportResult = signal('');

  entities = [
    { value: 'product', label: 'Products' },
    { value: 'salesman', label: 'Salesmen' },
    { value: 'customer', label: 'Customers' },
    { value: 'route', label: 'Routes' },
    { value: 'order_booking', label: 'Order Bookings' },
    { value: 'purchase', label: 'Purchase Invoices' },
    { value: 'stock_adjustment', label: 'Stock Adjustments' }
  ];

  formats = ['csv', 'json', 'xml'];

  get distrCode(): string { return this.auth.getUser()?.username || ''; }
  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void { this.titleService.setTitle('Export Data - BSR Solutions'); }

  startExport(): void {
    this.exporting.set(true);
    this.exportResult.set('');
    this.downloadUrl.set('');
    this.api.exportEntity(this.selectedEntity(), this.selectedFormat(), this.sourceMode).subscribe({
      next: (res: any) => {
        this.exporting.set(false);
        if (res?.status === 'success') {
          this.exportResult.set(`Exported ${res.count || 0} records.`);
          if (res.downloadUrl) this.downloadUrl.set(res.downloadUrl);
        } else {
          this.exportResult.set(`Failed: ${res?.message}`);
        }
      },
      error: (err: any) => { this.exporting.set(false); this.exportResult.set(err.message); }
    });
  }
}
