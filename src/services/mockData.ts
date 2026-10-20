import { 
  Team, 
  MatchFixture, 
  HallOfFameEdition, 
  Notice, 
  ScheduleItem, 
  GalleryPhoto, 
  CommitteeMember 
} from '../types';

export const INITIAL_TEAMS: Team[] = [
  {
    id: 'TD4-TEAM-01',
    name: 'Logical Fallacy',
    batch: '25th Batch',
    department: 'Computer Science & Engineering',
    leaderId: 'm1',
    registrationDate: '2026-09-24T10:30:00Z',
    status: 'VERIFIED',
    notes: 'Verified via bKash TrxID. Documents in order.',
    members: [
      {
        id: 'm1',
        teamId: 'TD4-TEAM-01',
        speakerRole: 1,
        fullName: 'Zubair Ahmed Fahim',
        studentId: '211311042',
        phone: '01712345678',
        email: 'zubair.fahim@vu.edu.bd',
        isLeader: true
      },
      {
        id: 'm2',
        teamId: 'TD4-TEAM-01',
        speakerRole: 2,
        fullName: 'Nusrat Jahan Oishee',
        studentId: '211311088',
        phone: '01712345679',
        email: 'nusrat.oishee@vu.edu.bd',
        isLeader: false
      },
      {
        id: 'm3',
        teamId: 'TD4-TEAM-01',
        speakerRole: 3,
        fullName: 'Tanvir Hossain Ridoy',
        studentId: '211311105',
        phone: '01712345680',
        email: 'tanvir.ridoy@vu.edu.bd',
        isLeader: false
      }
    ],
    payment: {
      id: 'p1',
      teamId: 'TD4-TEAM-01',
      method: 'bKash',
      senderNumber: '01712345678',
      transactionId: 'BK9482X192',
      amount: 600,
      submittedAt: '2026-09-24T10:35:00Z',
      verifiedAt: '2026-09-24T14:20:00Z',
      status: 'VERIFIED'
    }
  },
  {
    id: 'TD4-TEAM-02',
    name: 'Turing Machines',
    batch: '24th Batch',
    department: 'Computer Science & Engineering',
    leaderId: 'm4',
    registrationDate: '2026-09-25T11:15:00Z',
    status: 'VERIFIED',
    notes: 'Nagad verified.',
    members: [
      {
        id: 'm4',
        teamId: 'TD4-TEAM-02',
        speakerRole: 1,
        fullName: 'Shadman Shakib',
        studentId: '201311019',
        phone: '01811223344',
        email: 'shadman.shakib@vu.edu.bd',
        isLeader: true
      },
      {
        id: 'm5',
        teamId: 'TD4-TEAM-02',
        speakerRole: 2,
        fullName: 'Farhana Akhter Rimi',
        studentId: '201311045',
        phone: '01811223345',
        email: 'farhana.rimi@vu.edu.bd',
        isLeader: false
      },
      {
        id: 'm6',
        teamId: 'TD4-TEAM-02',
        speakerRole: 3,
        fullName: 'Mahfuzur Rahman',
        studentId: '201311072',
        phone: '01811223346',
        email: 'mahfuzur.rahman@vu.edu.bd',
        isLeader: false
      }
    ],
    payment: {
      id: 'p2',
      teamId: 'TD4-TEAM-02',
      method: 'Nagad',
      senderNumber: '01811223344',
      transactionId: 'NG772091KL',
      amount: 600,
      submittedAt: '2026-09-25T11:20:00Z',
      verifiedAt: '2026-09-25T15:00:00Z',
      status: 'VERIFIED'
    }
  },
  {
    id: 'TD4-TEAM-03',
    name: 'Binary Arguments',
    batch: '26th Batch',
    department: 'Computer Science & Engineering',
    leaderId: 'm7',
    registrationDate: '2026-09-26T14:40:00Z',
    status: 'VERIFIED',
    notes: 'Payment verified via Rocket.',
    members: [
      {
        id: 'm7',
        teamId: 'TD4-TEAM-03',
        speakerRole: 1,
        fullName: 'Sabbir Ahmed Khan',
        studentId: '221311033',
        phone: '01923456789',
        email: 'sabbir.khan@vu.edu.bd',
        isLeader: true
      },
      {
        id: 'm8',
        teamId: 'TD4-TEAM-03',
        speakerRole: 2,
        fullName: 'Afsana Mimi',
        studentId: '221311061',
        phone: '01923456790',
        email: 'afsana.mimi@vu.edu.bd',
        isLeader: false
      },
      {
        id: 'm9',
        teamId: 'TD4-TEAM-03',
        speakerRole: 3,
        fullName: 'Rashedul Islam',
        studentId: '221311094',
        phone: '01923456791',
        email: 'rashedul.islam@vu.edu.bd',
        isLeader: false
      }
    ],
    payment: {
      id: 'p3',
      teamId: 'TD4-TEAM-03',
      method: 'Rocket',
      senderNumber: '01923456789',
      transactionId: 'RK55198200',
      amount: 600,
      submittedAt: '2026-09-26T14:45:00Z',
      verifiedAt: '2026-09-26T16:10:00Z',
      status: 'VERIFIED'
    }
  },
  {
    id: 'TD4-TEAM-04',
    name: 'Quantum Debaters',
    batch: '27th Batch',
    department: 'Computer Science & Engineering',
    leaderId: 'm10',
    registrationDate: '2026-09-27T09:10:00Z',
    status: 'VERIFIED',
    notes: 'Verified.',
    members: [
      {
        id: 'm10',
        teamId: 'TD4-TEAM-04',
        speakerRole: 1,
        fullName: 'Mehedi Hasan Niloy',
        studentId: '231311005',
        phone: '01633445566',
        email: 'mehedi.niloy@vu.edu.bd',
        isLeader: true
      },
      {
        id: 'm11',
        teamId: 'TD4-TEAM-04',
        speakerRole: 2,
        fullName: 'Sumaiya Akter',
        studentId: '231311041',
        phone: '01633445567',
        email: 'sumaiya.akter@vu.edu.bd',
        isLeader: false
      },
      {
        id: 'm12',
        teamId: 'TD4-TEAM-04',
        speakerRole: 3,
        fullName: 'Kazi Arifur Rahman',
        studentId: '231311078',
        phone: '01633445568',
        email: 'kazi.arifur@vu.edu.bd',
        isLeader: false
      }
    ],
    payment: {
      id: 'p4',
      teamId: 'TD4-TEAM-04',
      method: 'bKash',
      senderNumber: '01633445566',
      transactionId: 'BK33100918',
      amount: 600,
      submittedAt: '2026-09-27T09:15:00Z',
      verifiedAt: '2026-09-27T12:00:00Z',
      status: 'VERIFIED'
    }
  },
  {
    id: 'TD4-TEAM-05',
    name: 'Syntax Sovereigns',
    batch: '25th Batch',
    department: 'Computer Science & Engineering',
    leaderId: 'm13',
    registrationDate: '2026-09-28T16:00:00Z',
    status: 'PENDING',
    notes: 'Awaiting MFS confirmation check by admin.',
    members: [
      {
        id: 'm13',
        teamId: 'TD4-TEAM-05',
        speakerRole: 1,
        fullName: 'Anisur Rahman',
        studentId: '211311059',
        phone: '01511224488',
        email: 'anisur.rahman@vu.edu.bd',
        isLeader: true
      },
      {
        id: 'm14',
        teamId: 'TD4-TEAM-05',
        speakerRole: 2,
        fullName: 'Sadia Sultana',
        studentId: '211311082',
        phone: '01511224489',
        email: 'sadia.sultana@vu.edu.bd',
        isLeader: false
      },
      {
        id: 'm15',
        teamId: 'TD4-TEAM-05',
        speakerRole: 3,
        fullName: 'Naimul Haque',
        studentId: '211311119',
        phone: '01511224490',
        email: 'naimul.haque@vu.edu.bd',
        isLeader: false
      }
    ],
    payment: {
      id: 'p5',
      teamId: 'TD4-TEAM-05',
      method: 'bKash',
      senderNumber: '01511224488',
      transactionId: 'BK88219033',
      amount: 600,
      submittedAt: '2026-09-28T16:05:00Z',
      status: 'PENDING'
    }
  },
  {
    id: 'TD4-TEAM-06',
    name: 'Recursive Logic',
    batch: '26th Batch',
    department: 'Computer Science & Engineering',
    leaderId: 'm16',
    registrationDate: '2026-09-29T13:20:00Z',
    status: 'PENDING',
    notes: 'Nagad payment verification pending.',
    members: [
      {
        id: 'm16',
        teamId: 'TD4-TEAM-06',
        speakerRole: 1,
        fullName: 'Shahriar Kabir',
        studentId: '221311018',
        phone: '01799887766',
        email: 'shahriar.kabir@vu.edu.bd',
        isLeader: true
      },
      {
        id: 'm17',
        teamId: 'TD4-TEAM-06',
        speakerRole: 2,
        fullName: 'Tasnim Ferdous',
        studentId: '221311055',
        phone: '01799887767',
        email: 'tasnim.ferdous@vu.edu.bd',
        isLeader: false
      },
      {
        id: 'm18',
        teamId: 'TD4-TEAM-06',
        speakerRole: 3,
        fullName: 'Imtiaz Hossain',
        studentId: '221311090',
        phone: '01799887768',
        email: 'imtiaz.hossain@vu.edu.bd',
        isLeader: false
      }
    ],
    payment: {
      id: 'p6',
      teamId: 'TD4-TEAM-06',
      method: 'Nagad',
      senderNumber: '01799887766',
      transactionId: 'NG99182377',
      amount: 600,
      submittedAt: '2026-09-29T13:25:00Z',
      status: 'PENDING'
    }
  }
];

