import React, { useState, useEffect, useRef } from 'react';
import { Trash2, Plus, Save, UserCircle, Settings, Award, ShieldCheck, GraduationCap, FileText, Star, Users, LogOut, ArrowLeft, UserPlus, Clock, CheckCircle, Edit3, Send, Image as ImageIcon, X, Move, Search, Folder, ChevronDown, ChevronRight, Calendar, Link as LinkIcon, Phone, Mail, Tag, Lock, MessageSquare, ChevronLeft, Sparkles, UserX, Activity, TrendingUp, Archive, Cloud, ClipboardList } from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, onSnapshot, writeBatch, query } from 'firebase/firestore';

// --- FIREBASE CONFIGURATION ---
import { firebaseConfig, appId } from './firebase-config.js';

// --- INITIALIZE FIREBASE ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestoreDb = getFirestore(app);

const getPublicCollection = (collectionName) => collection(firestoreDb, 'artifacts', appId, 'public', 'data', collectionName);
const getPublicDoc = (collectionName, documentId) => doc(firestoreDb, 'artifacts', appId, 'public', 'data', collectionName, documentId);

// --- CONSTANTS & HELPERS ---
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
};    progress: 'Your child will improve spelling accuracy in everyday writing and expand their vocabulary with new phonetic structures.',
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

