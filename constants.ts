import type { ExamData } from './types';

export const SELECTION_LEVELS: string[] = [
    'National Level',
    'State Level',
    'Exams by Qualification',
    '10th Class (CBSE)',
];

export const CBSE_10_SUBJECTS: string[] = [
    'Mathematics',
    'Science (Physics, Chemistry, Biology)',
    'Social Science (History, Civics, Geography, Economics)',
    'English (Language & Literature)',
    'Hindi (Course A/B)',
    'Computer Applications',
];

export interface StateInfo {
    name: string;
    capital: string;
}

export const INDIAN_STATES: StateInfo[] = [
    { name: 'Andaman and Nicobar Islands', capital: 'Port Blair' },
    { name: 'Andhra Pradesh', capital: 'Amaravati' },
    { name: 'Arunachal Pradesh', capital: 'Itanagar' },
    { name: 'Assam', capital: 'Dispur' },
    { name: 'Bihar', capital: 'Patna' },
    { name: 'Chandigarh', capital: 'Chandigarh' },
    { name: 'Chhattisgarh', capital: 'Raipur' },
    { name: 'Dadra and Nagar Haveli and Daman and Diu', capital: 'Daman' },
    { name: 'Delhi', capital: 'New Delhi' },
    { name: 'Goa', capital: 'Panaji' },
    { name: 'Gujarat', capital: 'Gandhinagar' },
    { name: 'Haryana', capital: 'Chandigarh' },
    { name: 'Himachal Pradesh', capital: 'Shimla' },
    { name: 'Jammu and Kashmir', capital: 'Srinagar / Jammu' },
    { name: 'Jharkhand', capital: 'Ranchi' },
    { name: 'Karnataka', capital: 'Bengaluru' },
    { name: 'Kerala', capital: 'Thiruvananthapuram' },
    { name: 'Ladakh', capital: 'Leh' },
    { name: 'Lakshadweep', capital: 'Kavaratti' },
    { name: 'Madhya Pradesh', capital: 'Bhopal' },
    { name: 'Maharashtra', capital: 'Mumbai' },
    { name: 'Manipur', capital: 'Imphal' },
    { name: 'Meghalaya', capital: 'Shillong' },
    { name: 'Mizoram', capital: 'Aizawl' },
    { name: 'Nagaland', capital: 'Kohima' },
    { name: 'Odisha', capital: 'Bhubaneswar' },
    { name: 'Puducherry', capital: 'Puducherry' },
    { name: 'Punjab', capital: 'Chandigarh' },
    { name: 'Rajasthan', capital: 'Jaipur' },
    { name: 'Sikkim', capital: 'Gangtok' },
    { name: 'Tamil Nadu', capital: 'Chennai' },
    { name: 'Telangana', capital: 'Hyderabad' },
    { name: 'Tripura', capital: 'Agartala' },
    { name: 'Uttar Pradesh', capital: 'Lucknow' },
    { name: 'Uttarakhand', capital: 'Dehradun / Gairsain' },
    { name: 'West Bengal', capital: 'Kolkata' },
];

export const LANGUAGES: string[] = [
    'English',
    'Hindi (हिन्दी)',
    'Bengali (বাংলা)',
    'Marathi (मराठी)',
    'Telugu (తెలుగు)',
    'Tamil (தமிழ்)',
    'Gujarati (ગુજરાતી)',
    'Urdu (اردو)',
    'Kannada (ಕನ್ನಡ)',
    'Odia (ଓଡ଼ିଆ)',
    'Malayalam (മലയാളം)',
    'Punjabi (ਪੰਜਾਬੀ)',
    'Assamese (অসমীয়া)',
    // Mixed Languages (Local + English)
    'Hindi (हिन्दी) + English',
    'Bengali (বাংলা) + English',
    'Marathi (मराठी) + English',
    'Telugu (తెలుగు) + English',
    'Tamil (தமிழ்) + English',
    'Gujarati (ગુજરાતી) + English',
    'Urdu (اردو) + English',
    'Kannada (ಕನ್ನಡ) + English',
    'Odia (ଓଡ଼ିଆ) + English',
    'Malayalam (മലയാളം) + English',
    'Punjabi (ਪੰਜਾਬੀ) + English',
    'Assamese (অসমীয়া) + English',
    // Mixed Languages (English + Local)
    'English + Hindi (हिन्दी)',
    'English + Bengali (বাংলা)',
    'English + Marathi (मराठी)',
    'English + Telugu (తెలుగు)',
    'English + Tamil (தமிழ்)',
    'English + Gujarati (ગુજરાતી)',
    'English + Urdu (اردو)',
    'English + Kannada (ಕನ್ನಡ)',
    'English + Odia (ଓଡ଼ିଆ)',
    'English + Malayalam (മലയാളം)',
    'English + Punjabi (ਪੰਜਾਬੀ)',
    'English + Assamese (অসমіయా)',
];

export const QUALIFICATION_CATEGORIES: string[] = [
    "10th Pass (Matriculation)",
    "12th Pass (Intermediate/HSC)",
    "Diploma (Any Stream)",
    "ITI (Industrial Training Institute)",
    "Graduate (Any Stream - BA, BCom, BSc, etc.)",
    "Graduate (Technical - B.E./B.Tech, BCA, etc.)",
    "Post Graduate (Any Stream - MA, MCom, MSc, etc.)",
    "Post Graduate (Technical - M.E./M.Tech, MCA, etc.)",
    "PhD",
    "Medical (MBBS, BDS, etc.)",
    "Law (LLB, LLM)",
];

export const DIFFICULTY_LEVELS: string[] = ['Easy', 'Medium', 'Hard', 'Expert'];

export const JOB_ROLES: string[] = [
    'IAS Officer (UPSC Civil Services)',
    'Bank PO (IBPS/SBI)',
    'SSC CGL Officer (Inspector, ASO etc.)',
    'Railway NTPC (Station Master, Clerk etc.)',
    'Defence Officer (CDS/NDA)',
    'State PCS Officer',
    'Teacher (TGT/PGT)',
    'Police Constable/Sub-Inspector',
    'Stenographer',
    'Junior Engineer',
];

export const APTITUDE_TOPICS: string[] = [
    // Quantitative Aptitude
    'Percentages',
    'Profit and Loss',
    'Simple & Compound Interest',
    'Time and Work',
    'Time, Speed, and Distance',
    'Ratio and Proportion',
    'Averages',
    'Number Systems',
    'Algebra',
    'Mixtures & Alligations',
    // Reasoning
    'Coding-Decoding',
    'Blood Relations',
    'Syllogism',
    'Seating Arrangement',
    'Puzzles',
    'Direction Sense',
    'Number Series',
    'Analogies',
    'Classification',
    'Statement & Conclusions',
];


