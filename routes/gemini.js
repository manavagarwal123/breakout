const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// POST /api/generate-email - Generate professional networking email
router.post('/generate-email', async (req, res) => {
    try {
        const { goal, contact, context, userName, userUniversity, userRole } = req.body;

        // Validate required fields
        if (!goal || !contact) {
            return res.status(400).json({
                error: 'Missing required fields: goal and contact are required'
            });
        }
        
        // Validate user credentials
        if (!userName || !userUniversity) {
            return res.status(400).json({
                error: 'Missing user credentials: userName and userUniversity are required'
            });
        }

        // Construct detailed prompt for Gemini
        const prompt = `You are an expert professional networking consultant. Please draft a professional, warm, and engaging email for a student named ${userName} from ${userUniversity}.

IMPORTANT: Use the actual values provided below. DO NOT use placeholder text like [Your Name], [Your University], etc. Write the email as if it's already complete with real information.

Student Information:
- Name: ${userName}
- University: ${userUniversity}
- Role: ${userRole}

Email Details:
- Goal: ${goal}
- Contact Person: ${contact}
- Additional Context: ${context || 'No additional context provided'}

Please create an email that:
1. Has a clear, professional subject line (use actual content, not placeholders)
2. Opens with a warm, personalized greeting using ${userName}'s actual name
3. Clearly states ${userName}'s purpose and goal as a student from ${userUniversity} (use the actual university name)
4. Shows genuine interest in the contact person's work/experience
5. Makes a specific, reasonable request
6. Is concise but comprehensive (150-200 words)
7. Has a professional closing with ${userName}'s actual name and ${userUniversity} affiliation
8. Maintains a respectful and enthusiastic tone
9. Sounds authentic and personal, as if written by ${userName} themselves

CRITICAL: Write the complete email with all information filled in. Do not leave any brackets, placeholders, or incomplete sections. The email should be ready to send immediately.

Format the email with proper line breaks and structure. Make it sound natural and conversational while remaining professional. The email should reflect ${userName}'s perspective as a student from ${userUniversity}.`;

        // Generate email using Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const generatedEmail = result.response.text();

        // Return the generated email
        res.json({
            success: true,
            email: generatedEmail,
            message: 'Email generated successfully'
        });

    } catch (error) {
        console.error('Error generating email:', error);
        
        // Handle specific Gemini API errors
        if (error.message.includes('API_KEY_INVALID')) {
            return res.status(500).json({
                error: 'Invalid API key. Please check your Gemini API configuration.'
            });
        }
        
        if (error.message.includes('QUOTA_EXCEEDED')) {
            return res.status(429).json({
                error: 'API quota exceeded. Please try again later.'
            });
        }

        res.status(500).json({
            error: 'Failed to generate email. Please try again.',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

module.exports = router;
