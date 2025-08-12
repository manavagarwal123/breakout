const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { pool } = require('../config/database');
const router = express.Router();

// GET /api/ama/live - Get current live session
router.get('/live', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*,
        h.name as host_name,
        h.role as host_role,
        h.company as host_company,
        h.avatar as host_avatar,
        COUNT(DISTINCT r.user_id) as registered_count,
        COUNT(DISTINCT cm.id) as message_count
      FROM ama_sessions s
      LEFT JOIN hosts h ON s.host_id = h.id
      LEFT JOIN session_registrations r ON s.id = r.session_id
      LEFT JOIN chat_messages cm ON s.id = cm.session_id
      WHERE s.status = 'live'
      GROUP BY s.id, h.id
      ORDER BY s.start_time DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      return res.json({
        isLive: false,
        message: 'No live sessions currently'
      });
    }
    
    const session = result.rows[0];
    
    // Use actual meeting link from database
    const meetingLink = session.meeting_link || `${process.env.MEETING_SERVICE_URL || 'https://meet.google.com'}/${session.meeting_id}`;
    
    res.json({
      isLive: true,
      session: {
        id: session.id,
        title: session.title,
        description: session.description,
        host: {
          name: session.host_name,
          role: session.host_role,
          company: session.host_company,
          avatar: session.host_avatar
        },
        startTime: session.start_time,
        meetingLink: meetingLink,
        registeredCount: parseInt(session.registered_count),
        messageCount: parseInt(session.message_count),
        status: session.status
      }
    });
  } catch (error) {
    console.error('Error fetching live session:', error);
    res.status(500).json({ error: 'Failed to fetch live session' });
  }
});

// GET /api/ama/upcoming - Get upcoming sessions
router.get('/upcoming', async (req, res) => {
  try {
    const query = `
      SELECT 
        s.*,
        h.name as host_name,
        h.role as host_role,
        h.company as host_company,
        h.avatar as host_avatar,
        COUNT(DISTINCT r.user_id) as registered_count
      FROM ama_sessions s
      LEFT JOIN hosts h ON s.host_id = h.id
      LEFT JOIN session_registrations r ON s.id = r.session_id
      WHERE s.status = 'upcoming' AND s.start_time > NOW()
      GROUP BY s.id, h.id
      ORDER BY s.start_time ASC
    `;
    
    const result = await pool.query(query);
    
    const sessions = result.rows.map(session => ({
      id: session.id,
      title: session.title,
      description: session.description,
      host: {
        name: session.host_name,
        role: session.host_role,
        company: session.host_company,
        avatar: session.host_avatar
      },
      startTime: session.start_time,
      meetingId: session.meeting_id,
      meetingLink: session.meeting_link,
      registeredCount: parseInt(session.registered_count),
      maxParticipants: session.max_participants,
      status: session.status
    }));
    
    res.json({ sessions });
  } catch (error) {
    console.error('Error fetching upcoming sessions:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming sessions' });
  }
});

// POST /api/ama/register/:sessionId - Register for a session
router.post('/register/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId, userName, userEmail } = req.body;
    
    // Check if session exists and is upcoming
    const sessionQuery = `
      SELECT * FROM ama_sessions 
      WHERE id = $1 AND status = 'upcoming'
    `;
    const sessionResult = await pool.query(sessionQuery, [sessionId]);
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found or not available for registration' });
    }
    
    const session = sessionResult.rows[0];
    
    // Check if user is already registered
    const existingRegistration = await pool.query(
      'SELECT * FROM session_registrations WHERE session_id = $1 AND user_id = $2',
      [sessionId, userId]
    );
    
    if (existingRegistration.rows.length > 0) {
      return res.status(400).json({ error: 'User already registered for this session' });
    }
    
    // Check if session is full
    const registrationCount = await pool.query(
      'SELECT COUNT(*) FROM session_registrations WHERE session_id = $1',
      [sessionId]
    );
    
    if (parseInt(registrationCount.rows[0].count) >= session.max_participants) {
      return res.status(400).json({ error: 'Session is full' });
    }
    
    // Register user
    const registrationQuery = `
      INSERT INTO session_registrations (session_id, user_id, user_name, user_email, registered_at)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    await pool.query(registrationQuery, [
      sessionId, userId, userName, userEmail, new Date()
    ]);
    
    // Use actual meeting link from database
    const meetingLink = session.meeting_link || `${process.env.MEETING_SERVICE_URL || 'https://meet.google.com'}/${session.meeting_id}`;
    
    // Send notification (in a real app, this would be a push notification or email)
    // For now, we'll return the meeting link in the response
    
    res.json({
      success: true,
      message: 'Successfully registered for session',
      session: {
        id: session.id,
        title: session.title,
        startTime: session.start_time,
        meetingLink: meetingLink
      }
    });
    
  } catch (error) {
    console.error('Error registering for session:', error);
    res.status(500).json({ error: 'Failed to register for session' });
  }
});

// GET /api/ama/highlights/:sessionId - Get AI-generated highlights
router.get('/highlights/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // In a real implementation, this would call an AI service
    // For now, return mock data based on session type
    const sessionQuery = 'SELECT title, description FROM ama_sessions WHERE id = $1';
    const sessionResult = await pool.query(sessionQuery, [sessionId]);
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = sessionResult.rows[0];
    
    // Mock AI highlights based on session content
    const highlights = generateMockHighlights(session.title, session.description);
    
    res.json({ highlights });
  } catch (error) {
    console.error('Error fetching highlights:', error);
    res.status(500).json({ error: 'Failed to fetch highlights' });
  }
});

// Helper function to generate mock highlights
function generateMockHighlights(title, description) {
  const highlights = {
    keyInsight: '',
    actionItem: '',
    resource: ''
  };
  
  // Generate insights based on keywords in title/description
  const text = (title + ' ' + description).toLowerCase();
  
  if (text.includes('pm') || text.includes('product manager')) {
    highlights.keyInsight = 'Focus on user impact metrics rather than just technical skills when applying for PM roles';
    highlights.actionItem = 'Build 2-3 case studies showing end-to-end product thinking and user research';
    highlights.resource = 'Recommended: "Inspired" by Marty Cagan for PM fundamentals';
  } else if (text.includes('google') || text.includes('interview')) {
    highlights.keyInsight = 'Google values problem-solving ability and system design thinking over memorized solutions';
    highlights.actionItem = 'Practice system design problems daily and focus on scalability and trade-offs';
    highlights.resource = 'Use "System Design Primer" and practice on platforms like LeetCode';
  } else if (text.includes('data science') || text.includes('ml')) {
    highlights.keyInsight = 'Real-world projects and research experience are more valuable than just theoretical knowledge';
    highlights.actionItem = 'Build a portfolio with 3-4 end-to-end ML projects and publish findings';
    highlights.resource = 'Focus on Kaggle competitions and open-source contributions';
  } else {
    // Default highlights
    highlights.keyInsight = 'Success in tech requires both technical skills and strong communication abilities';
    highlights.actionItem = 'Build a portfolio showcasing your best work and practice explaining complex concepts';
    highlights.resource = 'Network actively and seek mentorship from industry professionals';
  }
  
  return highlights;
}

module.exports = router;