export const EXAM_DATA: ExamData = {
  national: [
    {
      name: 'UPSC (Union Public Service Commission)',
      subCategories: [
        { name: 'Civil Services Exam (IAS, IPS, etc.)', tiers: [{ name: 'Prelims' }, { name: 'Mains' }, { name: 'Interview' }] },
        { name: 'Combined Defence Services (CDS) Exam' },
        { name: 'National Defence Academy (NDA) & Naval Academy (NA) Exam' },
        { name: 'Indian Forest Service (IFS) Exam' },
        { name: 'Engineering Services Examination (ESE)' },
        { name: 'Combined Medical Services (CMS) Exam' },
        { name: 'Indian Economic Service/Indian Statistical Service (IES/ISS)' },
        { name: 'Central Armed Police Forces (CAPF) Exam' },
      ],
    },
    {
      name: 'SSC (Staff Selection Commission)',
      subCategories: [
        { name: 'Combined Graduate Level (CGL)', tiers: [{name: 'Tier-I'}, {name: 'Tier-II'}] },
        { name: 'Combined Higher Secondary Level (CHSL)', tiers: [{name: 'Tier-I'}, {name: 'Tier-II'}] },
        { name: 'Stenographer Grade C & D' },
        { name: 'Junior Engineer (JE)' },
        { name: 'Multi Tasking Staff (MTS)' },
        { name: 'Constable (GD) in CAPFs, NIA, SSF' },
        { name: 'SSC CPO (Sub-Inspector in Delhi Police & CAPFs)' },
        { name: 'Junior Hindi Translator (JHT)' },
        { name: 'Selection Posts (Phase Exams)' },
      ],
    },
    {
      name: 'Banking (IBPS, SBI, RBI)',
      subCategories: [
        { name: 'IBPS PO (Probationary Officer)', tiers: [{name: 'Prelims'}, {name: 'Mains'}] },
        { name: 'IBPS Clerk', tiers: [{name: 'Prelims'}, {name: 'Mains'}] },
        { name: 'IBPS RRB (Regional Rural Banks) - Officer Scale I' },
        { name: 'IBPS RRB - Office Assistant (Multipurpose)' },
        { name: 'IBPS SO (Specialist Officer)' },
        { name: 'SBI PO (Probationary Officer)', tiers: [{name: 'Prelims'}, {name: 'Mains'}] },
        { name: 'SBI Clerk (Junior Associate)', tiers: [{name: 'Prelims'}, {name: 'Mains'}] },
        { name: 'SBI SO (Specialist Officer)' },
        { name: 'RBI Grade B Officer' },
        { name: 'RBI Assistant' },
      ],
    },
    {
      name: 'Insurance',
      subCategories: [
          { name: 'LIC AAO (Assistant Administrative Officer)' },
          { name: 'LIC ADO (Apprentice Development Officer)' },
          { name: 'LIC Assistant' },
          { name: 'NIACL Assistant' },
          { name: 'NIACL AO (Administrative Officer)' },
          { name: 'UIIC Assistant' },
          { name: 'UIIC AO (Administrative Officer)' },
          { name: 'OICL AO (Administrative Officer)' },
          { name: 'IRDAI Assistant Manager' },
      ],
    },
    {
      name: 'Railways (RRB)',
      subCategories: [
        { name: 'RRB NTPC (Non-Technical Popular Categories)' },
        { name: 'RRB Group D' },
        { name: 'RRB ALP (Assistant Loco Pilot)' },
        { name: 'RRB JE (Junior Engineer)' },
        { name: 'RPF Constable & SI' },
      ],
    },
    {
        name: 'Defence & Paramilitary',
        subCategories: [
            { name: 'AFCAT (Air Force Common Admission Test)' },
            { name: 'INET (Indian Navy Entrance Test)' },
            { name: 'Indian Army Technical Entry Scheme (TES)' },
            { name: 'Indian Army Soldier Tradesman/GD/Clerk' },
            { name: 'Indian Coast Guard Navik/Yantrik' },
            { name: 'BSF Constable/Head Constable' },
            { name: 'CRPF Constable/Head Constable' },
            { name: 'CISF Constable/Head Constable' },
            { name: 'ITBP Constable/Head Constable' },
            { name: 'Assam Rifles Recruitment' },
        ]
    },
    {
        name: 'Teaching',
        subCategories: [
            { name: 'CTET (Central Teacher Eligibility Test)' },
            { name: 'UGC NET (National Eligibility Test)' },
            { name: 'CSIR UGC NET' },
            { name: 'KVS (Kendriya Vidyalaya Sangathan) Recruitment' },
            { name: 'NVS (Navodaya Vidyalaya Samiti) Recruitment' },
        ]
    },
    {
      name: 'PSU & Other National Agencies',
      subCategories: [
          // Core Entrance / Gateway
          { name: 'GATE (Graduate Aptitude Test in Engineering)' },
          // Scientific & Research
          { name: 'ISRO Scientist/Engineer' },
          { name: 'DRDO (CEPTAM, SET)' },
          { name: 'BARC Scientific Officer' },
          // Intelligence & Security
          { name: 'Intelligence Bureau (IB) ACIO/Security Assistant' },
          // Financial & Regulatory
          { name: 'SEBI Grade A (Assistant Manager)' },
          { name: 'NABARD Grade A/B' },
          { name: 'SIDBI Grade A' },
          { name: 'EPFO (Employees Provident Fund Org) SSA/Steno' },
          { name: 'ESIC (Employees State Insurance Corp) UDC/MTS' },
          // Maharatna PSUs
          { name: 'NTPC Executive Trainee' },
          { name: 'ONGC Graduate Trainee' },
          { name: 'Coal India (CIL) Management Trainee' },
          { name: 'SAIL Management Trainee' },
          { name: 'IOCL Recruitment (Engineers/Officers)' },
          { name: 'BPCL/HPCL Recruitment' },
          { name: 'BHEL Engineer Trainee' },
          { name: 'GAIL Executive Trainee' },
          { name: 'Power Grid (PGCIL) Engineer Trainee' },
          // Navratna & Miniratna PSUs
          { name: 'NPCIL Executive Trainee' },
          { name: 'HAL (Hindustan Aeronautics Limited) Recruitment' },
          { name: 'BEL (Bharat Electronics Limited) Recruitment' },
          { name: 'NLC India Limited Recruitment' },
          { name: 'RINL (Vizag Steel) Management Trainee' },
          // Other Agencies & Corporations
          { name: 'FCI (Food Corporation of India) Recruitment' },
          { name: 'AAI (Airports Authority of India) Recruitment' },
          { name: 'DMRC (Delhi Metro Rail Corporation) Recruitment' },
      ],
    },
  ],
  state: {
    'Andaman and Nicobar Islands': [
        {
            name: 'General Administration Dept (A&N)',
            subCategories: [
                { name: 'Lower/Upper Division Clerk (LDC/UDC)' },
                { name: 'Stenographer (Grade C & D)' },
                { name: 'Data Entry Operator (DEO)' },
                { name: 'Multi Tasking Staff (MTS)' },
                { name: 'Assistant Section Officer (ASO)' },
                { name: 'Store Keeper / Technical Assistant' },
            ],
        },
        {
            name: 'A&N Police & Home Department',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Driver Constable / Radio Operator' },
                { name: 'Fireman / Jail Warder' },
            ],
        },
        {
            name: 'Directorate of Education',
            subCategories: [
                { name: 'CTET / ANTET' },
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'PET / Librarian / Art Teacher' },
                { name: 'Non-Teaching Staff (JA, DEO, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Panchayat Secretary / GPDO' },
                { name: 'Extension Officer (Panchayat Raj)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Electricity & Power Department',
            subCategories: [
                { name: 'Junior Engineer (JE) - Electrical/Civil' },
                { name: 'Lineman / Technician' },
                { name: 'Sub Station Attendant' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Health & Family Welfare Dept',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Forest & Environment Dept',
            subCategories: [
                { name: 'Forest Guard' },
                { name: 'Forester / Forest Labourer' },
                { name: 'Wildlife Guard' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Fisheries Development Officer' },
                { name: 'Horticulture Officer' },
                { name: 'Livestock Inspector / Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant' },
                { name: 'Town Planning Assistant' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Welfare Officer' },
            ],
        },
        {
            name: 'Autonomous Bodies',
            subCategories: [
                { name: 'Jawahar Navodaya Vidyalaya (JNV) Staff' },
                { name: 'Kendriya Vidyalaya (KV) Staff' },
                { name: 'Andaman Law College / DIET Staff' },
            ],
        },
    ],
    'Andhra Pradesh': [
        {
            name: 'APPSC (Andhra Pradesh Public Service Commission)',
            subCategories: [
                { name: 'Group-I Services (Deputy Collector, DSP, etc.)' },
                { name: 'Group-II Services (Municipal Commissioner, ATO, etc.)' },
                { name: 'Group-III Services (Junior Accountants, Typists, etc.)' },
                { name: 'Group-IV Services (Junior Assistants, Bill Collectors, etc.)' },
                { name: 'AEE (Assistant Executive Engineer)' },
                { name: 'Panchayat Secretary Grade-II' },
                { name: 'Divisional Accounts Officer' },
                { name: 'Gazetted & Non-Gazetted Posts' },
                { name: 'Departmental Tests' },
            ],
        },
        {
            name: 'AP Police Department',
            subCategories: [
                { name: 'Police Constable (PC)' },
                { name: 'Sub Inspector (SI)' },
                { name: 'Fireman / Driver cum Pump Operator' },
                { name: 'Warder / Jail Warder' },
                { name: 'Police Radio Mechanic / Technician' },
                { name: 'Excise Constable / SI' },
            ],
        },
        {
            name: 'AP DSC (School Education Dept)',
            subCategories: [
                { name: 'School Assistant (SA) - TGT' },
                { name: 'Secondary Grade Teacher (SGT)' },
                { name: 'Physical Education Teacher (PET)' },
                { name: 'Music/Drawing Teacher' },
                { name: 'Headmaster / Headmistress (HM)' },
                { name: 'Gurukulam Teacher Posts' },
                { name: 'Non-Teaching Staff' },
            ],
        },
        {
            name: 'Rural Development & Panchayat Raj',
            subCategories: [
                { name: 'VRO (Village Revenue Officer)' },
                { name: 'VRA (Village Revenue Assistant)' },
                { name: 'Panchayat Secretary Grade-I / II' },
                { name: 'Welfare & Extension Officer (WEO)' },
            ],
        },
        {
            name: 'APTRANSCO / APGENCO (Power Sector)',
            subCategories: [
                { name: 'AE (Assistant Engineer) - Electrical/Civil' },
                { name: 'Junior Plant Operator (JPO)' },
                { name: 'Junior Lineman (JLM) / Sub-Engineer' },
                { name: 'Junior Accounts Officer (JAO)' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'APCOB (Staff Assistant, Managers)' },
                { name: 'APGVB (Officer Scale-I, Office Assistant)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'AP High Court & Judiciary',
            subCategories: [
                { name: 'Junior Assistant, Typist, Stenographer' },
                { name: 'Civil Judge (Junior Division)' },
                { name: 'Examiner, Process Server, Field Officer' },
            ],
        },
        {
            name: 'Health, Medical & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse (Grade-II)' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer' },
                { name: 'AYUSH Medical Officers' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Co-operation',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Extension Officer' },
                { name: 'Fisheries / Sericulture Extension Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Officer / Assistant' },
                { name: 'Town Planning Assistant' },
                { name: 'Lecturers in Degree Colleges' },
                { name: 'APSRTC (Conductor, Driver, JA)' },
                { name: 'Hostel Welfare Officers' },
            ],
        },
    ],
    'Arunachal Pradesh': [
        {
            name: 'APPSC (Arunachal Pradesh PSC)',
            subCategories: [
                { name: 'Combined Competitive Exam (CCE) - APAS, APPS, APFS' },
                { name: 'Assistant Engineer (Civil, Mechanical, Electrical)' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Panchayat Secretary / Extension Officer' },
                { name: 'LDC / UDC / Stenographer / DEO' },
                { name: 'Departmental Exams' },
            ],
        },
        {
            name: 'Arunachal Pradesh Police Dept',
            subCategories: [
                { name: 'Constable (GD & Tradesmen)' },
                { name: 'Sub Inspector (SI)' },
                { name: 'Driver Constable' },
                { name: 'Wireless Operator / Radio Technician' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Department of School Education',
            subCategories: [
                { name: 'Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Primary Teacher (PRT)' },
                { name: 'Librarian / PET / Special Educator' },
                { name: 'Non-Teaching Staff (JA, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Gram Sevak / Panchayat Secretary' },
                { name: 'Village Development Officer (VDO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Power & Engineering Departments',
            subCategories: [
                { name: 'Junior Engineer (JE) - Electrical/Civil' },
                { name: 'Lineman / Technician Grade-III' },
                { name: 'Assistant Accounts Officer (AAO)' },
            ],
        },
        {
            name: 'Cooperative & Banking Sector',
            subCategories: [
                { name: 'Arunachal Pradesh State Cooperative Apex Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc Nursing)' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Lecturer in Govt Colleges' },
                { name: 'Forest Guard / Forester' },
                { name: 'Tourist Guide / Facilitator' },
            ],
        },
    ],
    'Assam': [
        {
            name: 'APSC (Assam Public Service Commission)',
            subCategories: [
                { name: 'Combined Competitive Exam (CCE) - ACS, APS' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Junior Administrative Assistant (JAA)' },
                { name: 'Inspector of Statistics / Labour Inspector' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'Departmental Exams' },
            ],
        },
        {
            name: 'Assam Police & Allied Forces (SLPRB)',
            subCategories: [
                { name: 'Sub Inspector (SI) - UB & AB' },
                { name: 'Police Constable (Grade III, IV)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Commando Battalion Civilian Posts' },
                { name: 'Wireless Operator / Radio Technician' },
            ],
        },
        {
            name: 'Department of School Education (DSE)',
            subCategories: [
                { name: 'Assam TET (Teacher Eligibility Test)' },
                { name: 'Lower/Upper Primary Teacher' },
                { name: 'Secondary Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Non-Teaching Staff (JA, Lab Assistant)' },
            ],
        },
        {
            name: 'Rural Development (P&RD)',
            subCategories: [
                { name: 'Gaon Panchayat Secretary (GPS)' },
                { name: 'Village Extension Officer (VEO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Power Sector (APDCL, APGCL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Office cum Field Assistant (OFA)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Assam Co-operative Apex Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Field Officer)' },
            ],
        },
        {
            name: 'High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Tourist Guide / Handloom Inspector' },
            ],
        },
    ],
    'Bihar': [
        {
            name: 'BPSC (Bihar Public Service Commission)',
            subCategories: [
                { name: 'Combined Competitive Exam (CCE) - BAS, BPS' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'Block Development Officer (BDO)' },
                { name: 'Departmental Exams' },
            ],
        },
        {
            name: 'Bihar Police (BPSSC / CSBC)',
            subCategories: [
                { name: 'Sub Inspector (SI) - Daroga' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Excise Constable / SI' },
                { name: 'Prohibition Constable' },
            ],
        },
        {
            name: 'Department of Education (BSEB)',
            subCategories: [
                { name: 'Bihar TET (Teacher Eligibility Test)' },
                { name: 'Primary / Upper Primary Teacher' },
                { name: 'Secondary Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Non-Teaching Staff (JA, Lab Assistant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Gram Sevak / Panchayat Secretary' },
                { name: 'Village Development Officer (VDO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Power Sector (BSPHCL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Bihar State Cooperative Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'Patna High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer (BC/SC/ST)' },
            ],
        },
    ],
    'Chandigarh': [
        {
            name: 'General Administration Dept (GAD)',
            subCategories: [
                { name: 'Junior Engineer (JE) - Civil, Electrical, Mechanical' },
                { name: 'Assistant / Clerk / DEO' },
                { name: 'Stenographer (Grade III)' },
                { name: 'LDC / UDC' },
                { name: 'Librarian / Store Keeper' },
            ],
        },
        {
            name: 'Chandigarh Police Department',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Constable (GD & Tradesmen)' },
                { name: 'Driver Constable / Wireless Operator' },
            ],
        },
        {
            name: 'Department of Education',
            subCategories: [
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'PET / Librarian' },
                { name: 'Non-Teaching Staff (JA, DEO)' },
            ],
        },
        {
            name: 'Electricity Department',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Chandigarh State Cooperative Bank (Clerk, Officer)' },
            ],
        },
        {
            name: 'Punjab & Haryana High Court',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Municipal Corporation Chandigarh (MCC)',
            subCategories: [
                { name: 'Town Planning Assistant' },
                { name: 'Sanitary / Health Inspector' },
                { name: 'Junior Engineer (Civil) - MCC' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Social Welfare Officer' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard' },
                { name: 'Tourist Guide' },
            ],
        },
        {
            name: 'Universities & Autonomous Bodies',
            subCategories: [
                { name: 'Panjab University (PU) Staff' },
                { name: 'PGIMER Staff (Scientist, Technician, Nurse)' },
                { name: 'NIPER Staff' },
            ],
        },
    ],
    'Chhattisgarh': [
        {
            name: 'CGPSC (Chhattisgarh Public Service Commission)',
            subCategories: [
                { name: 'State Civil Services Exam (Deputy Collector, DSP)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'State Accounts / Finance Service' },
            ],
        },
        {
            name: 'Chhattisgarh Police (CG Vyapam)',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Platoon Commander' },
            ],
        },
        {
            name: 'Department of School Education',
            subCategories: [
                { name: 'CG TET (Teacher Eligibility Test)' },
                { name: 'Primary / TGT / PGT Teacher' },
                { name: 'PET / Librarian / Art Teacher' },
                { name: 'Non-Teaching Staff' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Panchayat Secretary / Gram Sevak' },
                { name: 'Village Development Officer (VDO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Power Sector (CSPGCL / CSPDCL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Chhattisgarh Rajya Gramin Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Field Officer)' },
            ],
        },
        {
            name: 'Chhattisgarh High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer (BC/SC/ST)' },
            ],
        },
    ],
    'Dadra and Nagar Haveli and Daman and Diu': [
        {
            name: 'General Administration Dept (GAD)',
            subCategories: [
                { name: 'Lower/Upper Division Clerk (LDC/UDC)' },
                { name: 'Stenographer (Grade III)' },
                { name: 'Data Entry Operator (DEO)' },
                { name: 'Multi Tasking Staff (MTS)' },
            ],
        },
        {
            name: 'Police & Home Department',
            subCategories: [
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Sub Inspector (SI)' },
                { name: 'Driver Constable / Wireless Operator' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Directorate of Education',
            subCategories: [
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Non-Teaching Staff (Clerk, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural & Urban Development',
            subCategories: [
                { name: 'Village Panchayat Secretary' },
                { name: 'Anganwadi Worker / Helper' },
                { name: 'Junior Engineer (JE) - Civil' },
                { name: 'Municipal Clerk / Sanitary Inspector' },
            ],
        },
        {
            name: 'Electricity / Power Department',
            subCategories: [
                { name: 'Lineman / Technician' },
                { name: 'Junior Engineer (JE) - Electrical' },
                { name: 'Office Assistant / Store Keeper' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Forest Guard / Forester' },
                { name: 'Statistical Assistant' },
                { name: 'Welfare Officer (SC/ST)' },
                { name: 'Tourist Facilitator' },
            ],
        },
    ],
    'Delhi': [
        {
            name: 'DSSSB (Delhi Subordinate Services Selection Board)',
            subCategories: [
                { name: 'LDC / UDC / Junior Assistant / DEO' },
                { name: 'Patwari / Revenue Clerk' },
                { name: 'TGT / PGT / PRT / Special Educator' },
                { name: 'Nurse / Pharmacist / Lab Technician' },
                { name: 'Junior Engineer (JE) - Civil, Electrical, Mechanical' },
                { name: 'Legal Assistant / Stenographer / Librarian' },
                { name: 'Welfare Officer / Extension Officer' },
                { name: 'Statistical Assistant' },
                { name: 'Municipal Officer / Sanitary Inspector' },
            ],
        },
        {
            name: 'DPSC (Delhi Public Service Commission)',
            subCategories: [
                { name: 'Delhi Administrative Service (DAS) / DANICS' },
                { name: 'Assistant Engineer (AE) - Civil, Electrical, Mechanical' },
                { name: 'Lecturer (in Delhi Govt Colleges)' },
                { name: 'Delhi Judicial Service' },
            ],
        },
        {
            name: 'Delhi Police Department',
            subCategories: [
                { name: 'Sub Inspector (SI) - via SSC CPO' },
                { name: 'Police Constable (Executive, Tradesmen, Driver)' },
                { name: 'Head Constable (Ministerial / AWO/TPO)' },
                { name: 'Jail Warder / Fire Operator' },
            ],
        },
        {
            name: 'Directorate of Education (EDUDEL)',
            subCategories: [
                { name: 'Delhi Teacher Eligibility Test (DTET)' },
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
            ],
        },
        {
            name: 'Municipal Corporation of Delhi (MCD)',
            subCategories: [
                { name: 'Sanitary Inspector / Tax Inspector / JE' },
                { name: 'Clerk / DEO / Stenographer' },
            ],
        },
        {
            name: 'Delhi High Court & Judiciary',
            subCategories: [
                { name: 'Delhi Judicial Services (Civil Judge)' },
                { name: 'Junior Judicial Assistant (JJA) / Clerk' },
            ],
        },
        {
            name: 'Health & Family Welfare Dept',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard' },
                { name: 'Anganwadi Worker / Supervisor' },
            ],
        },
        {
            name: 'Universities & Autonomous Bodies',
            subCategories: [
                { name: 'Delhi University (DU) Staff' },
                { name: 'JNU / Jamia Millia Islamia Staff' },
                { name: 'Delhi Technological University (DTU) Staff' },
            ],
        },
    ],
    'Goa': [
        {
            name: 'GPSC (Goa Public Service Commission)',
            subCategories: [
                { name: 'Goa Civil Services (CCCE) - Deputy Collector, DSP' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Junior Scale Officer (JSO)' },
                { name: 'Forest Range Officer (FRO)' },
            ],
        },
        {
            name: 'Goa Police & Home Department',
            subCategories: [
                { name: 'Police Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Armed)' },
                { name: 'Driver Constable / Wireless Operator' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Directorate of Education (DoE)',
            subCategories: [
                { name: 'Goa TET (Teacher Eligibility Test)' },
                { name: 'Primary / TGT / PGT Teacher' },
                { name: 'PET / Librarian / Art Teacher' },
                { name: 'Non-Teaching Staff (Clerk, DEO)' },
            ],
        },
        {
            name: 'Rural Development & Panchayat Raj',
            subCategories: [
                { name: 'Panchayat Secretary / VPO' },
                { name: 'Extension Officer' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Goa Electricity Department (GED)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Goa State Cooperative Bank (Clerk, Officer)' },
            ],
        },
        {
            name: 'Goa High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Fisheries Inspector' },
                { name: 'Horticulture Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer (BC/SC/ST)' },
            ],
        },
    ],
    'Gujarat': [
        {
            name: 'GPSC (Gujarat Public Service Commission)',
            subCategories: [
                { name: 'Gujarat Civil Services (GAS, GDS, GFS) - CCE' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Municipal Chief Officer (MCO)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
            ],
        },
        {
            name: 'Gujarat Police (GSSSB)',
            subCategories: [
                { name: 'Police Sub Inspector (PSI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Sipahi / Fireman' },
                { name: 'Driver Constable / Wireless Operator' },
            ],
        },
        {
            name: 'Department of School Education (GSEB)',
            subCategories: [
                { name: 'Gujarat TET (GTET)' },
                { name: 'Primary / Upper Primary Teacher' },
                { name: 'Secondary / PGT Teacher' },
                { name: 'Non-Teaching Staff (Clerk, Lab Assistant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayat Raj',
            subCategories: [
                { name: 'Gram Sevak / Talati cum Mantri' },
                { name: 'Junior Clerk (Panchayat)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Power Sector (GETCO, GUVNL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Gujarat State Co-operative Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'Gujarat High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Livestock Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer (BC/SC/ST)' },
            ],
        },
    ],
    'Haryana': [
        {
            name: 'HPSC (Haryana Public Service Commission)',
            subCategories: [
                { name: 'Haryana Civil Services (HCS)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'Agriculture Development Officer' },
            ],
        },
        {
            name: 'Haryana Police (HSSC)',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fire Operator' },
                { name: 'Radio Operator' },
            ],
        },
        {
            name: 'Department of School Education (HBSE)',
            subCategories: [
                { name: 'HTET (Haryana Teacher Eligibility Test)' },
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Gram Sachiv / Panchayat Secretary' },
                { name: 'Patwari / Kanungo' },
                { name: 'Revenue Clerk / Accountant' },
            ],
        },
        {
            name: 'Power Sector (UHBVN, DHBVN)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Haryana State Cooperative Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'Punjab & Haryana High Court',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Livestock Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer (BC/SC/ST)' },
            ],
        },
    ],
    'Himachal Pradesh': [
        {
            name: 'HPSC (Himachal Pradesh PSC)',
            subCategories: [
                { name: 'HPAS (Himachal Pradesh Administrative Services)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'Horticulture Development Officer' },
            ],
        },
        {
            name: 'Himachal Pradesh Police',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Driver Constable / Wireless Operator' },
            ],
        },
        {
            name: 'Department of School Education (HPBOSE)',
            subCategories: [
                { name: 'HTET (HP Teacher Eligibility Test)' },
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Patwari / Kanungo' },
                { name: 'Gram Sachiv / Panchayat Secretary' },
                { name: 'Extension Officer' },
            ],
        },
        {
            name: 'Power & Engineering Dept (HPSEBL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Himachal Pradesh State Cooperative Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'Himachal Pradesh High Court',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer (BC/SC/ST)' },
            ],
        },
    ],
    'Jammu and Kashmir': [
        {
            name: 'JKPSC (Jammu & Kashmir PSC)',
            subCategories: [
                { name: 'Combined Competitive Exam (CCE) - KAS' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'Medical Officer' },
                { name: 'JKPSC Departmental Examinations' },
            ],
        },
        {
            name: 'J&K Police & Home Department',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Driver Constable / Radio Operator' },
            ],
        },
        {
            name: 'Department of School Education',
            subCategories: [
                { name: 'CTET / UTET' },
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Non-Teaching Staff (JA, Clerk, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Patwari / Kanungo' },
                { name: 'Panchayat Secretary / VLW' },
                { name: 'Social Education & Extension Officer (SEEO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Power Development Department (PDD) / JKPCL',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'J&K Grameen Bank / J&K State Cooperative Bank - Clerk/Officer' },
                { name: 'DCCB - Clerk/Manager' },
            ],
        },
        {
            name: 'J&K High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Health & Medical Education',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Livestock / Sheep Husbandry Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer' },
            ],
        },
    ],
    'Jharkhand': [
        {
            name: 'JPSC (Jharkhand Public Service Commission)',
            subCategories: [
                { name: 'Combined Civil Services (JCS) Exam' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'Divisional Officer' },
            ],
        },
        {
            name: 'Jharkhand Police (JSSC)',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Driver Constable / Radio Operator' },
            ],
        },
        {
            name: 'Department of School Education (JAC)',
            subCategories: [
                { name: 'JTET (Jharkhand Teacher Eligibility Test)' },
                { name: 'Primary / TGT / PGT Teacher' },
                { name: 'PET / Librarian / Art Teacher' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Panchayat Secretary / Gram Sachiv' },
                { name: 'Patwari / Revenue Clerk' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Power Sector (JBVNL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Jharkhand State Cooperative Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'Jharkhand High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer (BC/SC/ST)' },
            ],
        },
    ],
    'Karnataka': [
        {
            name: 'KPSC (Karnataka Public Service Commission)',
            subCategories: [
                { name: 'KAS (Karnataka Administrative Service)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Govt Colleges/Polytechnics)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'Horticulture/Agriculture Officer' },
            ],
        },
        {
            name: 'Karnataka Police (KEA)',
            subCategories: [
                { name: 'Police Sub Inspector (PSI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Driver Constable / Wireless Operator' },
            ],
        },
        {
            name: 'Department of School Education',
            subCategories: [
                { name: 'KARTET (Karnataka Teacher Eligibility Test)' },
                { name: 'Primary / TGT / PGT Teacher' },
                { name: 'PET / Librarian / Art Teacher' },
            ],
        },
        {
            name: 'Revenue & Panchayat Raj',
            subCategories: [
                { name: 'First/Second Division Assistant (FDA/SDA)' },
                { name: 'Village Accountant (VA) / Patwari' },
                { name: 'Gram Panchayat Development Officer (GPDO)' },
            ],
        },
        {
            name: 'Power Sector (KPTCL, ESCOMs)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Karnataka State Cooperative Apex Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'Karnataka High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer (BC/SC/ST)' },
            ],
        },
    ],
    'Kerala': [
        {
            name: 'KPSC (Kerala Public Service Commission)',
            subCategories: [
                { name: 'Secretariat Assistant / Auditor' },
                { name: 'LDC (Lower Division Clerk)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Village Extension Officer (VEO)' },
                { name: 'Lecturer / Polytechnic Lecturer' },
                { name: 'Forest Guard / Forest Range Officer' },
                { name: 'Excise Inspector' },
            ],
        },
        {
            name: 'Kerala Police Department',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (Civil & Armed)' },
                { name: 'Women Police Constable' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Department of General Education',
            subCategories: [
                { name: 'KTET (Kerala Teacher Eligibility Test)' },
                { name: 'High School Assistant (HSA) - TGT' },
                { name: 'Secondary School Teacher (SST) - PGT' },
                { name: 'Vocational / PET / Language Teacher' },
            ],
        },
        {
            name: 'Power Sector (KSEB)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Kerala State Cooperative Bank (Clerk, Officer)' },
                { name: 'District Cooperative Banks (DCBs)' },
            ],
        },
        {
            name: 'Kerala High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Surgeon' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Officer' },
                { name: 'Fisheries / Sericulture Inspector' },
            ],
        },
        {
            name: 'Transport (KSRTC, MVD)',
            subCategories: [
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'KSRTC Conductor / Driver / JA' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Welfare Officer (BC/SC/ST)' },
            ],
        },
    ],
    'Ladakh': [
        {
            name: 'UT Administration / GAD',
            subCategories: [
                { name: 'Lower/Upper Division Clerk (LDC/UDC)' },
                { name: 'Stenographer (Grade III)' },
                { name: 'Data Entry Operator (DEO)' },
                { name: 'Multi Tasking Staff (MTS)' },
                { name: 'Assistant Section Officer (ASO)' },
            ],
        },
        {
            name: 'Police & Home Department',
            subCategories: [
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Sub Inspector (SI)' },
                { name: 'Driver Constable / Wireless Operator' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Directorate of School Education',
            subCategories: [
                { name: 'Ladakh TET / CTET' },
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Librarian / PET' },
                { name: 'Non-Teaching Staff (Clerk, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Panchayat Secretary / VLW' },
                { name: 'Extension Officer' },
                { name: 'Anganwadi Worker / Helper' },
            ],
        },
        {
            name: 'Health & Family Welfare Dept',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'PWD / Power Department',
            subCategories: [
                { name: 'Junior Engineer (JE) - Civil/Electrical' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / Store Keeper' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Worker' },
                { name: 'Horticulture Development Assistant' },
                { name: 'Livestock Inspector / Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant' },
                { name: 'Welfare Officer (ST)' },
                { name: 'Forest Guard / Wildlife Guard' },
                { name: 'Tourist Facilitator / Guide' },
                { name: 'Municipal Clerk / Sanitary Inspector' },
            ],
        },
    ],
    'Lakshadweep': [
        {
            name: 'General Administration Dept (GAD)',
            subCategories: [
                { name: 'Lower/Upper Division Clerk (LDC/UDC)' },
                { name: 'Stenographer (Grade III)' },
                { name: 'Data Entry Operator (DEO)' },
                { name: 'Multi Tasking Staff (MTS)' },
            ],
        },
        {
            name: 'Police & Home Department',
            subCategories: [
                { name: 'Police Constable (GD)' },
                { name: 'Sub Inspector (SI)' },
                { name: 'Driver Constable / Wireless Operator' },
            ],
        },
        {
            name: 'Directorate of Education',
            subCategories: [
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Non-Teaching Staff (Clerk, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Village Panchayat Secretary' },
                { name: 'Anganwadi Worker / Helper / Supervisor' },
            ],
        },
        {
            name: 'Electricity / Power Department',
            subCategories: [
                { name: 'Lineman / Technician' },
                { name: 'Junior Engineer (JE) - Electrical' },
            ],
        },
        {
            name: 'Health & Family Welfare Dept',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Assistant / Extension Worker' },
                { name: 'Veterinary Field Assistant' },
                { name: 'Fisheries Inspector / Development Assistant' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Junior Engineer (JE) - Civil (PWD)' },
                { name: 'Fair Price Shop Inspector' },
                { name: 'Welfare Officer (ST)' },
                { name: 'Forest Guard / Eco-Development Officer' },
                { name: 'Tourist Facilitator / Guide' },
            ],
        },
    ],
    'Madhya Pradesh': [
        {
            name: 'MP PSC (Madhya Pradesh PSC)',
            subCategories: [
                { name: 'MP State Services Exam (Deputy Collector, DSP)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Assistant Conservator of Forest (ACF)' },
                { name: 'State Accounts / Finance Service' },
            ],
        },
        {
            name: 'MP Police (MP Vyapam)',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Prahari / Fireman' },
                { name: 'Driver Constable / Radio Operator' },
            ],
        },
        {
            name: 'Department of School Education (MPBSE)',
            subCategories: [
                { name: 'MP TET (Teacher Eligibility Test)' },
                { name: 'Primary / TGT / PGT Teacher' },
                { name: 'PET / Librarian / Art Teacher' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Patwari / Kanungo' },
                { name: 'Gram Panchayat Secretary / Sachiv' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Power Sector (MPPKVVCL, MPPGCL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Madhya Pradesh State Cooperative Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'Madhya Pradesh High Court',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Livestock Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer (BC/SC/ST)' },
            ],
        },
    ],
    'Maharashtra': [
        {
            name: 'MPSC (Maharashtra Public Service Commission)',
            subCategories: [
                { name: 'State Services (Rajyaseva) Exam' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'Agriculture Officer' },
            ],
        },
        {
            name: 'Maharashtra Police',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Driver Constable / Wireless Operator' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Department of School Education',
            subCategories: [
                { name: 'Maharashtra TET (MAHA TET)' },
                { name: 'Primary / TGT / PGT Teacher' },
                { name: 'PET / Librarian / Art Teacher' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Talathi / Taluka Clerk' },
                { name: 'Gram Sevak / Panchayat Secretary' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Power Sector (MAHADISCOM, etc.)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Maharashtra State Cooperative Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'Bombay High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Livestock Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer (BC/SC/ST)' },
            ],
        },
    ],
    'Manipur': [
        {
            name: 'MPSC (Manipur Public Service Commission)',
            subCategories: [
                { name: 'Combined Competitive Exam (CCE) - MAS, MPS, MFS' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Block Development Officer (BDO)' },
            ],
        },
        {
            name: 'Manipur Police Department',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Department of Education',
            subCategories: [
                { name: 'Manipur TET (MTET)' },
                { name: 'Primary / TGT / PGT Teacher' },
                { name: 'Non-Teaching Staff (Clerk, DEO)' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Panchayat Secretary' },
                { name: 'Social Education & Extension Officer' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Power Sector (MSPDCL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Manipur State Cooperative Bank (Clerk, Officer)' },
            ],
        },
        {
            name: 'Manipur High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer (BC/SC/ST)' },
            ],
        },
    ],
    'Meghalaya': [
        {
            name: 'MPSC (Meghalaya Public Service Commission)',
            subCategories: [
                { name: 'Meghalaya Civil Services (CCCE)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
            ],
        },
        {
            name: 'Meghalaya Police Department',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Department of School Education',
            subCategories: [
                { name: 'Meghalaya TET (MTET)' },
                { name: 'Primary / TGT / PGT Teacher' },
                { name: 'Non-Teaching Staff (Clerk, DEO)' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Panchayat Secretary / VEO' },
                { name: 'Extension Officer' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Power Sector (MeECL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Meghalaya Rural Bank / MCAB (Clerk, Officer)' },
            ],
        },
        {
            name: 'Meghalaya High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Forest Guard / Forester' },
            ],
        },
    ],
    'Mizoram': [
        {
            name: 'MPSC (Mizoram Public Service Commission)',
            subCategories: [
                { name: 'Mizoram Civil Services (CCCE)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
            ],
        },
        {
            name: 'Mizoram Police Department',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Department of School Education',
            subCategories: [
                { name: 'Mizoram TET (MTET)' },
                { name: 'Primary / TGT / PGT Teacher' },
            ],
        },
        {
            name: 'Rural Development & Village Council',
            subCategories: [
                { name: 'Village Council Secretary' },
                { name: 'Extension Officer' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Power Sector (MES)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Mizoram Co-operative Apex Bank (Clerk, Officer)' },
            ],
        },
        {
            name: 'Mizoram High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Forest Guard / Forester' },
            ],
        },
    ],
    'Nagaland': [
        {
            name: 'NPSC (Nagaland Public Service Commission)',
            subCategories: [
                { name: 'Nagaland Civil Services (CCCE)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
            ],
        },
        {
            name: 'Nagaland Police Department',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Department of School Education',
            subCategories: [
                { name: 'Nagaland TET (NTET)' },
                { name: 'Primary / TGT / PGT Teacher' },
            ],
        },
        {
            name: 'Rural Development & Village Council',
            subCategories: [
                { name: 'Village Development Officer (VDO)' },
                { name: 'Extension Officer' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Power & Infrastructure (PWD, PHED)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Civil/Electrical' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Nagaland Rural Bank / NSCAB (Clerk, Officer)' },
            ],
        },
        {
            name: 'Nagaland High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Forest Guard / Forester' },
            ],
        },
    ],
    'Odisha': [
        {
            name: 'OPSC (Odisha Public Service Commission)',
            subCategories: [
                { name: 'Odisha Civil Services (OCSE) - OAS, OPS, OFS' },
                { name: 'Assistant Section Officer (ASO)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer in Degree Colleges' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Odisha Police & Home Department',
            subCategories: [
                { name: 'Sub Inspector (SI) of Police' },
                { name: 'Police Constable (Civil & Armed)' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'School & Mass Education (BSE Odisha)',
            subCategories: [
                { name: 'Odisha TET (OTET)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'PET / Computer Teacher' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Panchayat Executive Officer (PEO)' },
                { name: 'Revenue Inspector (RI) / Amin' },
                { name: 'Gram Rozgar Sevak (GRS)' },
            ],
        },
        {
            name: 'Power & Energy (GRIDCO, TPCODL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Odisha State Cooperative Bank (OSCB) - Clerk, Officer' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'Odisha High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court Junior Clerk / Copyist' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Farmers’ Empowerment',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Livestock Inspector' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer (SC/ST/OBC)' },
            ],
        },
    ],
    'Puducherry': [
        {
            name: 'PPSC (Pondicherry Public Service Commission)',
            subCategories: [
                { name: 'Pondicherry Civil Services (PCS CCE)' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'PPSC Departmental Examinations' },
            ],
        },
        {
            name: 'Puducherry Police & Home Department',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Driver Constable / Wireless Operator' },
            ],
        },
        {
            name: 'Directorate of School Education',
            subCategories: [
                { name: 'CTET / TET' },
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Non-Teaching Staff (Clerk, DEO, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Village Administrative Officer (VAO) / Panchayat Secretary' },
                { name: 'Extension Officer' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Puducherry Electricity Department (PED)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Puducherry State Cooperative Bank (Clerk, Officer)' },
            ],
        },
        {
            name: 'Puducherry High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'Welfare Officer (BC/SC/ST)' },
            ],
        },
    ],
    'Punjab': [
        {
            name: 'PPSC (Punjab Public Service Commission)',
            subCategories: [
                { name: 'Punjab Civil Services (PCS) - CCE' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'Agriculture Development Officer' },
            ],
        },
        {
            name: 'Punjab Police (PSSSB)',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Department of School Education (PSEB)',
            subCategories: [
                { name: 'Punjab TET (PTET)' },
                { name: 'Primary / TGT / PGT Teacher' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Patwari / Kanungo' },
                { name: 'Gram Sachiv / Panchayat Secretary' },
            ],
        },
        {
            name: 'Power Sector (PSPCL, PSTCL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Punjab State Cooperative Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'Punjab & Haryana High Court',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
            ],
        },
    ],
    'Rajasthan': [
        {
            name: 'RPSC (Rajasthan Public Service Commission)',
            subCategories: [
                { name: 'RAS/RTS (Rajasthan Administrative Services)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'Agriculture Officer' },
            ],
        },
        {
            name: 'Rajasthan Police',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Prahari / Platoon Commander' },
            ],
        },
        {
            name: 'Department of School Education (RBSE)',
            subCategories: [
                { name: 'REET (Rajasthan Eligibility Examination for Teachers)' },
                { name: 'Primary / TGT / PGT Teacher' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Patwari / Kanungo' },
                { name: 'Gram Sevak / Panchayat Secretary' },
            ],
        },
        {
            name: 'Power Sector (RVUNL, JVVNL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Rajasthan State Cooperative Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'Rajasthan High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
            ],
        },
    ],
    'Sikkim': [
        {
            name: 'SPSC (Sikkim Public Service Commission)',
            subCategories: [
                { name: 'Sikkim Civil Services (CCCE)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
            ],
        },
        {
            name: 'Sikkim Police Department',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Department of School Education',
            subCategories: [
                { name: 'Sikkim TET (STET)' },
                { name: 'Primary / TGT / PGT Teacher' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Panchayat Secretary / Gram Sachiv' },
                { name: 'Extension Officer' },
            ],
        },
        {
            name: 'Power Sector (SECL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Sikkim State Cooperative Bank (Clerk, Officer)' },
            ],
        },
        {
            name: 'Sikkim High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Forest Guard / Forester' },
            ],
        },
    ],
    'Tamil Nadu': [
        {
            name: 'TNPSC (Tamil Nadu Public Service Commission)',
            subCategories: [
                { name: 'Group-I Services (Deputy Collector, DSP)' },
                { name: 'Group-II Services (Sub-Registrar)' },
                { name: 'Group-IIA (Non-Interview Posts)' },
                { name: 'Group-III Services (Bill Collector, JA)' },
                { name: 'Group-IV Services (VAO, Junior Assistant)' },
                { name: 'Combined Engineering Services (CES)' },
                { name: 'Forest Apprentice / Range Forest Officer' },
            ],
        },
        {
            name: 'Police & Fire Services (TNUSRB)',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (PC)' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Teachers Recruitment Board (TRB)',
            subCategories: [
                { name: 'Tamil Nadu TET (TNTET)' },
                { name: 'PG TRB (Post Graduate Teacher)' },
                { name: 'TGT TRB (Trained Graduate Teacher)' },
                { name: 'Polytechnic Lecturer / ITI Instructor' },
            ],
        },
        {
            name: 'Rural Development & Panchayat Raj',
            subCategories: [
                { name: 'VAO (Village Administrative Officer)' },
                { name: 'Executive Officer (Panchayat Union)' },
            ],
        },
        {
            name: 'Power Sector (TNEB, TANGEDCO)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technical Assistant' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Tamil Nadu State Apex Cooperative Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'Tamil Nadu High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Steno / Typist' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Inspector / Assistant' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
            ],
        },
    ],
    'Telangana': [
        {
            name: 'TSPSC (Telangana State PSC)',
            subCategories: [
                { name: 'Group-I Services (Deputy Collector, RTO)' },
                { name: 'Group-II Services (Deputy Tahsildar, ASO)' },
                { name: 'Group-III Services (Junior Accountant, Auditor)' },
                { name: 'Group-IV Services (JA, Bill Collector, VRO)' },
                { name: 'Assistant Engineer (AE) / Junior Engineer (JE)' },
                { name: 'Lecturer (Degree/Polytechnic)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
            ],
        },
        {
            name: 'Telangana Police (TSLPRB)',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (PC)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Excise Constable / SI' },
            ],
        },
        {
            name: 'Department of School Education (DSE)',
            subCategories: [
                { name: 'Telangana TET (TS TET)' },
                { name: 'School Assistant (SA) - TGT' },
                { name: 'Secondary Grade Teacher (SGT)' },
                { name: 'Physical Education Teacher (PET)' },
            ],
        },
        {
            name: 'Rural Development & Panchayat Raj',
            subCategories: [
                { name: 'Village Revenue Officer (VRO)' },
                { name: 'Panchayat Secretary' },
                { name: 'Welfare & Extension Officer (WEO)' },
            ],
        },
        {
            name: 'Power Sector (TSGENCO, TSTRANSCO)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE) / Sub Engineer (SE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Telangana State Cooperative Bank (Staff Assistant, Manager)' },
                { name: 'DCCB (Clerk, Cashier)' },
            ],
        },
        {
            name: 'Telangana High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court Junior Assistant / Typist' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Beat Officer (FBO)' },
            ],
        },
    ],
    'Tripura': [
        {
            name: 'TPSC (Tripura Public Service Commission)',
            subCategories: [
                { name: 'Tripura State Civil Services (CCE)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
            ],
        },
        {
            name: 'Tripura Police Department',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Department of School Education (TBSE)',
            subCategories: [
                { name: 'Tripura TET (T-TET)' },
                { name: 'Primary / TGT / PGT Teacher' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Panchayat Secretary / Gram Sevak' },
                { name: 'Extension Officer' },
            ],
        },
        {
            name: 'Power Sector (TPDDL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Tripura State Cooperative Bank (Clerk, Officer)' },
            ],
        },
        {
            name: 'Tripura High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Forest Guard / Forester' },
            ],
        },
    ],
    'Uttar Pradesh': [
        {
            name: 'UPPSC (Uttar Pradesh PSC)',
            subCategories: [
                { name: 'UPPCS (Combined State/Upper Subordinate Services)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'RO/ARO (Review Officer / Asst. Review Officer)' },
            ],
        },
        {
            name: 'UP Police (UPPRPB / UPSSSC)',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Driver Constable / Radio Operator' },
            ],
        },
        {
            name: 'Department of Education (UPBEB)',
            subCategories: [
                { name: 'UPTET / Super TET' },
                { name: 'Primary / TGT / PGT Teacher' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Lekhpal / Patwari' },
                { name: 'Gram Panchayat Adhikari / Sachiv' },
                { name: 'Village Development Officer (VDO)' },
            ],
        },
        {
            name: 'Power Sector (UPPCL, UPRVUNL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'UP Cooperative Bank (Clerk, Officer)' },
                { name: 'DCCB (Clerk, Managers)' },
            ],
        },
        {
            name: 'Allahabad High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
            ],
        },
    ],
    'Uttarakhand': [
        {
            name: 'UKPSC (Uttarakhand PSC)',
            subCategories: [
                { name: 'UKPCS (Combined State Civil/Upper Subordinate)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
            ],
        },
        {
            name: 'Uttarakhand Police (UKSSSC)',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Department of School Education (UBSE)',
            subCategories: [
                { name: 'Uttarakhand TET (UTET)' },
                { name: 'Primary / TGT / PGT Teacher' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Patwari / Lekhpal' },
                { name: 'Gram Panchayat Adhikari' },
                { name: 'Village Development Officer (VDO)' },
            ],
        },
        {
            name: 'Power Sector (UPCL, UJVNL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'Uttarakhand State Cooperative Bank (Clerk, Officer)' },
            ],
        },
        {
            name: 'Uttarakhand High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Forest Guard / Forester' },
            ],
        },
    ],
    'West Bengal': [
        {
            name: 'WBPSC (West Bengal PSC)',
            subCategories: [
                { name: 'WBCS (Exe) / Other Services (Group A, B, C, D)' },
                { name: 'West Bengal Judicial Service' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO)' },
            ],
        },
        {
            name: 'West Bengal Police (WBPRB)',
            subCategories: [
                { name: 'Sub Inspector (SI) - Unarmed & Armed' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Lady Constable / Warder' },
            ],
        },
        {
            name: 'Department of School Education (WBBPE, SSC)',
            subCategories: [
                { name: 'West Bengal TET (WBTET)' },
                { name: 'Primary / Upper Primary / Secondary Teacher' },
                { name: 'Post Graduate Teacher (PGT)' },
            ],
        },
        {
            name: 'Panchayat & Rural Development',
            subCategories: [
                { name: 'Panchayat Secretary / GPDO' },
                { name: 'Extension Officer' },
            ],
        },
        {
            name: 'Power Sector (WBSEDCL, WBPDCL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Banking & Cooperative Sector',
            subCategories: [
                { name: 'West Bengal State Cooperative Bank (Clerk, Officer)' },
            ],
        },
        {
            name: 'Calcutta High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist / Lab Technician' },
                { name: 'Medical Officer (MBBS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
            ],
        },
        {
            name: 'Other Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning Assistant' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
            ],
        },
    ],
  },
};