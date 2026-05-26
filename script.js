// ==========================================
// 1. SPA ROUTER & SCREEN VIEW CONTROLLER
// ==========================================
const appScreens = document.querySelectorAll(".app-screen");
const pcSidebarLinks = document.querySelectorAll(".sidebar-nav .nav-link");

function navigateToScreen(screenId) {
    if (!screenId) return;

    // 1. Hide all screens and remove active class
    appScreens.forEach(s => s.classList.remove("active"));
    
    // 2. Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add("active");
    }
    
    // 3. Update active nav link
    pcSidebarLinks.forEach(link => {
        if (link.getAttribute("data-target") === screenId) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });

    // 4. Close mobile sidebar drawer dynamically on transition
    if (window.innerWidth <= 992) {
        closeMobileSidebar();
    }

    // 5. Scroll main container to top for seamless loading
    const mainContentEl = document.querySelector(".main-content");
    if (mainContentEl) {
        mainContentEl.scrollTop = 0;
    }
}

// Bind navigation clicks
pcSidebarLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        const target = link.getAttribute("data-target");
        if (target) {
            navigateToScreen(target);
        }
    });
});

// Set global handle for inline home grid card redirects
window.navigateToScreen = navigateToScreen;

// ==========================================
// 2. DROPDOWN POPULATIONS (PC CHANNELS)
// ==========================================
const pcInputDropdown = document.querySelector("#pc-input-language");
const pcOutputDropdown = document.querySelector("#pc-output-language");

function populateLanguagesList(dropdown, containerClass = "pc-option") {
    if (!dropdown) return;
    const menu = dropdown.querySelector("ul");
    if (!menu) return;
    menu.innerHTML = "";
    
    languages.forEach(option => {
        const li = document.createElement("li");
        li.innerHTML = option.name + " (" + option.native + ")";
        li.dataset.value = option.code;
        li.classList.add(containerClass);
        
        const selectedVal = dropdown.querySelector(".selected").dataset.value;
        if (option.code === selectedVal) {
            li.classList.add("active");
        }
        
        menu.appendChild(li);
    });

    const toggle = dropdown.querySelector(".pc-dropdown-toggle");
    toggle.addEventListener("click", (e) => {
        e.stopPropagation();
        
        // Close other dropdowns
        document.querySelectorAll(".pc-dropdown-container").forEach(c => {
            if (c !== dropdown) c.classList.remove("active");
        });
        
        dropdown.classList.toggle("active");
    });
}

// Populate PC dropdown menus
populateLanguagesList(pcInputDropdown, "pc-option");
populateLanguagesList(pcOutputDropdown, "pc-option");

// Bind Option selection listeners
function bindLanguagesOptions(dropdown, className) {
    if (!dropdown) return;
    dropdown.addEventListener("click", (e) => {
        if (e.target && e.target.classList.contains(className)) {
            dropdown.querySelectorAll("." + className).forEach(item => {
                item.classList.remove("active");
            });
            e.target.classList.add("active");
            
            const selected = dropdown.querySelector(".selected");
            selected.innerHTML = e.target.innerHTML;
            selected.dataset.value = e.target.dataset.value;
            dropdown.classList.remove("active");
            
            translateRunningText();
        }
    });
}

bindLanguagesOptions(pcInputDropdown, "pc-option");
bindLanguagesOptions(pcOutputDropdown, "pc-option");

// Close dropdowns on body/document click
document.addEventListener("click", () => {
    document.querySelectorAll(".pc-dropdown-container").forEach(c => {
        c.classList.remove("active");
    });
});

// Language Swapper button ⇄
const swapBtn = document.getElementById("pc-btn-swap");
if (swapBtn) {
    swapBtn.addEventListener("click", () => {
        const inSelect = pcInputDropdown.querySelector(".selected");
        const outSelect = pcOutputDropdown.querySelector(".selected");

        if (inSelect.dataset.value === "auto") {
            alert("Cannot swap Auto Detect language.");
            return;
        }

        const tempHTML = inSelect.innerHTML;
        const tempVal = inSelect.dataset.value;
        
        inSelect.innerHTML = outSelect.innerHTML;
        inSelect.dataset.value = outSelect.dataset.value;
        
        outSelect.innerHTML = tempHTML;
        outSelect.dataset.value = tempVal;

        // Re-populate dropdown items with active classes
        populateLanguagesList(pcInputDropdown, "pc-option");
        populateLanguagesList(pcOutputDropdown, "pc-option");

        // Swap text values
        const inText = document.getElementById("pc-input-text");
        const outText = document.getElementById("pc-output-text");
        
        const tempTextValue = inText.value;
        inText.value = outText.value;
        outText.value = tempTextValue;
        
        // Update counts
        document.getElementById("pc-input-chars").textContent = inText.value.length;
        
        translateRunningText();
    });
}

// ==========================================
// 3. PC TRANSLATION ENGINE & SYNCHRONIZER
// ==========================================
const pcInputText = document.getElementById("pc-input-text");
const pcOutputText = document.getElementById("pc-output-text");

function translateRunningText() {
    const inputTextVal = pcInputText.value.trim();
    
    if (!inputTextVal) {
        pcOutputText.value = "";
        document.getElementById("pc-output-chars").textContent = "0";
        return;
    }

    const srcCode = pcInputDropdown.querySelector(".selected").dataset.value;
    const tgtCode = pcOutputDropdown.querySelector(".selected").dataset.value;

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${srcCode}&tl=${tgtCode}&dt=t&q=${encodeURIComponent(inputTextVal)}`;

    fetch(url)
        .then(res => res.json())
        .then(json => {
            if (json && json[0]) {
                const translated = json[0].map(item => item[0]).join("");
                pcOutputText.value = translated;
                
                document.getElementById("pc-output-chars").textContent = translated.length;

                // Save to history list
                logTranslationHistory(inputTextVal, translated, srcCode, tgtCode);
            }
        })
        .catch(err => {
            console.error("Translate Engine Fetch Error:", err);
        });
}

// Bind typing listeners
pcInputText.addEventListener("input", () => {
    if (pcInputText.value.length > 5000) pcInputText.value = pcInputText.value.slice(0, 5000);
    document.getElementById("pc-input-chars").textContent = pcInputText.value.length;
    translateRunningText();
});

// ==========================================
// 4. HISTORY LOGGER SYSTEM
// ==========================================
const pcHistoryContainer = document.getElementById("pc-history-rows");
const clearHistoryBtn = document.getElementById("btn-clear-history");

let translationLogsList = [
    { source: "नमस्ते, आप कैसे हैं?", target: "Hello, how are you?", srcName: "Hindi", tgtName: "English", time: "Just now", starred: true },
    { source: "आपका नाम क्या है?", target: "What is your name?", srcName: "Hindi", tgtName: "English", time: "1 hr ago", starred: false },
    { source: "धन्यवाद!", target: "Thank you!", srcName: "Hindi", tgtName: "English", time: "2 hrs ago", starred: false }
];

function getLanguageTitle(code) {
    if (code === "auto") return "Auto";
    const f = languages.find(l => l.code === code);
    return f ? f.name : code.toUpperCase();
}

function logTranslationHistory(srcText, tgtText, srcCode, tgtCode) {
    if (translationLogsList.length > 0 && translationLogsList[0].source === srcText) {
        return;
    }

    const logEntry = {
        source: srcText,
        target: tgtText,
        srcName: getLanguageTitle(srcCode),
        tgtName: getLanguageTitle(tgtCode),
        time: "Just now",
        starred: false
    };

    translationLogsList.unshift(logEntry);
    if (translationLogsList.length > 6) translationLogsList.pop();

    renderHistoryLogs();
}

function renderHistoryLogs() {
    if (pcHistoryContainer) {
        pcHistoryContainer.innerHTML = "";
        if (translationLogsList.length === 0) {
            pcHistoryContainer.innerHTML = `<tr><td colspan="4" style="text-align:center; font-size:0.78rem; color:var(--text-muted); padding: 18px 0;">No history logged yet.</td></tr>`;
        } else {
            translationLogsList.forEach((log, index) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td class="td-icon"><ion-icon name="time-outline"></ion-icon></td>
                    <td class="source-cell">${log.source}</td>
                    <td class="target-cell">${log.target}</td>
                    <td class="action-cell">
                        <button class="bookmark-btn" onclick="event.stopPropagation(); toggleStar(${index})">
                            <ion-icon name="${log.starred ? 'star' : 'star-outline'}"></ion-icon>
                        </button>
                    </td>
                `;
                row.addEventListener("click", () => loadHistoryItem(log));
                pcHistoryContainer.appendChild(row);
            });
        }
    }
}

