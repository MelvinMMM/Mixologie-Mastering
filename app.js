/**
 * MIXOLOGY MASTER - APPLICATION JAVASCRIPT
 * Based on "Référentiel Officiel des Cocktails Classiques de Référence (2025/2026)"
 */

// Application State
const state = {
  currentView: 'home',
  activeQuiz: {
    title: '',
    moduleId: null,
    questions: [],
    currentIndex: 0,
    score: 0,
    answered: false,
    wrongQuestions: []
  },
  activePractice: null, // For Module 7 Interactive Cocktail Practice
  cocktailFilter: 'all',
  scores: {}, // { moduleId: { bestScore: X, total: Y, timestamp: Z } }
  errorQuestionsPool: [], // Array of question IDs that were answered incorrectly
  cocktailMastery: {} // { cocktailId: { completed: true, score: 100, timestamp: Z } }
};

// Storage keys
const STORAGE_SCORES_KEY = 'mixology_master_scores_v1';
const STORAGE_ERRORS_KEY = 'mixology_master_errors_v1';
const STORAGE_MASTERY_KEY = 'mixology_cocktail_mastery_v1';

// Web Audio Context for tactile sounds
let audioCtx = null;
function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playSound(type) {
  try {
    initAudio();
    if (!audioCtx) return;
    
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'correct') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(880, now + 0.1); // A5
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(164.81, now + 0.12);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (e) {
    // Audio might fail if user has not interacted yet, ignore silently
  }
}

// Initialize application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  const totalQuestionsBadge = document.getElementById('total-questions-badge');
  if (totalQuestionsBadge && APP_DATA.questions) {
    totalQuestionsBadge.textContent = `${APP_DATA.questions.length} Questions`;
  }
  renderModulesGrid();
  renderCocktailsGrid();
  renderLexiqueList();
  updateGlobalStatsDisplay();
  updateErrorsCountDisplay();
});

// Load saved data from localStorage
function loadStoredData() {
  try {
    const savedScores = localStorage.getItem(STORAGE_SCORES_KEY);
    if (savedScores) {
      state.scores = JSON.parse(savedScores);
    }
    const savedErrors = localStorage.getItem(STORAGE_ERRORS_KEY);
    if (savedErrors) {
      state.errorQuestionsPool = JSON.parse(savedErrors);
    }
    const savedMastery = localStorage.getItem(STORAGE_MASTERY_KEY);
    if (savedMastery) {
      state.cocktailMastery = JSON.parse(savedMastery);
    }
  } catch (e) {
    console.warn('LocalStorage error:', e);
  }
}

