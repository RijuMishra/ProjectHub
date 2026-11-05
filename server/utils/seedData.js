const path = require('path');
const fs = require('fs');
const User = require('../models/User');
const Project = require('../models/Project');
const Resource = require('../models/Resource');
const Task = require('../models/Task');
const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const JoinRequest = require('../models/JoinRequest');

const seedSampleFiles = () => {
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create sample PDF, DOCX, ZIP, and code files if not existing
  const sampleFiles = [
    {
      name: 'mern_project_documentation_template.pdf',
      content: '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000056 00000 n \n0000000111 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
    },
    {
      name: 'cnn_lstm_hybrid_architecture_notes.pdf',
      content: '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000010 00000 n \n0000000056 00000 n \n0000000111 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF'
    },
    {
      name: 'iot_mqtt_microcontroller_firmware.zip',
      content: 'PK\x03\x04\x14\x00\x00\x00\x08\x00ProjectHubSampleFirmwareArchiveZipData'
    },
    {
      name: 'jwt_auth_express_middleware_snippet.js',
      content: '// ProjectHub Resource: Production JWT Middleware\nconst jwt = require("jsonwebtoken");\nmodule.exports = (req, res, next) => { /* verify token */ next(); };'
    }
  ];

  sampleFiles.forEach(file => {
    const filePath = path.join(uploadsDir, file.name);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, file.content);
    }
  });
};