function loadHistoryItem(log) {
    pcInputText.value = log.source;
    document.getElementById("pc-input-chars").textContent = log.source.length;

    pcOutputText.value = log.target;
    document.getElementById("pc-output-chars").textContent = log.target.length;

    document.querySelector(".translator-row").scrollIntoView({ behavior: "smooth" });
    translateRunningText();
}

window.toggleStar = function(index) {
    if (translationLogsList[index]) {
        translationLogsList[index].starred = !translationLogsList[index].starred;
        renderHistoryLogs();
    }
};

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
        translationLogsList = [];
        renderHistoryLogs();
    });
}

// Popular Languages Flags quick-actions click
document.querySelectorAll(".languages-flex-grid .lang-capsule").forEach(capsule => {
    capsule.addEventListener("click", () => {
        document.querySelectorAll(".languages-flex-grid .lang-capsule").forEach(c => c.classList.remove("active"));
        capsule.classList.add("active");
        
        const code = capsule.dataset.code;
        const targetOption = languages.find(l => l.code === code);
        if (targetOption) {
            const outSelect = pcOutputDropdown.querySelector(".selected");
            outSelect.innerHTML = targetOption.name + " (" + targetOption.native + ")";
            outSelect.dataset.value = code;
            
            populateLanguagesList(pcOutputDropdown, "pc-option");
            translateRunningText();
        }
    });
});

// Render initial history mock entries
renderHistoryLogs();

// ==========================================
// 5. SPEECH RECOGNITION (STT ENGINE - UNIFIED & ROBUST)
// ==========================================
const languageLocales = {
    'hi': 'hi-IN', 'en': 'en-IN', 'ur': 'ur-IN', 'as': 'as-IN', 'bn': 'bn-IN', 
    'gu': 'gu-IN', 'kn': 'kn-IN', 'ml': 'ml-IN', 'mr': 'mr-IN', 'ne': 'ne-NP', 
    'or': 'or-IN', 'pa': 'pa-IN', 'sa': 'sa-IN', 'sd': 'sd-IN', 'ta': 'ta-IN', 
    'te': 'te-IN', 'dog': 'doi-IN', 'ks': 'ks-IN', 'mai': 'mai-IN', 
    'mni': 'mni-IN', 'sat': 'sat-IN', 'brx': 'brx-IN'
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const pcMicBtn = document.getElementById("pc-mic-btn");
const voiceChatMicBtn = document.getElementById("voice-chat-mic-btn");
const voiceStatusText = document.getElementById("voice-status");
const voiceTranscriptLog = document.getElementById("voice-chat-transcript");
const voiceInputDropdown = document.querySelector("#voice-input-language");
const voiceOutputDropdown = document.querySelector("#voice-output-language");

let voiceRecognitionObj = null;
let activeMicMode = null; // null, "pc", or "voice-chat"

function updateMicUI() {
    if (pcMicBtn) {
        pcMicBtn.classList.remove("recording");
        pcMicBtn.style.color = "";
        pcMicBtn.style.boxShadow = "";
    }
    if (voiceChatMicBtn) {
        voiceChatMicBtn.classList.remove("recording");
        if (voiceStatusText) voiceStatusText.textContent = "Tap microphone to speak";
    }
}

function stopAllVoiceRecordings() {
    if (voiceRecognitionObj) {
        try {
            voiceRecognitionObj.stop();
        } catch (err) {}
    }
    activeMicMode = null;
    updateMicUI();
}

function startSpeechRecord(mode) {
    if (!SpeechRecognition) return;

    // voiceInputDropdown/voiceOutputDropdown are declared at module scope above
    let srcLang = "en";
    if (mode === "pc") {
        srcLang = pcInputDropdown.querySelector(".selected").dataset.value;
        if (srcLang === "auto") {
            alert("Please select a specific language (not Auto Detect) to record voice.");
            return;
        }
    } else if (mode === "voice-chat") {
        srcLang = voiceInputDropdown.querySelector(".selected").dataset.value;
    }

    const locale = languageLocales[srcLang] || srcLang;
    
    try {
        voiceRecognitionObj.stop();
    } catch(e) {}

    voiceRecognitionObj.lang = locale;
    activeMicMode = mode;

    try {
        voiceRecognitionObj.start();
    } catch (err) {
        console.error("Failed to start voice stream:", err);
        activeMicMode = null;
        updateMicUI();
    }
}

function toggleSpeechRecognition(mode) {
    if (!SpeechRecognition) {
        alert("Speech Recognition API is not supported in this browser.");
        return;
    }

    if (activeMicMode && activeMicMode !== mode) {
        stopAllVoiceRecordings();
    }

    if (activeMicMode === mode) {
        stopAllVoiceRecordings();
    } else {
        startSpeechRecord(mode);
    }
}

if (SpeechRecognition) {
    voiceRecognitionObj = new SpeechRecognition();
    voiceRecognitionObj.continuous = true;
    voiceRecognitionObj.interimResults = true;

    voiceRecognitionObj.onstart = () => {
        updateMicUI();
        if (activeMicMode === "pc" && pcMicBtn) {
            pcMicBtn.classList.add("recording");
            pcMicBtn.style.color = "var(--accent-red)";
            pcMicBtn.style.boxShadow = "0 0 15px rgba(217, 56, 56, 0.4)";
        } else if (activeMicMode === "voice-chat" && voiceChatMicBtn) {
            voiceChatMicBtn.classList.add("recording");
            if (voiceStatusText) voiceStatusText.textContent = "Listening... Speak now";
        }
    };

    voiceRecognitionObj.onend = () => {
        activeMicMode = null;
        updateMicUI();
    };

    voiceRecognitionObj.onerror = (e) => {
        console.error("Speech Recognition Error:", e.error);
        stopAllVoiceRecordings();
    };

    voiceRecognitionObj.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }

        const text = finalTranscript || interimTranscript;
        if (text && event.results[event.results.length - 1].isFinal) {
            if (activeMicMode === "voice-chat") {
                handleVoiceChatInput(text);
                stopAllVoiceRecordings();
            } else if (activeMicMode === "pc") {
                pcInputText.value = text;
                document.getElementById("pc-input-chars").textContent = text.length;
                translateRunningText();
                stopAllVoiceRecordings();
            }
        }
    };
}

