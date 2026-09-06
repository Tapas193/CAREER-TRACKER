import { PrismaClient, Role, AccountStatus, StudentStatus, GraduationStatus, ResultStatus, PlacementStatus, RoundType, RoundResult, PreparationResourceType, PreparationDifficulty, NotificationType } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { preparationResources } from './preparation-seed-data.mjs';

const prisma = new PrismaClient();

async function hash(p: string) {
  return bcrypt.hash(p, 10);
}

async function main() {
  console.log('Seeding database...');
  await prisma.$transaction([
    prisma.preparationResource.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.alumniFeedback.deleteMany(),
    prisma.careerHistory.deleteMany(),
    prisma.roundFeedback.deleteMany(),
    prisma.offerLetter.deleteMany(),
    prisma.placementRound.deleteMany(),
    prisma.placement.deleteMany(),
    prisma.internship.deleteMany(),
    prisma.project.deleteMany(),
    prisma.certification.deleteMany(),
    prisma.studentSkill.deleteMany(),
    prisma.skill.deleteMany(),
    prisma.backlog.deleteMany(),
    prisma.academicRecord.deleteMany(),
    prisma.user.deleteMany(),
    prisma.student.deleteMany(),
    prisma.course.deleteMany(),
  ]);

  const pHash = await hash('KeepSecret@123'); // shared hashed credential for login examples

  // ===== Courses =====
  const cse = await prisma.course.create({
    data: { courseCode: 'CSE', courseName: 'B.Tech Computer Science & Engineering', department: 'Computer Science', degree: 'B.Tech', durationYears: 4, totalSemesters: 8 },
  });
  const ece = await prisma.course.create({
    data: { courseCode: 'ECE', courseName: 'B.Tech Electronics & Communication', department: 'Electronics', degree: 'B.Tech', durationYears: 4, totalSemesters: 8 },
  });
  const mech = await prisma.course.create({
    data: { courseCode: 'ME', courseName: 'B.Tech Mechanical Engineering', department: 'Mechanical', degree: 'B.Tech', durationYears: 4, totalSemesters: 8 },
  });
  const mba = await prisma.course.create({
    data: { courseCode: 'MBA', courseName: 'MBA Business Administration', department: 'Management', degree: 'MBA', durationYears: 2, totalSemesters: 4 },
  });

  // ===== Skills =====
  const skillData = [
    ['Java', 'Programming'], ['Python', 'Programming'], ['JavaScript', 'Programming'], ['TypeScript', 'Programming'],
    ['SQL', 'Database'], ['MongoDB', 'Database'], ['React', 'Web'], ['Node.js', 'Web'],
    ['Machine Learning', 'AI'], ['Data Structures', 'Core'], ['Algorithms', 'Core'], ['AWS', 'Cloud'],
    ['Docker', 'DevOps'], ['Communication', 'Soft Skill'], ['Leadership', 'Soft Skill'], ['R', 'Data'],
  ];
  for (const [name, cat] of skillData) {
    await prisma.skill.upsert({ where: { skillName: name }, update: {}, create: { skillName: name, category: cat } });
  }

  // ===== Helper to create a student with full profile =====
  let counter = 0;

  async function createStudent(opts: {
    firstName: string; lastName: string; enrollmentNo: string; rollNumber: string; admissionNo: string;
    course: typeof cse; year: number; semester: number; gender: string; status?: string; email?: string;
    withAccount?: boolean;
  }) {
    counter++;
    const student = await prisma.student.create({
      data: {
        firstName: opts.firstName,
        lastName: opts.lastName,
        dateOfBirth: new Date(`${opts.year - 18}-03-15`),
        gender: opts.gender,
        enrollmentNo: opts.enrollmentNo,
        rollNumber: opts.rollNumber,
        admissionNo: opts.admissionNo,
        admissionYear: opts.year,
        expectedYear: opts.year + (opts.course.id === mba.id ? 2 : 4),
        currentSemester: opts.semester,
        currentStatus: (opts.status as any) || StudentStatus.ACTIVE,
        graduationStatus: opts.status === 'GRADUATED' || opts.status === 'ALUMNI' ? GraduationStatus.GRADUATED : GraduationStatus.IN_PROGRESS,
        accountStatus: AccountStatus.ACTIVE,
        address: `${123 + counter} Street, City`,
        courseId: opts.course.id,
      },
    });
    if (opts.withAccount) {
      await prisma.user.create({
        data: {
          firstName: opts.firstName,
          lastName: opts.lastName,
          email: opts.email!,
          phone: `${9000000000 + counter}`,
          passwordHash: pHash,
          role: Role.STUDENT,
          studentId: student.id,
        },
      });
    }
    return student;
  }

  // ===== Admin & Placement Head =====
  await prisma.user.create({
    data: { firstName: 'System', lastName: 'Admin', email: 'admin@careertrack.com', phone: '9999990001', passwordHash: pHash, role: Role.ADMIN },
  });
  await prisma.user.create({
    data: { firstName: 'Placement', lastName: 'Head', email: 'placement@careertrack.com', phone: '9999990002', passwordHash: pHash, role: Role.PLACEMENT_HEAD },
  });

  // ===== Students (14 across 4 courses) =====

  // Full pipeline students: CSE
  const s1 = await createStudent({ firstName: 'Aarav', lastName: 'Sharma', enrollmentNo: 'ENR2022001', rollNumber: '22CSE001', admissionNo: 'ADM22001', course: cse, year: 2022, semester: 7, gender: 'Male', withAccount: true, email: 'aarav@student.com' });
  const s2 = await createStudent({ firstName: 'Diya', lastName: 'Patel', enrollmentNo: 'ENR2022002', rollNumber: '22CSE002', admissionNo: 'ADM22002', course: cse, year: 2022, semester: 7, gender: 'Female', withAccount: true, email: 'diya@student.com' });
  const s3 = await createStudent({ firstName: 'Rohan', lastName: 'Verma', enrollmentNo: 'ENR2022003', rollNumber: '22CSE003', admissionNo: 'ADM22003', course: cse, year: 2022, semester: 7, gender: 'Male' });
  const s4 = await createStudent({ firstName: 'Ishita', lastName: 'Gupta', enrollmentNo: 'ENR2022004', rollNumber: '22CSE004', admissionNo: 'ADM22004', course: cse, year: 2022, semester: 7, gender: 'Female' });

  // ECE students
  const s5 = await createStudent({ firstName: 'Kavya', lastName: 'Nair', enrollmentNo: 'ENR2022005', rollNumber: '22ECE001', admissionNo: 'ADM22005', course: ece, year: 2022, semester: 7, gender: 'Female' });
  const s6 = await createStudent({ firstName: 'Arjun', lastName: 'Reddy', enrollmentNo: 'ENR2022006', rollNumber: '22ECE002', admissionNo: 'ADM22006', course: ece, year: 2022, semester: 7, gender: 'Male' });

  // Mechanical
  const s7 = await createStudent({ firstName: 'Vikram', lastName: 'Singh', enrollmentNo: 'ENR2022007', rollNumber: '22ME001', admissionNo: 'ADM22007', course: mech, year: 2022, semester: 7, gender: 'Male' });

  // MBA students
  const s8 = await createStudent({ firstName: 'Priya', lastName: 'Menon', enrollmentNo: 'ENR2024001', rollNumber: '24MBA001', admissionNo: 'ADM24001', course: mba, year: 2024, semester: 5, gender: 'Female' });

  // Younger batch CSE
  const s9 = await createStudent({ firstName: 'Aditya', lastName: 'Kumar', enrollmentNo: 'ENR2023001', rollNumber: '23CSE001', admissionNo: 'ADM23001', course: cse, year: 2023, semester: 6, gender: 'Male', withAccount: true, email: 'aditya@student.com' });

  // Delayed / backlog case
  const s10 = await createStudent({ firstName: 'Neha', lastName: 'Joshi', enrollmentNo: 'ENR2021001', rollNumber: '21CSE001', admissionNo: 'ADM21001', course: cse, year: 2021, semester: 8, gender: 'Female' });

  // ADMITTED / fresh
  const s11 = await createStudent({ firstName: 'Kabir', lastName: 'Mehta', enrollmentNo: 'ENR2025001', rollNumber: '25CSE001', admissionNo: 'ADM25001', course: cse, year: 2025, semester: 1, gender: 'Male', status: 'ADMITTED' });

  // ON_PLACEMENT
  const s12 = await createStudent({ firstName: 'Sneha', lastName: 'Iyer', enrollmentNo: 'ENR2022008', rollNumber: '22CSE005', admissionNo: 'ADM22008', course: cse, year: 2022, semester: 7, gender: 'Female', status: 'ON_PLACEMENT' });

  // GRADUATED -> ALUMNI (with career history + alumni feedback)
  const s13 = await createStudent({ firstName: 'Rahul', lastName: 'Desai', enrollmentNo: 'ENR2020010', rollNumber: '20CSE001', admissionNo: 'ADM20001', course: cse, year: 2020, semester: 8, gender: 'Male', status: 'ALUMNI', withAccount: true, email: 'rahul@student.com' });
  const s14 = await createStudent({ firstName: 'Ananya', lastName: 'Rao', enrollmentNo: 'ENR2020011', rollNumber: '20ECE001', admissionNo: 'ADM20002', course: ece, year: 2020, semester: 8, gender: 'Female', status: 'ALUMNI' });

  // ===== Academic records + backlogs =====

  // Helper to add academic records for a student
  async function addAcademic(student: any, records: Array<{ sem: number; sgpa: number; cgpa: number; credits: number; total: number; pass?: boolean }>) {
    for (const r of records) {
      await prisma.academicRecord.create({
        data: {
          studentId: student.id,
          semester: r.sem,
          academicYear: student.admissionYear + Math.floor((r.sem - 1) / 2),
          sgpa: r.sgpa,
          cgpa: r.cgpa,
          creditsEarned: r.credits,
          totalCredits: r.total,
          resultStatus: r.pass === false ? ResultStatus.FAIL : ResultStatus.PASS,
        },
      });
    }
  }

  await addAcademic(s1, [
    { sem: 1, sgpa: 8.2, cgpa: 8.2, credits: 24, total: 24 },
    { sem: 2, sgpa: 8.5, cgpa: 8.35, credits: 24, total: 24 },
    { sem: 3, sgpa: 8.8, cgpa: 8.5, credits: 24, total: 24 },
    { sem: 4, sgpa: 9.0, cgpa: 8.63, credits: 24, total: 24 },
    { sem: 5, sgpa: 8.7, cgpa: 8.64, credits: 24, total: 24 },
    { sem: 6, sgpa: 9.1, cgpa: 8.72, credits: 24, total: 24 },
  ]);
  await addAcademic(s2, [
    { sem: 1, sgpa: 7.5, cgpa: 7.5, credits: 24, total: 24 },
    { sem: 2, sgpa: 7.8, cgpa: 7.65, credits: 24, total: 24 },
    { sem: 3, sgpa: 8.1, cgpa: 7.8, credits: 24, total: 24 },
    { sem: 4, sgpa: 8.3, cgpa: 7.93, credits: 24, total: 24 },
    { sem: 5, sgpa: 8.0, cgpa: 7.94, credits: 24, total: 24 },
    { sem: 6, sgpa: 8.4, cgpa: 8.02, credits: 24, total: 24 },
  ]);
  await addAcademic(s9, [
    { sem: 1, sgpa: 7.0, cgpa: 7.0, credits: 24, total: 24 },
    { sem: 2, sgpa: 7.4, cgpa: 7.2, credits: 24, total: 24 },
    { sem: 3, sgpa: 7.9, cgpa: 7.43, credits: 24, total: 24 },
    { sem: 4, sgpa: 8.1, cgpa: 7.6, credits: 24, total: 24 },
  ]);
  // s10 with a failing backlog situation
  await addAcademic(s10, [
    { sem: 1, sgpa: 6.5, cgpa: 6.5, credits: 20, total: 24, pass: true },
    { sem: 2, sgpa: 6.8, cgpa: 6.65, credits: 20, total: 24 },
    { sem: 3, sgpa: 6.4, cgpa: 6.57, credits: 20, total: 24 },
    { sem: 4, sgpa: 6.9, cgpa: 6.65, credits: 20, total: 22 },
    { sem: 5, sgpa: 7.1, cgpa: 6.74, credits: 20, total: 24 },
    { sem: 6, sgpa: 7.0, cgpa: 6.78, credits: 20, total: 24 },
    { sem: 7, sgpa: 7.2, cgpa: 6.84, credits: 20, total: 24 },
    { sem: 8, sgpa: 7.3, cgpa: 6.9, credits: 20, total: 24 },
  ]);
  // s1 has a (cleared) backlog early; s10 has an unresolved backlog
  await prisma.backlog.create({ data: { studentId: s1.id, attemptedNo: 1, semester: 3, subject: 'Operating Systems', status: 'Cleared', clearedDate: new Date('2024-06-01'), attemptedAgain: false } });
  await prisma.backlog.create({ data: { studentId: s10.id, attemptedNo: 1, semester: 6, subject: 'Compiler Design', status: 'Pending', clearedDate: null, attemptedAgain: true } });
  await prisma.backlog.create({ data: { studentId: s10.id, attemptedNo: 2, semester: 7, subject: 'Compiler Design', status: 'Pending', clearedDate: null, attemptedAgain: true } });
  // alumni academic records
  await addAcademic(s13, [
    { sem: 1, sgpa: 8.0, cgpa: 8.0, credits: 24, total: 24 },
    { sem: 2, sgpa: 8.3, cgpa: 8.15, credits: 24, total: 24 },
    { sem: 3, sgpa: 8.5, cgpa: 8.27, credits: 24, total: 24 },
    { sem: 4, sgpa: 8.6, cgpa: 8.35, credits: 24, total: 24 },
    { sem: 5, sgpa: 8.8, cgpa: 8.44, credits: 24, total: 24 },
    { sem: 6, sgpa: 8.7, cgpa: 8.48, credits: 24, total: 24 },
    { sem: 7, sgpa: 9.0, cgpa: 8.56, credits: 24, total: 24 },
    { sem: 8, sgpa: 9.1, cgpa: 8.63, credits: 24, total: 24 },
  ]);
  await addAcademic(s14, [
    { sem: 1, sgpa: 7.8, cgpa: 7.8, credits: 24, total: 24 },
    { sem: 2, sgpa: 8.0, cgpa: 7.9, credits: 24, total: 24 },
    { sem: 3, sgpa: 8.2, cgpa: 8.0, credits: 24, total: 24 },
    { sem: 4, sgpa: 8.4, cgpa: 8.1, credits: 24, total: 24 },
    { sem: 5, sgpa: 8.5, cgpa: 8.18, credits: 24, total: 24 },
    { sem: 6, sgpa: 8.6, cgpa: 8.25, credits: 24, total: 24 },
    { sem: 7, sgpa: 8.7, cgpa: 8.32, credits: 24, total: 24 },
    { sem: 8, sgpa: 8.8, cgpa: 8.38, credits: 24, total: 24 },
  ]);

  // ===== Skills assignment =====
  const skillMap = new Map<string, number>();
  for (const [n] of skillData) {
    const s = await prisma.skill.findUnique({ where: { skillName: n } });
    if (s) skillMap.set(n, s.id);
  }
  async function assignSkills(studentId: number, names: string[]) {
    for (const n of names) {
      const id = skillMap.get(n);
      if (id) await prisma.studentSkill.create({ data: { studentId, skillId: id } });
    }
  }
  await assignSkills(s1.id, ['Java', 'Python', 'SQL', 'React', 'Data Structures', 'Algorithms', 'AWS', 'Communication']);
  await assignSkills(s2.id, ['Python', 'Machine Learning', 'SQL', 'Communication', 'JavaScript']);
  await assignSkills(s9.id, ['JavaScript', 'React', 'Node.js', 'Docker', 'TypeScript']);
  await assignSkills(s13.id, ['Java', 'SQL', 'AWS', 'Leadership', 'Data Structures']);
  await assignSkills(s5.id, ['Python', 'R', 'Machine Learning', 'Communication']);

  // ===== Certifications =====
  await prisma.certification.createMany({
    data: [
      { studentId: s1.id, certificationName: 'AWS Certified Developer', issuingOrganisation: 'Amazon', issuingDate: new Date('2024-05-10') },
      { studentId: s1.id, certificationName: 'Oracle Java SE 17', issuingOrganisation: 'Oracle', issuingDate: new Date('2024-01-15') },
      { studentId: s2.id, certificationName: 'TensorFlow Developer', issuingOrganisation: 'Google', issuingDate: new Date('2024-03-20') },
      { studentId: s9.id, certificationName: 'Meta Front-End Developer', issuingOrganisation: 'Meta', issuingDate: new Date('2024-07-01') },
      { studentId: s13.id, certificationName: 'AWS Solutions Architect', issuingOrganisation: 'Amazon', issuingDate: new Date('2023-02-18') },
    ],
  });

  // ===== Projects =====
  await prisma.project.create({
    data: { studentId: s1.id, projectTitle: 'Campus Placement Portal', description: 'Full-stack portal managing placement drives', startDate: new Date('2024-02-01'), endDate: new Date('2024-06-30'), technologyUsed: 'React, Node.js, PostgreSQL', teamSize: 4 },
  });
  await prisma.project.create({
    data: { studentId: s1.id, projectTitle: 'E-Commerce Recommendation Engine', description: 'ML-based product recommendation', startDate: new Date('2023-09-01'), technologyUsed: 'Python, scikit-learn', teamSize: 3 },
  });
  await prisma.project.create({
    data: { studentId: s2.id, projectTitle: 'Image Classifier for Medical X-rays', description: 'CNN to detect anomalies', startDate: new Date('2024-04-01'), technologyUsed: 'Python, TensorFlow', teamSize: 2 },
  });
  await prisma.project.create({
    data: { studentId: s9.id, projectTitle: 'Expense Tracker Mobile App', description: 'Cross-platform budgeting app', startDate: new Date('2024-03-15'), technologyUsed: 'React Native', teamSize: 2 },
  });
  await prisma.project.create({
    data: { studentId: s13.id, projectTitle: 'Library Management System', description: 'Backend system for library operations', startDate: new Date('2022-01-10'), endDate: new Date('2022-05-20'), technologyUsed: 'Java, MySQL', teamSize: 5 },
  });

  // ===== Internships =====
  await prisma.internship.create({
    data: { studentId: s1.id, companyName: 'Google', role: 'SWE Intern', startDate: new Date('2024-05-20'), endDate: new Date('2024-07-30'), stipend: 100000, certificateUrl: '/uploads/google-cert.pdf' },
  });
  await prisma.internship.create({
    data: { studentId: s2.id, companyName: 'Flipkart', role: 'ML Intern', startDate: new Date('2024-06-01'), endDate: new Date('2024-08-01'), stipend: 60000 },
  });
  await prisma.internship.create({
    data: { studentId: s9.id, companyName: 'Infosys', role: 'Frontend Intern', startDate: new Date('2024-05-01'), endDate: new Date('2024-07-15'), stipend: 25000 },
  });
  await prisma.internship.create({
    data: { studentId: s13.id, companyName: 'TCS', role: 'Software Trainee', startDate: new Date('2023-06-01'), endDate: new Date('2023-09-15'), stipend: 40000 },
  });

  // ===== Placements (full pipeline: placement -> rounds -> feedback -> offer) =====
  async function fullPlacement(student: any, company: string, role: string, date: Date, lpa: number, location: string, rounds: Array<{ num: number; type: RoundType; result: RoundResult; rating: number }>) {
    const placement = await prisma.placement.create({
      data: {
        studentId: student.id, companyName: company, jobRole: role, placementDate: date,
        packageLpa: lpa, placementStatus: PlacementStatus.OFFER_RECEIVED, location,
      },
    });
    for (const r of rounds) {
      const rd = await prisma.placementRound.create({
        data: { placementId: placement.id, roundNumber: r.num, roundType: r.type, roundDate: new Date(date.getTime()), result: r.result, remark: `Round ${r.num} of ${company}` },
      });
      await prisma.roundFeedback.create({
        data: { placementRoundId: rd.id, rating: r.rating, feedbackDate: new Date(date.getTime()), comments: `Feedback for round ${r.num} - good candidate` },
      });
    }
    await prisma.offerLetter.create({
      data: {
        placementId: placement.id, companyName: company, packageLpa: lpa, offerDate: date,
        joiningDate: new Date(date.getTime() + 60 * 24 * 60 * 60 * 1000),
        designation: role, location, documentUrl: '/uploads/offer-letter.pdf',
      },
    });
    return placement;
  }

  await fullPlacement(s1, 'Google', 'Software Engineer', new Date('2024-10-15'), 42, 'Bengaluru', [
    { num: 1, type: RoundType.APPLICATION, result: RoundResult.PASS, rating: 4 },
    { num: 2, type: RoundType.APTITUDE, result: RoundResult.PASS, rating: 4 },
    { num: 3, type: RoundType.TECHNICAL, result: RoundResult.SELECTED, rating: 5 },
  ]);
  await fullPlacement(s2, 'Flipkart', 'Machine Learning Engineer', new Date('2024-10-20'), 28, 'Bengaluru', [
    { num: 1, type: RoundType.APPLICATION, result: RoundResult.PASS, rating: 4 },
    { num: 2, type: RoundType.APTITUDE, result: RoundResult.PASS, rating: 3 },
    { num: 3, type: RoundType.TECHNICAL, result: RoundResult.SELECTED, rating: 5 },
  ]);
  // s1 has a second offer
  await fullPlacement(s1, 'Microsoft', 'Software Development Engineer', new Date('2024-11-05'), 38, 'Hyderabad', [
    { num: 1, type: RoundType.APPLICATION, result: RoundResult.PASS, rating: 4 },
    { num: 2, type: RoundType.APTITUDE, result: RoundResult.PASS, rating: 4 },
    { num: 3, type: RoundType.TECHNICAL, result: RoundResult.SELECTED, rating: 4 },
  ]);
  // alumni placement
  await fullPlacement(s13, 'TCS', 'Systems Engineer', new Date('2024-06-10'), 7, 'Mumbai', [
    { num: 1, type: RoundType.APPLICATION, result: RoundResult.PASS, rating: 3 },
    { num: 2, type: RoundType.TECHNICAL, result: RoundResult.SELECTED, rating: 4 },
  ]);

  // s5 in progress
  const pl5 = await prisma.placement.create({
    data: { studentId: s5.id, companyName: 'HCL', jobRole: 'Software Engineer Trainee', placementDate: new Date('2024-09-01'), packageLpa: 6, placementStatus: PlacementStatus.IN_PROGRESS, location: 'Noida' },
  });
  await prisma.placementRound.create({ data: { placementId: pl5.id, roundNumber: 1, roundType: RoundType.APTITUDE, roundDate: new Date('2024-09-10'), result: RoundResult.PASS, remark: 'Cleared aptitude' } });

  // s12 on placement (applied only)
  await prisma.placement.create({
    data: { studentId: s12.id, companyName: 'Wipro', jobRole: 'Project Engineer', placementDate: new Date('2024-11-01'), packageLpa: 4.5, placementStatus: PlacementStatus.APPLIED, location: 'Pune' },
  });

  // Some in-progress / rejected for analytics
  const pl6 = await prisma.placement.create({
    data: { studentId: s6.id, companyName: 'Infosys', jobRole: 'System Engineer', placementDate: new Date('2024-08-15'), packageLpa: 4.2, placementStatus: PlacementStatus.REJECTED, location: 'Chennai' },
  });
  await prisma.placementRound.create({ data: { placementId: pl6.id, roundNumber: 1, roundType: RoundType.APTITUDE, roundDate: new Date('2024-08-20'), result: RoundResult.REJECTED, remark: 'Below cutoff' } });

  // ===== Alumni career history + feedback =====
  await prisma.careerHistory.create({
    data: { studentId: s13.id, companyName: 'TCS', jobTitle: 'Systems Engineer', startDate: new Date('2024-07-01'), endDate: new Date('2025-03-01'), role: 'Software Developer', location: 'Mumbai', currentJob: false },
  });
  await prisma.careerHistory.create({
    data: { studentId: s13.id, companyName: 'Infosys', jobTitle: 'Senior Systems Engineer', startDate: new Date('2025-03-15'), role: 'Full Stack Developer', location: 'Pune', currentJob: true },
  });
  await prisma.careerHistory.create({
    data: { studentId: s14.id, companyName: 'Qualcomm', jobTitle: 'Engineer', startDate: new Date('2024-08-01'), role: 'Embedded Engineer', location: 'Hyderabad', currentJob: true },
  });

  await prisma.alumniFeedback.create({
    data: { studentId: s13.id, rating: 4, comment: 'Great placement support', feedback: 'The placement cell helped me secure my first job. Very grateful.', feedbackDate: new Date('2025-04-01') },
  });
  await prisma.alumniFeedback.create({
    data: { studentId: s14.id, rating: 5, comment: 'Excellent program', feedback: 'Career Track made my transition smooth.', feedbackDate: new Date('2025-02-10') },
  });

  // ===== Preparation resources (placement preparation learning library) =====
  await prisma.preparationResource.createMany({
    data: preparationResources,
  });

  // ===== Notifications (dev demo data, only touches the notification table) =====
  const aaravUser = await prisma.user.findUnique({ where: { email: 'aarav@student.com' } });
  const adminUser = await prisma.user.findUnique({ where: { email: 'admin@careertrack.com' } });
  const placementUser = await prisma.user.findUnique({ where: { email: 'placement@careertrack.com' } });
  const rahulUser = await prisma.user.findUnique({ where: { email: 'rahul@student.com' } });

  const notifRows = [
    aaravUser && {
      recipientId: aaravUser.id,
      type: NotificationType.PLACEMENT_DRIVE,
      title: 'New placement drive',
      message: 'Google has opened a new placement opportunity for Software Engineer.',
      relatedId: aaravUser.studentId,
      relatedType: 'PlacementDrive',
    },
    aaravUser && {
      recipientId: aaravUser.id,
      type: NotificationType.OFFER_LETTER,
      title: 'Offer letter received from Google',
      message: 'Your offer letter for Software Engineer at Google has been uploaded.',
      relatedId: aaravUser.studentId,
      relatedType: 'OfferLetter',
    },
    rahulUser && {
      recipientId: rahulUser.id,
      type: NotificationType.GRADUATION,
      title: 'You are now an alumni',
      message: 'Your profile has been transitioned to alumni status. Welcome to the alumni network!',
      relatedId: rahulUser.studentId,
      relatedType: 'Student',
    },
    adminUser && {
      recipientId: adminUser.id,
      type: NotificationType.SYSTEM,
      title: 'Welcome to Career Track',
      message: 'Notifications keep you updated on placement, academic and graduation events across the platform.',
    },
    placementUser && {
      recipientId: placementUser.id,
      type: NotificationType.SYSTEM,
      title: 'Welcome to Career Track',
      message: 'You can view updates here as placement drives, rounds, feedback and offers are created.',
    },
  ].filter((r): r is NonNullable<typeof r> => Boolean(r));

  if (notifRows.length > 0) {
    await prisma.notification.createMany({ data: notifRows as any });
  }

  console.log('Seeding complete!');
  console.log('--- Login credentials (password for all below: KeepSecret@123) ---');
  console.log('Admin:          admin@careertrack.com');
  console.log('Placement Head: placement@careertrack.com');
  console.log('Student:        aarav@student.com (active)');
  console.log('Student:        diya@student.com (active)');
  console.log('Student:        aditya@student.com (active)');
  console.log('Alumni:         rahul@student.com');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