const seedDatabase = async () => {
  try {
    console.log('[Seed] Checking database collections...');
    seedSampleFiles();

    // Check if admin exists
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@projecthub.edu';
    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log(`[Seed] Creating initial administrator account: ${adminEmail}`);
      admin = await User.create({
        name: 'System Administrator',
        email: adminEmail,
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'admin',
        department: 'Academic Computing Services',
        year: 'Faculty / Mentor',
        skills: ['System Architecture', 'Cloud Infrastructure', 'Security Auditing'],
        bio: 'Head of university academic technology infrastructure and ProjectHub lead administrator.'
      });
    }

    // Seed students if not present
    let studentArjun = await User.findOne({ email: 'arjun.sharma@projecthub.edu' });
    if (!studentArjun) {
      console.log('[Seed] Seeding sample student accounts...');
      studentArjun = await User.create({
        name: 'Arjun Sharma',
        email: 'arjun.sharma@projecthub.edu',
        password: 'Student@123',
        role: 'student',
        department: 'Computer Science & Engineering',
        year: '4th Year',
        skills: ['React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'Tailwind CSS'],
        bio: 'Final year CSE undergraduate passionate about full-stack web applications and microservice architectures.'
      });
    }

    let studentPriya = await User.findOne({ email: 'priya.patel@projecthub.edu' });
    if (!studentPriya) {
      studentPriya = await User.create({
        name: 'Priya Patel',
        email: 'priya.patel@projecthub.edu',
        password: 'Student@123',
        role: 'student',
        department: 'Artificial Intelligence & Data Science',
        year: '3rd Year',
        skills: ['Python', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'FastAPI', 'Pandas'],
        bio: 'Junior researcher working on computer vision and medical image classification algorithms.'
      });
    }

    let studentRohit = await User.findOne({ email: 'rohit.verma@projecthub.edu' });
    if (!studentRohit) {
      studentRohit = await User.create({
        name: 'Rohit Verma',
        email: 'rohit.verma@projecthub.edu',
        password: 'Student@123',
        role: 'student',
        department: 'Information Technology',
        year: '3rd Year',
        skills: ['Flutter', 'Firebase', 'C++', 'IoT', 'MQTT', 'Kotlin'],
        bio: 'Mobile dev enthusiast developing connected smart-campus applications.'
      });
    }

    // Check project count
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      console.log('[Seed] Seeding sample projects, tasks, resources and discussions...');

      // Project 1
      const project1 = await Project.create({
        title: 'CampusPulse – Real-Time University Transit & Shuttle Tracker',
        description: 'An integrated GPS telemetry and transit analytics platform for campus shuttle networks. Provides real-time bus tracking, ETA estimation based on traffic algorithms, and route schedule notifications for students and faculty.',
        category: 'App Development',
        technologies: ['Flutter', 'Node.js', 'WebSockets', 'Redis', 'PostgreSQL'],
        requiredSkills: ['Mobile App Design', 'Socket Programming', 'REST APIs'],
        maxTeamSize: 4,
        status: 'In Progress',
        visibility: 'Public',
        owner: studentRohit._id,
        members: [
          { user: studentArjun._id, role: 'Backend Lead' }
        ],
        repoUrl: 'https://github.com/projecthub/campus-pulse',
        liveDemoUrl: 'https://campuspulse.demo.edu'
      });

      // Project 2
      const project2 = await Project.create({
        title: 'MedScan AI – Automated X-Ray Pathology Diagnostics',
        description: 'A deep convolutional neural network for detecting pulmonary conditions including pneumonia and tuberculosis from chest X-ray radiographs with high diagnostic sensitivity and interpretable saliency heatmaps.',
        category: 'AI/ML',
        technologies: ['PyTorch', 'DenseNet-121', 'FastAPI', 'React', 'Docker'],
        requiredSkills: ['Deep Learning', 'PyTorch', 'Medical Imaging', 'Data Preprocessing'],
        maxTeamSize: 3,
        status: 'Planning',
        visibility: 'Public',
        owner: studentPriya._id,
        members: [],
        repoUrl: 'https://github.com/projecthub/medscan-ai'
      });

      // Project 3
      const project3 = await Project.create({
        title: 'Decentralized Academic Credential Verifier',
        description: 'A tamper-proof cryptographic ledger system for issuing, revoking, and digitally validating academic transcripts and degrees without centralized third-party certificate authority dependency.',
        category: 'Cybersecurity',
        technologies: ['Solidity', 'Ethereum', 'React', 'Ethers.js', 'IPFS'],
        requiredSkills: ['Smart Contracts', 'Web3', 'Cryptography', 'Next.js'],
        maxTeamSize: 5,
        status: 'In Progress',
        visibility: 'Public',
        owner: studentArjun._id,
        members: [
          { user: studentRohit._id, role: 'Frontend Architect' }
        ],
        repoUrl: 'https://github.com/projecthub/credential-verifier'
      });

      // Project 4
      const project4 = await Project.create({
        title: 'Smart AgriSense – IoT Precision Agriculture Node',
        description: 'Low-power ESP32 sensor clusters transmitting soil moisture, ambient humidity, and nitrogen levels over LoRaWAN to optimize automated drip irrigation in university research greenhouses.',
        category: 'IoT',
        technologies: ['ESP32', 'LoRaWAN', 'MQTT', 'InfluxDB', 'Grafana'],
        requiredSkills: ['Embedded C', 'Circuit Design', 'Microcontrollers'],
        maxTeamSize: 3,
        status: 'Completed',
        visibility: 'Public',
        owner: studentRohit._id,
        members: [
          { user: studentPriya._id, role: 'Data Analytics' }
        ]
      });

      // Tasks for Project 1
      await Task.create([
        {
          title: 'Implement GPS coordinate ingest endpoint',
          description: 'Construct Express middleware with validation to accept streaming coordinates from vehicle tracking units.',
          project: project1._id,
          assignedTo: studentArjun._id,
          priority: 'High',
          status: 'Completed',
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          createdBy: studentRohit._id
        },
        {
          title: 'Design interactive map view in Flutter',
          description: 'Incorporate OpenStreetMap tile layer with smooth animated bus markers and route polylines.',
          project: project1._id,
          assignedTo: studentRohit._id,
          priority: 'High',
          status: 'In Progress',
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          createdBy: studentRohit._id
        },
        {
          title: 'Configure automated push notification triggers for delays',
          description: 'Calculate delay thresholds and dispatch Firebase Cloud Messaging alerts.',
          project: project1._id,
          assignedTo: null,
          priority: 'Medium',
          status: 'To Do',
          deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          createdBy: studentRohit._id
        }
      ]);

      // Tasks for Project 2
      await Task.create([
        {
          title: 'Curate and augment NIH Chest X-ray dataset',
          description: 'Normalize pixel intensities, perform affine transformations, and balance target class frequencies.',
          project: project2._id,
          assignedTo: studentPriya._id,
          priority: 'High',
          status: 'In Progress',
          deadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
          createdBy: studentPriya._id
        },
        {
          title: 'Train baseline DenseNet-121 classifier',
          description: 'Benchmark AUROC scores across 14 radiological pathology targets with cross-validation.',
          project: project2._id,
          assignedTo: studentPriya._id,
          priority: 'Medium',
          status: 'To Do',
          deadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
          createdBy: studentPriya._id
        }
      ]);

      // Tasks for Project 3
      await Task.create([
        {
          title: 'Write Solidity ERC-721 Soulbound credential contract',
          description: 'Implement non-transferable token standard with institutional minter signature verification.',
          project: project3._id,
          assignedTo: studentArjun._id,
          priority: 'High',
          status: 'In Progress',
          deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          createdBy: studentArjun._id
        },
        {
          title: 'Create verification scanner UI widget',
          description: 'Build web camera QR code scanning component for one-click diploma authentication.',
          project: project3._id,
          assignedTo: studentRohit._id,
          priority: 'Medium',
          status: 'Under Review',
          deadline: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          createdBy: studentArjun._id
        }
      ]);

      // Resources
      await Resource.create([
        {
          title: 'Full Stack Development Major Project Guidelines & SRS Template',
          description: 'Official department format for software requirements specification, database schema documentation, and viva defense guidelines.',
          category: 'Project Report',
          tags: ['FSD', 'SRS Template', 'Academic Format', 'Documentation'],
          fileUrl: '/uploads/mern_project_documentation_template.pdf',
          fileName: 'mern_project_documentation_template.pdf',
          fileType: 'pdf',
          fileSize: 421000,
          uploader: admin._id,
          downloadsCount: 42
        },
        {
          title: 'CNN & LSTM Hybrid Architecture Lecture Notes',
          description: 'Comprehensive slides covering sequence modeling, spatial feature extraction, and transfer learning best practices.',
          category: 'Notes',
          tags: ['AI/ML', 'Deep Learning', 'PyTorch', 'Lecture Notes'],
          fileUrl: '/uploads/cnn_lstm_hybrid_architecture_notes.pdf',
          fileName: 'cnn_lstm_hybrid_architecture_notes.pdf',
          fileType: 'pdf',
          fileSize: 852000,
          uploader: studentPriya._id,
          downloadsCount: 19
        },
        {
          title: 'ESP32 MQTT Low-Power Firmware Library',
          description: 'Optimized C++ firmware for deep sleep cycling, TLS certificate management, and sensor reading serialization.',
          category: 'Code Repository',
          tags: ['IoT', 'Embedded C', 'ESP32', 'Microcontroller'],
          fileUrl: '/uploads/iot_mqtt_microcontroller_firmware.zip',
          fileName: 'iot_mqtt_microcontroller_firmware.zip',
          fileType: 'zip',
          fileSize: 1048000,
          uploader: studentRohit._id,
          downloadsCount: 27
        },
        {
          title: 'Express JWT Authorization Middleware & RBAC Snippet',
          description: 'Production-ready reusable Express middleware with role validation, bearer token decoding, and structured JSON error responses.',
          category: 'Code Repository',
          tags: ['Node.js', 'Express', 'JWT', 'Security'],
          fileUrl: '/uploads/jwt_auth_express_middleware_snippet.js',
          fileName: 'jwt_auth_express_middleware_snippet.js',
          fileType: 'js',
          fileSize: 12400,
          uploader: studentArjun._id,
          downloadsCount: 35
        }
      ]);

      // Comments / Discussions
      await Comment.create([
        {
          content: 'We need to make sure the vehicle ping frequency does not exceed mobile data quotas while on 4G cellular dongles.',
          project: project1._id,
          author: studentArjun._id
        },
        {
          content: 'Agreed! We can batch telemetry points every 3 seconds when the bus is in transit, and every 30 seconds when stationary at stops.',
          project: project1._id,
          author: studentRohit._id
        },
        {
          content: 'Has anyone inspected the CheXpert dataset to supplement training classes for underrepresented pathologies?',
          project: project2._id,
          author: studentPriya._id
        }
      ]);

      // Join Request sample
      await JoinRequest.create({
        project: project2._id,
        applicant: studentArjun._id,
        message: 'Hi Priya, I have experience setting up FastAPI inference microservices and can containerize the PyTorch model for deployment.',
        proposedRole: 'MLOps Engineer',
        status: 'pending'
      });

      // Sample Notifications
      await Notification.create([
        {
          recipient: studentPriya._id,
          sender: studentArjun._id,
          type: 'join_request',
          message: 'Arjun Sharma sent a collaboration request to join "MedScan AI – Automated X-Ray Pathology Diagnostics".',
          link: '/teams'
        },
        {
          recipient: studentRohit._id,
          sender: studentArjun._id,
          type: 'task_status_changed',
          message: 'Arjun Sharma moved task "Implement GPS coordinate ingest endpoint" to Completed.',
          link: `/tasks?projectId=${project1._id}`
        }
      ]);

      console.log('[Seed] Database successfully populated with realistic student projects and initial data!');
    }
  } catch (err) {
    console.error('[Seed] Error seeding database:', err.message);
  }
};

module.exports = { seedDatabase };