// Bind click on pc mic button
if (pcMicBtn) {
    pcMicBtn.addEventListener("click", () => {
        toggleSpeechRecognition("pc");
    });
}

// PC Banners click redirects
const pcBtnVoice = document.getElementById("pc-btn-voice");
if (pcBtnVoice) {
    pcBtnVoice.addEventListener("click", () => {
        navigateToScreen("screen-voice-chat");
    });
}

// ==========================================
// 6. SPEECH SYNTHESIS (TTS AUDIO SYSTEM)
// ==========================================
function speakTextOut(text, langCode) {
    if (!text) return;
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    const locale = languageLocales[langCode] || langCode;
    utterance.lang = locale;

    const voices = window.speechSynthesis.getVoices();
    const matches = voices.find(v => v.lang.toLowerCase().includes(locale.toLowerCase()));
    if (matches) utterance.voice = matches;
    
    window.speechSynthesis.speak(utterance);
}

// Bind PC Speaker buttons (guarded against missing elements)
const _btnSpeak = document.getElementById("pc-btn-speak");
if (_btnSpeak) {
    _btnSpeak.addEventListener("click", () => {
        speakTextOut(pcOutputText.value, pcOutputDropdown.querySelector(".selected").dataset.value);
    });
}

// ==========================================
// 7. QUICK CLIPBOARD UTILITIES
// ==========================================
function copyToClipboardUtility(buttonEl, textVal) {
    if (!textVal) return;
    navigator.clipboard.writeText(textVal).then(() => {
        const original = buttonEl.innerHTML;
        buttonEl.innerHTML = `<ion-icon name="checkmark-outline" style="color:var(--gold-accent);"></ion-icon>`;
        setTimeout(() => {
            buttonEl.innerHTML = original;
        }, 1600);
    }).catch(err => {
        console.error("Copy failed:", err);
    });
}

const _btnCopy = document.getElementById("pc-btn-copy");
if (_btnCopy) {
    _btnCopy.addEventListener("click", (e) => {
        copyToClipboardUtility(e.currentTarget, pcOutputText.value);
    });
}

