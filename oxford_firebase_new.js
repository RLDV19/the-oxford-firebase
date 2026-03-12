import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Save, UserCircle, Settings, Award, ShieldCheck, GraduationCap, FileText, Star, Users, LogOut, ArrowLeft, UserPlus, Clock, CheckCircle, Edit3, Send, Image as ImageIcon, X, Move, Search, Folder, ChevronDown, ChevronRight, Calendar, Link as LinkIcon, Phone, Mail, Tag, Lock, MessageSquare, ChevronLeft, Sparkles, UserX, Activity, TrendingUp, Archive, Cloud, ClipboardList, CreditCard } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, writeBatch, query } from 'firebase/firestore';

// --- INITIALIZE FIREBASE ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestoreDb = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

const getPublicCollection = (collectionName) => collection(firestoreDb, 'artifacts', appId, 'public', 'data', collectionName);
const getPublicDoc = (collectionName, documentId) => doc(firestoreDb, 'artifacts', appId, 'public', 'data', collectionName, documentId);

// --- CONSTANTS & HELPERS ---
const DEFAULT_COURSES = [
  { id: "phonics1", name: "Phonics 1" },
  { id: "phonics2", name: "Phonics 2" },
  { id: "phonics3", name: "Phonics 3" },
  { id: "phonics4", name: "Phonics 4" },
  { id: "phonics5", name: "Phonics 5" }
];

const GRADE_SCALE_LEFT = [
  'A+ = 97%-100%', 'A = 94%-96%', 'A- = 90%-93%', 
  'B+ = 87%-89%', 'B = 84%-86%', 'B- = 80%-83%', 'C+ = 77%-79%'
];

const GRADE_SCALE_RIGHT = [
  'C = 74%-76%', 'C- = 70%-73%', 'D+ = 67%-69%', 
  'D = 64%-66%', 'D- = 60%-63%', 'F = 59% below'
];

const PHONICS_COMMENTS = {
  '1': {
    heading: 'Oxford Phonics World 1: Letter Sounds',
    learn: 'This level focuses on recognizing and producing the sounds of A–Z letters. Students learn beginning sounds and how letters connect to simple words.',
    progress: 'Your child will begin identifying letter sounds confidently and matching sounds to pictures (for example, "b" for "ball").',
    cannotDo: 'At this stage, your child is not yet blending three sounds together to read full words (such as c-a-t). Reading whole words independently will develop in the next level.'
  },
  '2': {
    heading: 'Oxford Phonics World 2: Short Vowels & CVC Words',
    learn: 'This level focuses on short vowel sounds (a, e, i, o, u) and blending three sounds together to read simple CVC words like "cat," "pen," and "dog."',
    progress: 'Your child will begin reading simple words by blending sounds smoothly and recognizing ending consonant sounds more clearly.',
    cannotDo: 'At this stage, your child may still read slowly and pause between sounds. Reading full sentences with fluency will develop gradually.'
  },
  '3': {
    heading: 'Oxford Phonics World 3: Long Vowels',
    learn: 'This level focuses on long vowel sounds and how they change the meaning of words.',
    progress: 'Your child will begin to read and differentiate between words with short and long vowels (like "cap" vs. "cape") in stories.',
    cannotDo: 'At this stage, your child may not yet be fully comfortable with consonant blends or digraphs (such as "sh" or "ch") and may still struggle with fluency when reading more complex word patterns.'
  },
  '4': {
    heading: 'Oxford Phonics World 4: Blends & Digraphs',
    learn: 'This level focuses on consonant blends (bl, st, tr) and digraphs (sh, ch, th, wh), helping students read longer and more complex words.',
    progress: 'Your child will begin reading short passages more smoothly and recognizing common sound patterns quickly.',
    cannotDo: 'At this stage, your child may still need support with expression and natural intonation when reading full paragraphs.'
  },
  '5': {
    heading: 'Oxford Phonics World 5: Reading Fluency & Expression',
    learn: 'This level focuses on improving reading fluency, expression, and confidence in longer texts.',
    progress: 'Your child will read multi-sentence passages more naturally and understand the meaning of what they read.',
    cannotDo: 'At this stage, advanced vocabulary and complex comprehension skills are still developing and will continue to strengthen with regular reading practice.'
  }
};

