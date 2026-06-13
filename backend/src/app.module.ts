import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { PatientsModule } from './patients/patients.module';
import { EmployeesModule } from './employees/employees.module';
import { HospitalStructureModule } from './hospital-structure/hospital-structure.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { DocumentsModule } from './documents/documents.module';
import { ReportsModule } from './reports/reports.module';
import { AuditModule } from './audit/audit.module';

@Module({
 imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../.env', '.env'],
    }),
    PrismaModule,
    AuthModule,
    PatientsModule,
    EmployeesModule,
    HospitalStructureModule,
    MedicalRecordsModule,
    DocumentsModule,
    ReportsModule,
    AuditModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
