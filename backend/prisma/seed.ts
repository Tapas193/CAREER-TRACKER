import { PrismaClient, Role, AccountStatus, StudentStatus, GraduationStatus, ResultStatus, PlacementStatus, RoundType, RoundResult, PreparationResourceType, PreparationDifficulty } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hash(p: string) {
  return bcrypt.hash(p, 10);
}

async function main() {
  console.log('Seeding database...');
  await prisma.$transaction([
    prisma.preparationResource.deleteMany(),
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
  const IP = 'Interview Preparation';
  await prisma.preparationResource.createMany({
    data: [
      // --- Tell me about yourself ---
      { title: 'How to Answer Interview Questions Like a HERO: Ex-Google Recruiter Explains', description: 'An ex-Google recruiter demonstrates a clear framework (including the "tell me about yourself" opening) for structured, confident interview answers.', category: IP, topic: 'Tell me about yourself', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=aTBkcgTee2Q', thumbnailUrl: 'https://i.ytimg.com/vi/aTBkcgTee2Q/hqdefault.jpg', duration: '14 min', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'How to Answer "Tell Me About Yourself" (With Examples)', description: 'Indeed guide explaining why employers ask, how to structure a two-minute story answer, and full example scripts.', category: IP, topic: 'Tell me about yourself', resourceType: PreparationResourceType.ARTICLE, url: 'https://www.indeed.com/career-advice/interviewing/interview-question-tell-me-about-yourself', duration: '6 min read', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'How to Answer "Tell Me About Yourself" in an Interview (Plus Examples)', description: 'Harvard career services article with a clear present-past-future framework and example answers.', category: IP, topic: 'Tell me about yourself', resourceType: PreparationResourceType.ARTICLE, url: 'https://careerservices.fas.harvard.edu/blog/2024/04/09/how-to-answer-tell-me-about-yourself-in-an-interview-plus-examples/', duration: '5 min read', difficulty: PreparationDifficulty.BEGINNER },

      // --- Strengths and weaknesses ---
      { title: 'How to Answer Strengths and Weaknesses in Interviews (Coursera)', description: 'Official Coursera video explaining why employers ask and offering sample strengths and weaknesses responses.', category: IP, topic: 'Strengths and weaknesses', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=2rRgOr93jVg', thumbnailUrl: 'https://i.ytimg.com/vi/2rRgOr93jVg/hqdefault.jpg', duration: '10 min', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'How to Answer "What Are Your Strengths and Weaknesses?"', description: 'Indeed guide with sample strengths/weaknesses answers, why employers ask, and a combined example.', category: IP, topic: 'Strengths and weaknesses', resourceType: PreparationResourceType.ARTICLE, url: 'https://www.indeed.com/career-advice/interviewing/interview-question-what-are-your-strengths-and-weaknesses', duration: '7 min read', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'Strengths and Weaknesses: 40+ Examples for Job Interviews (The Muse)', description: 'The Muse article with practical tips plus 40+ example strengths and weaknesses with sample answers.', category: IP, topic: 'Strengths and weaknesses', resourceType: PreparationResourceType.ARTICLE, url: 'https://www.themuse.com/advice/strengths-and-weaknesses-interview-question-answer-examples', duration: '8 min read', difficulty: PreparationDifficulty.BEGINNER },

      // --- Why should we hire you? ---
      { title: 'Google Job Interview Questions and Answers - How to Get Hired', description: 'Recruiter-led video teaching how to confidently answer "Why should we hire you?" with a short, evidence-based framework.', category: IP, topic: 'Why should we hire you?', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=eMG5ZIvcTf4', thumbnailUrl: 'https://i.ytimg.com/vi/eMG5ZIvcTf4/hqdefault.jpg', duration: '17 min', difficulty: PreparationDifficulty.INTERMEDIATE },
      { title: 'How to Answer "Why Should We Hire You?"', description: 'Indeed guide teaching how to craft a confident, quantified answer to "Why should we hire you?"', category: IP, topic: 'Why should we hire you?', resourceType: PreparationResourceType.ARTICLE, url: 'https://www.indeed.com/career-advice/interviewing/interview-question-why-should-we-hire-you', duration: '7 min read', difficulty: PreparationDifficulty.INTERMEDIATE },
      { title: '4 Better Ways to Answer "Why Should We Hire You?"', description: 'The Muse explains four distinct answering strategies with examples and what to avoid.', category: IP, topic: 'Why should we hire you?', resourceType: PreparationResourceType.ARTICLE, url: 'https://www.themuse.com/advice/3-better-ways-to-answer-why-should-we-hire-you', duration: '6 min read', difficulty: PreparationDifficulty.INTERMEDIATE },

      // --- Why do you want to join this company? ---
      { title: 'How to Answer "Why Do You Want to Work Here"', description: 'Recruiter teaches the 50/50 rule to answer why you want to work at a specific company, with a full sample answer.', category: IP, topic: 'Why do you want to join this company?', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=cnKiOfDZMsU', thumbnailUrl: 'https://i.ytimg.com/vi/cnKiOfDZMsU/hqdefault.jpg', duration: '5 min', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'How to Answer "Why Do You Want to Join Our Company?"', description: 'Naukri guide with a company + role + skills-match formula, sample answers, and mistakes to avoid.', category: IP, topic: 'Why do you want to join this company?', resourceType: PreparationResourceType.ARTICLE, url: 'https://www.naukri.com/blog/why-do-you-want-to-join-our-company/', duration: '6 min read', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'Interview Question: "What Attracted You to This Company?"', description: 'Indeed guide on preparing for "why this company" questions, including research steps and example answers.', category: IP, topic: 'Why do you want to join this company?', resourceType: PreparationResourceType.ARTICLE, url: 'https://uk.indeed.com/career-advice/interviewing/what-attracted-you-to-this-company', duration: '6 min read', difficulty: PreparationDifficulty.BEGINNER },

      // --- Common HR questions ---
      { title: 'JOB INTERVIEW Q&A: 30 ANSWERS to COMMON Questions You MUST Know', description: 'Hiring manager Richard McMunn answers 30 of the most common interview questions with model answers.', category: IP, topic: 'Common HR questions', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=mHu7-KjeUmQ', thumbnailUrl: 'https://i.ytimg.com/vi/mHu7-KjeUmQ/hqdefault.jpg', duration: '25 min', difficulty: PreparationDifficulty.BEGINNER },
      { title: '45 Example HR Interview Questions (With Sample Answers)', description: 'Indeed list of general, experience-based, and in-depth HR interview questions with sample answers.', category: IP, topic: 'Common HR questions', resourceType: PreparationResourceType.ARTICLE, url: 'https://www.indeed.com/career-advice/interviewing/hr-interview-questions', duration: '9 min read', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'HR Interview Questions and Answers', description: 'GeeksforGeeks guide covering general, work-ethic, company-specific, and behavioral HR interview questions for freshers.', category: IP, topic: 'Common HR questions', resourceType: PreparationResourceType.ARTICLE, url: 'https://www.geeksforgeeks.org/hr/hr-interview-questions/', duration: '10 min read', difficulty: PreparationDifficulty.INTERMEDIATE },

      // --- Technical interview questions ---
      { title: 'Top 25 Coding Interview Questions and Answers', description: 'Video walking through 25 commonly asked coding interview questions covering data structures, algorithms, and OOP.', category: IP, topic: 'Technical interview questions', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=1FzOQdxc2QU', thumbnailUrl: 'https://i.ytimg.com/vi/1FzOQdxc2QU/hqdefault.jpg', duration: '12 min', difficulty: PreparationDifficulty.INTERMEDIATE },
      { title: 'Software Engineer Interview Questions & Prep Guide', description: 'Coursera guide covering technical, system-design, and behavioral questions with model answers and a mock-interview practice path.', category: IP, topic: 'Technical interview questions', resourceType: PreparationResourceType.ARTICLE, url: 'https://www.coursera.org/resources/software-engineering-interview-prep-guide', duration: '12 min read', difficulty: PreparationDifficulty.INTERMEDIATE },
      { title: 'LeetCode - Online Programming Practice Platform', description: 'Industry-standard platform to practice coding interview problems across data structures, algorithms, and system design.', category: IP, topic: 'Technical interview questions', resourceType: PreparationResourceType.PRACTICE, url: 'https://leetcode.com/', duration: '', difficulty: PreparationDifficulty.INTERMEDIATE },
      { title: 'HackerRank Algorithms Practice', description: 'Free algorithm practice with problems categorized by topic and difficulty for interview coding preparation.', category: IP, topic: 'Technical interview questions', resourceType: PreparationResourceType.PRACTICE, url: 'https://www.hackerrank.com/domains/algorithms', duration: '', difficulty: PreparationDifficulty.INTERMEDIATE },

      // --- Resume-based questions ---
      { title: 'Recruiter Explains the PERFECT Answer to "Walk Me Through Your Resume"', description: 'Executive recruiter breaks down a 4-point framework for structuring resume walkthrough answers.', category: IP, topic: 'Resume-based questions', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=4IsdBlDj8v8', thumbnailUrl: 'https://i.ytimg.com/vi/4IsdBlDj8v8/hqdefault.jpg', duration: '12 min', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'How to Answer "Walk Me Through Your Resume"', description: 'Harvard Business Review article on delivering a focused narrative under two minutes that highlights your fit.', category: IP, topic: 'Resume-based questions', resourceType: PreparationResourceType.ARTICLE, url: 'https://hbr.org/2025/02/how-to-answer-walk-me-through-your-resume', duration: '5 min read', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'Learn to Answer the "Walk Me Through Your Resume" Question', description: 'Zety video explaining a step-by-step method (experience summary, accomplishment, skills, company fit) with a sample answer.', category: IP, topic: 'Resume-based questions', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=WZej3-_QsIM', thumbnailUrl: 'https://i.ytimg.com/vi/WZej3-_QsIM/hqdefault.jpg', duration: '4 min', difficulty: PreparationDifficulty.BEGINNER },

      // --- Behavioral questions ---
      { title: 'Behavioral Interview Questions (Duke University)', description: 'Duke Fuqua career center explains what behavioral questions are, why companies ask them, and how to prepare.', category: IP, topic: 'Behavioral questions', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=BDBZECO21R8', thumbnailUrl: 'https://i.ytimg.com/vi/BDBZECO21R8/hqdefault.jpg', duration: '8 min', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'How To Use the STAR Interview Response Technique', description: 'Indeed guide on the STAR framework with common behavioral prompts and worked example responses.', category: IP, topic: 'Behavioral questions', resourceType: PreparationResourceType.ARTICLE, url: 'https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique', duration: '8 min read', difficulty: PreparationDifficulty.INTERMEDIATE },
      { title: 'Using the STAR Method for Your Next Behavioral Interview (MIT)', description: 'MIT Career Advising resource explaining behavioral interviews and the STAR formula with a sample response and worksheet.', category: IP, topic: 'Behavioral questions', resourceType: PreparationResourceType.DOCUMENT, url: 'https://capd.mit.edu/resources/the-star-method-for-behavioral-interviews/', duration: '10 min', difficulty: PreparationDifficulty.INTERMEDIATE },

      // --- STAR method ---
      { title: 'STAR METHOD for Behavioural Interview Questions - PASS YOUR INTERVIEW', description: 'Hiring manager Richard McMunn explains the Situation-Task-Action-Result method with four top-scoring example answers.', category: IP, topic: 'STAR method', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=xulpDyBxDgk', thumbnailUrl: 'https://i.ytimg.com/vi/xulpDyBxDgk/hqdefault.jpg', duration: '15 min', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'Behavioral Interview: Interview with a FAANG Engineer', description: 'A real mock behavioral interview where a FAANG engineer coaches a candidate through STAR-based answers.', category: IP, topic: 'STAR method', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=AK0JgiFJmSY', thumbnailUrl: 'https://i.ytimg.com/vi/AK0JgiFJmSY/hqdefault.jpg', duration: '14 min', difficulty: PreparationDifficulty.ADVANCED },
      { title: 'STAR Interview Method: How to Answer Behavioral Interview Questions', description: 'The Muse guide to the STAR method with examples for multiple interview scenarios.', category: IP, topic: 'STAR method', resourceType: PreparationResourceType.ARTICLE, url: 'https://www.themuse.com/advice/star-interview-method', duration: '6 min read', difficulty: PreparationDifficulty.BEGINNER },

      // --- Interview etiquette ---
      { title: '17 Job Interview DOs and DON\'Ts', description: 'Career video covering etiquette rules including dressing professionally, asking smart questions, and following up.', category: IP, topic: 'Interview etiquette', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=hqtTEpUcMIY', thumbnailUrl: 'https://i.ytimg.com/vi/hqtTEpUcMIY/hqdefault.jpg', duration: '15 min', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'Stand Out in a Job Interview | Harvard Business Review Guide', description: 'HBR visual guide covering preparation, storytelling, practice, conversation skills, and virtual interviews.', category: IP, topic: 'Interview etiquette', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=ZU9x1vFx5lI', thumbnailUrl: 'https://i.ytimg.com/vi/ZU9x1vFx5lI/hqdefault.jpg', duration: '6 min', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'Everything You Need To Know About Job Interview Etiquette', description: 'Indeed etiquette guide covering preparation, treating everyone with respect, body language, and thank-you notes.', category: IP, topic: 'Interview etiquette', resourceType: PreparationResourceType.ARTICLE, url: 'https://www.indeed.com/career-advice/interviewing/job-interview-etiquette', duration: '6 min read', difficulty: PreparationDifficulty.BEGINNER },

      // --- Body language ---
      { title: 'Body Language Experts Break Down Job Interview Etiquette | WIRED', description: 'Body language experts analyze handshake, posture, eye contact, virtual interview body language, and exit behavior.', category: IP, topic: 'Body language', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=M2NFhwHyNhc', thumbnailUrl: 'https://i.ytimg.com/vi/M2NFhwHyNhc/hqdefault.jpg', duration: '10 min', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'Top Interview Tips: Common Questions, Nonverbal Communication & More | Indeed', description: 'Indeed video covering common questions and nonverbal communication body-language techniques for interviews.', category: IP, topic: 'Body language', resourceType: PreparationResourceType.YOUTUBE, url: 'https://www.youtube.com/watch?v=HG68Ymazo18', thumbnailUrl: 'https://i.ytimg.com/vi/HG68Ymazo18/mqdefault.jpg', duration: '4 min', difficulty: PreparationDifficulty.BEGINNER },
      { title: 'Importance of Body Language During Interviews (With Tips)', description: 'Indeed India guide covering posture, limb positioning, eye contact, and confident body language techniques.', category: IP, topic: 'Body language', resourceType: PreparationResourceType.ARTICLE, url: 'https://in.indeed.com/career-advice/interviewing/body-language-during-interview', duration: '5 min read', difficulty: PreparationDifficulty.BEGINNER },
    ],
  });

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
