require('dotenv').config({ path: './gemini.env' });

console.log('Testing Gemini API...');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Found' : '❌ Missing');

const { GoogleGenerativeAI } = require('@google/generative-ai');

try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    console.log('✅ Gemini AI initialized');
    
    // Test a simple generation
    async function testGemini() {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent("Say 'Hello World' in one word");
            const response = result.response.text();
            console.log('✅ Gemini API test successful:', response);
        } catch (error) {
            console.error('❌ Gemini API test failed:', error.message);
        }
    }
    
    testGemini();
    
} catch (error) {
    console.error('❌ Failed to initialize Gemini:', error.message);
}