// ==========================================
// ==========================================
// 8. VOICE CHAT CONVERSATIONAL CONTROLLER
// ==========================================
function handleVoiceChatInput(text) {
    if (!text) return;
    
    const voiceInputDropdown = document.querySelector("#voice-input-language");
    const voiceOutputDropdown = document.querySelector("#voice-output-language");
    
    const srcCode = voiceInputDropdown.querySelector(".selected").dataset.value;
    const tgtCode = voiceOutputDropdown.querySelector(".selected").dataset.value;
    
    const srcTitle = voiceInputDropdown.querySelector(".selected").textContent.split(" (")[0].trim();
    const tgtTitle = voiceOutputDropdown.querySelector(".selected").textContent.split(" (")[0].trim();

    // 1. Append Source Speech Bubble
    const srcBubble = document.createElement("div");
    srcBubble.className = "chat-bubble source-bubble";
    srcBubble.innerHTML = `
        <div class="bubble-meta">${srcTitle}</div>
        <p class="bubble-text">${text}</p>
    `;
    voiceTranscriptLog.appendChild(srcBubble);
    voiceTranscriptLog.scrollTop = voiceTranscriptLog.scrollHeight;
    
    // 2. Fetch conversational Google translation
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${srcCode}&tl=${tgtCode}&dt=t&q=${encodeURIComponent(text)}`;
    
    fetch(url)
        .then(res => res.json())
        .then(json => {
            if (json && json[0]) {
                const translated = json[0].map(item => item[0]).join("");
                
                // Append Target Speech Bubble
                const tgtBubble = document.createElement("div");
                tgtBubble.className = "chat-bubble target-bubble";
                tgtBubble.innerHTML = `
                    <div class="bubble-meta">${tgtTitle}</div>
                    <p class="bubble-text">${translated}</p>
                    <button class="bubble-speak-btn" onclick="speakTextOut('${translated.replace(/'/g, "\\'")}', '${tgtCode}')">
                        <ion-icon name="volume-high-outline"></ion-icon>
                    </button>
                `;
                voiceTranscriptLog.appendChild(tgtBubble);
                voiceTranscriptLog.scrollTop = voiceTranscriptLog.scrollHeight;
                
                // Auto vocal speak out target text
                speakTextOut(translated, tgtCode);
            }
        })
        .catch(err => {
            console.error("Voice Chat Dynamic Translation Error:", err);
        });
}

// Populate Voice Lang pickers

populateLanguagesList(voiceInputDropdown, "voice-option");
populateLanguagesList(voiceOutputDropdown, "voice-option");

bindLanguagesOptions(voiceInputDropdown, "voice-option");
bindLanguagesOptions(voiceOutputDropdown, "voice-option");

if (voiceChatMicBtn) {
    voiceChatMicBtn.addEventListener("click", () => {
        toggleSpeechRecognition("voice-chat");
    });
}

// ==========================================
// 9. EMBEDDED CAMERA VIEWPORT OCR CONTROLLER
// ==========================================
const camEmbeddedView = document.querySelector(".camera-viewfinder-embedded");
const btnCamScreenCapture = document.getElementById("btn-camera-screen-capture");

if (btnCamScreenCapture && camEmbeddedView) {
    btnCamScreenCapture.addEventListener("click", () => {
        // Trigger neon shutter flash
        const flash = document.createElement("div");
        flash.style.position = "absolute";
        flash.style.top = "0"; flash.style.left = "0";
        flash.style.width = "100%"; flash.style.height = "100%";
        flash.style.background = "#fff"; flash.style.zIndex = "100";
        flash.style.transition = "opacity 0.4s";
        camEmbeddedView.appendChild(flash);
        
        setTimeout(() => { flash.style.opacity = "0"; }, 50);
        setTimeout(() => { flash.remove(); }, 450);

        // Simulate laser scanner reading text
        const cameraLaser = camEmbeddedView.querySelector(".scanning-laser");
        if (cameraLaser) {
            cameraLaser.style.animationPlayState = "running";
        }

        const srcTextEl = document.getElementById("camera-screen-extracted-text");
        const tgtTextEl = document.getElementById("camera-screen-translated-text");
        
        if (srcTextEl && tgtTextEl) {
            srcTextEl.textContent = "Scanning manuscript...";
            tgtTextEl.textContent = "Translating text lines...";
            
            setTimeout(() => {
                const textSrc = "भारतीय संविधान भारत का सर्वोच्च विधान है।";
                const textTgt = "The Constitution of India is the supreme law of India.";
                
                srcTextEl.textContent = textSrc;
                tgtTextEl.textContent = textTgt;
            }, 2000);
        }
    });
}

// Bind Embedded Camera Speak & Copy
const btnCameraSpeak = document.getElementById("btn-camera-speak");
const btnCameraCopy = document.getElementById("btn-camera-copy");

if (btnCameraSpeak) {
    btnCameraSpeak.addEventListener("click", () => {
        const text = document.getElementById("camera-screen-translated-text").textContent;
        speakTextOut(text, "en");
    });
}

if (btnCameraCopy) {
    btnCameraCopy.addEventListener("click", (e) => {
        const text = document.getElementById("camera-screen-translated-text").textContent;
        copyToClipboardUtility(e.currentTarget, text);
    });
}

// PC Assistant Orb trigger spin animations
const assistantOrb = document.getElementById("assistant-orb-element");
if (assistantOrb) {
    assistantOrb.addEventListener("click", () => {
        assistantOrb.style.transform = "scale(1.2) rotate(720deg)";
        setTimeout(() => { assistantOrb.style.transform = ""; }, 1000);
    });
}

// ==========================================
// 10. PREMIUM REAL-TIME UI LOCALIZATION ENGINE
// ==========================================
const englishDictionary = {
    brand_devanagari: "अनुभाष",
    brand_sub: "AI Translator",
    workspace_title: "Anubhash AI Hub",
    nav_home: "Home",
    nav_translate: "Translate AI",
    nav_voice: "Voice Chat",
    nav_camera: "Camera Translate",
    nav_scan: "Scan & OCR",
    nav_history: "History",
    nav_saved: "Saved",
    nav_dictionary: "Dictionary",
    nav_contact: "Contact Developer",
    nav_languages: "Languages",
    nav_settings: "Settings",
    card_from: "From",
    card_to: "To",
    input_placeholder: "Enter your text here...",
    output_placeholder: "Translated text will appear here...",
    action_voice_title: "Voice",
    action_voice_desc: "Speak & translate",
    action_camera_title: "Camera",
    action_camera_desc: "Snap & translate",
    action_scan_title: "Scan",
    action_scan_desc: "Scan & convert",
    action_ai_title: "Translate AI",
    action_ai_desc: "Smart AI translate",
    action_listen_title: "Listen",
    action_listen_desc: "Listen translation",
    action_copy_title: "Copy",
    action_copy_desc: "Copy text",
    action_share_title: "Share",
    action_share_desc: "Share translation",
    action_save_title: "Save",
    action_save_desc: "Save translation",
    help_assistant_title: "Help Assistant AI",
    help_assistant_desc: "Get instant help with AI",
    help_assistant_btn: "Open Assistant",
    voice_chat_title: "Voice Chat",
    voice_chat_desc: "Talk freely in any language",
    voice_chat_btn: "Start Voice Chat",
    camera_translate_title: "Camera Translate",
    camera_translate_desc: "Translate using your camera",
    camera_translate_btn: "Open Camera",
    recent_translations_title: "Recent Translations",
    see_all: "See All",
    popular_languages_title: "Popular Languages",
    view_all: "View All",
    footer_title: "Supporting 24 Indian Languages"
};

const hindiDictionary = {
    brand_devanagari: "अनुभाष",
    brand_sub: "एआई अनुवादक",
    workspace_title: "अनुभाष एआई हब",
    nav_home: "मुख्य पृष्ठ",
    nav_translate: "अनुवाद एआई",
    nav_voice: "आवाज चैट",
    nav_camera: "कैमरा अनुवाद",
    nav_scan: "स्कैन और ओसीआर",
    nav_history: "इतिहास",
    nav_saved: "सहेजें",
    nav_dictionary: "शब्दकोश",
    nav_contact: "विकासक से संपर्क",
    nav_languages: "भाषाएं",
    nav_settings: "सेटिंग्स",
    card_from: "यहाँ से",
    card_to: "यहाँ तक",
    input_placeholder: "अपना पाठ यहाँ दर्ज करें...",
    output_placeholder: "अनुवादित पाठ यहाँ दिखाई देगा...",
    action_voice_title: "आवाज",
    action_voice_desc: "बोलें और अनुवाद",
    action_camera_title: "कैमरा",
    action_camera_desc: "फोटो और अनुवाद",
    action_scan_title: "स्कैन",
    action_scan_desc: "स्कैन और बदलें",
    action_ai_title: "अनुवाद एआई",
    action_ai_desc: "स्मार्ट एआई अनुवाद",
    action_listen_title: "सुनें",
    action_listen_desc: "अनुवाद सुनें",
    action_copy_title: "कॉपी",
    action_copy_desc: "पाठ कॉपी करें",
    action_share_title: "साझा करें",
    action_share_desc: "अनुवाद साझा करें",
    action_save_title: "सहेजें",
    action_save_desc: "अनुवाद सुरक्षित करें",
    help_assistant_title: "सहायता सहायक एआई",
    help_assistant_desc: "एआई से तुरंत सहायता लें",
    help_assistant_btn: "सहायक खोलें",
    voice_chat_title: "आवाज चैट",
    voice_chat_desc: "किसी भी भाषा में खुलकर बात करें",
    voice_chat_btn: "आवाज चैट शुरू करें",
    camera_translate_title: "कैमरा अनुवाद",
    camera_translate_desc: "कैमरे से अनुवाद करें",
    camera_translate_btn: "कैमरा खोलें",
    recent_translations_title: "हालिया अनुवाद",
    see_all: "सभी देखें",
    popular_languages_title: "लोकप्रिय भाषाएं",
    view_all: "सभी देखें",
    footer_title: "24 भारतीय भाषाओं का समर्थन"
};

const tamilDictionary = {
    brand_devanagari: "அனுபாஷ்",
    brand_sub: "AI மொழிபெயர்ப்பாளர்",
    workspace_title: "அனுபாஷ் AI மையம்",
    nav_home: "முகப்பு",
    nav_translate: "மொழிபெயர்ப்பு AI",
    nav_voice: "குரல் அரட்டை",
    nav_camera: "கேமரா மொழிபெயர்ப்பு",
    nav_scan: "ஸ்கேன் & OCR",
    nav_history: "வரலாறு",
    nav_saved: "சேமிக்கப்பட்டது",
    nav_dictionary: "அகராதி",
    nav_contact: "டெவலப்பரைத் தொடர்பு கொள்ளவும்",
    nav_languages: "மொழிகள்",
    nav_settings: "அமைப்புகள்",
    card_from: "இருந்து",
    card_to: "க்கு",
    input_placeholder: "உங்கள் உரையை இங்கே உள்ளிடவும்...",
    output_placeholder: "மொழிபெயர்க்கப்பட்ட உரை இங்கே தோன்றும்...",
    action_voice_title: "குரல்",
    action_voice_desc: "பேசி மொழிபெயர்க்கவும்",
    action_camera_title: "கேமரா",
    action_camera_desc: "படம் பிடித்து மொழிபெயர்க்கவும்",
    action_scan_title: "ஸ்கேன்",
    action_scan_desc: "ஸ்கேன் செய்து மாற்றவும்",
    action_ai_title: "மொழிபெயர்ப்பு AI",
    action_ai_desc: "ஸ்மார்ட் AI மொழிபெயர்ப்பு",
    action_listen_title: "கேட்க",
    action_listen_desc: "மொழிபெயர்ப்பைக் கேளுங்கள்",
    action_copy_title: "நகலெடு",
    action_copy_desc: "உரையை நகலெடு",
    action_share_title: "பகிர்",
    action_share_desc: "மொழிபெயர்ப்பைப் பகிரவும்",
    action_save_title: "சேமி",
    action_save_desc: "மொழிபெயர்ப்பைச் சேமிக்கவும்",
    help_assistant_title: "உதவி உதவியாளர் AI",
    help_assistant_desc: "AI மூலம் உடனடி உதவி பெறவும்",
    help_assistant_btn: "உதவியாளரைத் திறக்கவும்",
    voice_chat_title: "குரல் அரட்டை",
    voice_chat_desc: "எந்த மொழியிலும் சுதந்திரமாகப் பேசுங்கள்",
    voice_chat_btn: "குரல் அரட்டையைத் தொடங்கவும்",
    camera_translate_title: "கேமரா மொழிபெயர்ப்பு",
    camera_translate_desc: "உங்கள் கேமராவைப் பயன்படுத்தி மொழிபெயர்க்கவும்",
    camera_translate_btn: "கேமராவைத் திறக்கவும்",
    recent_translations_title: "சமீபத்திய மொழிபெயர்ப்புகள்",
    see_all: "அனைத்தையும் பார்",
    popular_languages_title: "பிரபலமான மொழிகள்",
    view_all: "அனைத்தையும் பார்",
    footer_title: "24 இந்திய மொழிகளை ஆதரிக்கிறது"
};

const sanskritDictionary = {
    brand_devanagari: "अनुभाषः",
    brand_sub: "एआई अनुवादकः",
    workspace_title: "अनुभाषः एआई केन्द्रम्",
    nav_home: "मुख्यपृष्ठम्",
    nav_translate: "अनुवाद एआई",
    nav_voice: "भाषणसंवादः",
    nav_camera: "चित्रकणिका अनुवादः",
    nav_scan: "स्कैन एवं OCR",
    nav_history: "इतिहासः",
    nav_saved: "सुरक्षितम्",
    nav_dictionary: "शब्दकोशः",
    nav_contact: "विकासक सम्पर्कः",
    nav_languages: "भाषाः",
    nav_settings: "नियमनम्",
    card_from: "तः",
    card_to: "प्रति",
    input_placeholder: "लेखनं अत्र लिखन्तु...",
    output_placeholder: "अनुवादितं लेखनं अत्र भविष्यति...",
    action_voice_title: "वाणी",
    action_voice_desc: "भाषणं कुरुत अनुवादं च",
    action_camera_title: "चित्रकणिका",
    action_camera_desc: "चित्रं स्वीकृत्य अनुवादं कुरु",
    action_scan_title: "स्कैन",
    action_scan_desc: "स्कैन कृत्वा परिवर्तयतु",
    action_ai_title: "अनुवाद एआई",
    action_ai_desc: "चतुर एआई अनुवादः",
    action_listen_title: "श्रुणु",
    action_listen_desc: "अनुवादं श्रुणु",
    action_copy_title: "प्रतिलिपिः",
    action_copy_desc: "लेखनस्य प्रतिलिपिं कुरु",
    action_share_title: "विभाजनम्",
    action_share_desc: "अनुवादं विभाजयतु",
    action_save_title: "सुरक्षितं कुरु",
    action_save_desc: "अनुवादं सुरक्षितं कुरु",
    help_assistant_title: "सहायक एआई",
    help_assistant_desc: "एआई द्वारा सद्यः साहाय्यं प्राप्नुवन्तु",
    help_assistant_btn: "सहायकं उद्घाटयतु",
    voice_chat_title: "भाषणसंवादः",
    voice_chat_desc: "यस्यां कस्यामपि भाषायां मुक्तं वदन्तु",
    voice_chat_btn: "संवादं आरभत",
    camera_translate_title: "चित्रकणिका अनुवादः",
    camera_translate_desc: "कणिकाद्वारा अनुवादं कुरुत",
    camera_translate_btn: "कणिकां उद्घाटयतु",
    recent_translations_title: "सद्यः अनूदितानि",
    see_all: "सर्वं पश्यन्तु",
    popular_languages_title: "प्रसिद्धाः भाषाः",
    view_all: "सर्वं पश्यन्तु",
    footer_title: "२४ भारतीयभाषाणां समर्थनम्"
};

const translationCache = {
    en: englishDictionary,
    hi: hindiDictionary,
    ta: tamilDictionary,
    sa: sanskritDictionary
};

function translateDictionaryAPI(targetLang, callback) {
    const keys = Object.keys(englishDictionary);
    const values = keys.map(k => englishDictionary[k]);
    const batchText = values.join(" ||| ");
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(batchText)}`;
    
    fetch(url)
        .then(res => res.json())
        .then(json => {
            if (json && json[0]) {
                const translatedBatch = json[0].map(item => item[0]).join("");
                const parts = translatedBatch.split(/\s*\|\|\|\s*/);
                const translatedDict = {};
                keys.forEach((key, idx) => {
                    translatedDict[key] = parts[idx] ? parts[idx].trim() : englishDictionary[key];
                });
                callback(translatedDict);
            } else {
                callback(englishDictionary);
            }
        })
        .catch(err => {
            console.error("UI Translation Live Fetch Error:", err);
            callback(englishDictionary);
        });
}

