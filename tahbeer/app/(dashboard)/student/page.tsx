import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Student Dashboard',
};

export default async function StudentDashboard() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Student Dashboard</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/student/courses"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Browse Courses</h3>
            <p className="mt-2 text-sm text-gray-500">
              Explore available courses
            </p>
          </div>
        </Link>

        <Link
          href="/student/my-courses"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">My Courses</h3>
            <p className="mt-2 text-sm text-gray-500">
              View your enrolled courses
            </p>
          </div>
        </Link>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Profile</h3>
            <p className="mt-2 text-sm text-gray-500">
              Manage your profile settings
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
