import api from './api';

/**
 * Send a message to the CampusAI chatbot powered by Google Gemini.
 * Uses a longer timeout (45s) because AI calls are slower than regular API calls.
 */
const askChatbot = async (message, role = 'student', history = []) => {
  const response = await api.post(
    '/ai-chatbot/ask',
    { message, role, history },
    { timeout: 45000 } // Override default 15s timeout for AI calls
  );
  return response.data.reply;
};

const aiChatbotService = { askChatbot };
export default aiChatbotService;