function applyLanguageTranslation(dict) {
    // 1. Translate elements with data-translate-key
    document.querySelectorAll("[data-translate-key]").forEach(el => {
        const key = el.dataset.translateKey;
        if (dict[key]) {
            const icon = el.querySelector("ion-icon");
            if (icon) {
                // If element has ion-icon, preserve it and replace only the text node
                el.childNodes.forEach(child => {
                    if (child.nodeType === Node.TEXT_NODE) {
                        child.nodeValue = " " + dict[key];
                    } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "ION-ICON") {
                        child.textContent = dict[key];
                    }
                });
            } else {
                el.textContent = dict[key];
            }
        }
    });

    // 2. Translate attributes with data-translate-placeholder
    document.querySelectorAll("[data-translate-placeholder]").forEach(el => {
        const key = el.dataset.translatePlaceholder;
        if (dict[key]) {
            el.setAttribute("placeholder", dict[key]);
        }
    });
}

function switchUILanguage(targetLang) {
    if (translationCache[targetLang]) {
        applyLanguageTranslation(translationCache[targetLang]);
        return;
    }

    const titleEl = document.querySelector(".workspace-title");
    if (titleEl) {
        titleEl.textContent = "Translating UI...";
    }

    translateDictionaryAPI(targetLang, (translatedDict) => {
        translationCache[targetLang] = translatedDict;
        applyLanguageTranslation(translatedDict);
        if (titleEl) {
            titleEl.textContent = translatedDict.workspace_title || "Anubhash AI Hub";
        }
    });
}

