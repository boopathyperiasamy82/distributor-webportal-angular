import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-master-sales-hierarchy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './master-sales-hierarchy.component.html',
  styleUrls: ['../product/master-product.component.scss', '../salesman/master-salesman.component.scss']
})
export class MasterSalesHierarchyComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  hierarchies = signal<any[]>([]);
  loading = signal(false);
  searchQuery = signal('');

  filteredHierarchies = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.hierarchies().filter(h =>
      !q ||
      (h.HierarchyCode || h.hierarchy_code || '').toLowerCase().includes(q) ||
      (h.HierarchyName || h.hierarchy_name || '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.titleService.setTitle('Sales Hierarchy - BSR Solutions');
    this.loadHierarchies();
  }

  loadHierarchies(): void {
    this.loading.set(true);
    const user = this.auth.getUser();
    this.api.getMasterData('sales_hierarchy', user?.username || '', this.auth.getSource()).subscribe({
      next: (res: any) => { this.hierarchies.set(res.records || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
