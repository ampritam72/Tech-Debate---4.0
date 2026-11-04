import { useState, useEffect } from 'react';

export interface CommitteeMemberData {
  id: string;
  name: string;
  studentId: string;
  semester: string;
  semesterNumber: number;
  contactNumber: string;
  photoUrl: string;
  photoCandidates?: string[];
  position?: string;
  isPlaceholder?: boolean;
}

// Executive Leadership & Advisory Board (4 Key Leaders: Arnab Sir, Nuhan Sir, Pritam, Farhan)
export const LEADERSHIP_CARDS: CommitteeMemberData[] = [
  {
    id: 'lead-arnab-sir',
    name: 'Mahfujur Rahman Arnob',
    studentId: 'FACULTY',
    semester: 'Faculty Member',
    semesterNumber: 99,
    contactNumber: '',
    photoUrl: '/images/committee/arnab_sir.jpg',
    photoCandidates: [
      '/images/committee/arnab_sir.jpg',
      '/images/committee/arnab sir.jpg',
      '/images/committee/arnab.jpg',
    ],
    position: 'Coordinator',
    isPlaceholder: false,
  },
  {
    id: 'lead-nuhan-sir',
    name: 'Nuhan Intekhab',
    studentId: 'FACULTY',
    semester: 'Faculty Member',
    semesterNumber: 99,
    contactNumber: '',
    photoUrl: '/images/committee/nuhan_sir.jpg',
    photoCandidates: [
      '/images/committee/nuhan_sir.jpg',
      '/images/committee/nuhan sir.jpg',
      "/images/committee/nuhan sir'.jpg",
      '/images/committee/nuhan.jpg',
    ],
    position: 'Coordinator',
    isPlaceholder: false,
  },
  {
    id: 'lead-pritam',
    name: 'Abir Mahmud Pritam',
    studentId: '32nd batch',
    semester: '32nd Batch',
    semesterNumber: 98,
    contactNumber: '',
    photoUrl: '/images/committee/pritam.jpg',
    photoCandidates: [
      '/images/committee/pritam.jpg',
      '/images/committee/pritam.png',
      '/images/committee/pritam.jpeg',
    ],
    position: 'Organizing Head',
    isPlaceholder: false,
  },
  {
    id: 'lead-farhan',
    name: 'Farhan Ahamed',
    studentId: 'STUDENT-CONVENOR',
    semester: '33rd Batch',
    semesterNumber: 98,
    contactNumber: '',
    photoUrl: '/images/committee/farhan.jpg',
    photoCandidates: [
      '/images/committee/farhan.jpg',
      '/images/committee/farhan.png',
      '/images/committee/farhan.jpeg',
    ],
    position: 'Organizing Secretary',
    isPlaceholder: false,
  },
];

