import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-master-distributor-geo-mapping',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './master-distributor-geo-mapping.component.html',
  styleUrls: ['../product/master-product.component.scss', '../salesman/master-salesman.component.scss']
})
export class MasterDistributorGeoMappingComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  mappings = signal<any[]>([]);
  loading = signal(false);
  searchQuery = signal('');

  filteredMappings = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.mappings().filter(m =>
      !q ||
      (m.DistrCode || m.distr_code || '').toLowerCase().includes(q) ||
      (m.SalesHierarchyCode || m.sales_hierarchy_code || '').toLowerCase().includes(q) ||
      (m.GeoCode || m.geo_code || '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.titleService.setTitle('Distributor Geo Mapping - BSR Solutions');
    this.loadMappings();
  }

  loadMappings(): void {
    this.loading.set(true);
    const user = this.auth.getUser();
    this.api.getMasterData('distributor_geo_mapping', user?.username || '', this.auth.getSource()).subscribe({
      next: (res: any) => { this.mappings.set(res.records || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
