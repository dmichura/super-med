-- CreateEnum
CREATE TYPE "BedStatus" AS ENUM ('FREE', 'OCCUPIED', 'BLOCKED', 'CLEANING');

-- CreateTable
CREATE TABLE "hospital_departments" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "head_doctor_name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_rooms" (
    "id" SERIAL NOT NULL,
    "department_id" INTEGER NOT NULL,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hospital_beds" (
    "id" SERIAL NOT NULL,
    "room_id" INTEGER NOT NULL,
    "number" TEXT NOT NULL,
    "status" "BedStatus" NOT NULL DEFAULT 'FREE',
    "patient_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hospital_beds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hospital_departments_code_key" ON "hospital_departments"("code");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_rooms_department_id_number_key" ON "hospital_rooms"("department_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "hospital_beds_room_id_number_key" ON "hospital_beds"("room_id", "number");

-- AddForeignKey
ALTER TABLE "hospital_rooms" ADD CONSTRAINT "hospital_rooms_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "hospital_departments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hospital_beds" ADD CONSTRAINT "hospital_beds_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "hospital_rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
