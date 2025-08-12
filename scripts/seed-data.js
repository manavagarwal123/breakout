const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

async function seedData() {
  try {
    console.log('🌱 Seeding UniConnect+ AMA database with sample data...');
    
    // Insert sample hosts
    const hostsData = [
      {
        name: 'Priyanka Sharma',
        email: 'priyanka.sharma@meta.com',
        role: 'Product Manager',
        company: 'Meta',
        avatar: 'P',
        bio: 'Experienced PM with 8+ years in tech, specializing in social media and AI products.'
      },
      {
        name: 'Arjun Patel',
        email: 'arjun.patel@google.com',
        role: 'Software Engineer',
        company: 'Google',
        avatar: 'A',
        bio: 'Google SDE with expertise in system design and algorithms. CU Alumni 2019.'
      },
      {
        name: 'Sneha Patel',
        email: 'sneha.patel@microsoft.com',
        role: 'Data Scientist',
        company: 'Microsoft',
        avatar: 'S',
        bio: 'ML/AI specialist with publications in top-tier conferences. Helps students with research projects.'
      },
      {
        name: 'Rohit Gupta',
        email: 'rohit.gupta@google.com',
        role: 'Software Engineer',
        company: 'Google',
        avatar: 'R',
        bio: 'Google SDE with expertise in search infrastructure. Regularly conducts mock interviews.'
      }
    ];
    
    console.log('📝 Inserting hosts...');
    for (const host of hostsData) {
      await pool.query(`
        INSERT INTO hosts (name, email, role, company, avatar, bio)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (email) DO NOTHING
      `, [host.name, host.email, host.role, host.company, host.avatar, host.bio]);
    }
    console.log('✅ Hosts inserted');
    
    // Get host IDs for reference
    const hostIds = await pool.query('SELECT id, email FROM hosts');
    const hostMap = {};
    hostIds.rows.forEach(host => {
      hostMap[host.email] = host.id;
    });
    
    // Insert sample AMA sessions
    const sessionsData = [
      {
        title: 'How I got into Meta as a Product Manager',
        description: 'Deep dive into the PM interview process at Meta, including case studies, behavioral questions, and tips for standing out in a competitive field.',
        hostEmail: 'priyanka.sharma@meta.com',
        status: 'live',
        startTime: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        maxParticipants: 200,
        meetingId: 'meta-pm-ama-2024',
        meetingLink: 'https://meet.google.com/cnb-epqt-mjc'
      },
      {
        title: 'My Journey from CU to Google',
        description: 'Deep dive into Google\'s interview process, system design rounds, and tips for final year preparation.',
        hostEmail: 'arjun.patel@google.com',
        status: 'upcoming',
        startTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        maxParticipants: 150,
        meetingId: 'cu-to-google-2024',
        meetingLink: 'https://meet.google.com/cnb-epqt-mjc'
      },
      {
        title: 'Data Science Career Roadmap',
        description: 'From beginner to advanced: ML projects, internships, and breaking into top tech companies.',
        hostEmail: 'sneha.sharma@microsoft.com',
        status: 'upcoming',
        startTime: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        maxParticipants: 120,
        meetingId: 'ds-roadmap-2024',
        meetingLink: 'https://meet.google.com/cnb-epqt-mjc'
      }
    ];
    
    console.log('📅 Inserting AMA sessions...');
    for (const session of sessionsData) {
      const hostId = hostMap[session.hostEmail];
      if (hostId) {
        await pool.query(`
          INSERT INTO ama_sessions (title, description, host_id, status, start_time, max_participants, meeting_id, meeting_link)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (meeting_id) DO NOTHING
        `, [session.title, session.description, hostId, session.status, session.startTime, session.maxParticipants, session.meetingId, session.meetingLink]);
      }
    }
    console.log('✅ AMA sessions inserted');
    
    // Get session IDs for reference
    const sessionIds = await pool.query('SELECT id, meeting_id FROM ama_sessions');
    const sessionMap = {};
    sessionIds.rows.forEach(session => {
      sessionMap[session.meeting_id] = session.id;
    });
    
    // Insert sample registrations
    const registrationsData = [
      {
        sessionId: sessionMap['meta-pm-ama-2024'],
        userId: 'user-001',
        userName: 'Rahul Sharma',
        userEmail: 'rahul.sharma@cu.ac.in',
        userRole: 'Student'
      },
      {
        sessionId: sessionMap['meta-pm-ama-2024'],
        userId: 'user-002',
        userName: 'Sneha Kumar',
        userEmail: 'sneha.kumar@cu.ac.in',
        userRole: 'Student'
      },
      {
        sessionId: sessionMap['cu-to-google-2024'],
        userId: 'user-003',
        userName: 'Karan Singh',
        userEmail: 'karan.singh@cu.ac.in',
        userRole: 'Student'
      },
      {
        sessionId: sessionMap['cu-to-google-2024'],
        userId: 'user-004',
        userName: 'Shweta Reddy',
        userEmail: 'shweta.reddy@cu.ac.in',
        userRole: 'Student'
      }
    ];
    
    console.log('👥 Inserting session registrations...');
    for (const registration of registrationsData) {
      if (registration.sessionId) {
        await pool.query(`
          INSERT INTO session_registrations (session_id, user_id, user_name, user_email, user_role)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (session_id, user_id) DO NOTHING
        `, [registration.sessionId, registration.userId, registration.userName, registration.userEmail, registration.userRole]);
      }
    }
    console.log('✅ Session registrations inserted');
    
    // Insert sample chat messages for the live session
    const liveSessionId = sessionMap['meta-pm-ama-2024'];
    if (liveSessionId) {
      const chatMessages = [
        {
          sessionId: liveSessionId,
          userId: 'user-001',
          userName: 'Rahul',
          message: 'What skills are most important for PM roles?',
          userRole: 'Student',
          isHostMessage: false,
          timestamp: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
        },
        {
          sessionId: liveSessionId,
          userId: 'host-001',
          userName: 'Priyanka (Host)',
          message: 'Great question! Focus on data analysis, user empathy, and technical understanding.',
          userRole: 'Product Manager',
          isHostMessage: true,
          timestamp: new Date(Date.now() - 1 * 60 * 1000) // 1 minute ago
        },
        {
          sessionId: liveSessionId,
          userId: 'user-002',
          userName: 'Sneha',
          message: 'How do you prepare for PM case studies?',
          userRole: 'Student',
          isHostMessage: false,
          timestamp: new Date(Date.now() - 30 * 1000) // 30 seconds ago
        }
      ];
      
      console.log('💬 Inserting chat messages...');
      for (const message of chatMessages) {
        await pool.query(`
          INSERT INTO chat_messages (session_id, user_id, user_name, message, user_role, is_host_message, timestamp)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [message.sessionId, message.userId, message.userName, message.message, message.userRole, message.isHostMessage, message.timestamp]);
      }
      console.log('✅ Chat messages inserted');
    }
    
    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Sample data summary:');
    console.log(`   - ${hostsData.length} hosts created`);
    console.log(`   - ${sessionsData.length} AMA sessions created`);
    console.log(`   - ${registrationsData.length} registrations created`);
    console.log(`   - 3 chat messages created for live session`);
    
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = { seedData };

