/** Owner: Nguyễn Thái Cường — 24127336. Sample scheduling data only; applicant records stay in screen 2. */

/** Rooms the club can book. Rooms are chosen from this list, never created here. */
export const roomCatalog = [
  { id: 'room-i23', name: 'Phòng I.23 · Nhà I' },
  { id: 'room-i24', name: 'Phòng I.24 · Nhà I' },
  { id: 'room-club', name: 'Phòng sinh hoạt CLB' }
];

/** Interviewer accounts are provided in advance; the Executive assigns positions and availability. */
export const interviewerCatalog = [
  { id: 'iv-linh', name: 'Võ Khánh Linh', title: 'Trưởng ban Nội dung' },
  { id: 'iv-nam', name: 'Đặng Hoài Nam', title: 'Trưởng ban Sáng tạo' },
  { id: 'iv-tram', name: 'Lý Ngọc Trâm', title: 'Trưởng ban Sự kiện' }
];

export const initialScheduleConfig = {
  date: '2026-11-23',
  start: '08:00',
  end: '11:00',
  duration: 20,
  interviewers: [
    { id: 'iv-linh', positionIds: ['position-content'], from: '08:00', to: '11:00' },
    { id: 'iv-nam', positionIds: ['position-design', 'position-photo'], from: '08:00', to: '10:00' },
    { id: 'iv-tram', positionIds: ['position-events'], from: '09:40', to: '11:00' }
  ],
  roomIds: ['room-i23', 'room-i24']
};

/** Time ranges each applicant selected on the interview day (part of the application form). */
export const initialApplicantAvailability = {
  'HS-001': [{ from: '08:00', to: '11:00' }],
  'HS-002': [{ from: '08:00', to: '10:00' }],
  'HS-003': [{ from: '08:00', to: '09:00' }],
  'HS-004': [{ from: '09:00', to: '11:00' }],
  'HS-005': [{ from: '08:00', to: '10:00' }],
  'HS-006': [{ from: '08:00', to: '10:00' }],
  'HS-007': [{ from: '08:00', to: '09:30' }],
  'HS-008': [{ from: '08:00', to: '09:20' }],
  'HS-009': [{ from: '10:00', to: '11:00' }]
};

/**
 * A saved draft after one manual edit: HS-005 was moved onto HS-002's interviewer and room
 * at 08:00, which is a real overlap. HS-008 has no shared time with the events interviewer.
 */
export const initialAssignments = [
  { applicationId: 'HS-002', start: '08:00', interviewerId: 'iv-nam', roomId: 'room-i23' },
  { applicationId: 'HS-003', start: '08:00', interviewerId: 'iv-linh', roomId: 'room-i24' },
  { applicationId: 'HS-005', start: '08:00', interviewerId: 'iv-nam', roomId: 'room-i23' },
  { applicationId: 'HS-009', start: '10:00', interviewerId: 'iv-linh', roomId: 'room-i24' }
];
