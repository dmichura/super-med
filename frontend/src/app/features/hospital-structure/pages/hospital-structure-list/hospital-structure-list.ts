import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import {
  BedStatus,
  CreateBedPayload,
  CreateDepartmentPayload,
  CreateRoomPayload,
  HospitalBed,
  HospitalDepartment,
  HospitalRoom,
  PatientOption,
  UpdateBedPayload,
  UpdateDepartmentPayload,
  UpdateRoomPayload,
} from '../../../../shared/models/hospital-structure.model';
import { HospitalStructureService } from '../../hospital-structure.service';
import { DoctorOption } from '../../../../shared/models/patient.model';

interface DepartmentFormState {
  name: string;
  code: string;
  floor: number;
  headDoctorName: string;
}

interface RoomFormState {
  number: string;
  type: string;
}

interface BedFormState {
  number: string;
  status: BedStatus;
  patientName: string;
}

@Component({
  selector: 'app-hospital-structure-list',
  imports: [FormsModule],
  templateUrl: './hospital-structure-list.html',
  styleUrl: './hospital-structure-list.css',
})
export class HospitalStructureList implements OnInit {
  private readonly hospitalStructureService = inject(HospitalStructureService);
  private readonly authService = inject(AuthService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  departments: HospitalDepartment[] = [];
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  isDepartmentFormVisible = false;
  editingDepartmentId: number | null = null;

  roomFormDepartmentId: number | null = null;
  editingRoomId: number | null = null;

  bedFormRoomId: number | null = null;
  editingBedId: number | null = null;

  departmentForm: DepartmentFormState = this.getEmptyDepartmentForm();
  roomForm: RoomFormState = this.getEmptyRoomForm();
  bedForm: BedFormState = this.getEmptyBedForm();

  patientOptions: PatientOption[] = [];
  doctorOptions: DoctorOption[] = [];

  readonly bedStatusOptions: Array<{
    value: BedStatus;
    label: string;
  }> = [
    {
      value: 'FREE',
      label: 'Wolne',
    },
    {
      value: 'OCCUPIED',
      label: 'Zajęte',
    },
    {
      value: 'BLOCKED',
      label: 'Zablokowane',
    },
    {
      value: 'CLEANING',
      label: 'Dezynfekcja',
    },
  ];

  loadPatientOptions(): void {
    this.hospitalStructureService.getPatientOptions().subscribe({
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

  getPatientOptionValue(patient: PatientOption): string {
    return `${patient.firstName} ${patient.lastName}`;
  }

  getPatientOptionLabel(patient: PatientOption): string {
    const authorizationStatus = patient.isAuthorized ? 'zweryfikowany' : 'oczekuje';

    return `${patient.firstName} ${patient.lastName} · PESEL ${patient.pesel} · ${authorizationStatus}`;
  }

  hasSelectedPatientInOptions(): boolean {
    if (!this.bedForm.patientName) {
      return true;
    }

    return this.patientOptions.some(
      (patient) => this.getPatientOptionValue(patient) === this.bedForm.patientName,
    );
  }

  onPatientSelectionChange(): void {
    if (this.bedForm.patientName && this.bedForm.status === 'FREE') {
      this.bedForm.status = 'OCCUPIED';
    }

    if (!this.bedForm.patientName && this.bedForm.status === 'OCCUPIED') {
      this.bedForm.status = 'FREE';
    }
  }

  loadDoctorOptions(): void {
    this.hospitalStructureService.getDoctorOptions().subscribe({
      next: (doctorOptions) => {
        this.doctorOptions = doctorOptions;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać listy lekarzy.';
        this.changeDetectorRef.detectChanges();
      },
    });
  }
  getDoctorAssignedName(doctor: DoctorOption): string {
    return `dr ${doctor.firstName} ${doctor.lastName}`;
  }

  getDoctorOptionLabel(doctor: DoctorOption): string {
    const departmentName = doctor.departmentName ? ` — ${doctor.departmentName}` : '';

    return `${this.getDoctorAssignedName(doctor)}${departmentName}`;
  }

  hasSelectedHeadDoctorInOptions(): boolean {
    if (!this.departmentForm.headDoctorName) {
      return true;
    }

    return this.doctorOptions.some(
      (doctor) => this.getDoctorAssignedName(doctor) === this.departmentForm.headDoctorName,
    );
  }

  ngOnInit(): void {
    this.loadDepartments();
    if (this.canManageStructure) {
      this.loadPatientOptions();
      this.loadDoctorOptions();
    }
  }

  get canManageStructure(): boolean {
    return this.authService.hasAllowedRole(['ADMIN', 'DIRECTOR']);
  }

  loadDepartments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.hospitalStructureService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Nie udało się pobrać struktury szpitala.';
        this.isLoading = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  showCreateDepartmentForm(): void {
    this.clearForms();
    this.isDepartmentFormVisible = true;
    this.departmentForm = this.getEmptyDepartmentForm();
  }

  editDepartment(department: HospitalDepartment): void {
    this.clearForms();
    this.isDepartmentFormVisible = true;
    this.editingDepartmentId = department.id;
    this.departmentForm = {
      name: department.name,
      code: department.code,
      floor: department.floor,
      headDoctorName: department.headDoctorName,
    };
  }

  cancelDepartmentForm(): void {
    this.isDepartmentFormVisible = false;
    this.editingDepartmentId = null;
    this.departmentForm = this.getEmptyDepartmentForm();
  }

  saveDepartment(): void {
    const payload: CreateDepartmentPayload | UpdateDepartmentPayload = {
      name: this.departmentForm.name.trim(),
      code: this.departmentForm.code.trim(),
      floor: Number(this.departmentForm.floor),
      headDoctorName: this.departmentForm.headDoctorName.trim(),
    };

    const request$ = this.editingDepartmentId
      ? this.hospitalStructureService.updateDepartment(this.editingDepartmentId, payload)
      : this.hospitalStructureService.createDepartment(payload as CreateDepartmentPayload);

    this.handleDepartmentsMutation(
      request$,
      this.editingDepartmentId ? 'Oddział został zaktualizowany.' : 'Oddział został dodany.',
      () => this.cancelDepartmentForm(),
    );
  }

  deleteDepartment(department: HospitalDepartment): void {
    const confirmed = confirm(
      `Czy na pewno usunąć oddział "${department.name}" razem z salami i łóżkami?`,
    );

    if (!confirmed) {
      return;
    }

    this.handleDepartmentsMutation(
      this.hospitalStructureService.deleteDepartment(department.id),
      'Oddział został usunięty.',
      () => this.clearForms(),
    );
  }

  showCreateRoomForm(departmentId: number): void {
    this.resetRoomForm();
    this.resetBedForm();
    this.roomFormDepartmentId = departmentId;
    this.roomForm = this.getEmptyRoomForm();
  }

  editRoom(departmentId: number, room: HospitalRoom): void {
    this.resetRoomForm();
    this.resetBedForm();
    this.roomFormDepartmentId = departmentId;
    this.editingRoomId = room.id;
    this.roomForm = {
      number: room.number,
      type: room.type,
    };
  }

  cancelRoomForm(): void {
    this.resetRoomForm();
  }

  saveRoom(): void {
    if (!this.roomFormDepartmentId) {
      return;
    }

    const payload: CreateRoomPayload | UpdateRoomPayload = {
      number: this.roomForm.number.trim(),
      type: this.roomForm.type.trim(),
    };

    const request$ = this.editingRoomId
      ? this.hospitalStructureService.updateRoom(this.editingRoomId, payload)
      : this.hospitalStructureService.createRoom(
          this.roomFormDepartmentId,
          payload as CreateRoomPayload,
        );

    this.handleDepartmentsMutation(
      request$,
      this.editingRoomId ? 'Sala została zaktualizowana.' : 'Sala została dodana.',
      () => this.cancelRoomForm(),
    );
  }

  deleteRoom(room: HospitalRoom): void {
    const confirmed = confirm(`Czy na pewno usunąć salę ${room.number} razem z łóżkami?`);

    if (!confirmed) {
      return;
    }

    this.handleDepartmentsMutation(
      this.hospitalStructureService.deleteRoom(room.id),
      'Sala została usunięta.',
      () => this.clearForms(),
    );
  }

  showCreateBedForm(roomId: number): void {
    this.resetBedForm();
    this.bedFormRoomId = roomId;
    this.bedForm = this.getEmptyBedForm();
  }

  editBed(roomId: number, bed: HospitalBed): void {
    this.resetBedForm();
    this.bedFormRoomId = roomId;
    this.editingBedId = bed.id;
    this.bedForm = {
      number: bed.number,
      status: bed.status,
      patientName: bed.patientName ?? '',
    };
  }

  cancelBedForm(): void {
    this.resetBedForm();
  }

  saveBed(): void {
    if (!this.bedFormRoomId) {
      return;
    }

    const payload: CreateBedPayload | UpdateBedPayload = {
      number: this.bedForm.number.trim(),
      status: this.bedForm.status,
      patientName: this.bedForm.patientName.trim() || null,
    };

    const request$ = this.editingBedId
      ? this.hospitalStructureService.updateBed(this.editingBedId, payload)
      : this.hospitalStructureService.createBed(this.bedFormRoomId, payload as CreateBedPayload);

    this.handleDepartmentsMutation(
      request$,
      this.editingBedId ? 'Łóżko zostało zaktualizowane.' : 'Łóżko zostało dodane.',
      () => this.cancelBedForm(),
    );
  }

  deleteBed(bed: HospitalBed): void {
    const confirmed = confirm(`Czy na pewno usunąć łóżko ${bed.number}?`);

    if (!confirmed) {
      return;
    }

    this.handleDepartmentsMutation(
      this.hospitalStructureService.deleteBed(bed.id),
      'Łóżko zostało usunięte.',
      () => this.clearForms(),
    );
  }

  getBedsCount(department: HospitalDepartment): number {
    return department.rooms.reduce((sum, room) => sum + room.beds.length, 0);
  }

  getFreeBedsCount(department: HospitalDepartment): number {
    return department.rooms.reduce((sum, room) => {
      const freeBeds = room.beds.filter((bed) => bed.status === 'FREE').length;
      return sum + freeBeds;
    }, 0);
  }

  getStatusLabel(status: BedStatus): string {
    const labels: Record<BedStatus, string> = {
      FREE: 'Wolne',
      OCCUPIED: 'Zajęte',
      BLOCKED: 'Zablokowane',
      CLEANING: 'Dezynfekcja',
    };

    return labels[status];
  }

  private handleDepartmentsMutation(
    request$: Observable<HospitalDepartment[]>,
    successMessage: string,
    afterSuccess: () => void,
  ): void {
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    request$.subscribe({
      next: (departments) => {
        this.departments = departments;
        this.successMessage = successMessage;
        this.isSaving = false;
        afterSuccess();
        this.changeDetectorRef.detectChanges();
      },
      error: () => {
        this.errorMessage = 'Operacja nie powiodła się. Sprawdź dane formularza albo uprawnienia.';
        this.isSaving = false;
        this.changeDetectorRef.detectChanges();
      },
    });
  }

  private clearForms(): void {
    this.cancelDepartmentForm();
    this.resetRoomForm();
    this.resetBedForm();
  }

  private resetRoomForm(): void {
    this.roomFormDepartmentId = null;
    this.editingRoomId = null;
    this.roomForm = this.getEmptyRoomForm();
  }

  private resetBedForm(): void {
    this.bedFormRoomId = null;
    this.editingBedId = null;
    this.bedForm = this.getEmptyBedForm();
  }

  private getEmptyDepartmentForm(): DepartmentFormState {
    return {
      name: '',
      code: '',
      floor: 0,
      headDoctorName: '',
    };
  }

  private getEmptyRoomForm(): RoomFormState {
    return {
      number: '',
      type: '',
    };
  }

  private getEmptyBedForm(): BedFormState {
    return {
      number: '',
      status: 'FREE',
      patientName: '',
    };
  }
}