// Bind Global UI Language Selector Change Event
const globalUILangPicker = document.getElementById("pc-global-ui-lang");
if (globalUILangPicker) {
    globalUILangPicker.addEventListener("change", (e) => {
        switchUILanguage(e.target.value);
    });

    // Auto-trigger language selection on initial load to match dropdown state
    setTimeout(() => {
        switchUILanguage(globalUILangPicker.value);
    }, 100);
}

// ==========================================
// 11. MOBILE SIDEBAR DRAWER INTERACTION
// ==========================================
const burgerBtn = document.getElementById("pc-burger-btn");
const sidebarCloseBtn = document.getElementById("pc-sidebar-close-btn");
const sidebarEl = document.querySelector(".sidebar");
const sidebarOverlay = document.getElementById("pc-sidebar-overlay");

function openMobileSidebar() {
    if (sidebarEl) sidebarEl.classList.add("active");
    if (sidebarOverlay) sidebarOverlay.classList.add("active");
}

function closeMobileSidebar() {
    if (sidebarEl) sidebarEl.classList.remove("active");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
}

if (burgerBtn) {
    burgerBtn.addEventListener("click", openMobileSidebar);
}

if (sidebarCloseBtn) {
    sidebarCloseBtn.addEventListener("click", closeMobileSidebar);
}

if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeMobileSidebar);
}

// ==========================================
// 12. SUPPORTED LANGUAGES CATALOG VIEW
// ==========================================
const langGrid = document.getElementById("languages-catalog-list");
const langSearchInput = document.getElementById("lang-catalog-search");

const traditionalGreetings = {
    'hi': 'नमस्ते (Namaste)',
    'en': 'Hello / Welcome',
    'ur': 'تسلیمات / آدাব (Tasleemat)',
    'as': 'নমস্কাৰ (Nomoskar)',
    'bn': 'নমস্কার / আদাব (Nomoshkar)',
    'gu': 'નમસ્તે (Namaste)',
    'kn': 'ನಮಸ್ಕಾರ (Namaskara)',
    'ml': 'നമസ്കാരം (Namaskaram)',
    'mr': 'नमस्कार (Namaskar)',
    'ne': 'नमस्ते (Namaste)',
    'or': 'ନਮס୍କାର (Nomaskar)',
    'pa': 'ਸਤِ سِری اکال (Sat Sri Akal)',
    'sa': 'नमो नमः / नमस्कारः (Namaskar)',
    'sd': 'سلام / نمسڪار (Salam)',
    'ta': 'வணக்கம் (Vanakkam)',
    'te': 'నమస్కారం (Namaskaram)',
    'ks': 'سلام (Salam)',
    'mai': 'प्रणाम (Pranam)',
    'brx': 'खुलमबाय (Khulumby)',
    'sat': 'ᱡᱚᱦᱟᱨ (Johar)'
};

function renderLanguagesGrid(filterQuery = "") {
    if (!langGrid) return;
    langGrid.innerHTML = "";
    
    // Skip 'Auto' language
    const filteredLangs = languages.filter(l => {
        if (l.code === "auto") return false;
        const query = filterQuery.toLowerCase();
        return l.name.toLowerCase().includes(query) || l.native.toLowerCase().includes(query);
    });

    if (filteredLangs.length === 0) {
        langGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; font-size:0.88rem; color:var(--text-muted); padding: 30px 0;">No matching languages found.</div>`;
        return;
    }

    filteredLangs.forEach(lang => {
        const card = document.createElement("div");
        card.className = "lang-catalog-card manuscript-card";
        
        card.innerHTML = `
            <div class="corner-ornaments">
                <svg class="corner-ornament top-left" viewBox="0 0 40 40" width="12" height="12"><path d="M 0,0 L 40,0 C 20,4 8,16 4,36 L 4,4 Z M 0,0 L 0,40 C 4,20 16,8 36,4 L 4,4 Z" fill="var(--gold-accent)"/><circle cx="8" cy="8" r="2.5" fill="var(--saffron-brown)"/></svg>
                <svg class="corner-ornament top-right" viewBox="0 0 40 40" width="12" height="12"><path d="M 0,0 L 40,0 C 20,4 8,16 4,36 L 4,4 Z M 0,0 L 0,40 C 4,20 16,8 36,4 L 4,4 Z" fill="var(--gold-accent)"/><circle cx="8" cy="8" r="2.5" fill="var(--saffron-brown)"/></svg>
                <svg class="corner-ornament bottom-left" viewBox="0 0 40 40" width="12" height="12"><path d="M 0,0 L 40,0 C 20,4 8,16 4,36 L 4,4 Z M 0,0 L 0,40 C 4,20 16,8 36,4 L 4,4 Z" fill="var(--gold-accent)"/><circle cx="8" cy="8" r="2.5" fill="var(--saffron-brown)"/></svg>
                <svg class="corner-ornament bottom-right" viewBox="0 0 40 40" width="12" height="12"><path d="M 0,0 L 40,0 C 20,4 8,16 4,36 L 4,4 Z M 0,0 L 0,40 C 4,20 16,8 36,4 L 4,4 Z" fill="var(--gold-accent)"/><circle cx="8" cy="8" r="2.5" fill="var(--saffron-brown)"/></svg>
            </div>
            <div class="card-head">
                <span class="native-name">${lang.name}</span>
                <span class="lang-code">${lang.code.toUpperCase()}</span>
            </div>
            <span class="english-name">${lang.native}</span>
            <div class="greeting-footer">
                Greeting: ${traditionalGreetings[lang.code] || 'नमस्ते (Namaste)'}
            </div>
        `;
        
        card.addEventListener("click", () => {
            const outSelect = document.querySelector("#pc-output-language .selected");
            if (outSelect) {
                outSelect.innerHTML = lang.name + " (" + lang.native + ")";
                outSelect.dataset.value = lang.code;
                populateLanguagesList(document.querySelector("#pc-output-language"), "pc-option");
            }
            navigateToScreen("screen-translate");
        });
        
        langGrid.appendChild(card);
    });
}