export const SEEDING_PAIRS: [number, number][] = [
  [1, 64], [33, 32], [17, 48], [49, 16],
  [9, 56], [41, 24], [25, 40], [57, 8],
  [4, 61], [29, 36], [20, 45], [52, 13],
  [12, 53], [21, 44], [28, 37], [60, 5],
  [2, 63], [31, 34], [18, 47], [15, 50],
  [10, 55], [23, 42], [26, 39], [7, 58],
  [3, 62], [30, 35], [19, 46], [14, 51],
  [11, 54], [22, 43], [27, 38], [6, 59]
];

export const generateInitial63Fixtures = (): MatchFixture[] => {
  const matches: MatchFixture[] = [];

  // 1. Round of 64 (Matches 1 to 32)
  SEEDING_PAIRS.forEach((pair, idx) => {
    const matchNum = idx + 1;
    const nextMatchNum = 32 + Math.ceil(matchNum / 2);
    matches.push({
      id: `M${matchNum}`,
      matchNumber: matchNum,
      roundKey: 'R64',
      roundName: 'Round of 64',
      govTeam: `Team ${pair[0]}`,
      govShort: `T${pair[0]}`,
      oppTeam: `Team ${pair[1]}`,
      oppShort: `T${pair[1]}`,
      status: 'Upcoming',
      venue: 'Details coming soon',
      datetime: 'Details coming soon',
      nextMatchId: `M${nextMatchNum}`
    });
  });

  // 2. Round of 32 (Matches 33 to 48)
  for (let i = 1; i <= 16; i++) {
    const matchNum = 32 + i;
    const m1 = (i - 1) * 2 + 1;
    const m2 = (i - 1) * 2 + 2;
    const nextMatchNum = 48 + Math.ceil(i / 2);
    matches.push({
      id: `M${matchNum}`,
      matchNumber: matchNum,
      roundKey: 'R32',
      roundName: 'Round of 32',
      govTeam: `Winner M${m1}`,
      govShort: `W${m1}`,
      oppTeam: `Winner M${m2}`,
      oppShort: `W${m2}`,
      status: 'Upcoming',
      venue: 'Details coming soon',
      datetime: 'Details coming soon',
      nextMatchId: `M${nextMatchNum}`
    });
  }

  // 3. Round of 16 (Matches 49 to 56)
  for (let i = 1; i <= 8; i++) {
    const matchNum = 48 + i;
    const m1 = 32 + (i - 1) * 2 + 1;
    const m2 = 32 + (i - 1) * 2 + 2;
    const nextMatchNum = 56 + Math.ceil(i / 2);
    matches.push({
      id: `M${matchNum}`,
      matchNumber: matchNum,
      roundKey: 'R16',
      roundName: 'Round of 16',
      govTeam: `Winner M${m1}`,
      govShort: `W${m1}`,
      oppTeam: `Winner M${m2}`,
      oppShort: `W${m2}`,
      status: 'Upcoming',
      venue: 'Details coming soon',
      datetime: 'Details coming soon',
      nextMatchId: `M${nextMatchNum}`
    });
  }

  // 4. Quarter Finals (Matches 57 to 60)
  for (let i = 1; i <= 4; i++) {
    const matchNum = 56 + i;
    const m1 = 48 + (i - 1) * 2 + 1;
    const m2 = 48 + (i - 1) * 2 + 2;
    const nextMatchNum = 60 + Math.ceil(i / 2);
    matches.push({
      id: `M${matchNum}`,
      matchNumber: matchNum,
      roundKey: 'QF',
      roundName: 'Quarter Final',
      govTeam: `Winner M${m1}`,
      govShort: `W${m1}`,
      oppTeam: `Winner M${m2}`,
      oppShort: `W${m2}`,
      status: 'Upcoming',
      venue: 'Details coming soon',
      datetime: 'Details coming soon',
      nextMatchId: `M${nextMatchNum}`
    });
  }

  // 5. Semi Finals (Matches 61 & 62)
  matches.push({
    id: 'M61',
    matchNumber: 61,
    roundKey: 'SF',
    roundName: 'Semi Final 1',
    govTeam: 'Winner M57',
    govShort: 'W57',
    oppTeam: 'Winner M58',
    oppShort: 'W58',
    status: 'Upcoming',
    venue: 'Details coming soon',
    datetime: 'Details coming soon',
    nextMatchId: 'M63'
  });

  matches.push({
    id: 'M62',
    matchNumber: 62,
    roundKey: 'SF',
    roundName: 'Semi Final 2',
    govTeam: 'Winner M59',
    govShort: 'W59',
    oppTeam: 'Winner M60',
    oppShort: 'W60',
    status: 'Upcoming',
    venue: 'Details coming soon',
    datetime: 'Details coming soon',
    nextMatchId: 'M63'
  });

  // 6. Grand Finale (Match 63)
  matches.push({
    id: 'M63',
    matchNumber: 63,
    roundKey: 'GF',
    roundName: 'Grand Finale',
    govTeam: 'Winner M61 (Finalist 1)',
    govShort: 'F1',
    oppTeam: 'Winner M62 (Finalist 2)',
    oppShort: 'F2',
    status: 'Upcoming',
    venue: 'Details coming soon',
    datetime: 'Details coming soon'
  });

  return matches;
};