// Save data to localStorage
function saveScoresToStorage() {
  try {
    localStorage.setItem(STORAGE_SCORES_KEY, JSON.stringify(state.scores));
    localStorage.setItem(STORAGE_ERRORS_KEY, JSON.stringify(state.errorQuestionsPool));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

function saveCocktailMasteryToStorage() {
  try {
    localStorage.setItem(STORAGE_MASTERY_KEY, JSON.stringify(state.cocktailMastery));
  } catch (e) {
    console.warn('LocalStorage mastery save error:', e);
  }
}

// Reset all user progress and scores
function resetAllProgress() {
  playSound('click');
  const confirmed = window.confirm("Voulez-vous vraiment réinitialiser l'ensemble de votre progression ?");
  if (!confirmed) return;

  state.scores = {};
  state.errorQuestionsPool = [];
  state.cocktailMastery = {};

  try {
    localStorage.removeItem(STORAGE_SCORES_KEY);
    localStorage.removeItem(STORAGE_ERRORS_KEY);
    localStorage.removeItem(STORAGE_MASTERY_KEY);
  } catch (e) {
    console.warn('LocalStorage reset error:', e);
  }

  updateGlobalStatsDisplay();
  updateErrorsCountDisplay();
  renderModulesGrid();
  if (typeof renderModule7Hub === 'function') {
    renderModule7Hub();
  }
  if (typeof renderCocktailsGrid === 'function') {
    renderCocktailsGrid();
  }

  playSound('correct');
}

// ==========================================
// NAVIGATION & VIEW SWITCHING
// ==========================================

function navigateTo(viewId) {
  playSound('click');
  state.currentView = viewId;

  // Hide all view sections
  const views = document.querySelectorAll('.view-section');
  views.forEach(v => v.classList.add('hidden'));

  // Show target view
  const targetView = document.getElementById(`view-${viewId}`);
  if (targetView) {
    targetView.classList.remove('hidden');
  }

  // Update bottom navigation bar active state
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
  const activeNavBtn = document.getElementById(`nav-${viewId}`);
  if (activeNavBtn) {
    activeNavBtn.classList.add('active');
  }

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// RENDER MODULES & DASHBOARD
// ==========================================

function renderModulesGrid() {
  const container = document.getElementById('modules-grid-container');
  if (!container || !APP_DATA.modules) return;

  container.innerHTML = APP_DATA.modules.map(mod => {
    const moduleQuestions = APP_DATA.questions.filter(q => q.moduleId === mod.id);
    const scoreData = state.scores[mod.id];
    
    let scoreDisplayHtml = `<span class="module-score-status">${moduleQuestions.length} questions</span>`;
    if (mod.id === 7) {
      const mastered = Object.keys(state.cocktailMastery || {}).filter(k => state.cocktailMastery[k]?.completed).length;
      if (mastered > 0) {
        scoreDisplayHtml = `
          <span class="module-score-status completed">
            ${mastered === 36 ? '⭐' : '✓'} ${mastered}/36 fiches maîtrisées
          </span>
        `;
      } else {
        scoreDisplayHtml = `<span class="module-score-status">36 fiches officielles</span>`;
      }
    } else if (scoreData) {
      const isPerfect = scoreData.bestScore === scoreData.total;
      scoreDisplayHtml = `
        <span class="module-score-status completed">
          ${isPerfect ? '⭐' : '✓'} Record : ${scoreData.bestScore}/${scoreData.total}
        </span>
      `;
    }

    return `
      <div class="module-card" onclick="startModuleQuiz(${mod.id})">
        <div>
          <div class="module-card-header">
            <span class="module-number-badge">Partie ${mod.id}</span>
            <span class="module-icon">${mod.icon}</span>
          </div>
          <h3 class="module-title">${mod.title}</h3>
          <p class="module-subtitle">${mod.subtitle}</p>
        </div>

        <div class="module-footer">
          ${scoreDisplayHtml}
          <span class="module-start-btn">Réviser ➔</span>
        </div>
      </div>
    `;
  }).join('');
}

function updateGlobalStatsDisplay() {
  const globalScoreDisplay = document.getElementById('global-score-display');
  const globalProgressBar = document.getElementById('global-progress-bar');
  const modulesCompletedDisplay = document.getElementById('modules-completed-display');
  const modulesProgressBar = document.getElementById('modules-progress-bar');

  let completedModulesCount = 0;
  let totalScoreAcquired = 0;
  let totalQuestionsAnswered = 0;

  APP_DATA.modules.forEach(mod => {
    if (mod.id === 7) {
      const mastered = Object.keys(state.cocktailMastery || {}).filter(k => state.cocktailMastery[k]?.completed).length;
      if (mastered > 0) {
        completedModulesCount++;
        totalScoreAcquired += mastered;
        totalQuestionsAnswered += 36;
      }
    } else {
      const scoreData = state.scores[mod.id];
      if (scoreData) {
        completedModulesCount++;
        totalQuestionsAnswered += scoreData.total;
        totalScoreAcquired += scoreData.bestScore;
      }
    }
  });

  const percentage = totalQuestionsAnswered > 0 
    ? Math.round((totalScoreAcquired / totalQuestionsAnswered) * 100) 
    : 0;

  if (globalScoreDisplay) globalScoreDisplay.innerHTML = `${percentage} <span>%</span>`;
  if (globalProgressBar) globalProgressBar.style.width = `${percentage}%`;
  
  if (modulesCompletedDisplay) modulesCompletedDisplay.innerHTML = `${completedModulesCount} <span>/ 9</span>`;
  if (modulesProgressBar) {
    const modPercentage = Math.round((completedModulesCount / 9) * 100);
    modulesProgressBar.style.width = `${modPercentage}%`;
  }
}

function updateErrorsCountDisplay() {
  const errorsText = document.getElementById('errors-count-text');
  const count = state.errorQuestionsPool.length;
  if (errorsText) {
    errorsText.textContent = count === 0 
      ? 'Aucune erreur enregistrée' 
      : `${count} question${count > 1 ? 's' : ''} à revoir`;
  }
}

// ==========================================
// QUIZ ENGINE
// ==========================================

function prepareQuizQuestions(rawQuestions) {
  // 1. Cloner et mélanger l'ordre des questions (Fisher-Yates)
  const shuffledQuestions = [...rawQuestions];
  for (let i = shuffledQuestions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
  }

  // 2. Cloner et mélanger les options de réponses pour les QCM
  return shuffledQuestions.map(q => {
    if (q.options) {
      if (Array.isArray(q.correctAnswer)) {
        const correctTexts = q.correctAnswer.map(idx => q.options[idx]);
        const shuffledOptions = [...q.options];
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        const newCorrectAnswers = correctTexts.map(txt => shuffledOptions.indexOf(txt));
        return {
          ...q,
          isMultiSelect: true,
          options: shuffledOptions,
          correctAnswer: newCorrectAnswers
        };
      } else if (typeof q.correctAnswer === 'number') {
        const correctOptionText = q.options[q.correctAnswer];
        const shuffledOptions = [...q.options];
        for (let i = shuffledOptions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
        }
        return {
          ...q,
          options: shuffledOptions,
          correctAnswer: shuffledOptions.indexOf(correctOptionText)
        };
      }
    }
    return { ...q };
  });
}

function startModuleQuiz(moduleId) {
  const mod = APP_DATA.modules.find(m => m.id === moduleId);
  if (!mod) return;

  // Partie 7 leads to the dedicated 2-column Hub
  if (moduleId === 7) {
    openModule7Hub();
    return;
  }

  const questions = APP_DATA.questions.filter(q => q.moduleId === moduleId);
  if (questions.length === 0) return;

  const quizQuestions = prepareQuizQuestions(questions);

  state.activeQuiz = {
    title: `Partie ${mod.id} : ${mod.title}`,
    moduleId: mod.id,
    questions: quizQuestions,
    currentIndex: 0,
    score: 0,
    answered: false,
    wrongQuestions: []
  };

  navigateTo('quiz');
  renderCurrentQuestion();
}

function startRandomMixQuiz() {
  const allShuffled = prepareQuizQuestions(APP_DATA.questions);
  const selected = allShuffled.slice(0, 15);

  state.activeQuiz = {
    title: '⚡ Grand Mix Aléatoire (15 Q.)',
    moduleId: 'mix',
    questions: selected,
    currentIndex: 0,
    score: 0,
    answered: false,
    wrongQuestions: []
  };

  navigateTo('quiz');
  renderCurrentQuestion();
}

function startErrorsQuiz() {
  if (state.errorQuestionsPool.length === 0) {
    alert('Bravo ! Vous n\'avez aucune erreur enregistrée dans votre carnet de révision.');
    return;
  }

  const errorQuestions = APP_DATA.questions.filter(q => state.errorQuestionsPool.includes(q.id));
  if (errorQuestions.length === 0) return;

  state.activeQuiz = {
    title: '🔄 Révision des Erreurs',
    moduleId: 'errors',
    questions: prepareQuizQuestions(errorQuestions),
    currentIndex: 0,
    score: 0,
    answered: false,
    wrongQuestions: []
  };

  navigateTo('quiz');
  renderCurrentQuestion();
}

function renderCurrentQuestion() {
  const quiz = state.activeQuiz;
  const currentQ = quiz.questions[quiz.currentIndex];

  quiz.answered = false;

  // Header & Counters
  document.getElementById('quiz-module-title').textContent = quiz.title;
  document.getElementById('quiz-question-counter').textContent = `${quiz.currentIndex + 1} / ${quiz.questions.length}`;

  const progressPercent = Math.round(((quiz.currentIndex) / quiz.questions.length) * 100);
  document.getElementById('quiz-progress-indicator').style.width = `${Math.max(5, progressPercent)}%`;

  // Question badge and content
  document.getElementById('question-badge-tag').textContent = currentQ.badge || 'Référentiel Officiel';
  
  let questionHtml = '';
  if (currentQ.image) {
    questionHtml += `
      <div class="quiz-question-image-box">
        <img src="${currentQ.image}" alt="Matériel officiel" class="quiz-glass-img">
      </div>
    `;
  }
  questionHtml += currentQ.question;
  document.getElementById('question-text-content').innerHTML = questionHtml;

  const answersContainer = document.getElementById('answers-container');

  // Handle 'equipment_identify' questions (Module 6)
  if (currentQ.type === 'equipment_identify') {
    quiz.selectedEquipmentOption = null;
    renderEquipmentIdentify();
  }
  // Handle 'glass_identify' questions (Module 5)
  else if (currentQ.type === 'glass_identify') {
    quiz.selectedGlassCategory = null;
    renderGlassIdentify();
  }
  // Handle 'reorder' questions (Module 4)
  else if (currentQ.type === 'reorder') {
    if (!quiz.currentReorderItems || quiz.currentReorderQId !== currentQ.id) {
      quiz.currentReorderQId = currentQ.id;
      let shuffled = [...currentQ.steps];
      let attempts = 0;
      do {
        shuffled = [...currentQ.steps].sort(() => 0.5 - Math.random());
        attempts++;
      } while (attempts < 5 && JSON.stringify(shuffled) === JSON.stringify(currentQ.steps));
      quiz.currentReorderItems = shuffled;
    }
    renderReorderList();
  } else if (currentQ.isMultiSelect || Array.isArray(currentQ.correctAnswer)) {
    // Multi-Select Question
    quiz.selectedMultiAnswers = [];
    answersContainer.innerHTML = `
      <div style="font-size: 0.85rem; color: #fbbf24; margin-bottom: 10px; font-weight: 700; display: flex; align-items: center; gap: 6px;">
        <span>☑️</span>
        <span>Plusieurs réponses attendues : cochez toutes les bonnes options puis validez.</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        ${currentQ.options.map((opt, idx) => `
          <button class="answer-option-btn" onclick="toggleMultiSelectAnswer(${idx})" id="opt-btn-${idx}">
            <span class="answer-letter" id="opt-letter-${idx}">☐</span>
            <span>${opt}</span>
          </button>
        `).join('')}
      </div>
      <button class="btn btn-primary" style="width: 100%; margin-top: 14px;" id="btn-validate-multi" onclick="validateMultiSelectAnswers()">
        ✅ Valider mes réponses
      </button>
    `;
  } else {
    // Standard Multiple Choice
    const letters = ['A', 'B', 'C', 'D'];
    answersContainer.innerHTML = currentQ.options.map((opt, idx) => `
      <button class="answer-option-btn" onclick="handleSelectAnswer(${idx})" id="opt-btn-${idx}">
        <span class="answer-letter">${letters[idx]}</span>
        <span>${opt}</span>
      </button>
    `).join('');
  }

  // Hide explanation and Next button
  document.getElementById('explanation-container').classList.add('hidden');
  document.getElementById('btn-next-question').classList.add('hidden');
}

function renderReorderList() {
  const quiz = state.activeQuiz;
  const currentQ = quiz.questions[quiz.currentIndex];
  const items = quiz.currentReorderItems;
  const isAnswered = quiz.answered;

  const answersContainer = document.getElementById('answers-container');
  
  let html = `
    <div style="font-size: 0.8rem; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
      <span>👆 Glissez ou utilisez les flèches pour placer les étapes dans l’ordre :</span>
    </div>
    <div class="reorder-list" id="reorder-list-el">
  `;

  items.forEach((itemText, idx) => {
    let statusClass = '';
    let badgeHtml = '';

    if (isAnswered) {
      const correctIndex = currentQ.steps.indexOf(itemText);
      if (correctIndex === idx) {
        statusClass = 'status-correct';
        badgeHtml = `<span class="reorder-feedback-badge" style="background: rgba(16, 185, 129, 0.2); color: #34d399;">✓ Position ${idx + 1}</span>`;
      } else {
        statusClass = 'status-wrong';
        badgeHtml = `<span class="reorder-feedback-badge" style="background: rgba(239, 68, 68, 0.2); color: #f87171;">Ordre officiel : ${correctIndex + 1}</span>`;
      }
    }

    html += `
      <div class="reorder-item ${statusClass}" data-index="${idx}" draggable="${!isAnswered}">
        <div class="reorder-left">
          <span class="reorder-index">${idx + 1}</span>
          <span class="reorder-text">${itemText} ${badgeHtml}</span>
        </div>
        ${!isAnswered ? `
          <div class="reorder-controls">
            <button class="reorder-btn-move" onclick="moveReorderItem(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="Monter">▲</button>
            <button class="reorder-btn-move" onclick="moveReorderItem(${idx}, 1)" ${idx === items.length - 1 ? 'disabled' : ''} title="Descendre">▼</button>
            <span class="reorder-drag-handle">☰</span>
          </div>
        ` : ''}
      </div>
    `;
  });

  html += `</div>`;

  if (!isAnswered) {
    html += `
      <button class="btn btn-primary" style="width: 100%; margin-top: 10px;" onclick="validateReorderOrder()">
        ✅ Valider mon ordre chronologique
      </button>
    `;
  }

  answersContainer.innerHTML = html;

  if (!isAnswered) {
    attachReorderDragListeners();
  }
}

function moveReorderItem(fromIndex, delta) {
  playSound('click');
  const quiz = state.activeQuiz;
  const items = quiz.currentReorderItems;
  const toIndex = fromIndex + delta;
  if (toIndex < 0 || toIndex >= items.length) return;

  const temp = items[fromIndex];
  items[fromIndex] = items[toIndex];
  items[toIndex] = temp;

  renderReorderList();
}

function attachReorderDragListeners() {
  const container = document.getElementById('reorder-list-el');
  if (!container) return;

  let draggedItem = null;

  container.querySelectorAll('.reorder-item').forEach(item => {
    item.addEventListener('dragstart', (e) => {
      draggedItem = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    });

    item.addEventListener('dragend', () => {
      if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
      }
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!draggedItem || draggedItem === item) return;

      const items = [...container.querySelectorAll('.reorder-item')];
      const draggedIndex = items.indexOf(draggedItem);
      const targetIndex = items.indexOf(item);

      if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
        const quizItems = state.activeQuiz.currentReorderItems;
        const [moved] = quizItems.splice(draggedIndex, 1);
        quizItems.splice(targetIndex, 0, moved);
        renderReorderList();
      }
    });
  });
}

