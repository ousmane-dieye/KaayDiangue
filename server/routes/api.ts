import express from 'express';
import db from '../db.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'secret_key_change_me';

// Courses (Public)
router.get('/courses', (req, res) => {
  const stmt = db.prepare(`
    SELECT c.*, 
           (SELECT AVG(rating) FROM ratings WHERE course_id = c.id) as avg_rating,
           (SELECT COUNT(*) FROM ratings WHERE course_id = c.id) as rating_count,
           u.username as author_name
    FROM courses c
    LEFT JOIN users u ON c.created_by = u.id
  `);
  const courses = stmt.all();
  res.json(courses);
});

router.get('/courses/random', (req, res) => {
  const limit = parseInt(req.query.limit as string) || 5;
  const stmt = db.prepare(`
    SELECT c.*, 
           (SELECT AVG(rating) FROM ratings WHERE course_id = c.id) as avg_rating,
           (SELECT COUNT(*) FROM ratings WHERE course_id = c.id) as rating_count,
           u.username as author_name
    FROM courses c
    LEFT JOIN users u ON c.created_by = u.id
    ORDER BY RANDOM()
    LIMIT ?
  `);
  const courses = stmt.all(limit);
  res.json(courses);
});

// Optional authentication middleware
const optionalAuthenticate = (req: any, res: any, next: any) => {
  const token = req.cookies.token;
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
};

router.get('/courses/:id', optionalAuthenticate, (req: any, res) => {
  // Increment views
  db.prepare('UPDATE courses SET views = views + 1 WHERE id = ?').run(req.params.id);

  const courseStmt = db.prepare(`
    SELECT c.*, 
           (SELECT AVG(rating) FROM ratings WHERE course_id = c.id) as avg_rating,
           (SELECT COUNT(*) FROM ratings WHERE course_id = c.id) as rating_count,
           u.username as author_name
    FROM courses c
    LEFT JOIN users u ON c.created_by = u.id
    WHERE c.id = ?
  `);
  const course = courseStmt.get(req.params.id) as any;
  
  if (!course) return res.status(404).json({ error: 'Course not found' });

  // Check if current user has rated
  let userRating = null;
  if (req.user) {
    const userRatingStmt = db.prepare('SELECT rating FROM ratings WHERE course_id = ? AND user_id = ?');
    const ratingResult = userRatingStmt.get(req.params.id, req.user.id) as any;
    userRating = ratingResult ? ratingResult.rating : null;
  }
  course.user_rating = userRating;

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
  const lessons = lessonsStmt.all(req.user ? req.user.id : -1, req.params.id);

  res.json({ ...course, lessons });
});

// Middleware to verify token for protected routes
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

// Protected routes below

router.post('/courses', (req: any, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { title, description, category, thumbnail } = req.body;
  const stmt = db.prepare('INSERT INTO courses (title, description, category, thumbnail, created_by) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(title, description, category, thumbnail, req.user.id);
  res.json({ id: Number(info.lastInsertRowid), title, description, category, thumbnail, created_by: req.user.id });
});

router.post('/courses/:id/rate', (req: any, res) => {
  const { rating } = req.body;
  if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'Invalid rating' });

  const stmt = db.prepare(`
    INSERT INTO ratings (course_id, user_id, rating) 
    VALUES (?, ?, ?) 
    ON CONFLICT(course_id, user_id) DO UPDATE SET rating = excluded.rating
  `);
  stmt.run(req.params.id, req.user.id, rating);
  res.json({ success: true });
});

router.post('/admin/courses/:id/certify', (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { is_certified } = req.body;
  const stmt = db.prepare('UPDATE courses SET is_certified = ? WHERE id = ?');
  stmt.run(is_certified ? 1 : 0, req.params.id);
  res.json({ success: true });
});

