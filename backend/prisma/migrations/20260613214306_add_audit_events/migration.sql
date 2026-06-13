-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('LOGIN', 'LOGOUT', 'VIEW', 'CREATE', 'UPDATE', 'DELETE', 'EXPORT', 'AUTHORIZE');

-- CreateEnum
CREATE TYPE "AuditResourceType" AS ENUM ('AUTH', 'PATIENT', 'EMPLOYEE', 'MEDICAL_RECORD', 'HOSPITAL_STRUCTURE', 'REPORT');

-- CreateEnum
CREATE TYPE "AuditResult" AS ENUM ('SUCCESS', 'DENIED', 'ERROR');

-- CreateTable
CREATE TABLE "audit_events" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "actor_name" TEXT NOT NULL,
    "actor_role" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "resource_type" "AuditResourceType" NOT NULL,
    "resource_name" TEXT NOT NULL,
    "occurred_at" TIMESTAMP(3) NOT NULL,
    "ip_address" TEXT NOT NULL,
    "result" "AuditResult" NOT NULL,
    "reason" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "audit_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "audit_events_code_key" ON "audit_events"("code");