function validateReorderOrder() {
  const quiz = state.activeQuiz;
  if (quiz.answered) return;
  quiz.answered = true;

  const currentQ = quiz.questions[quiz.currentIndex];
  const userOrder = quiz.currentReorderItems;
  const correctOrder = currentQ.steps;

  let correctPositionsCount = 0;
  for (let i = 0; i < correctOrder.length; i++) {
    if (userOrder[i] === correctOrder[i]) {
      correctPositionsCount++;
    }
  }

  const isFullMatch = correctPositionsCount === correctOrder.length;

  if (isFullMatch) {
    quiz.score++;
    playSound('correct');
    state.errorQuestionsPool = state.errorQuestionsPool.filter(id => id !== currentQ.id);
  } else {
    playSound('wrong');
    quiz.wrongQuestions.push(currentQ);
    if (!state.errorQuestionsPool.includes(currentQ.id)) {
      state.errorQuestionsPool.push(currentQ.id);
    }
  }

  saveScoresToStorage();
  updateErrorsCountDisplay();

  renderReorderList();

  const expContainer = document.getElementById('explanation-container');
  const expText = document.getElementById('explanation-text-content');
  expText.innerHTML = `
    <strong>${isFullMatch ? '🎉 Parfait ! L’ordre officiel est respecté à 100%.' : `⚠️ ${correctPositionsCount} étape(s) bien placée(s) sur ${correctOrder.length}.`}</strong><br><br>
    ${currentQ.explanation}
  `;
  expContainer.classList.remove('hidden');

  const nextBtn = document.getElementById('btn-next-question');
  const isLastQuestion = quiz.currentIndex === quiz.questions.length - 1;
  nextBtn.textContent = isLastQuestion ? 'Terminer le Quiz ➔' : 'Défi Suivant ➔';
  nextBtn.classList.remove('hidden');
}

// ==========================================
// EQUIPMENT IDENTIFICATION ENGINE (MODULE 6)
// ==========================================