router.put('/courses/:id', (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  
  if (req.user.role === 'teacher') {
    const course = db.prepare('SELECT created_by FROM courses WHERE id = ?').get(req.params.id) as any;
    if (!course || course.created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  }

  const { title, description, category, thumbnail } = req.body;
  const stmt = db.prepare('UPDATE courses SET title = ?, description = ?, category = ?, thumbnail = ? WHERE id = ?');
  const info = stmt.run(title, description, category, thumbnail, req.params.id);
  
  if (info.changes === 0) return res.status(404).json({ error: 'Course not found' });
  
  res.json({ success: true });
});

// Lessons
router.get('/lessons/:id', (req, res) => {
  const stmt = db.prepare('SELECT * FROM lessons WHERE id = ?');
  const lesson = stmt.get(req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
  res.json(lesson);
});

router.post('/lessons', (req: any, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { course_id, title, video_url, summary } = req.body;
  
  // Get max order_index
  const orderStmt = db.prepare('SELECT MAX(order_index) as max_order FROM lessons WHERE course_id = ?');
  const result = orderStmt.get(course_id) as any;
  const nextOrder = (result.max_order || 0) + 1;

  const stmt = db.prepare('INSERT INTO lessons (course_id, title, video_url, summary, order_index) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(course_id, title, video_url, summary, nextOrder);
  res.json({ id: Number(info.lastInsertRowid), course_id, title, video_url, summary, order_index: nextOrder });
});

router.put('/lessons/:id', (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  
  if (req.user.role === 'teacher') {
    const lesson = db.prepare('SELECT c.created_by FROM lessons l JOIN courses c ON l.course_id = c.id WHERE l.id = ?').get(req.params.id) as any;
    if (!lesson || lesson.created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  }

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

router.post('/quizzes', (req: any, res) => {
  if (req.user.role !== 'teacher' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { lesson_id, question, options, correct_option, type } = req.body;
  
  if (req.user.role === 'teacher') {
    const lesson = db.prepare('SELECT c.created_by FROM lessons l JOIN courses c ON l.course_id = c.id WHERE l.id = ?').get(lesson_id) as any;
    if (!lesson || lesson.created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  }

  const stmt = db.prepare('INSERT INTO quizzes (lesson_id, question, options, correct_option, type) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(lesson_id, question, JSON.stringify(options), correct_option, type || 'multiple_choice');
  res.json({ id: Number(info.lastInsertRowid), lesson_id, question, options, correct_option, type: type || 'multiple_choice' });
});

router.delete('/admin/quizzes/:id', (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  
  if (req.user.role === 'teacher') {
    const quiz = db.prepare('SELECT c.created_by FROM quizzes q JOIN lessons l ON q.lesson_id = l.id JOIN courses c ON l.course_id = c.id WHERE q.id = ?').get(req.params.id) as any;
    if (!quiz || quiz.created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  }

  const stmt = db.prepare('DELETE FROM quizzes WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
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
  try {
    const stmt = db.prepare('SELECT username, points FROM users WHERE LOWER(role) = LOWER(?) ORDER BY points DESC LIMIT 10');
    const leaderboard = stmt.all('student');
    res.json(leaderboard);
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/teacher-leaderboard', (req, res) => {
  const stmt = db.prepare(`
    SELECT u.username, 
           SUM(c.views) as total_views,
           AVG(r.rating) as avg_rating,
           COUNT(DISTINCT c.id) as course_count
    FROM users u
    JOIN courses c ON u.id = c.created_by
    LEFT JOIN ratings r ON c.id = r.course_id
    WHERE u.role = 'teacher' OR u.role = 'admin'
    GROUP BY u.id
    ORDER BY total_views DESC, avg_rating DESC
    LIMIT 10
  `);
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

// Admin endpoints
router.get('/admin/users', (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const stmt = db.prepare('SELECT id, username, role, points FROM users ORDER BY created_at DESC');
  const users = stmt.all();
  res.json(users);
});

router.delete('/admin/users/:id', (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const stmt = db.prepare('DELETE FROM users WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

router.patch('/admin/users/:id/role', (req: any, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
  const { role } = req.body;
  if (!['student', 'teacher', 'admin'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
  stmt.run(role, req.params.id);
  res.json({ success: true });
});

router.delete('/admin/courses/:id', (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  
  if (req.user.role === 'teacher') {
    const course = db.prepare('SELECT created_by FROM courses WHERE id = ?').get(req.params.id) as any;
    if (!course || course.created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  }

  const stmt = db.prepare('DELETE FROM courses WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

router.delete('/admin/lessons/:id', (req: any, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'teacher') return res.status(403).json({ error: 'Forbidden' });
  
  if (req.user.role === 'teacher') {
    const lesson = db.prepare('SELECT c.created_by FROM lessons l JOIN courses c ON l.course_id = c.id WHERE l.id = ?').get(req.params.id) as any;
    if (!lesson || lesson.created_by !== req.user.id) return res.status(403).json({ error: 'Forbidden' });
  }

  const stmt = db.prepare('DELETE FROM lessons WHERE id = ?');
  stmt.run(req.params.id);
  res.json({ success: true });
});

export default router;