export const INITIAL_FIXTURES: MatchFixture[] = generateInitial63Fixtures();

export const HALL_OF_FAME: HallOfFameEdition[] = [
  {
    edition: '1.0',
    year: 2023,
    theme: 'Genesis of Technological Discourse',
    status: 'COMPLETED',
    champion: {
      teamName: 'The Algorithmists',
      batch: '36th Batch',
      members: ['Mahir Faisal', 'Anika Tabassum', 'Shadman Farhan']
    },
    runnerUp: {
      teamName: 'Data Overlords',
      batch: '37th Batch',
      members: ['Rezwanul Karim', 'Sabrina Mostafa', 'Tasnim Shakib']
    },
    bestTournamentDebater: {
      name: 'Mahir Faisal',
      batch: '36th Batch',
      studentId: '191311024',
      achievement: 'Highest average speaker score (79.2 pts) across 5 rounds.'
    },
    finalMatchBestDebater: {
      name: 'Anika Tabassum',
      batch: '36th Batch',
      studentId: '191311051'
    },
    committee: [
      { name: 'Mahfujur Rahman Arnob', position: 'Coordinator & Faculty Advisor', batch: 'Faculty of CSE' },
      { name: 'Nuhan Intekhab', position: 'Coordinator & Faculty Advisor', batch: 'Faculty of CSE' },
      { name: 'Abir Mahmud Pritam', position: 'Tournament Organizing Lead', batch: '32nd Batch' },
      { name: 'Farhan Ahamed', position: 'Adjudication Core Lead', batch: '33rd Batch' }
    ]
  },
  {
    edition: '2.0',
    year: 2024,
    theme: 'Clash of Cyber Logic & Synthetic Ethics',
    status: 'COMPLETED',
    champion: {
      teamName: 'Neural Paradigm',
      batch: '34th Batch',
      members: ['Tamzid Al-Mamun', 'Fariha Nawal', 'Syed Rayhan']
    },
    runnerUp: {
      teamName: 'Zero Day Exploiters',
      batch: '35th Batch',
      members: ['Arnob Chakrabarty', 'Mehnaz Binte Rauf', 'Wasim Akram']
    },
    bestTournamentDebater: {
      name: 'Tamzid Al-Mamun',
      batch: '34th Batch',
      studentId: '201311009',
      achievement: 'Undefeated in 6 debate matches with unanimous ballots in 4 rounds.'
    },
    finalMatchBestDebater: {
      name: 'Fariha Nawal',
      batch: '34th Batch',
      studentId: '201311037'
    },
    committee: [
      { name: 'Mahfujur Rahman Arnob', position: 'Coordinator & Faculty Advisor', batch: 'Faculty of CSE' },
      { name: 'Nuhan Intekhab', position: 'Coordinator & Faculty Advisor', batch: 'Faculty of CSE' },
      { name: 'Abir Mahmud Pritam', position: 'Tournament Organizing Lead', batch: '32nd Batch' },
      { name: 'Farhan Ahamed', position: 'Adjudication Core Lead', batch: '33rd Batch' }
    ]
  },
  {
    edition: '3.0',
    year: 2025,
    theme: 'Decentralized Sovereignty & Algorithmic Justice',
    status: 'COMPLETED',
    champion: {
      teamName: 'Quantum Enigma',
      batch: '35th Batch',
      members: ['Samiul Bashar', 'Humaira Tasneem', 'Emon Sarker']
    },
    runnerUp: {
      teamName: 'Stack Overflow Warriors',
      batch: '36th Batch',
      members: ['Shadman Shakib', 'Farhana Akhter Rimi', 'Mahfuzur Rahman']
    },
    bestTournamentDebater: {
      name: 'Humaira Tasneem',
      batch: '35th Batch',
      studentId: '211311015',
      achievement: 'Record 81.4 speaker points in the Grand Final debate.'
    },
    finalMatchBestDebater: {
      name: 'Samiul Bashar',
      batch: '35th Batch',
      studentId: '211311003'
    },
    committee: [
      { name: 'Mahfujur Rahman Arnob', position: 'Coordinator & Faculty Advisor', batch: 'Faculty of CSE' },
      { name: 'Nuhan Intekhab', position: 'Coordinator & Faculty Advisor', batch: 'Faculty of CSE' },
      { name: 'Abir Mahmud Pritam', position: 'Organizing Head', batch: '32nd Batch' },
      { name: 'Farhan Ahamed', position: 'Organizing Secretary', batch: '33rd Batch' }
    ]
  },
  {
    edition: '4.0',
    year: 2026,
    theme: 'Defend your stance with logic — Intra-CSE Parliamentary Debate Championship',
    status: 'IN_PROGRESS',
    champion: {
      teamName: 'Championship In Progress',
      batch: '2026 Season',
      members: ['To be crowned in Grand Final', 'Play-Off Rounds: Oct 25, 2026', 'Varendra University Auditorium'],
      photoUrl: ''
    },
    runnerUp: {
      teamName: 'Runner-Up TBD',
      batch: '2026 Season',
      members: ['Silver Medalist', 'Trophy Presentation', 'VU Central Auditorium'],
      photoUrl: ''
    },
    emergingTeam: {
      teamName: 'Emerging Team TBD',
      batch: '2026 Season',
      members: ['Rising Debaters Award', 'Breakout Performance', 'VU Central Auditorium'],
      photoUrl: ''
    },
    bestTournamentDebater: {
      name: 'Tabulation in Progress',
      batch: 'Department of CSE',
      studentId: 'TD4-TAB-LIVE',
      achievement: 'Calculated dynamically across play-off and knockout rounds.',
      photoUrl: ''
    },
    finalMatchBestDebater: {
      name: 'Final Round Best Speaker TBD',
      batch: 'Department of CSE',
      studentId: 'TD4-FINAL-BS',
      photoUrl: ''
    },
    committee: [
      { name: 'Mahfujur Rahman Arnob', position: 'Coordinator (Faculty Member)', batch: 'Faculty of CSE' },
      { name: 'Nuhan Intekhab', position: 'Coordinator (Faculty Member)', batch: 'Faculty of CSE' },
      { name: 'Abir Mahmud Pritam', position: 'Organizing Head', batch: '32nd Batch' },
      { name: 'Farhan Ahamed', position: 'Organizing Secretary', batch: '33rd Batch' },
      { name: 'Sumsuzzoha', position: 'Kit Distribution Head', batch: '33rd Batch' },
      { name: 'Md. Sohel Parvez', position: 'Event Coordination & Decoration Head', batch: '33rd Batch' },
      { name: 'Mafikul Islam', position: 'Marketing & Communication Head', batch: '33rd Batch' },
      { name: 'Ovijit Saha', position: 'Snacks & Food Head', batch: '33rd Batch' }
    ]
  }
];

