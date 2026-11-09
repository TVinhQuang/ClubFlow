/** Accounts provided in advance by the club. There is no password or real authentication in this prototype. */
export const roleLabels={executive:'Ban điều hành',applicant:'Ứng viên',interviewer:'Người phỏng vấn',visitor:'Khách'};
export const roleHome={executive:'index.html',applicant:'my-applications.html',interviewer:'interviews.html',visitor:'discover.html'};

export const accounts=[
  {id:'exec-quang',role:'executive',name:'Trần Vinh Quang',title:'Ban tuyển dụng',initials:'VQ',avatar:'assets/images/avatar.png'},
  {id:'app-huy',role:'applicant',name:'Trần Gia Huy',title:'Sinh viên · 24120102',studentId:'24120102',email:'giahuy.tran@example.com',year:'Năm 2',major:'Hệ thống thông tin',initials:'GH'},
  {id:'app-ngoc',role:'applicant',name:'Nguyễn Hoàng Bảo Ngọc',title:'Sinh viên · 25120836',studentId:'25120836',email:'baongoc.nguyen@example.com',year:'Năm 1',major:'Toán tin ứng dụng',initials:'BN'},
  {id:'app-khoa',role:'applicant',name:'Bùi Đăng Khoa',title:'Sinh viên · 25120419',studentId:'25120419',email:'dangkhoa.bui@example.com',year:'Năm 1',major:'Công nghệ thông tin',initials:'DK'},
  {id:'iv-linh',role:'interviewer',name:'Võ Khánh Linh',title:'Trưởng ban Nội dung',initials:'KL'},
  {id:'iv-nam',role:'interviewer',name:'Đặng Hoài Nam',title:'Trưởng ban Sáng tạo',initials:'HN'},
  {id:'iv-tram',role:'interviewer',name:'Lý Ngọc Trâm',title:'Trưởng ban Sự kiện',initials:'NT'}
];
export const visitor={id:'visitor',role:'visitor',name:'Khách',title:'Chưa đăng nhập',initials:'?'};
export const findAccount=id=>accounts.find(a=>a.id===id)||null;
