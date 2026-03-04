-- CreateTable
CREATE TABLE "public"."Worker" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Appointment" (
    "id" SERIAL NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT,
    "description" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "start_time" TIME(0) NOT NULL,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AppointmentWorker" (
    "appointment_id" INTEGER NOT NULL,
    "worker_id" INTEGER NOT NULL,

    CONSTRAINT "AppointmentWorker_pkey" PRIMARY KEY ("appointment_id","worker_id")
);

-- AddForeignKey
ALTER TABLE "public"."AppointmentWorker" ADD CONSTRAINT "AppointmentWorker_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "public"."Appointment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AppointmentWorker" ADD CONSTRAINT "AppointmentWorker_worker_id_fkey" FOREIGN KEY ("worker_id") REFERENCES "public"."Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