export const NOTICES: Notice[] = [
  {
    id: 'n1',
    title: 'Tech Debate 4.0 Registration Window & 64-Squad Slot Allocation',
    category: 'ANNOUNCEMENT',
    content: 'Online registration runs from October 17 to October 22, 2026 at 11:59 PM BST. Up to 64 3-member squads across CSE batches will be confirmed upon MFS payment verification.',
    isPinned: true,
    publishedAt: '2026-10-17T09:00:00Z'
  },
  {
    id: 'n2',
    title: 'Asian Parliamentary Format & Adjudication Rubric (40-40-20)',
    category: 'RULES',
    content: 'All matches follow 3v3 Asian Parliamentary rules: 4-minute Constructive Speeches and 3-minute Reply Speeches (1st or 2nd speaker only). Adjudication follows Matter (40%), Manner (40%), and Method (20%).',
    isPinned: true,
    publishedAt: '2026-10-17T12:00:00Z'
  },
  {
    id: 'n3',
    title: 'MFS Payment Verification Protocol for Team Leaders',
    category: 'URGENT',
    content: 'Please ensure your bKash or Nagad Send Money (350 BDT to 01718169072) TrxID and sender phone number are entered accurately. Verified teams receive instant official confirmation.',
    isPinned: false,
    publishedAt: '2026-10-18T10:30:00Z'
  }
];

