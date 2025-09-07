import type { ExamData } from './types';

export const SELECTION_LEVELS: string[] = [
    'Exams by Qualification',
    'National Level',
    'State Level',
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
    'Hinglish (Hindi + English)',
    'Benglish (Bengali + English)',
    'Marathinglish (Marathi + English)',
    'Tenglish (Telugu + English)',
    'Tanglish (Tamil + English)',
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
    'Andhra Pradesh': [
        {
            name: 'APPSC (Andhra Pradesh Public Service Commission)',
            subCategories: [
                { name: 'Group-I Services (Deputy Collector, DSP, etc.)' },
                { name: 'Group-II Services (Asst. Treasury Officer, etc.)' },
                { name: 'Group-III Services (Junior Accountant, Typist, etc.)' },
                { name: 'Group-IV Services (Junior Assistant, Bill Collector, etc.)' },
                { name: 'AEE (Assistant Executive Engineer)' },
                { name: 'Panchayat Secretary' },
                { name: 'Divisional Accounts Officer' },
                { name: 'Gazetted & Non-Gazetted Posts' },
                { name: 'Departmental Tests' },
            ],
        },
        {
            name: 'AP Police Recruitment',
            subCategories: [
                { name: 'Police Constable (PC)' },
                { name: 'Sub Inspector (SI)' },
                { name: 'Fireman / Driver Operator' },
                { name: 'Warder / Jail Warder' },
                { name: 'Radio Mechanic / Technician' },
                { name: 'Excise Constable / SI' },
            ],
        },
        {
            name: 'AP DSC (Teaching)',
            subCategories: [
                { name: 'School Assistant (SA) - TGT' },
                { name: 'Secondary Grade Teacher (SGT)' },
                { name: 'Physical Education Teacher (PET)' },
                { name: 'Music / Drawing Teacher' },
                { name: 'Headmaster / Headmistress' },
                { name: 'Gurukulam Teacher Posts' },
            ],
        },
        {
            name: 'Rural Development & Panchayat Raj',
            subCategories: [
                { name: 'VRO (Village Revenue Officer)' },
                { name: 'VRA (Village Revenue Assistant)' },
                { name: 'Welfare & Extension Officer (WEO)' },
                { name: 'Extension Officer (EO) - Panchayat Raj' },
            ],
        },
        {
            name: 'AP Power Sector (APTRANSCO, APGENCO)',
            subCategories: [
                { name: 'AE (Assistant Engineer) - Electrical/Civil' },
                { name: 'Junior Plant Operator (JPO)' },
                { name: 'Junior Lineman (JLM)' },
                { name: 'Sub-Engineer' },
                { name: 'Junior Accounts Officer (JAO)' },
            ],
        },
        {
            name: 'AP State Cooperative Banks',
            subCategories: [
                { name: 'APCOB - Staff Assistant/Manager' },
                { name: 'APGVB - Officer/Office Assistant' },
                { name: 'DCCB - Clerk/Manager' },
            ],
        },
        {
            name: 'AP High Court & Judiciary',
            subCategories: [
                { name: 'Junior Assistant / Typist / Steno' },
                { name: 'Civil Judge (Junior Division)' },
                { name: 'Examiner / Process Server / Field Officer' },
            ],
        },
        {
            name: 'Health & Medical Department',
            subCategories: [
                { name: 'Staff Nurse' },
                { name: 'Pharmacist' },
                { name: 'Lab Technician / Radiographer' },
                { name: 'Medical Officer' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Extension Officer' },
                { name: 'Fisheries Extension Officer' },
                { name: 'Sericulture Extension Officer' },
            ],
        },
        {
            name: 'APSRTC (Road Transport)',
            subCategories: [
                { name: 'Conductor' },
                { name: 'Driver (LMV/HMV)' },
                { name: 'Junior Assistant / Ticket Inspector' },
                { name: 'Mechanic / Workshop Staff' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST)',
            subCategories: [
                { name: 'BC/SC/ST Welfare Extension Officer' },
                { name: 'Hostel Welfare Officer' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Town Planning Assistant' },
                { name: 'Municipal Commissioner Grade-III' },
                { name: 'Lecturers in Degree/Polytechnic Colleges' },
                { name: 'Statistical Officer / Assistant' },
                { name: 'APSBC - Salesman / Supervisor' },
                { name: 'Civil Supplies - Depot Assistant' },
                { name: 'IT & e-Governance Staff' },
            ]
        }
    ],
    'Arunachal Pradesh': [
        {
            name: 'APPSC (Arunachal Pradesh Public Service Commission)',
            subCategories: [
                { name: 'Combined Competitive Examination (CCE)' },
                { name: 'Assistant Engineer (AE)' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Panchayat Secretary / Extension Officer' },
                { name: 'LDC / UDC / Stenographer / DEO' },
                { name: 'Departmental Exams' },
            ],
        },
        {
            name: 'Arunachal Pradesh Police (APPRB)',
            subCategories: [
                { name: 'Constable (GD & Tradesmen)' },
                { name: 'Sub Inspector (SI)' },
                { name: 'Driver / Wireless Operator' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'School Education (DSEAP)',
            subCategories: [
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Graduate Teacher (TGT)' },
                { name: 'Primary Teacher (PRT)' },
                { name: 'Librarian / PET / Special Educator' },
                { name: 'Non-Teaching Staff (JA, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Village Development Officer (VDO)' },
                { name: 'Gram Sevak / Panchayat Secretary' },
                { name: 'Social Education & Extension Officer' },
            ],
        },
        {
            name: 'Health & Family Welfare',
            subCategories: [
                { name: 'Medical Officer (MBBS)' },
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Power & Forest Departments',
            subCategories: [
                { name: 'Junior Engineer (JE) - Electrical/Civil' },
                { name: 'Lineman / Technician' },
                { name: 'Forest Guard / Forester' },
                { name: 'Wildlife Guard' },
            ],
        },
        {
            name: 'High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural / Horticulture Extension Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Livestock Inspector / Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare & WCD Departments',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent / Manager' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Lecturer (Govt / Polytechnic Colleges)' },
                { name: 'Statistical Assistant / DEO' },
                { name: 'Arunachal Pradesh State Cooperative Apex Bank' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Food Safety Officer' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff' },
                { name: 'Tourism & Culture Department Staff' },
            ],
        }
    ],
    'Assam': [
        {
            name: 'APSC (Assam Public Service Commission)',
            subCategories: [
                { name: 'Combined Competitive Examination (CCE) - ACS/APS' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical' },
                { name: 'Junior Administrative Assistant (JAA) / Auditor' },
                { name: 'Inspector of Statistics / Labour Inspector' },
                { name: 'Assam Finance Service (AFS)' },
                { name: 'Assam Land & Revenue Service (Circle Officer)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'APSC Departmental Examinations' },
            ],
        },
        {
            name: 'Assam Police Recruitment (SLPRB)',
            subCategories: [
                { name: 'Sub Inspector (SI) - UB & AB' },
                { name: 'Police Constable (Grade III, IV)' },
                { name: 'Assam Rifles (Civilian Posts)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Wireless Operator / Radio Technician' },
            ],
        },
        {
            name: 'Teaching (DSE Assam / AHSEC)',
            subCategories: [
                { name: 'Assam TET (Teacher Eligibility Test)' },
                { name: 'Lower/Upper Primary (LP/UP) Teacher' },
                { name: 'Secondary School Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Lecturer in Junior Colleges (AHSEC)' },
                { name: 'Non-Teaching Staff (JA, Lab Assistant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayat (P&RD)',
            subCategories: [
                { name: 'Gaon Panchayat Secretary (GPS)' },
                { name: 'Village Extension Officer (VEO)' },
                { name: 'Social Education & Extension Officer (SEEO)' },
            ],
        },
        {
            name: 'Assam Power Sector (APDCL, APGCL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Office cum Field Assistant (OFA)' },
                { name: 'Lineman / Technician' },
            ],
        },
        {
            name: 'Assam State Cooperative Banks',
            subCategories: [
                { name: 'Assam Co-operative Apex Bank (ACA) - Assistant/Officer' },
                { name: 'DCCB - Clerk/Cashier' },
            ],
        },
        {
            name: 'Assam High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Process Server / Peon' },
            ],
        },
        {
            name: 'Health & Family Welfare Department',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST, WCD)',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Lecturer (Govt / Polytechnic Colleges)' },
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Forest Guard / Forester' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff' },
                { name: 'Tourism & Culture Dept Staff' },
            ],
        },
    ],
    'Bihar': [
        {
            name: 'BPSC (Bihar Public Service Commission)',
            subCategories: [
                { name: 'Combined Competitive Examination (CCE) - SDO/DSP' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Bihar Administrative/Police Service (BAS/BPS)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'BPSC Departmental Examinations' },
            ],
        },
        {
            name: 'Bihar Police Recruitment (BPSSC / CSBC)',
            subCategories: [
                { name: 'Sub Inspector (SI) - Daroga' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Excise Constable / SI' },
                { name: 'Prohibition Constable' },
            ],
        },
        {
            name: 'Teaching (BSEB / DSE Bihar)',
            subCategories: [
                { name: 'Bihar TET (Teacher Eligibility Test)' },
                { name: 'Primary & Upper Primary Teacher' },
                { name: 'Secondary Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Headmaster / Headmistress (HM)' },
                { name: 'Non-Teaching Staff (JA, Lab Assistant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayat Raj',
            subCategories: [
                { name: 'Gram Sevak / Panchayat Secretary' },
                { name: 'Village Development Officer (VDO)' },
                { name: 'Social Education & Extension Officer (SEEO)' },
            ],
        },
        {
            name: 'Bihar Energy Department (BSPHCL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Bihar State Cooperative Banks',
            subCategories: [
                { name: 'Bihar State Cooperative Bank (BSCB) - Clerk/Officer' },
                { name: 'District Central Cooperative Banks (DCCB) - Clerk/Manager' },
            ],
        },
        {
            name: 'Patna High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Health & Family Welfare Department',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST, WCD)',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Lecturer (Polytechnic / Engineering Colleges)' },
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Forest Guard / Forester' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff' },
                { name: 'Tourism & Culture Dept Staff' },
            ],
        },
    ],
    'Chhattisgarh': [
        {
            name: 'CGPSC (Chhattisgarh Public Service Commission)',
            subCategories: [
                { name: 'State Civil Services Exam (Deputy Collector, DSP, etc.)' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'State Accounts / Finance Service' },
                { name: 'CGPSC Departmental Examinations' },
            ],
        },
        {
            name: 'Chhattisgarh Police & Home Department (CG Vyapam)',
            subCategories: [
                { name: 'Sub Inspector (SI) - Police, Prisons, Excise' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Driver Constable / Radio Operator' },
                { name: 'Platoon Commander' },
            ],
        },
        {
            name: 'Teaching (CG DSE / CG TET Board)',
            subCategories: [
                { name: 'CG TET (Teacher Eligibility Test)' },
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Headmaster / Headmistress (HM)' },
                { name: 'Non-Teaching Staff (JA, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayat Raj',
            subCategories: [
                { name: 'Panchayat Secretary / Gram Sevak' },
                { name: 'Village Development Officer (VDO)' },
                { name: 'Social Education & Extension Officer (SEEO)' },
            ],
        },
        {
            name: 'Chhattisgarh Power Sector (CSPDCL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Chhattisgarh State Cooperative Banks',
            subCategories: [
                { name: 'Chhattisgarh Rajya Gramin Bank (CRGB) - Assistant/Officer' },
                { name: 'District Central Cooperative Banks (DCCB) - Clerk/Cashier' },
            ],
        },
        {
            name: 'Chhattisgarh High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Health & Family Welfare Department',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST, WCD)',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Lecturer (Polytechnic / Engineering Colleges)' },
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Forest Guard / Forester' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff' },
                { name: 'Tourism & Culture Dept Staff' },
            ],
        },
    ],
    'Goa': [
        {
            name: 'GPSC (Goa Public Service Commission)',
            subCategories: [
                { name: 'Goa Civil Services (CCCE) - Deputy Collector/DSP' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Junior Scale Officer (JSO)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'GPSC Departmental Examinations' },
            ],
        },
        {
            name: 'Goa Police & Home Department',
            subCategories: [
                { name: 'Police Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Armed)' },
                { name: 'Driver / Wireless Operator' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Excise Constable / SI' },
            ],
        },
        {
            name: 'Teaching (Directorate of Education)',
            subCategories: [
                { name: 'Goa TET (Teacher Eligibility Test)' },
                { name: 'Primary & Upper Primary Teacher' },
                { name: 'Secondary Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Headmaster / Headmistress (HM)' },
                { name: 'Non-Teaching Staff (Clerk, Lab Assistant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayat Raj',
            subCategories: [
                { name: 'Panchayat Secretary / Village Panchayat Officer' },
                { name: 'Extension Officer (Panchayat Raj)' },
                { name: 'Social Education & Extension Officer (SEEO)' },
            ],
        },
        {
            name: 'Goa Electricity Department',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Goa State Cooperative Banks',
            subCategories: [
                { name: 'Goa State Cooperative Bank (GSCB) - Clerk/Officer' },
                { name: 'Urban Cooperative Banks (UCBs)' },
            ],
        },
        {
            name: 'Goa High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Health & Family Welfare Department',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Fisheries Inspector / Development Officer' },
                { name: 'Horticulture Officer' },
                { name: 'Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST, WCD)',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Lecturer (Polytechnic / Colleges)' },
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Forest Guard / Forester' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff' },
                { name: 'Tourism & Culture Dept Staff' },
            ],
        },
    ],
    'Gujarat': [
        {
            name: 'GPSC (Gujarat Public Service Commission)',
            subCategories: [
                { name: 'Gujarat Civil Services (GAS / GDS / GFS) - CCE' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Municipal Chief Officer (MCO)' },
                { name: 'GPSC Class 1-2 Departmental Exams' },
            ],
        },
        {
            name: 'Gujarat Police Recruitment (GSSSB)',
            subCategories: [
                { name: 'Police Sub Inspector (PSI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Sipahi / Fireman' },
                { name: 'Driver Constable / Wireless Operator' },
            ],
        },
        {
            name: 'Teaching (GSEB / SSA Gujarat)',
            subCategories: [
                { name: 'Gujarat TET (Teacher Eligibility Test)' },
                { name: 'Primary & Upper Primary Teacher' },
                { name: 'Secondary Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Headmaster / Headmistress (HM)' },
                { name: 'Non-Teaching Staff (Clerk, Lab Assistant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayat Raj',
            subCategories: [
                { name: 'Gram Sevak / Talati cum Mantri' },
                { name: 'Junior Clerk (Panchayat)' },
                { name: 'Social Education & Extension Officer (SEEO)' },
            ],
        },
        {
            name: 'Gujarat Power Sector (GETCO, GUVNL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Gujarat State Cooperative Banks',
            subCategories: [
                { name: 'Gujarat State Co-operative Bank (GSCB) - Clerk/Officer' },
                { name: 'District Central Cooperative Banks (DCCB)' },
            ],
        },
        {
            name: 'Gujarat High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Health & Family Welfare Department',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Livestock Inspector / Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST, WCD)',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Forest Guard / Forester / RFO' },
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Lecturer (Polytechnic / Engineering Colleges)' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff' },
                { name: 'Tourism & Culture Dept Staff' },
            ],
        },
    ],
    'Haryana': [
        {
            name: 'HPSC (Haryana Public Service Commission)',
            subCategories: [
                { name: 'Haryana Civil Services (HCS - SDM, DSP, etc.)' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'Agriculture / Horticulture Development Officer (ADO/HDO)' },
                { name: 'HPSC Departmental Examinations' },
            ],
        },
        {
            name: 'Haryana Police Recruitment (HSSC)',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fire Operator' },
                { name: 'Radio Operator / Wireless Supervisor' },
                { name: 'Driver / Mounted Constable' },
            ],
        },
        {
            name: 'Teaching (HBSE / DSE Haryana)',
            subCategories: [
                { name: 'HTET (Haryana Teacher Eligibility Test)' },
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Non-Teaching Staff (Clerk, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Revenue',
            subCategories: [
                { name: 'Gram Sachiv / Panchayat Secretary' },
                { name: 'Patwari / Kanungo (Land Records)' },
                { name: 'Revenue Clerk / Accountant' },
                { name: 'Social Education & Extension Officer (SEEO)' },
            ],
        },
        {
            name: 'Haryana Power Sector (UHBVN, DHBVN)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Haryana State Cooperative Banks',
            subCategories: [
                { name: 'Haryana State Cooperative Bank (HSCB) - Clerk/Officer' },
                { name: 'District Central Cooperative Banks (DCCB)' },
            ],
        },
        {
            name: 'Punjab & Haryana High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Health & Family Welfare Department',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Livestock Inspector / Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST, WCD)',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Forest Guard / Forester / RFO' },
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Lecturer (Polytechnic / ITI)' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff (Hartron)' },
                { name: 'Tourism & Culture Dept Staff' },
            ],
        },
    ],
    'Himachal Pradesh': [
        {
            name: 'HPSC (Himachal Pradesh Public Service Commission)',
            subCategories: [
                { name: 'HPAS (Himachal Pradesh Administrative Services) + Allied Services' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'Horticulture / Agriculture Development Officer' },
                { name: 'HPSC Departmental Examinations' },
            ],
        },
        {
            name: 'Himachal Pradesh Police Recruitment',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Driver Constable / Wireless Operator' },
            ],
        },
        {
            name: 'Teaching (HPBOSE / DSE HP)',
            subCategories: [
                { name: 'HTET (Himachal Pradesh Teacher Eligibility Test)' },
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Non-Teaching Staff (Clerk, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Revenue',
            subCategories: [
                { name: 'Patwari / Kanungo (Land Records)' },
                { name: 'Gram Sachiv / Panchayat Secretary' },
                { name: 'Extension Officer (Panchayat Raj)' },
                { name: 'Social Education & Extension Officer (SEEO)' },
            ],
        },
        {
            name: 'HP Power & Engineering Departments (HPSEBL, HPPWD)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Himachal Pradesh State Cooperative Banks',
            subCategories: [
                { name: 'Himachal Pradesh State Cooperative Bank (HPSCB) - Clerk/Officer' },
                { name: 'District Central Cooperative Banks (DCCB)' },
            ],
        },
        {
            name: 'Himachal Pradesh High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Health & Family Welfare Department',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Livestock Inspector / Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST, WCD)',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Forest Guard / Forester' },
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Lecturer (Polytechnic / ITI)' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff' },
                { name: 'Tourism & Culture Dept Staff' },
            ],
        },
    ],
    'Jharkhand': [
        {
            name: 'JPSC (Jharkhand Public Service Commission)',
            subCategories: [
                { name: 'Jharkhand Combined Civil Services (JCS) Exam' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / ACF' },
                { name: 'JPSC Departmental Examinations' },
            ],
        },
        {
            name: 'Jharkhand Police Recruitment (JSSC)',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Driver Constable / Radio Operator' },
            ],
        },
        {
            name: 'Teaching (JAC / DSE Jharkhand)',
            subCategories: [
                { name: 'JTET (Jharkhand Teacher Eligibility Test)' },
                { name: 'Primary Teacher (PRT)' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Non-Teaching Staff (Clerk, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Revenue',
            subCategories: [
                { name: 'Panchayat Secretary / Gram Sachiv' },
                { name: 'Patwari / Revenue Clerk' },
                { name: 'Social Education & Extension Officer (SEEO)' },
            ],
        },
        {
            name: 'Jharkhand Power Sector (JBVNL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Jharkhand State Cooperative Banks',
            subCategories: [
                { name: 'Jharkhand State Cooperative Bank (JSCB) - Clerk/Officer' },
                { name: 'District Central Cooperative Banks (DCCB)' },
            ],
        },
        {
            name: 'Jharkhand High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Health & Family Welfare Department',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Livestock Inspector / Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST, WCD)',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Forest Guard / Forester' },
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Lecturer (Polytechnic / ITI)' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff' },
                { name: 'Tourism & Culture Dept Staff' },
            ],
        },
    ],
    'Karnataka': [
        {
            name: 'KPSC (Karnataka Public Service Commission)',
            subCategories: [
                { name: 'KAS (Karnataka Administrative Service) + Allied Services Exam' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical, IT' },
                { name: 'Lecturer (in Government Colleges / Polytechnics)' },
                { name: 'Forest Range Officer (FRO) / Assistant Conservator of Forest (ACF)' },
                { name: 'Horticulture Development Officer / Agriculture Officer' },
                { name: 'KPSC Departmental Examinations' },
            ],
        },
        {
            name: 'Karnataka Police & Home Department',
            subCategories: [
                { name: 'Police Sub Inspector (PSI) - Civil & Armed' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Driver Constable / Wireless Operator' },
            ],
        },
        {
            name: 'Teaching (DSERT / KSEEB)',
            subCategories: [
                { name: 'KARTET (Karnataka Teacher Eligibility Test)' },
                { name: 'Primary Teacher' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Non-Teaching Staff (Clerk, DEO, Lab Attendant)' },
            ],
        },
        {
            name: 'Revenue & Panchayat Raj',
            subCategories: [
                { name: 'First Division Assistant (FDA) / Second Division Assistant (SDA)' },
                { name: 'Village Accountant (VA) / Patwari' },
                { name: 'Gram Panchayat Development Officer (GPDO) / Panchayat Secretary' },
            ],
        },
        {
            name: 'Karnataka Power Sector (KPTCL, BESCOM, etc.)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Karnataka State Cooperative Banks',
            subCategories: [
                { name: 'Karnataka State Cooperative Apex Bank (KSCAB) - Clerk/Officer' },
                { name: 'District Central Cooperative Banks (DCCB)' },
            ],
        },
        {
            name: 'Karnataka High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Health & Family Welfare Department',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Livestock Inspector / Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST, WCD)',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent / Manager' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Forest Guard / Forester' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff' },
                { name: 'Tourism & Culture Dept Staff' },
            ],
        },
    ],
    'Kerala': [
        {
            name: 'Kerala Public Service Commission (KPSC)',
            subCategories: [
                { name: 'Secretariat Assistant / Auditor' },
                { name: 'LDC (Lower Division Clerk)' },
                { name: 'Police Constable (Civil & Armed)' },
                { name: 'Sub Inspector (SI)' },
                { name: 'Assistant Engineer (AE) - PWD, KSEB, etc.' },
                { name: 'Junior Engineer (JE) - Civil, Mechanical, Electrical' },
                { name: 'Village Officer / Village Extension Officer (VEO)' },
                { name: 'Tracer / Overseer (PWD)' },
                { name: 'Lab Technical Assistant / Instructor' },
                { name: 'Statistical Assistant / Data Entry Operator' },
                { name: 'Medical Officer / Pharmacist / Staff Nurse' },
                { name: 'Lecturer / Polytechnic Lecturer' },
                { name: 'Forest Guard / Forest Range Officer' },
                { name: 'Excise Inspector / Prohibition Officer' },
                { name: 'Sales Tax Officer / Treasury Officer' },
            ],
        },
        {
            name: 'Kerala Police Department',
            subCategories: [
                { name: 'Sub Inspector (SI) - Civil & Armed Police' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Women Police Constable' },
                { name: 'Driver Constable / Wireless Operator' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Teaching (KTET / Pareeksha Bhavan)',
            subCategories: [
                { name: 'KTET (Kerala Teacher Eligibility Test)' },
                { name: 'High School Assistant (HSA) - TGT' },
                { name: 'Secondary School Teacher (SST) - PGT' },
                { name: 'Vocational / Physical Education Teacher (PET)' },
                { name: 'Librarian / Language Teacher' },
                { name: 'Non-Teaching Staff (Clerk, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Panchayat Raj',
            subCategories: [
                { name: 'Village Extension Officer (VEO)' },
                { name: 'Panchayat Secretary / Junior Assistant' },
                { name: 'Social Education & Extension Officer (SEEO)' },
            ],
        },
        {
            name: 'Kerala Power Sector (KSEB)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Kerala State Cooperative Banks',
            subCategories: [
                { name: 'Kerala State Cooperative Bank (KSCB) - Clerk/Officer' },
                { name: 'District Cooperative Banks (DCBs)' },
            ],
        },
        {
            name: 'Kerala High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Health & Family Welfare Department',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Surgeon' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Livestock Inspector / Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST, WCD)',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent / Manager' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'KSRTC Conductor / Driver' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff' },
                { name: 'Tourism & Culture Dept Staff' },
            ],
        },
    ],
    'Madhya Pradesh': [
        {
            name: 'MP PSC (Madhya Pradesh Public Service Commission)',
            subCategories: [
                { name: 'MP State Services Exam (Deputy Collector, DSP, etc.)' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'State Accounts Service / State Finance Service' },
                { name: 'MP PSC Departmental Examinations' },
            ],
        },
        {
            name: 'MP Police & Home Department (MP Vyapam)',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Prahari / Fireman' },
                { name: 'Driver Constable / Radio Operator' },
            ],
        },
        {
            name: 'Teaching (MPBSE / DSE MP)',
            subCategories: [
                { name: 'MP TET (Teacher Eligibility Test)' },
                { name: 'Primary Teacher' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Non-Teaching Staff (Clerk, DEO, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Revenue',
            subCategories: [
                { name: 'Patwari / Kanungo' },
                { name: 'Gram Panchayat Secretary / Panchayat Sachiv' },
                { name: 'Social Education & Extension Officer (SEEO)' },
            ],
        },
        {
            name: 'MP Power Sector (MPPKVVCL, MPPGCL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'MP State Cooperative Banks',
            subCategories: [
                { name: 'Madhya Pradesh State Cooperative Bank (MPSCB) - Clerk/Officer' },
                { name: 'District Central Cooperative Banks (DCCB)' },
            ],
        },
        {
            name: 'MP High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Health & Family Welfare Department',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Livestock Inspector / Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST, WCD)',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent / Manager' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Forest Guard / Forester / RFO' },
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Lecturer (Polytechnic / ITI)' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff (MPOnline)' },
                { name: 'Tourism & Culture Dept Staff' },
            ],
        },
    ],
    'Maharashtra': [
        {
            name: 'MPSC (Maharashtra Public Service Commission)',
            subCategories: [
                { name: 'Maharashtra State Services (Rajyaseva) Exam' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Forest Range Officer (FRO) / Assistant Conservator of Forest (ACF)' },
                { name: 'Agriculture Officer / Horticulture Officer' },
                { name: 'MPSC Departmental Examinations' },
            ],
        },
        {
            name: 'Maharashtra Police & Home Department',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Driver Constable / Wireless Operator' },
                { name: 'Jail Warder / Fireman' },
            ],
        },
        {
            name: 'Teaching (MSBSHSE / DSE Maharashtra)',
            subCategories: [
                { name: 'MAHA TET (Maharashtra Teacher Eligibility Test)' },
                { name: 'Primary Teacher' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Headmaster / Headmistress (HM)' },
                { name: 'Non-Teaching Staff (Clerk, DEO, Lab Attendant)' },
            ],
        },
        {
            name: 'Rural Development & Revenue',
            subCategories: [
                { name: 'Talathi / Taluka Clerk' },
                { name: 'Gram Sevak / Panchayat Secretary' },
                { name: 'Social Education & Extension Officer (SEEO)' },
            ],
        },
        {
            name: 'Maharashtra Power Sector (MAHADISCOM, etc.)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Maharashtra State Cooperative Banks',
            subCategories: [
                { name: 'MSC Bank - Clerk/Officer' },
                { name: 'District Central Cooperative Banks (DCCB)' },
            ],
        },
        {
            name: 'Bombay High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Health & Family Welfare Department',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Livestock Inspector / Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST, WCD)',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent / Manager' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Forest Guard / Forester' },
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Lecturer (Polytechnic / ITI)' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff' },
                { name: 'Tourism & Culture Dept Staff' },
            ],
        },
    ],
    'Manipur': [
        {
            name: 'MPSC (Manipur Public Service Commission)',
            subCategories: [
                { name: 'Combined Competitive Examination (CCE) - MAS, MPS, MFS' },
                { name: 'Assistant Engineer (AE) - Civil, Mechanical, Electrical' },
                { name: 'Lecturer (in Government Colleges)' },
                { name: 'Block Development Officer (BDO)' },
                { name: 'Treasury Officer / Assistant Commissioner (Taxation)' },
                { name: 'MPSC Departmental Examinations' },
            ],
        },
        {
            name: 'Manipur Police & Home Department',
            subCategories: [
                { name: 'Sub Inspector (SI)' },
                { name: 'Police Constable (GD & Tradesmen)' },
                { name: 'Jail Warder / Fireman' },
                { name: 'Driver Constable / Radio Operator' },
            ],
        },
        {
            name: 'Teaching (DoE Manipur)',
            subCategories: [
                { name: 'Manipur TET (MTET)' },
                { name: 'Primary & Upper Primary Teacher' },
                { name: 'Trained Graduate Teacher (TGT)' },
                { name: 'Post Graduate Teacher (PGT)' },
                { name: 'Non-Teaching Staff (Clerk, DEO, etc.)' },
            ],
        },
        {
            name: 'Rural Development & Panchayati Raj',
            subCategories: [
                { name: 'Panchayat Secretary / Village Authority Secretary' },
                { name: 'Social Education & Extension Officer (SEEO)' },
            ],
        },
        {
            name: 'Manipur Power Sector (MSPDCL)',
            subCategories: [
                { name: 'Assistant Engineer (AE) - Electrical/Civil' },
                { name: 'Junior Engineer (JE)' },
                { name: 'Lineman / Technician' },
                { name: 'Office Assistant / DEO' },
            ],
        },
        {
            name: 'Manipur State Cooperative Banks',
            subCategories: [
                { name: 'Manipur State Cooperative Bank (MSCB) - Clerk/Officer' },
                { name: 'District Central Cooperative Banks (DCCB)' },
            ],
        },
        {
            name: 'Manipur High Court & Judiciary',
            subCategories: [
                { name: 'Civil Judge (Junior Division)' },
                { name: 'High Court LDC / Stenographer' },
                { name: 'Peon / Process Server' },
            ],
        },
        {
            name: 'Health & Family Welfare Department',
            subCategories: [
                { name: 'Staff Nurse (GNM / B.Sc)' },
                { name: 'Pharmacist / Lab Technician / Radiographer' },
                { name: 'Medical Officer (MBBS)' },
                { name: 'AYUSH Medical Officer' },
                { name: 'Veterinary Assistant Surgeon (VAS)' },
            ],
        },
        {
            name: 'Agriculture & Allied Departments',
            subCategories: [
                { name: 'Agricultural Extension Officer (AEO)' },
                { name: 'Horticulture Development Officer' },
                { name: 'Fisheries / Sericulture Officer' },
                { name: 'Livestock Inspector / Veterinary Field Assistant' },
            ],
        },
        {
            name: 'Welfare Departments (BC, SC, ST, WCD)',
            subCategories: [
                { name: 'Welfare Officer (BC/SC/ST)' },
                { name: 'Hostel Superintendent / Manager' },
                { name: 'Child Development Project Officer (CDPO)' },
                { name: 'Anganwadi Supervisor / Worker' },
            ],
        },
        {
            name: 'Other State Departments',
            subCategories: [
                { name: 'Forest Guard / Forester / RFO' },
                { name: 'Statistical Assistant / DEO' },
                { name: 'Town Planning / Municipal Officer' },
                { name: 'Motor Vehicle Inspector (MVI)' },
                { name: 'Food Safety Officer (FSO)' },
                { name: 'Lecturer (Polytechnic / ITI)' },
                { name: 'University Staff (Admin, Research)' },
                { name: 'IT & e-Governance Staff' },
                { name: 'Tourism & Culture Dept Staff' },
            ],
        },
      ]
  },
};