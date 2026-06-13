import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CreateDocumentPayload,
  DocumentPatientOption,
  DocumentStatus,
  DocumentType,
  PatientDocument,
  UpdateDocumentPayload,
} from '../../../../shared/models/document.model';
import { DocumentsService } from '../../documents.service';

type TypeFilter = 'ALL' | DocumentType;
type StatusFilter = 'ALL' | DocumentStatus;
type SensitiveFilter = 'ALL' | 'SENSITIVE' | 'STANDARD';

interface DocumentFormState {
  patientId: number | null;
  type: DocumentType;
  fileName: string;
  status: DocumentStatus;
  isSensitive: boolean;
}

@Component({
  selector: 'app-documents-list',
  imports: [FormsModule],
  templateUrl: './documents-list.html',
  styleUrl: './documents-list.css',
})
export class DocumentsList implements OnInit {
  private readonly documentsService = inject(DocumentsService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  documents: PatientDocument[] = [];
  patientOptions: DocumentPatientOption[] = [];

  searchTerm = '';
  typeFilter: TypeFilter = 'ALL';
  statusFilter: StatusFilter = 'ALL';
  sensitiveFilter: SensitiveFilter = 'ALL';

  selectedFile: File | null = null;
  downloadingDocumentId: number | null = null;

  isLoading = true;
  isSaving = false;
  isFormVisible = false;
  editingDocumentId: number | null = null;
  deletingDocumentId: number | null = null;

  errorMessage = '';
  successMessage = '';

  form: DocumentFormState = this.getEmptyForm();

  readonly typeOptions: Array<{
    value: DocumentType;
    label: string;
  }> = [
    { value: 'MEDICAL_SCAN', label: 'Skan medyczny' },
    { value: 'LAB_ATTACHMENT', label: 'Załącznik laboratoryjny' },
    { value: 'CONSENT', label: 'Zgoda pacjenta' },
    { value: 'ADMINISTRATIVE', label: 'Administracyjny' },
    { value: 'DISCHARGE_FILE', label: 'Wypis szpitalny' },
  ];

  readonly statusOptions: Array<{
    value: DocumentStatus;
    label: string;
  }> = [
    { value: 'UPLOADED', label: 'Wgrany' },
    { value: 'VERIFIED', label: 'Zweryfikowany' },
    { value: 'REJECTED', label: 'Odrzucony' },
    { value: 'ARCHIVED', label: 'Zarchiwizowany' },
  ];

  ngOnInit(): void {
    this.loadDocuments();
    this.loadPatientOptions();
  }

  get filteredDocuments(): PatientDocument[] {
    const searchValue = this.searchTerm.trim().toLowerCase();

    return this.documents.filter((document) => {
      const matchesSearch =
        !searchValue ||
        document.patientName.toLowerCase().includes(searchValue) ||
        document.patientPesel.includes(searchValue) ||
        document.fileName.toLowerCase().includes(searchValue) ||
        document.uploadedBy.toLowerCase().includes(searchValue) ||
        this.getTypeLabel(document.type).toLowerCase().includes(searchValue);

      const matchesType = this.typeFilter === 'ALL' || document.type === this.typeFilter;

      const matchesStatus = this.statusFilter === 'ALL' || document.status === this.statusFilter;

      const matchesSensitive =
        this.sensitiveFilter === 'ALL' ||
        (this.sensitiveFilter === 'SENSITIVE' && document.isSensitive) ||
        (this.sensitiveFilter === 'STANDARD' && !document.isSensitive);

      return matchesSearch && matchesType && matchesStatus && matchesSensitive;
    });
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

  loadPatientOptions(): void {
    this.documentsService.getPatientOptions().subscribe({
      next: (patientOptions) => {
        this.patientOptions = patientOptions;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać listy pacjentów.';
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  showCreateForm(): void {
    this.isFormVisible = true;
    this.editingDocumentId = null;
    this.selectedFile = null;
    this.form = this.getEmptyForm();
    this.successMessage = '';
    this.errorMessage = '';
  }

  editDocument(document: PatientDocument): void {
    this.isFormVisible = true;
    this.editingDocumentId = document.id;
    this.selectedFile = null;
    this.successMessage = '';
    this.errorMessage = '';

    this.form = {
      patientId: this.findPatientIdByPesel(document.patientPesel),
      type: document.type,
      fileName: document.fileName,
      status: document.status,
      isSensitive: document.isSensitive,
    };
  }

  cancelForm(): void {
    this.isFormVisible = false;
    this.editingDocumentId = null;
    this.selectedFile = null;
    this.form = this.getEmptyForm();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.selectedFile = file;

    if (file) {
      this.form.fileName = file.name;
    }
  }

  saveDocument(): void {
    if (!this.form.patientId) {
      this.errorMessage = 'Wybierz pacjenta.';
      return;
    }

    const selectedFile = this.selectedFile;

    if (!this.editingDocumentId && !selectedFile) {
      this.errorMessage = 'Wybierz plik do wgrania.';
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    if (this.editingDocumentId) {
      const payload: UpdateDocumentPayload = {
        patientId: this.form.patientId,
        type: this.form.type,
        fileName: this.form.fileName.trim(),
        status: this.form.status,
        isSensitive: this.form.isSensitive,
      };

      this.documentsService
        .updateDocumentWithOptionalFile(this.editingDocumentId, payload, selectedFile)
        .subscribe({
          next: (updatedDocument) => {
            this.documents = this.documents.map((document) =>
              document.id === updatedDocument.id ? updatedDocument : document,
            );
            this.successMessage = 'Dokument został zaktualizowany.';
            this.isSaving = false;
            this.cancelForm();
            this.changeDetectorRef.detectChanges();
          },
          error: () => {
            this.errorMessage = 'Nie udało się zapisać zmian dokumentu. Sprawdź dane formularza.';
            this.isSaving = false;
            this.changeDetectorRef.detectChanges();
          },
        });

      return;
    }

    const payload: CreateDocumentPayload = {
      patientId: this.form.patientId,
      type: this.form.type,
      fileName: this.form.fileName.trim(),
      status: this.form.status,
      isSensitive: this.form.isSensitive,
    };

    const fileToUpload = selectedFile;

    if (!fileToUpload) {
      this.errorMessage = 'Wybierz plik do wgrania.';
      this.isSaving = false;
      return;
    }

    this.documentsService.createDocumentWithFile(payload, fileToUpload).subscribe({
      next: (createdDocument) => {
        this.documents = [createdDocument, ...this.documents];
        this.successMessage = 'Dokument został wgrany.';
        this.isSaving = false;
        this.cancelForm();
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage =
          'Nie udało się wgrać dokumentu. Sprawdź dane formularza i rozmiar pliku.';
        this.isSaving = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  downloadDocument(document: PatientDocument): void {
    this.downloadingDocumentId = document.id;
    this.errorMessage = '';

    this.documentsService.downloadDocument(document.id).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const link = window.document.createElement('a');

        link.href = objectUrl;
        link.download = document.fileName;
        link.click();

        URL.revokeObjectURL(objectUrl);

        this.downloadingDocumentId = null;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage =
          'Nie udało się pobrać pliku. Ten dokument może mieć tylko metadane, bez fizycznego pliku.';
        this.downloadingDocumentId = null;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  deleteDocument(document: PatientDocument): void {
    const confirmed = confirm(`Czy na pewno usunąć dokument "${document.fileName}"?`);

    if (!confirmed) {
      return;
    }

    this.deletingDocumentId = document.id;
    this.errorMessage = '';
    this.successMessage = '';

    this.documentsService.deleteDocument(document.id).subscribe({
      next: (documents) => {
        this.documents = documents;
        this.successMessage = 'Dokument został usunięty.';
        this.deletingDocumentId = null;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się usunąć dokumentu.';
        this.deletingDocumentId = null;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  getPatientOptionLabel(patient: DocumentPatientOption): string {
    const authorizationStatus = patient.isAuthorized ? 'zweryfikowany' : 'oczekuje';

    return `${patient.firstName} ${patient.lastName} · PESEL ${patient.pesel} · ${authorizationStatus}`;
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

  private findPatientIdByPesel(pesel: string): number | null {
    return this.patientOptions.find((patient) => patient.pesel === pesel)?.id ?? null;
  }

  private getEmptyForm(): DocumentFormState {
    return {
      patientId: null,
      type: 'MEDICAL_SCAN',
      fileName: '',
      status: 'UPLOADED',
      isSensitive: true,
    };
  }
}