function renderEquipmentIdentify() {
  const quiz = state.activeQuiz;
  const currentQ = quiz.questions[quiz.currentIndex];
  const isAnswered = quiz.answered;
  const selectedOpt = quiz.selectedEquipmentOption;

  const answersContainer = document.getElementById('answers-container');
  const letters = ['A', 'B', 'C', 'D'];

  answersContainer.innerHTML = `
    <div class="glass-identify-box">
      <div>
        <div style="font-size: 0.85rem; font-weight: 700; color: #fbbf24; margin-bottom: 6px;">
          1. Écrivez le nom exact du matériel :
        </div>
        <input 
          type="text" 
          id="equipment-name-input" 
          class="glass-input-field" 
          autocomplete="off" 
          autocorrect="off" 
          autocapitalize="off" 
          spellcheck="false"
          ${isAnswered ? 'disabled' : ''}
          onkeydown="if(event.key==='Enter') validateEquipmentIdentify()"
        >
      </div>

      <div>
        <div class="category-selection-label">
          2. Choisissez son rôle officiel au bar :
        </div>
        <div class="equipment-options-list" style="display: flex; flex-direction: column; gap: 8px; margin-top: 6px;">
          ${currentQ.options.map((opt, idx) => `
            <button 
              class="answer-option-btn ${selectedOpt === idx ? 'selected' : ''}" 
              id="eq-opt-btn-${idx}" 
              onclick="selectEquipmentOption(${idx})"
              ${isAnswered ? 'disabled' : ''}
              style="text-align: left; padding: 12px 14px; font-size: 0.9rem;"
            >
              <span class="answer-letter">${letters[idx]}</span>
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>
      </div>

      ${!isAnswered ? `
        <button class="btn btn-primary" style="width: 100%; margin-top: 10px;" onclick="validateEquipmentIdentify()">
          ✅ Valider ma réponse
        </button>
      ` : ''}
    </div>
  `;

  if (!isAnswered) {
    setTimeout(() => {
      const input = document.getElementById('equipment-name-input');
      if (input) input.focus();
    }, 120);
  }
}

function selectEquipmentOption(optIndex) {
  playSound('click');
  const quiz = state.activeQuiz;
  if (quiz.answered) return;

  quiz.selectedEquipmentOption = optIndex;

  const currentQ = quiz.questions[quiz.currentIndex];
  currentQ.options.forEach((_, idx) => {
    const btn = document.getElementById(`eq-opt-btn-${idx}`);
    if (btn) {
      if (idx === optIndex) {
        btn.classList.add('selected');
      } else {
        btn.classList.remove('selected');
      }
    }
  });
}

function validateEquipmentIdentify() {
  const quiz = state.activeQuiz;
  if (quiz.answered) return;

  const inputEl = document.getElementById('equipment-name-input');
  const userText = inputEl ? inputEl.value : '';
  const selectedOpt = quiz.selectedEquipmentOption;

  if (!userText.trim()) {
    alert('Veuillez écrire le nom du matériel avant de valider.');
    if (inputEl) inputEl.focus();
    return;
  }

  if (selectedOpt === null || selectedOpt === undefined) {
    alert('Veuillez sélectionner le rôle du matériel parmi les 4 choix proposés.');
    return;
  }

  quiz.answered = true;
  const currentQ = quiz.questions[quiz.currentIndex];

  // Strict exact text matching for tool name (no partial sub-words accepted)
  const normalizedUserText = normalizeGlassString(userText);
  const isNameCorrect = currentQ.acceptedNames.some(acc => {
    return normalizeGlassString(acc) === normalizedUserText;
  });

  const isRoleCorrect = selectedOpt === currentQ.correctAnswer;
  const isFullCorrect = isNameCorrect && isRoleCorrect;

  // Visual feedback for input
  if (inputEl) {
    inputEl.disabled = true;
    if (isNameCorrect) {
      inputEl.classList.add('correct-input');
      inputEl.value = `✓ ${currentQ.toolName} — Nom exact !`;
    } else {
      inputEl.classList.add('wrong-input');
      inputEl.value = `✗ Vous avez écrit : « ${userText} » — Réponse : ${currentQ.toolName}`;
    }
  }

  // Visual feedback for options
  currentQ.options.forEach((_, idx) => {
    const btn = document.getElementById(`eq-opt-btn-${idx}`);
    if (!btn) return;
    btn.disabled = true;

    if (idx === currentQ.correctAnswer) {
      btn.classList.add('correct');
    } else if (idx === selectedOpt && !isRoleCorrect) {
      btn.classList.add('wrong');
    }
  });

  // Scoring
  if (isFullCorrect) {
    quiz.score++;
    playSound('correct');
    state.errorQuestionsPool = state.errorQuestionsPool.filter(id => id !== currentQ.id);
  } else {
    playSound('wrong');
    quiz.wrongQuestions.push(currentQ);
    if (!state.errorQuestionsPool.includes(currentQ.id)) {
      state.errorQuestionsPool.push(currentQ.id);
    }
  }

  saveScoresToStorage();
  updateErrorsCountDisplay();

  // Show official explanation
  const expContainer = document.getElementById('explanation-container');
  const expText = document.getElementById('explanation-text-content');
  expText.innerHTML = `
    <strong>${isFullCorrect ? '🎉 Parfait ! Nom et fonction 100% exacts.' : '⚠️ Référence du socle :'}</strong><br><br>
    • <strong>Nom officiel :</strong> ${currentQ.toolName}<br><br>
    ${currentQ.explanation}
  `;
  expContainer.classList.remove('hidden');

  // Show Next button
  const nextBtn = document.getElementById('btn-next-question');
  const isLastQuestion = quiz.currentIndex === quiz.questions.length - 1;
  nextBtn.textContent = isLastQuestion ? 'Terminer le Quiz ➔' : 'Matériel Suivant ➔';
  nextBtn.classList.remove('hidden');
}

// ==========================================
// GLASS IDENTIFICATION ENGINE (MODULE 5)
// ==========================================

function renderGlassIdentify() {
  const quiz = state.activeQuiz;
  const currentQ = quiz.questions[quiz.currentIndex];
  const isAnswered = quiz.answered;
  const selectedCat = quiz.selectedGlassCategory;

  const answersContainer = document.getElementById('answers-container');

  answersContainer.innerHTML = `
    <div class="glass-identify-box">
      <div>
        <div style="font-size: 0.85rem; font-weight: 700; color: #fbbf24; margin-bottom: 6px;">
          1. Écrivez le nom exact du verre :
        </div>
        <input 
          type="text" 
          id="glass-name-input" 
          class="glass-input-field" 
          autocomplete="off" 
          autocorrect="off" 
          autocapitalize="off" 
          spellcheck="false"
          ${isAnswered ? 'disabled' : ''}
          onkeydown="if(event.key==='Enter') validateGlassIdentify()"
        >
      </div>

      <div>
        <div class="category-selection-label">
          2. Est-ce un Incontournable ou un Complémentaire ?
        </div>
        <div class="category-choice-grid">
          <button 
            class="category-choice-btn ${selectedCat === 'incontournable' ? 'selected' : ''}" 
            id="cat-btn-incontournable" 
            onclick="selectGlassCategory('incontournable')"
            ${isAnswered ? 'disabled' : ''}
          >
            🌟 Incontournable
          </button>
          <button 
            class="category-choice-btn ${selectedCat === 'complémentaire' ? 'selected' : ''}" 
            id="cat-btn-complementaire" 
            onclick="selectGlassCategory('complémentaire')"
            ${isAnswered ? 'disabled' : ''}
          >
            ✨ Complémentaire
          </button>
        </div>
      </div>

      ${!isAnswered ? `
        <button class="btn btn-primary" style="width: 100%; margin-top: 6px;" onclick="validateGlassIdentify()">
          ✅ Valider ma réponse
        </button>
      ` : ''}
    </div>
  `;

  if (!isAnswered) {
    setTimeout(() => {
      const input = document.getElementById('glass-name-input');
      if (input) input.focus();
    }, 120);
  }
}

function selectGlassCategory(category) {
  playSound('click');
  const quiz = state.activeQuiz;
  if (quiz.answered) return;

  quiz.selectedGlassCategory = category;

  document.querySelectorAll('.category-choice-btn').forEach(btn => btn.classList.remove('selected'));
  if (category === 'incontournable') {
    document.getElementById('cat-btn-incontournable')?.classList.add('selected');
  } else if (category === 'complémentaire') {
    document.getElementById('cat-btn-complementaire')?.classList.add('selected');
  }
}

function normalizeGlassString(str) {
  return (str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function validateGlassIdentify() {
  const quiz = state.activeQuiz;
  if (quiz.answered) return;

  const inputEl = document.getElementById('glass-name-input');
  const userText = inputEl ? inputEl.value : '';
  const selectedCat = quiz.selectedGlassCategory;

  if (!userText.trim()) {
    alert('Veuillez écrire le nom du verre avant de valider.');
    if (inputEl) inputEl.focus();
    return;
  }

  if (!selectedCat) {
    alert('Veuillez sélectionner si ce verre est Incontournable ou Complémentaire.');
    return;
  }

  quiz.answered = true;
  const currentQ = quiz.questions[quiz.currentIndex];

  // Strict exact text matching (no partial sub-words accepted)
  const normalizedUserText = normalizeGlassString(userText);
  const isNameCorrect = currentQ.acceptedNames.some(acc => {
    return normalizeGlassString(acc) === normalizedUserText;
  });

  const isCatCorrect = selectedCat === currentQ.category;
  const isFullCorrect = isNameCorrect && isCatCorrect;

  // Visual feedback
  if (inputEl) {
    inputEl.disabled = true;
    if (isNameCorrect) {
      inputEl.classList.add('correct-input');
      inputEl.value = `✓ ${currentQ.glassName} — Nom exact !`;
    } else {
      inputEl.classList.add('wrong-input');
      inputEl.value = `✗ Vous avez écrit : « ${userText} » — Réponse : ${currentQ.glassName}`;
    }
  }

  const inctBtn = document.getElementById('cat-btn-incontournable');
  const compBtn = document.getElementById('cat-btn-complementaire');

  if (inctBtn) inctBtn.disabled = true;
  if (compBtn) compBtn.disabled = true;

  if (currentQ.category === 'incontournable') {
    inctBtn?.classList.add('status-correct');
    if (selectedCat === 'complémentaire') {
      compBtn?.classList.add('status-wrong');
    }
  } else {
    compBtn?.classList.add('status-correct');
    if (selectedCat === 'incontournable') {
      inctBtn?.classList.add('status-wrong');
    }
  }

  // Scoring
  if (isFullCorrect) {
    quiz.score++;
    playSound('correct');
    state.errorQuestionsPool = state.errorQuestionsPool.filter(id => id !== currentQ.id);
  } else {
    playSound('wrong');
    quiz.wrongQuestions.push(currentQ);
    if (!state.errorQuestionsPool.includes(currentQ.id)) {
      state.errorQuestionsPool.push(currentQ.id);
    }
  }

  saveScoresToStorage();
  updateErrorsCountDisplay();

  // Show official explanation
  const expContainer = document.getElementById('explanation-container');
  const expText = document.getElementById('explanation-text-content');
  expText.innerHTML = `
    <strong>${isFullCorrect ? '🎉 Parfait ! Nom et catégorie 100% exacts.' : '⚠️ Référence du socle :'}</strong><br><br>
    • <strong>Nom officiel :</strong> ${currentQ.glassName}<br>
    • <strong>Catégorie :</strong> ${currentQ.categoryLabel}<br><br>
    ${currentQ.explanation}
  `;
  expContainer.classList.remove('hidden');

  // Show Next button
  const nextBtn = document.getElementById('btn-next-question');
  const isLastQuestion = quiz.currentIndex === quiz.questions.length - 1;
  nextBtn.textContent = isLastQuestion ? 'Terminer le Quiz ➔' : 'Verre Suivant ➔';
  nextBtn.classList.remove('hidden');
}

function handleSelectAnswer(selectedIndex) {
  const quiz = state.activeQuiz;
  if (quiz.answered) return;
  quiz.answered = true;

  const currentQ = quiz.questions[quiz.currentIndex];
  const isCorrect = selectedIndex === currentQ.correctAnswer;

  // Disable all answer buttons and reveal status
  currentQ.options.forEach((_, idx) => {
    const btn = document.getElementById(`opt-btn-${idx}`);
    if (!btn) return;
    btn.disabled = true;

    if (idx === currentQ.correctAnswer) {
      btn.classList.add('correct');
    } else if (idx === selectedIndex && !isCorrect) {
      btn.classList.add('wrong');
    }
  });

  // Score & Error pool update
  if (isCorrect) {
    quiz.score++;
    playSound('correct');
    state.errorQuestionsPool = state.errorQuestionsPool.filter(id => id !== currentQ.id);
  } else {
    playSound('wrong');
    quiz.wrongQuestions.push(currentQ);
    if (!state.errorQuestionsPool.includes(currentQ.id)) {
      state.errorQuestionsPool.push(currentQ.id);
    }
  }

  saveScoresToStorage();
  updateErrorsCountDisplay();

  // Show official explanation
  const expContainer = document.getElementById('explanation-container');
  const expText = document.getElementById('explanation-text-content');
  expText.textContent = currentQ.explanation;
  expContainer.classList.remove('hidden');

  // Show Next button
  const nextBtn = document.getElementById('btn-next-question');
  const isLastQuestion = quiz.currentIndex === quiz.questions.length - 1;
  nextBtn.textContent = isLastQuestion ? 'Terminer le Quiz ➔' : 'Question Suivante ➔';
  nextBtn.classList.remove('hidden');
}

function toggleMultiSelectAnswer(idx) {
  const quiz = state.activeQuiz;
  if (!quiz || quiz.answered) return;
  playSound('click');

  if (!quiz.selectedMultiAnswers) quiz.selectedMultiAnswers = [];

  const pos = quiz.selectedMultiAnswers.indexOf(idx);
  const btn = document.getElementById(`opt-btn-${idx}`);
  const icon = document.getElementById(`opt-letter-${idx}`);

  if (pos > -1) {
    quiz.selectedMultiAnswers.splice(pos, 1);
    btn?.classList.remove('selected');
    if (icon) icon.textContent = '☐';
  } else {
    quiz.selectedMultiAnswers.push(idx);
    btn?.classList.add('selected');
    if (icon) icon.textContent = '☑';
  }
}

function validateMultiSelectAnswers() {
  const quiz = state.activeQuiz;
  if (!quiz || quiz.answered) return;

  if (!quiz.selectedMultiAnswers || quiz.selectedMultiAnswers.length === 0) {
    alert('Veuillez cocher au moins une réponse avant de valider.');
    return;
  }

  quiz.answered = true;
  const currentQ = quiz.questions[quiz.currentIndex];
  const userSelections = quiz.selectedMultiAnswers;
  const correctIndices = currentQ.correctAnswer;

  const isFullMatch = userSelections.length === correctIndices.length &&
    userSelections.every(val => correctIndices.includes(val));

  // Disable all buttons and show colors
  currentQ.options.forEach((_, idx) => {
    const btn = document.getElementById(`opt-btn-${idx}`);
    const icon = document.getElementById(`opt-letter-${idx}`);
    if (!btn) return;
    btn.disabled = true;

    if (correctIndices.includes(idx)) {
      btn.classList.add('correct');
      if (icon) icon.textContent = '✓';
    } else if (userSelections.includes(idx)) {
      btn.classList.add('wrong');
      if (icon) icon.textContent = '✗';
    }
  });

  // Hide validate button
  const valBtn = document.getElementById('btn-validate-multi');
  if (valBtn) valBtn.classList.add('hidden');

  // Scoring
  if (isFullMatch) {
    quiz.score++;
    playSound('correct');
    state.errorQuestionsPool = state.errorQuestionsPool.filter(id => id !== currentQ.id);
  } else {
    playSound('wrong');
    quiz.wrongQuestions.push(currentQ);
    if (!state.errorQuestionsPool.includes(currentQ.id)) {
      state.errorQuestionsPool.push(currentQ.id);
    }
  }

  saveScoresToStorage();
  updateErrorsCountDisplay();

  // Show official explanation
  const expContainer = document.getElementById('explanation-container');
  const expText = document.getElementById('explanation-text-content');
  expText.innerHTML = `
    <strong>${isFullMatch ? '🎉 Parfait ! Toutes les bonnes règles ont été sélectionnées.' : '⚠️ Réponse officielle du référentiel :'}</strong><br><br>
    ${currentQ.explanation}
  `;
  expContainer.classList.remove('hidden');

  // Show Next button
  const nextBtn = document.getElementById('btn-next-question');
  const isLastQuestion = quiz.currentIndex === quiz.questions.length - 1;
  nextBtn.textContent = isLastQuestion ? 'Terminer le Quiz ➔' : 'Question Suivante ➔';
  nextBtn.classList.remove('hidden');
}

function handleNextQuestion() {
  playSound('click');
  const quiz = state.activeQuiz;

  if (quiz.currentIndex < quiz.questions.length - 1) {
    quiz.currentIndex++;
    renderCurrentQuestion();
    window.scrollTo({ top: 120, behavior: 'smooth' });
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  const quiz = state.activeQuiz;
  const total = quiz.questions.length;
  const score = quiz.score;
  const percentage = Math.round((score / total) * 100);

  // Save best score if it's a specific module
  if (typeof quiz.moduleId === 'number') {
    const existing = state.scores[quiz.moduleId];
    if (!existing || score > existing.bestScore) {
      state.scores[quiz.moduleId] = {
        bestScore: score,
        total: total,
        timestamp: Date.now()
      };
      saveScoresToStorage();
      renderModulesGrid();
      updateGlobalStatsDisplay();
    }
  }

  // Display results screen
  const trophyIcon = document.getElementById('results-trophy-icon');
  const titleText = document.getElementById('results-title-text');
  const subtitleText = document.getElementById('results-subtitle-text');
  const scoreValue = document.getElementById('results-score-value');
  const percentageValue = document.getElementById('results-percentage-value');
  const retryErrorsBtn = document.getElementById('btn-results-retry-errors');

  scoreValue.textContent = `${score}/${total}`;
  percentageValue.textContent = `${percentage}% Réussite`;

  if (percentage === 100) {
    trophyIcon.textContent = '🏆';
    titleText.textContent = 'Parfait ! Chef Barman !';
    subtitleText.textContent = 'Maîtrise absolue du référentiel officiel.';
  } else if (percentage >= 80) {
    trophyIcon.textContent = '⭐';
    titleText.textContent = 'Excellent travail !';
    subtitleText.textContent = 'Très bonne maîtrise des concepts et recettes.';
  } else if (percentage >= 50) {
    trophyIcon.textContent = '🍹';
    titleText.textContent = 'Bon début !';
    subtitleText.textContent = 'Encore quelques révisions sur les détails techniques.';
  } else {
    trophyIcon.textContent = '📖';
    titleText.textContent = 'À réviser !';
    subtitleText.textContent = 'Relisez bien les fiches et réessayez pour progresser.';
  }

  if (retryErrorsBtn) {
    if (quiz.wrongQuestions.length > 0) {
      retryErrorsBtn.classList.remove('hidden');
      retryErrorsBtn.textContent = `🔄 Revoir mes ${quiz.wrongQuestions.length} erreur${quiz.wrongQuestions.length > 1 ? 's' : ''}`;
    } else {
      retryErrorsBtn.classList.add('hidden');
    }
  }

  navigateTo('results');
}

function restartCurrentModule() {
  const quiz = state.activeQuiz;
  if (quiz.moduleId === 'mix') {
    startRandomMixQuiz();
  } else if (quiz.moduleId === 'errors') {
    startErrorsQuiz();
  } else if (typeof quiz.moduleId === 'number') {
    startModuleQuiz(quiz.moduleId);
  } else {
    navigateTo('home');
  }
}

function confirmExitQuiz() {
  if (confirm('Voulez-vous vraiment quitter ce quiz en cours ?')) {
    navigateTo('home');
  }
}

// ==========================================
// COCKTAILS EXPLORER & MEMO CARDS (36 RECETTES)
// ==========================================

function renderCocktailsGrid() {
  const container = document.getElementById('cocktails-grid-container');
  if (!container || !APP_DATA.cocktails) return;

  const searchQuery = (document.getElementById('cocktail-search-input')?.value || '').toLowerCase();
  const filter = state.cocktailFilter;

  const filtered = APP_DATA.cocktails.filter(c => {
    // Filter matching
    if (filter === 'short' && !c.category.toLowerCase().includes('short')) return false;
    if (filter === 'long' && !c.category.toLowerCase().includes('long')) return false;
    if (['gin', 'rhum', 'vodka', 'whisky', 'tequila'].includes(filter)) {
      const hasSpirit = c.ingredients.some(i => i.toLowerCase().includes(filter));
      if (!hasSpirit) return false;
    }

    // Search query matching
    if (searchQuery) {
      const matchName = c.name.toLowerCase().includes(searchQuery);
      const matchGlass = c.glass.toLowerCase().includes(searchQuery);
      const matchProfile = c.profile.toLowerCase().includes(searchQuery);
      const matchIngredients = c.ingredients.some(i => i.toLowerCase().includes(searchQuery));
      return matchName || matchGlass || matchProfile || matchIngredients;
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 40px 20px; grid-column: 1 / -1;">
        Aucun cocktail ne correspond à votre recherche.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(c => `
    <div class="cocktail-card" onclick="openCocktailModal('${c.id}')">
      <div>
        <div class="cocktail-card-top">
          <h3 class="cocktail-name">${c.name}</h3>
          <span class="cocktail-tav-badge">TAV ${c.tav}</span>
        </div>

        <div class="cocktail-meta-row">
          <span class="meta-tag">🍸 ${c.category}</span>
          <span class="meta-tag">🥂 ${c.glass}</span>
          <span class="meta-tag">⚙️ ${c.method}</span>
        </div>

        <div class="cocktail-ingredients-preview">
          ${c.ingredients.slice(0, 3).join(' • ')}${c.ingredients.length > 3 ? '...' : ''}
        </div>
      </div>

      <div style="font-size: 0.78rem; color: #fbbf24; font-weight: 700; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 8px;">
        <span>${c.profile}</span>
        <span>Voir la fiche ➔</span>
      </div>
    </div>
  `).join('');
}

function setCocktailFilter(filterName) {
  playSound('click');
  state.cocktailFilter = filterName;

  document.querySelectorAll('#cocktail-filter-pills .filter-pill').forEach(pill => {
    pill.classList.remove('active');
  });
  event.target.classList.add('active');

  renderCocktailsGrid();
}

function filterCocktails() {
  renderCocktailsGrid();
}

function openCocktailModal(cocktailId) {
  playSound('click');
  const cocktail = APP_DATA.cocktails.find(c => c.id === cocktailId);
  if (!cocktail) return;

  const content = document.getElementById('cocktail-detail-content');
  content.innerHTML = `
    <button class="modal-close-btn" onclick="closeCocktailModal()">✕</button>

    <div class="cocktail-detail-header">
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 6px;">
        <h2 class="cocktail-detail-title">${cocktail.name}</h2>
        <span class="cocktail-tav-badge" style="font-size: 0.85rem; padding: 4px 10px;">TAV ${cocktail.tav}</span>
      </div>
      <p style="font-size: 0.88rem; color: #fbbf24; font-weight: 600;">${cocktail.profile}</p>
    </div>

    <div class="cocktail-meta-row" style="margin-bottom: 16px;">
      <span class="meta-tag">🏷️ ${cocktail.category}</span>
      <span class="meta-tag">⏰ ${cocktail.type}</span>
      <span class="meta-tag">🥂 Verre : ${cocktail.glass}</span>
      <span class="meta-tag">⚙️ ${cocktail.method}</span>
      <span class="meta-tag">🧊 ${cocktail.ice}</span>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">📝 Ingrédients & Dosages Officiels (en ml)</div>
      <ul class="ingredients-list">
        ${cocktail.ingredients.map(i => `<li><strong>${i}</strong></li>`).join('')}
      </ul>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">🍒 Garniture & Décoration</div>
      <p style="font-size: 0.92rem; color: #f1f5f9;">${cocktail.garnish}</p>
    </div>

    <div class="detail-section">
      <div class="detail-section-title">🥄 Technique de réalisation</div>
      <p style="font-size: 0.9rem; color: #cbd5e1; line-height: 1.55;">${cocktail.technique}</p>
    </div>

    <div class="detail-section" style="border-bottom: none; margin-bottom: 0; padding-bottom: 0;">
      <div class="detail-section-title">📖 Histoire & Origine</div>
      <p style="font-size: 0.88rem; color: #94a3b8; font-style: italic; line-height: 1.5;">${cocktail.history}</p>
    </div>
  `;

  document.getElementById('modal-cocktail').classList.add('active');
}

function closeCocktailModal() {
  document.getElementById('modal-cocktail').classList.remove('active');
}

// ==========================================
// LEXIQUE PROFESSIONNEL (PARTIE 9)
// ==========================================

function renderLexiqueList() {
  const container = document.getElementById('lexique-list-container');
  if (!container || !APP_DATA.lexique) return;

  const searchQuery = (document.getElementById('lexique-search-input')?.value || '').toLowerCase();

  const filtered = APP_DATA.lexique.filter(item => {
    if (!searchQuery) return true;
    return item.term.toLowerCase().includes(searchQuery) || item.def.toLowerCase().includes(searchQuery);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 30px 20px;">
        Aucun terme trouvé pour « ${searchQuery} ».
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="lexique-item">
      <div class="lexique-term">${item.term}</div>
      <div class="lexique-def">${item.def}</div>
    </div>
  `).join('');
}

