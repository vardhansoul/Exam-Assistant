
import type { ExamCategory } from './types';

// ==========================================
// SUPER ADMIN CONFIGURATION
// ==========================================
// Emails listed here have unrestricted access to the Admin Dashboard and can change the Access Code.
// Add your email address to this list to grant yourself Super Admin privileges.
export const ADMIN_EMAILS = [
    'govardhanm622@gmail.com', 
    'govardhan.opc@gmail.com'
    // 'your-email@example.com' // <--- Add your email here
];

// ==========================================
// INTEGRATIONS
// ==========================================
// Paste your Google Apps Script Web App URL here to enable exporting new users to Sheets.
// Leave empty to disable this feature.
export const GOOGLE_SHEETS_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbz3mw87YGwK_G0UJp4AZiCwal4U3hTDzJTkqe6BKcvzblF3qm7EWCCY9619f5Oq73EoUQ/exec'; 

export const LANGUAGES = [
    'English',
    'Hindi', 'Hindi (English Script)',
    'Bengali', 'Bengali (English Script)',
    'Telugu', 'Telugu (English Script)',
    'Marathi', 'Marathi (English Script)',
    'Tamil', 'Tamil (English Script)',
    'Urdu', 'Urdu (English Script)',
    'Gujarati', 'Gujarati (English Script)',
    'Kannada', 'Kannada (English Script)',
    'Odia', 'Odia (English Script)',
    'Malayalam', 'Malayalam (English Script)',
    'Punjabi', 'Punjabi (English Script)',
    'Assamese', 'Assamese (English Script)',
    'Maithili', 'Maithili (English Script)'
];

export const DIFFICULTY_LEVELS = ['Easy', 'Medium', 'Hard'];

export const APTITUDE_TOPICS = [
    'Time and Work', 'Time Speed Distance', 'Percentage', 'Profit and Loss',
    'Simple Interest', 'Compound Interest', 'Ratio and Proportion', 'Averages',
    'Number System', 'HCF and LCM', 'Simplification', 'Algebra', 'Geometry',
    'Mensuration', 'Trigonometry', 'Data Interpretation', 'Probability', 
    'Permutation and Combination', 'Clocks and Calendars', 'Boats and Streams'
];

export const JOB_ROLES = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 'Bank PO',
    'Civil Servant (IAS/IPS)', 'Teacher', 'Police Officer', 'Railway Engineer',
    'Nurse', 'Pharmacist', 'Accountant', 'Marketing Manager', 'Content Writer',
    'Graphic Designer', 'Web Developer', 'Sales Executive', 'HR Manager'
];

export const INDIAN_STATES = [
    { name: 'Andhra Pradesh' }, { name: 'Arunachal Pradesh' }, { name: 'Assam' }, { name: 'Bihar' },
    { name: 'Chhattisgarh' }, { name: 'Goa' }, { name: 'Gujarat' }, { name: 'Haryana' },
    { name: 'Himachal Pradesh' }, { name: 'Jharkhand' }, { name: 'Karnataka' }, { name: 'Kerala' },
    { name: 'Madhya Pradesh' }, { name: 'Maharashtra' }, { name: 'Manipur' }, { name: 'Meghalaya' },
    { name: 'Mizoram' }, { name: 'Nagaland' }, { name: 'Odisha' }, { name: 'Punjab' },
    { name: 'Rajasthan' }, { name: 'Sikkim' }, { name: 'Tamil Nadu' }, { name: 'Telangana' },
    { name: 'Tripura' }, { name: 'Uttar Pradesh' }, { name: 'Uttarakhand' }, { name: 'West Bengal' }
];

export const QUALIFICATION_CATEGORIES = [
    '10th Pass', '12th Pass', 'Diploma', 'Graduate', 'Post Graduate'
];

export const SELECTION_LEVELS = [
    'National Level',
    'State Level',
    'Entrance Exams',
    'Exams by Qualification',
    'School Syllabus (NCERT)'
];

export const SCHOOL_CLASSES = [
    'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'
];

export const SCHOOL_STREAMS = [
    'Science', 'Commerce', 'Arts/Humanities'
];

export const SCHOOL_SUBJECTS: Record<string, string[]> = {
    'junior': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'],
    'secondary': ['Mathematics', 'Science', 'Social Science', 'English', 'Hindi'],
    'Class 11_Science': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
    'Class 12_Science': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
    'Class 11_Commerce': ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English'],
    'Class 12_Commerce': ['Accountancy', 'Business Studies', 'Economics', 'Mathematics', 'English'],
    'Class 11_Arts/Humanities': ['History', 'Geography', 'Political Science', 'Economics', 'Sociology', 'Psychology', 'English'],
    'Class 12_Arts/Humanities': ['History', 'Geography', 'Political Science', 'Economics', 'Sociology', 'Psychology', 'English'],
};