export const SCHEDULE: ScheduleItem[] = [
  {
    id: 's1',
    title: 'Registration Opens',
    date: '17 Oct',
    timeRange: '10:00 AM BST',
    venue: 'Online Portal',
    description: 'Portal live for team formation, member data collection, and MFS payment verification.',
    isCompleted: true,
    isActive: false
  },
  {
    id: 's2',
    title: 'Registration Closes',
    date: '22 Oct',
    timeRange: '11:59 PM BST',
    venue: 'Tech Debate Portal',
    description: 'Final cutoff for submitting member details and transaction IDs. Roster lock.',
    isCompleted: false,
    isActive: true
  },
  {
    id: 's3',
    title: 'Play-Off Rounds Start',
    date: '25 Oct',
    timeRange: '09:30 AM BST',
    venue: 'CSE Seminar Rooms & Galleries',
    description: 'Play-off rounds kick off for teams competing to reach the knockout stage.',
    isCompleted: false,
    isActive: false
  },
  {
    id: 's4',
    title: 'Round of 32',
    date: 'Upcoming',
    timeRange: 'To Be Announced',
    venue: 'CSE Galleries',
    description: 'Knockout matches filtering top 32 teams.',
    isCompleted: false,
    isActive: false
  },
  {
    id: 's5',
    title: 'Quarter & Semi Finals',
    date: 'Upcoming',
    timeRange: 'To Be Announced',
    venue: 'Central Seminar Hall',
    description: 'Elite elimination debates on cutting-edge technology motions.',
    isCompleted: false,
    isActive: false
  },
  {
    id: 's6',
    title: 'Grand Final',
    date: 'Upcoming',
    timeRange: 'To Be Announced',
    venue: 'Main Auditorium',
    description: 'The ultimate championship debate clash and award ceremony.',
    isCompleted: false,
    isActive: false
  }
];