function filterLexique() {
  renderLexiqueList();
}

// ==========================================
// OFFICIAL STANDARD MODAL
// ==========================================

function openOfficialModal() {
  playSound('click');
  document.getElementById('modal-official').classList.add('active');
}

function closeOfficialModal() {
  document.getElementById('modal-official').classList.remove('active');
}

function closeModalOnOverlay(e, modalId) {
  if (e.target.id === modalId) {
    document.getElementById(modalId).classList.remove('active');
  }
}

// ==========================================
// MODULE 7 : COCKTAIL REFERENCE SHEETS HUB & WORKOUT
// ==========================================

function openModule7Hub() {
  navigateTo('module7-hub');
  renderModule7Hub();
}

function renderModule7Hub() {
  const shortContainer = document.getElementById('m7-short-drinks-list');
  const longContainer = document.getElementById('m7-long-drinks-list');
  if (!shortContainer || !longContainer || !APP_DATA.cocktails) return;

  const shortDrinks = APP_DATA.cocktails.filter(c => c.category === 'SHORT drink');
  const longDrinks = APP_DATA.cocktails.filter(c => c.category === 'LONG drink');

  const mastery = state.cocktailMastery || {};
  let masteredTotal = 0;

  shortContainer.innerHTML = shortDrinks.map((c, idx) => {
    const isDone = mastery[c.id]?.completed;
    if (isDone) masteredTotal++;
    return `
      <div class="m7-cocktail-item-card ${isDone ? 'mastered' : ''}" onclick="openCocktailPractice('${c.id}')">
        <div class="m7-card-left">
          <span class="m7-card-number">${idx + 1}.</span>
          <div>
            <div class="m7-card-name">${c.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${c.glass} • ${c.method}</div>
          </div>
        </div>
        <span class="m7-card-badge-status ${isDone ? 'done' : ''}">
          ${isDone ? '✓ 100% Maîtrisé' : 'À compléter ➔'}
        </span>
      </div>
    `;
  }).join('');

  longContainer.innerHTML = longDrinks.map((c, idx) => {
    const isDone = mastery[c.id]?.completed;
    if (isDone) masteredTotal++;
    return `
      <div class="m7-cocktail-item-card ${isDone ? 'mastered' : ''}" onclick="openCocktailPractice('${c.id}')">
        <div class="m7-card-left">
          <span class="m7-card-number">${idx + 19}.</span>
          <div>
            <div class="m7-card-name">${c.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${c.glass} • ${c.method}</div>
          </div>
        </div>
        <span class="m7-card-badge-status ${isDone ? 'done' : ''}">
          ${isDone ? '✓ 100% Maîtrisé' : 'À compléter ➔'}
        </span>
      </div>
    `;
  }).join('');

  const countEl = document.getElementById('m7-mastery-count');
  const barEl = document.getElementById('m7-mastery-bar');
  if (countEl) countEl.textContent = `${masteredTotal} / 36`;
  if (barEl) barEl.style.width = `${Math.round((masteredTotal / 36) * 100)}%`;
}