const SPELLING_COMMENTS = {
  '1': {
    heading: 'Building Spelling Skills: Level 1',
    learn: 'This level focuses on spelling short and long vowel words, word families, plural forms, consonant digraphs (sh, th), and basic sight words. Students practice through visual memory and tracing.',
    progress: 'Your child will begin consistently spelling common phonetic words, identifying rhyming words, and writing simple dictation sentences correctly.',
    cannotDo: 'At this stage, your child may still occasionally misspell words with complex vowel digraphs or irregular sight words. Independence in proofreading develops gradually.'
  },
  '2': {
    heading: 'Building Spelling Skills: Level 2',
    learn: 'This level introduces more complex phonetic patterns, including variant vowel spellings, silent consonants, and multisyllabic words.',
    progress: 'Your child will improve spelling accuracy in everyday writing and expand their vocabulary with new phonetic structures.',
    cannotDo: 'Your child is still mastering exceptions to phonics rules and may need support spelling less common multisyllabic words independently.'
  },
  '3': {
    heading: 'Building Spelling Skills: Level 3',
    learn: 'This level targets prefixes, suffixes, compound words, and more advanced vowel digraphs.',
    progress: 'Your child will confidently spell a wider variety of words and begin using structural analysis to decode spelling patterns.',
    cannotDo: 'At this stage, highly irregular spellings and advanced academic vocabulary might still require explicit practice and correction.'
  },
  '4': {
    heading: 'Building Spelling Skills: Level 4',
    learn: 'This level focuses on complex word parts, root words, homophones, and building a stronger academic vocabulary.',
    progress: 'Your child will accurately spell most high-frequency words and successfully apply spelling rules to new vocabulary.',
    cannotDo: 'Complex Latin or Greek roots and highly technical terms may still require guidance.'
  },
  '5': {
    heading: 'Building Spelling Skills: Level 5',
    learn: 'This level emphasizes advanced structural word analysis, including Greek and Latin roots, complex suffixes, and easily confused words.',
    progress: 'Your child will master standard spelling conventions, consistently applying them in their independent writing.',
    cannotDo: 'Extremely advanced or obscure vocabulary may still occasionally require dictionary usage.'
  }
};

const getGradeLetter = (percent) => {
  const roundedPercent = Number(percent.toFixed(2));
  if (roundedPercent >= 97) return 'A+';
  if (roundedPercent >= 94) return 'A';
  if (roundedPercent >= 90) return 'A-';
  if (roundedPercent >= 87) return 'B+';
  if (roundedPercent >= 84) return 'B';
  if (roundedPercent >= 80) return 'B-';
  if (roundedPercent >= 77) return 'C+';
  if (roundedPercent >= 74) return 'C';
  if (roundedPercent >= 70) return 'C-';
  if (roundedPercent >= 67) return 'D+';
  if (roundedPercent >= 64) return 'D';
  if (roundedPercent >= 60) return 'D-';
  return 'F';
};

const getThemeColor = (course, level) => {
  const c = (course || '').toLowerCase().trim();
  const l = (level || '').toString().trim();
  if (c.includes('phonic')) {
    if (l === '1') return '#8eb3e6';
    if (l === '2') return '#f09e5e';
    if (l === '3') return '#58b970';
    if (l === '4') return '#b593d6';
    if (l === '5') return '#e68585';
  }
  if (c.includes('spell')) {
    if (l === '1') return '#14b8a6'; 
    if (l === '2') return '#3b82f6'; 
    if (l === '3') return '#8b5cf6'; 
    if (l === '4') return '#ec4899'; 
    if (l === '5') return '#f43f5e'; 
    return '#14b8a6';
  }
  return '#f09e5e';
};

const checkPerm = (user, permName) => {
  if (!user) return false;
  if (user.role === 'superadmin') return true;
  const isPrivatePerm = permName.startsWith('canView');
  return user.permissions && user.permissions[permName] !== undefined 
    ? user.permissions[permName] 
    : (isPrivatePerm ? false : true); 
};