export const GALLERY_ITEMS: GalleryPhoto[] = [
  {
    id: 'g-workshop',
    title: 'Workshop - Debate Unlocked',
    category: 'WORKSHOP',
    imageUrl: '',
    images: [],
    caption: 'Faculty Convenor and advisors conducting the pre-tournament workshop on Asian Parliamentary debate structure.',
    date: '03 September'
  },
  {
    id: 'g-kit',
    title: 'Official Delegate Kit Distribution',
    category: 'KIT_DISTRIBUTION',
    imageUrl: '',
    images: [],
    caption: 'Participating CSE debaters receiving their official tournament badges, folders, and delegate kits.',
    date: '25 October'
  },
  {
    id: 'g-sessions',
    title: 'Parliamentary Debate Sessions & Rebuttals',
    category: 'DEBATE_SESSIONS',
    imageUrl: '',
    images: [],
    caption: 'Fierce debate sessions, constructive speeches, and sharp Point of Information (POI) exchanges on stage.',
    date: '26 October'
  },
  {
    id: 'g-judges',
    title: 'Adjudication Core Evaluation Panel',
    category: 'JUDGES',
    imageUrl: '',
    images: [],
    caption: 'Distinguished faculty adjudicators deliberating on speaker marks and motion interpretations.',
    date: 'October 2026'
  },
  {
    id: 'g-final',
    title: 'Grand Final Showdown on Stage',
    category: 'FINAL_EVENT',
    imageUrl: '',
    images: [],
    caption: 'Grand final clash in the central auditorium packed with CSE faculty and students.',
    date: 'Upcoming'
  },
  {
    id: 'g-awards',
    title: 'Championship Trophy & Award Ceremony',
    category: 'AWARDS',
    imageUrl: '',
    images: [],
    caption: 'Official conferral of Champion, Runners-Up, Emerging Team, and Best Tournament Debater awards.',
    date: 'Upcoming'
  }
];

