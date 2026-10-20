# 🌙 Dreamora — Clinical CBT-I & Sleep Wellness Platform

> **Dreamora** is an evidence-based digital sleep wellness and Cognitive Behavioral Therapy for Insomnia (CBT-I) platform. Designed with clinical rigor, it empowers users with personalized sleep restriction scheduling, stimulus control guidance, thought reframing, multilingual AI voice companion support, and detailed clinical sleep analytics.

---

## 📌 GitHub Repository Details

### **Short Repository Description (About section)**
```text
Evidence-based CBT-I sleep wellness platform with multilingual voice companion, sleep diary tracking, cognitive reframing, and clinical report exports.
```

### **Alternative Taglines**
- **Option 1 (Concise):** `Evidence-based CBT-I sleep wellness app with AI voice companion & clinical sleep diary analytics.`
- **Option 2 (Clinical focus):** `Digital therapeutics platform for insomnia featuring CBT-I protocols, sleep efficiency tracking, and multilingual bedtime guidance.`
- **Option 3 (Tech focus):** `Full-stack React & Node.js CBT-I sleep therapy app powered by Gemini AI, Web Speech API, and clinical PDF exports.`

### **Recommended GitHub Topics / Tags**
```text
cbt-i, insomnia, sleep-tracker, healthcare, digital-therapeutics, mental-health, gemini-api, voice-assistant, react, typescript, tailwindcss, web-speech-api
```

---

## ✨ Key Features

### 🛌 1. Evidence-Based CBT-I Architecture
- **Sleep Restriction & Efficiency Tracking:** Calculates Sleep Efficiency percentage (SE%) and recommends clinical sleep windows based on 7-day diary averages.
- **Stimulus Control Therapy (SCT):** 20-minute bed-association protocol and stimulus control action plans.
- **Sleep Hygiene & Circadian Optimization:** Daytime habits tracker (caffeine cutoffs, sunlight exposure, naps, and evening blue light management).

### 🎙️ 2. Dreamora Multilingual AI Voice Companion
- **Hands-Free Nighttime Dialogue:** Speech-to-text recognition and natural speech synthesis tailored for dim bedtime environments.
- **15 Supported Languages:** Full speech recognition and text-to-speech support for English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, Spanish, French, German, Mandarin Chinese, and Japanese.
- **Automatic Thought & Diary Capture:** Detects worries or sleep timings mentioned in spoken conversation and automatically logs them into the user's clinical journal.

### 📝 3. Consensus Sleep Diary (CSD) & Monitoring
- Standardized diary logging for bedtime, sleep latency, nighttime awakenings, wake time, and final get-up time.
- Automated sleep quality metrics, trends visualization, and sleep debt calculation.

### 🧠 4. Cognitive Reframing & Thought Journal
- Identification of sleep-related cognitive distortions (catastrophizing, fortune-telling, all-or-nothing thinking).
- Guided reframing exercises to de-escalate nocturnal worry and sleep anxiety.

### 🧘 5. Bedtime Relaxation Suite
- **Box & 4-7-8 Breathing Exercises:** Visual and auditory pacing designed to downregulate autonomic arousal.
- **Progressive Muscle Relaxation (PMR):** Guided tension-release audio sequence for physical somatic relaxation.
- **Sleep Storytelling & Soundscapes:** Calming ambient narratives and soothing sound profiles.

### 📄 6. Clinical PDF Export
- Generates downloadable, structured multi-week sleep summaries and sleep efficiency charts for physicians and sleep specialists using `jspdf`.

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Motion (Framer Motion)
- **Backend / API:** Node.js, Express, tsx
- **AI & Dialogue:** Google Gen AI SDK (`@google/genai`), Web Speech API (SpeechRecognition & SpeechSynthesis)
- **Reporting:** jsPDF & jsPDF-AutoTable
- **Build Tool:** Vite 6

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/dreamora.git
   cd dreamora
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=3000
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

5. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## ⚕️ Medical Disclaimer
Dreamora is a digital behavioral sleep wellness tool designed to deliver Cognitive Behavioral Therapy for Insomnia (CBT-I) principles and sleep tracking support. It does not replace medical diagnosis, medical advice, or treatment from a qualified healthcare professional. If you suspect you have sleep apnea, restless legs syndrome, narcolepsy, or other clinical sleep disorders, please consult a physician or sleep specialist.

---

## 📄 License
MIT License. See [LICENSE](LICENSE) for details.
