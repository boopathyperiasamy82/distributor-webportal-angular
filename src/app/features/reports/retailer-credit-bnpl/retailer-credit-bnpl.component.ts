import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-retailer-credit-bnpl',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './retailer-credit-bnpl.component.html',
  styleUrls: ['./retailer-credit-bnpl.component.scss']
})
export class RetailerCreditBnplComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  creditData = signal<any[]>([]);
  loading = signal(false);

  ngOnInit(): void {
    this.titleService.setTitle('Retailer Credit BNPL - BSR Solutions');
    this.loadData();
  }

  loadData(): void {
    this.loading.set(true);
    setTimeout(() => {
      this.creditData.set([
        { name: 'SuperMart', limit: 100000, used: 85000, bnpl: 'ACTIVE' },
        { name: 'Corner Store', limit: 50000, used: 10000, bnpl: 'ELIGIBLE' },
        { name: 'Mega Grocery', limit: 200000, used: 195000, bnpl: 'BLOCKED' }
      ]);
      this.loading.set(false);
    }, 800);
  }
}