// ==========================================
// UTILS: homeworkStatusUtils.js
// ==========================================
const homeworkStatusUtils = {
  calculateNewStatusFields: (newStatus) => {
    const today = new Date().toISOString().split('T')[0];
    const newDate = (newStatus === 'Submitted' || newStatus === 'Submitted Late') ? today : null;
    return { submissionDate: newDate };
  },
  getTooltip: (report, t) => {
    if (!report.homework) return '';
    let tip = report.homeworkStatus ? t(report.homeworkStatus.toLowerCase().replace(' ', '_')) : t('assigned_date');
    if (report.submissionDate) tip += `\n${t('submission_date')}: ${report.submissionDate}`;
    if (report.homeworkRemark) tip += `\n${t('remark')}: ${report.homeworkRemark}`;
    return tip;
  }
};

// --- TRANSLATIONS & i18n ---
const translations = {
  en: {
    login_title: "The Oxford School",
    login_subtitle: "Language Portal Login",
    login_id: "Login ID / Username",
    password: "Password",
    login_btn: "Log In",
    portal_title: "Oxford Portal",
    back_dashboard: "Back to Dashboard",
    student_history: "Student History",
    edit_report: "Edit Report",
    final_preview: "Final Preview",
    back_portal: "Back to My Portal",
    super_admin_dashboard: "Super Admin Dashboard",
    new_student: "New Student",
    new_user: "New User",
    manage_students: "Manage Students",
    manage_users: "Manage Users",
    manage_certificates: "Manage Certificates",
    school_calendar: "School Calendar",
    search_students: "Search students by name...",
    total_enrolled: "Total Enrolled",
    active_students: "Active (Come More)",
    stopped_resigned: "Stopped / Resigned",
    my_students: "My Students",
    my_schedule: "My Schedule",
    welcome: "Welcome",
    hours_balance: "My Hours Balance",
    total_registered: "Total Registered",
    hours_used: "Hours Used",
    remaining: "Remaining",
    my_payments: "My Payments",
    view_billing_history: "View Billing History",
    official_certificate: "Official Certificate",
    view_diploma: "View Diploma",
    my_report_cards: "My Report Cards",
    add_package: "Add Package",
    payments_billing: "Payments & Billing",
    attendance_summary: "Attendance Summary",
    advanced_summary: "Advanced Summary",
    attendance_tracking: "Attendance & Hours Tracking",
    todays_classes: "Today's Classes",
    write_report: "Write Report",
    lesson_summary: "Lesson Summary",
    homework: "Homework",
    teacher_comment: "Teacher Comment",
    score_optional: "Score (Optional)",
    student_lesson_reports: "Student Lesson Reports",
    save_report: "Save Report",
    no_classes_today: "No classes scheduled for today.",
    no_lesson_reports: "No lesson reports available yet.",
    parent_report: "Parent Report",
    preview_parent_report: "Preview Parent Report",
    send_via_line: "Send via LINE",
    send_via_email: "Send via Email",
    homework_status: "Homework Status",
    submitted: "Submitted",
    submitted_late: "Submitted Late",
    not_submitted: "Not Submitted",
    submission_date: "Submission Date",
    remark: "Remark",
    lesson_topic: "Lesson Topic",
    assigned_date: "Assigned Date",
    my_reports: "My Reports",
    filter_student: "Filter by Student",
    filter_month: "Filter by Month",
    filter_course: "Filter by Course",
    all_students: "All Students",
    all_months: "All Months",
    all_courses: "All Courses",
    upcoming_class: "Upcoming Class",
    view_full_schedule: "View Full Schedule",
    course_progress: "Course Progress",
    attendance_record: "Attendance Record",
    package_information: "Package Information",
    contact_school: "Contact School",
    level: "Level",
    in_progress: "In Progress",
    completed: "Completed",
    manage_courses: "Manage Courses",
    add_course: "Add Course",
    course_name: "Course Name"
  },
  th: {
    login_title: "โรงเรียนสอนภาษา อ๊อกซ์ฟอร์ด",
    login_subtitle: "ระบบเข้าสู่ระบบ",
    login_id: "รหัสผู้ใช้ / ชื่อผู้ใช้",
    password: "รหัสผ่าน",
    login_btn: "เข้าสู่ระบบ",
    portal_title: "พอร์ทัล Oxford",
    back_dashboard: "กลับสู่หน้าหลัก",
    student_history: "ประวัตินักเรียน",
    edit_report: "แก้ไขรายงาน",
    final_preview: "ดูตัวอย่างรายงาน",
    back_portal: "กลับสู่พอร์ทัลของฉัน",
    super_admin_dashboard: "แผงควบคุมผู้ดูแลระบบ",
    new_student: "เพิ่มนักเรียนใหม่",
    new_user: "เพิ่มผู้ใช้ใหม่",
    manage_students: "จัดการนักเรียน",
    manage_users: "จัดการผู้ใช้",
    manage_certificates: "จัดการใบรับรอง",
    school_calendar: "ปฏิทินโรงเรียน",
    search_students: "ค้นหานักเรียนด้วยชื่อ...",
    total_enrolled: "นักเรียนทั้งหมด",
    active_students: "กำลังเรียนอยู่",
    stopped_resigned: "หยุดเรียน / ลาออก",
    my_students: "นักเรียนของฉัน",
    my_schedule: "ตารางสอนของฉัน",
    welcome: "ยินดีต้อนรับ",
    hours_balance: "ยอดชั่วโมงเรียน",
    total_registered: "ชั่วโมงลงทะเบียน",
    hours_used: "ชั่วโมงที่ใช้ไป",
    remaining: "ชั่วโมงคงเหลือ",
    my_payments: "การชำระเงินของฉัน",
    view_billing_history: "ดูประวัติการชำระเงิน",
    official_certificate: "ใบประกาศนียบัตร",
    view_diploma: "ดูใบประกาศนียบัตร",
    my_report_cards: "รายงานผลการเรียน",
    add_package: "เพิ่มแพ็กเกจ",
    payments_billing: "การชำระเงินและบิล",
    attendance_summary: "สรุปการเข้าเรียน",
    advanced_summary: "สรุปขั้นสูง",
    attendance_tracking: "บันทึกการเข้าเรียนและชั่วโมง",
    todays_classes: "ชั้นเรียนของวันนี้",
    write_report: "เขียนรายงาน",
    lesson_summary: "สรุปบทเรียน",
    homework: "การบ้าน",
    teacher_comment: "ความคิดเห็นของครู",
    score_optional: "คะแนน (ไม่บังคับ)",
    student_lesson_reports: "รายงานบทเรียนของนักเรียน",
    save_report: "บันทึกรายงาน",
    no_classes_today: "ไม่มีชั้นเรียนสำหรับวันนี้",
    no_lesson_reports: "ยังไม่มีรายงานบทเรียน",
    parent_report: "รายงานถึงผู้ปกครอง",
    preview_parent_report: "ดูตัวอย่างรายงานผู้ปกครอง",
    send_via_line: "ส่งผ่าน LINE",
    send_via_email: "ส่งผ่านอีเมล",
    homework_status: "สถานะการบ้าน",
    submitted: "ส่งแล้ว",
    submitted_late: "ส่งล่าช้า",
    not_submitted: "ยังไม่ส่ง",
    submission_date: "วันที่ส่ง",
    remark: "หมายเหตุ",
    lesson_topic: "หัวข้อบทเรียน",
    assigned_date: "วันที่สั่งการบ้าน",
    my_reports: "รายงานของฉัน",
    filter_student: "กรองตามนักเรียน",
    filter_month: "กรองตามเดือน",
    filter_course: "กรองตามหลักสูตร",
    all_students: "นักเรียนทั้งหมด",
    all_months: "ทุกเดือน",
    all_courses: "ทุกหลักสูตร",
    upcoming_class: "ชั้นเรียนถัดไป",
    view_full_schedule: "ดูตารางเรียนทั้งหมด",
    course_progress: "ความคืบหน้าหลักสูตร",
    attendance_record: "ประวัติการเข้าเรียน",
    package_information: "ข้อมูลแพ็กเกจ",
    contact_school: "ติดต่อโรงเรียน",
    level: "ระดับ",
    in_progress: "กำลังเรียน",
    completed: "เสร็จสิ้น",
    manage_courses: "จัดการหลักสูตร",
    add_course: "เพิ่มหลักสูตร",
    course_name: "ชื่อหลักสูตร"
  }
};

