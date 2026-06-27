import React from 'react';
import AdminStudyZoneTab from '../../components/admin/study/AdminStudyZoneTab';

const AdminStudyZone = () => {
  return (
    <div className="flex-1 bg-slate-50/50 min-h-screen p-4 md:p-8 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
            Quản lý Học liệu
          </h1>
          <p className="mt-2 text-base text-slate-500 font-medium">
            Thiết lập chương trình học, bài giảng và tài liệu StudyZone.
          </p>
        </div>
        <AdminStudyZoneTab />
      </div>
    </div>
  );
};

export default AdminStudyZone;