// Exam Data Definitions
const NATIONAL_EXAMS: ExamCategory[] = [
    { name: 'UPSC', subCategories: [{ name: 'Civil Services (IAS/IPS/IFS)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] }, { name: 'NDA' }, { name: 'CDS' }] },
    { name: 'SSC', subCategories: [{ name: 'CGL', tiers: [{name: 'Tier I'}, {name: 'Tier II'}] }, { name: 'CHSL' }, { name: 'MTS' }, { name: 'CPO' }, { name: 'GD Constable' }] },
    { name: 'Railways (RRB)', subCategories: [{ name: 'NTPC' }, { name: 'Group D' }, { name: 'ALP' }, { name: 'JE' }] },
    { name: 'Banking', subCategories: [{ name: 'IBPS PO' }, { name: 'IBPS Clerk' }, { name: 'SBI PO' }, { name: 'SBI Clerk' }, { name: 'RBI Grade B' }] },
    { name: 'Defence', subCategories: [{ name: 'AFCAT' }, { name: 'Indian Coast Guard' }, { name: 'Agniveer' }] },
    { name: 'Teaching', subCategories: [{ name: 'CTET' }, { name: 'UGC NET' }, { name: 'KVS' }] }
];

// --- State Specific Exam Definitions ---

const KARNATAKA_EXAMS: ExamCategory[] = [
    {
        name: 'KPSC (Karnataka Public Service Commission)',
        subCategories: [
            { name: 'Gazetted Probationers (KAS)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'FDA (First Division Assistant)', tiers: [{name: 'Paper I (General Knowledge)'}, {name: 'Paper II (General Kannada/English)'}, {name: 'Computer Proficiency Test'}] },
            { name: 'SDA (Second Division Assistant)', tiers: [{name: 'Paper I (General Knowledge)'}, {name: 'Paper II (General Kannada/English)'}, {name: 'Computer Proficiency Test'}] },
            { name: 'Group C (Non-Technical)', tiers: [{name: 'Paper I (General Studies)'}, {name: 'Paper II (Communication)'}] },
            { name: 'PDO (Panchayat Development Officer)', tiers: [{name: 'Paper I (General Knowledge)'}, {name: 'Paper II (Rural Development)'}] }
        ]
    },
    { 
        name: 'KEA (Karnataka Examination Authority)', 
        subCategories: [
            { name: 'Village Accountant (VA)', tiers: [{name: 'Paper I'}, {name: 'Paper II'}] }, 
            { name: 'PSI (Police Sub-Inspector)', tiers: [{name: 'Physical Test'}, {name: 'Written Exam'}] },
            { name: 'Assistant Professor' }
        ] 
    },
    { 
        name: 'KSP (Karnataka State Police)', 
        subCategories: [
            { name: 'Sub-Inspector (Civil/CAR/DAR/Wireless)', tiers: [{name: 'Physical Endurance Test (PET)'}, {name: 'Physical Standard Test (PST)'}, {name: 'Written Examination'}] }, 
            { name: 'Constable (Civil/CAR/DAR)', tiers: [{name: 'Written Examination'}, {name: 'Physical Standard Test (PST)'}, {name: 'Physical Endurance Test (PET)'}] }
        ] 
    },
    { name: 'KARTET (Karnataka Teacher Eligibility Test)', tiers: [{name: 'Paper I (Class 1-5)'}, {name: 'Paper II (Class 6-8)'}] },
    { name: 'Electricity Boards (KPTCL/BESCOM/HESCOM)', subCategories: [{name: 'Junior Assistant'}, {name: 'Junior Engineer'}, {name: 'Assistant Engineer'}] },
    { name: 'KMF (Karnataka Milk Federation)', subCategories: [{ name: 'Assistant Manager' }, { name: 'Technical Officer' }, { name: 'Extension Officer' }] },
    { name: 'District Cooperative Banks (DCC Banks)', subCategories: [{ name: 'Second Division Assistant' }, { name: 'Attender' }] },
    { name: 'KSRTC / BMTC (Transport)', subCategories: [{ name: 'Driver' }, { name: 'Conductor' }, { name: 'Mechanic' }] }
];

const ANDHRA_PRADESH_EXAMS: ExamCategory[] = [
    {
        name: 'APPSC (Andhra Pradesh Public Service Commission)',
        subCategories: [
            { name: 'Group I Services', tiers: [{name: 'Screening Test'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Group II Services', tiers: [{name: 'Screening Test'}, {name: 'Mains'}] },
            { name: 'Group III (Panchayat Secretary)', tiers: [{name: 'Screening Test'}, {name: 'Mains'}] },
            { name: 'Group IV (Junior Assistant)', tiers: [{name: 'Screening Test'}, {name: 'Mains'}] },
            { name: 'Assistant Executive Engineers (AEE)' }
        ]
    },
    {
        name: 'AP Police Recruitment (APSLPRB)',
        subCategories: [
            { name: 'Sub-Inspector (Civil/AR/APSP)', tiers: [{name: 'Prelims'}, {name: 'PMT/PET'}, {name: 'Final Written Exam'}] },
            { name: 'Police Constable', tiers: [{name: 'Prelims'}, {name: 'PMT/PET'}, {name: 'Final Written Exam'}] }
        ]
    },
    {
        name: 'Teaching Exams',
        subCategories: [
            { name: 'AP DSC (Teacher Recruitment Test)', tiers: [{name: 'Written Exam'}] },
            { name: 'AP TET (Teacher Eligibility Test)', tiers: [{name: 'Paper I'}, {name: 'Paper II'}] }
        ]
    },
    { name: 'AP Grama/Ward Sachivalayam', subCategories: [{ name: 'Category I' }, { name: 'Category II' }, { name: 'Category III' }] },
    { name: 'AP High Court', subCategories: [{ name: 'Junior Assistant' }, { name: 'Stenographer' }, { name: 'Office Subordinate' }] },
    { name: 'APSRTC (Transport)', subCategories: [{ name: 'Driver' }, { name: 'Conductor' }] },
    { name: 'APCOB (Cooperative Bank)', subCategories: [{ name: 'Staff Assistant' }, { name: 'Manager' }] }
];

const TELANGANA_EXAMS: ExamCategory[] = [
    {
        name: 'TSPSC (Telangana State Public Service Commission)',
        subCategories: [
            { name: 'Group I Services', tiers: [{name: 'Prelims'}, {name: 'Mains'}] },
            { name: 'Group II Services', tiers: [{name: 'Paper I'}, {name: 'Paper II'}, {name: 'Paper III'}, {name: 'Paper IV'}] },
            { name: 'Group III Services', tiers: [{name: 'Paper I'}, {name: 'Paper II'}, {name: 'Paper III'}] },
            { name: 'Group IV Services', tiers: [{name: 'Paper I'}, {name: 'Paper II'}] },
            { name: 'AEE (Assistant Executive Engineers)' }
        ]
    },
    {
        name: 'TSLPRB (Telangana State Level Police Recruitment Board)',
        subCategories: [
            { name: 'Sub-Inspector (SI)', tiers: [{name: 'Prelims'}, {name: 'PMT/PET'}, {name: 'Final Written Exam'}] },
            { name: 'Police Constable', tiers: [{name: 'Prelims'}, {name: 'PMT/PET'}, {name: 'Final Written Exam'}] }
        ]
    },
    {
        name: 'Teaching & Gurukulam',
        subCategories: [
            { name: 'TS DSC / TRT' },
            { name: 'TS TET' },
            { name: 'Gurukulam Teachers (TREIRB)' }
        ]
    },
    { name: 'Electricity Boards (TSSPDCL / TSNPDCL)', subCategories: [{ name: 'Junior Lineman' }, { name: 'Assistant Engineer' }] },
    { name: 'TSRTC (Transport)', subCategories: [{ name: 'Driver' }, { name: 'Conductor' }, { name: 'Mechanic' }] },
    { name: 'Singareni Collieries (SCCL)', subCategories: [{ name: 'Management Trainee' }, { name: 'Badli Worker' }] },
    { name: 'Telangana High Court', subCategories: [{ name: 'Junior Assistant' }, { name: 'Typist' }, { name: 'Stenographer' }] }
];

const TAMIL_NADU_EXAMS: ExamCategory[] = [
    {
        name: 'TNPSC (Tamil Nadu Public Service Commission)',
        subCategories: [
            { name: 'Group I Services', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Group II / IIA Services', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview (for Group II)'}] },
            { name: 'Group IV (VAO / Junior Assistant)', tiers: [{name: 'Written Exam'}] },
            { name: 'Combined Engineering Services' }
        ]
    },
    {
        name: 'TNUSRB (Tamil Nadu Uniformed Services Recruitment Board)',
        subCategories: [
            { name: 'Sub-Inspector of Police', tiers: [{name: 'Written Exam'}, {name: 'PET/PMT'}, {name: 'Viva-Voce'}] },
            { name: 'Police Constable', tiers: [{name: 'Written Exam'}, {name: 'PET/PMT'}] }
        ]
    },
    {
        name: 'TRB (Teachers Recruitment Board)',
        subCategories: [
            { name: 'TNTET (Tamil Nadu Teacher Eligibility Test)' },
            { name: 'PG Assistant' },
            { name: 'Computer Instructor' },
            { name: 'Polytechnic Lecturer' }
        ]
    },
    { name: 'TANGEDCO (TNEB)', subCategories: [{ name: 'Assessor' }, { name: 'Assistant Engineer' }, { name: 'Field Assistant' }] },
    { name: 'TNFUSRC (Forest Department)', subCategories: [{ name: 'Forester' }, { name: 'Forest Guard' }] },
    { name: 'TNSTC (Transport)', subCategories: [{ name: 'Driver' }, { name: 'Conductor' }, { name: 'Technical Asst' }] },
    { name: 'MRB (Medical Services Recruitment Board)', subCategories: [{ name: 'Nurse' }, { name: 'Pharmacist' }, { name: 'Lab Technician' }] },
    { name: 'Aavin (Milk Federation)', subCategories: [{ name: 'Manager' }, { name: 'Executive' }] }
];

const KERALA_EXAMS: ExamCategory[] = [
    { 
        name: 'Kerala PSC (Degree Level)', 
        subCategories: [
            { name: 'KAS (Kerala Administrative Service)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Secretariat Assistant' },
            { name: 'University Assistant' },
            { name: 'Sub-Inspector of Police (SI)' },
            { name: 'BDO (Block Development Officer)' }
        ] 
    },
    { 
        name: 'Kerala PSC (12th / Plus Two Level)', 
        subCategories: [
            { name: 'CPO (Civil Police Officer)' },
            { name: 'Fireman' },
            { name: 'Beat Forest Officer' },
            { name: 'LDC (Lower Division Clerk) - Various Depts' },
            { name: 'Lab Assistant' }
        ] 
    },
    { 
        name: 'Kerala PSC (10th / SSLC Level)', 
        subCategories: [
            { name: 'LDC (Lower Division Clerk) - Main List' }, 
            { name: 'LGS (Last Grade Servants)' }, 
            { name: 'VEO (Village Extension Officer)' },
            { name: 'Bevco Assistant' }
        ] 
    },
    { name: 'KTET (Kerala Teacher Eligibility Test)', subCategories: [{name: 'Category I'}, {name: 'Category II'}, {name: 'Category III'}, {name: 'Category IV'}] },
    { name: 'Kerala High Court', subCategories: [{ name: 'Assistant' }, { name: 'Office Attendant' }] },
    { name: 'KSEB (Electricity)', subCategories: [{ name: 'Mazdoor' }, { name: 'Assistant Engineer' }] },
    { name: 'KSRTC (Transport)', subCategories: [{ name: 'Conductor' }, { name: 'Driver' }, { name: 'Mechanic' }] },
    { name: 'Milma (Cooperative Milk)', subCategories: [{ name: 'Junior Assistant' }, { name: 'Technician' }] }
];

const MAHARASHTRA_EXAMS: ExamCategory[] = [
    {
        name: 'MPSC (Maharashtra Public Service Commission)',
        subCategories: [
            { name: 'Rajyaseva (State Services)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Group B Combined (PSI/STI/ASO)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Physical Test (PSI only)'}] },
            { name: 'Group C Combined (Clerk/Tax Asst)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Typing Test'}] },
            { name: 'Technical Services (Forest/Agri/Engg)' },
            { name: 'Civil Judge (Junior Division)' }
        ]
    },
    {
        name: 'Maharashtra Police',
        subCategories: [
            { name: 'Police Constable (Shipai)', tiers: [{name: 'Physical Efficiency Test'}, {name: 'Written Exam'}] },
            { name: 'SRPF (State Reserve Police)', tiers: [{name: 'Physical Efficiency Test'}, {name: 'Written Exam'}] },
            { name: 'Police Driver', tiers: [{name: 'Driving Test'}, {name: 'Physical Test'}, {name: 'Written Exam'}] }
        ]
    },
    {
        name: 'Revenue & Rural Development',
        subCategories: [
            { name: 'Talathi (Revenue Dept)', tiers: [{name: 'Written Exam'}] },
            { name: 'Zilla Parishad (ZP) Recruitment', tiers: [{name: 'Written Exam'}] },
            { name: 'Gram Sevak' },
            { name: 'Kotwal' }
        ]
    },
    {
        name: 'Teaching Exams',
        subCategories: [
            { name: 'MAHA-TET (Teacher Eligibility Test)', tiers: [{name: 'Paper I'}, {name: 'Paper II'}] },
            { name: 'TAIT (Teacher Aptitude Test)' }
        ]
    },
    {
        name: 'Public Health (Arogya Vibhag)',
        subCategories: [
            { name: 'Group C (Nurse/Tech/Clerk)' },
            { name: 'Group D (Peon/Helper)' }
        ]
    },
    { name: 'Municipal Corporations (BMC/PMC/PCMC)', subCategories: [{ name: 'Clerk' }, { name: 'Junior Engineer' }, { name: 'Fireman' }] },
    { name: 'MSRTC (State Transport)', subCategories: [{ name: 'Driver' }, { name: 'Conductor' }, { name: 'Mechanic' }] },
    { name: 'Cooperative Banks', subCategories: [{ name: 'Clerk' }, { name: 'Officer' }] }
];

const ODISHA_EXAMS: ExamCategory[] = [
    {
        name: 'OPSC (Odisha Public Service Commission)',
        subCategories: [
            { name: 'Odisha Civil Services (OCS)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Assistant Section Officer (ASO)', tiers: [{name: 'Written Exam'}, {name: 'Skill Test'}] },
            { name: 'Odisha Judicial Service (OJS)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Medical Officer (Assistant Surgeon)' },
            { name: 'Assistant Professor (Government Colleges)' }
        ]
    },
    {
        name: 'OSSC (Odisha Staff Selection Commission)',
        subCategories: [
            { name: 'CGL (Combined Graduate Level)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Computer Skill Test'}] },
            { name: 'CHSL (Combined Higher Secondary Level)', tiers: [{name: 'Prelims'}, {name: 'Mains'}] },
            { name: 'Junior Engineer (Civil/Mech)', tiers: [{name: 'Prelims'}, {name: 'Mains'}] },
            { name: 'Sub-Inspector of Excise' },
            { name: 'Assistant Training Officer (ATO)' }
        ]
    },
    {
        name: 'OSSSC (Odisha Sub-ordinate Staff Selection Commission)',
        subCategories: [
            { name: 'Revenue Inspector (RI) / ARI / Amin', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Skill Test'}] },
            { name: 'Nursing Officer', tiers: [{name: 'Written Exam'}] },
            { name: 'PEO (Panchayat Executive Officer) & JA', tiers: [{name: 'Written Exam'}, {name: 'Skill Test'}] },
            { name: 'Radiographer / Lab Technician' },
            { name: 'Livestock Inspector' }
        ]
    },
    {
        name: 'Odisha Police',
        subCategories: [
            { name: 'Sub-Inspector (SI)', tiers: [{name: 'CBT'}, {name: 'Physical Standard/Efficiency Test'}] },
            { name: 'Constable (Civil)', tiers: [{name: 'Written Exam'}, {name: 'Physical Test'}] },
            { name: 'Sepoy / Constable (OSAP/IRB)' }
        ]
    },
    {
        name: 'Teaching Exams',
        subCategories: [
            { name: 'OTET (Odisha Teacher Eligibility Test)', tiers: [{name: 'Paper I'}, {name: 'Paper II'}] },
            { name: 'OSSTET (Secondary School TET)' },
            { name: 'Junior Teacher (Schematic)', tiers: [{name: 'CBT'}] },
            { name: 'OAVS (Odisha Adarsha Vidyalaya Sangathan)' }
        ]
    },
    { name: 'Orissa High Court', subCategories: [{ name: 'ASO' }, { name: 'Junior Stenographer' }] },
    { name: 'OPTCL (Odisha Power Transmission Corp)', subCategories: [{ name: 'Management Trainee' }, { name: 'Junior Maintenance & Operator Trainee (JMOT)' }] },
    { name: 'OMC (Odisha Mining Corporation)', subCategories: [{ name: 'Junior Executive Assistant' }, { name: 'Mining Mate' }] },
    { name: 'OMFED', subCategories: [{ name: 'Technical Officer' }, { name: 'Assistant Manager' }] },
    { name: 'OSRTC (Transport)', subCategories: [{ name: 'Driver' }, { name: 'Conductor' }] }
];

