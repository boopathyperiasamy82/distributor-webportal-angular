import { Component, signal, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-import',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss']
})
export class ImportComponent implements OnInit {
  private api = inject(ApiService);
  private auth = inject(AuthService);
  private titleService = inject(Title);

  step = signal(1); // 1: Entity, 2: Upload, 3: Preview, 4: Result
  selectedEntity = signal('product');
  isDragging = signal(false);
  file = signal<File | null>(null);
  previewData = signal<any[]>([]);
  importing = signal(false);
  importResult = signal('');

  entities = [
    { value: 'product', label: 'Products' },
    { value: 'salesman', label: 'Salesmen' },
    { value: 'customer', label: 'Customers' }
  ];

  get sourceMode(): string { return this.auth.getSource(); }

  ngOnInit(): void { this.titleService.setTitle('Import Data - BSR Solutions'); }

  @HostListener('dragover', ['$event']) onDragOver(e: DragEvent) { e.preventDefault(); e.stopPropagation(); this.isDragging.set(true); }
  @HostListener('dragleave', ['$event']) onDragLeave(e: DragEvent) { e.preventDefault(); e.stopPropagation(); this.isDragging.set(false); }
  @HostListener('drop', ['$event']) onDrop(e: DragEvent) {
    e.preventDefault(); e.stopPropagation(); this.isDragging.set(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) { this.handleFile(files[0]); }
  }

  onFileSelected(e: any) { if (e.target.files.length) this.handleFile(e.target.files[0]); }

  handleFile(f: File) {
    this.file.set(f);
    // Mock parsing
    setTimeout(() => {
      this.previewData.set([{ col1: 'Row1 Data', col2: 'Valid' }, { col1: 'Row2 Data', col2: 'Valid' }]);
      this.step.set(3);
    }, 500);
  }

  startImport() {
    this.importing.set(true);
    const formData = new FormData();
    formData.append('file', this.file() as Blob);
    formData.append('entity', this.selectedEntity());
    formData.append('sourceMode', this.sourceMode);
    
    this.api.importEntity(this.selectedEntity(), 'csv', this.previewData(), this.sourceMode).subscribe({
      next: (res: any) => {
        this.importing.set(false);
        this.step.set(4);
        if (res?.status === 'success') { this.importResult.set(`Imported ${res.count || 0} records successfully.`); }
        else { this.importResult.set(`Failed: ${res?.message}`); }
      },
      error: (err: any) => { this.importing.set(false); this.step.set(4); this.importResult.set(err.message); }
    });
  }
  
  reset() { this.step.set(1); this.file.set(null); this.previewData.set([]); this.importResult.set(''); }
}
