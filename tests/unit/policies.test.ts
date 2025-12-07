import { describe, it, expect } from 'vitest';
import { POLICIES } from '@/lib/authorization/policies';
import type { IUser, ICourse } from '@/types';

const admin: Pick<IUser, 'id' | 'role'> = { id: 1, role: 'admin' } as const;
const instructor: Pick<IUser, 'id' | 'role'> = { id: 2, role: 'instructor' } as const;
const student: Pick<IUser, 'id' | 'role'> = { id: 3, role: 'student' } as const;
const course: ICourse = {
  id: 10,
  title: 'Test',
  description: null,
  instructor_id: instructor.id,
  price: 0,
  image_url: null,
  status: 'draft',
  created_at: new Date(),
};

describe('POLICIES', () => {
  it('allows admin to update/delete any course', () => {
    expect(POLICIES['course:update'](admin, course)).toBe(true);
    expect(POLICIES['course:delete'](admin, course)).toBe(true);
  });

  it('allows instructor to update/delete own course, not others', () => {
    expect(POLICIES['course:update'](instructor, course)).toBe(true);
    expect(POLICIES['course:delete'](instructor, course)).toBe(true);
    const otherCourse = { ...course, instructor_id: 999 };
    expect(POLICIES['course:update'](instructor, otherCourse)).toBe(false);
  });

  it('student cannot update/delete courses', () => {
    expect(POLICIES['course:update'](student, course)).toBe(false);
    expect(POLICIES['course:delete'](student, course)).toBe(false);
  });

  it('enroll policy allows only students', () => {
    expect(POLICIES['course:enroll'](student, undefined)).toBe(true);
    expect(POLICIES['course:enroll'](admin, undefined)).toBe(false);
  });
});
