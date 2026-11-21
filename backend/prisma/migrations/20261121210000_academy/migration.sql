-- CreateEnum
CREATE TYPE "Nivel" AS ENUM ('EXPLORADORES', 'CONSTRUCTORES', 'AVANZADOS');

-- CreateEnum
CREATE TYPE "Materia" AS ENUM ('MATEMATICAS', 'LECTURA', 'CIENCIAS');

-- CreateTable
CREATE TABLE "estudiantes" (
    "id" SERIAL NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "email" VARCHAR(320),
    "nivel" "Nivel" NOT NULL DEFAULT 'EXPLORADORES',
    "xp_total" INTEGER NOT NULL DEFAULT 0,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "estudiantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actividades" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(160) NOT NULL,
    "titulo" VARCHAR(160) NOT NULL,
    "materia" "Materia" NOT NULL,
    CONSTRAINT "actividades_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progresos" (
    "id" SERIAL NOT NULL,
    "estudiante_id" INTEGER NOT NULL,
    "actividad_id" INTEGER NOT NULL,
    "nivel" "Nivel" NOT NULL,
    "xp" INTEGER NOT NULL,
    "completado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "progresos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insignias" (
    "id" SERIAL NOT NULL,
    "codigo" VARCHAR(100) NOT NULL,
    "nombre" VARCHAR(120) NOT NULL,
    "descripcion" VARCHAR(500) NOT NULL,
    "materia" "Materia",
    "xp_requerido" INTEGER NOT NULL,
    CONSTRAINT "insignias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "estudiante_insignias" (
    "estudiante_id" INTEGER NOT NULL,
    "insignia_id" INTEGER NOT NULL,
    "obtenida_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "estudiante_insignias_pkey" PRIMARY KEY ("estudiante_id", "insignia_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "estudiantes_email_key" ON "estudiantes"("email");
CREATE UNIQUE INDEX "actividades_slug_key" ON "actividades"("slug");
CREATE INDEX "progresos_estudiante_id_idx" ON "progresos"("estudiante_id");
CREATE UNIQUE INDEX "insignias_codigo_key" ON "insignias"("codigo");

-- AddForeignKey
ALTER TABLE "progresos" ADD CONSTRAINT "progresos_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "progresos" ADD CONSTRAINT "progresos_actividad_id_fkey" FOREIGN KEY ("actividad_id") REFERENCES "actividades"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "estudiante_insignias" ADD CONSTRAINT "estudiante_insignias_estudiante_id_fkey" FOREIGN KEY ("estudiante_id") REFERENCES "estudiantes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "estudiante_insignias" ADD CONSTRAINT "estudiante_insignias_insignia_id_fkey" FOREIGN KEY ("insignia_id") REFERENCES "insignias"("id") ON DELETE CASCADE ON UPDATE CASCADE;
