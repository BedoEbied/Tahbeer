#!/bin/bash

# Simple API test for Tahbeer
BASE="http://localhost:3000/api"

echo "=== Testing Tahbeer API ==="
echo ""

# 1. Register Student
echo "1. Register Student..."
STUDENT=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"student@test.com","password":"pass123","name":"Student User"}')
STUDENT_TOKEN=$(echo $STUDENT | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "✅ Student registered | Token: ${STUDENT_TOKEN:0:20}..."
echo ""

# 2. Register Instructor
echo "2. Register Instructor..."
INSTRUCTOR=$(curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"email":"instructor@test.com","password":"pass123","name":"Instructor User","role":"instructor"}')
INSTRUCTOR_TOKEN=$(echo $INSTRUCTOR | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "✅ Instructor registered | Token: ${INSTRUCTOR_TOKEN:0:20}..."
echo ""

# 3. Get current user (Student)
echo "3. Get Current User (Student)..."
curl -s -X GET "$BASE/auth/me" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | python3 -m json.tool
echo ""

# 4. Create Course (Instructor)
echo "4. Create Course..."
COURSE=$(curl -s -X POST "$BASE/courses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
  -d '{"title":"Next.js Full Stack","description":"Build modern web apps","price":149.99,"status":"published"}')
COURSE_ID=$(echo $COURSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "✅ Course created | ID: $COURSE_ID"
echo ""

# 5. Get All Courses
echo "5. Get All Courses..."
curl -s -X GET "$BASE/courses" | python3 -m json.tool
echo ""

# 6. Get Single Course
echo "6. Get Course by ID..."
curl -s -X GET "$BASE/courses/$COURSE_ID" | python3 -m json.tool
echo ""

# 7. Enroll Student
echo "7. Enroll Student in Course..."
curl -s -X POST "$BASE/student/enroll/$COURSE_ID" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | python3 -m json.tool
echo ""

# 8. Get Student's Enrolled Courses
echo "8. Get Student's Courses..."
curl -s -X GET "$BASE/student/my-courses" \
  -H "Authorization: Bearer $STUDENT_TOKEN" | python3 -m json.tool
echo ""

# 9. Get Instructor's Courses
echo "9. Get Instructor's Courses..."
curl -s -X GET "$BASE/instructor/courses" \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" | python3 -m json.tool
echo ""

# 10. Update Course
echo "10. Update Course..."
curl -s -X PUT "$BASE/courses/$COURSE_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
  -d '{"title":"Next.js Full Stack - Updated","price":199.99}' | python3 -m json.tool
echo ""

echo "=== All Tests Complete! ==="
echo ""
echo "Cleanup: mysql -u root courses_db -e \"DELETE FROM users WHERE email LIKE '%test.com';\""
