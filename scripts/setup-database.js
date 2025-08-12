const { pool } = require('../config/database');

async function setupDatabase() {
  try {
    console.log('🚀 Setting up UniConnect+ AMA database...');
    
    // Create hosts table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS hosts (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(255) NOT NULL,
        company VARCHAR(255) NOT NULL,
        avatar VARCHAR(10) DEFAULT 'H',
        bio TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Hosts table created');
    
    // Create ama_sessions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ama_sessions (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT NOT NULL,
        host_id INTEGER REFERENCES hosts(id),
        status VARCHAR(50) DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'live', 'completed', 'cancelled')),
        start_time TIMESTAMP NOT NULL,
        end_time TIMESTAMP,
        max_participants INTEGER DEFAULT 100,
        meeting_id VARCHAR(100) UNIQUE NOT NULL,
        meeting_link TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ AMA sessions table created');
    
    // Create session_registrations table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS session_registrations (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES ama_sessions(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        user_email VARCHAR(255) NOT NULL,
        user_role VARCHAR(100),
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(session_id, user_id)
      )
    `);
    console.log('✅ Session registrations table created');
    
    // Create chat_messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES ama_sessions(id) ON DELETE CASCADE,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        user_role VARCHAR(100),
        is_host_message BOOLEAN DEFAULT FALSE,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Chat messages table created');
    
    // Create indexes for better performance
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sessions_status ON ama_sessions(status)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_sessions_start_time ON ama_sessions(start_time)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_registrations_session ON session_registrations(session_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_chat_messages_session ON chat_messages(session_id)');
    await pool.query('CREATE INDEX IF NOT EXISTS idx_chat_messages_timestamp ON chat_messages(timestamp)');
    console.log('✅ Database indexes created');
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => {
      console.log('Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupDatabase };

