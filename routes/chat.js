const express = require('express');
const { pool } = require('../config/database');
const router = express.Router();

// GET /api/chat/messages/:sessionId - Get chat history for a session
router.get('/messages/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const query = `
      SELECT 
        cm.id,
        cm.user_id,
        cm.user_name,
        cm.message,
        cm.user_role,
        cm.timestamp,
        cm.is_host_message
      FROM chat_messages cm
      WHERE cm.session_id = $1
      ORDER BY cm.timestamp DESC
      LIMIT $2 OFFSET $3
    `;
    
    const result = await pool.query(query, [sessionId, limit, offset]);
    
    // Reverse the order to show oldest messages first
    const messages = result.rows.reverse().map(msg => ({
      id: msg.id,
      userId: msg.user_id,
      userName: msg.user_name,
      message: msg.message,
      userRole: msg.user_role,
      timestamp: msg.timestamp,
      isHostMessage: msg.is_host_message
    }));
    
    res.json({ messages });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// GET /api/chat/session/:sessionId - Get session info for chat
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const query = `
      SELECT 
        s.id,
        s.title,
        s.status,
        s.start_time,
        h.name as host_name,
        h.role as host_role,
        h.company as host_company
      FROM ama_sessions s
      LEFT JOIN hosts h ON s.host_id = h.id
      WHERE s.id = $1
    `;
    
    const result = await pool.query(query, [sessionId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const session = result.rows[0];
    
    res.json({
      id: session.id,
      title: session.title,
      status: session.status,
      startTime: session.start_time,
      host: {
        name: session.host_name,
        role: session.host_role,
        company: session.host_company
      }
    });
  } catch (error) {
    console.error('Error fetching session info:', error);
    res.status(500).json({ error: 'Failed to fetch session info' });
  }
});

// GET /api/chat/participants/:sessionId - Get participants in a session
router.get('/participants/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const query = `
      SELECT 
        r.user_id,
        r.user_name,
        r.user_email,
        r.registered_at,
        CASE 
          WHEN h.id IS NOT NULL THEN true 
          ELSE false 
        END as is_host
      FROM session_registrations r
      LEFT JOIN hosts h ON r.user_email = h.email
      WHERE r.session_id = $1
      ORDER BY r.registered_at ASC
    `;
    
    const result = await pool.query(query, [sessionId]);
    
    const participants = result.rows.map(participant => ({
      userId: participant.user_id,
      userName: participant.user_name,
      userEmail: participant.user_email,
      registeredAt: participant.registered_at,
      isHost: participant.is_host
    }));
    
    res.json({ participants });
  } catch (error) {
    console.error('Error fetching participants:', error);
    res.status(500).json({ error: 'Failed to fetch participants' });
  }
});

// POST /api/chat/typing - Update typing indicator
router.post('/typing', (req, res) => {
  // This endpoint is mainly for HTTP fallback
  // Real-time typing indicators are handled via Socket.IO
  res.json({ success: true });
});

module.exports = router;

