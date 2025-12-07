'use client';

import { useCourses, useDeleteCourse } from '@/features/courses/api';
import { useAuthorization } from '@/lib/authorization';
import { ErrorBoundary } from '@/lib/components/error-boundary';
import { CourseWithInstructor } from '@/types';

export const CoursesList = () => {
  const { data: courses, isLoading, error } = useCourses();
  const deleteCourse = useDeleteCourse();
  const { checkAccess } = useAuthorization();

  if (isLoading) {
    return <div className="text-center py-8">Loading courses...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Error loading courses: {error.message}
      </div>
    );
  }

  const handleDelete = async (courseId: number) => {
    if (confirm('Are you sure you want to delete this course?')) {
      await deleteCourse.mutateAsync(courseId);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {courses?.data?.map((course: CourseWithInstructor) => (
        <div key={course.id} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
          <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
          <div className="flex items-center justify-between">
            <span className="text-blue-600 font-bold">${course.price}</span>
            <div className="flex gap-2">
              {checkAccess('course:update', course) && (
                <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                  Edit
                </button>
              )}
              {checkAccess('course:delete', course) && (
                <button
                  onClick={() => handleDelete(course.id)}
                  disabled={deleteCourse.isPending}
                  className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                  {deleteCourse.isPending ? 'Deleting...' : 'Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Wrap with ErrorBoundary
export const CoursesListWithBoundary = () => (
  <ErrorBoundary
    fallback={
      <div className="text-center py-8 text-red-600">
        Something went wrong loading courses. Please try again.
      </div>
    }
  >
    <CoursesList />
  </ErrorBoundary>
);