if (langSearchInput) {
    langSearchInput.addEventListener("input", (e) => {
        renderLanguagesGrid(e.target.value);
    });
}

// Initial Catalog grid populator render
renderLanguagesGrid();

// ==========================================
// 13. BILINGUAL DICTIONARY ENGINE
// ==========================================

// ---- DOM Handles ----
const dictSearchInput = document.getElementById("dictionary-search-input");
const dictSearchBtn   = document.getElementById("btn-dict-search-submit");
const dictColEnglish  = document.getElementById("dict-col-english");
const dictColHindi    = document.getElementById("dict-col-hindi");
const dictOtherLang   = document.getElementById("dict-other-lang-selector");
const dictMultiBox    = document.getElementById("dict-multilang-result");
const dictMultiTitle  = document.getElementById("dict-multilang-title");
const dictMultiText   = document.getElementById("dict-multilang-text");

// ---- Helpers ----
const DEVANAGARI_RE = /[\u0900-\u097F]/;

function isDevanagari(text) {
    return DEVANAGARI_RE.test(text.trim());
}

// Translate any text via Google Translate (returns Promise<string>)
function gtranslate(text, srcLang, tgtLang) {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${srcLang}&tl=${tgtLang}&dt=t&q=${encodeURIComponent(text)}`;
    return fetch(url)
        .then(r => r.json())
        .then(j => j && j[0] ? j[0].map(x => x[0]).join("") : text)
        .catch(() => text);
}

// Fetch Oxford-style definitions from free dictionary API (returns Promise<Array>)
function fetchDictEntry(word) {
    return fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
        .then(r => {
            if (!r.ok) throw new Error("not_found");
            return r.json();
        });
}

// Build a loading placeholder in both columns
function setDictLoading() {
    const loadHTML = `
        <div class="dict-feedback-message">
            <ion-icon name="hourglass-outline"></ion-icon>
            <h4>Searching Dictionary...</h4>
            <p>Please wait a moment</p>
        </div>`;
    if (dictColEnglish) dictColEnglish.innerHTML = loadHTML;
    if (dictColHindi)   dictColHindi.innerHTML   = loadHTML;
    if (dictMultiBox)   dictMultiBox.classList.add("hidden");
    if (dictOtherLang)  dictOtherLang.value = "";
}

// Show error state
function setDictError(word) {
    const errHTML = `
        <div class="dict-feedback-message">
            <ion-icon name="alert-circle-outline"></ion-icon>
            <h4>Word Not Found</h4>
            <p>"${word}" could not be found. Try another word.</p>
        </div>`;
    if (dictColEnglish) dictColEnglish.innerHTML = errHTML;
    if (dictColHindi)   dictColHindi.innerHTML   = errHTML;
}

// Build individual meaning item HTML (English)
function buildMeaningItemEN(def, example) {
    return `
        <div class="meaning-item">
            <p class="definition-text">${def}</p>
            ${example ? `<p class="example-text">"${example}"</p>` : ""}
        </div>`;
}

// Build individual meaning item HTML (Hindi translated)
function buildMeaningItemHI(def, example) {
    return `
        <div class="meaning-item">
            <p class="definition-text">${def}</p>
            ${example ? `<p class="example-text">"${example}"</p>` : ""}
        </div>`;
}

// Render English column from API entry array
function renderEnglishColumn(entries, word) {
    if (!dictColEnglish) return;

    const first = entries[0];
    const phonetic = first.phonetic || (first.phonetics && first.phonetics.find(p => p.text) ? first.phonetics.find(p => p.text).text : "");
    const audioURL = first.phonetics && first.phonetics.find(p => p.audio && p.audio !== "") ? first.phonetics.find(p => p.audio && p.audio !== "").audio : null;

    let html = `
        <div class="def-word-header">
            <span class="def-word-title">${word}</span>
            <div class="phonetic-wrapper">
                ${phonetic ? `<span class="phonetic-spelling">${phonetic}</span>` : ""}
                ${audioURL ? `<button class="phonetic-listen-btn" onclick="(new Audio('${audioURL}')).play()"><ion-icon name="volume-high-outline"></ion-icon></button>` : ""}
            </div>
        </div>
        <div class="meanings-list">`;

    // Take max 4 meaning groups
    const maxGroups = Math.min(first.meanings ? first.meanings.length : 0, 4);
    for (let i = 0; i < maxGroups; i++) {
        const meaning = first.meanings[i];
        const pos     = meaning.partOfSpeech || "";
        const defs    = meaning.definitions ? meaning.definitions.slice(0, 2) : [];
        const syns    = meaning.synonyms   ? meaning.synonyms.slice(0, 5)   : [];

        html += `<div class="meaning-item"><span class="pos-badge">${pos}</span>`;
        defs.forEach(d => {
            html += buildMeaningItemEN(d.definition, d.example || "");
        });
        if (syns.length > 0) {
            html += `<div class="synonyms-container">
                <span class="synonyms-label">Synonyms</span>
                <div class="synonyms-capsules">
                    ${syns.map(s => `<span class="synonym-capsule">${s}</span>`).join("")}
                </div>
            </div>`;
        }
        html += `</div>`;
    }

    html += `</div>`;
    dictColEnglish.innerHTML = html;
}

// Render Hindi column using translated definitions
function renderHindiColumn(hindiWord, translatedMeanings) {
    if (!dictColHindi) return;

    let html = `
        <div class="def-word-header">
            <span class="def-word-title">${hindiWord}</span>
            <div class="phonetic-wrapper">
                <button class="phonetic-listen-btn" onclick="speakTextOut('${hindiWord.replace(/'/g, "\\'")}', 'hi')">
                    <ion-icon name="volume-high-outline"></ion-icon>
                </button>
            </div>
        </div>
        <div class="meanings-list">`;

    translatedMeanings.forEach(item => {
        html += `
            <div class="meaning-item">
                <span class="pos-badge">${item.pos}</span>
                <p class="definition-text">${item.def}</p>
                ${item.example ? `<p class="example-text">"${item.example}"</p>` : ""}
            </div>`;
    });

    html += `</div>`;
    dictColHindi.innerHTML = html;
}

// Collect all definitions from entry for batch translation
function collectDefsForTranslation(entries) {
    const items = [];
    const first = entries[0];
    const maxGroups = Math.min(first.meanings ? first.meanings.length : 0, 4);
    for (let i = 0; i < maxGroups; i++) {
        const meaning = first.meanings[i];
        const pos     = meaning.partOfSpeech || "";
        const defs    = meaning.definitions ? meaning.definitions.slice(0, 2) : [];
        defs.forEach(d => {
            items.push({ pos, def: d.definition, example: d.example || "" });
        });
    }
    return items;
}

// Active definitions cache for multi-lang translation
let cachedDefinitions = [];

// Clean translated words by removing leading articles (the/a/an) for reliable dictionary API lookups
function cleanWordForDict(text) {
    if (!text) return "";
    let cleaned = text.trim().toLowerCase();
    cleaned = cleaned.replace(/^(the|a|an)\s+/, "");
    return cleaned;
}

// Transliterate romanized Hindi words into Devanagari using official Google Input Tools API
async function transliterateRomanToDevanagari(word) {
    const url = `https://inputtools.google.com/request?text=${encodeURIComponent(word)}&itc=hi-t-i0-und&num=1&cp=0&cs=0&ie=utf-8&oe=utf-8&app=demopage`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        if (json && json[0] === 'SUCCESS' && json[1] && json[1][0] && json[1][0][1]) {
            return json[1][0][1][0] || word;
        }
        return word;
    } catch (e) {
        return word;
    }
}

