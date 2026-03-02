import express from 'express';
import db from '../db';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

// Middleware to verify token
const authenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

router.use(authenticate);

// Courses
router.get('/courses', (req, res) => {
  const stmt = db.prepare('SELECT * FROM courses');
  const courses = stmt.all();
  res.json(courses);
});

router.get('/courses/:id', (req: any, res) => {
  const courseStmt = db.prepare('SELECT * FROM courses WHERE id = ?');
  const course = courseStmt.get(req.params.id);
  
  if (!course) return res.status(404).json({ error: 'Course not found' });

  const lessonsStmt = db.prepare(`
    SELECT l.*, 
           p.completed, 
           p.video_watched, 
           p.quiz_completed, 
           p.quiz_score 
    FROM lessons l 
    LEFT JOIN progress p ON l.id = p.lesson_id AND p.user_id = ? 
    WHERE l.course_id = ? 
    ORDER BY l.order_index
  `);
  const lessons = lessonsStmt.all(req.user.id, req.params.id);

  res.json({ ...course, lessons });
});

// Lessons
router.get('/lessons/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM lessons WHERE id = ?');
  const lesson = stmt.get(req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  res.json(lesson);
});

router.put('/lessons/:id', (req, res) => {
  const { title, video_url, summary } = req.body;
  const stmt = db.prepare('UPDATE lessons SET title = ?, video_url = ?, summary = ? WHERE id = ?');
  const info = stmt.run(title, video_url, summary, req.params.id);
  
  if (info.changes === 0) return res.status(404).json({ error: 'Lesson not found' });
  
  res.json({ success: true });
});

// Quizzes
router.get('/quizzes/:lessonId', (req, res) => {
  const stmt = db.prepare('SELECT * FROM quizzes WHERE lesson_id = ?');
  const quizzes = stmt.all(req.params.lessonId);
  // Parse options JSON
  const parsedQuizzes = quizzes.map((q: any) => ({
    ...q,
    options: JSON.parse(q.options)
  }));
  res.json(parsedQuizzes);
});

// Progress & Gamification
router.post('/progress', (req: any, res) => {
  const { lessonId, videoWatched, quizCompleted, score } = req.body;
  const userId = req.user.id;

  // Check if already exists
  const checkStmt = db.prepare('SELECT * FROM progress WHERE user_id = ? AND lesson_id = ?');
  const existing = checkStmt.get(userId, lessonId) as any;

  let pointsToAward = 0;
  let newVideoWatched = existing ? existing.video_watched : 0;
  let newQuizCompleted = existing ? existing.quiz_completed : 0;
  let newScore = existing ? existing.quiz_score : 0;

  // Logic for Video
  if (videoWatched && !newVideoWatched) {
    newVideoWatched = 1;
    pointsToAward += 5; // 5 points for watching video
  }

  // Logic for Quiz
  if (quizCompleted && !newQuizCompleted) {
    newQuizCompleted = 1;
    newScore = score;
    pointsToAward += 5; // 5 points for completing quiz
    if (score > 80) pointsToAward += 5; // Bonus for high score
  } else if (quizCompleted && newQuizCompleted) {
    // Just update score if retaken (optional: no new points)
    newScore = Math.max(newScore, score);
  }

  const isFullyCompleted = newVideoWatched && newQuizCompleted;

  if (existing) {
    const updateStmt = db.prepare(`
      UPDATE progress 
      SET completed = ?, video_watched = ?, quiz_completed = ?, quiz_score = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE user_id = ? AND lesson_id = ?
    `);
    updateStmt.run(isFullyCompleted ? 1 : 0, newVideoWatched, newQuizCompleted, newScore, userId, lessonId);
  } else {
    const insertStmt = db.prepare(`
      INSERT INTO progress (user_id, lesson_id, completed, video_watched, quiz_completed, quiz_score) 
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    insertStmt.run(userId, lessonId, isFullyCompleted ? 1 : 0, newVideoWatched, newQuizCompleted, newScore);
  }

  if (pointsToAward > 0) {
    const userStmt = db.prepare('UPDATE users SET points = points + ? WHERE id = ?');
    userStmt.run(pointsToAward, userId);
  }

  const newBadges: any[] = [];

  // Check Badges
  // 1. First Lesson Badge (Fully completed)
  if (isFullyCompleted) {
    const progressCountStmt = db.prepare('SELECT count(*) as count FROM progress WHERE user_id = ? AND completed = 1');
    const progressCount = (progressCountStmt.get(userId) as any).count;

    // Newbie Badge (1 lesson)
    if (progressCount === 1) {
      const badgeStmt = db.prepare('SELECT * FROM badges WHERE name = "Newbie"');
      const badge = badgeStmt.get() as any;
      if (badge) {
        try {
          db.prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(userId, badge.id);
          newBadges.push(badge);
        } catch (e) { /* Already has badge */ }
      }
    }

    // Scholar Badge (5 lessons)
    if (progressCount === 5) {
      const badgeStmt = db.prepare('SELECT * FROM badges WHERE name = "Scholar"');
      const badge = badgeStmt.get() as any;
      if (badge) {
        try {
          db.prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(userId, badge.id);
          newBadges.push(badge);
        } catch (e) { /* Already has badge */ }
      }
    }

    // Master Badge (Full Course Completed)
    // Get course_id for the current lesson
    const lessonStmt = db.prepare('SELECT course_id FROM lessons WHERE id = ?');
    const lesson = lessonStmt.get(lessonId) as any;
    
    if (lesson) {
      const courseId = lesson.course_id;
      // Check total lessons in course
      const totalLessonsStmt = db.prepare('SELECT count(*) as count FROM lessons WHERE course_id = ?');
      const totalLessons = (totalLessonsStmt.get(courseId) as any).count;

      // Check completed lessons in course for user
      const completedLessonsStmt = db.prepare(`
        SELECT count(*) as count 
        FROM progress p
        JOIN lessons l ON p.lesson_id = l.id
        WHERE p.user_id = ? AND l.course_id = ? AND p.completed = 1
      `);
      const completedLessons = (completedLessonsStmt.get(userId, courseId) as any).count;

      if (completedLessons === totalLessons) {
        const badgeStmt = db.prepare('SELECT * FROM badges WHERE name = "Master"');
        const badge = badgeStmt.get() as any;
        if (badge) {
          try {
            db.prepare('INSERT INTO user_badges (user_id, badge_id) VALUES (?, ?)').run(userId, badge.id);
            newBadges.push(badge);
          } catch (e) { /* Already has badge */ }
        }
      }
    }
  }

  res.json({ success: true, pointsAwarded: pointsToAward, newBadges });
});

router.get('/leaderboard', (req, res) => {
  const stmt = db.prepare('SELECT username, points FROM users ORDER BY points DESC LIMIT 10');
  const leaderboard = stmt.all();
  res.json(leaderboard);
});

router.get('/my-badges', (req: any, res) => {
  const stmt = db.prepare(`
    SELECT b.*, ub.awarded_at 
    FROM badges b 
    JOIN user_badges ub ON b.id = ub.badge_id 
    WHERE ub.user_id = ?
  `);
  const badges = stmt.all(req.user.id);
  res.json(badges);
});

export default router;