export const COMMITTEE_MEMBERS: CommitteeMember[] = [
  {
    id: 'lead-arnab-sir',
    name: 'Mahfujur Rahman Arnob',
    position: 'Coordinator',
    studentId: 'FACULTY',
    batch: 'Faculty Member',
    email: '',
    phone: '',
    photoUrl: '/images/committee/arnab_sir.jpg',
    bio: 'Coordinator guiding tournament governance and debate standards for Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'lead-nuhan-sir',
    name: 'Nuhan Intekhab',
    position: 'Coordinator',
    studentId: 'FACULTY',
    batch: 'Faculty Member',
    email: '',
    phone: '',
    photoUrl: '/images/committee/nuhan_sir.jpg',
    bio: 'Coordinator guiding adjudication integrity and technical debate standards.'
  },
  {
    id: 'lead-pritam',
    name: 'Abir Mahmud Pritam',
    position: 'Organizing Head',
    studentId: '231311070',
    batch: '32nd Batch',
    email: 'abirmahmudpritam001@gmail.com',
    phone: '01718169072',
    photoUrl: '/images/committee/pritam.jpg',
    bio: 'Organizing Head & Lead Developer of Tech Debate 4.0 Platform (ID: 231311070, 8th Semester, 32nd Batch, Dept. of CSE, Varendra University, Rajshahi).'
  },
  {
    id: 'lead-farhan',
    name: 'Farhan Ahamed',
    position: 'Organizing Secretary',
    studentId: 'STUDENT-CONVENOR',
    batch: '33rd Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/farhan.jpg',
    bio: 'Organizing Secretary managing event schedules, squad coordination, and logistics.'
  },
  {
    id: 'stu-232311242',
    name: 'Sumsuzzoha',
    position: 'Executive Member',
    studentId: '232311242',
    batch: '33rd Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/zoha.jpg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-232311177',
    name: 'Md. Sohel Parvez',
    position: 'Executive Member',
    studentId: '232311177',
    batch: '33rd Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/sohel.jpg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-232311070',
    name: 'Mafikul Islam',
    position: 'Executive Member',
    studentId: '232311070',
    batch: '33rd Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/mafikul.webp',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-232311174',
    name: 'Ovijit Saha',
    position: 'Executive Member',
    studentId: '232311174',
    batch: '33rd Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/ovijit.jpg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-242311102',
    name: 'Md.Mohaiminul Islam Ibnee Shohid Uthsho',
    position: 'Executive Member',
    studentId: '242311102',
    batch: '35th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/uthsho.jpg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-242311029',
    name: 'Golam Mortuza Shipu',
    position: 'Executive Member',
    studentId: '242311029',
    batch: '35th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/mortuza.jpg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-242311169',
    name: 'Umme Nazahat Prova',
    position: 'Executive Member',
    studentId: '242311169',
    batch: '35th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/prova.jpg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-242311155',
    name: 'MD Maruful Haque',
    position: 'Executive Member',
    studentId: '242311155',
    batch: '35th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/maruf.jpg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-242311146',
    name: 'Sakib Abdullah',
    position: 'Executive Member',
    studentId: '242311146',
    batch: '35th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/sakib.jpg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-242311152',
    name: 'Tamim Tahmid Islam',
    position: 'Executive Member',
    studentId: '242311152',
    batch: '35th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/tamim.jpeg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-242311051',
    name: 'Umme Hanifa (Rinky)',
    position: 'Executive Member',
    studentId: '242311051',
    batch: '35th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/rinky.jpg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-251311039',
    name: 'Md Emran Ali',
    position: 'Executive Member',
    studentId: '251311039',
    batch: '36th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/emran.jpg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-251311021',
    name: 'Mst. Sohely',
    position: 'Executive Member',
    studentId: '251311021',
    batch: '36th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/sohely.png',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-252311067',
    name: 'Mehedi Hassan',
    position: 'Executive Member',
    studentId: '252311067',
    batch: '37th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/mehedi.jpg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-252311059',
    name: 'Din Mohammad Sobuj',
    position: 'Executive Member',
    studentId: '252311059',
    batch: '37th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/sobuj.jpg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-252311060',
    name: 'Abu Abdullah Al Arif',
    position: 'Executive Member',
    studentId: '252311060',
    batch: '37th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/arif.png',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-252311051',
    name: 'Md. Saife Rahman',
    position: 'Executive Member',
    studentId: '252311051',
    batch: '37th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/saife.jpg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-25231226',
    name: 'Sameus Sabik',
    position: 'Executive Member',
    studentId: '252311226',
    batch: '37th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/sutro.png',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-252311142',
    name: 'Mehrin Nesa',
    position: 'Executive Member',
    studentId: '252311142',
    batch: '37th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/mehrin.png',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  },
  {
    id: 'stu-252311018',
    name: 'Umma Roman',
    position: 'Executive Member',
    studentId: '252311018',
    batch: '37th Batch',
    email: '',
    phone: '',
    photoUrl: '/images/committee/ahona.jpeg',
    bio: 'Executive Member, Dept. of CSE, Varendra University, Rajshahi.'
  }
];