const JHARKHAND_EXAMS: ExamCategory[] = [
    {
        name: 'JPSC (Jharkhand Public Service Commission)',
        subCategories: [
            { name: 'Combined Civil Services', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Assistant Engineer' },
            { name: 'Scientific Officer' }
        ]
    },
    {
        name: 'JSSC (Jharkhand Staff Selection Commission)',
        subCategories: [
            { name: 'CGL (Combined Graduate Level)', tiers: [{name: 'Paper 1'}, {name: 'Paper 2'}, {name: 'Paper 3'}] },
            { name: 'Inter Level (Computer Knowledge & Hindi Typing)' },
            { name: 'Excise Constable' },
            { name: 'Diploma Level Combined Competitive Exam' }
        ]
    },
    { name: 'Jharkhand Police', subCategories: [{ name: 'Sub-Inspector' }, { name: 'Constable' }, { name: 'Radio Operator' }] },
    { name: 'Teaching Exams', subCategories: [{ name: 'JTET (Jharkhand Teacher Eligibility Test)' }, { name: 'PGT/TGT Recruitment' }] },
    { name: 'JUVNL (Jharkhand Urja Vikas Nigam)', subCategories: [{ name: 'Junior Engineer' }, { name: 'Assistant Engineer' }] }
];

const GOA_EXAMS: ExamCategory[] = [
    {
        name: 'GPSC (Goa Public Service Commission)',
        subCategories: [
            { name: 'Junior Scale Officer (Goa Civil Service)', tiers: [{name: 'Pre-Screening Test'}, {name: 'Screening Test (CBRT)'}, {name: 'Written Examination'}, {name: 'Oral Interview'}] },
            { name: 'Assistant Professor (Government Colleges)', tiers: [{name: 'Screening Test'}, {name: 'Interview'}] },
            { name: 'Child Development Project Officer (CDPO)', tiers: [{name: 'Screening Test'}, {name: 'Interview'}] },
            { name: 'Mamlatdar / Joint Mamlatdar', tiers: [{name: 'Written Exam'}, {name: 'Interview'}] },
            { name: 'Block Development Officer (BDO)', tiers: [{name: 'Written Exam'}, {name: 'Interview'}] }
        ]
    },
    {
        name: 'Goa Staff Selection Commission (GSSC) / Departmental',
        subCategories: [
            { name: 'Lower Division Clerk (LDC)', tiers: [{name: 'Written Exam'}, {name: 'Skill Test / Typing Test'}] },
            { name: 'Multi Tasking Staff (MTS)', tiers: [{name: 'Written Exam'}] },
            { name: 'Village Panchayat Secretary', tiers: [{name: 'Written Exam'}] },
            { name: 'Talathi', tiers: [{name: 'Written Exam'}] },
            { name: 'Junior Stenographer', tiers: [{name: 'Shorthand Test'}, {name: 'Written Exam'}] }
        ]
    },
    {
        name: 'Goa Police',
        subCategories: [
            { name: 'Police Sub-Inspector (PSI)', tiers: [{name: 'Physical Efficiency Test'}, {name: 'Written Exam'}, {name: 'Interview'}] },
            { name: 'Police Constable', tiers: [{name: 'Physical Efficiency Test'}, {name: 'Written Exam'}] },
            { name: 'Home Guard / Driver', tiers: [{name: 'Trade Test'}, {name: 'Written Exam'}] }
        ]
    },
    {
        name: 'Goa Electricity Department',
        subCategories: [
            { name: 'Junior Engineer (JE)', tiers: [{name: 'Written Exam'}] },
            { name: 'Assistant Lineman / Line Helper', tiers: [{name: 'Physical Test'}, {name: 'Written Exam'}] },
            { name: 'Meter Reader', tiers: [{name: 'Written Exam'}] }
        ]
    },
    {
        name: 'Directorate of Health Services (DHS) / GMC',
        subCategories: [
            { name: 'Staff Nurse', tiers: [{name: 'Written Exam'}] },
            { name: 'Pharmacist', tiers: [{name: 'Written Exam'}] },
            { name: 'Lab Technician', tiers: [{name: 'Written Exam'}] },
            { name: 'Multi Purpose Health Worker (MPHW)', tiers: [{name: 'Written Exam'}] }
        ]
    },
    {
        name: 'Directorate of Education',
        subCategories: [
            { name: 'Goa TET (Teacher Eligibility Test)', tiers: [{name: 'Paper I (Primary)'}, {name: 'Paper II (Upper Primary)'}] },
            { name: 'Government Primary Teacher', tiers: [{name: 'Written Exam'}] },
            { name: 'Laboratory Assistant', tiers: [{name: 'Written Exam'}] }
        ]
    },
    {
        name: 'Goa Forest Department',
        subCategories: [
            { name: 'Forest Guard', tiers: [{name: 'Physical Standard Test'}, {name: 'Written Exam'}, {name: 'Walking Test'}] },
            { name: 'Round Forester', tiers: [{name: 'Written Exam'}, {name: 'Walking Test'}] }
        ]
    },
    {
        name: 'Judiciary (High Court of Bombay at Goa)',
        subCategories: [
            { name: 'Civil Judge (Junior Division)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Viva-voce'}] },
            { name: 'Clerk / Peon', tiers: [{name: 'Written Exam'}] }
        ]
    },
    {
        name: 'Transport (KTCL / RTO)',
        subCategories: [
            { name: 'Assistant Motor Vehicle Inspector (AMVI)', tiers: [{name: 'Written Exam'}, {name: 'Physical Test'}] },
            { name: 'Kadamba Driver / Conductor', tiers: [{name: 'Trade Test'}] }
        ]
    }
];

