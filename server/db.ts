import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';

const db = new Database('microlearn.db');

export function initDb() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('student', 'teacher', 'admin')),
      points INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Courses table
  db.exec(`
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT,
      thumbnail TEXT,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(created_by) REFERENCES users(id)
    )
  `);

  // Lessons table (Micro-content: Video + Summary)
  db.exec(`
    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      video_url TEXT,
      summary TEXT,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY(course_id) REFERENCES courses(id)
    )
  `);

  // Quizzes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS quizzes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lesson_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL, -- JSON string of options
      correct_option INTEGER NOT NULL, -- Index of correct option
      FOREIGN KEY(lesson_id) REFERENCES lessons(id)
    )
  `);

  // Progress table
  db.exec(`
    CREATE TABLE IF NOT EXISTS progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      completed BOOLEAN DEFAULT 0,
      video_watched BOOLEAN DEFAULT 0,
      quiz_completed BOOLEAN DEFAULT 0,
      quiz_score INTEGER DEFAULT 0,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(lesson_id) REFERENCES lessons(id),
      UNIQUE(user_id, lesson_id)
    )
  `);

  // Migration for existing tables (if created before this change)
  try {
    db.exec('ALTER TABLE progress ADD COLUMN video_watched BOOLEAN DEFAULT 0');
  } catch (e) {}
  try {
    db.exec('ALTER TABLE progress ADD COLUMN quiz_completed BOOLEAN DEFAULT 0');
  } catch (e) {}

  // Badges table
  db.exec(`
    CREATE TABLE IF NOT EXISTS badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      icon TEXT,
      points_required INTEGER DEFAULT 0
    )
  `);

  // User Badges table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_badges (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_id INTEGER NOT NULL,
      awarded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id),
      FOREIGN KEY(badge_id) REFERENCES badges(id),
      UNIQUE(user_id, badge_id)
    )
  `);

  // Seed initial data if empty
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    console.log('Seeding database...');
    const hash = bcrypt.hashSync('password123', 10);
    
    // Admin
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('admin', hash, 'admin');
    // Teacher
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('teacher', hash, 'teacher');
    // Student
    db.prepare('INSERT INTO users (username, password, role) VALUES (?, ?, ?)').run('student', hash, 'student');

    // Badges
    const insertBadge = db.prepare('INSERT INTO badges (name, description, icon, points_required) VALUES (?, ?, ?, ?)');
    insertBadge.run('Newbie', 'Completed your first lesson', '🌱', 10);
    insertBadge.run('Scholar', 'Completed 5 lessons', '🎓', 50);
    insertBadge.run('Master', 'Completed a full course', '🏆', 100);

    // Sample Course
    const insertCourse = db.prepare('INSERT INTO courses (title, description, category, thumbnail, created_by) VALUES (?, ?, ?, ?, ?)');
    const courseId = insertCourse.run('Intro to Web Dev', 'Learn the basics of HTML, CSS, and JS in bite-sized videos.', 'Development', 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80', 2).lastInsertRowid;

    // Sample Lessons
    const insertLesson = db.prepare('INSERT INTO lessons (course_id, title, video_url, summary, order_index) VALUES (?, ?, ?, ?, ?)');
    const lesson1 = insertLesson.run(courseId, 'HTML Basics', 'https://youtu.be/yU20m38Kwgw?si=YBiYjEsIwxN2OxNb', 'HTML is the standard markup language for Web pages.', 1).lastInsertRowid;
    const lesson2 = insertLesson.run(courseId, 'CSS Styling', 'https://www.youtube.com/watch?v=1PnVor36_40', 'CSS is the language we use to style an HTML document.', 2).lastInsertRowid;

    // Sample Quizzes
    const insertQuiz = db.prepare('INSERT INTO quizzes (lesson_id, question, options, correct_option) VALUES (?, ?, ?, ?)');
    insertQuiz.run(lesson1, 'What does HTML stand for?', JSON.stringify(['Hyper Text Markup Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language']), 0);
    insertQuiz.run(lesson2, 'What does CSS stand for?', JSON.stringify(['Creative Style Sheets', 'Cascading Style Sheets', 'Computer Style Sheets']), 1);
    
    console.log('Database seeded!');
  }

  // Check for additional content (if only 1 course exists)
  const courseCount = db.prepare('SELECT count(*) as count FROM courses').get() as { count: number };
  if (courseCount.count < 2) {
    console.log('Seeding additional content...');
    
    const insertCourse = db.prepare('INSERT INTO courses (title, description, category, thumbnail, created_by) VALUES (?, ?, ?, ?, ?)');
    const insertLesson = db.prepare('INSERT INTO lessons (course_id, title, video_url, summary, order_index) VALUES (?, ?, ?, ?, ?)');
    const insertQuiz = db.prepare('INSERT INTO quizzes (lesson_id, question, options, correct_option) VALUES (?, ?, ?, ?)');

    // Course 2: Python for Beginners
    const pythonCourseId = insertCourse.run(
      'Python for Beginners', 
      'Master Python programming from scratch. Learn variables, loops, and functions.', 
      'Programming', 
      'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80', 
      2
    ).lastInsertRowid;

    const pyLesson1 = insertLesson.run(pythonCourseId, 'Variables & Data Types', 'https://www.youtube.com/watch?v=khKv-8q7YmY', 'Learn how to store data using variables and different data types in Python.', 1).lastInsertRowid;
    insertQuiz.run(pyLesson1, 'Which is a valid variable name in Python?', JSON.stringify(['2myvar', 'my-var', 'my_var']), 2);

    const pyLesson2 = insertLesson.run(pythonCourseId, 'Control Flow', 'https://www.youtube.com/watch?v=PqFKRqpHrjw', 'Understand if/else statements and loops to control program flow.', 2).lastInsertRowid;
    insertQuiz.run(pyLesson2, 'Which keyword is used for loops?', JSON.stringify(['loop', 'for', 'repeat']), 1);

    // Course 3: Digital Marketing 101
    const marketingCourseId = insertCourse.run(
      'Digital Marketing 101', 
      'Learn the fundamentals of SEO, Social Media, and Content Marketing.', 
      'Marketing', 
      'https://images.unsplash.com/photo-1533750349088-cd871a92f312?auto=format&fit=crop&w=800&q=80', 
      2
    ).lastInsertRowid;

    const mktLesson1 = insertLesson.run(marketingCourseId, 'SEO Basics', 'https://www.youtube.com/watch?v=DvwS7cV9GmQ', 'Search Engine Optimization helps your website rank higher in search results.', 1).lastInsertRowid;
    insertQuiz.run(mktLesson1, 'What does SEO stand for?', JSON.stringify(['Search Engine Optimization', 'Social Engine Operation', 'Site External Optimization']), 0);

    // Course 4: React Fundamentals
    const reactCourseId = insertCourse.run(
      'React Fundamentals', 
      'Build modern user interfaces with React. Components, Props, and State.', 
      'Development', 
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80', 
      2
    ).lastInsertRowid;

    const reactLesson1 = insertLesson.run(reactCourseId, 'Components & Props', 'https://www.youtube.com/watch?v=kVeOpcw4GWY', 'React apps are built using reusable components that accept inputs called props.', 1).lastInsertRowid;
    insertQuiz.run(reactLesson1, 'What is used to pass data to a component?', JSON.stringify(['State', 'Props', 'Context']), 1);

    console.log('Additional content seeded!');
  }

  // Migration: Update existing placeholder videos to real ones if they exist
  try {
    const updateVideo = db.prepare('UPDATE lessons SET video_url = ? WHERE title = ?');
    updateVideo.run('https://youtu.be/yU20m38Kwgw?si=YBiYjEsIwxN2OxNb', 'HTML Basics');
    updateVideo.run('https://www.youtube.com/watch?v=OEV8gMkCHXQ', 'CSS Styling');
    updateVideo.run('https://www.youtube.com/watch?v=kqtD5dpn9C8', 'Variables & Data Types');
    updateVideo.run('https://www.youtube.com/watch?v=kqtD5dpn9C8', 'Control Flow');
    updateVideo.run('https://www.youtube.com/watch?v=xsVTqzratPs', 'SEO Basics');
    updateVideo.run('https://www.youtube.com/watch?v=SqcY0GlETPk', 'Components & Props');
  } catch (e) {
    console.error('Failed to update video URLs', e);
  }
}

export default db;