function openCocktailPractice(cocktailId) {
  const cocktail = APP_DATA.cocktails.find(c => c.id === cocktailId);
  if (!cocktail) return;

  state.activePractice = {
    cocktail: cocktail,
    userDosages: {},
    selectedMethod: null,
    selectedType: null,
    selectedTav: null,
    selectedGarnish: null,
    answered: false
  };

  navigateTo('cocktail-practice');
  renderCocktailPractice();
}

function renderCocktailPractice() {
  const practice = state.activePractice;
  if (!practice) return;
  const cocktail = practice.cocktail;
  const isAnswered = practice.answered;

  const container = document.getElementById('cocktail-practice-content');
  if (!container) return;

  const cIndex = APP_DATA.cocktails.findIndex(c => c.id === cocktail.id);

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between;">
      <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.82rem;" onclick="openModule7Hub()">
        ← Retour aux 36 Cocktails
      </button>
      <span class="module-number-badge" style="background: rgba(244, 63, 94, 0.15); color: #fb7185; border-color: rgba(244, 63, 94, 0.3);">
        ${cocktail.category} • N° ${cIndex + 1}/36
      </span>
    </div>

    <div class="practice-card-box">
      <div>
        <div style="font-size: 1.5rem; font-weight: 800; color: #fbbf24; line-height: 1.2;">
          🍸 ${cocktail.name.toUpperCase()}
        </div>
        <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 4px;">
          Profil gustatif : ${cocktail.profile} • Verrerie officielle : ${cocktail.glass}
        </div>
      </div>

      <!-- Section 1 : Ingrédients & Dosages en ml -->
      <div>
        <div class="practice-section-label">
          <span>1.</span> Complétez les dosages en ml de chaque ingrédient :
        </div>
        <div class="ingredients-practice-list">
          ${cocktail.ingredientsDetailed.map((ingr, idx) => `
            <div class="ingredient-dosage-row" id="practice-ingr-row-${idx}">
              <span style="font-weight: 600; color: #ffffff; font-size: 0.95rem;">${ingr.name}</span>
              <div style="display: flex; align-items: center; gap: 8px;">
                <input 
                  type="number" 
                  min="0" 
                  max="250" 
                  placeholder="..."
                  class="dosage-input-field" 
                  id="practice-dosage-input-${idx}"
                  value="${practice.userDosages[idx] !== undefined ? practice.userDosages[idx] : ''}"
                  ${isAnswered ? 'disabled' : ''}
                  oninput="handlePracticeDosageInput(${idx}, this.value)"
                >
                <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 700;">${ingr.unit}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Section 2 : Méthode d'élaboration -->
      <div>
        <div class="practice-section-label">
          <span>2.</span> Choisissez la méthode d’élaboration officielle :
        </div>
        <div class="method-choice-grid">
          <button 
            class="method-choice-btn ${practice.selectedMethod === 'Shaker' ? 'selected' : ''}" 
            id="practice-method-shaker" 
            onclick="selectPracticeMethod('Shaker')"
            ${isAnswered ? 'disabled' : ''}
          >
            <span style="font-size: 1.4rem;">🍸</span>
            <span>Shaker</span>
          </button>
          <button 
            class="method-choice-btn ${practice.selectedMethod === 'Verre à mélange' ? 'selected' : ''}" 
            id="practice-method-verre-melange" 
            onclick="selectPracticeMethod('Verre à mélange')"
            ${isAnswered ? 'disabled' : ''}
          >
            <span style="font-size: 1.4rem;">🥄</span>
            <span>Verre à mélange</span>
          </button>
          <button 
            class="method-choice-btn ${practice.selectedMethod === 'Direct au verre' ? 'selected' : ''}" 
            id="practice-method-direct" 
            onclick="selectPracticeMethod('Direct au verre')"
            ${isAnswered ? 'disabled' : ''}
          >
            <span style="font-size: 1.4rem;">🥃</span>
            <span>Direct au verre</span>
          </button>
        </div>
      </div>

      <!-- Section 3 : Type officiel -->
      <div>
        <div class="practice-section-label">
          <span>3.</span> Choisissez le type de cocktail :
        </div>
        <div class="type-choice-grid">
          <button 
            class="type-choice-btn ${practice.selectedType === 'BEFORE DINNER' ? 'selected' : ''}" 
            id="practice-type-before" 
            onclick="selectPracticeType('BEFORE DINNER')"
            ${isAnswered ? 'disabled' : ''}
          >
            Before Dinner
          </button>
          <button 
            class="type-choice-btn ${practice.selectedType === 'AFTER DINNER' ? 'selected' : ''}" 
            id="practice-type-after" 
            onclick="selectPracticeType('AFTER DINNER')"
            ${isAnswered ? 'disabled' : ''}
          >
            After Dinner
          </button>
          <button 
            class="type-choice-btn ${practice.selectedType === 'ALL DAY COCKTAIL' ? 'selected' : ''}" 
            id="practice-type-allday" 
            onclick="selectPracticeType('ALL DAY COCKTAIL')"
            ${isAnswered ? 'disabled' : ''}
          >
            All Day Cocktail
          </button>
        </div>
      </div>

      <!-- Section 4 : TAV -->
      <div>
        <div class="practice-section-label">
          <span>4.</span> Quel est le TAV officiel ?
        </div>
        <div class="tav-options-row">
          ${cocktail.tavOptions.map((t, idx) => `
            <button 
              class="tav-pill-btn ${practice.selectedTav === t ? 'selected' : ''}" 
              id="practice-tav-btn-${idx}" 
              onclick="selectPracticeTav('${t}')"
              ${isAnswered ? 'disabled' : ''}
            >
              ${t}
            </button>
          `).join('')}
        </div>
      </div>

      <!-- Section 5 : Garniture officielle -->
      <div>
        <div class="practice-section-label">
          <span>5.</span> Quelle est la garniture officielle selon la fiche technique ?
        </div>
        <div class="garnish-options-col">
          ${cocktail.garnishOptions.map((g, idx) => `
            <button 
              class="garnish-pill-btn ${practice.selectedGarnish === g ? 'selected' : ''}" 
              id="practice-garnish-btn-${idx}" 
              onclick="selectPracticeGarnish('${g.replace(/'/g, "\\'")}')"
              ${isAnswered ? 'disabled' : ''}
            >
              ${g}
            </button>
          `).join('')}
        </div>
      </div>

      ${!isAnswered ? `
        <button class="btn btn-primary" style="width: 100%; margin-top: 10px;" id="btn-validate-practice" onclick="validateCocktailPractice('${cocktail.id}')">
          ✅ Valider ma fiche technique
        </button>
      ` : ''}

      <!-- Feedback Area -->
      <div id="practice-feedback-box" class="${isAnswered ? '' : 'hidden'}">
      </div>
    </div>
  `;
}

function handlePracticeDosageInput(index, val) {
  if (!state.activePractice) return;
  state.activePractice.userDosages[index] = val;
}

function selectPracticeMethod(method) {
  playSound('click');
  if (!state.activePractice || state.activePractice.answered) return;
  state.activePractice.selectedMethod = method;

  document.querySelectorAll('.method-choice-btn').forEach(btn => btn.classList.remove('selected'));
  if (method === 'Shaker') document.getElementById('practice-method-shaker')?.classList.add('selected');
  else if (method === 'Verre à mélange') document.getElementById('practice-method-verre-melange')?.classList.add('selected');
  else if (method === 'Direct au verre') document.getElementById('practice-method-direct')?.classList.add('selected');
}

function selectPracticeType(type) {
  playSound('click');
  if (!state.activePractice || state.activePractice.answered) return;
  state.activePractice.selectedType = type;

  document.querySelectorAll('.type-choice-btn').forEach(btn => btn.classList.remove('selected'));
  if (type === 'BEFORE DINNER') document.getElementById('practice-type-before')?.classList.add('selected');
  else if (type === 'AFTER DINNER') document.getElementById('practice-type-after')?.classList.add('selected');
  else if (type === 'ALL DAY COCKTAIL') document.getElementById('practice-type-allday')?.classList.add('selected');
}

function selectPracticeTav(tav) {
  playSound('click');
  if (!state.activePractice || state.activePractice.answered) return;
  state.activePractice.selectedTav = tav;

  const cocktail = state.activePractice.cocktail;
  cocktail.tavOptions.forEach((t, idx) => {
    const btn = document.getElementById(`practice-tav-btn-${idx}`);
    if (btn) {
      if (t === tav) btn.classList.add('selected');
      else btn.classList.remove('selected');
    }
  });
}

function selectPracticeGarnish(garnish) {
  playSound('click');
  if (!state.activePractice || state.activePractice.answered) return;
  state.activePractice.selectedGarnish = garnish;

  const cocktail = state.activePractice.cocktail;
  cocktail.garnishOptions.forEach((g, idx) => {
    const btn = document.getElementById(`practice-garnish-btn-${idx}`);
    if (btn) {
      if (g === garnish) btn.classList.add('selected');
      else btn.classList.remove('selected');
    }
  });
}

function validateCocktailPractice(cocktailId) {
  const practice = state.activePractice;
  if (!practice || practice.answered) return;
  const cocktail = practice.cocktail;

  // Verify inputs
  for (let i = 0; i < cocktail.ingredientsDetailed.length; i++) {
    const userVal = practice.userDosages[i];
    if (userVal === undefined || userVal === null || userVal === '') {
      alert(`Veuillez renseigner le dosage pour ${cocktail.ingredientsDetailed[i].name}.`);
      document.getElementById(`practice-dosage-input-${i}`)?.focus();
      return;
    }
  }

  if (!practice.selectedMethod) {
    alert('Veuillez sélectionner la méthode d’élaboration officielle.');
    return;
  }

  if (!practice.selectedType) {
    alert('Veuillez sélectionner le type de cocktail.');
    return;
  }

  if (!practice.selectedTav) {
    alert('Veuillez sélectionner le TAV officiel.');
    return;
  }

  if (!practice.selectedGarnish) {
    alert('Veuillez sélectionner la garniture officielle.');
    return;
  }

  practice.answered = true;

  // Check dosages
  let correctDosagesCount = 0;
  cocktail.ingredientsDetailed.forEach((ingr, idx) => {
    const inputEl = document.getElementById(`practice-dosage-input-${idx}`);
    const rowEl = document.getElementById(`practice-ingr-row-${idx}`);
    const userNum = parseFloat(practice.userDosages[idx]);
    const isDosageExact = userNum === ingr.volume;

    if (isDosageExact) {
      correctDosagesCount++;
      if (rowEl) rowEl.style.borderColor = 'rgba(16, 185, 129, 0.5)';
      if (inputEl) {
        inputEl.style.borderColor = '#10b981';
        inputEl.style.color = '#34d399';
        inputEl.disabled = true;
      }
    } else {
      if (rowEl) rowEl.style.borderColor = 'rgba(239, 68, 68, 0.5)';
      if (inputEl) {
        inputEl.style.borderColor = '#ef4444';
        inputEl.style.color = '#f87171';
        inputEl.disabled = true;
      }
    }
  });

  const isMethodCorrect = Array.isArray(cocktail.method) 
    ? cocktail.method.includes(practice.selectedMethod)
    : practice.selectedMethod === cocktail.method;
  const isTypeCorrect = practice.selectedType === cocktail.type;
  const isTavCorrect = practice.selectedTav === cocktail.tav;
  const isGarnishCorrect = practice.selectedGarnish === cocktail.garnish;

  const isFullMastery = (correctDosagesCount === cocktail.ingredientsDetailed.length) && isMethodCorrect && isTypeCorrect && isTavCorrect && isGarnishCorrect;

  if (isFullMastery) {
    playSound('correct');
    if (!state.cocktailMastery) state.cocktailMastery = {};
    state.cocktailMastery[cocktail.id] = { completed: true, score: 100, timestamp: Date.now() };
    saveCocktailMasteryToStorage();
    renderModulesGrid();
  } else {
    playSound('wrong');
  }

  // Render Feedback Box
  const cIndex = APP_DATA.cocktails.findIndex(c => c.id === cocktail.id);
  const nextCocktail = APP_DATA.cocktails[(cIndex + 1) % APP_DATA.cocktails.length];

  const feedbackEl = document.getElementById('practice-feedback-box');
  if (feedbackEl) {
    feedbackEl.classList.remove('hidden');
    feedbackEl.innerHTML = `
      <div style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%); border: 1px solid ${isFullMastery ? '#10b981' : '#f59e0b'}; border-radius: var(--radius-md); padding: 18px; margin-top: 18px;">
        <div style="font-size: 1.1rem; font-weight: 800; color: ${isFullMastery ? '#34d399' : '#fbbf24'}; margin-bottom: 12px;">
          ${isFullMastery ? '🏆 Fiche Technique 100% Maîtrisée !' : '⚠️ Synthèse de la Fiche Officielle du Socle :'}
        </div>

        <div style="font-size: 0.88rem; color: #e2e8f0; line-height: 1.6; display: flex; flex-direction: column; gap: 8px;">
          <div>• <strong>Recette officielle :</strong> ${cocktail.ingredientsDetailed.map(i => `${i.volume} ${i.unit} ${i.name}`).join(', ')}</div>
          <div>• <strong>Méthode d’élaboration :</strong> ${Array.isArray(cocktail.method) ? cocktail.method.join(' ou ') : cocktail.method}</div>
          <div>• <strong>Catégorie & Type :</strong> ${cocktail.category} — ${cocktail.type}</div>
          <div>• <strong>Titre Alcoométrique Volumique :</strong> ${cocktail.tav}</div>
          <div>• <strong>Verrerie officielle :</strong> ${cocktail.glass}</div>
          <div>• <strong>Garniture :</strong> ${cocktail.garnish}</div>
          ${cocktail.history ? `<div style="color: var(--text-muted); font-size: 0.82rem; margin-top: 4px;">• <em>Histoire : ${cocktail.history}</em></div>` : ''}
        </div>

        <div style="display: flex; gap: 10px; margin-top: 18px; flex-wrap: wrap;">
          <button class="btn btn-secondary" style="flex: 1;" onclick="openModule7Hub()">
            ← Retour aux 36 Cocktails
          </button>
          <button class="btn btn-primary" style="flex: 1;" onclick="openCocktailPractice('${nextCocktail.id}')">
            Cocktail Suivant : ${nextCocktail.name} ➔
          </button>
        </div>
      </div>
    `;
    feedbackEl.scrollIntoView({ behavior: 'smooth' });
  }

  // Disable validate button
  const valBtn = document.getElementById('btn-validate-practice');
  if (valBtn) valBtn.classList.add('hidden');
}
