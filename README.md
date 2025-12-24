# TriviaCraft

Harness AI agents to create custom trivia experiences. A React-based web application that uses AI (Gemini, Claude, or ChatGPT) to generate personalized trivia questions.

## Features

- 🎯 **Custom Topics**: Choose from preset topics or create your own
- 🧠 **Multiple AI Providers**: Support for Google Gemini, Anthropic Claude, and OpenAI ChatGPT
- 🤖 **9 AI Models**: Choose from various models across all three providers
- 📚 **Difficulty Levels**: From Elementary School to PhD/Expert level
- ✍️ **Answer Formats**: Multiple choice or text entry
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Keys:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Add your API keys to `.env` (you only need the keys for the providers you want to use):
     ```
     VITE_GEMINI_API_KEY=your_google_gemini_api_key_here
     VITE_CLAUDE_API_KEY=your_anthropic_claude_api_key_here
     VITE_CHATGPT_API_KEY=your_openai_chatgpt_api_key_here
     ```
   - You can configure one, two, or all three providers. Only models with configured API keys will be available in the app.

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - The app will be available at `http://localhost:5173` (or the port shown in the terminal)

## Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory. You can preview the production build with:

```bash
npm run preview
```

## Getting API Keys

### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it as `VITE_GEMINI_API_KEY` in your `.env` file

### Anthropic Claude API Key
1. Go to [Anthropic Console](https://console.anthropic.com/)
2. Sign in or create an account
3. Navigate to API Keys section
4. Create a new API key
5. Copy the key and add it as `VITE_CLAUDE_API_KEY` in your `.env` file

### OpenAI ChatGPT API Key
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy the key and add it as `VITE_CHATGPT_API_KEY` in your `.env` file

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Google Gemini API** - AI trivia generation (optional)
- **Anthropic Claude API** - AI trivia generation (optional)
- **OpenAI ChatGPT API** - AI trivia generation (optional)

## License

MIT