// Student committee members sorted strictly semester-wise: highest (7th) to lowest (3rd)
export const SORTED_STUDENT_MEMBERS: CommitteeMemberData[] = [
  // 7th Batch (4 members)
  {
    id: 'stu-232311242',
    name: 'Sumsuzzoha',
    studentId: '232311242',
    semester: '33rd Batch',
    semesterNumber: 7,
    contactNumber: '',
    photoUrl: '/images/committee/zoha.jpg',
    photoCandidates: ['/images/committee/zoha.jpg', '/images/committee/zoha.png', '/images/committee/zoha.jpeg'],
    position: 'Kit Distribution Head',
  },
  {
    id: 'stu-232311177',
    name: 'Md. Sohel Parvez',
    studentId: '232311177',
    semester: '33rd Batch',
    semesterNumber: 7,
    contactNumber: '',
    photoUrl: '/images/committee/sohel.jpg',
    photoCandidates: ['/images/committee/sohel.jpg', '/images/committee/sohel.png', '/images/committee/sohel.jpeg'],
    position: 'Event Coordination & Decoration Head',
  },
  {
    id: 'stu-232311070',
    name: 'Mafikul Islam',
    studentId: '232311070',
    semester: '33rd Batch',
    semesterNumber: 7,
    contactNumber: '',
    photoUrl: '/images/committee/mafikul.webp',
    photoCandidates: ['/images/committee/mafikul.webp', '/images/committee/mafikul.jpg', '/images/committee/mafikul.png'],
    position: 'Marketing & Communication Head',
  },
  {
    id: 'stu-232311174',
    name: 'Ovijit Saha',
    studentId: '232311174',
    semester: '33rd Batch',
    semesterNumber: 7,
    contactNumber: '',
    photoUrl: '/images/committee/ovijit.jpg',
    photoCandidates: ['/images/committee/ovijit.jpg', '/images/committee/ovijit.png', '/images/committee/ovijit.jpeg'],
    position: 'Snacks & Food Head',
  },

  // 5th Batch (7 members)
  {
    id: 'stu-242311102',
    name: 'Md.Mohaiminul Islam Ibnee Shohid Uthsho',
    studentId: '242311102',
    semester: '35th Batch',
    semesterNumber: 5,
    contactNumber: '',
    photoUrl: '/images/committee/uthsho.jpg',
    photoCandidates: ['/images/committee/uthsho.jpg', '/images/committee/uthsho.png', '/images/committee/uthsho.jpeg'],
    position: 'Judge & Hospitality',
  },
  {
    id: 'stu-242311029',
    name: 'Golam Mortuza Shipu',
    studentId: '242311029',
    semester: '35th Batch',
    semesterNumber: 5,
    contactNumber: '',
    photoUrl: '/images/committee/mortuza.jpg',
    photoCandidates: ['/images/committee/mortuza.jpg', '/images/committee/mortuza.png', '/images/committee/mortuza.jpeg'],
    position: 'Logostics & Venue Head',
  },
  {
    id: 'stu-242311124',
    name: 'Md. Ramiz Reza',
    studentId: '242311124',
    semester: '35th Batch',
    semesterNumber: 5,
    contactNumber: '',
    photoUrl: '/images/committee/ramiz.jpg',
    photoCandidates: ['/images/committee/ramiz.jpg', '/images/committee/ramiz.png', '/images/committee/ramiz.jpeg'],
    position: 'Executive Member',
  },
  {
    id: 'stu-242311155',
    name: 'MD Maruful Haque',
    studentId: '242311155',
    semester: '35th Batch',
    semesterNumber: 5,
    contactNumber: '',
    photoUrl: '/images/committee/maruf.jpg',
    photoCandidates: ['/images/committee/maruf.jpg', '/images/committee/maruf.png', '/images/committee/maruf.jpeg'],
    position: 'Executive Member',
  },
  {
    id: 'stu-242311146',
    name: 'Sakib Abdullah',
    studentId: '242311146',
    semester: '35th Batch',
    semesterNumber: 5,
    contactNumber: '',
    photoUrl: '/images/committee/sakib.jpg',
    photoCandidates: ['/images/committee/sakib.jpg', '/images/committee/sakib.png', '/images/committee/sakib.jpeg'],
    position: 'Executive Member',
  },
  {
    id: 'stu-242311152',
    name: 'Tamim Tahmid Islam',
    studentId: '242311152',
    semester: '35th Batch',
    semesterNumber: 5,
    contactNumber: '',
    photoUrl: '/images/committee/tamim.jpeg',
    photoCandidates: ['/images/committee/tamim.jpeg', '/images/committee/tamim.jpg', '/images/committee/tamim.png'],
    position: 'Executive Member',
  },
  {
    id: 'stu-242311169',
    name: 'Umme Nazahat Prova',
    studentId: '242311169',
    semester: '35th Batch',
    semesterNumber: 5,
    contactNumber: '',
    photoUrl: '/images/committee/prova.jpg',
    photoCandidates: ['/images/committee/prova.jpg', '/images/committee/prova.png', '/images/committee/prova.jpeg'],
    position: 'Executive Member',
  },
  {
    id: 'stu-242311051',
    name: 'Umme Hanifa (Rinky)',
    studentId: '242311051',
    semester: '35th Batch',
    semesterNumber: 5,
    contactNumber: '',
    photoUrl: '/images/committee/rinky.jpg',
    photoCandidates: ['/images/committee/rinky.jpg', '/images/committee/rinky.png', '/images/committee/rinky.jpeg'],
    position: 'Executive Member',
  },

  // 4th Batch (2 members)
  {
    id: 'stu-251311039',
    name: 'Md Emran Ali',
    studentId: '251311039',
    semester: '36th Batch',
    semesterNumber: 4,
    contactNumber: '',
    photoUrl: '/images/committee/emran.jpg',
    photoCandidates: ['/images/committee/emran.jpg', '/images/committee/emran.png', '/images/committee/emran.jpeg'],
    position: 'Executive Member',
  },
  {
    id: 'stu-251311021',
    name: 'Mst. Sohely',
    studentId: '251311021',
    semester: '36th Batch',
    semesterNumber: 4,
    contactNumber: '',
    photoUrl: '/images/committee/sohely.png',
    photoCandidates: ['/images/committee/sohely.png', '/images/committee/sohely.jpg', '/images/committee/sohely.jpeg'],
    position: 'Executive Member',
  },

  // 3rd Batch (2 members)
  {
    id: 'stu-252311067',
    name: 'Mehedi Hassan',
    studentId: '252311067',
    semester: '37th Batch',
    semesterNumber: 3,
    contactNumber: '',
    photoUrl: '/images/committee/mehedi.jpg',
    photoCandidates: ['/images/committee/mehedi.jpg', '/images/committee/mehedi.png', '/images/committee/mehedi.jpeg'],
    position: 'Executive Member',
  },
  {
    id: 'stu-252311059',
    name: 'Din Mohammad Sobuj',
    studentId: '252311059',
    semester: '37th Batch',
    semesterNumber: 3,
    contactNumber: '',
    photoUrl: '/images/committee/sobuj.jpg',
    photoCandidates: ['/images/committee/sobuj.jpg', '/images/committee/sobuj.png', '/images/committee/sobuj.jpeg'],
    position: 'Executive Member',
  },
  {
    id: 'stu-252311060',
    name: 'Abu Abdullah Al Arif',
    studentId: '252311060',
    semester: '37th Batch',
    semesterNumber: 3,
    contactNumber: '',
    photoUrl: '/images/committee/arif.png',
    photoCandidates: ['/images/committee/arif.png', '/images/committee/arif.jpg', '/images/committee/arif.jpeg'],
    position: 'Executive Member',
  },
  {
    id: 'stu-252311051',
    name: 'Md. Saife Rahman',
    studentId: '252311051',
    semester: '37th Batch',
    semesterNumber: 3,
    contactNumber: '',
    photoUrl: '/images/committee/saife.jpg',
    photoCandidates: ['/images/committee/saife.jpg', '/images/committee/saife.png', '/images/committee/saife.jpeg'],
    position: 'Executive Member',
  },
  {
    id: 'stu-25231226',
    name: 'Sameus Sabik',
    studentId: '252311226',
    semester: '37th Batch',
    semesterNumber: 3,
    contactNumber: '',
    photoUrl: '/images/committee/sutro.png',
    photoCandidates: ['/images/committee/sutro.png', '/images/committee/sutro.jpg', '/images/committee/sutro.jpeg'],
    position: 'Executive Member',
  },
  {
    id: 'stu-252311093',
    name: 'Enzamul Haque Saikot',
    studentId: '252311093',
    semester: '37th Batch',
    semesterNumber: 3,
    contactNumber: '',
    photoUrl: '/images/committee/saikat.png',
    photoCandidates: ['/images/committee/saikat.png', '/images/committee/saikot.png', '/images/committee/saikat.jpg', '/images/committee/saikot.jpg', '/images/committee/saikot.jpeg'],
    position: 'Executive Member',
  },
  {
    id: 'stu-252311142',
    name: 'Mehrin Nesa',
    studentId: '252311142',
    semester: '37th Batch',
    semesterNumber: 3,
    contactNumber: '',
    photoUrl: '/images/committee/mehrin.png',
    photoCandidates: ['/images/committee/mehrin.png', '/images/committee/mehrin.jpg', '/images/committee/mehrin.jpeg'],
    position: 'Executive Member',
  },
  {
    id: 'stu-252311018',
    name: 'Umma Roman',
    studentId: '252311018',
    semester: '37th Batch',
    semesterNumber: 3,
    contactNumber: '',
    photoUrl: '/images/committee/ahona.jpeg',
    photoCandidates: ['/images/committee/ahona.jpeg', '/images/committee/ahona.jpg', '/images/committee/ahona.png'],
    position: 'Executive Member',
  },
  {
    id: 'stu-252311111',
    name: 'Hamida Noor Tashfia',
    studentId: '252311111',
    semester: '37th Batch',
    semesterNumber: 3,
    contactNumber: '',
    photoUrl: '/images/committee/tashfia.jpg',
    photoCandidates: ['/images/committee/tashfia.jpg', '/images/committee/tashfia.jpeg', '/images/committee/tashfia.png'],
    position: 'Executive Member',
  },
];

