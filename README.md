# TriviaCraft

Harness AI agents to create custom trivia experiences. A React-based web application that uses Google Gemini AI to generate personalized trivia questions.

## Features

- 🎯 **Custom Topics**: Choose from preset topics or create your own
- 🧠 **Multiple AI Models**: Select from Gemini 3 Flash, Gemini 3 Pro, or Gemini 2.5 Pro
- 📚 **Difficulty Levels**: From Elementary School to PhD/Expert level
- ✍️ **Answer Formats**: Multiple choice or text entry
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API Key:**
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Add your Google Gemini API key to `.env`:
     ```
     VITE_API_KEY=your_google_gemini_api_key_here
     ```

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

## Getting a Google Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the key and add it to your `.env` file

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Google Gemini API** - AI trivia generation

## License

MIT


