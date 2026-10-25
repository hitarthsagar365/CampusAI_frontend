import api from './api';

/**
 * Send a message to the CampusAI chatbot powered by Google Gemini.
 * @param {string} message - The user's question
 * @param {string} role    - 'student' | 'teacher' | 'admin'
 * @param {Array}  history - Previous turns: [{role: 'user'|'bot', text: string}]
 * @returns {Promise<string>} - The AI reply text
 */
const askChatbot = async (message, role = 'student', history = []) => {
  const response = await api.post('/ai-chatbot/ask', { message, role, history });
  return response.data.reply;
};

const aiChatbotService = { askChatbot };
export default aiChatbotService;