// Main dictionary search function with intelligent romanized/Devanagari Indian language fallbacks
async function searchDictionary(rawWord) {
    if (!rawWord || !rawWord.trim()) return;
    const word = rawWord.trim();

    setDictLoading();

    try {
        let englishWord = word;
        let hindiSource = null; // tracks if the user typed Hindi (Devanagari or romanized)

        // 1. If Devanagari input — translate to English first
        if (isDevanagari(word)) {
            hindiSource = word;
            const translated = await gtranslate(word, "hi", "en");
            englishWord = cleanWordForDict(translated);
        }

        // 2. Try fetching the English dictionary entry
        let entries = null;
        try {
            entries = await fetchDictEntry(englishWord);
        } catch (e) {
            // Word not found in English dictionary
        }

        // 3. If not found AND it wasn't Devanagari — check if it is romanized Hindi
        //    e.g. "Ghosla", "Pyaar", "Dosti", "Aasman", "Sapna"
        if (!entries && !hindiSource) {
            // Try Strategy A: Google Input Tools Transliteration -> Devanagari -> English Translate -> Lookup
            const transliterated = await transliterateRomanToDevanagari(word);
            if (transliterated && isDevanagari(transliterated)) {
                const backToEnRaw = await gtranslate(transliterated, "hi", "en");
                const candA = cleanWordForDict(backToEnRaw);
                if (candA && candA !== word.toLowerCase()) {
                    try {
                        const fetched = await fetchDictEntry(candA);
                        if (fetched) {
                            entries = fetched;
                            englishWord = candA;
                            hindiSource = transliterated;
                        }
                    } catch (errA) {}
                }
            }

            // Try Strategy B: Direct Hindi -> English Translation -> Lookup
            if (!entries) {
                const backToEnRaw = await gtranslate(word, "hi", "en");
                const candB = cleanWordForDict(backToEnRaw);
                if (candB && candB !== word.toLowerCase()) {
                    try {
                        const fetched = await fetchDictEntry(candB);
                        if (fetched) {
                            entries = fetched;
                            englishWord = candB;
                            hindiSource = transliterated || word;
                        }
                    } catch (errB) {}
                }
            }

            // Try Strategy C: Auto -> English Translation -> Lookup
            if (!entries) {
                const backToEnRaw = await gtranslate(word, "auto", "en");
                const candC = cleanWordForDict(backToEnRaw);
                if (candC && candC !== word.toLowerCase()) {
                    try {
                        const fetched = await fetchDictEntry(candC);
                        if (fetched) {
                            entries = fetched;
                            englishWord = candC;
                            hindiSource = transliterated || word;
                        }
                    } catch (errC) {}
                }
            }
        }

        // 4. If still no entries, show error
        if (!entries) {
            setDictError(word);
            return;
        }

        // 5. Render English column immediately
        renderEnglishColumn(entries, englishWord);

        // 6. Collect definitions for Hindi batch translation
        const defsToTranslate = collectDefsForTranslation(entries);
        cachedDefinitions = defsToTranslate;

        // 7. Batch translate: all defs joined by ||| separator
        const batchInput = defsToTranslate.map(d => d.def + (d.example ? " ||| " + d.example : "")).join(" @@@ ");

        const batchTranslated = await gtranslate(batchInput, "en", "hi");
        const parts = batchTranslated.split(/\s*@@@\s*/);

        // 8. Get Hindi word translation
        const hindiWord = await gtranslate(englishWord, "en", "hi");

        // 9. Parse back translated meanings
        const translatedMeanings = defsToTranslate.map((item, idx) => {
            const seg  = parts[idx] || "";
            const segs = seg.split(/\s*\|\|\|\s*/);
            return {
                pos: item.pos,
                def: segs[0] ? segs[0].trim() : item.def,
                example: segs[1] ? segs[1].trim() : ""
            };
        });

        // 10. Render Hindi column
        renderHindiColumn(hindiWord, translatedMeanings);

    } catch (err) {
        console.error("Dictionary Search Error:", err);
        setDictError(word);
    }
}

// Multi-language dropdown handler
if (dictOtherLang) {
    dictOtherLang.addEventListener("change", async () => {
        const tgtCode = dictOtherLang.value;
        if (!tgtCode || cachedDefinitions.length === 0) return;

        const langName = dictOtherLang.options[dictOtherLang.selectedIndex].text;

        if (dictMultiBox)  dictMultiBox.classList.remove("hidden");
        if (dictMultiTitle) dictMultiTitle.textContent = `${langName} — Meanings:`;
        if (dictMultiText)  dictMultiText.textContent = "Translating...";

        try {
            const batch = cachedDefinitions.map(d => d.def).join(" ||| ");
            const translated = await gtranslate(batch, "en", tgtCode);
            const parts = translated.split(/\s*\|\|\|\s*/);
            const formatted = cachedDefinitions.map((item, i) => {
                return `${item.pos ? "[" + item.pos + "] " : ""}${parts[i] || item.def}`;
            }).join("\n\n");

            if (dictMultiText) dictMultiText.textContent = formatted;
        } catch (e) {
            if (dictMultiText) dictMultiText.textContent = "Translation failed. Please try again.";
        }
    });
}

// Search button & Enter key bindings
if (dictSearchBtn) {
    dictSearchBtn.addEventListener("click", () => {
        if (dictSearchInput) searchDictionary(dictSearchInput.value);
    });
}

if (dictSearchInput) {
    dictSearchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") searchDictionary(dictSearchInput.value);
    });
}

// Auto-load premium showcase word on dictionary screen open
(function initDictionary() {
    const welcomeEN = `
        <div class="dict-feedback-message">
            <ion-icon name="book-outline"></ion-icon>
            <h4>Anubhash AI Dictionary</h4>
            <p>Type any word in English or Hindi above and press Enter to see meanings side-by-side.</p>
        </div>`;
    if (dictColEnglish) dictColEnglish.innerHTML = welcomeEN;
    if (dictColHindi)   dictColHindi.innerHTML   = welcomeEN;
})();

// Global expose for inline onclick calls
window.speakTextOut = speakTextOut;
