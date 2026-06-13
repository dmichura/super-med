-- CreateTable
CREATE TABLE "patients" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "pesel" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "is_authorized" BOOLEAN NOT NULL DEFAULT false,
    "assigned_doctor_name" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "patients_user_id_key" ON "patients"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "patients_pesel_key" ON "patients"("pesel");

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");

-- AddForeignKey
ALTER TABLE "patients" ADD CONSTRAINT "patients_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