const GUJARAT_EXAMS: ExamCategory[] = [
    {
        name: 'GPSC (Gujarat Public Service Commission)',
        subCategories: [
            { name: 'Class 1 & 2 (Gujarat Civil Services)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'DySO (Deputy Section Officer) / Dy Mamlatdar', tiers: [{name: 'Prelims'}, {name: 'Mains'}] },
            { name: 'Police Inspector (PI)', tiers: [{name: 'Prelims'}, {name: 'Physical Test'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'State Tax Inspector (STI)', tiers: [{name: 'Prelims'}, {name: 'Mains'}] },
            { name: 'Chief Officer' }
        ]
    },
    {
        name: 'GSSSB (Gujarat Subordinate Service Selection Board)',
        subCategories: [
            { name: 'Head Clerk / Senior Clerk', tiers: [{name: 'Written Exam'}, {name: 'CPT'}] },
            { name: 'Bin Sachivalay Clerk / Office Assistant', tiers: [{name: 'Written Exam'}, {name: 'CPT'}] },
            { name: 'Sub Accountant / Sub Auditor' },
            { name: 'Assistant Tribal Development Officer (ATDO)' }
        ]
    },
    {
        name: 'GPSSB (Gujarat Panchayat Service Selection Board)',
        subCategories: [
            { name: 'Talati Cum Mantri', tiers: [{name: 'Written Exam'}] },
            { name: 'Junior Clerk', tiers: [{name: 'Written Exam'}] },
            { name: 'Gram Sevak' },
            { name: 'Mukhya Sevika' }
        ]
    },
    {
        name: 'Gujarat Police',
        subCategories: [
            { name: 'Lokrakshak Dal (LRD) / Constable', tiers: [{name: 'Physical Test'}, {name: 'Written Exam'}] },
            { name: 'PSI / ASI', tiers: [{name: 'Physical Test'}, {name: 'Prelims'}, {name: 'Mains'}] }
        ]
    },
    { name: 'Teaching Exams', subCategories: [{ name: 'TET-I / TET-II' }, { name: 'TAT (Secondary / Higher Secondary)' }, { name: 'HTAT (Head Teacher Aptitude Test)' }] },
    { name: 'Electricity Companies (GUVNL / MGVCL / DGVCL / PGVCL / UGVCL)', subCategories: [{ name: 'Vidyut Sahayak (Junior Assistant)' }, { name: 'Junior Engineer' }] },
    { name: 'GSRTC (Transport)', subCategories: [{ name: 'Conductor' }, { name: 'Driver' }] },
    { name: 'High Court of Gujarat', subCategories: [{ name: 'Assistant' }, { name: 'Peon' }, { name: 'Bailiff' }] }
];

const HARYANA_EXAMS: ExamCategory[] = [
    {
        name: 'HPSC (Haryana Public Service Commission)',
        subCategories: [
            { name: 'HCS (Haryana Civil Services)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'HCS (Judicial Branch)' },
            { name: 'Assistant Professor' },
            { name: 'ADO (Agriculture Development Officer)' }
        ]
    },
    {
        name: 'HSSC (Haryana Staff Selection Commission)',
        subCategories: [
            { name: 'CET (Common Eligibility Test) Group C', tiers: [{name: 'CET Prelims'}, {name: 'Mains (Post specific)'}] },
            { name: 'CET Group D' },
            { name: 'Haryana Police Constable', tiers: [{name: 'CET'}, {name: 'Physical Screening Test (PST)'}, {name: 'Physical Measurement Test (PMT)'}] },
            { name: 'Patwari / Canal Patwari / Gram Sachiv' },
            { name: 'Clerk' }
        ]
    },
    { name: 'Teaching Exams', subCategories: [{ name: 'HTET (Haryana Teacher Eligibility Test)' }, { name: 'HPSC PGT' }, { name: 'HSSC TGT' }] },
    { name: 'Haryana Police', subCategories: [{ name: 'Sub-Inspector' }, { name: 'Constable' }, { name: 'Durga Shakti' }] }
];

const HIMACHAL_PRADESH_EXAMS: ExamCategory[] = [
    {
        name: 'HPPSC (Himachal Pradesh Public Service Commission)',
        subCategories: [
            { name: 'HPAS (Administrative Services)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Naib Tehsildar', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Allied Services' },
            { name: 'Range Forest Officer' }
        ]
    },
    {
        name: 'HPSSC / HPSSSB (Hamirpur Board)',
        subCategories: [
            { name: 'JOA IT (Junior Office Assistant)', tiers: [{name: 'Written Exam'}, {name: 'Typing Test'}] },
            { name: 'Clerk' },
            { name: 'Traffic Inspector' }
        ]
    },
    { name: 'Himachal Police', subCategories: [{ name: 'Constable' }, { name: 'Sub-Inspector' }] },
    { name: 'Teaching Exams', subCategories: [{ name: 'HP TET' }, { name: 'TGT Commission' }, { name: 'JBT Commission' }] },
    { name: 'HRTC (Transport)', subCategories: [{ name: 'Driver' }, { name: 'Conductor' }] },
    { name: 'HP State Cooperative Bank', subCategories: [{ name: 'Junior Clerk' }, { name: 'Steno' }] }
];

const MADHYA_PRADESH_EXAMS: ExamCategory[] = [
    {
        name: 'MPPSC (Madhya Pradesh Public Service Commission)',
        subCategories: [
            { name: 'State Service Exam', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'State Forest Service', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Assistant Professor' },
            { name: 'Medical Officer' }
        ]
    },
    {
        name: 'MPESB (Madhya Pradesh Employees Selection Board / Vyapam)',
        subCategories: [
            { name: 'Patwari', tiers: [{name: 'Written Exam'}] },
            { name: 'Group 2 (Sub Group 4) - Sahayak Samparikshak etc.' },
            { name: 'Group 5 (Paramedical & Nursing)' },
            { name: 'Jail Prahari' },
            { name: 'Forest Guard' }
        ]
    },
    {
        name: 'MP Police',
        subCategories: [
            { name: 'Constable (GD / Radio)', tiers: [{name: 'Written Exam'}, {name: 'Physical Proficiency Test'}] },
            { name: 'Sub-Inspector (SI)', tiers: [{name: 'Written Exam'}, {name: 'Physical Proficiency Test'}, {name: 'Interview'}] }
        ]
    },
    {
        name: 'Teaching Exams (Varg 1, 2, 3)',
        subCategories: [
            { name: 'HSTET (High School TET - Varg 1)' },
            { name: 'MSTET (Middle School TET - Varg 2)' },
            { name: 'PSTET (Primary School TET - Varg 3)' }
        ]
    }
];

const PUNJAB_EXAMS: ExamCategory[] = [
    {
        name: 'PPSC (Punjab Public Service Commission)',
        subCategories: [
            { name: 'PCS (Punjab Civil Services)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Naib Tehsildar' },
            { name: 'Cooperative Inspector' },
            { name: 'ADO (Agriculture Development Officer)' }
        ]
    },
    {
        name: 'PSSSB (Punjab Subordinate Service Selection Board)',
        subCategories: [
            { name: 'Clerk (Legal / IT / Accounts)', tiers: [{name: 'Written Exam'}, {name: 'Typing Test'}] },
            { name: 'Patwari', tiers: [{name: 'Written Exam'}] },
            { name: 'Excise Inspector' },
            { name: 'VDO (Village Development Officer)' },
            { name: 'Forest Guard' }
        ]
    },
    {
        name: 'Punjab Police',
        subCategories: [
            { name: 'Sub-Inspector', tiers: [{name: 'CBT'}, {name: 'Physical Screening Test'}] },
            { name: 'Constable', tiers: [{name: 'CBT'}, {name: 'Physical Screening Test'}] },
            { name: 'Intelligence Assistant' }
        ]
    },
    { name: 'Teaching Exams', subCategories: [{ name: 'PSTET (Punjab State Teacher Eligibility Test)' }, { name: 'Master Cadre' }, { name: 'ETT Teacher' }] },
    { name: 'PSPCL / PSTCL (Electricity)', subCategories: [{ name: 'Assistant Lineman (ALM)' }, { name: 'LDC / Clerk' }, { name: 'Junior Engineer' }] }
];

const RAJASTHAN_EXAMS: ExamCategory[] = [
    {
        name: 'RPSC (Rajasthan Public Service Commission)',
        subCategories: [
            { name: 'RAS (Rajasthan Administrative Services)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Sub-Inspector (SI)', tiers: [{name: 'Written Exam'}, {name: 'PET'}, {name: 'Interview'}] },
            { name: '1st Grade Teacher (School Lecturer)' },
            { name: '2nd Grade Teacher (Senior Teacher)' },
            { name: 'Assistant Professor' }
        ]
    },
    {
        name: 'RSMSSB (Rajasthan Staff Selection Board)',
        subCategories: [
            { name: 'Patwari', tiers: [{name: 'Written Exam'}] },
            { name: 'VDO (Gram Vikas Adhikari)', tiers: [{name: 'Prelims'}, {name: 'Mains'}] },
            { name: 'LDC (Lower Division Clerk)', tiers: [{name: 'Written Exam'}, {name: 'Typing Test'}] },
            { name: 'Junior Accountant' },
            { name: 'Informatics Assistant (Suchna Sahayak)' },
            { name: 'Forest Guard / Forester' }
        ]
    },
    {
        name: 'Rajasthan Police',
        subCategories: [
            { name: 'Constable', tiers: [{name: 'Written Exam'}, {name: 'PET/PST'}] }
        ]
    },
    { name: 'Teaching Exams', subCategories: [{ name: 'REET (Rajasthan Eligibility Examination for Teachers)' }, { name: '3rd Grade Teacher' }] },
    { name: 'Rajasthan High Court', subCategories: [{ name: 'LDC / JJA' }, { name: 'Stenographer' }] },
    { name: 'Electricity Companies (JVVNL / AVVNL / JDVVNL)', subCategories: [{ name: 'Technical Helper' }, { name: 'Junior Engineer' }, { name: 'Commercial Assistant' }] }
];

const UTTAR_PRADESH_EXAMS: ExamCategory[] = [
    {
        name: 'UPPSC (Uttar Pradesh Public Service Commission)',
        subCategories: [
            { name: 'PCS (Provincial Civil Services)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'RO / ARO (Review Officer)', tiers: [{name: 'Prelims'}, {name: 'Mains'}] },
            { name: 'Polytechnic Lecturer' },
            { name: 'Staff Nurse' }
        ]
    },
    {
        name: 'UPSSSC (Uttar Pradesh Subordinate Services Selection Board)',
        subCategories: [
            { name: 'PET (Preliminary Eligibility Test)', tiers: [{name: 'Written Exam'}] },
            { name: 'Lekhpal (Revenue / Chakbandi)', tiers: [{name: 'Mains (Shortlisting via PET)'}] },
            { name: 'VDO (Village Development Officer)' },
            { name: 'Junior Assistant', tiers: [{name: 'Written Exam'}, {name: 'Typing Test'}] },
            { name: 'ANM (Health Worker)' }
        ]
    },
    {
        name: 'UP Police Recruitment',
        subCategories: [
            { name: 'Sub-Inspector (SI)', tiers: [{name: 'Online Written Exam'}, {name: 'DV & PST'}, {name: 'PET'}] },
            { name: 'Constable', tiers: [{name: 'Written Exam'}, {name: 'DV & PST'}, {name: 'PET'}] },
            { name: 'Radio Operator' }
        ]
    },
    {
        name: 'Teaching Exams',
        subCategories: [
            { name: 'UPTET (Uttar Pradesh Teacher Eligibility Test)' },
            { name: 'Super TET (Primary Teacher Recruitment)' },
            { name: 'TGT / PGT (UPSESSB)' }
        ]
    },
    { name: 'UPPCL (Uttar Pradesh Power Corporation)', subCategories: [{ name: 'Executive Assistant' }, { name: 'Technician (Electrical)' }, { name: 'Junior Engineer' }] },
    { name: 'Allahabad High Court', subCategories: [{ name: 'Review Officer (RO)' }, { name: 'Assistant Review Officer (ARO)' }, { name: 'Group C & D' }] }
];

const UTTARAKHAND_EXAMS: ExamCategory[] = [
    {
        name: 'UKPSC (Uttarakhand Public Service Commission)',
        subCategories: [
            { name: 'PCS (Upper)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Lower PCS (Naib Tehsildar etc.)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'RO / ARO', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Typing Test'}] },
            { name: 'Junior Engineer (JE)' },
            { name: 'Patwari / Lekhpal' },
            { name: 'Forest Guard' }
        ]
    },
    {
        name: 'UKSSSC (Uttarakhand Subordinate Service Selection Commission)',
        subCategories: [
            { name: 'Group C (Samuh G) General Paper' },
            { name: 'VDO / VPDO' },
            { name: 'Junior Assistant' },
            { name: 'LT Grade Teacher' }
        ]
    },
    { name: 'Uttarakhand Police', subCategories: [{ name: 'Constable' }, { name: 'Sub-Inspector' }, { name: 'Fireman' }] },
    { name: 'UTET (Uttarakhand Teacher Eligibility Test)', subCategories: [{ name: 'Paper I' }, { name: 'Paper II' }] }
];

const WEST_BENGAL_EXAMS: ExamCategory[] = [
    {
        name: 'WBPSC (West Bengal Public Service Commission)',
        subCategories: [
            { name: 'WBCS (West Bengal Civil Service)', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Miscellaneous Services', tiers: [{name: 'Prelims'}, {name: 'Mains'}, {name: 'Interview'}] },
            { name: 'Clerkship', tiers: [{name: 'Part I (Objective)'}, {name: 'Part II (Conventional)'}, {name: 'Typing Test'}] },
            { name: 'Audit & Accounts Service' },
            { name: 'ICDS Supervisor' }
        ]
    },
    {
        name: 'WBSSC (West Bengal School Service Commission)',
        subCategories: [
            { name: 'SLST (State Level Selection Test) - Assistant Teacher' },
            { name: 'Group C (Clerk)' },
            { name: 'Group D (Peon)' }
        ]
    },
    {
        name: 'West Bengal Police (WBPRB)',
        subCategories: [
            { name: 'Constable (WB Police / Kolkata Police)', tiers: [{name: 'Prelims'}, {name: 'PMT & PET'}, {name: 'Final Written Exam'}, {name: 'Interview'}] },
            { name: 'Sub-Inspector (SI)', tiers: [{name: 'Prelims'}, {name: 'PMT & PET'}, {name: 'Final Combined Competitive Exam'}, {name: 'Personality Test'}] },
            { name: 'Wireless Operator' }
        ]
    },
    { name: 'WBTET (West Bengal Primary TET)' },
    { name: 'WBSEDCL / WBSETCL (Electricity)', subCategories: [{ name: 'Office Executive' }, { name: 'Junior Engineer' }, { name: 'Technical Assistant' }] },
    { name: 'WB Health Recruitment Board', subCategories: [{ name: 'Staff Nurse' }, { name: 'Medical Officer' }] }
];

// --- North East States ---

const MANIPUR_EXAMS: ExamCategory[] = [
    { name: 'MPSC (Manipur Public Service Commission)', subCategories: [{ name: 'Manipur Civil Services (MCS)' }] },
    { name: 'Manipur Police', subCategories: [{ name: 'Sub-Inspector' }, { name: 'Constable' }, { name: 'Rifleman' }] },
    { name: 'Teaching', subCategories: [{ name: 'Manipur TET' }, { name: 'Graduate Teacher' }] },
    { name: 'MSSSB (Manipur Staff Selection)', subCategories: [{ name: 'Office Assistant' }, { name: 'Grade IV' }] }
];

const MEGHALAYA_EXAMS: ExamCategory[] = [
    { name: 'MPSC (Meghalaya Public Service Commission)', subCategories: [{ name: 'MCS (Meghalaya Civil Service)' }, { name: 'MPS (Meghalaya Police Service)' }, { name: 'LDA (Lower Division Assistant)' }] },
    { name: 'Meghalaya Police', subCategories: [{ name: 'UB Sub-Inspector' }, { name: 'UB/AB Constable' }] },
    { name: 'District Selection Committees (DSC)', subCategories: [{ name: 'Grade III' }, { name: 'Grade IV' }] },
    { name: 'MTET (Meghalaya Teacher Eligibility Test)' }
];

const MIZORAM_EXAMS: ExamCategory[] = [
    { name: 'MPSC (Mizoram Public Service Commission)', subCategories: [{ name: 'MCS (Mizoram Civil Service)' }, { name: 'MFaS (Finance & Accounts)' }] },
    { name: 'MSSSB (Mizoram Subordinate Services)', subCategories: [{ name: 'LDC' }, { name: 'Assistant' }] },
    { name: 'Mizoram Police', subCategories: [{ name: 'Constable' }, { name: 'Sub-Inspector' }] },
    { name: 'MTET (Mizoram Teacher Eligibility Test)' }
];

const NAGALAND_EXAMS: ExamCategory[] = [
    { name: 'NPSC (Nagaland Public Service Commission)', subCategories: [{ name: 'NCS, NPS, NSS & Allied Services' }, { name: 'Combined Technical Services' }] },
    { name: 'NSSB (Nagaland Staff Selection Board)', subCategories: [{ name: 'Group C' }] },
    { name: 'Nagaland Police', subCategories: [{ name: 'UBSI (Sub-Inspector)' }, { name: 'Constable' }] },
    { name: 'N-TET (Nagaland Teacher Eligibility Test)' }
];

const SIKKIM_EXAMS: ExamCategory[] = [
    { name: 'SPSC (Sikkim Public Service Commission)', subCategories: [{ name: 'Under Secretary' }, { name: 'Accounts Officer' }] },
    { name: 'Sikkim Police', subCategories: [{ name: 'Constable' }, { name: 'Sub-Inspector' }] },
    { name: 'STET (Sikkim Teacher Eligibility Test)' }
];

const TRIPURA_EXAMS: ExamCategory[] = [
    { name: 'TPSC (Tripura Public Service Commission)', subCategories: [{ name: 'TCS / TPS (Civil/Police Service)' }, { name: 'Combined Competitive Exam' }] },
    { name: 'JRBT (Joint Recruitment Board)', subCategories: [{ name: 'Group C' }, { name: 'Group D' }] },
    { name: 'Tripura Police', subCategories: [{ name: 'Constable' }, { name: 'Sub-Inspector' }] },
    { name: 'T-TET (Tripura Teachers Eligibility Test)' }
];

// --- Additional States (Brief Entries to prevent empty selections) ---

const ARUNACHAL_PRADESH_EXAMS: ExamCategory[] = [
    { name: 'APPSC (Arunachal Pradesh PSC)', subCategories: [{ name: 'APPS/APCS (Combined)' }] },
    { name: 'APSSB (Staff Selection)', subCategories: [{ name: 'UDC/LDC' }, { name: 'Constable' }] },
    { name: 'Arunachal Police' },
    { name: 'APTET' }
];

const ASSAM_EXAMS: ExamCategory[] = [
    { name: 'APSC (Assam Public Service Commission)', subCategories: [{ name: 'CCE (Combined Competitive Exam)' }] },
    { name: 'Assam Police', subCategories: [{ name: 'Sub-Inspector' }, { name: 'Constable' }] },
    { name: 'ADRE (Assam Direct Recruitment)', subCategories: [{ name: 'Grade III' }, { name: 'Grade IV' }] },
    { name: 'Assam TET' }
];

const BIHAR_EXAMS: ExamCategory[] = [
    { name: 'BPSC', subCategories: [{ name: 'CCE (Civil Services)' }, { name: 'Teacher Recruitment' }] },
    { name: 'BSSC', subCategories: [{ name: 'CGL' }, { name: 'Inter Level' }] },
    { name: 'Bihar Police', subCategories: [{ name: 'Constable' }, { name: 'SI' }] },
    { name: 'BSTET' }
];

const CHHATTISGARH_EXAMS: ExamCategory[] = [
    { name: 'CGPSC', subCategories: [{ name: 'State Service Exam' }] },
    { name: 'CG Vyapam', subCategories: [{ name: 'Patwari' }, { name: 'RI' }] },
    { name: 'CG Police' },
    { name: 'CG TET' }
];

export const EXAM_DATA = {
    national: NATIONAL_EXAMS,
    entrance: [
        { name: 'JEE Main/Advanced', subCategories: [{ name: 'B.Tech' }, { name: 'B.Arch' }] },
        { name: 'NEET (UG)', subCategories: [{ name: 'MBBS/BDS' }] },
        { name: 'GATE', subCategories: [{ name: 'M.Tech' }, { name: 'PSU Recruitment' }] },
        { name: 'CAT / XAT / MAT', subCategories: [{ name: 'MBA' }] },
        { name: 'CLAT', subCategories: [{ name: 'LLB' }, { name: 'LLM' }] },
        { name: 'CUET (UG/PG)', subCategories: [{ name: 'Central Universities' }] }
    ],
    state: {
        'Andhra Pradesh': ANDHRA_PRADESH_EXAMS,
        'Arunachal Pradesh': ARUNACHAL_PRADESH_EXAMS,
        'Assam': ASSAM_EXAMS,
        'Bihar': BIHAR_EXAMS,
        'Chhattisgarh': CHHATTISGARH_EXAMS,
        'Goa': GOA_EXAMS,
        'Gujarat': GUJARAT_EXAMS,
        'Haryana': HARYANA_EXAMS,
        'Himachal Pradesh': HIMACHAL_PRADESH_EXAMS,
        'Jharkhand': JHARKHAND_EXAMS,
        'Karnataka': KARNATAKA_EXAMS,
        'Kerala': KERALA_EXAMS,
        'Madhya Pradesh': MADHYA_PRADESH_EXAMS,
        'Maharashtra': MAHARASHTRA_EXAMS,
        'Manipur': MANIPUR_EXAMS,
        'Meghalaya': MEGHALAYA_EXAMS,
        'Mizoram': MIZORAM_EXAMS,
        'Nagaland': NAGALAND_EXAMS,
        'Odisha': ODISHA_EXAMS,
        'Punjab': PUNJAB_EXAMS,
        'Rajasthan': RAJASTHAN_EXAMS,
        'Sikkim': SIKKIM_EXAMS,
        'Tamil Nadu': TAMIL_NADU_EXAMS,
        'Telangana': TELANGANA_EXAMS,
        'Tripura': TRIPURA_EXAMS,
        'Uttar Pradesh': UTTAR_PRADESH_EXAMS,
        'Uttarakhand': UTTARAKHAND_EXAMS,
        'West Bengal': WEST_BENGAL_EXAMS
    }
};