const LanguageContext = React.createContext();
const useTranslation = () => React.useContext(LanguageContext);

// --- FORMATTER HELPER ---
const formatTime = (totalDecimalHours) => {
  if (!totalDecimalHours || totalDecimalHours <= 0) return '0h';
  const h = Math.floor(totalDecimalHours);
  const m = Math.round((totalDecimalHours - h) * 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

// --- IMAGE COMPRESSION UTILITY ---
const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG to save space in Firestore (1MB Document Limit)
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

// --- API HELPERS ---
const loadScript = (src) => {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// ==========================================
// UTILS: reportFormatter.js
// ==========================================
const generateParentReportText = (studentName, teacherName, course, topic, date, summary, homework, hwAssignedDate, comment, score, hwStatus, hwDate, hwRemark) => {
  let report = `Oxford School of Language\n\n`;
  report += `Student: ${studentName}\n`;
  report += `Teacher: ${teacherName}\n`;
  report += `Course: ${course}\n`;
  if (topic) report += `Lesson Topic: ${topic}\n`;
  report += `Date: ${date}\n\n`;
  report += `Lesson Summary:\n${summary}\n\n`;
  
  if (homework) {
    report += `Homework:\n${homework}\n\n`;
    if (hwAssignedDate) {
       const ad = new Date(hwAssignedDate);
       const displayAssigned = !isNaN(ad.getTime()) ? ad.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : hwAssignedDate;
       report += `Assigned Date:\n${displayAssigned}\n\n`;
    }
    if (hwStatus) {
      report += `Homework Status:\n${hwStatus}\n`;
      if (hwDate && (hwStatus === 'Submitted' || hwStatus === 'Submitted Late')) {
        // Format date simply for the report
        const d = new Date(hwDate);
        const displayDate = !isNaN(d.getTime()) ? d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : hwDate;
        report += `Submission Date:\n${displayDate}\n`;
      }
      if (hwRemark) {
        report += `Remark:\n${hwRemark}\n`;
      }
      report += `\n`;
    }
  }
  
  if (comment) report += `Teacher Comment:\n${comment}\n`;
  if (score) report += `\nScore: ${score}\n`;
  
  return report.trim();
};

// ==========================================
// SERVICES: parentReportService.js
// ==========================================
const parentReportService = {
  sendViaEmail: (report) => {
    console.log(`[Service] Sending report ${report.id} via Email...`);
    const subject = encodeURIComponent(`Oxford School Lesson Report - ${report.course}`);
    const body = encodeURIComponent(report.parentReport || 'Please find the lesson report attached.');
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  },
  sendViaLine: (report) => {
    console.log(`[Service] Sending report ${report.id} via LINE...`);
    const text = encodeURIComponent(report.parentReport || 'Lesson Report');
    window.open(`https://line.me/R/msg/text/?${text}`, '_blank', 'noopener,noreferrer');
  },
  publishToPortal: (reportId) => {
    console.log(`[Service] Publishing report ${reportId} to Parent Portal...`);
  }
};

const generateInitialReportData = (studentName = '', course = 'PHONICS', level = '1') => {
  const isSpell = course.toUpperCase().includes('SPELL');
  
  const defaultComments = isSpell 
    ? (SPELLING_COMMENTS[level] || SPELLING_COMMENTS['1'])
    : (PHONICS_COMMENTS[level] || PHONICS_COMMENTS['1']);
    
  const defaultGrades = isSpell ? [
    { id: 1, courseName: 'Visual Memory\n& Tracing', courseCode: 'VM001', grade: 'PASS', remarks: '' },
    { id: 2, courseName: 'Word Meaning', courseCode: 'WM001', grade: 'PASS', remarks: '' },
    { id: 3, courseName: 'Word Study', courseCode: 'WS001', grade: 'PASS', remarks: '' },
    { id: 4, courseName: 'Sentence\nDictation', courseCode: 'SD001', grade: 'PASS', remarks: '' },
    { id: 5, courseName: 'Weekly Spelling\nTests', courseCode: 'ST001', grade: 'PASS', remarks: '' },
  ] : [
    { id: 1, courseName: 'Listening\nwith writing', courseCode: 'LW001', grade: 'PASS', remarks: '' },
    { id: 2, courseName: 'Reading\nwith writing', courseCode: 'RW001', grade: 'PASS', remarks: '' },
    { id: 3, courseName: 'Vocabulary\nflashcards', courseCode: 'PA001', grade: 'PASS', remarks: '' },
    { id: 4, courseName: 'Reading\nstories', courseCode: 'RS001', grade: 'PASS', remarks: '' },
    { id: 5, courseName: 'Pronouncing\nthe short vowels', courseCode: 'PF001', grade: 'PASS', remarks: '' },
  ];

  return {
    studentName: studentName,
    year: new Date().getFullYear().toString(),
    schoolCourse: course,
    level: level, 
    profileImage: null,
    logo: null,
    signatureImage: null,
    commentsHeading: defaultComments.heading,
    commentsLearn: defaultComments.learn,
    commentsProgress: defaultComments.progress,
    commentsCannotDo: defaultComments.cannotDo,
    evaluatorName: '(Mr. Tarnoan Srichoampue)',
    evaluatorTitle: 'Oxford School Evaluator',
    grades: defaultGrades,
    rawScores: [
      'Test 1', 'Test 2', 'Test 3', 'Test 4', 'Midterm',
      'Test 5', 'Test 6', 'Test 7', 'Test 8', 'Final'
    ].map((name, i) => ({ id: i + 1, windowName: name, listening: '', readingWriting: '' })),
    storyScores: [
      'Test 1', 'Test 2', 'Test 3', 'Test 4',
      'Test 5', 'Test 6', 'Test 7', 'Test 8'
    ].map((name, i) => ({ id: i + 1, windowName: name, score: '' })),
    spellingScores: Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      week: `Week ${i + 1}`,
      wordsScore: '',
      maxWords: i < 14 ? 6 : 8,
      dictationScore: '',
      maxDictation: 10
    }))
  };
};

