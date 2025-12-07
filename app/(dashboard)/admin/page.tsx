import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default async function AdminDashboard() {
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/users"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Manage Users</h3>
            <p className="mt-2 text-sm text-gray-500">
              View and manage all users, update roles
            </p>
          </div>
        </Link>

        <Link
          href="/admin/courses"
          className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
        >
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Manage Courses</h3>
            <p className="mt-2 text-sm text-gray-500">
              View and manage all courses in the system
            </p>
          </div>
        </Link>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900">Statistics</h3>
            <p className="mt-2 text-sm text-gray-500">
              View platform statistics and analytics
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
