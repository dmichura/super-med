import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import {
  DocumentStatus,
  DocumentType,
  PatientDocument,
} from '../../../../shared/models/document.model';
import { DocumentsService } from '../../documents.service';

@Component({
  selector: 'app-documents-list',
  imports: [],
  templateUrl: './documents-list.html',
  styleUrl: './documents-list.css',
})
export class DocumentsList implements OnInit {
  private readonly documentsService = inject(DocumentsService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  documents: PatientDocument[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.documentsService.getDocuments().subscribe({
      next: (documents) => {
        this.documents = documents;
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać listy dokumentów.';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  getTypeLabel(type: DocumentType): string {
    const labels: Record<DocumentType, string> = {
      MEDICAL_SCAN: 'Skan medyczny',
      LAB_ATTACHMENT: 'Załącznik laboratoryjny',
      CONSENT: 'Zgoda pacjenta',
      ADMINISTRATIVE: 'Administracyjny',
      DISCHARGE_FILE: 'Wypis szpitalny',
    };

    return labels[type];
  }

  getStatusLabel(status: DocumentStatus): string {
    const labels: Record<DocumentStatus, string> = {
      UPLOADED: 'Wgrany',
      VERIFIED: 'Zweryfikowany',
      REJECTED: 'Odrzucony',
      ARCHIVED: 'Zarchiwizowany',
    };

    return labels[status];
  }
}
