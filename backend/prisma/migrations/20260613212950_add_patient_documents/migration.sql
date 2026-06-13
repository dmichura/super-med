-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('MEDICAL_SCAN', 'LAB_ATTACHMENT', 'CONSENT', 'ADMINISTRATIVE', 'DISCHARGE_FILE');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('UPLOADED', 'VERIFIED', 'REJECTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "patient_documents" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "patient_id" INTEGER NOT NULL,
    "type" "DocumentType" NOT NULL,
    "file_name" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL,
    "is_sensitive" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_documents_code_key" ON "patient_documents"("code");

-- AddForeignKey
ALTER TABLE "patient_documents" ADD CONSTRAINT "patient_documents_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
