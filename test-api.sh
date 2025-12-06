#!/bin/bash

# Test script for Tahbeer API endpoints
BASE_URL="http://localhost:3000/api"

echo "🧪 Testing Tahbeer API Endpoints"
echo "================================="
echo ""

# Test 1: Register a new user
echo "1️⃣  Testing User Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User",
    "role": "student"
  }')
echo "Response: $REGISTER_RESPONSE"
echo ""

# Test 2: Login
echo "2️⃣  Testing User Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')
echo "Response: $LOGIN_RESPONSE"

# Extract token
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"
echo ""

# Test 3: Get current user
echo "3️⃣  Testing Get Current User..."
curl -s -X GET "$BASE_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 4: Register instructor
echo "4️⃣  Testing Instructor Registration..."
INSTRUCTOR_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@example.com",
    "password": "password123",
    "name": "Instructor User",
    "role": "instructor"
  }')
echo "Response: $INSTRUCTOR_RESPONSE"

# Login as instructor
INSTRUCTOR_LOGIN=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "instructor@example.com",
    "password": "password123"
  }')
INSTRUCTOR_TOKEN=$(echo $INSTRUCTOR_LOGIN | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "Instructor Token: $INSTRUCTOR_TOKEN"
echo ""

# Test 5: Create a course (as instructor)
echo "5️⃣  Testing Course Creation (Instructor)..."
COURSE_RESPONSE=$(curl -s -X POST "$BASE_URL/courses" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" \
  -d '{
    "title": "Introduction to TypeScript",
    "description": "Learn TypeScript from scratch",
    "price": 99.99,
    "status": "published"
  }')
echo "Response: $COURSE_RESPONSE" | jq '.'

# Extract course ID
COURSE_ID=$(echo $COURSE_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Course ID: $COURSE_ID"
echo ""

# Test 6: Get all courses (public)
echo "6️⃣  Testing Get All Courses (Public)..."
curl -s -X GET "$BASE_URL/courses" | jq '.'
echo ""

# Test 7: Get single course
echo "7️⃣  Testing Get Single Course..."
curl -s -X GET "$BASE_URL/courses/$COURSE_ID" | jq '.'
echo ""

# Test 8: Enroll in course (as student)
echo "8️⃣  Testing Course Enrollment (Student)..."
curl -s -X POST "$BASE_URL/student/enroll/$COURSE_ID" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 9: Get enrolled courses
echo "9️⃣  Testing Get My Courses (Student)..."
curl -s -X GET "$BASE_URL/student/my-courses" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""

# Test 10: Get instructor's courses
echo "🔟 Testing Get Instructor Courses..."
curl -s -X GET "$BASE_URL/instructor/courses" \
  -H "Authorization: Bearer $INSTRUCTOR_TOKEN" | jq '.'
echo ""

echo "================================="
echo "✅ Testing Complete!"
echo ""
echo "📝 Cleanup: To remove test data, run:"
echo "   mysql -u root courses_db -e \"DELETE FROM users WHERE email LIKE '%example.com';\""
