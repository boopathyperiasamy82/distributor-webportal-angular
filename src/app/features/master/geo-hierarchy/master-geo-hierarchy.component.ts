import { Component, signal, inject, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-master-geo-hierarchy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './master-geo-hierarchy.component.html',
  styleUrls: ['../product/master-product.component.scss', './master-geo-hierarchy.component.scss']
})
export class MasterGeoHierarchyComponent implements OnInit {
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
      (h.GeoCode || h.geo_code || '').toLowerCase().includes(q) ||
      (h.GeoName || h.geo_name || '').toLowerCase().includes(q)
    );
  });

  ngOnInit(): void {
    this.titleService.setTitle('Geo Hierarchy - BSR Solutions');
    this.loadHierarchies();
  }

  loadHierarchies(): void {
    this.loading.set(true);
    const user = this.auth.getUser();
    this.api.getMasterData('geo_hierarchy', user?.username || '', this.auth.getSource()).subscribe({
      next: (res: any) => { this.hierarchies.set(res.records || []); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