// For backwards compatibility
export const TOP_EMPTY_CARDS = LEADERSHIP_CARDS;

const COMMITTEE_PHOTOS_CACHE_KEY = 'td4_committee_photo_overrides_v1';
const COMMITTEE_ROSTER_CACHE_KEY = 'td4_committee_roster_v1';

export interface CommitteeRosterPayload {
  leadership: CommitteeMemberData[];
  students: CommitteeMemberData[];
  photos?: Record<string, string>;
}

export function getCachedCommitteePhotos(): Record<string, string> {
  try {
    const raw = localStorage.getItem(COMMITTEE_PHOTOS_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch {}
  return {};
}

export function getCachedCommitteeRoster(): {
  leadership: CommitteeMemberData[];
  students: CommitteeMemberData[];
} {
  try {
    const raw = localStorage.getItem(COMMITTEE_ROSTER_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === 'object' &&
        Array.isArray(parsed.leadership) &&
        Array.isArray(parsed.students)
      ) {
        return {
          leadership: parsed.leadership,
          students: parsed.students,
        };
      }
    }
  } catch {}
  return {
    leadership: LEADERSHIP_CARDS,
    students: SORTED_STUDENT_MEMBERS,
  };
}

export function notifyCommitteePhotosUpdated(photos: Record<string, string>) {
  try {
    localStorage.setItem(COMMITTEE_PHOTOS_CACHE_KEY, JSON.stringify(photos));
    window.dispatchEvent(new CustomEvent('committee-photos-updated', { detail: photos }));
  } catch {}
}

export function notifyCommitteeRosterUpdated(payload: CommitteeRosterPayload) {
  try {
    localStorage.setItem(
      COMMITTEE_ROSTER_CACHE_KEY,
      JSON.stringify({ leadership: payload.leadership, students: payload.students })
    );
    if (payload.photos) {
      localStorage.setItem(COMMITTEE_PHOTOS_CACHE_KEY, JSON.stringify(payload.photos));
    }
    window.dispatchEvent(new CustomEvent('committee-roster-updated', { detail: payload }));
  } catch {}
}

export function useCommitteePhotos(): Record<string, string> {
  const [photos, setPhotos] = useState<Record<string, string>>(() => getCachedCommitteePhotos());

  useEffect(() => {
    let mounted = true;
    fetch('/api/committee-photos')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (mounted && data && data.photos && typeof data.photos === 'object') {
          setPhotos(data.photos);
          try {
            localStorage.setItem(COMMITTEE_PHOTOS_CACHE_KEY, JSON.stringify(data.photos));
          } catch {}
        }
      })
      .catch(() => {});

    const handleUpdate = (e: Event) => {
      const custom = e as CustomEvent<Record<string, string>>;
      if (custom.detail && typeof custom.detail === 'object') {
        setPhotos({ ...custom.detail });
      }
    };
    window.addEventListener('committee-photos-updated', handleUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('committee-photos-updated', handleUpdate);
    };
  }, []);

  return photos;
}