const defaultCertSettings = {
  name: { x: 220, y: 350, size: 48, color: '#ea580c', font: 'serif' },
  date: { x: 210, y: 665, size: 18, color: '#213568', font: 'serif' },
  code: { x: 335, y: 735, size: 11, color: '#213568', font: 'sans-serif' }
};

function getInitialDb() {
  return {
    adminCalendarUrl: '',
    certificateTemplate: null, 
    certificateSettings: defaultCertSettings,
    courses: DEFAULT_COURSES,
    events: [
      { id: 'e1', title: 'School Holiday', date: new Date().toISOString().split('T')[0], startTime: '', endTime: '', type: 'global', color: 'bg-red-500' }
    ],
    users: [
      { 
        id: 'u_admin', username: 'admin', password: 'admin', name: 'Super Admin', role: 'superadmin', profileImage: null, calendarUrl: '',
        permissions: {} 
      },
      { 
        id: 't1', username: 't1', password: '123', name: 'Mr. Tarnoan', role: 'teacher', profileImage: null, calendarUrl: '',
        permissions: { canEditReports: true, canRequestCertificates: true, canEditStudentInfo: true, canManageAttendance: true, canViewPhone: false, canViewEmail: false, canViewLineId: false, canViewNotes: false, canViewPrivateCustomInfo: false }
      }
    ],
    students: [
      { 
        id: 's1', 
        teacherId: 't1', 
        name: 'Sirawit Charununtakorn (Fong)',
        status: 'active',
        tel: '081-234-5678',
        email: 'parent@email.com',
        lineId: '@fong123',
        notes: 'Needs extra help focusing on long vowels.',
        structuredSchedule: [
          { dayOfWeek: 1, startTime: '17:00', endTime: '18:30' },
          { dayOfWeek: 3, startTime: '17:00', endTime: '18:30' }
        ],
        registeredHours: 0, 
        credit_balance: 0,
        customInfo: [
          { id: 2, label: 'Birthday', value: '12 May 2015', isPrivate: false }
        ],
        attendance: [
          { id: 'att0', date: new Date().toISOString().split('T')[0], startDate: new Date().toISOString().split('T')[0], endDate: '2024-12-31', status: 'added_package', hours: 30, hourlyRate: 500, appliedCredit: 0, remark: 'Initial Enrollment' },
          { id: 'att1', date: new Date().toISOString().split('T')[0], status: 'present', hours: 1.5, remark: 'Great participation' }
        ],
        profileImage: null,
        certificateStatus: 'none',
        certificateDate: null,
        certificateCode: null,
        lessonLogs: [],
        reports: []
      }
    ]
  };
}

// ==========================================
// COMPLETE OXFORD APPLICATION
// ==========================================

function App() {
  // Main application component will be here
  // This is just a placeholder to demonstrate the structure
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-center py-8 text-gray-800">
        Oxford School Management System
      </h1>
      <p className="text-center text-gray-600">
        Full-featured school management platform with student tracking, 
        attendance management, financial packages, reporting, and more.
      </p>
    </div>
  );
}

export default App;