export const PARLIAMENTARY_RULES = {
  format: {
    title: 'Parliamentary Debate Structure',
    description: 'Tech Debate 4.0 adheres to the 3v3 Asian Parliamentary (AP) debate format tailored for intra-departmental technical clash.',
    points: [
      'Each match consists of two teams: Government (Affirmative/Proposition) and Opposition (Negative).',
      'Each team comprises 3 debaters representing Prime Minister/Leader of Opposition, Deputy, and Government/Opposition Whip.',
      'A 4-minute constructive speech is delivered by each debater, followed by a 3-minute Reply Speech by either the 1st or 2nd speaker.'
    ]
  },
  timing: {
    title: 'Speech Timing & Bell Management',
    description: 'Strict adherence to time is monitored by official timekeepers with timed bell signals:',
    points: [
      'Constructive Speeches: 4 minutes per speaker (Single bell at 1st min & 3rd min, double bell at 4th min).',
      'Reply Speeches: 3 minutes (Single bell at 2nd min, double bell at 3rd min; no POIs allowed).',
      'Preparation Time: 15 minutes after motion release without internet or external consultation.',
      'Grace period of 20 seconds is permitted after the final bell before overtime penalties commence.'
    ]
  },
  poi: {
    title: 'Points of Information (POI) Protocol',
    description: 'Direct parliamentary engagement between speakers is governed by standard protocol:',
    points: [
      'POIs are permitted only between the 1st and 3rd minute of substantive speeches (unprotected time).',
      'The debater offering the POI must stand up, address the chair ("Point of Information"), and await acceptance.',
      'The speaker holding the floor has full discretion to accept or decline.',
      'POIs must not exceed 15 seconds. No POIs are permitted during Reply Speeches.'
    ]
  },
  judging: {
    title: 'Adjudication Rubrics & Scoring Criteria',
    description: 'Adjudicators evaluate teams based on three official analytical dimensions:',
    points: [
      'Matter (40%): Logic, causality, evidence, real-world examples, and rebuttal quality.',
      'Manner (40%): Vocal modulation, persuasive poise, rhetorical delivery, and POI handling.',
      'Method (20%): Structure, roadmap, time allocation, and team consistency.'
    ]
  },
  conduct: {
    title: 'Code of Conduct & Academic Integrity',
    description: 'Ethical behavior expected from all department debaters and delegates:',
    points: [
      'All participants must carry their Varendra University Student ID Card to every match.',
      'Unparliamentary language, personal attacks, or derogatory remarks result in immediate disqualification.',
      'Decisions made by the Adjudication Core and Chief Adjudicator are final and binding.'
    ]
  }
};
