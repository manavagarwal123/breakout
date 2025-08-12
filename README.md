# UniConnect+ AMA Sessions - Full-Stack System

A comprehensive full-stack system for managing AMA (Ask Me Anything) sessions with real-time chat functionality, built for the UniConnect+ university networking platform.

## 🚀 Features

### Frontend
- **Live AMA Sessions**: Real-time display of currently live sessions
- **Upcoming Sessions**: Browse and register for future AMA sessions
- **Real-time Chat**: Live chat during AMA sessions with Socket.IO
- **Session Registration**: Easy registration for upcoming sessions
- **AI Highlights**: Dynamic session highlights and insights
- **Responsive Design**: Modern UI built with Tailwind CSS

### Backend
- **Express.js Server**: RESTful API endpoints for session management
- **Socket.IO Integration**: Real-time bidirectional communication
- **PostgreSQL Database**: Persistent storage for sessions, users, and chat
- **Session Management**: Complete CRUD operations for AMA sessions
- **User Authentication**: Session-based user management

### Real-time Features
- **Live Chat**: Real-time messaging during sessions
- **Typing Indicators**: See when users are typing
- **User Presence**: Track who's online in each session
- **Instant Updates**: Real-time session status updates

## 🛠️ Tech Stack

- **Frontend**: HTML5, CSS3 (Tailwind CSS), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Real-time**: Socket.IO
- **Database**: PostgreSQL
- **Styling**: Tailwind CSS, Font Awesome
- **Build Tools**: NPM scripts

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- NPM or Yarn package manager

## 🚀 Installation & Setup

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
npm install

# Or using Yarn
yarn install
```

### 2. Database Setup

#### Option A: Using Docker (Recommended)
```bash
# Start PostgreSQL container
docker run --name uniconnect-postgres \
  -e POSTGRES_DB=uniconnect_ama \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:13
```

#### Option B: Local PostgreSQL Installation
1. Install PostgreSQL on your system
2. Create a database named `uniconnect_ama`
3. Create a user with appropriate permissions

### 3. Environment Configuration

Copy the configuration file and update with your database credentials:

```bash
cp config.env.example config.env
```

Update `config.env` with your database settings:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=uniconnect_ama
DB_USER=postgres
DB_PASSWORD=postgres

# JWT Secret (for future authentication)
JWT_SECRET=your-super-secret-jwt-key-here

# Meeting Service Configuration
MEETING_SERVICE_URL=https://meet.google.com
MEETING_SERVICE_API_KEY=your-meeting-service-api-key
```

### 4. Database Initialization

```bash
# Setup database tables
npm run db:setup

# Seed with sample data
npm run db:seed
```

### 5. Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 📚 API Endpoints

### AMA Sessions

- `GET /api/ama/live` - Get current live session
- `GET /api/ama/upcoming` - Get list of upcoming sessions
- `POST /api/ama/register/:sessionId` - Register for a session
- `GET /api/ama/highlights/:sessionId` - Get AI-generated highlights

### Chat

- `GET /api/chat/messages/:sessionId` - Get chat history
- `GET /api/chat/session/:sessionId` - Get session info
- `GET /api/chat/participants/:sessionId` - Get session participants

### Socket.IO Events

- `join-session` - Join a session room
- `send-message` - Send a chat message
- `typing` - Typing indicator
- `user-joined` - User joined notification
- `user-left` - User left notification

## 🗄️ Database Schema

### Tables

1. **hosts** - AMA session hosts
2. **ama_sessions** - AMA session details
3. **session_registrations** - User registrations
4. **chat_messages** - Chat message history

### Key Fields

- **meeting_id**: Unique identifier for meeting links
- **status**: Session status (upcoming, live, completed, cancelled)
- **max_participants**: Maximum allowed participants
- **is_host_message**: Flag for host messages in chat

## 🎯 Usage Examples

### Starting a Live Session

1. Update session status in database:
```sql
UPDATE ama_sessions 
SET status = 'live' 
WHERE id = 1;
```

2. Frontend automatically detects live session and shows chat interface

### Registering for a Session

```javascript
// Frontend registration
const response = await fetch('/api/ama/register/1', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: 'user@example.com',
    userName: 'John Doe',
    userEmail: 'user@example.com'
  })
});
```

### Sending Chat Messages

```javascript
// Join session
socket.emit('join-session', {
  sessionId: 1,
  userId: 'user@example.com',
  userName: 'John'
});

// Send message
socket.emit('send-message', {
  sessionId: 1,
  userId: 'user@example.com',
  userName: 'John',
  message: 'Great question!',
  userRole: 'Student'
});
```

## 🔧 Development

### Project Structure

```
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── config/
│   └── database.js        # Database configuration
├── routes/
│   ├── ama.js            # AMA session routes
│   └── chat.js           # Chat routes
├── scripts/
│   ├── setup-database.js # Database setup script
│   └── seed-data.js      # Sample data seeding
├── main.html             # Frontend application
└── config.env            # Environment configuration
```

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:setup` - Initialize database tables
- `npm run db:seed` - Seed database with sample data

### Adding New Features

1. **New API Endpoint**: Add route in appropriate route file
2. **Database Changes**: Update setup script and run `npm run db:setup`
3. **Frontend Integration**: Add JavaScript functionality to main.html
4. **Real-time Features**: Extend Socket.IO event handlers

## 🧪 Testing

### Manual Testing

1. **Start the server**: `npm run dev`
2. **Open the application**: Navigate to `http://localhost:3000`
3. **Login**: Use any email/password to access the system
4. **Navigate to AMA**: Click on "AMA Sessions" in navigation
5. **Test live session**: Check if live session appears
6. **Test registration**: Register for upcoming sessions
7. **Test chat**: Join live session and send messages

### Testing Checklist

- [ ] Live session detection and display
- [ ] Upcoming sessions loading
- [ ] Session registration functionality
- [ ] Real-time chat messaging
- [ ] Typing indicators
- [ ] User presence tracking
- [ ] AI highlights generation
- [ ] Meeting link redirection

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check PostgreSQL service is running
   - Verify database credentials in config.env
   - Ensure database exists

2. **Socket.IO Connection Failed**
   - Check server is running on correct port
   - Verify CORS settings
   - Check browser console for errors

3. **Chat Not Working**
   - Ensure user is logged in
   - Check if session is live
   - Verify Socket.IO connection status

### Debug Mode

Enable debug logging by setting environment variable:
```bash
DEBUG=* npm run dev
```

## 🔮 Future Enhancements

- **User Authentication**: JWT-based authentication system
- **File Sharing**: Support for document and media sharing
- **Recording**: Session recording and playback
- **Analytics**: Session analytics and insights
- **Mobile App**: React Native mobile application
- **AI Integration**: Real AI-powered highlights and insights
- **Notifications**: Push notifications for session updates

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the troubleshooting section

---

**Built with ❤️ for the UniConnect+ community**

