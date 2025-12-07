import type { ReactNode } from 'react';
import { Suspense } from 'react';

export const metadata = {
  title: 'Dashboard | Tahbeer',
  description: 'Manage courses, users, and enrollments in Tahbeer.',
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div className="p-6">Loading dashboard...</div>}>
        {children}
      </Suspense>
    </div>
  );
}
