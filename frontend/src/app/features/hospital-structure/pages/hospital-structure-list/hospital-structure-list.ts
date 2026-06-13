import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { BedStatus, HospitalDepartment } from '../../../../shared/models/hospital-structure.model';
import { HospitalStructureService } from '../../hospital-structure.service';

@Component({
  selector: 'app-hospital-structure-list',
  imports: [],
  templateUrl: './hospital-structure-list.html',
  styleUrl: './hospital-structure-list.css',
})
export class HospitalStructureList implements OnInit {
  private readonly hospitalStructureService = inject(HospitalStructureService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  departments: HospitalDepartment[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadDepartments();
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
}
