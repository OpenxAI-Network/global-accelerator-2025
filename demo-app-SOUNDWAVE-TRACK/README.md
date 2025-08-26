# 🎤 Voice to Notes - AI-Powered Note Taking

A comprehensive Next.js application that transforms voice recordings into intelligent, organized notes. Perfect for classes, meetings, and personal note-taking with AI-powered transcription and summarization.

## 🚀 Features

### 🎙️ Voice Recording
- **High-Quality Audio Capture**: Record clear audio with real-time feedback
- **Recording Timer**: Track recording duration with visual indicators
- **Audio Playback**: Review recordings before creating notes
- **Cross-Platform**: Works on desktop and mobile browsers

### 📝 Intelligent Note Creation
- **Auto Transcription**: Convert speech to text automatically
- **Note Categorization**: Organize notes by type (Meeting, Class, Personal, Other)
- **Custom Titles**: Add descriptive titles to your notes
- **Timestamp Tracking**: Automatic date and time stamps

### 🤖 AI-Powered Features
- **Smart Summarization**: Generate intelligent summaries of your notes
- **Enhanced Transcriptions**: AI-enhanced text formatting and grammar correction
- **Context-Aware Processing**: Understands different types of content

### 📊 Note Management
- **Note Library**: View all your notes in an organized list
- **Quick Stats**: Track total notes, duration, and categories
- **Note Details**: Full transcription and AI summary view
- **Delete Functionality**: Remove notes you no longer need

## 🛠️ Technical Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with glassmorphism effects
- **AI Integration**: Ollama with Llama2 model
- **Audio Processing**: Web Audio API and MediaRecorder
- **TypeScript**: Full type safety
- **Responsive Design**: Mobile-first approach

## 🚀 Getting Started

### Prerequisites

1. **Install Ollama**: [https://ollama.ai/](https://ollama.ai/)
2. **Pull Llama2 Model**:
   ```bash
   ollama pull llama2
   ```
3. **Start Ollama Server**:
   ```bash
   ollama serve
   ```

### Installation

1. **Navigate to the project**:
   ```bash
   cd template-app-SOUNDWAVE-TRACK/nextjs-app
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and visit `http://localhost:3000`

## 🎯 How to Use

### Recording a Note
1. **Start Recording**: Click the "Start Recording" button
2. **Speak Clearly**: Record your meeting, class, or personal notes
3. **Stop Recording**: Click "Stop Recording" when finished
4. **Review**: Play back your recording to ensure quality
5. **Create Note**: Add a title and select a category
6. **Transcribe**: Click "Create Note" to generate transcription

### Managing Notes
- **View Notes**: All notes appear in the "Your Notes" section
- **Select Note**: Click any note to view full details
- **Generate Summary**: Use AI to create intelligent summaries
- **Delete Notes**: Remove unwanted notes from your library

### Categories
- **Meeting**: Business meetings, team discussions, project updates
- **Class**: Lectures, tutorials, educational content
- **Personal**: Reminders, thoughts, personal planning
- **Other**: Miscellaneous notes and recordings

## 🔧 API Endpoints

### `/api/transcribe`
- **Method**: POST
- **Purpose**: Convert audio recordings to text
- **Body**: FormData with audio file
- **Response**: `{ transcription: string }`

### `/api/summarize`
- **Method**: POST
- **Purpose**: Generate AI-powered summaries of notes
- **Body**: `{ content: string }`
- **Response**: `{ summary: string }`

## 🎨 UI Components

### Voice Recorder
- Real-time recording with visual feedback
- Audio playback controls
- Note creation form with categorization
- Loading states and error handling

### Notes List
- Scrollable list of all notes
- Category badges and timestamps
- Preview of note content
- Selection and interaction states

### Note Details
- Full transcription display
- AI summary generation
- Note metadata (title, category, duration)
- Delete functionality

## 🎨 Customization

### Adding New Categories
1. Update the category type in the Note interface
2. Add new options to the category select dropdown
3. Update the category display logic

### Modifying AI Prompts
- **Transcription Enhancement**: Edit the prompt in `/api/transcribe/route.ts`
- **Summarization**: Modify the prompt in `/api/summarize/route.ts`
- **Content Processing**: Add new AI features as needed

### Styling
- Custom CSS classes in `globals.css`
- Tailwind utility classes for responsive design
- Glassmorphism effects and animations

## 🔮 Future Enhancements

### Planned Features
- **Real Speech-to-Text**: Integration with Whisper or similar services
- **Note Export**: PDF, Word, or text file export
- **Cloud Storage**: Save notes to cloud services
- **Collaboration**: Share notes with team members
- **Search**: Full-text search across all notes
- **Tags**: Add custom tags to notes
- **Voice Commands**: Control the app with voice

### Advanced AI Features
- **Action Items Extraction**: Automatically identify tasks and deadlines
- **Meeting Minutes**: Generate structured meeting summaries
- **Topic Clustering**: Group related notes automatically
- **Sentiment Analysis**: Analyze the tone of recordings

## 🐛 Troubleshooting

### Audio Recording Issues
- **Permission Denied**: Ensure microphone access is granted
- **No Audio**: Check system audio settings and microphone
- **Poor Quality**: Use a good microphone in a quiet environment

### AI Processing Issues
- **Ollama Connection**: Ensure Ollama is running and accessible
- **Model Loading**: Verify Llama2 model is installed
- **Processing Time**: AI responses may take several seconds

### Performance Issues
- **Large Files**: Audio files are processed in the browser
- **Memory Usage**: Long recordings may use significant memory
- **Network**: AI processing requires network connectivity

## 🎮 Use Cases

### For Students
- Record lectures and automatically transcribe them
- Create study notes from class discussions
- Capture group project meetings
- Organize research notes and ideas

### For Professionals
- Record meeting notes and action items
- Capture brainstorming sessions
- Document client calls and requirements
- Create presentation notes

### For Personal Use
- Record daily thoughts and reflections
- Capture creative ideas and inspiration
- Document important conversations
- Create voice journals

## 📄 License

This template is open source and available under the MIT License.

---

**Transform your voice into intelligent notes! 🎤✨** 