export function useCommitteeRoster(): {
  leadership: CommitteeMemberData[];
  students: CommitteeMemberData[];
  photoOverrides: Record<string, string>;
} {
  const [roster, setRoster] = useState<{
    leadership: CommitteeMemberData[];
    students: CommitteeMemberData[];
  }>(() => getCachedCommitteeRoster());
  const [photoOverrides, setPhotoOverrides] = useState<Record<string, string>>(() =>
    getCachedCommitteePhotos()
  );

  useEffect(() => {
    let mounted = true;
    fetch('/api/committee-roster')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data) return;
        const nextLeadership = Array.isArray(data.leadership)
          ? data.leadership
          : LEADERSHIP_CARDS;
        const nextStudents = Array.isArray(data.students)
          ? data.students
          : SORTED_STUDENT_MEMBERS;
        setRoster({ leadership: nextLeadership, students: nextStudents });
        try {
          localStorage.setItem(
            COMMITTEE_ROSTER_CACHE_KEY,
            JSON.stringify({ leadership: nextLeadership, students: nextStudents })
          );
        } catch {}

        if (data.photos && typeof data.photos === 'object') {
          setPhotoOverrides(data.photos);
          try {
            localStorage.setItem(COMMITTEE_PHOTOS_CACHE_KEY, JSON.stringify(data.photos));
          } catch {}
        }
      })
      .catch(() => {});

    const handleRosterUpdate = (e: Event) => {
      const custom = e as CustomEvent<CommitteeRosterPayload>;
      if (custom.detail) {
        setRoster({
          leadership: Array.isArray(custom.detail.leadership)
            ? custom.detail.leadership
            : LEADERSHIP_CARDS,
          students: Array.isArray(custom.detail.students)
            ? custom.detail.students
            : SORTED_STUDENT_MEMBERS,
        });
        if (custom.detail.photos) {
          setPhotoOverrides({ ...custom.detail.photos });
        }
      }
    };

    const handlePhotosUpdate = (e: Event) => {
      const custom = e as CustomEvent<Record<string, string>>;
      if (custom.detail && typeof custom.detail === 'object') {
        setPhotoOverrides({ ...custom.detail });
      }
    };

    window.addEventListener('committee-roster-updated', handleRosterUpdate);
    window.addEventListener('committee-photos-updated', handlePhotosUpdate);
    return () => {
      mounted = false;
      window.removeEventListener('committee-roster-updated', handleRosterUpdate);
      window.removeEventListener('committee-photos-updated', handlePhotosUpdate);
    };
  }, []);

  return {
    leadership: roster.leadership,
    students: roster.students,
    photoOverrides,
  };
}

