require('dotenv').config({ path: __dirname + '/.env' });
const { connectDB } = require('./config/db');
const { seedDatabase } = require('./utils/seedData');
const path = require('path');
const fs = require('fs');

const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/join-requests', require('./routes/joinRequestRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use(require('./middleware/errorHandler'));

const TEST_PORT = 5055;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}/api`;

const runFullTest = async () => {
  console.log('\n======================================================');
  console.log(' [PROJECTHUB FULL-STACK MVP INTEGRATION TEST SUITE]');
  console.log('======================================================\n');

  await connectDB();
  await seedDatabase();

  const server = app.listen(TEST_PORT, '127.0.0.1', async () => {
    try {
      console.log(`[Test Server] Listening on http://127.0.0.1:${TEST_PORT}\n`);

      let results = [];
      const pass = (name) => {
        console.log(`  ✓ PASS: ${name}`);
        results.push({ name, passed: true });
      };
      const fail = (name, msg) => {
        console.error(`  ✗ FAIL: ${name} ->`, msg);
        results.push({ name, passed: false, error: msg });
      };

      // 1. Auth: Student Login
      let studentToken = '';
      let studentUser = null;
      try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'arjun.sharma@projecthub.edu',
            password: 'Student@123'
          })
        });
        const data = await res.json();
        if (data.success && data.token) {
          studentToken = data.token;
          studentUser = data.user;
          pass('Student Login with JWT generation');
        } else {
          fail('Student Login', data.message);
        }
      } catch (e) {
        fail('Student Login', e.message);
      }

      // 2. Auth: Admin Login
      let adminToken = '';
      try {
        const res = await fetch(`${BASE_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'admin@projecthub.edu',
            password: 'Admin@123456'
          })
        });
        const data = await res.json();
        if (data.success && data.token) {
          adminToken = data.token;
          pass('Admin Login with Role Verification');
        } else {
          fail('Admin Login', data.message);
        }
      } catch (e) {
        fail('Admin Login', e.message);
      }

      // 3. Auth: Register New Student
      let newStudentToken = '';
      const testEmail = `neha.gupta.${Date.now()}@projecthub.edu`;
      try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Neha Gupta',
            email: testEmail,
            password: 'Password@123',
            department: 'Information Technology',
            year: '2nd Year',
            skills: 'Vue.js, Express, Python'
          })
        });
        const data = await res.json();
        if (data.success && data.token) {
          newStudentToken = data.token;
          pass('Student Registration and auto-token issuance');
        } else {
          fail('Student Registration', data.message);
        }
      } catch (e) {
        fail('Student Registration', e.message);
      }

      // 4. Project: Get Public Projects
      let publicProjects = [];
      try {
        const res = await fetch(`${BASE_URL}/projects`);
        const data = await res.json();
        if (data.success) {
          publicProjects = data.data;
          pass(`Fetch Public Projects (Found ${publicProjects.length} projects)`);
        } else {
          fail('Fetch Public Projects', data.message);
        }
      } catch (e) {
        fail('Fetch Public Projects', e.message);
      }

      // 5. Project: Create New Project
      let createdProject = null;
      try {
        const res = await fetch(`${BASE_URL}/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${studentToken}`
          },
          body: JSON.stringify({
            title: 'Autonomous Drone Navigation using Visual SLAM',
            description: 'Building monocular visual odometry pipeline on onboard Raspberry Pi 4.',
            category: 'IoT',
            technologies: ['ROS2', 'OpenCV', 'C++', 'Python'],
            requiredSkills: ['Robotics', 'Computer Vision'],
            maxTeamSize: 3,
            status: 'Planning',
            visibility: 'Public'
          })
        });
        const data = await res.json();
        if (data.success) {
          createdProject = data.data;
          pass(`Create Project ("${createdProject.title}")`);
        } else {
          fail('Create Project', data.message);
        }
      } catch (e) {
        fail('Create Project', e.message);
      }

      // 6. Project: Update Project
      try {
        const res = await fetch(`${BASE_URL}/projects/${createdProject._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${studentToken}`
          },
          body: JSON.stringify({ status: 'In Progress' })
        });
        const data = await res.json();
        if (data.success && data.data.status === 'In Progress') {
          pass('Update Project status to "In Progress"');
        } else {
          fail('Update Project', data.message);
        }
      } catch (e) {
        fail('Update Project', e.message);
      }

      // 7. Collaboration: Submit Join Request
      let joinRequest = null;
      try {
        const res = await fetch(`${BASE_URL}/join-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newStudentToken}`
          },
          body: JSON.stringify({
            projectId: createdProject._id,
            message: 'I have experience with ROS2 navigation packages and would love to build SLAM nodes.',
            proposedRole: 'ROS2 Developer'
          })
        });
        const data = await res.json();
        if (data.success) {
          joinRequest = data.data;
          pass('Submit Join Request to project owner');
        } else {
          fail('Submit Join Request', data.message);
        }
      } catch (e) {
        fail('Submit Join Request', e.message);
      }

      // 8. Collaboration: Prevent Duplicate Request
      try {
        const res = await fetch(`${BASE_URL}/join-requests`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newStudentToken}`
          },
          body: JSON.stringify({
            projectId: createdProject._id,
            message: 'Duplicate attempt'
          })
        });
        const data = await res.json();
        if (!data.success && res.status === 400) {
          pass('Prevent Duplicate Join Request (Blocked with 400)');
        } else {
          fail('Prevent Duplicate Join Request', 'Allowed duplicate request');
        }
      } catch (e) {
        fail('Prevent Duplicate Join Request', e.message);
      }

      // 9. Collaboration: Accept Join Request (by project owner)
      try {
        const res = await fetch(`${BASE_URL}/join-requests/${joinRequest._id}/respond`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${studentToken}`
          },
          body: JSON.stringify({ status: 'accepted', role: 'ROS2 Developer' })
        });
        const data = await res.json();
        if (data.success) {
          pass('Accept Join Request & Add Member to project team');
        } else {
          fail('Accept Join Request', data.message);
        }
      } catch (e) {
        fail('Accept Join Request', e.message);
      }

      // 10. Task: Create Task
      let createdTask = null;
      try {
        const res = await fetch(`${BASE_URL}/tasks`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${studentToken}`
          },
          body: JSON.stringify({
            title: 'Calibrate wide-angle camera intrinsic matrix',
            description: 'Run chessboard calibration tool and record distortion coefficients.',
            projectId: createdProject._id,
            priority: 'High',
            status: 'To Do'
          })
        });
        const data = await res.json();
        if (data.success) {
          createdTask = data.data;
          pass(`Create Task ("${createdTask.title}")`);
        } else {
          fail('Create Task', data.message);
        }
      } catch (e) {
        fail('Create Task', e.message);
      }

      // 11. Task: Update Status
      try {
        const res = await fetch(`${BASE_URL}/tasks/${createdTask._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${studentToken}`
          },
          body: JSON.stringify({ status: 'In Progress' })
        });
        const data = await res.json();
        if (data.success && data.data.status === 'In Progress') {
          pass('Update Task status to "In Progress"');
        } else {
          fail('Update Task status', data.message);
        }
      } catch (e) {
        fail('Update Task status', e.message);
      }

      // 12. Discussion: Post Comment
      try {
        const res = await fetch(`${BASE_URL}/comments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newStudentToken}`
          },
          body: JSON.stringify({
            projectId: createdProject._id,
            content: 'We should verify if the global shutter camera eliminates motion blur during flight.'
          })
        });
        const data = await res.json();
        if (data.success) {
          pass('Post Discussion Comment on Project');
        } else {
          fail('Post Discussion Comment', data.message);
        }
      } catch (e) {
        fail('Post Discussion Comment', e.message);
      }

      // 13. Resource: Upload Resource via multipart FormData
      let uploadedResource = null;
      try {
        const formData = new globalThis.FormData();
        formData.append('title', 'Visual SLAM Benchmark Study 2026');
        formData.append('description', 'Performance evaluation of ORB-SLAM3 vs RTAB-Map on embedded SoCs.');
        formData.append('category', 'Research Paper');
        formData.append('tags', 'SLAM, Robotics, Paper');
        const sampleBlob = new Blob(['%PDF-1.4 sample PDF binary data for integration verification'], { type: 'application/pdf' });
        formData.append('file', sampleBlob, 'visual_slam_study.pdf');

        const res = await fetch(`${BASE_URL}/resources`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${studentToken}`
          },
          body: formData
        });
        const data = await res.json();
        if (data.success) {
          uploadedResource = data.data;
          pass(`Upload File Resource (Stored: ${uploadedResource.fileName})`);
        } else {
          fail('Upload File Resource', data.message);
        }
      } catch (e) {
        fail('Upload File Resource', e.message);
      }

      // 14. Resource: Download Resource
      try {
        const res = await fetch(`${BASE_URL}/resources/${uploadedResource._id}/download`);
        if (res.status === 200) {
          pass('Download Resource and serve binary stream');
        } else {
          fail('Download Resource', `Status: ${res.status}`);
        }
      } catch (e) {
        fail('Download Resource', e.message);
      }

      // 15. Dashboard: Fetch Student Stats
      try {
        const res = await fetch(`${BASE_URL}/projects/dashboard-stats`, {
          headers: { Authorization: `Bearer ${studentToken}` }
        });
        const data = await res.json();
        if (data.success) {
          pass(`Fetch Student Dashboard Stats (Created: ${data.data.totalProjectsCreated}, Tasks: ${data.data.assignedTasksCount})`);
        } else {
          fail('Fetch Student Dashboard Stats', data.message);
        }
      } catch (e) {
        fail('Fetch Student Dashboard Stats', e.message);
      }

      // 16. Admin: Platform Stats & Protected Access
      try {
        const res = await fetch(`${BASE_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${adminToken}` }
        });
        const data = await res.json();
        if (data.success) {
          pass(`Admin Access Platform Stats (Total Users: ${data.data.totalUsers}, Total Projects: ${data.data.totalProjects})`);
        } else {
          fail('Admin Platform Stats', data.message);
        }
      } catch (e) {
        fail('Admin Platform Stats', e.message);
      }

      // 17. Security: Block Ordinary Student from Admin Route
      try {
        const res = await fetch(`${BASE_URL}/admin/stats`, {
          headers: { Authorization: `Bearer ${studentToken}` }
        });
        if (res.status === 403) {
          pass('RBAC Security: Student blocked from Admin API (403 Forbidden)');
        } else {
          fail('RBAC Security', `Expected 403 but got ${res.status}`);
        }
      } catch (e) {
        fail('RBAC Security', e.message);
      }

      console.log('\n======================================================');
      const passedCount = results.filter(r => r.passed).length;
      console.log(` RESULTS: ${passedCount} / ${results.length} Tests Passed`);
      console.log('======================================================\n');

      server.close();
      process.exit(passedCount === results.length ? 0 : 1);
    } catch (testErr) {
      console.error('Fatal test runner error:', testErr);
      server.close();
      process.exit(1);
    }
  });
};

runFullTest();
