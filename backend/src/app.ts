import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { config } from './config';
import { notFound, errorHandler } from './middleware/error';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import studentRoutes from './routes/studentRoutes';
import courseRoutes from './routes/courseRoutes';
import academicRecordRoutes from './routes/academicRecordRoutes';
import backlogRoutes from './routes/backlogRoutes';
import skillRoutes from './routes/skillRoutes';
import studentSkillRoutes from './routes/studentSkillRoutes';
import certificationRoutes from './routes/certificationRoutes';
import projectRoutes from './routes/projectRoutes';
import internshipRoutes from './routes/internshipRoutes';
import placementRoutes from './routes/placementRoutes';
import placementRoundRoutes from './routes/placementRoundRoutes';
import roundFeedbackRoutes from './routes/roundFeedbackRoutes';
import offerLetterRoutes from './routes/offerLetterRoutes';
import careerHistoryRoutes from './routes/careerHistoryRoutes';
import alumniFeedbackRoutes from './routes/alumniFeedbackRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import uploadRoutes from './routes/uploadRoutes';
import preparationRoutes from './routes/preparationRoutes';
import notificationRoutes from './routes/notificationRoutes';

dotenv.config();

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.frontendUrl, credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Serve uploaded files statically
  app.use('/uploads', express.static(config.storageLocalDir));

  app.get('/api/health', (_req, res) => {
    res.json({ success: true, message: 'Career Track API is running' });
  });

  app.get('/', (_req, res) => {
    res.json({ success: true, message: 'Career Track API is running' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/students', studentRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/academic-records', academicRecordRoutes);
  app.use('/api/backlogs', backlogRoutes);
  app.use('/api/skills', skillRoutes);
  app.use('/api/student-skills', studentSkillRoutes);
  app.use('/api/certifications', certificationRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/internships', internshipRoutes);
  app.use('/api/placements', placementRoutes);
  app.use('/api/placement-rounds', placementRoundRoutes);
  app.use('/api/round-feedback', roundFeedbackRoutes);
  app.use('/api/offer-letters', offerLetterRoutes);
  app.use('/api/career-history', careerHistoryRoutes);
  app.use('/api/alumni-feedback', alumniFeedbackRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/upload', uploadRoutes);
  app.use('/api/student/preparation', preparationRoutes);
  app.use('/api/notifications', notificationRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

// Default export of the express app instance so Vercel's auto-detected Express
// entrypoint (src/app.ts) has a valid request handler. Vercel calls this when a
// request is routed to the app's default function (e.g. GET /). createApp is
// intentionally kept for src/index.ts and api/index.ts.
export default createApp();
