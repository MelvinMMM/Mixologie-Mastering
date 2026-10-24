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
  verrerieFilter: 'all',
  scores: {}, // { moduleId: { bestScore: X, total: Y, timestamp: Z } }
  errorQuestionsPool: [], // Array of question IDs that were answered incorrectly
  cocktailMastery: {}, // { cocktailId: { completed: true, score: 100, timestamp: Z } }
  activeWriting: null,
  writingStats: { bestSprint: 0, bestAll36: 0, totalPlayed: 0 }
};

// Storage keys
const STORAGE_SCORES_KEY = 'mixology_master_scores_v1';
const STORAGE_ERRORS_KEY = 'mixology_master_errors_v1';
const STORAGE_MASTERY_KEY = 'mixology_cocktail_mastery_v1';
const STORAGE_WRITING_KEY = 'mixology_writing_challenge_v1';
const CURRENT_APP_VERSION = '1.2.0';
const STORAGE_SEEN_VERSION_KEY = 'mixology_release_notes_seen_version';

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
  if (typeof renderVerrerieGrid === 'function') {
    renderVerrerieGrid();
  }
  if (typeof updateWritingCardStatus === 'function') {
    updateWritingCardStatus();
  }
  renderLexiqueList();
  updateGlobalStatsDisplay();
  updateErrorsCountDisplay();
  if (typeof updateWritingCardStatus === 'function') {
    updateWritingCardStatus();
  }
  checkReleaseNotesOnStartup();
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
    const savedWriting = localStorage.getItem(STORAGE_WRITING_KEY);
    if (savedWriting) {
      state.writingStats = JSON.parse(savedWriting);
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
  state.writingStats = { bestSprint: 0, bestAll36: 0, totalPlayed: 0 };

  try {
    localStorage.removeItem(STORAGE_SCORES_KEY);
    localStorage.removeItem(STORAGE_ERRORS_KEY);
    localStorage.removeItem(STORAGE_MASTERY_KEY);
    localStorage.removeItem(STORAGE_WRITING_KEY);
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
  if (typeof renderVerrerieGrid === 'function') {
    renderVerrerieGrid();
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

  // Update desktop floating dock active state
  document.querySelectorAll('.dock-btn').forEach(btn => btn.classList.remove('active'));
  const activeDockBtn = document.getElementById(`dock-${viewId}`);
  if (activeDockBtn) {
    activeDockBtn.classList.add('active');
  }

  // Trigger view-specific renderers
  if (viewId === 'cocktails' && typeof renderCocktailsGrid === 'function') {
    renderCocktailsGrid();
  } else if (viewId === 'verrerie' && typeof renderVerrerieGrid === 'function') {
    renderVerrerieGrid();
  } else if (viewId === 'lexique' && typeof renderLexiqueList === 'function') {
    renderLexiqueList();
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
  const metricGlobalScore = document.getElementById('metric-global-score');
  const modulesCompletedGaugeNum = document.getElementById('modules-completed-gauge-num');
  const cocktailsMasteredGaugeNum = document.getElementById('cocktails-mastered-gauge-num');
  const metricCocktailsMastered = document.getElementById('metric-cocktails-mastered');
  const cocktailsProgressBar = document.getElementById('cocktails-progress-bar');
  const gaugeMastery = document.getElementById('gauge-circle-mastery');
  const gaugeModules = document.getElementById('gauge-circle-modules');
  const gaugeCocktails = document.getElementById('gauge-circle-cocktails');

  let completedModulesCount = 0;
  let totalScoreAcquired = 0;
  let totalQuestionsAnswered = 0;

  const masteredCocktailsCount = Object.keys(state.cocktailMastery || {}).filter(k => state.cocktailMastery[k]?.completed).length;

  APP_DATA.modules.forEach(mod => {
    if (mod.id === 7) {
      if (masteredCocktailsCount > 0) {
        completedModulesCount++;
        totalScoreAcquired += masteredCocktailsCount;
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

  // Text values
  if (globalScoreDisplay) globalScoreDisplay.textContent = percentage;
  if (metricGlobalScore) metricGlobalScore.textContent = `${percentage}%`;
  if (globalProgressBar) globalProgressBar.style.width = `${percentage}%`;
  
  if (modulesCompletedGaugeNum) modulesCompletedGaugeNum.textContent = completedModulesCount;
  if (modulesCompletedDisplay) modulesCompletedDisplay.innerHTML = `${completedModulesCount} <span>/ 9</span>`;
  if (modulesProgressBar) {
    const modPercentage = Math.round((completedModulesCount / 9) * 100);
    modulesProgressBar.style.width = `${modPercentage}%`;
  }

  if (cocktailsMasteredGaugeNum) cocktailsMasteredGaugeNum.textContent = masteredCocktailsCount;
  if (metricCocktailsMastered) metricCocktailsMastered.innerHTML = `${masteredCocktailsCount} <span>/ 36</span>`;
  if (cocktailsProgressBar) {
    const cockPercentage = Math.round((masteredCocktailsCount / 36) * 100);
    cocktailsProgressBar.style.width = `${cockPercentage}%`;
  }

  // SVG circular gauge animation (circumference = 2 * PI * 36 = ~226.19)
  const circumference = 226.2;
  if (gaugeMastery) {
    const offset = circumference * (1 - (percentage / 100));
    gaugeMastery.style.strokeDashoffset = offset;
  }
  if (gaugeModules) {
    const offset = circumference * (1 - (completedModulesCount / 9));
    gaugeModules.style.strokeDashoffset = offset;
  }
  if (gaugeCocktails) {
    const offset = circumference * (1 - (masteredCocktailsCount / 36));
    gaugeCocktails.style.strokeDashoffset = offset;
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
// STRING NORMALIZATION HELPER FOR SEARCH
// ==========================================

function normalizeSearchText(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, ' and ')
    .replace(/['’]/g, '')
    .replace(/-/g, ' ')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// ==========================================
// COCKTAILS EXPLORER & MEMO CARDS (36 RECETTES)
// ==========================================

function getGlassImagePath(glassName) {
  if (!glassName) return 'assets/verres/rocks.png';
  const g = glassName.toLowerCase();
  if (g.includes('rocks') || g.includes('old fashioned')) return 'assets/verres/rocks.png';
  if (g.includes('highball') || g.includes('tumbler')) return 'assets/verres/highball.png';
  if (g.includes('coupe')) return 'assets/verres/coupe.png';
  if (g.includes('nick')) return 'assets/verres/nick_nora.png';
  if (g.includes('martini')) return 'assets/verres/martini.png';
  if (g.includes('flûte') || g.includes('flute')) return 'assets/verres/flute.png';
  if (g.includes('vin')) return 'assets/verres/vin.png';
  if (g.includes('julep')) return 'assets/verres/julep.png';
  if (g.includes('mule')) return 'assets/verres/mule.png';
  if (g.includes('hurricane')) return 'assets/verres/hurricane.png';
  if (g.includes('shot')) return 'assets/verres/shot.png';
  if (g.includes('tiki')) return 'assets/verres/tiki.png';
  return 'assets/verres/rocks.png';
}

function renderCocktailsGrid() {
  const container = document.getElementById('cocktails-grid-container');
  if (!container || !APP_DATA.cocktails) return;

  const rawQuery = document.getElementById('cocktail-search-input')?.value || '';
  const normQuery = normalizeSearchText(rawQuery);
  const filter = state.cocktailFilter || 'all';

  const filtered = APP_DATA.cocktails.filter(c => {
    // 1. If filter pill is active and no search query was typed, apply strict pill filter
    if (!normQuery && filter !== 'all') {
      if (filter === 'short' && !normalizeSearchText(c.category).includes('short')) return false;
      if (filter === 'long' && !normalizeSearchText(c.category).includes('long')) return false;
      
      const ingredientsCombined = (c.ingredients || (c.ingredientsDetailed ? c.ingredientsDetailed.map(i => i.name) : [])).join(' ');
      const normIngr = normalizeSearchText(ingredientsCombined);

      if (filter === 'gin' && !normIngr.includes('gin')) return false;
      if (filter === 'vodka' && !normIngr.includes('vodka')) return false;
      if (filter === 'rhum' && !(normIngr.includes('rhum') || normIngr.includes('rum') || normIngr.includes('cachaca'))) return false;
      if (filter === 'whisky' && !(normIngr.includes('whisky') || normIngr.includes('whiskey') || normIngr.includes('bourbon') || normIngr.includes('scotch') || normIngr.includes('eau de vie brune'))) return false;
      if (filter === 'tequila' && !(normIngr.includes('tequila') || normIngr.includes('mezcal') || normIngr.includes('agave'))) return false;
    }

    // 2. If a search query is typed, match across name, ingredients, glass, profile, method, category, type, and history
    if (normQuery) {
      const normName = normalizeSearchText(c.name);
      const normGlass = normalizeSearchText(c.glass);
      const normProfile = normalizeSearchText(c.profile);
      const normMethod = Array.isArray(c.method) 
        ? c.method.map(m => normalizeSearchText(m)).join(' ')
        : normalizeSearchText(c.method);
      const normCategory = normalizeSearchText(c.category);
      const normType = normalizeSearchText(c.type);
      const ingList = c.ingredients || (c.ingredientsDetailed ? c.ingredientsDetailed.map(i => `${i.volume} ${i.unit} ${i.name}`) : []);
      const normIngredients = ingList.map(i => normalizeSearchText(i)).join(' ');
      const normHistory = normalizeSearchText(c.history || '');

      const match = normName.includes(normQuery) ||
                    normGlass.includes(normQuery) ||
                    normProfile.includes(normQuery) ||
                    normMethod.includes(normQuery) ||
                    normCategory.includes(normQuery) ||
                    normType.includes(normQuery) ||
                    normIngredients.includes(normQuery) ||
                    normHistory.includes(normQuery);

      return match;
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 40px 20px; grid-column: 1 / -1;">
        Aucun cocktail ne correspond à votre recherche « ${rawQuery} ».
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(c => {
    const ingPreview = c.ingredients || (c.ingredientsDetailed ? c.ingredientsDetailed.map(i => `${i.volume} ${i.unit} ${i.name}`) : []);
    const methodStr = Array.isArray(c.method) ? c.method.join(' ou ') : c.method;
    const glassImg = getGlassImagePath(c.glass);

    return `
      <div class="cocktail-card" onclick="openCocktailModal('${c.id}')">
        <div>
          <div class="cocktail-card-top">
            <h3 class="cocktail-name">${c.name}</h3>
            <span class="cocktail-tav-badge">${c.tav} ABV</span>
          </div>

          <div class="cocktail-glass-showcase">
            <img src="${glassImg}" alt="${c.glass}" class="cocktail-glass-img" loading="lazy">
          </div>

          <div class="cocktail-meta-row">
            <span class="meta-tag">🍸 ${c.category}</span>
            <span class="meta-tag">🥂 ${c.glass}</span>
            <span class="meta-tag">⚙️ ${methodStr}</span>
          </div>

          <div class="cocktail-ingredients-preview">
            ${ingPreview.slice(0, 3).join(' • ')}${ingPreview.length > 3 ? '...' : ''}
          </div>
        </div>

        <div class="cocktail-card-footer">
          <span class="cocktail-profile-tag">${c.profile}</span>
          <span class="cocktail-cta-btn">Voir la fiche ➔</span>
        </div>
      </div>
    `;
  }).join('');
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

  const rawQuery = document.getElementById('lexique-search-input')?.value || '';
  const normQuery = normalizeSearchText(rawQuery);

  const filtered = APP_DATA.lexique.filter(item => {
    if (!normQuery) return true;
    return normalizeSearchText(item.term).includes(normQuery) || normalizeSearchText(item.def).includes(normQuery);
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 30px 20px;">
        Aucun terme trouvé pour « ${rawQuery} ».
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
    if (modalId === 'modal-release-notes') {
      closeReleaseNotesModal();
    } else {
      document.getElementById(modalId).classList.remove('active');
    }
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

  const rawQuery = document.getElementById('m7-search-input')?.value || '';
  const normQuery = normalizeSearchText(rawQuery);

  const filterCocktail = (c) => {
    if (!normQuery) return true;
    const normName = normalizeSearchText(c.name);
    const normGlass = normalizeSearchText(c.glass);
    const normMethod = Array.isArray(c.method) ? c.method.map(m => normalizeSearchText(m)).join(' ') : normalizeSearchText(c.method);
    const ingList = c.ingredients || (c.ingredientsDetailed ? c.ingredientsDetailed.map(i => `${i.volume} ${i.unit} ${i.name}`) : []);
    const normIngredients = ingList.map(i => normalizeSearchText(i)).join(' ');
    return normName.includes(normQuery) || normGlass.includes(normQuery) || normMethod.includes(normQuery) || normIngredients.includes(normQuery);
  };

  const shortDrinks = APP_DATA.cocktails.filter(c => c.category === 'SHORT drink' && filterCocktail(c));
  const longDrinks = APP_DATA.cocktails.filter(c => c.category === 'LONG drink' && filterCocktail(c));

  const mastery = state.cocktailMastery || {};
  let masteredTotal = Object.keys(mastery).filter(k => mastery[k]?.completed).length;

  if (shortDrinks.length === 0) {
    shortContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">Aucun Short Drink correspondant.</div>`;
  } else {
    shortContainer.innerHTML = shortDrinks.map((c) => {
      const origIdx = APP_DATA.cocktails.findIndex(item => item.id === c.id);
      const isDone = mastery[c.id]?.completed;
      const methodStr = Array.isArray(c.method) ? c.method.join(' ou ') : c.method;
      return `
        <div class="m7-cocktail-item-card ${isDone ? 'mastered' : ''}" onclick="openCocktailPractice('${c.id}')">
          <div class="m7-card-left">
            <span class="m7-card-number">${origIdx + 1}.</span>
            <div>
              <div class="m7-card-name">${c.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${c.glass} • ${methodStr}</div>
            </div>
          </div>
          <span class="m7-card-badge-status ${isDone ? 'done' : ''}">
            ${isDone ? '✓ 100% Maîtrisé' : 'À compléter ➔'}
          </span>
        </div>
      `;
    }).join('');
  }

  if (longDrinks.length === 0) {
    longContainer.innerHTML = `<div style="text-align: center; color: var(--text-muted); padding: 20px;">Aucun Long Drink correspondant.</div>`;
  } else {
    longContainer.innerHTML = longDrinks.map((c) => {
      const origIdx = APP_DATA.cocktails.findIndex(item => item.id === c.id);
      const isDone = mastery[c.id]?.completed;
      const methodStr = Array.isArray(c.method) ? c.method.join(' ou ') : c.method;
      return `
        <div class="m7-cocktail-item-card ${isDone ? 'mastered' : ''}" onclick="openCocktailPractice('${c.id}')">
          <div class="m7-card-left">
            <span class="m7-card-number">${origIdx + 1}.</span>
            <div>
              <div class="m7-card-name">${c.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${c.glass} • ${methodStr}</div>
            </div>
          </div>
          <span class="m7-card-badge-status ${isDone ? 'done' : ''}">
            ${isDone ? '✓ 100% Maîtrisé' : 'À compléter ➔'}
          </span>
        </div>
      `;
    }).join('');
  }

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
          <div>• <strong>Recette officielle :</strong> ${cocktail.ingredients ? cocktail.ingredients.join(', ') : cocktail.ingredientsDetailed.map(i => `${i.volume} ${i.unit} ${i.name}`).join(', ')}</div>
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

// ==========================================
// VERRERIE & MATÉRIEL DU BARMAN (PARTIES 5 & 6)
// ==========================================

function getAllVerrerieAndMateriel() {
  const verres = (APP_DATA.verrerie || []).map(item => ({ ...item, isGlass: true }));
  const mat = (APP_DATA.materiel || []).map(item => ({ ...item, isGlass: false }));
  return [...verres, ...mat];
}

function setVerrerieFilter(filter) {
  playSound('click');
  state.verrerieFilter = filter;

  // Update pills
  const pills = document.querySelectorAll('#verrerie-filter-pills .filter-pill');
  pills.forEach(pill => pill.classList.remove('active'));
  const activePill = Array.from(pills).find(p => p.getAttribute('onclick')?.includes(`'${filter}'`));
  if (activePill) activePill.classList.add('active');

  renderVerrerieGrid();
}

function filterVerrerie() {
  renderVerrerieGrid();
}

function renderVerrerieGrid() {
  const container = document.getElementById('verrerie-grid-container');
  if (!container) return;

  const rawQuery = document.getElementById('verrerie-search-input')?.value || '';
  const normQuery = normalizeSearchText(rawQuery);
  const filter = state.verrerieFilter || 'all';

  const allItems = getAllVerrerieAndMateriel();

  const filtered = allItems.filter(item => {
    // 1. Category filter
    if (filter !== 'all') {
      if (filter === 'incontournable' && item.category !== 'incontournable') return false;
      if (filter === 'complementaire' && item.category !== 'complementaire') return false;
      if (filter === 'materiel' && item.category !== 'materiel') return false;
    }

    // 2. Search query filter
    if (normQuery) {
      const normName = normalizeSearchText(item.name);
      const normDesc = normalizeSearchText(item.description || '');
      const normCapacity = normalizeSearchText(item.capacity || '');
      const normUsage = normalizeSearchText(item.usage || '');
      const normCocktails = (item.cocktails || []).map(c => normalizeSearchText(c)).join(' ');

      const match = normName.includes(normQuery) ||
                    normDesc.includes(normQuery) ||
                    normCapacity.includes(normQuery) ||
                    normUsage.includes(normQuery) ||
                    normCocktails.includes(normQuery);
      return match;
    }

    return true;
  });

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--text-muted); padding: 40px 20px; grid-column: 1 / -1;">
        Aucun verre ni matériel ne correspond à votre recherche « ${rawQuery} ».
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => {
    const badgeClass = item.category === 'incontournable' 
      ? 'incontournable' 
      : item.category === 'complementaire' 
        ? 'complementaire' 
        : 'materiel';
    
    const chipsHtml = (item.cocktails || []).slice(0, 3).map(c => 
      `<span class="verrerie-chip">${c}</span>`
    ).join('') + ((item.cocktails || []).length > 3 ? `<span class="verrerie-chip">+${item.cocktails.length - 3}</span>` : '');

    return `
      <div class="verrerie-card" onclick="openVerrerieModal('${item.id}')">
        <div>
          <div class="verrerie-card-img-wrap">
            <img src="${item.image}" alt="${item.name}" loading="lazy" onerror="this.style.display='none'">
          </div>

          <span class="verrerie-badge-tag ${badgeClass}">
            ${item.partie === 5 ? 'Partie 5 • ' : 'Partie 6 • '}${item.categoryLabel}
          </span>

          <h3 class="verrerie-card-title">${item.name}</h3>
          
          <div class="verrerie-capacity-badge">
            <span>${item.partie === 5 ? '📏 Contenance :' : '⚙️ Spécification :'}</span>
            <span>${item.capacity}</span>
          </div>

          <p class="verrerie-desc-preview">${item.description}</p>
        </div>

        <div>
          <div class="verrerie-cocktails-chips" style="margin-top: 10px;">
            ${chipsHtml}
          </div>
          <div style="display: flex; justify-content: flex-end; margin-top: 14px;">
            <span style="font-size: 0.78rem; font-weight: 700; color: #38bdf8;">Voir la fiche ➔</span>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function openVerrerieModal(itemId) {
  playSound('click');
  const allItems = getAllVerrerieAndMateriel();
  const item = allItems.find(i => i.id === itemId);
  if (!item) return;

  const content = document.getElementById('verrerie-detail-content');
  const modal = document.getElementById('modal-verrerie');
  if (!content || !modal) return;

  const badgeClass = item.category === 'incontournable' 
    ? 'incontournable' 
    : item.category === 'complementaire' 
      ? 'complementaire' 
      : 'materiel';

  const cocktailsListHtml = (item.cocktails || []).map(c => 
    `<li style="margin-bottom: 4px;">• <strong>${c}</strong></li>`
  ).join('');

  content.innerHTML = `
    <button class="modal-close-btn" onclick="closeVerrerieModal()">✕</button>

    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
      <span class="verrerie-badge-tag ${badgeClass}">
        Partie ${item.partie} du Socle • ${item.categoryLabel}
      </span>
    </div>

    <h2 style="font-size: 1.4rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
      ${item.name}
    </h2>

    <div style="font-size: 0.88rem; color: var(--text-accent); font-weight: 700; margin-bottom: 14px;">
      ${item.partie === 5 ? 'Contenance officielle :' : 'Spécification officielle :'} ${item.capacity}
    </div>

    <div class="verrerie-card-img-wrap" style="height: 190px; margin-bottom: 16px;">
      <img src="${item.image}" alt="${item.name}" class="verrerie-modal-img" onerror="this.style.display='none'">
    </div>

    <div style="background: rgba(255, 255, 255, 0.04); border-left: 3px solid #38bdf8; padding: 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
      <div style="font-size: 0.82rem; font-weight: 800; text-transform: uppercase; color: #38bdf8; letter-spacing: 0.05em; margin-bottom: 6px;">
        📖 Description & Rôle Technique
      </div>
      <p style="font-size: 0.88rem; color: #e2e8f0; line-height: 1.55;">
        ${item.description}
      </p>
    </div>

    ${item.usage ? `
      <div style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid #f59e0b; padding: 12px 14px; border-radius: var(--radius-md); margin-bottom: 16px;">
        <div style="font-size: 0.82rem; font-weight: 800; text-transform: uppercase; color: #fbbf24; letter-spacing: 0.05em; margin-bottom: 4px;">
          🎯 Usage en Service
        </div>
        <p style="font-size: 0.86rem; color: #e2e8f0;">
          ${item.usage}
        </p>
      </div>
    ` : ''}

    ${(item.cocktails && item.cocktails.length > 0) ? `
      <div style="background: rgba(16, 185, 129, 0.08); border-left: 3px solid #10b981; padding: 12px 14px; border-radius: var(--radius-md); margin-bottom: 20px;">
        <div style="font-size: 0.82rem; font-weight: 800; text-transform: uppercase; color: #34d399; letter-spacing: 0.05em; margin-bottom: 6px;">
          🍹 Exemples de Cocktails & Applications
        </div>
        <ul style="list-style: none; padding: 0; margin: 0; font-size: 0.86rem; color: #cbd5e1;">
          ${cocktailsListHtml}
        </ul>
      </div>
    ` : ''}

    <button class="btn btn-secondary" style="width: 100%;" onclick="closeVerrerieModal()">
      Fermer la fiche
    </button>
  `;

  modal.classList.add('active');
}

function closeVerrerieModal() {
  playSound('click');
  const modal = document.getElementById('modal-verrerie');
  if (modal) modal.classList.remove('active');
}



// ==========================================
// DÉFI DE L'ÉCRITURE — SPEAKEASY RECITATION CHALLENGE
// ==========================================

function saveWritingStatsToStorage() {
  try {
    localStorage.setItem(STORAGE_WRITING_KEY, JSON.stringify(state.writingStats));
  } catch (e) {
    console.warn('LocalStorage writing save error:', e);
  }
}

function updateWritingCardStatus() {
  const el = document.getElementById('writing-challenge-card-status');
  if (!el) return;
  const stats = state.writingStats || {};
  if (stats.bestSprint > 0 || stats.bestAll36 > 0) {
    if (stats.bestAll36 > 0) {
      el.textContent = `Record Grand Chelem : ${stats.bestAll36} sur 36`;
    } else {
      el.textContent = `Record Sprint : ${stats.bestSprint} sur 10`;
    }
  } else {
    el.textContent = '36 classiques du socle';
  }
}

function openWritingChallengeHub() {
  playSound('click');
  navigateTo('writing-challenge');
  renderWritingChallengeHub();
}

function renderWritingChallengeHub() {
  const container = document.getElementById('writing-challenge-content');
  if (!container) return;

  const stats = state.writingStats || { bestSprint: 0, bestAll36: 0, totalPlayed: 0 };

  container.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
      <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.82rem;" onclick="navigateTo('home')">
        ← Retour aux modules
      </button>
      <span class="module-number-badge" style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border-color: rgba(245, 158, 11, 0.3);">
        Mode Écriture
      </span>
    </div>

    <div class="writing-hub-hero">
      <div style="font-size: 2.8rem; filter: drop-shadow(0 4px 12px rgba(245, 158, 11, 0.4));">✍️</div>
      <h2 style="font-family: var(--font-display); font-size: 1.8rem; font-weight: 800; color: #ffffff; margin: 0;">
        Le Défi de l'Écriture
      </h2>
      <p style="font-size: 0.95rem; color: #cbd5e1; max-width: 560px; margin: 0 auto; line-height: 1.55;">
        Testez votre mémoire de barman : à partir des dosages, du verre, de la méthode et de la garniture, écrivez sans faute le nom officiel exact du cocktail classique.
      </p>

      ${stats.totalPlayed > 0 ? `
        <div style="display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 4px;">
          <span class="writing-stat-badge gold">⭐ Record Sprint : ${stats.bestSprint} sur 10</span>
          ${stats.bestAll36 > 0 ? `<span class="writing-stat-badge gold">🏆 Record Grand Chelem : ${stats.bestAll36} sur 36</span>` : ''}
          <span class="writing-stat-badge">🎮 Sessions jouées : ${stats.totalPlayed}</span>
        </div>
      ` : ''}

      <div class="writing-modes-grid">
        <!-- Mode 1 : Sprint 10 -->
        <div class="writing-mode-card" onclick="startWritingChallenge('sprint10')">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 1.8rem;">⚡</span>
              <span class="module-number-badge" style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-color: rgba(56, 189, 248, 0.3);">
                Rapide
              </span>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin-bottom: 6px;">
              Sprint 10 Cocktails
            </h3>
            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45;">
              Une sélection aléatoire de 10 recettes cultes du socle officiel pour un entraînement rapide et dynamique.
            </p>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 6px;">
            <span style="font-size: 0.78rem; color: #fbbf24; font-weight: 700;">10 questions</span>
            <span class="module-start-btn">Démarrer ➔</span>
          </div>
        </div>

        <!-- Mode 2 : Grand Chelem 36 -->
        <div class="writing-mode-card" style="border-color: rgba(212, 175, 55, 0.45); background: linear-gradient(180deg, rgba(212, 175, 55, 0.08) 0%, rgba(14, 18, 27, 0.75) 100%);" onclick="startWritingChallenge('all36')">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 1.8rem;">🏆</span>
              <span class="module-number-badge" style="background: rgba(245, 158, 11, 0.2); color: #fbbf24; border-color: rgba(245, 158, 11, 0.4);">
                Élite
              </span>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #fbbf24; margin-bottom: 6px;">
              Le Grand Chelem
            </h3>
            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45;">
              L'intégralité des 36 cocktails du référentiel officiel 2025 / 2026. L'épreuve suprême de récitation.
            </p>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 6px;">
            <span style="font-size: 0.78rem; color: #fbbf24; font-weight: 700;">36 fiches complètes</span>
            <span class="module-start-btn">Relever l'épreuve ➔</span>
          </div>
        </div>

        <!-- Mode 3 : Short Drinks -->
        <div class="writing-mode-card" onclick="startWritingChallenge('short')">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 1.8rem;">🍸</span>
              <span class="module-number-badge" style="background: rgba(16, 185, 129, 0.15); color: #34d399; border-color: rgba(16, 185, 129, 0.3);">
                Short Drinks
              </span>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin-bottom: 6px;">
              Les 18 Short Drinks
            </h3>
            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45;">
              Entraînez-vous exclusivement sur les cocktails courts servis avec moins de 100 ml au verre.
            </p>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 6px;">
            <span style="font-size: 0.78rem; color: #34d399; font-weight: 700;">18 cocktails</span>
            <span class="module-start-btn">Démarrer ➔</span>
          </div>
        </div>

        <!-- Mode 4 : Long Drinks -->
        <div class="writing-mode-card" onclick="startWritingChallenge('long')">
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
              <span style="font-size: 1.8rem;">🍹</span>
              <span class="module-number-badge" style="background: rgba(244, 63, 94, 0.15); color: #fb7185; border-color: rgba(244, 63, 94, 0.3);">
                Long Drinks
              </span>
            </div>
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #ffffff; margin-bottom: 6px;">
              Les 18 Long Drinks
            </h3>
            <p style="font-size: 0.82rem; color: var(--text-muted); line-height: 1.45;">
              Entraînez-vous sur les cocktails allongés servis avec 100 ml ou plus au verre.
            </p>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 6px;">
            <span style="font-size: 0.78rem; color: #fb7185; font-weight: 700;">18 cocktails</span>
            <span class="module-start-btn">Démarrer ➔</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function startWritingChallenge(mode = 'sprint10') {
  playSound('click');
  let pool = [...APP_DATA.cocktails];

  if (mode === 'short') {
    pool = pool.filter(c => c.category === 'SHORT drink');
  } else if (mode === 'long') {
    pool = pool.filter(c => c.category === 'LONG drink');
  }

  // Shuffle pool with Fisher-Yates
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  if (mode === 'sprint10') {
    pool = pool.slice(0, 10);
  }

  state.activeWriting = {
    cocktails: pool,
    currentIndex: 0,
    score: 0,
    streak: 0,
    answered: false,
    userAnswer: '',
    revealedHint: false,
    mode: mode,
    history: []
  };

  navigateTo('writing-challenge');
  renderWritingChallengeStep();
}

function checkCocktailSpelling(userInput, cocktail) {
  const normInput = normalizeSearchText(userInput);
  if (!normInput) return false;

  const normOfficial = normalizeSearchText(cocktail.name);
  if (normInput === normOfficial) return true;

  const aliasesMap = {
    'aviation': ['aviation'],
    'bamboo': ['bamboo'],
    'bramble': ['bramble'],
    'caipirinha': ['caipirinha', 'caipirinia'],
    'cosmopolitan': ['cosmopolitan', 'cosmo'],
    'daiquiri': ['daiquiri', 'daquiri'],
    'dry martini': ['dry martini', 'martini dry', 'classic martini'],
    'espresso martini': ['espresso martini', 'expresso martini'],
    'gin basil smash': ['gin basil smash', 'basil smash'],
    'manhattan': ['manhattan'],
    'margarita': ['margarita'],
    'mint julep': ['mint julep', 'julep'],
    'negroni': ['negroni'],
    'old-fashioned': ['old fashioned', 'oldfashioned', 'old fashion'],
    'penicillin': ['penicillin', 'penicilline'],
    'pornstar martini': ['pornstar martini', 'porn star martini', 'pornstar'],
    'sidecar': ['sidecar', 'side car'],
    'sour': ['sour', 'whiskey sour', 'whisky sour'],
    'americano': ['americano'],
    'bellini': ['bellini'],
    'bloody mary': ['bloody mary'],
    'champagne cocktail': ['champagne cocktail'],
    'dark and stormy': ['dark and stormy', 'dark & stormy', 'dark n stormy', 'dark stormy'],
    'fizz': ['fizz', 'gin fizz'],
    'french 75': ['french 75', 'french75', 'soixante quinze'],
    'horses neck': ['horses neck', 'horse neck'],
    'mai tai': ['mai tai', 'maitai'],
    'mojito': ['mojito'],
    'moscow mule': ['moscow mule'],
    'paloma': ['paloma'],
    'pina colada': ['pina colada', 'pinacolada'],
    'planters punch': ['planters punch', 'planter punch'],
    'rum swizzle': ['rum swizzle', 'rhum swizzle'],
    'sex on the beach': ['sex on the beach'],
    'spritz': ['spritz', 'venetian spritz', 'aperol spritz'],
    'tequila sunrise': ['tequila sunrise']
  };

  const list = aliasesMap[normOfficial] || [normOfficial];
  return list.some(alias => normalizeSearchText(alias) === normInput);
}

function generateCocktailMask(name) {
  return name.split(' ').map(word => {
    if (word.length <= 1) return word;
    return word[0] + ' ' + '_ '.repeat(word.length - 1).trim();
  }).join('   ');
}

function renderWritingChallengeStep() {
  const container = document.getElementById('writing-challenge-content');
  const active = state.activeWriting;
  if (!container || !active) return;

  const cocktail = active.cocktails[active.currentIndex];
  if (!cocktail) {
    renderWritingChallengeResults();
    return;
  }

  const progressPct = Math.round(((active.currentIndex) / active.cocktails.length) * 100);
  const methodStr = Array.isArray(cocktail.method) ? cocktail.method.join(' ou ') : cocktail.method;
  const ingredientsList = cocktail.ingredients || (cocktail.ingredientsDetailed ? cocktail.ingredientsDetailed.map(i => `${i.volume} ${i.unit} ${i.name}`) : []);

  container.innerHTML = `
    <!-- Top Bar Navigation -->
    <div class="writing-top-bar">
      <button class="btn btn-secondary" style="padding: 6px 14px; font-size: 0.82rem;" onclick="confirmExitWritingChallenge()">
        ✕ Quitter le défi
      </button>

      <div class="writing-stats-row">
        <span class="writing-stat-badge gold">
          ⭐ Score : ${active.score} sur ${active.cocktails.length}
        </span>
        ${active.streak > 1 ? `
          <span class="writing-stat-badge fire">
            🔥 Série : ${active.streak}
          </span>
        ` : ''}
      </div>

      <div class="quiz-counter" style="font-size: 0.85rem; font-weight: 800; color: var(--text-accent);">
        Cocktail ${active.currentIndex + 1} sur ${active.cocktails.length}
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="quiz-progress-track">
      <div class="quiz-progress-fill" style="width: ${progressPct}%; background: var(--gold-gradient);"></div>
    </div>

    <!-- Main Clue Card -->
    <div class="writing-card-box" id="writing-card-box">
      <div class="writing-card-header">
        <div>
          <div class="writing-mystery-title">
            <span>🍸</span> Cocktail Mystère N° ${active.currentIndex + 1}
          </div>
          <div class="writing-mystery-subtitle">
            Déchiffrez les éléments ci-dessous et saisissez le nom exact de ce classique.
          </div>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
          <span class="module-number-badge" style="background: rgba(244, 63, 94, 0.15); color: #fb7185; border-color: rgba(244, 63, 94, 0.3);">
            ${cocktail.category}
          </span>
          <span class="cocktail-tav-badge" style="font-size: 0.8rem; padding: 4px 10px;">
            TAV ${cocktail.tav}
          </span>
        </div>
      </div>

      <!-- Bento Clues Grid -->
      <div class="writing-clues-grid">
        <!-- Box 1 : Ingrédients & Dosages -->
        <div class="writing-clue-box">
          <div class="writing-clue-box-title">
            <span>📝</span> Ingrédients & Dosages Officiels
          </div>
          <ul class="writing-ingredients-list">
            ${ingredientsList.map(ing => `
              <li class="writing-ingredient-item">
                <span style="color: #fbbf24; font-weight: 800;">•</span>
                <span>${ing}</span>
              </li>
            `).join('')}
          </ul>
        </div>

        <!-- Box 2 : Caractéristiques de Service -->
        <div class="writing-clue-box">
          <div class="writing-clue-box-title">
            <span>⚙️</span> Fiche Technique de Service
          </div>
          <div class="writing-specs-list">
            <div class="writing-spec-row">
              <span class="writing-spec-label">⏰ Moment de dégustation</span>
              <span class="writing-spec-value">${cocktail.type}</span>
            </div>
            <div class="writing-spec-row">
              <span class="writing-spec-label">🥄 Méthode d'élaboration</span>
              <span class="writing-spec-value">${methodStr}</span>
            </div>
            <div class="writing-spec-row">
              <span class="writing-spec-label">🥂 Verrerie officielle</span>
              <span class="writing-spec-value">${cocktail.glass}</span>
            </div>
            <div class="writing-spec-row">
              <span class="writing-spec-label">🍒 Garniture & Décoration</span>
              <span class="writing-spec-value">${cocktail.garnish}</span>
            </div>
            <div class="writing-spec-row">
              <span class="writing-spec-label">🧊 Glaçons</span>
              <span class="writing-spec-value">${cocktail.ice || 'Sans glace'}</span>
            </div>
            ${cocktail.profile ? `
              <div class="writing-spec-row">
                <span class="writing-spec-label">👅 Profil gustatif</span>
                <span class="writing-spec-value" style="color: #e6c280;">${cocktail.profile}</span>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Input Area -->
      <div class="writing-input-section" id="writing-input-section">
        <label for="writing-answer-input" class="writing-input-label">
          <span>✍️</span> Quel est le nom exact de ce cocktail classique ?
        </label>
        
        <div class="writing-input-row">
          <input 
            type="text" 
            id="writing-answer-input" 
            class="writing-input-field" 
            placeholder="Écrivez le nom officiel du cocktail..." 
            autocomplete="off" 
            autocorrect="off" 
            spellcheck="false"
          >
          <button class="btn btn-primary" id="btn-validate-writing" onclick="validateWritingAnswer()" style="padding: 14px 24px; font-weight: 800; white-space: nowrap;">
            Valider ➔
          </button>
        </div>

        <div class="writing-actions-row">
          <div id="writing-hint-container">
            <button class="btn btn-secondary" style="font-size: 0.8rem; padding: 6px 12px;" onclick="revealWritingHint()">
              💡 Demander un indice
            </button>
          </div>
          <span style="font-size: 0.76rem; color: var(--text-muted);">
            Astuce : appuyez sur la touche Entrée pour valider directement
          </span>
        </div>
      </div>

      <!-- Feedback Area (injected on validation) -->
      <div id="writing-feedback-area" class="hidden"></div>
    </div>
  `;

  const inputEl = document.getElementById('writing-answer-input');
  if (inputEl) {
    inputEl.focus();
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        if (!state.activeWriting.answered) {
          validateWritingAnswer();
        } else {
          handleWritingNextStep();
        }
      }
    });
  }
}

function revealWritingHint() {
  playSound('click');
  const active = state.activeWriting;
  if (!active || active.answered) return;
  const cocktail = active.cocktails[active.currentIndex];
  if (!cocktail) return;

  active.revealedHint = true;
  const hintContainer = document.getElementById('writing-hint-container');
  if (hintContainer) {
    const mask = generateCocktailMask(cocktail.name);
    hintContainer.innerHTML = `
      <div class="writing-hint-display">
        <span>💡 Indice :</span>
        <strong style="color: #fbbf24;">${mask}</strong>
      </div>
    `;
  }
}

function validateWritingAnswer() {
  const active = state.activeWriting;
  if (!active || active.answered) return;

  const inputEl = document.getElementById('writing-answer-input');
  if (!inputEl) return;

  const rawVal = inputEl.value.trim();
  if (!rawVal) {
    inputEl.focus();
    inputEl.style.borderColor = '#f59e0b';
    setTimeout(() => {
      inputEl.style.borderColor = '';
    }, 800);
    return;
  }

  active.answered = true;
  active.userAnswer = rawVal;
  const cocktail = active.cocktails[active.currentIndex];
  const isMatch = checkCocktailSpelling(rawVal, cocktail);

  const cardBox = document.getElementById('writing-card-box');
  const feedbackArea = document.getElementById('writing-feedback-area');
  const valBtn = document.getElementById('btn-validate-writing');

  inputEl.disabled = true;
  if (valBtn) valBtn.classList.add('hidden');

  if (isMatch) {
    playSound('correct');
    active.score++;
    active.streak++;
    inputEl.classList.add('input-correct');
    if (cardBox) cardBox.classList.add('state-correct');

    active.history.push({
      cocktailId: cocktail.id,
      cocktailName: cocktail.name,
      userAnswer: rawVal,
      isCorrect: true
    });

    if (feedbackArea) {
      feedbackArea.classList.remove('hidden');
      feedbackArea.innerHTML = `
        <div class="writing-feedback-banner correct">
          <div class="writing-feedback-title correct">
            <span>🎉</span> Excellente réponse ! C'est exactement le ${cocktail.name.toUpperCase()} !
          </div>
          <div style="font-size: 0.88rem; color: #e2e8f0; line-height: 1.55;">
            Orthographe et recette maîtrisées avec précision. Bravo pour cette récitation sans faute.
          </div>
          <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" style="flex: 1;" onclick="handleWritingNextStep()">
              ${active.currentIndex + 1 < active.cocktails.length ? 'Cocktail Suivant ➔' : 'Découvrir mon Bilan Final ➔'}
            </button>
            <button class="btn btn-secondary" onclick="openCocktailModal('${cocktail.id}')">
              📖 Voir la fiche technique
            </button>
          </div>
        </div>
      `;
    }
  } else {
    playSound('wrong');
    active.streak = 0;
    inputEl.classList.add('input-wrong');
    if (cardBox) cardBox.classList.add('state-wrong');

    active.history.push({
      cocktailId: cocktail.id,
      cocktailName: cocktail.name,
      userAnswer: rawVal,
      isCorrect: false
    });

    if (feedbackArea) {
      feedbackArea.classList.remove('hidden');
      feedbackArea.innerHTML = `
        <div class="writing-feedback-banner wrong">
          <div class="writing-feedback-title wrong">
            <span>❌</span> Ce n'est pas tout à fait la bonne réponse !
          </div>
          <div style="font-size: 0.92rem; color: #ffffff; line-height: 1.55;">
            • La bonne réponse était : <strong style="color: #fbbf24; font-size: 1.05rem;">${cocktail.name}</strong><br>
            • Vous aviez saisi : <span style="color: #fb7185; font-style: italic;">« ${rawVal} »</span>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;">
            <button class="btn btn-primary" style="flex: 1;" onclick="handleWritingNextStep()">
              ${active.currentIndex + 1 < active.cocktails.length ? 'Cocktail Suivant ➔' : 'Découvrir mon Bilan Final ➔'}
            </button>
            <button class="btn btn-secondary" onclick="openCocktailModal('${cocktail.id}')">
              📖 Consulter la fiche officielle
            </button>
          </div>
        </div>
      `;
    }
  }

  feedbackArea?.scrollIntoView({ behavior: 'smooth' });
}

function handleWritingNextStep() {
  playSound('click');
  const active = state.activeWriting;
  if (!active) return;

  active.currentIndex++;
  active.answered = false;
  active.userAnswer = '';
  active.revealedHint = false;

  if (active.currentIndex < active.cocktails.length) {
    renderWritingChallengeStep();
  } else {
    renderWritingChallengeResults();
  }
}

function confirmExitWritingChallenge() {
  playSound('click');
  if (confirm('Voulez-vous vraiment quitter ce défi en cours ?')) {
    openWritingChallengeHub();
  }
}

function renderWritingChallengeResults() {
  const container = document.getElementById('writing-challenge-content');
  const active = state.activeWriting;
  if (!container || !active) return;

  const total = active.cocktails.length;
  const score = active.score;
  const percentage = Math.round((score / total) * 100);

  // Update stats
  if (!state.writingStats) state.writingStats = { bestSprint: 0, bestAll36: 0, totalPlayed: 0 };
  state.writingStats.totalPlayed++;

  if (active.mode === 'sprint10') {
    state.writingStats.bestSprint = Math.max(state.writingStats.bestSprint, score);
  } else if (active.mode === 'all36') {
    state.writingStats.bestAll36 = Math.max(state.writingStats.bestAll36, score);
  }

  saveWritingStatsToStorage();
  updateWritingCardStatus();

  let rankTitle = 'Apprenti en Formation';
  let rankIcon = '📚';
  let rankDesc = 'Continuez à réviser régulièrement les 36 fiches techniques pour mémoriser parfaitement chaque recette.';

  if (percentage === 100) {
    rankTitle = 'Maître Mixologue Immortel';
    rankIcon = '🏆';
    rankDesc = 'Score parfait ! Votre mémoire et votre connaissance des cocktails classiques du référentiel sont irréprochables.';
    playSound('correct');
  } else if (percentage >= 80) {
    rankTitle = 'Chef Barman d’Élite';
    rankIcon = '⭐';
    rankDesc = 'Excellente performance ! Vous maîtrisez les recettes du socle avec une grande régularité.';
    playSound('correct');
  } else if (percentage >= 60) {
    rankTitle = 'Barman Confirmé';
    rankIcon = '🍸';
    rankDesc = 'Un solide niveau de connaissances. Encore quelques détails de recettes à peaufiner pour viser la perfection.';
  }

  container.innerHTML = `
    <div class="results-card" style="max-width: 680px; margin: 0 auto; animation: fadeIn 0.35s ease;">
      <div class="results-trophy">${rankIcon}</div>
      <h2 class="results-title">${rankTitle}</h2>
      <p class="results-subtitle">${rankDesc}</p>

      <div class="score-display-circle" style="margin: 20px auto;">
        <div class="score-number">${score} / ${total}</div>
        <div class="score-total">${percentage} % de Réussite</div>
      </div>

      <!-- Recap List of Cocktails -->
      <div style="text-align: left; margin: 24px 0 20px 0;">
        <h4 style="font-size: 0.95rem; font-weight: 800; color: #fbbf24; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <span>📋</span> Bilan détaillé de votre session :
        </h4>
        <div style="display: flex; flex-direction: column; gap: 8px; max-height: 280px; overflow-y: auto; padding-right: 6px;">
          ${active.history.map(item => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255, 255, 255, 0.03); border: 1px solid ${item.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}; border-radius: var(--radius-sm);">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.1rem;">${item.isCorrect ? '✅' : '❌'}</span>
                <div>
                  <div style="font-weight: 700; color: #ffffff; font-size: 0.92rem;">
                    ${item.cocktailName}
                  </div>
                  <div style="font-size: 0.78rem; color: ${item.isCorrect ? '#34d399' : '#fb7185'};">
                    Votre réponse : « ${item.userAnswer} »
                  </div>
                </div>
              </div>
              <button class="btn btn-secondary" style="font-size: 0.72rem; padding: 4px 8px;" onclick="openCocktailModal('${item.cocktailId}')">
                Fiche ➔
              </button>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="results-actions-grid">
        <button class="btn btn-primary" onclick="startWritingChallenge('${active.mode}')">
          ▶ Rejouer ce mode
        </button>
        <button class="btn btn-secondary" onclick="openWritingChallengeHub()">
          ✍️ Choisir un autre mode
        </button>
        <button class="btn btn-secondary" style="grid-column: 1 / -1;" onclick="navigateTo('home')">
          🏠 Retour à l'accueil
        </button>
      </div>
    </div>
  `;
}


// ==========================================
// POPUP NOUVEAUTÉS & RELEASE NOTES V1.2.0
// ==========================================

function checkReleaseNotesOnStartup() {
  try {
    const seenVersion = localStorage.getItem(STORAGE_SEEN_VERSION_KEY);
    if (seenVersion !== CURRENT_APP_VERSION) {
      setTimeout(() => {
        openReleaseNotesModal();
      }, 550);
    }
  } catch (e) {
    console.warn('LocalStorage version check error:', e);
  }
}

function openReleaseNotesModal() {
  playSound('click');
  const modal = document.getElementById('modal-release-notes');
  if (modal) modal.classList.add('active');
}

function closeReleaseNotesModal() {
  playSound('click');
  const modal = document.getElementById('modal-release-notes');
  if (modal) modal.classList.remove('active');
  try {
    localStorage.setItem(STORAGE_SEEN_VERSION_KEY, CURRENT_APP_VERSION);
  } catch (e) {
    console.warn('LocalStorage save version error:', e);
  }
}
