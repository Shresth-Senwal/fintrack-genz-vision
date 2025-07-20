# AI Financial Chatbot Setup Guide

## Overview
This FinTrack GenZ Vision app now includes an AI-powered financial advisor chatbot powered by Google's Gemini Flash 2. The chatbot provides personalized financial advice, budgeting tips, and answers to money-related questions.

## Features
- 🤖 **AI-Powered Financial Advice**: Real-time responses using Gemini Flash 2
- 💬 **Interactive Chat Interface**: Modern, animated chat UI
- ⚡ **Quick Actions**: Pre-built buttons for common financial questions
- 📊 **Personalized Advice**: Uses your financial data for tailored recommendations
- 📱 **Mobile Responsive**: Works perfectly on all devices
- 🎨 **Animated UI**: Smooth animations and transitions

## Setup Instructions

### 1. Get Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variables
1. Open the `.env` file in your project root
2. Replace `your_gemini_api_key_here` with your actual API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
3. Save the file

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Development Server
```bash
npm run dev
```

## Usage

### Accessing the Chatbot
- The chatbot appears as a floating button in the bottom-right corner
- Click the chat icon to open the interface
- The chatbot is available on all pages of the app

### Features Available
1. **Quick Actions**: Click pre-built buttons for common questions
2. **Personalized Advice**: Get advice based on your financial data
3. **Free-form Questions**: Ask any financial question in natural language
4. **Minimize/Maximize**: Collapse the chat when not needed

### Quick Action Buttons
- 💰 Budgeting Tips
- 🏦 Saving Advice  
- 🎯 Goal Setting
- 💳 Debt Management
- 📈 Investment Basics
- ✨ Personalized Advice

## API Configuration

### Safety Settings
The chatbot includes safety filters to ensure appropriate responses:
- Harassment protection
- Hate speech filtering
- Explicit content blocking
- Dangerous content prevention

### Generation Settings
- **Temperature**: 0.7 (balanced creativity)
- **Max Tokens**: 1024 (concise responses)
- **Top-K**: 40
- **Top-P**: 0.95

## File Structure
```
src/
├── services/
│   └── aiService.ts          # Gemini API integration
├── components/
│   └── chatbot/
│       └── FinancialChatbot.tsx  # Chat UI component
└── pages/
    └── Index.tsx             # Main app with chatbot integration
```

## Environment Variables
```env
VITE_GEMINI_API_KEY=your_api_key_here
```

## Error Handling
- API key validation on startup
- Network error handling
- Graceful fallback messages
- Console warnings for missing configuration

## Security Notes
- ✅ API key is stored in `.env` file (not committed to git)
- ✅ `.env` is included in `.gitignore`
- ✅ Environment variables are prefixed with `VITE_` for client-side access
- ✅ API calls include safety filters

## Troubleshooting

### Common Issues

1. **"Gemini API key not configured"**
   - Check that your `.env` file exists
   - Verify the API key is correct
   - Restart the development server

2. **"API request failed"**
   - Check your internet connection
   - Verify the API key is valid
   - Check Google AI Studio for API quotas

3. **Chatbot not appearing**
   - Ensure the component is imported in Index.tsx
   - Check browser console for errors
   - Verify all dependencies are installed

### API Limits
- Gemini Flash 2 has rate limits
- Monitor usage in Google AI Studio
- Consider implementing caching for repeated questions

## Customization

### Modifying the AI Context
Edit the `buildContext` method in `aiService.ts` to change the AI's personality and expertise.

### Adding Quick Actions
Modify the `quickActions` array in `FinancialChatbot.tsx` to add new pre-built questions.

### Styling Changes
The chatbot uses Tailwind CSS classes and can be customized in the component file.

## Support
For issues with:
- **Gemini API**: Check [Google AI Studio Documentation](https://ai.google.dev/docs)
- **App Integration**: Check the browser console for errors
- **Styling**: Modify the component CSS classes

## Future Enhancements
- [ ] Message history persistence
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Advanced financial analysis
- [ ] Integration with external financial APIs 