// --- FORMATTER HELPER ---
const formatTime = (totalDecimalHours) => {
  if (!totalDecimalHours || totalDecimalHours <= 0) return '0h';
  const h = Math.floor(totalDecimalHours);
  const m = Math.round((totalDecimalHours - h) * 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
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
  name: { x: 380, y: 360, size: 54 },
  date: { x: 190, y: 647, size: 19 },
  code: { x: 420, y: 730, size: 10 }
};

function getInitialDb() {
  return {
    adminCalendarUrl: '',
    certificateTemplate: null, 
    certificateSettings: defaultCertSettings,
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
        customInfo: [
          { id: 2, label: 'Birthday', value: '12 May 2015', isPrivate: false }
        ],
        attendance: [
          { id: 'att0', date: new Date().toISOString().split('T')[0], startDate: new Date().toISOString().split('T')[0], endDate: '2024-12-31', status: 'added_package', hours: 30, remark: 'Initial Enrollment' },
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
// UTILITY COMPONENTS
// ==========================================

const LogoUploader = ({ image, width, onUpload, placeholderText, themeColor }) => {
  if (image) {
    return (
      <div style={{ width: `${width}px` }} className="relative flex justify-center items-center">
        <img src={image} alt="Uploaded Graphic" className="w-full h-auto object-contain pointer-events-none" />
      </div>
    );
  }
  return (
    <div className="relative flex flex-col items-center">
      <div style={{ width: `${width}px` }} className="relative flex justify-center items-center min-h-[80px]">
        <input type="file" accept="image/*" onChange={onUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 no-pdf" title="Upload logo" />
        <div className="text-sm text-center font-bold z-10 px-4 py-6 border-2 border-dashed rounded-lg w-full transition-colors no-pdf" style={{ color: themeColor, borderColor: themeColor, backgroundColor: `${themeColor}15` }}>
          {placeholderText}
        </div>
      </div>
    </div>
  );
};

function DraggableElement({ isEditMode, position, size, text, color, borderStyle, onUpdate }) {
  const [pos, setPos] = useState(position);
  const [fontSize, setFontSize] = useState(size);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => { setPos(position); setFontSize(size); }, [position, size]);

  const handleMouseDown = (e) => {
    if (!isEditMode) return;
    setIsDragging(true);
  };

  return null;
}

function NativeCalendar() {
  return (
    <div className="p-8 text-center bg-gray-50 rounded-xl border border-gray-200 h-full flex items-center justify-center">
      <p className="text-gray-500 font-medium">Calendar component temporarily disabled.</p>
    </div>
  );
}

function StudentAttendance({ student, onUpdate, canEdit, showModal, currentUser }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState('present');
  const [compensationType, setCompensationType] = useState('discount');
  const [inputHours, setInputHours] = useState(1);
  const [inputMinutes, setInputMinutes] = useState('30');
  const [remark, setRemark] = useState('');
  const [filter, setFilter] = useState('all');

  const attendance = student?.attendance || [];
  const registeredHours = Number(student?.registeredHours) || 0;

  const addedPackageHours = attendance.reduce((sum, record) => {
    if (record.status === 'added_package' || record.status === 'renewal') return sum + Number(record.hours || 0);
    return sum;
  }, 0);

  const usedHours = attendance.reduce((sum, record) => {
    if (record.status === 'present' || record.status === 'makeup') {
      return sum + Number(record.hours || 0);
    }
    return sum;
  }, 0);

  const discountEligibleHours = attendance.reduce((sum, record) => {
    if (record.status === 'teacher_absent' && record.compensationType !== 'makeup') {
      return sum + Number(record.hours || 0);
    }
    return sum;
  }, 0);

  // --- NEW FINANCIAL LOGIC ---
  const latestPackage = attendance.find(r => r.status === 'added_package' || r.status === 'renewal');
  const currentHourlyRate = latestPackage ? Number(latestPackage.hourlyRate || 0) : 0;

  const owedDiscountTHB = attendance.reduce((sum, record) => {
    if (record.status === 'teacher_absent' && record.compensationType !== 'makeup') {
      // Use statically saved owedTHB if it exists, otherwise fallback to dynamic calculation
      return sum + (record.owedTHB !== undefined ? record.owedTHB : (Number(record.hours || 0) * currentHourlyRate));
    }
    return sum;
  }, 0);
  // ---------------------------

  const totalRegistered = registeredHours + addedPackageHours;
  const remainingHours = totalRegistered - usedHours;

  const handleAdd = (e) => {
    e.preventDefault();
    if (!date || !status) return;

    const calculatedHours = status === 'absent' || status === 'student_absent' ? 0 : Number(inputHours) + (Number(inputMinutes) / 60);

    // --- LOCK IN THB AT TIME OF RECORD ---
    let recordHourlyRate = 0;
    let owedTHB = 0;
    let finalCompType = null;
    
    if (status === 'teacher_absent') {
       finalCompType = compensationType;
       if (compensationType === 'discount') {
         recordHourlyRate = currentHourlyRate;
         owedTHB = calculatedHours * recordHourlyRate;
       }
    }

    const newRecord = {
      id: `att_${Date.now()}`,
      date,
      status,
      hours: calculatedHours, 
      hourlyRate: recordHourlyRate,
      owedTHB: owedTHB,
      compensationType: finalCompType,
      remark
    };

    onUpdate({ attendance: [newRecord, ...attendance] });
    setRemark(''); 
    setCompensationType('discount');
  };

  const handleDelete = (id) => {
    showModal('DELETE_RECORD', {
      onSubmit: (reason) => {
        const updatedAttendance = attendance.map(a => 
          a.id === id ? { ...a, status: 'deleted', deleteRemark: reason, deletedBy: currentUser?.name || 'Admin' } : a
        );
        onUpdate({ attendance: updatedAttendance });
      }
    });
  };

  const filteredAttendance = attendance.filter(record => filter === 'all' || record.status === filter);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8 overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-200 p-4 sm:p-5 flex justify-between items-center">
        <h3 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="text-indigo-500" size={22}/> Attendance & Hours Tracking
        </h3>
        {canEdit && (
          <button 
            onClick={() => {
              showModal('ADD_PACKAGE', {
                schedule: student?.structuredSchedule || [],
                onSubmit: ({ startDate, endDate, hours, remark, hourlyRate, packageStartDate, packageEndDate }) => {
                  const newRecord = {
                    id: `att_${Date.now()}`,
                    date: startDate,
                    startDate,
                    endDate,
                    packageStartDate,
                    packageEndDate,
                    status: 'added_package',
                    hours: Number(hours),
                    hourlyRate: Number(hourlyRate),
                    remark
                  };
                  onUpdate({ attendance: [newRecord, ...attendance] });
                }
              });
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-bold shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Add Package</span><span className="sm:hidden">Add Pkg</span>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100 border-b border-gray-200">
        <div className="p-4 flex flex-col items-center justify-center bg-white relative">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Package</div>
          <div className="text-2xl font-extrabold text-gray-800">{formatTime(totalRegistered)}</div>
        </div>
        <div className="p-4 flex flex-col items-center justify-center bg-white">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Hours Used</div>
          <div className="text-2xl font-extrabold text-indigo-600">{formatTime(usedHours)}</div>
        </div>
        <div className={`p-4 flex flex-col items-center justify-center ${remainingHours > 0 ? 'bg-green-50/50' : 'bg-red-50/50'}`}>
          <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${remainingHours > 0 ? 'text-green-600' : 'text-red-500'}`}>Remaining Balance</div>
          <div className={`text-2xl font-extrabold ${remainingHours > 0 ? 'text-green-700' : 'text-red-600'}`}>{formatTime(remainingHours)}</div>
        </div>
        <div className="p-4 flex flex-col items-center justify-center bg-amber-50/50 relative group">
          <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1 text-center">Owed Discount<br/>(Teacher Absent)</div>
          <div className="text-2xl font-extrabold text-amber-600">{formatTime(discountEligibleHours)}</div>
          {owedDiscountTHB > 0 && (
             <div className="text-sm font-bold text-amber-700 mt-1">{owedDiscountTHB.toLocaleString()} THB</div>
          )}
        </div>
      </div>

      {canEdit && (
        <form onSubmit={handleAdd} className="p-5 border-b border-gray-200 bg-gray-50/30 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[130px]">
            <label className="block text-xs font-bold text-gray-600 mb-1">Date</label>
            <input required type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full border border-gray-300 rounded outline-none p-2 text-sm focus:border-indigo-500 bg-white" />
          </div>
          <div className="flex-[1.5] min-w-[150px]">
            <label className="block text-xs font-bold text-gray-600 mb-1">Status</label>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full border border-gray-300 rounded outline-none p-2 text-sm focus:border-indigo-500 bg-white">
              <option value="present">âœ”ï¸ Present (Deduct Hrs)</option>
              <option value="makeup">ðŸ”„ Make-up Class (Deduct Hrs)</option>
              <option value="student_absent">âŒ Student Absent (Keep Hrs, No Discount)</option>
              <option value="teacher_absent">âš ï¸ Teacher Absent (Owe Discount/Makeup)</option>
            </select>
          </div>
          {status === 'teacher_absent' && (
            <div className="flex-[1.5] min-w-[150px]">
              <label className="block text-xs font-bold text-gray-600 mb-1">Compensation</label>
              <select value={compensationType} onChange={e=>setCompensationType(e.target.value)} className="w-full border border-gray-300 rounded outline-none p-2 text-sm focus:border-indigo-500 bg-white">
                <option value="discount">Owed Discount</option>
                <option value="makeup">Make-up Class</option>
              </select>
            </div>
          )}
          <div className="flex gap-2">
            <div className="w-16">
              <label className="block text-xs font-bold text-gray-600 mb-1">Hrs</label>
              <input 
                required 
                type="number" 
                min="0" 
                value={inputHours} 
                onChange={e=>setInputHours(e.target.value)} 
                className="w-full border border-gray-300 rounded outline-none p-2 text-sm focus:border-indigo-500 bg-white" 
              />
            </div>
            <div className="w-20">
              <label className="block text-xs font-bold text-gray-600 mb-1">Mins</label>
              <select 
                value={inputMinutes} 
                onChange={e=>setInputMinutes(e.target.value)} 
                className="w-full border border-gray-300 rounded outline-none p-2 text-sm focus:border-indigo-500 bg-white"
              >
                <option value="0">00</option>
                <option value="15">15</option>
                <option value="30">30</option>
                <option value="45">45</option>
              </select>
            </div>
          </div>
          <div className="flex-[2] min-w-[200px]">
            <label className="block text-xs font-bold text-gray-600 mb-1">Admin/Teacher Remark</label>
            <input type="text" placeholder={status === 'student_absent' ? "Reason for absence..." : "Notes..."} value={remark} onChange={e=>setRemark(e.target.value)} className="w-full border border-gray-300 rounded outline-none p-2 text-sm focus:border-indigo-500 bg-white" />
          </div>
          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded text-sm transition-colors shadow-sm h-[38px] whitespace-nowrap">
            Add Record
          </button>
        </form>
      )}

      <div className="bg-gray-50/80 border-b border-gray-200 p-2.5 px-4 flex justify-between items-center text-sm">
        <span className="font-bold text-gray-500 text-[10px] uppercase tracking-wider">Record History</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 font-medium">Filter:</span>
          <select value={filter} onChange={e => setFilter(e.target.value)} className="border border-gray-300 rounded py-1 px-2 text-xs focus:ring-1 focus:ring-indigo-50 outline-none bg-white font-semibold text-gray-700 cursor-pointer shadow-sm">
            <option value="all">All Records</option>
            <option value="present">âœ”ï¸ Present</option>
            <option value="makeup">ðŸ”„ Make-up</option>
            <option value="student_absent">âŒ Absent</option>
            <option value="teacher_absent">âš ï¸ Teacher Absent</option>
            <option value="added_package">â­ Packages</option>
            <option value="deleted">ðŸ—‘ï¸ Deleted</option>
          </select>
        </div>
      </div>

      <div className="max-h-[300px] overflow-y-auto">
        {filteredAttendance.length > 0 ? (
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-white sticky top-0 border-b border-gray-200 z-10">
              <tr className="text-gray-500 uppercase tracking-wider text-xs">
                <th className="p-3 font-semibold w-28">Date</th>
                <th className="p-3 font-semibold w-40">Status</th>
                <th className="p-3 font-semibold text-center w-24">Hours</th>
                <th className="p-3 font-semibold">Remark</th>
                {canEdit && <th className="p-3 font-semibold text-right w-20">Act</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAttendance.map(record => (
                <tr key={record.id} className={`hover:bg-gray-50 ${record.status === 'deleted' ? 'opacity-70 bg-gray-50/50' : ''}`}>
                  <td className={`p-3 font-medium ${record.status === 'deleted' ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                    {record.status === 'added_package' && record.endDate ? (
                      <div className="flex flex-col">
                        <span>{record.startDate || record.date}</span>
                        <span className="text-[10px] text-gray-500 font-normal">to {record.endDate}</span>
                      </div>
                    ) : (
                      record.date
                    )}
                  </td>
                  <td className="p-3">
                    {record.status === 'present' && <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded text-xs font-bold"><CheckCircle size={12}/> Present</span>}
                    {record.status === 'makeup' && <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded text-xs font-bold"><Clock size={12}/> Make-up</span>}
                    {(record.status === 'absent' || record.status === 'student_absent') && <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2 py-0.5 rounded text-xs font-bold"><X size={12}/> Std. Absent</span>}
                    {record.status === 'teacher_absent' && <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-xs font-bold">âš ï¸ Tchr. Absent {record.compensationType === 'makeup' ? '(Make-up)' : '(Discount)'}</span>}
                    {(record.status === 'added_package' || record.status === 'renewal') && <span className="inline-flex items-center gap-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-xs font-bold"><Award size={12}/> Added Pkg</span>}
                    {record.status === 'deleted' && <span className="inline-flex items-center gap-1 text-gray-600 bg-gray-200 px-2 py-0.5 rounded text-xs font-bold"><Trash2 size={12}/> Deleted</span>}
                  </td>
                  <td className={`p-3 text-center font-bold ${record.status === 'deleted' ? 'line-through text-gray-400' : 'text-gray-600'}`}>
                    {(record.status === 'present' || record.status === 'makeup') && <span className="text-red-500">-{formatTime(record.hours)}</span>}
                    {(record.status === 'added_package' || record.status === 'renewal') && <span className="text-green-600">+{formatTime(record.hours)}</span>}
                    {(record.status === 'absent' || record.status === 'student_absent') && <span className="text-gray-400 text-xs">0 <span className="font-normal">(Kept {formatTime(record.hours)})</span></span>}
                    {record.status === 'teacher_absent' && <span className="text-amber-500 text-xs flex flex-col leading-tight"><span>0</span><span className="font-normal text-[10px] whitespace-nowrap">{record.compensationType === 'makeup' ? `(Need Make-up ${formatTime(record.hours)})` : `(Owed ${formatTime(record.hours)})`}</span></span>}
                    {record.status === 'deleted' && <span className="text-gray-400">0</span>}
                  </td>
                  <td className="p-3 text-gray-600">
                    {record.status === 'deleted' ? (
                      <span className="text-red-600 italic text-xs font-medium">Deleted by {record.deletedBy}: {record.deleteRemark}</span>
                    ) : (
                      record.remark || '-'
                    )}
                  </td>
                  {canEdit && (
                    <td className="p-3 text-right whitespace-nowrap">
                      {record.status !== 'deleted' && (
                        <button onClick={() => showModal('EDIT_RECORD', {
                          record,
                          onSubmit: (updated) => onUpdate({ attendance: attendance.map(a => a.id === record.id ? updated : a) })
                        })} className="text-indigo-400 hover:text-indigo-600 p-1 rounded hover:bg-indigo-50 transition-colors mr-1" title="Edit Record">
                          <Edit3 size={16} />
                        </button>
                      )}
                      {record.status !== 'deleted' && currentUser?.role === 'superadmin' && (
                        <button onClick={() => handleDelete(record.id)} className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors" title="Delete Record">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-gray-400 italic text-sm">
            {attendance.length === 0 ? "No attendance records found for this student." : "No records match the selected filter."}
          </div>
        )}
      </div>
    </div>
  );
}

function StudentInfoCard({ student, onSave, canEdit, canViewPhone, canViewEmail, canViewLineId, canViewNotes, canViewPrivateCustom }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: student?.name || '',
    tel: student?.tel || '',
    email: student?.email || '',
    lineId: student?.lineId || '',
    notes: student?.notes || '',
    schedule: student?.schedule || '',
    status: student?.status || 'active',
    structuredSchedule: student?.structuredSchedule || [],
    customInfo: student?.customInfo || []
  });

  const DAYS = [
    { v: 1, l: 'Mon' }, { v: 2, l: 'Tue' }, { v: 3, l: 'Wed' }, 
    { v: 4, l: 'Thu' }, { v: 5, l: 'Fri' }, { v: 6, l: 'Sat' }, { v: 0, l: 'Sun' }
  ];

  useEffect(() => {
    setFormData({
      name: student?.name || '',
      tel: student?.tel || '',
      email: student?.email || '',
      lineId: student?.lineId || '',
      notes: student?.notes || '',
      schedule: student?.schedule || '',
      status: student?.status || 'active',
      structuredSchedule: student?.structuredSchedule || [],
      customInfo: student?.customInfo || []
    });
  }, [student]);

  const handleCustomChange = (id, field, val) => {
    setFormData(prev => ({
      ...prev, 
      customInfo: prev.customInfo.map(c => c.id === id ? { ...c, [field]: val } : c)
    }));
  };

  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customInfo: [...(prev.customInfo || []), { id: Date.now(), label: '', value: '', isPrivate: false }]
    }));
  };

  const removeCustomField = (id) => {
    setFormData(prev => ({
      ...prev,
      customInfo: prev.customInfo.filter(c => c.id !== id)
    }));
  };

  const toggleDay = (dayVal) => {
    setFormData(prev => {
      const sched = prev.structuredSchedule || [];
      if (sched.find(s => s.dayOfWeek === dayVal)) {
        return { ...prev, structuredSchedule: sched.filter(s => s.dayOfWeek !== dayVal) };
      }
      return { ...prev, structuredSchedule: [...sched, { dayOfWeek: dayVal, startTime: '15:00', endTime: '16:00' }] };
    });
  };

  const updateTime = (dayVal, field, val) => {
    setFormData(prev => ({
      ...prev,
      structuredSchedule: (prev.structuredSchedule || []).map(s => s.dayOfWeek === dayVal ? { ...s, [field]: val } : s)
    }));
  };

  const formatSchedule = (schedArr, legacyText) => {
    if (schedArr && schedArr.length > 0) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const sorted = [...schedArr].sort((a,b) => (a.dayOfWeek === 0 ? 7 : a.dayOfWeek) - (b.dayOfWeek === 0 ? 7 : b.dayOfWeek));
      return sorted.map(s => `${dayNames[s.dayOfWeek]}: ${s.startTime} - ${s.endTime}`).join('\n');
    }
    return legacyText || <span className="text-gray-400 italic font-normal">Not provided</span>;
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  if (!student) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-3">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <UserCircle className="text-indigo-500" size={20}/> Contact & Info
        </h3>
        {!isEditing && canEdit && (
          <button onClick={() => setIsEditing(true)} className="text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 p-1.5 rounded-lg transition-colors" title="Edit Info">
            <Edit3 size={16}/>
          </button>
        )}
      </div>

      {isEditing ? (
         <div className="space-y-4">
           <div>
             <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Student Name</label>
             <input type="text" className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2 outline-none text-sm font-medium" value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} />
           </div>

           <div>
              <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Enrollment Status</label>
              <select value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})} className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2 outline-none text-sm font-medium bg-white">
                <option value="active">ðŸŸ¢ Active (Currently Enrolled)</option>
                <option value="resigned">ðŸ”´ Stopped / Resigned</option>
              </select>
           </div>

           {canViewPhone && (
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Phone Number</label>
               <input type="tel" className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2 outline-none text-sm font-medium" value={formData.tel} onChange={e=>setFormData({...formData, tel: e.target.value})} placeholder="e.g. 081-234-5678" />
             </div>
           )}

           {canViewEmail && (
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Email Address</label>
               <input type="email" className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2 outline-none text-sm font-medium" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} placeholder="parent@email.com" />
             </div>
           )}

           {canViewLineId && (
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Line ID</label>
               <input type="text" className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2 outline-none text-sm font-medium" value={formData.lineId} onChange={e=>setFormData({...formData, lineId: e.target.value})} placeholder="e.g. @studentLine" />
             </div>
           )}

           <div className="w-full overflow-hidden">
             <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Class Schedule (Auto-links to Calendar)</label>
             <div className="space-y-2 border border-gray-200 rounded-lg p-3 bg-gray-50/50 w-full overflow-hidden">
               {DAYS.map(day => {
                 const activeSched = formData.structuredSchedule?.find(s => s.dayOfWeek === day.v);
                 const isActive = !!activeSched;
                 return (
                   <div key={day.v} className="flex items-center gap-2 flex-wrap">
                     <label className="flex items-center gap-2 w-16 shrink-0 cursor-pointer">
                       <input type="checkbox" checked={isActive} onChange={() => toggleDay(day.v)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4" />
                       <span className={`text-sm ${isActive ? 'font-bold text-gray-900' : 'text-gray-500'}`}>{day.l}</span>
                     </label>
                     {isActive && (
                       <div className="flex items-center gap-2 flex-1 flex-wrap min-w-[200px]">
                         <input type="time" value={activeSched.startTime} onChange={e=>updateTime(day.v, 'startTime', e.target.value)} className="border border-gray-300 rounded p-1 text-sm w-full max-w-[110px] outline-none focus:border-indigo-500 text-center" />
                         <span className="text-gray-400 shrink-0">-</span>
                         <input type="time" value={activeSched.endTime} onChange={e=>updateTime(day.v, 'endTime', e.target.value)} className="border border-gray-300 rounded p-1 text-sm w-full max-w-[110px] outline-none focus:border-indigo-500 text-center" />
                       </div>
                     )}
                   </div>
                 );
               })}
             </div>
           </div>

           {canViewNotes && (
             <div>
               <label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Internal Notes</label>
               <textarea className="w-full border border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg p-2 outline-none text-sm font-medium" value={formData.notes} onChange={e=>setFormData({...formData, notes: e.target.value})} rows="2" placeholder="Allergies, special needs, etc."></textarea>
             </div>
           )}
           
           <div className="pt-2 border-t border-gray-100">
             <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Additional Custom Fields</label>
             {formData.customInfo.map(info => {
               if (info.isPrivate && !canViewPrivateCustom) {
                 return (
                   <div key={info.id} className="flex flex-col gap-2 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                     <div className="text-sm text-gray-500 flex items-center gap-1.5"><Lock size={14} className="text-gray-400"/> {info.label || 'Private Field'} â€” Hidden</div>
                   </div>
                 );
               }

               return (
                 <div key={info.id} className="flex flex-col gap-2 mb-3 bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                   <div className="flex gap-2 items-start">
                     <input type="text" placeholder="Label" className="w-1/3 border border-gray-300 rounded p-1.5 text-xs outline-none focus:border-indigo-500" value={info.label} onChange={e=>handleCustomChange(info.id, 'label', e.target.value)} />
                     <input type="text" placeholder="Value" className="flex-1 border border-gray-300 rounded p-1.5 text-xs outline-none focus:border-indigo-500" value={info.value} onChange={e=>handleCustomChange(info.id, 'value', e.target.value)} />
                     <button onClick={()=>removeCustomField(info.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={16}/></button>
                   </div>
                   {canViewPrivateCustom && (
                     <label className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500 cursor-pointer w-max ml-1 mt-0.5">
                       <input type="checkbox" checked={info.isPrivate || false} onChange={e=>handleCustomChange(info.id, 'isPrivate', e.target.checked)} className="rounded text-indigo-600 focus:ring-indigo-500 w-3 h-3" />
                       <Lock size={10} className={info.isPrivate ? 'text-red-500' : 'text-gray-400'} />
                       Set as Private (Hidden from restricted Teachers)
                     </label>
                   )}
                 </div>
               )
             })}
             <button onClick={addCustomField} className="text-indigo-600 font-bold text-xs flex items-center gap-1 hover:underline mt-1">
               <Plus size={14}/> Add New Field
             </button>
           </div>

           <div className="flex gap-2 pt-4">
             <button onClick={()=>setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 py-2 rounded-lg text-sm font-bold transition-colors">Cancel</button>
             <button onClick={handleSave} className="flex-1 bg-indigo-600 text-white hover:bg-indigo-700 py-2 rounded-lg text-sm font-bold transition-colors">Save Settings</button>
           </div>
         </div>
      ) : (
         <div className="space-y-4">
           <div className="flex items-start gap-3">
             <div className="mt-0.5 text-gray-400"><Activity size={16} /></div>
             <div>
               <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Enrollment Status</div>
               <div className="text-sm font-semibold text-gray-800">
                 {student.status === 'resigned' ? <span className="text-red-600 font-bold">Stopped / Resigned</span> : <span className="text-green-600 font-bold">Active</span>}
               </div>
             </div>
           </div>

           <div className="flex items-start gap-3">
             <div className="mt-0.5 text-gray-400"><Phone size={16} /></div>
             <div>
               <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone Number</div>
               <div className="text-sm font-semibold text-gray-800">
                 {canViewPhone ? (student.tel || <span className="text-gray-400 italic font-normal">Not provided</span>) : <span className="text-gray-400 italic font-normal flex items-center gap-1"><Lock size={12}/> Hidden (Admin Only)</span>}
               </div>
             </div>
           </div>
           
           <div className="flex items-start gap-3">
             <div className="mt-0.5 text-gray-400"><Mail size={16} /></div>
             <div>
               <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email Address</div>
               <div className="text-sm font-semibold text-gray-800 break-all">
                 {canViewEmail ? (student.email || <span className="text-gray-400 italic font-normal">Not provided</span>) : <span className="text-gray-400 italic font-normal flex items-center gap-1"><Lock size={12}/> Hidden (Admin Only)</span>}
               </div>
             </div>
           </div>

           <div className="flex items-start gap-3">
             <div className="mt-0.5 text-gray-400"><MessageSquare size={16} /></div>
             <div>
               <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Line ID</div>
               <div className="text-sm font-semibold text-gray-800">
                 {canViewLineId ? (student.lineId || <span className="text-gray-400 italic font-normal">Not provided</span>) : <span className="text-gray-400 italic font-normal flex items-center gap-1"><Lock size={12}/> Hidden (Admin Only)</span>}
               </div>
             </div>
           </div>

           <div className="flex items-start gap-3">
             <div className="mt-0.5 text-gray-400"><Calendar size={16} /></div>
             <div>
               <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Class Schedule</div>
               <div className="text-sm font-semibold text-gray-800 whitespace-pre-wrap">{formatSchedule(student.structuredSchedule, student.schedule)}</div>
             </div>
           </div>

           <div className="flex items-start gap-3">
             <div className="mt-0.5 text-gray-400"><FileText size={16} /></div>
             <div>
               <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Internal Notes</div>
               <div className="text-sm font-semibold text-gray-800 whitespace-pre-wrap">
                 {canViewNotes ? (student.notes || <span className="text-gray-400 italic font-normal">No notes</span>) : <span className="text-gray-400 italic font-normal flex items-center gap-1"><Lock size={12}/> Hidden (Admin Only)</span>}
               </div>
             </div>
           </div>

           {/* Custom Fields View */}
           {student.customInfo && student.customInfo.map(info => (
             <div className="flex items-start gap-3" key={info.id}>
               <div className="mt-0.5 text-gray-400">
                 {info.isPrivate ? <Lock size={16} className={canViewPrivateCustom ? "text-red-400" : "text-gray-400"} /> : <Tag size={16} />}
               </div>
               <div>
                 <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{info.label || 'Info'}</div>
                 <div className="text-sm font-semibold text-gray-800 break-all">
                   {info.isPrivate && !canViewPrivateCustom 
                     ? <span className="text-gray-400 italic font-normal flex items-center gap-1"><Lock size={12}/> Hidden (Admin Only)</span>
                     : (info.value || <span className="text-gray-400 italic font-normal">-</span>)
                   }
                 </div>
               </div>
             </div>
           ))}
         </div>
      )}
    </div>
  );
}

function ReportEditor({ data, onSave, onCancel, onChange }) {
  const [formData, setFormData] = useState(data || {});

  useEffect(() => {
    if (data) setFormData(data);
  }, [data]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (onChange) onChange(newData);
      return newData;
    });
  };

  const handleArrayChange = (arrayName, index, field, value) => {
     setFormData(prev => {
        const newArr = [...(prev[arrayName] || [])];
        newArr[index] = { ...newArr[index], [field]: value };
        const newData = { ...prev, [arrayName]: newArr };

        // Auto-calculate Course Grades when Raw Scores change
        if (arrayName === 'rawScores') {
          let listeningTotal = 0;
          let readingTotal = 0;
          let hasListening = false;
          let hasReading = false;

          newArr.forEach(s => {
            if (s.listening !== '' && s.listening !== null && s.listening !== undefined) {
              listeningTotal += Number(s.listening) || 0;
              hasListening = true;
            }
            if (s.readingWriting !== '' && s.readingWriting !== null && s.readingWriting !== undefined) {
              readingTotal += Number(s.readingWriting) || 0;
              hasReading = true;
            }
          });

          const newGrades = [...(newData.grades || [])];
          let gradesChanged = false;

          const updateGradeRow = (code, total, hasData) => {
            const idx = newGrades.findIndex(g => g.courseCode === code);
            if (idx > -1 && hasData) {
              const percent = Number(total.toFixed(2));
              const gradeLetter = getGradeLetter(percent);
              const remarks = `${percent}%`;
              
              if (newGrades[idx].grade !== gradeLetter || newGrades[idx].remarks !== remarks) {
                newGrades[idx] = { ...newGrades[idx], grade: gradeLetter, remarks: remarks };
                gradesChanged = true;
              }
            }
          };

          updateGradeRow('LW001', listeningTotal, hasListening);
          updateGradeRow('RW001', readingTotal, hasReading);

          if (gradesChanged) {
            newData.grades = newGrades;
          }
        }

        if (onChange) onChange(newData);
        return newData;
     });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave) onSave(formData);
  };

  const isSpelling = (formData?.schoolCourse || '').toUpperCase().includes('SPELL');

  if (!data) return <div className="p-8 text-center text-gray-500">Loading editor...</div>;

  return (
    <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl overflow-hidden mb-16 border border-gray-200 mx-auto text-left">
       {/* Header */}
       <div className="bg-[#213568] p-6 text-white flex justify-between items-center">
         <h3 className="text-2xl font-bold flex items-center gap-2"><Edit3 size={24} /> Edit Report Data</h3>
         <div className="flex gap-3">
           <button onClick={onCancel} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg font-bold transition-colors">Cancel</button>
           <button onClick={handleSubmit} className="px-4 py-2 bg-[#f09e5e] hover:bg-orange-500 rounded-lg font-bold shadow-sm transition-colors flex items-center gap-2 primary-action"><Save size={18} /> Save Changes</button>
         </div>
       </div>

       <div className="p-8 space-y-10">
         {/* Basic Info */}
         <section>
           <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><UserCircle size={20} className="text-indigo-600"/> Student Information</h4>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Student Name</label><input type="text" value={formData.studentName || ''} onChange={e=>handleChange('studentName', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
             <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Year</label><input type="text" value={formData.year || ''} onChange={e=>handleChange('year', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
             <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Course</label><input type="text" value={formData.schoolCourse || ''} onChange={e=>handleChange('schoolCourse', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
             <div><label className="block text-xs font-bold text-gray-500 mb-1 uppercase tracking-wider">Level</label><input type="text" value={formData.level || ''} onChange={e=>handleChange('level', e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
           </div>
         </section>

         {/* Grades */}
         <section>
            <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><Award size={20} className="text-indigo-600"/> Course Grades</h4>
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-[11px] tracking-wider">
                  <tr><th className="p-3 w-1/3">Course Name</th><th className="p-3">Course Code</th><th className="p-3 w-28 text-center">Grade</th><th className="p-3 w-1/3">Remarks</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {(formData.grades || []).map((g, i) => (
                    <tr key={g.id || i} className="bg-white">
                      <td className="p-2"><textarea value={g.courseName || ''} onChange={e=>handleArrayChange('grades', i, 'courseName', e.target.value)} className="w-full border-gray-300 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 border bg-gray-50" rows="2" /></td>
                      <td className="p-2"><input type="text" value={g.courseCode || ''} onChange={e=>handleArrayChange('grades', i, 'courseCode', e.target.value)} className="w-full border-gray-300 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 border" /></td>
                      <td className="p-2"><input type="text" value={g.grade || ''} onChange={e=>handleArrayChange('grades', i, 'grade', e.target.value)} className="w-full border-gray-300 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 border font-bold text-center text-[#213568]" /></td>
                      <td className="p-2"><input type="text" value={g.remarks || ''} onChange={e=>handleArrayChange('grades', i, 'remarks', e.target.value)} className="w-full border-gray-300 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-indigo-500 border" /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
         </section>

         {/* Scores - Phonics */}
         {!isSpelling && formData.rawScores && (
           <section>
             <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><Star size={20} className="text-indigo-600"/> Test Scores</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                 <h5 className="font-bold text-gray-600 mb-3 uppercase text-xs tracking-wider">Raw Scores</h5>
                 <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                   <table className="w-full text-sm text-center">
                     <thead className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider"><tr><th className="p-3 text-left">Test Window</th><th className="p-3">Listening</th><th className="p-3">Reading/Writing</th><th className="p-3">Total</th></tr></thead>
                     <tbody className="divide-y divide-gray-200">
                       {formData.rawScores.map((s, i) => {
                         const total = (Number(s.listening) || 0) + (Number(s.readingWriting) || 0);
                         return (
                           <tr key={s.id || i} className="bg-white hover:bg-gray-50">
                             <td className="p-3 text-left font-medium text-gray-700 whitespace-nowrap">{s.windowName}</td>
                             <td className="p-2"><input type="number" min="0" value={s.listening || ''} onChange={e=>handleArrayChange('rawScores', i, 'listening', e.target.value)} className="w-full border border-gray-300 rounded p-2 text-center focus:ring-1 focus:ring-indigo-500 outline-none font-medium" placeholder="-" /></td>
                             <td className="p-2"><input type="number" min="0" value={s.readingWriting || ''} onChange={e=>handleArrayChange('rawScores', i, 'readingWriting', e.target.value)} className="w-full border border-gray-300 rounded p-2 text-center focus:ring-1 focus:ring-indigo-500 outline-none font-medium" placeholder="-" /></td>
                             <td className="p-3 font-bold text-[#213568]">{total > 0 ? total : '-'}</td>
                           </tr>
                         );
                       })}
                     </tbody>
                   </table>
                 </div>
               </div>
               <div>
                 <h5 className="font-bold text-gray-600 mb-3 uppercase text-xs tracking-wider">Story Scores</h5>
                 <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                   <table className="w-full text-sm text-center">
                     <thead className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider"><tr><th className="p-3 text-left">Story Window</th><th className="p-3">Score</th></tr></thead>
                     <tbody className="divide-y divide-gray-200">
                       {(formData.storyScores || []).map((s, i) => (
                         <tr key={s.id || i} className="bg-white hover:bg-gray-50">
                           <td className="p-3 text-left font-medium text-gray-700">{s.windowName}</td>
                           <td className="p-2"><input type="text" value={s.score || ''} onChange={e=>handleArrayChange('storyScores', i, 'score', e.target.value)} className="w-full border border-gray-300 rounded p-2 text-center focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-[#213568]" placeholder="-" /></td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
               </div>
             </div>
           </section>
         )}

         {/* Scores - Spelling */}
         {isSpelling && formData.spellingScores && (
           <section>
             <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><Star size={20} className="text-indigo-600"/> Spelling Scores</h4>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[0, 1].map(colIndex => (
                 <div key={colIndex} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                   <table className="w-full text-sm text-center">
                     <thead className="bg-gray-50 text-gray-600 text-[11px] uppercase tracking-wider">
                       <tr><th className="p-3 text-left">Week</th><th className="p-3">Words Score</th><th className="p-3">Dictation Score</th></tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200">
                       {formData.spellingScores.slice(colIndex * 15, (colIndex + 1) * 15).map((s, idx) => {
                         const realIndex = colIndex * 15 + idx;
                         return (
                           <tr key={s.id || realIndex} className="bg-white hover:bg-gray-50">
                             <td className="p-2 text-left font-medium text-gray-700 pl-4">{s.week}</td>
                             <td className="p-2"><div className="flex items-center justify-center gap-2"><input type="text" value={s.wordsScore || ''} onChange={e=>handleArrayChange('spellingScores', realIndex, 'wordsScore', e.target.value)} className="w-16 border border-gray-300 rounded p-1.5 text-center focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-[#213568]" placeholder="-" /> <span className="text-gray-400 text-xs font-bold">/ {s.maxWords}</span></div></td>
                             <td className="p-2"><div className="flex items-center justify-center gap-2"><input type="text" value={s.dictationScore || ''} onChange={e=>handleArrayChange('spellingScores', realIndex, 'dictationScore', e.target.value)} className="w-16 border border-gray-300 rounded p-1.5 text-center focus:ring-1 focus:ring-indigo-500 outline-none font-medium text-[#213568]" placeholder="-" /> <span className="text-gray-400 text-xs font-bold">/ {s.maxDictation}</span></div></td>
                           </tr>
                         )
                       })}
                     </tbody>
                   </table>
                 </div>
               ))}
             </div>
           </section>
         )}

         {/* Comments */}
         <section>
           <h4 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4 flex items-center gap-2"><MessageSquare size={20} className="text-indigo-600"/> Comments & Feedback</h4>
           <div className="space-y-5">
             <div><label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Main Heading</label><input type="text" value={formData.commentsHeading || ''} onChange={e=>handleChange('commentsHeading', e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-[#213568] text-lg bg-gray-50" /></div>
             <div className="bg-white border border-gray-200 p-5 rounded-xl space-y-4 shadow-sm">
               <div><label className="block text-sm font-bold text-gray-700 mb-2">What your child will learn</label><textarea value={formData.commentsLearn || ''} onChange={e=>handleChange('commentsLearn', e.target.value)} rows="3" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-800" /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">Progress to expect</label><textarea value={formData.commentsProgress || ''} onChange={e=>handleChange('commentsProgress', e.target.value)} rows="3" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-800" /></div>
               <div><label className="block text-sm font-bold text-gray-700 mb-2">What they cannot do yet</label><textarea value={formData.commentsCannotDo || ''} onChange={e=>handleChange('commentsCannotDo', e.target.value)} rows="3" className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm text-gray-800" /></div>
             </div>
           </div>
           <div className="grid grid-cols-2 gap-6 mt-8 pt-6 border-t border-gray-200">
             <div><label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Evaluator Name</label><input type="text" value={formData.evaluatorName || ''} onChange={e=>handleChange('evaluatorName', e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none font-medium" /></div>
             <div><label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Evaluator Title</label><input type="text" value={formData.evaluatorTitle || ''} onChange={e=>handleChange('evaluatorTitle', e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-gray-600" /></div>
           </div>
         </section>
       </div>
    </div>
  );
}

function FinalReportView({ data, onImageUpload, onRemoveImage, onLogoUpload, onSignatureUpload, canEdit }) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Safely handle missing data
  if (!data) {
    return (
      <div className="w-full max-w-4xl bg-white shadow-sm rounded-xl border border-gray-200 p-8 text-center mx-auto mb-8">
        <FileText size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 font-medium">No final report available yet.</p>
      </div>
    );
  }

  const themeColor = getThemeColor(data?.schoolCourse, data?.level);
  const isSpelling = (data?.schoolCourse || '').toUpperCase().includes('SPELL');

  const handleDownloadReportImage = async () => {
    setIsGenerating(true);
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      const container = document.getElementById('report-container');
      const noPdfElements = Array.from(container.querySelectorAll('.no-pdf'));
      noPdfElements.forEach(el => el.classList.add('hidden'));

      const canvas = await window.html2canvas(container, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#f3f4f6', 
        scrollY: 0
      });
      
      noPdfElements.forEach(el => el.classList.remove('hidden'));

      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `Report_${(data?.studentName || 'Student').replace(/[^a-z0-9]/gi, '_')}.png`;
      link.href = imgData;
      link.click();

    } catch (err) {
      console.error(err);
      alert("Failed to generate Image. Check console for details.");
    } finally {
      window.scrollTo(0, originalScrollY);
      setIsGenerating(false);
    }
  };

  const handleDownloadReportPDF = async () => {
    setIsGenerating(true);
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const pages = document.querySelectorAll('.report-page');
      for (let i = 0; i < pages.length; i++) {
        if (i > 0) pdf.addPage();
        const noPdfElements = Array.from(pages[i].querySelectorAll('.no-pdf'));
        noPdfElements.forEach(el => el.classList.add('hidden'));

        const canvas = await window.html2canvas(pages[i], { 
          scale: 2, 
          useCORS: true, 
          backgroundColor: '#ffffff',
          scrollY: 0,
          windowWidth: 794,
          windowHeight: 1123
        });
        
        noPdfElements.forEach(el => el.classList.remove('hidden'));

        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`Report_${(data?.studentName || 'Student').replace(/[^a-z0-9]/gi, '_')}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      window.scrollTo(0, originalScrollY);
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-10 items-center overflow-x-auto pb-8">
      
      <div className="w-[794px] flex justify-end gap-3 print:hidden">
        <button 
          onClick={handleDownloadReportImage} 
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all"
        >
          {isGenerating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <ImageIcon size={20} />}
          {isGenerating ? 'Generating...' : 'Download as Picture'}
        </button>
        <button 
          onClick={handleDownloadReportPDF} 
          disabled={isGenerating}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg flex items-center gap-2 transition-all"
        >
          {isGenerating ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <FileText size={20} />}
          {isGenerating ? 'Generating...' : 'Download as PDF'}
        </button>
      </div>

      <div id="report-container" className="flex flex-col items-center gap-10">
        
        <div className="report-page print-full-height w-[794px] h-[1123px] shrink-0 bg-white shadow-2xl overflow-hidden flex relative print:shadow-none">
          <div className="absolute top-0 bottom-0 left-0 w-24 pointer-events-none transition-colors duration-500 z-0 border-r border-gray-200" style={{ backgroundColor: themeColor }}></div>
          <div className="absolute top-0 bottom-0 left-0 w-24 z-10 flex items-center justify-center pointer-events-none">
            <div className="absolute transform -rotate-90 flex flex-col items-center justify-center w-[1100px]">
              <h1 className="text-[#213568] font-extrabold text-[34px] tracking-[0.1em] uppercase m-0 leading-none whitespace-nowrap drop-shadow-sm">
                THE OXFORD SCHOOL OF LANGUAGE
              </h1>
              <span className="block text-[22px] text-[#213568] mt-2 font-bold tracking-[0.2em] opacity-80 whitespace-nowrap uppercase">
                REPORT CARD
              </span>
            </div>
          </div>
          <div className={`ml-24 flex-1 flex flex-col ${isSpelling ? 'pt-6 px-10 pb-6' : 'pt-8 px-12 pb-12'} relative bg-white z-20 h-[1123px] box-border`}>
            <div className={`flex justify-center ${isSpelling ? 'mb-2' : 'mb-10'} relative shrink-0`}>
              <div className="relative">
                <div className={`rounded-full border-4 border-gray-300 overflow-hidden relative shadow-inner group flex items-center justify-center bg-[#e0f2fe] ${isSpelling ? 'w-20 h-20' : 'w-32 h-32'}`}>
                  {canEdit && (
                     <input type="file" accept="image/*" onChange={onImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20 no-pdf print:hidden" />
                  )}
                  {data?.profileImage ? (
                    <img src={data.profileImage} alt="Student" className="w-full h-full object-cover z-10 relative" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" className="w-full h-full z-10 relative pointer-events-none">
                      <rect width="100" height="100" fill="#e0f2fe" />
                      <path d="M 30 35 A 10 10 0 0 1 45 20 A 15 15 0 0 1 70 30 A 10 10 0 0 1 70 45 L 30 45 Z" fill="white" />
                      <path d="M -10 65 Q 25 45 60 70 T 110 60 L 110 100 L -10 100 Z" fill="#a3e635" />
                      <path d="M -10 80 Q 30 60 70 85 T 110 75 L 110 100 L -10 100 Z" fill="#65a30d" />
                    </svg>
                  )}
                  {canEdit && (
                    <div className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white text-sm font-bold z-10 pointer-events-none transition-all no-pdf print:hidden">
                      {data?.profileImage ? 'Replace Photo' : 'Click to Upload'}
                    </div>
                  )}
                </div>
                
                {data?.profileImage && canEdit && (
                  <>
                    <button onClick={onRemoveImage} className="absolute top-0 right-0 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors z-30 transform translate-x-2 -translate-y-2 border-2 border-white no-pdf print:hidden" title="Remove Photo"><Trash2 size={16} /></button>
                  </>
                )}
              </div>
            </div>

            <div className={`grid grid-cols-[1fr_160px] ${isSpelling ? 'gap-y-1 mb-2 text-[11px]' : 'gap-y-3 mb-6 text-sm'} gap-x-8 font-sans tracking-wide shrink-0`}>
              <div className="flex items-center min-w-0"><span className="text-[#213568] font-bold w-40 uppercase flex-shrink-0">Student Name</span><span className="text-gray-700 font-semibold whitespace-nowrap">{data?.studentName || '-'}</span></div>
              <div className="flex items-center flex-shrink-0"><span className="text-[#213568] font-bold w-20 uppercase flex-shrink-0">Year</span><span className="text-gray-700 font-semibold">{data?.year || '-'}</span></div>
              <div className="flex items-center min-w-0"><span className="text-[#213568] font-bold w-40 uppercase flex-shrink-0">School Course</span><span className="text-gray-700 font-semibold whitespace-nowrap">{data?.schoolCourse || '-'}</span></div>
              <div className="flex items-center flex-shrink-0"><span className="text-[#213568] font-bold w-20 uppercase flex-shrink-0">Level</span><span className="text-gray-700 font-semibold">{data?.level || '-'}</span></div>
            </div>

            <div className={`relative ${isSpelling ? 'mb-2' : 'mb-4'}`}>
              <div className="absolute inset-0 z-0 flex flex-col items-center justify-center opacity-[0.06] pointer-events-none select-none overflow-hidden pb-12">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" className="w-[110%] h-[110%] absolute top-[-5%]">
                  <g stroke="#213568" strokeWidth="8" opacity="0.6"><path d="M0,0 L200,200 M0,200 L200,0 M100,-20 L100,220 M-20,100 L220,100" /></g>
                  <g stroke="#213568" strokeWidth="3" opacity="0.3"><path d="M10,0 L210,200 M-10,0 L190,200" /><path d="M0,190 L200,-10 M0,210 L200,10" /></g>
                  <rect x="85" y="10" width="30" height="190" fill="white" stroke="#213568" strokeWidth="4" />
                  <polygon points="85,10 100,-15 115,10" fill="#213568" />
                  <circle cx="100" cy="40" r="12" fill="white" stroke="#213568" strokeWidth="3" />
                  <circle cx="100" cy="40" r="2" fill="#213568" />
                  <path d="M100,40 L100,33 M100,40 L105,43" stroke="#213568" strokeWidth="2" />
                </svg>
                <div className="text-[100px] font-serif font-bold text-center leading-none text-[#213568] z-10 pt-16 opacity-70">The<br/>Oxford</div>
                <div className="text-4xl font-sans mt-2 text-center text-[#213568] z-10 opacity-70">School of Language</div>
                <div className="text-xl font-sans mt-2 text-center text-[#213568] font-bold z-10 opacity-70">à¹‚à¸£à¸‡à¹€à¸£à¸µà¸¢à¸™à¸ªà¸­à¸™à¸ à¸²à¸©à¸² à¸­à¹Šà¸­à¸à¸‹à¹Œà¸Ÿà¸­à¸£à¹Œà¸”</div>
              </div>

              <table className="w-full text-[13px] relative z-10 border-collapse shrink-0">
                <thead>
                  <tr className="text-white tracking-widest transition-colors duration-500" style={{ backgroundColor: themeColor }}>
                    <th className={`${isSpelling ? 'py-1 text-[10px]' : 'py-2.5'} px-4 text-left font-bold w-1/2 uppercase`}>Course Name</th>
                    <th className={`${isSpelling ? 'py-1 text-[10px]' : 'py-2.5'} px-4 text-center font-bold w-[15%] uppercase`}>Course Code</th>
                    <th className={`${isSpelling ? 'py-1 text-[10px]' : 'py-2.5'} px-4 text-center font-bold w-[15%] uppercase`}>Grade</th>
                    <th className={`${isSpelling ? 'py-1 text-[10px]' : 'py-2.5'} px-4 text-center font-bold w-[20%] uppercase`}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {(data?.grades || []).map((item, index) => (
                    <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#eef1f6]'}>
                      <td className={`${isSpelling ? 'py-0.5 text-[10px]' : 'py-3'} px-4 text-left text-gray-700 whitespace-pre-line leading-tight font-medium`}>{item.courseName}</td>
                      <td className={`${isSpelling ? 'py-0.5 text-[10px]' : 'py-3'} px-4 text-center text-[#213568] font-bold tracking-wider`}>{item.courseCode}</td>
                      <td className={`${isSpelling ? 'py-0.5 text-[11px]' : 'py-3 text-base'} px-4 text-center text-[#213568] font-bold`}>{item.grade}</td>
                      <td className={`${isSpelling ? 'py-0.5 text-[10px]' : 'py-3'} px-4 text-center text-gray-600`}>{item.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isSpelling && data?.spellingScores ? (
              <div className="flex gap-4 relative z-10 mb-1 flex-1">
                {[0, 1].map(colIndex => (
                  <div key={colIndex} className="flex-1">
                    <table className="w-full text-[9px] sm:text-[10px] border-collapse border border-gray-200 bg-white shadow-sm">
                      <thead>
                        <tr className="text-white tracking-wider transition-colors duration-500" style={{ backgroundColor: themeColor }}>
                          <th className="py-[3px] px-1 text-center border-r border-white/20 leading-none">Week</th>
                          <th className="py-[3px] px-1 text-center border-r border-white/20 leading-none">Words Score</th>
                          <th className="py-[3px] px-1 text-center leading-none">Dictation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(data?.spellingScores || []).slice(colIndex * 15, (colIndex + 1) * 15).map((score, index) => (
                          <tr key={score.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-[#eef1f6]'}>
                            <td className="py-[3px] px-1 text-center border-r border-gray-200 text-gray-700 font-medium leading-none h-[18px]">{score.week}</td>
                            <td className="py-[3px] px-1 text-center border-r border-gray-200 text-[#213568] font-bold leading-none h-[18px]">
                              {score.wordsScore !== '' ? `${score.wordsScore} / ${score.maxWords}` : '-'}
                            </td>
                            <td className="py-[3px] px-1 text-center text-[#213568] font-bold leading-none h-[18px]">
                              {score.dictationScore !== '' ? `${score.dictationScore} / ${score.maxDictation}` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>
            ) : null}

            <div className="mt-auto relative z-10 shrink-0 border border-gray-200 bg-white">
              <div className={`text-white font-bold ${isSpelling ? 'py-1.5 px-3 text-xs' : 'py-2 px-4 text-sm'} uppercase tracking-widest w-full transition-colors duration-500`} style={{ backgroundColor: themeColor }}>Grade Scale</div>
              <div className={`flex justify-between items-center ${isSpelling ? 'p-2.5' : 'p-4'}`}>
                <div className={`flex gap-10 text-[#475569] ${isSpelling ? 'text-[11px]' : 'text-sm'} font-bold tracking-wide`}>
                  <div className="flex flex-col gap-1">{GRADE_SCALE_LEFT.map(scale => <div key={scale}>{scale}</div>)}</div>
                  <div className="flex flex-col gap-1">{GRADE_SCALE_RIGHT.map(scale => <div key={scale}>{scale}</div>)}</div>
                </div>
                <div className="flex flex-col items-end print:opacity-100">
                  <LogoUploader image={data?.logo} width={isSpelling ? 140 : 160} onUpload={canEdit ? onLogoUpload : null} placeholderText="Click to upload Logo" themeColor={themeColor} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* PAGE 2: COMMENTS (LOCKED TO A4 PORTRAIT) */}
        <div className="report-page print-full-height w-[794px] h-[1123px] shrink-0 bg-white shadow-2xl overflow-hidden flex flex-col relative p-12 print:shadow-none">
          <h2 className="text-2xl font-extrabold text-[#213568] mb-6 uppercase tracking-wider">Comments</h2>
          <div className="border-[6px] p-10 flex flex-col flex-1 transition-colors duration-500 bg-white" style={{ borderColor: themeColor }}>
            <h3 className="text-xl font-bold text-[#213568] mb-6">{data?.commentsHeading || 'Comments'}</h3>
            <ul className="list-disc pl-6 space-y-4 text-gray-800 text-[15px] leading-relaxed mb-16">
              <li><strong className="text-[#213568]">What your child will learn:</strong> {data?.commentsLearn || '-'}</li>
              <li><strong className="text-[#213568]">Progress to expect:</strong> {data?.commentsProgress || '-'}</li>
              <li><strong className="text-[#213568]">What they cannot do yet:</strong> {data?.commentsCannotDo || '-'}</li>
            </ul>
            <div className="mt-auto self-end flex flex-col items-center text-[#475569]">
              <LogoUploader image={data?.signatureImage} width={160} onUpload={canEdit ? onSignatureUpload : null} placeholderText="Upload Signature" themeColor={themeColor} />
              <div className="mt-3 text-[15px] text-black font-medium">{data?.evaluatorName || '-'}</div>
              <div className="text-[15px] text-gray-600">{data?.evaluatorTitle || '-'}</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function AddUserForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('teacher');

  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit({ name, username, password, role }); }} className="p-6">
      <h3 className="text-xl font-bold mb-6 text-gray-900">Add New User</h3>
      <div className="space-y-4 mb-8">
        <div><label className="block text-sm font-bold mb-1 text-gray-700">Full Name</label><input required value={name} onChange={e=>setName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /></div>
        <div>
           <label className="block text-sm font-bold mb-1 text-gray-700">Role</label>
           <select value={role} onChange={e=>setRole(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 bg-white font-medium text-gray-800 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 cursor-pointer">
             <option value="student">Student</option>
             <option value="teacher">Teacher</option>
             <option value="superadmin">Super Admin</option>
           </select>
        </div>
        <div><label className="block text-sm font-bold mb-1 text-gray-700">Login ID / Username</label><input required value={username} onChange={e=>setUsername(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /></div>
        <div><label className="block text-sm font-bold mb-1 text-gray-700">Password</label><input required value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" /></div>
      </div>
      <div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors rounded-lg font-bold">Cancel</button><button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-lg font-bold">Add User</button></div>
    </form>
  );
}

function AddStudentForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(name); }} className="p-6">
      <h3 className="text-xl font-bold mb-6 text-gray-900">Add New Student</h3>
      <div className="mb-8">
        <label className="block text-sm font-bold mb-1 text-gray-700">Full Name</label>
        <input required value={name} onChange={e=>setName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" autoFocus />
      </div>
      <div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="px-5 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors rounded-lg font-bold">Cancel</button><button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 transition-colors text-white rounded-lg font-bold">Create Student</button></div>
    </form>
  );
}

function AddPackageForm({ schedule, onSubmit, onCancel }) {
  const [packageStartDate, setPackageStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [packageEndDate, setPackageEndDate] = useState('');
  const [inputHourlyRate, setInputHourlyRate] = useState('');
  const [remark, setRemark] = useState('');
  
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getDurationHours = (start, end) => {
    if (!start || !end) return 0;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return Math.max(0, (eh + em / 60) - (sh + sm / 60));
  };

  const calc = React.useMemo(() => {
    let totalSessions = 0;
    let totalHours = 0;
    if (packageStartDate && packageEndDate && schedule && schedule.length > 0) {
        const start = new Date(packageStartDate);
        const end = new Date(packageEndDate);
        if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
            const scheduleMap = new Map(schedule.map(s => [s.dayOfWeek, getDurationHours(s.startTime, s.endTime)]));
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                const day = d.getDay();
                if (scheduleMap.has(day)) {
                    totalSessions++;
                    totalHours += scheduleMap.get(day);
                }
            }
        }
    }
    return { totalSessions, totalHours };
  }, [packageStartDate, packageEndDate, schedule]);

  return (
    <form onSubmit={e => { 
      e.preventDefault(); 
      onSubmit({ 
        startDate: formatDisplayDate(packageStartDate), 
        endDate: formatDisplayDate(packageEndDate), 
        packageStartDate,
        packageEndDate,
        hours: Number(calc.totalHours), 
        hourlyRate: Number(inputHourlyRate), 
        remark 
      }); 
    }} className="p-6">
      <h3 className="text-xl font-bold mb-2 flex items-center gap-2"><Award className="text-indigo-600" /> Add Course Package</h3>
      <p className="text-sm text-gray-500 mb-6">Add new package hours to the student's balance.</p>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold mb-1">Start Date</label>
          <input required type="date" value={packageStartDate} onChange={e=>setPackageStartDate(e.target.value)} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">End Date</label>
          <input required type="date" value={packageEndDate} onChange={e=>setPackageEndDate(e.target.value)} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-bold mb-1">Total Hours</label>
          <input readOnly type="number" value={calc.totalHours} className="w-full border rounded p-2 bg-gray-100 text-gray-700 cursor-not-allowed font-bold outline-none" placeholder="Auto-calculated" />
          {calc.totalSessions > 0 && (
            <p className="text-[11px] text-indigo-600 font-bold mt-1">({calc.totalSessions} sessions Ã— {Number((calc.totalHours / calc.totalSessions).toFixed(2))}h)</p>
          )}
          {calc.totalSessions === 0 && packageStartDate && packageEndDate && (
            <p className="text-[11px] text-amber-600 font-bold mt-1">No classes found in schedule</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-bold mb-1">Hourly Rate (THB)</label>
          <input required type="number" min="0" value={inputHourlyRate} onChange={e=>setInputHourlyRate(e.target.value)} className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. 500" />
        </div>
      </div>
      <div className="mb-8">
        <label className="block text-sm font-bold mb-1">Remark / Invoice # (Optional)</label>
        <input type="text" value={remark} onChange={e=>setRemark(e.target.value)} className="w-full border rounded p-2 focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Paid via transfer" />
      </div>
      <div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="px-5 py-2.5 bg-gray-100 rounded text-sm font-bold">Cancel</button><button type="submit" disabled={calc.totalHours <= 0} className="px-5 py-2.5 bg-indigo-600 disabled:bg-indigo-300 text-white rounded text-sm font-bold shadow-sm">Add Hours</button></div>
    </form>
  );
}

function EditRecordForm({ record, onSubmit, onCancel }) {
  const [date, setDate] = useState(record.startDate || record.date || '');
  const [endDate, setEndDate] = useState(record.endDate || '');
  const [status, setStatus] = useState(record.status || 'present');
  const [compensationType, setCompensationType] = useState(record.compensationType || 'discount');
  
  const initialH = Math.floor(record.hours || 0);
  const initialM = Math.round(((record.hours || 0) - initialH) * 60);
  const [inputHours, setInputHours] = useState(initialH);
  const [inputMinutes, setInputMinutes] = useState(initialM.toString());
  
  const [remark, setRemark] = useState(record.remark || '');

  return (
    <form onSubmit={e => { 
      e.preventDefault(); 
      const totalHours = Number(inputHours) + (Number(inputMinutes) / 60);
      onSubmit({ ...record, date, startDate: date, endDate, status, hours: totalHours, remark, compensationType: status === 'teacher_absent' ? compensationType : null }); 
    }} className="p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Record</h3>
      <div className="space-y-4 mb-6">
        {status === 'added_package' ? (
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-bold mb-1">Start Date</label><input type="date" required value={date} onChange={e=>setDate(e.target.value)} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
            <div><label className="block text-xs font-bold mb-1">End Date</label><input type="date" required value={endDate} onChange={e=>setEndDate(e.target.value)} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          </div>
        ) : (
          <div><label className="block text-xs font-bold mb-1">Date</label><input type="date" required value={date} onChange={e=>setDate(e.target.value)} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
        )}
        
        <div><label className="block text-xs font-bold mb-1">Status</label>
          <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
            <option value="present">Present (Deduct Hrs)</option>
            <option value="makeup">Make-up Class (Deduct Hrs)</option>
            <option value="student_absent">Student Absent (Keep Hrs)</option>
            <option value="teacher_absent">Teacher Absent (Owe Discount/Makeup)</option>
            <option value="absent">Absent (Legacy)</option>
            <option value="added_package">Added Package / Renewal</option>
          </select>
        </div>
        {status === 'teacher_absent' && (
          <div><label className="block text-xs font-bold mb-1">Compensation</label>
            <select value={compensationType} onChange={e=>setCompensationType(e.target.value)} className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="discount">Owed Discount</option>
              <option value="makeup">Make-up Class</option>
            </select>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div><label className="block text-xs font-bold mb-1">Hours</label><input type="number" min="0" value={inputHours} onChange={e=>setInputHours(e.target.value)} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
          <div><label className="block text-xs font-bold mb-1">Minutes</label>
            <select value={inputMinutes} onChange={e=>setInputMinutes(e.target.value)} className="w-full border rounded p-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 outline-none">
              <option value="0">00 mins</option>
              <option value="15">15 mins</option>
              <option value="30">30 mins</option>
              <option value="45">45 mins</option>
            </select>
          </div>
        </div>
        <div><label className="block text-xs font-bold mb-1">Remark</label><input type="text" value={remark} onChange={e=>setRemark(e.target.value)} className="w-full border rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
      </div>
      <div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="px-5 py-2 bg-gray-100 rounded font-bold">Cancel</button><button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded font-bold shadow-sm">Save Changes</button></div>
    </form>
  );
}

function DeleteRecordPrompt({ onSubmit, onCancel }) {
  const [reason, setReason] = useState('');
  return (
    <form onSubmit={e => { e.preventDefault(); onSubmit(reason); }} className="p-6">
      <h3 className="text-xl font-bold text-red-600 mb-4 flex items-center gap-2">
        <Trash2 size={24} /> Delete Record
      </h3>
      <p className="text-sm text-gray-600 mb-4">Please provide a reason for deleting this record. It will be kept in the history as a voided item.</p>
      <textarea required value={reason} onChange={e=>setReason(e.target.value)} className="w-full border p-3 rounded-lg mb-6 outline-none focus:ring-2 focus:ring-red-500" rows="3" placeholder="Reason for deletion..."></textarea>
      <div className="flex justify-end gap-3"><button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-100 rounded font-bold">Cancel</button><button type="submit" className="px-4 py-2 bg-red-600 text-white rounded font-bold shadow-sm">Confirm Deletion</button></div>
    </form>
  );
}

function ModalManager({ modalState, closeModal }) {
  if (!modalState.isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 print:hidden">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden max-h-[90vh] overflow-y-auto">
        {modalState.type === 'ALERT' && (
          <div className="p-6 text-center">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modalState.data.title}</h3>
            <p className="text-gray-600 mb-6">{modalState.data.message}</p>
            <button onClick={closeModal} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">OK</button>
          </div>
        )}
        {modalState.type === 'CONFIRM' && (
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{modalState.data.title}</h3>
            <p className="text-gray-600 mb-6 leading-relaxed">{modalState.data.message}</p>
            <div className="flex justify-end gap-3">
              <button onClick={closeModal} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-colors">Cancel</button>
              <button onClick={() => { modalState.data.onConfirm(); closeModal(); }} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">Confirm</button>
            </div>
          </div>
        )}
        {modalState.type === 'ADD_STUDENT' && (
          <AddStudentForm onSubmit={(name) => { modalState.data.onSubmit(name); closeModal(); }} onCancel={closeModal} />
        )}
        {modalState.type === 'ADD_USER' && (
          <AddUserForm onSubmit={(data) => { modalState.data.onSubmit(data); closeModal(); }} onCancel={closeModal} />
        )}
        {modalState.type === 'ADD_PACKAGE' && (
          <AddPackageForm schedule={modalState.data.schedule} onSubmit={(data) => { modalState.data.onSubmit(data); closeModal(); }} onCancel={closeModal} />
        )}
        {modalState.type === 'EDIT_RECORD' && (
          <EditRecordForm record={modalState.data.record} onSubmit={(data) => { modalState.data.onSubmit(data); closeModal(); }} onCancel={closeModal} />
        )}
        {modalState.type === 'DELETE_RECORD' && (
          <DeleteRecordPrompt onSubmit={(reason) => { modalState.data.onSubmit(reason); closeModal(); }} onCancel={closeModal} />
        )}
      </div>
    </div>
  );
}

function CertificateView() {
  return (
    <div className="p-8 text-center text-gray-500 bg-white rounded-xl shadow-sm border border-gray-200 w-full max-w-4xl mx-auto mt-8">
      Certificate viewing is temporarily disabled.
    </div>
  );
}

function AdvancedCourseSummaryReport({ student, onClose }) {
  const [selectedPackageId, setSelectedPackageId] = useState('');
  
  // Extract packages from attendance history
  const packages = (student?.attendance || []).filter(r => r.status === 'added_package' || r.status === 'renewal');
  
  useEffect(() => {
    if (!selectedPackageId && packages.length > 0) {
      setSelectedPackageId(packages[0].id);
    }
  }, [packages, selectedPackageId]);

  const activePackage = packages.find(p => p.id === selectedPackageId) || packages[0];
  const startDateStr = activePackage?.packageStartDate || activePackage?.startDate || activePackage?.date;
  const endDateStr = activePackage?.packageEndDate || activePackage?.endDate;
  const schedule = student?.structuredSchedule || [];

  // Formatting helpers
  const formatDisplayDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatScheduleLine = (schedArr) => {
    if (!schedArr || schedArr.length === 0) return 'No schedule set';
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const sorted = [...schedArr].sort((a,b) => (a.dayOfWeek === 0 ? 7 : a.dayOfWeek) - (b.dayOfWeek === 0 ? 7 : b.dayOfWeek));
    return sorted.map(s => `${dayNames[s.dayOfWeek]} ${s.startTime}-${s.endTime}`).join(', ');
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate sessions based on date range and class schedule
  const sessions = React.useMemo(() => {
     if (!startDateStr || !endDateStr || schedule.length === 0) return [];
     const start = new Date(startDateStr);
     const end = new Date(endDateStr);
     const result = [];
     
     // Prevent invalid date loops
     if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];

     const scheduleMap = new Map(schedule.map(s => [s.dayOfWeek, s]));
     
     for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        if (scheduleMap.has(dayOfWeek)) {
           const sched = scheduleMap.get(dayOfWeek);
           result.push({
             dateObj: new Date(d),
             dateStr: d.toISOString().split('T')[0],
             dayName: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek],
             startTime: sched.startTime,
             endTime: sched.endTime
           });
        }
     }
     return result;
  }, [startDateStr, endDateStr, schedule]);

  // Overlay attendance records to determine actual status
  const attendanceMap = new Map();
  (student?.attendance || []).forEach(record => {
    if (record.status !== 'deleted' && record.status !== 'added_package' && record.status !== 'renewal') {
       if (!attendanceMap.has(record.date)) {
           attendanceMap.set(record.date, record);
       }
    }
  });

  const tableData = sessions.map(session => {
     const att = attendanceMap.get(session.dateStr);
     let status = 'Scheduled';
     
     if (att) {
        if (att.status === 'present') status = 'Present';
        else if (att.status === 'teacher_absent') status = 'Teacher Absent';
        else if (att.status === 'student_absent' || att.status === 'absent') status = 'Student Absent';
        else if (att.status === 'makeup') status = 'Make-up';
     } else {
        // Check if date has already passed
        if (session.dateObj < new Date(new Date().setHours(0,0,0,0))) {
            status = 'Pending / Missed';
        }
     }

     return { ...session, status };
  });

  return (
    <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 print:shadow-none print:border-none mb-12">
      <div className="p-8 print:p-0">
        {/* Action Bar (Hidden in Print) */}
        <div className="print:hidden mb-8 flex justify-between items-center border-b border-gray-100 pb-4">
           <div>
              <h2 className="text-2xl font-bold text-[#213568] flex items-center gap-2"><ClipboardList size={24} /> Advanced Course Summary</h2>
              <p className="text-gray-500 mt-1">Auto-generated schedule matched with attendance.</p>
           </div>
           <div className="flex gap-3">
              <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                <ArrowLeft size={18} /> Back
              </button>
              <button onClick={handlePrint} className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2">
                <FileText size={18} /> Print Report
              </button>
           </div>
        </div>

        {/* Package Selector (Hidden in Print) */}
        {packages.length > 1 && (
           <div className="mb-6 print:hidden bg-gray-50 p-4 rounded-xl border border-gray-200 flex items-center gap-3">
              <label className="text-sm font-bold text-gray-700">Select Package Period:</label>
              <select value={selectedPackageId} onChange={e => setSelectedPackageId(e.target.value)} className="border border-gray-300 rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-50 bg-white font-medium">
                 {packages.map(p => (
                    <option key={p.id} value={p.id}>
                       {formatDisplayDate(p.packageStartDate || p.startDate || p.date)} - {formatDisplayDate(p.packageEndDate || p.endDate)} ({p.hours} Hrs)
                    </option>
                 ))}
              </select>
           </div>
        )}

        {/* Printable A4 Section */}
        <div className="print:block bg-white print:w-full">
           <div className="text-center border-b-2 border-[#213568] pb-6 mb-8">
              <h1 className="text-3xl font-extrabold uppercase tracking-widest text-[#213568]">Oxford School of Language</h1>
              <h2 className="text-xl font-bold text-gray-600 uppercase tracking-widest mt-2">Course Attendance Summary</h2>
           </div>

           <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-8 text-[15px]">
              <div className="flex items-center"><span className="font-bold text-gray-500 w-40 uppercase text-xs tracking-wider">Student Name</span> <span className="font-bold text-gray-900">{student?.name}</span></div>
              <div className="flex items-center"><span className="font-bold text-gray-500 w-40 uppercase text-xs tracking-wider">Total Sessions</span> <span className="font-bold text-gray-900">{sessions.length} Classes</span></div>
              <div className="flex items-center"><span className="font-bold text-gray-500 w-40 uppercase text-xs tracking-wider">Course Period</span> <span className="font-bold text-gray-900">{formatDisplayDate(startDateStr)} â€“ {formatDisplayDate(endDateStr)}</span></div>
              <div className="flex items-center"><span className="font-bold text-gray-500 w-40 uppercase text-xs tracking-wider">Class Schedule</span> <span className="font-bold text-gray-900">{formatScheduleLine(schedule)}</span></div>
           </div>

           {sessions.length > 0 ? (
             <table className="w-full text-[13px] sm:text-sm border-collapse">
                <thead>
                   <tr className="bg-gray-100 text-gray-600 print:bg-gray-200">
                      <th className="border border-gray-300 p-3 text-left font-bold uppercase tracking-wider">Date</th>
                      <th className="border border-gray-300 p-3 text-left font-bold uppercase tracking-wider">Day</th>
                      <th className="border border-gray-300 p-3 text-center font-bold uppercase tracking-wider min-w-[120px] whitespace-nowrap">Time</th>
                      <th className="border border-gray-300 p-3 text-center font-bold uppercase tracking-wider">Status</th>
                   </tr>
                </thead>
                <tbody>
                   {tableData.map((row, i) => {
                      let statusColor = 'text-gray-900';
                      if (row.status === 'Present') statusColor = 'text-green-700';
                      if (row.status === 'Teacher Absent') statusColor = 'text-amber-600';
                      if (row.status === 'Student Absent') statusColor = 'text-red-600';
                      if (row.status === 'Make-up') statusColor = 'text-blue-600';
                      if (row.status === 'Pending / Missed') statusColor = 'text-gray-400 italic';

                      return (
                        <tr key={i} className="hover:bg-gray-50 print:hover:bg-transparent">
                           <td className="border border-gray-300 p-3 font-medium text-gray-800">{formatDisplayDate(row.dateStr)}</td>
                           <td className="border border-gray-300 p-3 text-gray-700">{row.dayName}</td>
                           <td className="border border-gray-300 p-3 text-center text-gray-700 min-w-[120px] whitespace-nowrap">{row.startTime} â€“ {row.endTime}</td>
                           <td className={`border border-gray-300 p-3 text-center font-bold ${statusColor}`}>
                              {row.status}
                           </td>
                        </tr>
                      );
                   })}
                </tbody>
             </table>
           ) : (
             <div className="p-12 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                <p className="text-gray-500 font-medium">No valid package dates or schedule found. Ensure the student has an active package and a weekly schedule set.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}

function AttendanceSummaryReport({ student, onClose }) {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isGenerating, setIsGenerating] = useState(false);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getDayName = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  };

  const getScheduledTime = (dateString) => {
    if (!dateString || !student?.structuredSchedule) return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    const dayOfWeek = date.getDay();
    const sched = student.structuredSchedule.find(s => s.dayOfWeek === dayOfWeek);
    return sched ? `${sched.startTime} â€“ ${sched.endTime}` : '-';
  };

  const getStatusText = (status) => {
    if (status === 'present') return 'Present';
    if (status === 'student_absent' || status === 'absent') return 'Student Absent';
    if (status === 'teacher_absent') return 'Teacher Absent';
    if (status === 'makeup') return 'Make-up Class';
    if (status === 'scheduled') return 'Scheduled';
    return status;
  };

  const getStatusColor = (statusKey) => {
    if (statusKey === 'present') return 'text-green-600';
    if (statusKey === 'student_absent' || statusKey === 'absent') return 'text-red-500';
    if (statusKey === 'teacher_absent') return 'text-amber-600';
    if (statusKey === 'makeup') return 'text-blue-600';
    if (statusKey === 'scheduled') return 'text-gray-400 italic';
    return 'text-gray-700';
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate combined dynamic report data
  const reportData = React.useMemo(() => {
    const records = student?.attendance || [];
    const rawRecords = records.filter(r => {
      if (r.status === 'added_package' || r.status === 'renewal' || r.status === 'deleted') return false;
      if (startDate && r.date < startDate) return false;
      if (endDate && r.date > endDate) return false;
      return true;
    });

    const scheduleMap = new Map((student?.structuredSchedule || []).map(s => [s.dayOfWeek, s]));
    const mergedMap = new Map();

    // 1. Project scheduled dates
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime()) && start <= end) {
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          const dayOfWeek = d.getDay();
          if (scheduleMap.has(dayOfWeek)) {
            const sched = scheduleMap.get(dayOfWeek);
            mergedMap.set(dateStr, {
              id: `sched_${dateStr}`,
              dateStr: dateStr,
              dayName: getDayName(dateStr),
              time: `${sched.startTime} â€“ ${sched.endTime}`,
              status: 'Scheduled',
              statusKey: 'scheduled',
              record: null
            });
          }
        }
      }
    }

    // 2. Overlay actual attendance records
    rawRecords.forEach(r => {
      const existing = mergedMap.get(r.date);
      const timeStr = existing ? existing.time : (getScheduledTime(r.date) !== '-' ? getScheduledTime(r.date) : 'Ad-hoc / Extra');
      
      mergedMap.set(r.date, {
        id: r.id,
        dateStr: r.date,
        dayName: getDayName(r.date),
        time: timeStr,
        status: getStatusText(r.status),
        statusKey: r.status,
        record: r
      });
    });

    const finalList = Array.from(mergedMap.values()).sort((a, b) => new Date(a.dateStr) - new Date(b.dateStr));

    // 3. Calculate accurate statistics
    let presentCount = 0;
    let studentAbsentCount = 0;
    let teacherAbsentCount = 0;
    let makeupNeededCount = 0;
    let makeupCompletedCount = 0;

    rawRecords.forEach(r => {
      if (r.status === 'present') presentCount++;
      else if (r.status === 'student_absent' || r.status === 'absent') studentAbsentCount++;
      else if (r.status === 'teacher_absent') {
         teacherAbsentCount++;
         if (r.compensationType === 'makeup') makeupNeededCount++;
      }
      else if (r.status === 'makeup') makeupCompletedCount++;
    });

    const totalScheduled = finalList.length; 
    const makeupNeeded = makeupNeededCount; 
    const attendanceRate = totalScheduled > 0 ? ((presentCount / totalScheduled) * 100).toFixed(1) : 0;

    return { 
      finalList, 
      presentCount, 
      studentAbsentCount, 
      teacherAbsentCount, 
      makeupNeeded, 
      makeupCompletedCount, 
      totalScheduled, 
      attendanceRate 
    };
  }, [student, startDate, endDate]);

  const renderRemark = (row) => {
    if (!row.record) return '-';
    if (row.statusKey === 'makeup') {
       const text = row.record.remark || '[original date not specified]';
       if (text.toLowerCase().includes('make-up for')) return text;
       return `Make-up for: ${text}`;
    }
    return row.record.remark || '-';
  };

  const handleExportPDF = async () => {
    setIsGenerating(true);
    const originalScrollY = window.scrollY;
    window.scrollTo(0, 0);

    try {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');

      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();

      const container = document.getElementById('attendance-report-container');
      
      const noPdfElements = Array.from(container.querySelectorAll('.no-pdf'));
      noPdfElements.forEach(el => el.classList.add('hidden'));

      const canvas = await window.html2canvas(container, { 
        scale: 2, 
        useCORS: true, 
        backgroundColor: '#ffffff',
        scrollY: 0
      });
      
      noPdfElements.forEach(el => el.classList.remove('hidden'));

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Attendance_Summary_${student?.name?.replace(/[^a-z0-9]/gi, '_') || 'Report'}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Failed to generate PDF. Check console for details.");
    } finally {
      window.scrollTo(0, originalScrollY);
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200 print:shadow-none print:border-none mb-12">
      <div className="p-8 print:p-0">
        
        {/* Action Bar (Hidden in Print/PDF) */}
        <div className="print:hidden no-pdf mb-8 flex justify-between items-center border-b border-gray-100 pb-4">
           <div>
              <h2 className="text-2xl font-bold text-[#213568] flex items-center gap-2"><Activity size={24} /> Attendance Summary</h2>
              <p className="text-gray-500 mt-1">Generate a summary report for a selected date range.</p>
           </div>
           <div className="flex gap-3">
              <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center gap-2">
                <ArrowLeft size={18} /> Back
              </button>
           </div>
        </div>

        {/* Date Filters (Hidden in Print/PDF) */}
        <div className="mb-8 print:hidden no-pdf bg-gray-50 p-5 rounded-xl border border-gray-200 flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-50 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1">End Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-50 bg-white" />
            </div>
            <div className="flex-1 flex justify-end gap-3">
                <button onClick={handlePrint} className="px-5 py-2.5 bg-white border-2 border-indigo-600 text-indigo-700 rounded-lg font-bold hover:bg-indigo-50 transition-colors shadow-sm flex items-center gap-2">
                  Print Report
                </button>
                <button onClick={handleExportPDF} disabled={isGenerating} className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors shadow-md flex items-center gap-2">
                  {isGenerating ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : <FileText size={18} />}
                  {isGenerating ? 'Generating...' : 'Export PDF'}
                </button>
            </div>
        </div>

        {/* Printable Report Container */}
        <div id="attendance-report-container" className="bg-white print:w-full">
           <div className="text-center border-b-2 border-[#213568] pb-6 mb-8">
              <h1 className="text-3xl font-extrabold uppercase tracking-widest text-[#213568]">Oxford School of Language</h1>
              <h2 className="text-xl font-bold text-gray-600 uppercase tracking-widest mt-2">Attendance Summary Report</h2>
           </div>

           <div className="grid grid-cols-2 gap-y-4 gap-x-8 mb-10 text-[15px]">
              <div className="flex items-center"><span className="font-bold text-gray-500 w-40 uppercase text-xs tracking-wider">Student Name</span> <span className="font-bold text-gray-900">{student?.name}</span></div>
              <div className="flex items-center"><span className="font-bold text-gray-500 w-40 uppercase text-xs tracking-wider">Date Range</span> <span className="font-bold text-gray-900">{formatDisplayDate(startDate)} â€“ {formatDisplayDate(endDate)}</span></div>
              <div className="flex items-center"><span className="font-bold text-gray-500 w-40 uppercase text-xs tracking-wider">Report Generated</span> <span className="font-bold text-gray-900">{formatDisplayDate(new Date().toISOString())}</span></div>
           </div>

           <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Statistics Summary</h3>
           <div className="overflow-hidden rounded-xl border border-gray-300 mb-10">
             <table className="w-full text-sm text-left">
                <tbody className="divide-y divide-gray-200">
                   <tr className="bg-gray-50">
                      <td className="p-4 font-bold text-gray-700 w-1/2">Total Scheduled Classes</td>
                      <td className="p-4 font-extrabold text-indigo-700">{reportData.totalScheduled}</td>
                   </tr>
                   <tr className="bg-white">
                      <td className="p-4 font-bold text-gray-700">Present Count</td>
                      <td className="p-4 font-extrabold text-green-600">{reportData.presentCount}</td>
                   </tr>
                   <tr className="bg-gray-50">
                      <td className="p-4 font-bold text-gray-700">Student Absent Count</td>
                      <td className="p-4 font-extrabold text-red-500">{reportData.studentAbsentCount}</td>
                   </tr>
                   <tr className="bg-white">
                      <td className="p-4 font-bold text-gray-700">Teacher Absent Count</td>
                      <td className="p-4 font-extrabold text-amber-600">{reportData.teacherAbsentCount}</td>
                   </tr>
                   <tr className="bg-gray-50">
                      <td className="p-4 font-bold text-gray-700">Make-up Classes Needed</td>
                      <td className="p-4 font-extrabold text-orange-600">{reportData.makeupNeeded}</td>
                   </tr>
                   <tr className="bg-white">
                      <td className="p-4 font-bold text-gray-700">Make-up Completed</td>
                      <td className="p-4 font-extrabold text-blue-600">{reportData.makeupCompletedCount}</td>
                   </tr>
                   <tr className="bg-indigo-50 border-t-2 border-indigo-200">
                      <td className="p-4 font-extrabold text-[#213568] uppercase tracking-wider text-xs">Overall Attendance Rate</td>
                      <td className="p-4 font-extrabold text-indigo-700 text-lg">{reportData.attendanceRate}%</td>
                   </tr>
                </tbody>
             </table>
           </div>

           <h3 className="text-lg font-bold text-gray-800 mb-4 border-b border-gray-200 pb-2">Detailed Attendance Records</h3>
           {reportData.finalList.length > 0 ? (
             <div className="overflow-hidden rounded-xl border border-gray-300 mb-8">
               <table className="w-full text-[13px] sm:text-sm text-left border-collapse">
                 <thead className="bg-gray-100 text-gray-600 print:bg-gray-200 border-b border-gray-300">
                   <tr>
                     <th className="p-3 font-bold uppercase tracking-wider border-r border-gray-300 w-28">Date</th>
                     <th className="p-3 font-bold uppercase tracking-wider border-r border-gray-300 w-28">Day</th>
                     <th className="p-3 font-bold uppercase tracking-wider border-r border-gray-300 text-center min-w-[120px] whitespace-nowrap">Time</th>
                     <th className="p-3 font-bold uppercase tracking-wider border-r border-gray-300 w-36">Status</th>
                     <th className="p-3 font-bold uppercase tracking-wider">Remark</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-200">
                   {reportData.finalList.map((row, idx) => (
                     <tr key={row.id || idx} className="bg-white hover:bg-gray-50 print:hover:bg-transparent">
                       <td className="p-3 border-r border-gray-200 font-medium text-gray-800">{formatDisplayDate(row.dateStr)}</td>
                       <td className="p-3 border-r border-gray-200 text-gray-700">{row.dayName}</td>
                       <td className="p-3 border-r border-gray-200 text-center text-gray-700 min-w-[120px] whitespace-nowrap">{row.time}</td>
                       <td className={`p-3 border-r border-gray-200 font-bold ${getStatusColor(row.statusKey)}`}>{row.status}</td>
                       <td className="p-3 text-gray-600 text-xs sm:text-sm">{renderRemark(row)}</td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           ) : (
             <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-xl bg-gray-50 mb-8">
               No classes or attendance records found for this period.
             </div>
           )}

           <div className="mt-12 text-center text-sm text-gray-500">
             <p>This document is an officially generated record from The Oxford School of Language.</p>
           </div>
        </div>

      </div>
    </div>
  );
}

function App() {
  const [db, setDb] = useState({
    adminCalendarUrl: '',
    certificateTemplate: null,
    certificateSettings: defaultCertSettings,
    events: [],
    users: [],
    students: []
  });
  
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [isDbLoaded, setIsDbLoaded] = useState(false);

  // --- ENTER KEY GLOBAL HANDLER ---
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (e.key === 'Enter') {
        // Prevent triggering if typing in a multi-line textarea or rich text editor
        if (e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
          return;
        }
        
        // Find the active primary button in the DOM
        const primaryBtn = document.querySelector('.primary-action');
        
        if (primaryBtn && !primaryBtn.disabled) {
          e.preventDefault(); // Prevent standard form submission refresh
          primaryBtn.click();
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // 1. Authenticate with Firebase
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (error) {
        console.error('Auth error:', error);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Setup Real-time Data Sync
  useEffect(() => {
    if (!firebaseUser) return;

    let isSeeding = false;

    const seedDbIfNeeded = async () => {
      if (isSeeding) return;
      isSeeding = true;
      try {
        const snap = await getDoc(getPublicDoc('settings', 'global'));
        if (!snap.exists()) {
          console.log("Empty Cloud DB detected. Seeding initial data...");
          const initDb = getInitialDb();
          const batch = writeBatch(firestoreDb);
          
          batch.set(getPublicDoc('settings', 'global'), {
            adminCalendarUrl: initDb.adminCalendarUrl,
            certificateTemplate: initDb.certificateTemplate,
            certificateSettings: initDb.certificateSettings
          });
          
          initDb.users.forEach(u => batch.set(getPublicDoc('users', u.id), u));
          initDb.students.forEach(s => batch.set(getPublicDoc('students', s.id), s));
          initDb.events.forEach(e => batch.set(getPublicDoc('events', e.id), e));
          
          await batch.commit();
        }
        setIsDbLoaded(true);
      } catch (error) {
        console.error("Seeding error:", error);
        setIsDbLoaded(true);
      }
    };
    
    seedDbIfNeeded();

    const unsubUsers = onSnapshot(getPublicCollection('users'), (snapshot) => {
      setDb(prev => ({ ...prev, users: snapshot.docs.map(d => d.data()) }));
    }, console.error);

    const unsubStudents = onSnapshot(getPublicCollection('students'), (snapshot) => {
      setDb(prev => ({ ...prev, students: snapshot.docs.map(d => d.data()) }));
    }, console.error);

    const unsubEvents = onSnapshot(getPublicCollection('events'), (snapshot) => {
      setDb(prev => ({ ...prev, events: snapshot.docs.map(d => d.data()) }));
    }, console.error);

    const unsubSettings = onSnapshot(getPublicDoc('settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setDb(prev => ({ 
          ...prev, 
          adminCalendarUrl: data.adminCalendarUrl || '',
          certificateTemplate: data.certificateTemplate || null,
          certificateSettings: data.certificateSettings || defaultCertSettings
        }));
      }
    }, console.error);

    return () => {
      unsubUsers();
      unsubStudents();
      unsubEvents();
      unsubSettings();
    };
  }, [firebaseUser]);

  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [adminTab, setAdminTab] = useState('students');
  const [teacherTab, setTeacherTab] = useState('students'); 
  const [calendarInputUrl, setCalendarInputUrl] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [currentStudentId, setCurrentStudentId] = useState(null);
  const [currentReportId, setCurrentReportId] = useState(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [calendarTeacherFilter, setCalendarTeacherFilter] = useState('all');
  
  const [draftReport, setDraftReport] = useState(null); // Shared state for editor and preview
  
  const [modalState, setModalState] = useState({ isOpen: false, type: '', data: {} });
  const showModal = (type, data) => setModalState({ isOpen: true, type, data });
  const closeModal = () => setModalState({ isOpen: false, type: '', data: {} });

  useEffect(() => {
    if (currentUser) {
      const updatedUser = db.users.find(u => u.id === currentUser.id);
      if (updatedUser) setCurrentUser(updatedUser);
    }
  }, [db.users]);

  // Clear draft report memory if navigating away from the report tools
  useEffect(() => {
    if (currentView !== 'edit_report' && currentView !== 'final_report') {
      setDraftReport(null);
    }
  }, [currentView]);

  if (!isDbLoaded) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6">
        <Cloud size={48} className="text-indigo-500 mb-4 animate-pulse" />
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <h2 className="text-xl font-bold text-gray-800">Connecting to Secure Cloud Storage...</h2>
        <p className="text-gray-500 mt-2">Loading data, please wait.</p>
      </div>
    );
  }

  const handleLogin = (e) => {
    e.preventDefault();
    const { username, password } = loginForm;
    
    // Check Admin / Teacher
    const user = db.users.find(u => u.username === username && u.password === password);
    if (user) {
      setCurrentUser(user);
      if (user.role === 'superadmin') {
         setCalendarInputUrl(db.adminCalendarUrl || '');
      }
      setCurrentView('dashboard');
      return;
    }
    
    // Check Student
    const student = db.students.find(s => s.username === username && s.password === password);
    if (student) {
      setCurrentUser({ ...student, role: 'student' });
      setCurrentStudentId(student.id);
      setCurrentView('dashboard');
      return;
    }
    
    showModal('ALERT', { title: 'Login Failed', message: 'Invalid username or password!' });
  };

  const handleUpdateStudentInfo = (studentId, newData) => {
    updateDoc(getPublicDoc('students', studentId), newData).catch(console.error);
  };

  const handleUpdateUserSettings = (userId, { permissions, calendarUrl }) => {
    let finalUrl = calendarUrl;
    if (finalUrl) {
      const match = finalUrl.match(/src="([^"]+)"/);
      if (match) finalUrl = match[1];
    }
    updateDoc(getPublicDoc('users', userId), { permissions, calendarUrl: finalUrl }).then(() => {
      showModal('ALERT', { title: 'Settings Saved', message: 'User permissions and calendar have been updated successfully.' });
    }).catch(console.error);
  };

  const handleSaveAdminCalendarUrl = () => {
    let finalUrl = calendarInputUrl;
    const match = finalUrl.match(/src="([^"]+)"/);
    if (match) {
      finalUrl = match[1];
    }

    setDoc(getPublicDoc('settings', 'global'), { adminCalendarUrl: finalUrl }, { merge: true }).then(() => {
      setCalendarInputUrl(finalUrl);
      showModal('ALERT', { title: 'Calendar Linked', message: 'The School Master Calendar has been successfully linked to the Cloud!' });
    }).catch(console.error);
  };

  const updateReportData = (studentId, reportId, newData) => {
    const student = db.students.find(s => s.id === studentId);
    if (!student) return;
    const updatedReports = student.reports.map(r => r.id === reportId ? { ...r, data: newData } : r);
    updateDoc(getPublicDoc('students', studentId), { reports: updatedReports }).catch(console.error);
  };

  const toggleReportStatus = (studentId, reportId, newStatus) => {
    const student = db.students.find(s => s.id === studentId);
    if (!student) return;
    const updatedReports = student.reports.map(r => r.id === reportId ? { ...r, status: newStatus } : r);
    updateDoc(getPublicDoc('students', studentId), { reports: updatedReports }).catch(console.error);
  };

  const deleteReport = (studentId, reportId) => {
    const student = db.students.find(s => s.id === studentId);
    if (!student) return;
    updateDoc(getPublicDoc('students', studentId), { reports: student.reports.filter(r => r.id !== reportId) }).catch(console.error);
  };

  const createNewReport = (studentId, courseType = 'PHONICS') => {
    const student = db.students.find(s => s.id === studentId);
    if (!student) return;
    let nextLevel = 1;
    
    if (student.reports && student.reports.length > 0) {
      const sameCourseReports = student.reports.filter(r => (r.data.schoolCourse || '').toUpperCase() === courseType);
      if (sameCourseReports.length > 0) {
         const highestLevel = Math.max(...sameCourseReports.map(r => parseInt(r.data.level) || 0));
         nextLevel = Math.min(highestLevel + 1, 5);
      }
    }

    let latestProfileImage = student.profileImage || null;
    let latestLogo = null;
    let latestSignature = null;
    
    if (student.reports && student.reports.length > 0) {
      const lastReport = student.reports[student.reports.length - 1];
      latestProfileImage = latestProfileImage || lastReport.data.profileImage;
      latestLogo = lastReport.data.logo;
      latestSignature = lastReport.data.signatureImage;
    }

    const newReport = {
      id: `r${Date.now()}`,
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      data: { 
        ...generateInitialReportData(student.name, courseType, nextLevel.toString()),
        profileImage: latestProfileImage,
        logo: latestLogo,
        signatureImage: latestSignature
      }
    };

    updateDoc(getPublicDoc('students', studentId), { reports: [...(student.reports || []), newReport] }).catch(console.error);
  };

  const assignStudentToTeacher = (studentId, teacherId) => {
    updateDoc(getPublicDoc('students', studentId), { teacherId }).catch(console.error);
  };

  const handleRequestCertificate = (studentId) => {
    showModal('CONFIRM', {
      title: 'Request Certificate',
      message: 'Are you sure you want to request a completion certificate for this student? The Admin will review the request.',
      onConfirm: () => {
        updateDoc(getPublicDoc('students', studentId), { 
          certificateStatus: 'requested',
          certificateRequestDate: new Date().toISOString().split('T')[0]
        }).then(() => {
          showModal('ALERT', { title: 'Requested', message: 'Certificate request sent to Admin!' });
        }).catch(console.error);
      }
    });
  };

  const handleApproveCertificate = (studentId) => {
    const d = new Date();
    const formattedDate = d.toLocaleDateString('en-US', { month: 'long', day: '2-digit', year: 'numeric' });
    const year = d.getFullYear();
    
    const currentYearCerts = db.students.filter(s => s.certificateCode && s.certificateCode.includes(`-${year}-`));
    const numbers = currentYearCerts.map(s => {
      const parts = s.certificateCode.split('-');
      return parseInt(parts[parts.length - 1], 10);
    }).filter(n => !isNaN(n));
    
    const nextNum = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    const xxx = String(nextNum).padStart(3, '0');
    const generatedCode = `OXSL-CM-PHO-${year}-${xxx}`;

    updateDoc(getPublicDoc('students', studentId), { 
      certificateStatus: 'approved',
      certificateDate: formattedDate,
      certificateCode: generatedCode
    }).then(() => {
      showModal('ALERT', { title: 'Approved', message: 'Certificate has been officially approved and saved to the Cloud.' });
    }).catch(console.error);
  };

  const handleRevokeCertificate = (studentId) => {
    showModal('CONFIRM', {
      title: 'Delete/Revoke Certificate',
      message: 'Are you sure you want to delete this certificate? This will reset the student so a new certificate can be requested.',
      onConfirm: () => {
        updateDoc(getPublicDoc('students', studentId), { 
          certificateStatus: 'none',
          certificateDate: null,
          certificateCode: null
        }).catch(console.error);
      }
    });
  };

  const handleCertTemplateUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDoc(getPublicDoc('settings', 'global'), { certificateTemplate: reader.result }, { merge: true }).catch(console.error);
      };
      reader.readAsDataURL(file);
    } else {
        setDoc(getPublicDoc('settings', 'global'), { certificateTemplate: null }, { merge: true }).catch(console.error);
    }
  };

  const handleUpdateCertSettings = (key, val) => {
    setDoc(getPublicDoc('settings', 'global'), { certificateSettings: { ...db.certificateSettings, [key]: val } }, { merge: true }).catch(console.error);
  };

  const openAddStudentModal = () => {
    showModal('ADD_STUDENT', {
      onSubmit: (newStudentName) => {
        const newStudent = {
          id: `s${Date.now()}`, teacherId: null, name: newStudentName, profileImage: null,
          tel: '', email: '', lineId: '', notes: '', schedule: '', status: 'active', registeredHours: 0, attendance: [], customInfo: [], lessonLogs: [],
          certificateStatus: 'none', certificateDate: null, certificateCode: null, reports: []
        };
        setDoc(getPublicDoc('students', newStudent.id), newStudent).catch(console.error);
      }
    });
  };

  const openAddUserModal = () => {
    showModal('ADD_USER', {
      onSubmit: ({ name, username, password, role }) => {
        const newUser = { 
          id: `u_${Date.now()}`, name, username, password, role, profileImage: null, calendarUrl: '',
          permissions: { canEditReports: true, canRequestCertificates: true, canEditStudentInfo: true, canManageAttendance: true, canViewPhone: false, canViewEmail: false, canViewLineId: false, canViewNotes: false, canViewPrivateCustomInfo: false }
        };
        setDoc(getPublicDoc('users', newUser.id), newUser).catch(console.error);
      }
    });
  };

  const confirmRemoveUser = (userId) => {
    const userToDelete = db.users.find(u => u.id === userId);
    if (!userToDelete) return;
    if (userToDelete.role === 'superadmin' && db.users.filter(u => u.role === 'superadmin').length <= 1) {
       showModal('ALERT', { title: 'Action Denied', message: 'You cannot delete the last Super Admin account.' });
       return;
    }
    if (userId === currentUser.id) {
       showModal('ALERT', { title: 'Action Denied', message: 'You cannot delete your own account while logged in.' });
       return;
    }
    showModal('CONFIRM', {
      title: 'Remove User',
      message: `Are you sure you want to remove ${userToDelete.name}? If they are a teacher, their students will become unassigned.`,
      onConfirm: async () => {
        try {
          const batch = writeBatch(firestoreDb);
          batch.delete(getPublicDoc('users', userId));
          db.students.filter(s => s.teacherId === userId).forEach(s => {
            batch.update(getPublicDoc('students', s.id), { teacherId: null });
          });
          await batch.commit();
        } catch (e) {
          console.error(e);
        }
      }
    });
  };

  const handleAdminPhotoUpload = (type, id, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'user') {
        updateDoc(getPublicDoc('users', id), { profileImage: reader.result }).catch(console.error);
      } else if (type === 'student') {
        const student = db.students.find(s => s.id === id);
        if(!student) return;
        const updatedReports = student.reports.map(r => ({ ...r, data: { ...r.data, profileImage: reader.result } }));
        updateDoc(getPublicDoc('students', id), { profileImage: reader.result, reports: updatedReports }).catch(console.error);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (field, e) => {
    const file = e.target.files[0];
    if (file && currentStudentId && currentReportId) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (field === 'profileImage') {
          const student = db.students.find(s => s.id === currentStudentId);
          if(!student) return;
          const updatedReports = student.reports.map(r => ({ ...r, data: { ...r.data, profileImage: reader.result } }));
          updateDoc(getPublicDoc('students', currentStudentId), { profileImage: reader.result, reports: updatedReports }).catch(console.error);
          
          if (draftReport) setDraftReport({ ...draftReport, profileImage: reader.result });
        } else {
          const student = db.students.find(s => s.id === currentStudentId);
          const report = student.reports.find(r => r.id === currentReportId);
          const baseData = draftReport || report.data;
          const updatedData = { ...baseData, [field]: reader.result };
          
          if (draftReport) setDraftReport(updatedData);
          updateReportData(currentStudentId, currentReportId, updatedData);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveProfileImage = () => {
    const student = db.students.find(s => s.id === currentStudentId);
    if(!student) return;
    const updatedReports = student.reports.map(r => ({ ...r, data: { ...r.data, profileImage: null } }));
    updateDoc(getPublicDoc('students', currentStudentId), { profileImage: null, reports: updatedReports }).catch(console.error);
    
    if (draftReport) setDraftReport({ ...draftReport, profileImage: null });
  };

  const adminFilteredCalEvents = calendarTeacherFilter === 'all' 
    ? db.events 
    : db.events.filter(e => e.type === 'global' || e.teacherId === calendarTeacherFilter);

  const adminFilteredCalStudents = calendarTeacherFilter === 'all'
    ? db.students
    : db.students.filter(s => s.teacherId === calendarTeacherFilter);

  return (
    <>
      <ModalManager modalState={modalState} closeModal={closeModal} />
      {!currentUser ? (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
            <div className="bg-[#213568] p-8 text-center">
              <GraduationCap size={48} className="mx-auto text-white mb-4" />
              <h1 className="text-2xl font-bold text-white tracking-widest uppercase">The Oxford School</h1>
              <p className="text-[#8eb3e6] mt-2 font-medium">Language Portal Login</p>
            </div>
            <div className="p-8">
              <form onSubmit={handleLogin} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Login ID / Username</label>
                  <div className="relative">
                    <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" required value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} className="w-full pl-10 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#f09e5e] focus:border-[#f09e5e] outline-none transition-all" placeholder="Enter ID" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Password</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full pl-10 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#f09e5e] focus:border-[#f09e5e] outline-none transition-all" placeholder="Enter Password" />
                  </div>
                </div>
                <button type="submit" className="w-full py-4 mt-2 bg-[#f09e5e] hover:bg-orange-500 text-white rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-md text-lg">Log In &rarr;</button>
              </form>
              <div className="mt-6 text-center text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-200 shadow-inner">
                <strong className="text-gray-700 mb-2 block uppercase tracking-wider text-xs">Registered Accounts:</strong>
                {db.users && db.users.filter(u => u.role === 'superadmin').slice(0, 1).map(admin => (
                  <div key={admin.id} className="flex justify-between items-center px-4 py-1">
                    <span>Admin ({admin.name}):</span>
                    <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 rounded">{admin.username} / {admin.password}</span>
                  </div>
                ))}
                {db.users && db.users.filter(u => u.role === 'teacher').slice(0, 1).map(teacher => (
                   <div key={teacher.id} className="flex justify-between items-center px-4 py-1">
                    <span>Teacher ({teacher.name}):</span>
                    <span className="font-mono text-orange-600 font-bold bg-orange-50 px-2 rounded">{teacher.username} / {teacher.password}</span>
                  </div>
                ))}
                {db.students && db.students.slice(0, 1).map(student => (
                   <div key={student.id} className="flex justify-between items-center px-4 py-1">
                    <span>Student ({student.name.split(' ')[0]}):</span>
                    <span className="font-mono text-blue-600 font-bold bg-blue-50 px-2 rounded">{student.username || 's1'} / {student.password || '123'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
          <div className="bg-white shadow-md p-4 flex justify-between items-center z-50 sticky top-0 print:hidden">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-[#213568] font-bold text-xl border-r-2 pr-6">
                <GraduationCap size={28} />
                <span className="hidden sm:inline">Oxford Portal</span>
              </div>
              
              {/* Admins & Teachers - Breadcrumbs */}
              {currentUser.role !== 'student' && (currentView === 'student_profile' || currentView === 'certificate_view' || currentView === 'advanced_summary' || currentView === 'attendance_summary') && (
                <button onClick={() => { setCurrentView('dashboard'); setCurrentStudentId(null); }} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-semibold bg-gray-50 px-3 py-1.5 rounded-md">
                  <ArrowLeft size={16} /> Back to Dashboard
                </button>
              )}

              {currentUser.role !== 'student' && (currentView === 'edit_report' || currentView === 'final_report') && currentStudentId && currentReportId && (
                <>
                  <button onClick={() => { setCurrentView('student_profile'); setCurrentReportId(null); }} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-semibold bg-gray-50 px-3 py-1.5 rounded-md">
                    <ArrowLeft size={16} /> Student History
                  </button>
                  <div className="flex bg-gray-100 rounded-lg p-1 ml-2 border border-gray-200">
                    <button onClick={() => setCurrentView('edit_report')} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm ${currentView === 'edit_report' ? 'bg-indigo-600 shadow-sm text-white font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>
                      <Settings size={16} /> Edit Report
                    </button>
                    <button onClick={() => setCurrentView('final_report')} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all text-sm ${currentView === 'final_report' ? 'bg-white shadow-sm text-indigo-700 font-semibold' : 'text-gray-600 hover:text-gray-900'}`}>
                      <FileText size={16} /> Final Preview
                    </button>
                  </div>
                </>
              )}

              {/* Students - Breadcrumbs */}
              {currentUser.role === 'student' && (currentView === 'final_report' || currentView === 'certificate_view') && (
                 <button onClick={() => { setCurrentView('dashboard'); setCurrentStudentId(currentUser.id); setCurrentReportId(null); }} className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-semibold bg-gray-50 px-3 py-1.5 rounded-md">
                   <ArrowLeft size={16} /> Back to My Portal
                 </button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-gray-800">{currentUser.name}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">{currentUser.role}</div>
              </div>
              <button onClick={() => { setCurrentUser(null); setCurrentStudentId(null); setCurrentReportId(null); setCurrentView('dashboard'); }} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Log Out"><LogOut size={20} /></button>
            </div>
          </div>

          <div className="flex-1 p-6 flex justify-center items-start overflow-y-auto">

            {/* STUDENT PORTAL DASHBOARD */}
            {currentUser.role === 'student' && currentView === 'dashboard' && (() => {
              const student = db.students.find(s => s.id === currentUser.id);
              if (!student) return null;

              const totalAttended = (student.attendance || []).reduce((sum, record) => (record.status === 'present' || record.status === 'makeup') ? sum + (record.hours || 0) : sum, 0);
              const addedPackageHours = (student.attendance || []).reduce((sum, record) => (record.status === 'added_package' || record.status === 'renewal') ? sum + (Number(record.hours) || 0) : sum, 0);
              const remainingHours = (student.registeredHours || 0) + addedPackageHours - totalAttended;

              return (
                <div className="w-full max-w-5xl">
                  {/* Welcome Header */}
                  <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-8 gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center shrink-0">
                         {student.profileImage ? <img src={student.profileImage} className="w-full h-full object-cover" alt="Student"/> : <UserCircle size={48} className="text-gray-300"/>}
                      </div>
                      <div>
                        <h2 className="text-3xl font-extrabold text-[#213568] flex items-center gap-3">
                          Welcome, {student.name.split(' ')[0]}!
                          {student.certificateStatus === 'approved' && <Award size={28} className="text-yellow-500 drop-shadow" title="Certified" />}
                        </h2>
                        <p className="text-gray-500 font-medium mt-1">My Student Portal</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     {/* Left Col: Hours & Info */}
                     <div className="lg:col-span-1 space-y-6">
                       <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                         <div className="bg-indigo-50 border-b border-indigo-100 p-4">
                           <h3 className="font-bold text-indigo-900 flex items-center gap-2"><ClipboardList size={18}/> My Hours Balance</h3>
                         </div>
                         <div className="p-5 flex flex-col gap-4">
                           <div className="flex justify-between items-center border-b pb-3">
                             <span className="text-sm font-semibold text-gray-600">Total Registered</span>
                             <span className="font-extrabold text-gray-800">{formatTime((student.registeredHours || 0) + addedPackageHours)}</span>
                           </div>
                           <div className="flex justify-between items-center border-b pb-3">
                             <span className="text-sm font-semibold text-gray-600">Hours Used</span>
                             <span className="font-extrabold text-indigo-600">{formatTime(totalAttended)}</span>
                           </div>
                           <div className="flex justify-between items-center">
                             <span className="text-sm font-semibold text-gray-600">Remaining</span>
                             <span className={`text-lg font-extrabold ${remainingHours > 0 ? 'text-green-600' : 'text-red-500'}`}>{formatTime(remainingHours)}</span>
                           </div>
                         </div>
                       </div>

                       {student.certificateStatus === 'approved' && (
                         <div className="bg-white rounded-xl shadow-sm border border-yellow-200 overflow-hidden text-center p-6 bg-gradient-to-b from-white to-yellow-50">
                            <Award size={40} className="mx-auto text-yellow-500 mb-3" />
                            <h3 className="font-bold text-yellow-900 mb-2">Official Certificate</h3>
                            <button onClick={() => { setCurrentStudentId(student.id); setCurrentView('certificate_view'); }} className="w-full border-2 border-yellow-500 text-yellow-700 bg-white font-bold py-2 rounded-lg hover:bg-yellow-50 transition-colors">
                              View Diploma
                            </button>
                         </div>
                       )}
                     </div>

                     {/* Right Col: Reports & Schedule */}
                     <div className="lg:col-span-2 space-y-8">
                       
                       <div>
                         <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText className="text-[#f09e5e]" size={24}/> My Report Cards</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {(student.reports || []).filter(r => r.status === 'completed').map(report => {
                             const themeColor = getThemeColor(report.data.schoolCourse, report.data.level);
                             return (
                                <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
                                  <div className="h-2 w-full" style={{ backgroundColor: themeColor }}></div>
                                  <div className="p-5 flex-1">
                                    <div className="text-xs font-bold text-gray-400 mb-1 tracking-wider uppercase">{report.data.schoolCourse}</div>
                                    <h4 className="text-lg font-extrabold text-gray-900 mb-3">Level {report.data.level}</h4>
                                    <div className="text-xs text-gray-500 mb-4">Date: <span className="font-semibold">{report.date}</span></div>
                                    <button onClick={() => { setCurrentStudentId(student.id); setCurrentReportId(report.id); setCurrentView('final_report'); }} className="w-full bg-gray-50 border border-gray-200 text-indigo-700 py-2 rounded-lg text-sm font-bold hover:bg-indigo-50 hover:border-indigo-200 transition-colors flex items-center justify-center gap-2"><FileText size={16} /> View Report</button>
                                  </div>
                                </div>
                             )
                           })}
                           {(student.reports || []).filter(r => r.status === 'completed').length === 0 && (
                             <div className="col-span-full py-8 text-center text-gray-400 italic bg-white rounded-xl border border-gray-200 shadow-sm">No completed reports available yet.</div>
                           )}
                         </div>
                       </div>

                       <div>
                         <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Calendar className="text-indigo-600" size={24}/> My Schedule</h3>
                         <div className="h-[500px]">
                           <NativeCalendar />
                         </div>
                       </div>
                     </div>
                  </div>
                </div>
              );
            })()}

            {/* SUPER ADMIN DASHBOARD */}
            {currentUser.role === 'superadmin' && currentView === 'dashboard' && (
              <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-200">
                <div className="bg-[#213568] p-6 text-white flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck size={24} /> Super Admin Dashboard</h2>
                    <p className="text-indigo-200 mt-1">Manage users, students, and certificates.</p>
                  </div>
                  <div className="flex gap-3">
                    {adminTab === 'students' ? (
                      <button onClick={openAddStudentModal} className="bg-white text-[#213568] hover:bg-indigo-50 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                        <UserPlus size={18} /> New Student
                      </button>
                    ) : adminTab === 'users' ? (
                      <button onClick={openAddUserModal} className="bg-white text-[#213568] hover:bg-indigo-50 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors">
                        <UserPlus size={18} /> New User
                      </button>
                    ) : null}
                  </div>
                </div>

                {adminTab === 'students' && (
                  <div className="bg-gray-50 border-b border-gray-200 p-6 flex flex-wrap gap-4 justify-between items-center">
                    <div className="grid grid-cols-3 gap-4 w-full md:w-auto flex-1">
                      <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                         <div>
                           <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Total Enrolled</p>
                           <p className="text-2xl font-extrabold text-gray-800">{db.students.length}</p>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center"><Users size={20} /></div>
                      </div>
                      <div className="bg-white border border-green-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                         <div>
                           <p className="text-[10px] uppercase font-bold text-green-600 tracking-wider">Active (Come More)</p>
                           <p className="text-2xl font-extrabold text-green-700">{db.students.filter(s => s.status !== 'resigned').length}</p>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center"><TrendingUp size={20} /></div>
                      </div>
                      <div className="bg-white border border-red-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                         <div>
                           <p className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Stopped / Resigned</p>
                           <p className="text-2xl font-extrabold text-red-700">{db.students.filter(s => s.status === 'resigned').length}</p>
                         </div>
                         <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center"><UserX size={20} /></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex border-b border-gray-200 bg-white px-6 pt-2 gap-2 overflow-x-auto">
                  <button onClick={() => setAdminTab('students')} className={`px-4 py-3 font-bold text-sm whitespace-nowrap ${adminTab === 'students' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Manage Students</button>
                  <button onClick={() => setAdminTab('users')} className={`px-4 py-3 font-bold text-sm whitespace-nowrap ${adminTab === 'users' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>Manage Users</button>
                  <button onClick={() => setAdminTab('certificates')} className={`px-4 py-3 font-bold text-sm flex items-center gap-1.5 whitespace-nowrap ${adminTab === 'certificates' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    Manage Certificates
                    {db.students.filter(s => s.certificateStatus === 'requested').length > 0 && (
                      <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{db.students.filter(s => s.certificateStatus === 'requested').length}</span>
                    )}
                  </button>
                  <button onClick={() => setAdminTab('schedule')} className={`px-4 py-3 font-bold text-sm flex items-center gap-1.5 whitespace-nowrap ${adminTab === 'schedule' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
                    <Calendar size={16}/> School Calendar
                  </button>
                </div>

                {adminTab === 'students' && (
                  <div className="flex flex-col min-h-[400px] bg-gray-50/50">
                    <div className="p-4 border-b border-gray-200 bg-white flex gap-4 items-center">
                      <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search students by name..." value={studentSearchQuery} onChange={e => setStudentSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-50 outline-none text-sm shadow-sm" />
                      </div>
                    </div>
                    <div className="p-6 space-y-6 flex-1">
                      {(() => {
                        const filteredStudents = db.students.filter(s => (s.name || '').toLowerCase().includes(studentSearchQuery.toLowerCase()));
                        const activeFilteredStudents = filteredStudents.filter(s => s.status !== 'resigned');
                        const archivedStudents = filteredStudents.filter(s => s.status === 'resigned');
                        const groups = [
                          { id: 'unassigned', name: 'Pending Assignment', isFolder: false, students: activeFilteredStudents.filter(s => !s.teacherId) },
                          ...db.users.filter(u => u.role === 'teacher').map(t => ({
                            id: t.id,
                            name: `Class of ${t.name}`,
                            isFolder: true,
                            students: activeFilteredStudents.filter(s => s.teacherId === t.id)
                          })),
                          { id: 'archived', name: 'Archived (Stopped / Resigned)', isFolder: true, isArchive: true, students: archivedStudents }
                        ];
                        return groups.map(group => {
                          if (!group.isFolder && group.students.length === 0) return null;
                          if (group.isFolder && group.students.length === 0 && (studentSearchQuery !== '' || group.isArchive)) return null;
                          const isOpen = expandedFolders[group.id] !== false;
                          const toggleFolder = () => { if (group.isFolder) setExpandedFolders(prev => ({ ...prev, [group.id]: !isOpen })); };
                          return (
                            <div key={group.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm ${!group.isFolder ? 'border-orange-200' : 'border-gray-200'} ${group.isArchive ? 'opacity-80' : ''}`}>
                              {group.isFolder ? (
                                <div className={`${group.isArchive ? 'bg-gray-100 hover:bg-gray-200' : 'bg-gray-50 hover:bg-gray-100'} p-4 cursor-pointer flex justify-between items-center border-b border-gray-100 transition-colors`} onClick={toggleFolder}>
                                  <div className="flex items-center gap-3">
                                    {group.isArchive ? <Archive className="text-gray-500" size={22} /> : <Folder className="text-indigo-500 fill-indigo-100" size={22} />}
                                    <h3 className={`font-bold ${group.isArchive ? 'text-gray-600' : 'text-gray-800'}`}>{group.name}</h3>
                                    <span className="bg-white border border-gray-200 text-gray-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{group.students.length}</span>
                                  </div>
                                  {isOpen ? <ChevronDown size={20} className="text-gray-500" /> : <ChevronRight size={20} className="text-gray-500" />}
                                </div>
                              ) : (
                                <div className="bg-orange-50 p-4 flex justify-between items-center border-b border-orange-100">
                                  <div className="flex items-center gap-3">
                                    <UserCircle className="text-orange-500" size={22} />
                                    <h3 className="font-bold text-orange-900">{group.name}</h3>
                                    <span className="bg-white border border-orange-200 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{group.students.length}</span>
                                  </div>
                                </div>
                              )}
                              {(!group.isFolder || isOpen) && (
                                <div className="overflow-x-auto">
                                  {group.students.length > 0 ? (
                                    <table className="w-full text-left border-collapse">
                                      <thead>
                                        <tr className="bg-white border-b border-gray-100 text-gray-500 uppercase tracking-wider text-xs">
                                          <th className="p-4 font-semibold w-20 text-center">Photo</th>
                                          <th className="p-4 font-semibold">Student Name</th>
                                          <th className="p-4 font-semibold">Reports</th>
                                          <th className="p-4 font-semibold">Assigned Teacher</th>
                                          <th className="p-4 font-semibold text-right">Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {group.students.map(student => (
                                          <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                                            <td className="p-4">
                                              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 group bg-gray-100 mx-auto shadow-sm flex items-center justify-center">
                                                {student.profileImage ? <img src={student.profileImage} className="w-full h-full object-cover" alt="Student" /> : <UserCircle size={32} className="text-gray-300"/>}
                                                <input type="file" accept="image/*" onChange={(e) => handleAdminPhotoUpload('student', student.id, e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" title="Upload Photo" />
                                              </div>
                                            </td>
                                            <td className="p-4 font-bold text-gray-800">
                                              {student.name}
                                              {student.status === 'resigned' && <span className="ml-2 inline-flex items-center text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider font-extrabold"><UserX size={10} className="mr-1"/> Stopped</span>}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                              <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold mr-2">{(student.reports || []).filter(r => r.status === 'completed').length} Comp</span>
                                              <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold">{(student.reports || []).filter(r => r.status === 'draft').length} Draft</span>
                                            </td>
                                            <td className="p-4">
                                              <select value={student.teacherId || ''} onChange={(e) => assignStudentToTeacher(student.id, e.target.value)} className="border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full max-w-[200px] bg-white">
                                                <option value="">-- Unassigned --</option>
                                                {db.users.filter(u => u.role === 'teacher').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                              </select>
                                            </td>
                                            <td className="p-4 text-right">
                                              <button onClick={() => { setCurrentStudentId(student.id); setCurrentView('student_profile'); }} className="text-[#f09e5e] hover:text-orange-600 font-bold text-sm border-2 border-[#f09e5e] px-4 py-1.5 rounded-lg hover:bg-orange-50 transition-colors">View Profile</button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  ) : (
                                    <div className="p-8 text-center text-gray-500 text-sm italic bg-white">Folder is empty.</div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                )}

                {adminTab === 'users' && (
                  <div className="p-0 overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-xs">
                          <th className="p-4 font-semibold w-20 text-center">Photo</th>
                          <th className="p-4 font-semibold">User Name</th>
                          <th className="p-4 font-semibold">Role</th>
                          <th className="p-4 font-semibold">Login ID</th>
                          <th className="p-4 font-semibold">Password</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {db.users.map(user => (
                          <tr key={user.id} className={`hover:bg-gray-50/50 transition-colors ${user.role === 'superadmin' ? 'bg-indigo-50/30' : ''}`}>
                            <td className="p-4">
                              <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-200 group bg-gray-100 mx-auto shadow-sm flex items-center justify-center">
                                 {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" alt="User" /> : <UserCircle size={32} className="text-gray-300"/>}
                                 <input type="file" accept="image/*" onChange={(e) => handleAdminPhotoUpload('user', user.id, e)} className="absolute inset-0 opacity-0 cursor-pointer z-10" title="Upload Photo" />
                              </div>
                            </td>
                            <td className="p-4 font-bold text-gray-800">{user.name}{user.id === currentUser.id && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase font-bold">You</span>}</td>
                            <td className="p-4">{user.role === 'superadmin' ? <span className="inline-flex items-center gap-1 text-indigo-700 font-bold text-xs"><ShieldCheck size={14}/> Admin</span> : <span className="inline-flex items-center gap-1 text-gray-600 font-bold text-xs"><Users size={14}/> Teacher</span>}</td>
                            <td className="p-4"><span className="font-mono text-sm text-indigo-700 font-bold bg-indigo-50 rounded px-2 py-1">{user.username || 'N/A'}</span></td>
                            <td className="p-4"><span className="font-mono text-sm text-gray-500 bg-gray-100 rounded px-2 py-1">{user.password || 'N/A'}</span></td>
                            <td className="p-4 text-right flex justify-end gap-2 items-center">
                              <button onClick={() => showModal('EDIT_PERMISSIONS', { teacher: user, onSubmit: (data) => handleUpdateUserSettings(user.id, data) })} className="text-indigo-500 hover:bg-indigo-50 p-2 rounded-lg transition-colors border border-transparent hover:border-indigo-200" title="Settings"><Settings size={18} /></button>
                              <button onClick={() => confirmRemoveUser(user.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Remove"><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {adminTab === 'certificates' && (
                  <div className="p-0 overflow-x-auto min-h-[400px]">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-xs">
                          <th className="p-4 font-semibold">Student Name</th>
                          <th className="p-4 font-semibold">Status</th>
                          <th className="p-4 font-semibold">Date Requested / Approved</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {db.students.filter(s => s.certificateStatus === 'requested' || s.certificateStatus === 'approved').map(student => (
                          <tr key={student.id} className={`transition-colors ${student.certificateStatus === 'requested' ? 'bg-amber-50/30' : 'hover:bg-gray-50/50'}`}>
                            <td className="p-4 font-bold text-gray-800">{student.name}</td>
                            <td className="p-4">{student.certificateStatus === 'requested' ? <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs font-bold"><Clock size={12}/> Pending</span> : <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold"><CheckCircle size={12}/> Approved</span>}</td>
                            <td className="p-4 text-sm text-gray-600">{student.certificateStatus === 'requested' ? student.certificateRequestDate || '-' : student.certificateDate || '-'}</td>
                            <td className="p-4 text-right flex justify-end gap-2 items-center">
                              {student.certificateStatus === 'requested' ? <button onClick={() => handleApproveCertificate(student.id)} className="bg-indigo-600 text-white px-4 py-1.5 rounded text-sm font-bold shadow hover:bg-indigo-700 transition-colors">Approve</button> : <button onClick={() => { setCurrentStudentId(student.id); setCurrentView('certificate_view'); }} className="border-2 border-indigo-600 text-indigo-600 px-4 py-1.5 rounded text-sm font-bold shadow-sm hover:bg-indigo-50 transition-colors">View Diploma</button>}
                              <button onClick={() => handleRevokeCertificate(student.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors" title="Revoke"><Trash2 size={18} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {adminTab === 'schedule' && (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col h-[750px]">
                    <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0">
                      <div>
                        <h3 className="text-xl font-bold text-[#213568] flex items-center gap-2 mb-1"><Calendar size={22} className="text-indigo-600" /> School Calendar</h3>
                        <p className="text-sm text-gray-600">Manage school events and classes.</p>
                      </div>
                      <div className="flex gap-3 items-center">
                        <select value={calendarTeacherFilter} onChange={(e) => setCalendarTeacherFilter(e.target.value)} className="border border-gray-300 rounded-lg text-sm px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-50 bg-white font-semibold text-gray-700 shadow-sm cursor-pointer">
                          <option value="all">All Teachers</option>
                          {db.users.filter(u => u.role === 'teacher').map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button onClick={() => showModal('EVENT_MODAL', { date: new Date().toISOString().split('T')[0], currentUser, teachers: db.users.filter(u => u.role === 'teacher'), onSave: (evt) => updateDoc(getPublicDoc('events', evt.id), evt) })} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-colors"><Plus size={18}/> New Event</button>
                      </div>
                    </div>
                    <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col p-4 relative">
                      {db.adminCalendarUrl ? (
                        <div className="absolute inset-0 z-50 bg-white">
                          <div className="bg-indigo-50 border-b border-indigo-200 p-2 flex justify-between text-xs px-4"><span className="text-indigo-800 font-medium">Viewing External Calendar.</span><button onClick={() => setDoc(getPublicDoc('settings', 'global'), { adminCalendarUrl: '' }, { merge: true })} className="text-indigo-600 font-bold hover:underline">Unlink</button></div>
                          <iframe src={db.adminCalendarUrl} style={{ border: 0 }} width="100%" height="100%" frameBorder="0" scrolling="no" title="Schedule"></iframe>
                        </div>
                      ) : (
                        <NativeCalendar />
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentUser.role === 'teacher' && currentView === 'dashboard' && (
              <div className="w-full max-w-5xl">
                <div className="flex flex-col md:flex-row items-center md:items-start justify-between mb-8 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 flex items-center justify-center shrink-0">
                       {currentUser.profileImage ? <img src={currentUser.profileImage} className="w-full h-full object-cover" alt="Teacher"/> : <UserCircle size={48} className="text-gray-300"/>}
                    </div>
                    <h2 className="text-3xl font-extrabold text-[#213568]">Welcome, {currentUser.name}</h2>
                  </div>
                  <div className="flex bg-white rounded-xl shadow-sm border border-gray-200 p-1.5 w-full md:w-auto">
                    <button onClick={() => setTeacherTab('students')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${teacherTab === 'students' ? 'bg-[#f09e5e] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><Users size={18} /> My Students</button>
                    <button onClick={() => setTeacherTab('schedule')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${teacherTab === 'schedule' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}><Calendar size={18} /> My Schedule</button>
                  </div>
                </div>
                {(() => {
                  const myAssignedStudents = db.students.filter(s => s.teacherId === currentUser.id);
                  const myActiveStudents = myAssignedStudents.filter(s => s.status !== 'resigned');
                  const stoppedCount = myAssignedStudents.length - myActiveStudents.length;
                  const currentMonthPrefix = new Date().toISOString().slice(0, 7);
                  const thisMonthHours = myAssignedStudents.reduce((total, student) => total + (student.attendance || []).reduce((sum, record) => ((record.status === 'present' || record.status === 'makeup') && record.date && record.date.startsWith(currentMonthPrefix)) ? sum + (Number(record.hours) || 0) : sum, 0), 0);
                  const allTimeHours = myAssignedStudents.reduce((total, student) => total + (student.attendance || []).reduce((sum, record) => (record.status === 'present' || record.status === 'makeup') ? sum + (Number(record.hours) || 0) : sum, 0), 0);
                  return (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col items-center justify-center relative overflow-hidden"><div className="absolute -right-4 -top-4 text-indigo-50 opacity-50"><Users size={80}/></div><span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1 relative z-10">Active Students</span><span className="text-3xl font-extrabold text-indigo-600 relative z-10">{myActiveStudents.length}</span>{stoppedCount > 0 && <span className="text-[10px] text-gray-400 font-semibold mt-1 bg-gray-50 px-2 py-0.5 rounded-full">+ {stoppedCount} Stopped</span>}</div>
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col items-center justify-center relative overflow-hidden"><div className="absolute -right-4 -top-4 text-green-50 opacity-50"><Clock size={80}/></div><span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1 relative z-10">Hours This Month</span><span className="text-3xl font-extrabold text-green-600 relative z-10">{thisMonthHours}</span></div>
                      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 flex flex-col items-center justify-center relative overflow-hidden col-span-2 md:col-span-1"><div className="absolute -right-4 -top-4 text-blue-50 opacity-50"><Award size={80}/></div><span className="text-xs font-extrabold text-gray-400 uppercase tracking-widest mb-1 relative z-10">Total Hours</span><span className="text-3xl font-extrabold text-blue-600 relative z-10">{allTimeHours}</span></div>
                    </div>
                  );
                })()}
                {teacherTab === 'students' ? (
                  <>
                    <h3 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2"><Users className="text-[#f09e5e]" size={24} /> My Students</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {db.students.filter(s => s.teacherId === currentUser.id && s.status !== 'resigned').map(student => (
                        <div key={student.id} className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden flex flex-col cursor-pointer group" onClick={() => { setCurrentStudentId(student.id); setCurrentView('student_profile'); }}>
                          <div className="h-24 bg-gradient-to-r from-indigo-50 to-blue-50 relative border-b border-gray-100 flex justify-end p-4">{student.certificateStatus === 'approved' && <Award size={32} className="text-yellow-500" />}<div className="absolute -bottom-8 left-6 w-16 h-16 rounded-full border-4 border-white bg-white shadow-sm overflow-hidden flex items-center justify-center">{student.profileImage ? <img src={student.profileImage} className="w-full h-full object-cover" /> : <UserCircle size={40} className="text-gray-300" />}</div></div>
                          <div className="pt-10 px-6 pb-6 flex-1 flex flex-col"><h3 className="text-lg font-bold text-gray-800 line-clamp-1">{student.name}</h3><p className="text-sm text-gray-500 mt-1">{(student.reports || []).filter(r => r.status === 'completed').length}/5 Levels</p><div className="mt-auto pt-6 flex gap-2"><button className="flex-1 bg-indigo-50 text-indigo-700 py-2 rounded-lg text-sm font-bold group-hover:bg-indigo-600 group-hover:text-white transition-colors">Profile</button></div></div>
                        </div>
                      ))}
                    </div>
                    {db.students.filter(s => s.teacherId === currentUser.id && s.status === 'resigned').length > 0 && (
                      <div className="mt-12">
                        <h3 className="text-lg font-bold text-gray-500 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2"><Archive size={20} /> Archived Students</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {db.students.filter(s => s.teacherId === currentUser.id && s.status === 'resigned').map(student => (
                            <div key={student.id} className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col cursor-pointer opacity-80" onClick={() => { setCurrentStudentId(student.id); setCurrentView('student_profile'); }}>
                              <div className="h-20 bg-gray-200 relative border-b border-gray-200 flex justify-end p-4"><div className="absolute -bottom-8 left-6 w-16 h-16 rounded-full border-4 border-gray-50 bg-white shadow-sm overflow-hidden flex items-center justify-center grayscale">{student.profileImage ? <img src={student.profileImage} className="w-full h-full object-cover opacity-70" /> : <UserCircle size={40} className="text-gray-300" />}</div></div>
                              <div className="pt-10 px-6 pb-6 flex-1 flex flex-col"><h3 className="text-lg font-bold text-gray-600 line-through">{student.name}</h3><div className="mt-1"><span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-extrabold uppercase">Stopped</span></div></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden flex flex-col h-[750px]">
                    <div className="p-5 border-b border-gray-200 bg-gray-50 flex justify-between items-center shrink-0"><div><h3 className="text-xl font-bold text-[#213568] flex items-center gap-2 mb-1"><Calendar size={22} className="text-indigo-600" /> My Schedule</h3></div>{!currentUser.calendarUrl && <button onClick={() => showModal('EVENT_MODAL', { date: new Date().toISOString().split('T')[0], currentUser, teachers: db.users.filter(u => u.role === 'teacher'), onSave: (e) => setDoc(getPublicDoc('events', e.id), e) })} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold shadow-sm flex items-center gap-2 transition-colors"><Plus size={18}/> Add Class</button>}</div>
                    <div className="flex-1 bg-gray-50 p-4 overflow-hidden flex flex-col relative">{currentUser.calendarUrl ? <iframe src={currentUser.calendarUrl} style={{ border: 0 }} width="100%" height="90%" frameBorder="0" scrolling="no" className="rounded-xl shadow-sm border border-gray-300" title="Schedule"></iframe> : <NativeCalendar />}</div>
                  </div>
                )}
              </div>
            )}

            {currentView === 'student_profile' && db.students.find(s => s.id === currentStudentId) && (
              <div className="w-full max-w-5xl">
                <div className="bg-white rounded-2xl shadow-md p-8 mb-8 border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-6"><div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-[5px] border-indigo-50 shadow-sm relative">{db.students.find(s => s.id === currentStudentId).profileImage ? <img src={db.students.find(s => s.id === currentStudentId).profileImage} className="w-full h-full object-cover" /> : <UserCircle size={48} className="text-gray-300" />}</div><div><h2 className="text-3xl font-extrabold text-[#213568] flex items-center gap-3">{db.students.find(s => s.id === currentStudentId).name}{db.students.find(s => s.id === currentStudentId).certificateStatus === 'approved' && <Award size={28} className="text-yellow-500" />}</h2><p className="text-gray-500 flex items-center gap-2 mt-1 font-medium"><Users size={18} /> Student History Profile</p></div></div>
                  <div className="flex gap-3">
                    {currentUser.role === 'superadmin' && (
                      <>
                        <button onClick={() => setCurrentView('attendance_summary')} className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all text-sm border border-blue-100"><Activity size={18} /> Attendance Summary</button>
                        <button onClick={() => setCurrentView('advanced_summary')} className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all text-sm border border-indigo-100"><ClipboardList size={18} /> Advanced Summary</button>
                      </>
                    )}
                    {checkPerm(currentUser, 'canEditReports') && (<><button onClick={() => createNewReport(currentStudentId, 'PHONICS')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all text-sm"><Plus size={18} /> New Phonics</button><button onClick={() => createNewReport(currentStudentId, 'SPELLING')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all text-sm"><Plus size={18} /> New Spelling</button></>)}
                  </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                  <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                      <StudentInfoCard 
                        student={db.students.find(s => s.id === currentStudentId)} 
                        onSave={(newData) => handleUpdateStudentInfo(currentStudentId, newData)} 
                        canEdit={checkPerm(currentUser, 'canEditStudentInfo')} 
                        canViewPhone={checkPerm(currentUser, 'canViewPhone')} 
                        canViewEmail={checkPerm(currentUser, 'canViewEmail')} 
                        canViewLineId={checkPerm(currentUser, 'canViewLineId')} 
                        canViewNotes={checkPerm(currentUser, 'canViewNotes')} 
                        canViewPrivateCustom={checkPerm(currentUser, 'canViewPrivateCustomInfo')} 
                      />
                    </div>
                  </div>
                  <div className="lg:col-span-3 space-y-8">
                    <StudentAttendance student={db.students.find(s => s.id === currentStudentId)} onUpdate={(newData) => handleUpdateStudentInfo(currentStudentId, newData)} canEdit={checkPerm(currentUser, 'canManageAttendance')} showModal={showModal} currentUser={currentUser} />
                    
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-4">
                        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FileText className="text-[#f09e5e]" size={24}/> Student Reports</h3>
                        {(() => {
                          const student = db.students.find(s => s.id === currentStudentId);
                          const completedPhonicsLevels = (student.reports || [])
                            .filter(r => r.status === 'completed' && (r.data.schoolCourse || '').toUpperCase().includes('PHONIC'))
                            .map(r => String(r.data.level));
                          const isEligibleForCert = ['1', '2', '3', '4', '5'].every(l => completedPhonicsLevels.includes(l));
                          
                          if (isEligibleForCert && student.certificateStatus === 'none' && checkPerm(currentUser, 'canRequestCertificates')) {
                            return (
                              <button onClick={() => handleRequestCertificate(student.id)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow flex items-center gap-2 transition-colors">
                                <Award size={16} /> Request Phonics Certificate
                              </button>
                            );
                          } else if (student.certificateStatus === 'requested') {
                            return (
                              <span className="bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2">
                                <Clock size={16} /> Certificate Pending Admin Approval
                              </span>
                            );
                          } else if (student.certificateStatus === 'approved') {
                            return (
                              <button onClick={() => setCurrentView('certificate_view')} className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm flex items-center gap-2 transition-colors">
                                <Award size={16} /> View Approved Diploma
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                         {(db.students.find(s => s.id === currentStudentId).reports || []).map(report => {
                           const themeColor = getThemeColor(report.data.schoolCourse, report.data.level);
                           return (
                              <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col relative">
                                <div className="h-2 w-full" style={{ backgroundColor: themeColor }}></div>
                                <div className="p-5 flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="text-xs font-bold text-gray-400 tracking-wider uppercase">{report.data.schoolCourse}</div>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${report.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{report.status}</span>
                                  </div>
                                  <h4 className="text-lg font-extrabold text-gray-900 mb-3">Level {report.data.level}</h4>
                                  <div className="text-xs text-gray-500 mb-4">Date: <span className="font-semibold">{report.date}</span></div>
                                  
                                  <div className="mt-auto flex flex-col gap-2">
                                    {report.status === 'draft' && checkPerm(currentUser, 'canEditReports') && (
                                      <button onClick={() => { setCurrentReportId(report.id); setCurrentView('edit_report'); }} className="w-full bg-indigo-50 text-indigo-700 py-2 rounded-lg text-sm font-bold hover:bg-indigo-600 hover:text-white transition-colors">Edit Draft</button>
                                    )}
                                    <div className="flex gap-2">
                                       <button onClick={() => { setCurrentReportId(report.id); setCurrentView('final_report'); }} className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-bold hover:bg-gray-100 transition-colors">View</button>
                                       {checkPerm(currentUser, 'canEditReports') && (
                                         <button onClick={() => deleteReport(currentStudentId, report.id)} className="px-3 bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={16}/></button>
                                       )}
                                    </div>
                                    {checkPerm(currentUser, 'canEditReports') && (
                                      <button onClick={() => toggleReportStatus(currentStudentId, report.id, report.status === 'completed' ? 'draft' : 'completed')} className="w-full text-xs font-bold text-gray-400 hover:text-indigo-600 mt-2">{report.status === 'completed' ? 'Revert to Draft' : 'Mark as Completed'}</button>
                                    )}
                                  </div>
                                </div>
                              </div>
                           )
                         })}
                         {(db.students.find(s => s.id === currentStudentId).reports || []).length === 0 && (
                           <div className="col-span-full py-8 text-center text-gray-400 italic bg-gray-50 rounded-xl border border-gray-100">No reports generated yet.</div>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentView === 'edit_report' && currentStudentId && currentReportId && (() => {
              const student = db.students.find(s => s.id === currentStudentId);
              const report = student?.reports.find(r => r.id === currentReportId);
              if (!report) return null;
              
              return (
                <ReportEditor 
                  data={draftReport || report.data} 
                  onChange={setDraftReport}
                  onSave={(newData) => { 
                    updateReportData(currentStudentId, currentReportId, newData); 
                    setDraftReport(null);
                    setCurrentView('student_profile'); 
                  }} 
                  onCancel={() => {
                    setDraftReport(null);
                    setCurrentView('student_profile');
                  }} 
                />
              );
            })()}

            {currentView === 'final_report' && currentStudentId && currentReportId && (() => {
              const student = db.students.find(s => s.id === currentStudentId);
              const report = student?.reports.find(r => r.id === currentReportId);
              if (!report) return null;

              return (
                <FinalReportView 
                  data={draftReport || report.data} 
                  onImageUpload={(e) => handleFileUpload('profileImage', e)} 
                  onRemoveImage={handleRemoveProfileImage} 
                  onLogoUpload={(e) => handleFileUpload('logo', e)} 
                  onSignatureUpload={(e) => handleFileUpload('signatureImage', e)} 
                  canEdit={checkPerm(currentUser, 'canEditReports')} 
                />
              );
            })()}

            {currentView === 'certificate_view' && currentStudentId && (<CertificateView student={db.students.find(s => s.id === currentStudentId)} template={db.certificateTemplate} settings={db.certificateSettings || defaultCertSettings} onUploadTemplate={handleCertTemplateUpload} onUpdateSettings={handleUpdateCertSettings} canEdit={currentUser.role === 'superadmin' || checkPerm(currentUser, 'canRequestCertificates')} />)}

            {currentView === 'advanced_summary' && currentStudentId && (<AdvancedCourseSummaryReport student={db.students.find(s => s.id === currentStudentId)} onClose={() => setCurrentView('student_profile')} />)}
            
            {currentView === 'attendance_summary' && currentStudentId && (<AttendanceSummaryReport student={db.students.find(s => s.id === currentStudentId)} onClose={() => setCurrentView('student_profile')} />)}
          </div>
        </div>
      )}
    </>
  );
}

export default App;
