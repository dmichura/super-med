-- CreateEnum
CREATE TYPE "MedicalRecordType" AS ENUM ('VISIT', 'DIAGNOSIS', 'PRESCRIPTION', 'LAB_RESULT', 'DISCHARGE_SUMMARY');

-- CreateEnum
CREATE TYPE "MedicalRecordStatus" AS ENUM ('DRAFT', 'FINAL', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MedicalRecordAuditAction" AS ENUM ('VIEW', 'CREATE', 'UPDATE', 'EXPORT');

-- CreateTable
CREATE TABLE "medical_records" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "doctor_name" TEXT NOT NULL,
    "department_name" TEXT NOT NULL,
    "type" "MedicalRecordType" NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "status" "MedicalRecordStatus" NOT NULL,
    "is_sensitive" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_record_audit_entries" (
    "id" SERIAL NOT NULL,
    "medical_record_id" INTEGER NOT NULL,
    "actor_name" TEXT NOT NULL,
    "action" "MedicalRecordAuditAction" NOT NULL,
    "accessed_at" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "medical_record_audit_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "medical_records_code_key" ON "medical_records"("code");

-- AddForeignKey
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "medical_record_audit_entries" ADD CONSTRAINT "medical_record_audit_entries_medical_record_id_fkey" FOREIGN KEY ("medical_record_id") REFERENCES "medical_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;
