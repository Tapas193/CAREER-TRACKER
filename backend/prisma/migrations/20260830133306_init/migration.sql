-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'STUDENT', 'PLACEMENT_HEAD');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ADMITTED', 'ACTIVE', 'ON_PLACEMENT', 'GRADUATED', 'ALUMNI');

-- CreateEnum
CREATE TYPE "GraduationStatus" AS ENUM ('IN_PROGRESS', 'GRADUATED');

-- CreateEnum
CREATE TYPE "ResultStatus" AS ENUM ('PASS', 'FAIL');

-- CreateEnum
CREATE TYPE "PlacementStatus" AS ENUM ('APPLIED', 'IN_PROGRESS', 'SELECTED', 'REJECTED', 'OFFER_RECEIVED');

-- CreateEnum
CREATE TYPE "RoundType" AS ENUM ('APPLICATION', 'APTITUDE', 'TECHNICAL', 'INTERVIEW_HR');

-- CreateEnum
CREATE TYPE "RoundResult" AS ENUM ('PENDING', 'PASS', 'FAIL', 'SELECTED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "middle_name" VARCHAR(50),
    "last_name" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(15),
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'STUDENT',
    "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "student_student_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "course_code" VARCHAR(20) NOT NULL,
    "course_name" VARCHAR(100) NOT NULL,
    "department" VARCHAR(100) NOT NULL,
    "degree" VARCHAR(50) NOT NULL,
    "duration_years" INTEGER NOT NULL,
    "total_semester" INTEGER NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "first_name" VARCHAR(50) NOT NULL,
    "middle_name" VARCHAR(50),
    "last_name" VARCHAR(50) NOT NULL,
    "date_of_birth" DATE,
    "gender" VARCHAR(45),
    "enrollment_no" VARCHAR(30) NOT NULL,
    "roll_number" VARCHAR(15) NOT NULL,
    "admission_no" VARCHAR(30) NOT NULL,
    "admission_year" INTEGER NOT NULL,
    "expected_passing_year" INTEGER NOT NULL,
    "current_semester" INTEGER NOT NULL,
    "current_status" "StudentStatus" NOT NULL DEFAULT 'ADMITTED',
    "graduation_status" "GraduationStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "account_status" "AccountStatus" NOT NULL DEFAULT 'ACTIVE',
    "address" VARCHAR(255),
    "course_couse_id" INTEGER NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Academic_record" (
    "id" SERIAL NOT NULL,
    "semester" SMALLINT NOT NULL,
    "academic_year" INTEGER NOT NULL,
    "sgpa" DECIMAL(4,2) NOT NULL,
    "cgpa" DECIMAL(4,2) NOT NULL,
    "credits_earn" DECIMAL(5,2) NOT NULL,
    "total_credit" DECIMAL(5,2) NOT NULL,
    "result_stauts" "ResultStatus" NOT NULL,
    "student_student_id" INTEGER NOT NULL,

    CONSTRAINT "Academic_record_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Backlog" (
    "id" SERIAL NOT NULL,
    "attempted_no" INTEGER NOT NULL,
    "semester" SMALLINT NOT NULL,
    "subject" VARCHAR(100) NOT NULL,
    "status" VARCHAR(45) NOT NULL,
    "cleared_date" DATE,
    "attempted_again" BOOLEAN NOT NULL DEFAULT false,
    "student_student_id" INTEGER NOT NULL,

    CONSTRAINT "Backlog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Skill" (
    "id" SERIAL NOT NULL,
    "skill_name" VARCHAR(50) NOT NULL,
    "category" VARCHAR(50),

    CONSTRAINT "Skill_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student_skill" (
    "student_student_id" INTEGER NOT NULL,
    "skill_skill_id" INTEGER NOT NULL,

    CONSTRAINT "Student_skill_pkey" PRIMARY KEY ("student_student_id","skill_skill_id")
);

-- CreateTable
CREATE TABLE "Certification" (
    "id" SERIAL NOT NULL,
    "certification_name" VARCHAR(150) NOT NULL,
    "issuing_organisation" VARCHAR(150) NOT NULL,
    "issuing_date" DATE NOT NULL,
    "expiry_date" DATE,
    "certification_url" VARCHAR(500),
    "student_student_id" INTEGER NOT NULL,

    CONSTRAINT "Certification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" SERIAL NOT NULL,
    "project_title" VARCHAR(150) NOT NULL,
    "description" TEXT,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "technology_used" VARCHAR(255),
    "project_url" VARCHAR(500),
    "team_size" INTEGER NOT NULL DEFAULT 1,
    "student_student_id" INTEGER NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Internship" (
    "id" SERIAL NOT NULL,
    "company_name" VARCHAR(150) NOT NULL,
    "role" VARCHAR(100) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "stipend" DECIMAL(10,2),
    "certificate_url" VARCHAR(500),
    "student_student_id" INTEGER NOT NULL,

    CONSTRAINT "Internship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement" (
    "id" SERIAL NOT NULL,
    "company_name" VARCHAR(150) NOT NULL,
    "job_role" VARCHAR(100) NOT NULL,
    "placement_date" DATE NOT NULL,
    "package_lpa" DECIMAL(8,2) NOT NULL,
    "placement_status" "PlacementStatus" NOT NULL DEFAULT 'APPLIED',
    "location" VARCHAR(100),
    "student_student_id" INTEGER NOT NULL,

    CONSTRAINT "Placement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Placement_round" (
    "id" SERIAL NOT NULL,
    "round_number" INTEGER NOT NULL,
    "round_type" "RoundType" NOT NULL,
    "round_date" DATE NOT NULL,
    "result" "RoundResult" NOT NULL DEFAULT 'PENDING',
    "remark" TEXT,
    "placement_placement_id" INTEGER NOT NULL,

    CONSTRAINT "Placement_round_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Round_feedback" (
    "id" SERIAL NOT NULL,
    "rating" SMALLINT NOT NULL,
    "feedback_date" DATE NOT NULL,
    "comments" TEXT,
    "placement_round_placement_round_id" INTEGER NOT NULL,

    CONSTRAINT "Round_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offer_letter" (
    "id" SERIAL NOT NULL,
    "company_name" VARCHAR(150) NOT NULL,
    "package_lpa" DECIMAL(10,2) NOT NULL,
    "offer_date" DATE NOT NULL,
    "joining_date" DATE,
    "designation" VARCHAR(100),
    "location" VARCHAR(45),
    "document_url" VARCHAR(500),
    "placement_placement_id" INTEGER NOT NULL,

    CONSTRAINT "Offer_letter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Carrer_history" (
    "id" SERIAL NOT NULL,
    "company_name" VARCHAR(150) NOT NULL,
    "job_title" VARCHAR(100) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE,
    "role" VARCHAR(100),
    "location" VARCHAR(100),
    "current_job" BOOLEAN NOT NULL DEFAULT false,
    "student_student_id" INTEGER NOT NULL,

    CONSTRAINT "Carrer_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alumini_feedback" (
    "id" SERIAL NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "feedback" TEXT,
    "feedback_date" DATE NOT NULL,
    "student_student_id" INTEGER NOT NULL,

    CONSTRAINT "Alumini_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_student_student_id_key" ON "User"("student_student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Course_course_code_key" ON "Course"("course_code");

-- CreateIndex
CREATE UNIQUE INDEX "Student_enrollment_no_key" ON "Student"("enrollment_no");

-- CreateIndex
CREATE UNIQUE INDEX "Student_roll_number_key" ON "Student"("roll_number");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admission_no_key" ON "Student"("admission_no");

-- CreateIndex
CREATE INDEX "Student_course_couse_id_idx" ON "Student"("course_couse_id");

-- CreateIndex
CREATE INDEX "Academic_record_student_student_id_idx" ON "Academic_record"("student_student_id");

-- CreateIndex
CREATE INDEX "Backlog_student_student_id_idx" ON "Backlog"("student_student_id");

-- CreateIndex
CREATE UNIQUE INDEX "Skill_skill_name_key" ON "Skill"("skill_name");

-- CreateIndex
CREATE INDEX "Certification_student_student_id_idx" ON "Certification"("student_student_id");

-- CreateIndex
CREATE INDEX "Project_student_student_id_idx" ON "Project"("student_student_id");

-- CreateIndex
CREATE INDEX "Internship_student_student_id_idx" ON "Internship"("student_student_id");

-- CreateIndex
CREATE INDEX "Placement_student_student_id_idx" ON "Placement"("student_student_id");

-- CreateIndex
CREATE INDEX "Placement_round_placement_placement_id_idx" ON "Placement_round"("placement_placement_id");

-- CreateIndex
CREATE UNIQUE INDEX "Placement_round_placement_placement_id_round_number_key" ON "Placement_round"("placement_placement_id", "round_number");

-- CreateIndex
CREATE UNIQUE INDEX "Round_feedback_placement_round_placement_round_id_key" ON "Round_feedback"("placement_round_placement_round_id");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_letter_placement_placement_id_key" ON "Offer_letter"("placement_placement_id");

-- CreateIndex
CREATE INDEX "Carrer_history_student_student_id_idx" ON "Carrer_history"("student_student_id");

-- CreateIndex
CREATE INDEX "Alumini_feedback_student_student_id_idx" ON "Alumini_feedback"("student_student_id");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_student_student_id_fkey" FOREIGN KEY ("student_student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student" ADD CONSTRAINT "Student_course_couse_id_fkey" FOREIGN KEY ("course_couse_id") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Academic_record" ADD CONSTRAINT "Academic_record_student_student_id_fkey" FOREIGN KEY ("student_student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backlog" ADD CONSTRAINT "Backlog_student_student_id_fkey" FOREIGN KEY ("student_student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_skill" ADD CONSTRAINT "Student_skill_student_student_id_fkey" FOREIGN KEY ("student_student_id") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Student_skill" ADD CONSTRAINT "Student_skill_skill_skill_id_fkey" FOREIGN KEY ("skill_skill_id") REFERENCES "Skill"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Certification" ADD CONSTRAINT "Certification_student_student_id_fkey" FOREIGN KEY ("student_student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_student_student_id_fkey" FOREIGN KEY ("student_student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internship" ADD CONSTRAINT "Internship_student_student_id_fkey" FOREIGN KEY ("student_student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement" ADD CONSTRAINT "Placement_student_student_id_fkey" FOREIGN KEY ("student_student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placement_round" ADD CONSTRAINT "Placement_round_placement_placement_id_fkey" FOREIGN KEY ("placement_placement_id") REFERENCES "Placement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Round_feedback" ADD CONSTRAINT "Round_feedback_placement_round_placement_round_id_fkey" FOREIGN KEY ("placement_round_placement_round_id") REFERENCES "Placement_round"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer_letter" ADD CONSTRAINT "Offer_letter_placement_placement_id_fkey" FOREIGN KEY ("placement_placement_id") REFERENCES "Placement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Carrer_history" ADD CONSTRAINT "Carrer_history_student_student_id_fkey" FOREIGN KEY ("student_student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alumini_feedback" ADD CONSTRAINT "Alumini_feedback_student_student_id_fkey" FOREIGN KEY ("student_student_id") REFERENCES "Student"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
