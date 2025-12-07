import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Instructor Dashboard',
};

export default async function InstructorDashboard() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Instructor Dashboard</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/instructor/courses"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">My Courses</h3>
            <p className="mt-2 text-sm text-gray-500">
              View and manage your courses
            </p>
          </div>
        </Link>

        <Link
          href="/instructor/courses/new"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Create Course</h3>
            <p className="mt-2 text-sm text-gray-500">
              Create a new course
            </p>
          </div>
        </Link>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Enrollments</h3>
            <p className="mt-2 text-sm text-gray-500">
              View student enrollments in your courses
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
