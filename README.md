# 🏛️ Anubhash AI: Premium Universal Indian Language Translator & Dictionary

**Anubhash AI (अनुभाष)** is a state-of-the-art, heritage-minimalist web application that bridges 24 classical and regional Indian languages with modern neural artificial intelligence. Designed with a luxury Rajput aesthetic—featuring Saffron Brown (`#a65b26`) and Royal Gold (`#cba153`) highlights—it delivers a breathtaking, highly responsive user interface with advanced linguistic utilities.

---

## 🌟 Key Features

### 1. 📖 Bilingual AI Dictionary
- **Oxford API Side-by-Side Integration**: Displays precise definitions, grammatical parts of speech, phonetics, audio pronunciations, synonyms, and contextual examples simultaneously in both English and Hindi.
- **Transliteration Engine (Romanized Hindi Search)**: Powered by Google Input Tools API. Type Hindi words phonetically in Latin script (e.g., `ghosla`, `pyaar`, `dosti`, `hawa`) to automatically transliterate to Devanagari script (`घोंसला`, `प्यार`, `दोस्ती`, `हवा`) and fetch their definitions.
- **Article Cleansing**: Advanced text parser strips leading English articles (e.g., `the sky` $\rightarrow$ `sky`) to guarantee a 100% dictionary API lookup resolution rate.
- **Multi-Language Expansion**: Translate English/Hindi definitions instantly into 8 other regional Indian languages (Tamil, Telugu, Sanskrit, Bengali, Marathi, Gujarati, Malayalam, Kannada, Urdu).

### 2. 🎤 Unified Conversational Voice Lounge
- **Speech-to-Text & Text-to-Speech**: Speak freely and listen to high-fidelity audio readouts in native accents.
- **Concurrency Protection**: Implements a unified microphone state lock controller (`activeMicMode`), preventing browser SpeechRecognition overlaps and locking issues on iOS and Android viewports.

### 3. 📸 Laser OCR Camera Scanner
- **Manuscript Text Scanning**: Mock viewfinder featuring live glowing corner ornaments, a moving neon scanning laser animation, and a responsive shutter flash.
- **Auto-Extraction**: Instantly parses and translates classical manuscript text from Sanskrit or Hindi into English.

### 4. 🧭 Heritage Minimalism UX
- **Stationary Glassmorphic Header**: The main header remains perfectly fixed at the top of the viewport on both desktop and mobile screens, featuring backdrop blurs and clean content scrolling offsets.
- **Manuscript Sheet Cards**: Content is framed within custom-border parchment panels featuring traditional corner ornaments.
- **Local Cache-Buster Integration**: Standardized query parameters (e.g. `style.css?v=4.1`) prevent aggressive local browser stylesheet caching.

---

## 🛠️ Architecture & Tech Stack

Anubhash AI is built with performance-first, native vanilla technologies—eliminating modern framework bloat for maximum accessibility:
- **Core Structure**: HTML5 (semantic layout architecture)
- **Styling & Theming**: Vanilla CSS3 (curated Rajput HSL palette, CSS Custom Properties, and responsive flex/grid layouts)
- **Application Logic**: Vanilla ES6+ JavaScript
- **Iconography**: Premium IonIcons library

---

## 📂 Project Structure

```
├── index.html          # Main application structure & screen viewports
├── style.css           # Global typography, manuscript frames, fixed header, and responsive rules
├── script.js          # Core routing, Speech, Dictionary engine, and multi-stage fallbacks
├── languages.js        # Static metadata catalog for 24 Indian languages
└── README.md           # Project documentation
```

---

## 🚀 Local Development

To run Anubhash AI locally:
1. Clone this repository to your local machine.
2. Launch a lightweight local server from the root directory (e.g., using `http-server`):
   ```bash
   npx http-server ./ -p 8090 -o
   ```
3. Open `http://localhost:8090` in your web browser.

---

## 🎨 Design Systems & Palette

- **Warm Beige Background**: `#f6f3eb`
- **Soft Cream Sheets**: `#fffdf9`
- **Saffron Brown Accent**: `#a65b26`
- **Royal Gold Details**: `#cba153`
- **Typographic Scale**: *Cinzel* for luxury headers, *Tiro Devanagari Hindi* for Indic scripts, and *Poppins* for smooth, readable body text.

---

Designed & Developed by **Saransh Chaudhary**
