let questions = [];
let selectedQuestions = [];
let currentIdx = 0;
let selectedAnswer = null;
let answersLog = [];
let score = 0;

async function loadTestData() {
    const response = await fetch('chat-data.json');
    const data = await response.json();
    questions = data.questions;
    
    const simple = questions.filter(q => q.block === "Обычная переписка (Безопасно)");
    const hard = questions.filter(q => q.block === "Очевидное мошенничество (Легко определить)");
    const medium = questions.filter(q => q.block === "Скрытое мошенничество (Трудно определить)");
    
    selectedQuestions = [
        ...getRandomItems(simple, 2),
        ...getRandomItems(hard, 4),
        ...getRandomItems(medium, 4)
    ];
    shuffleArray(selectedQuestions);
    answersLog = [];
    selectedAnswer = null;
    
    document.getElementById('q-count').innerText = selectedQuestions.length;
    document.getElementById('test-title').innerText = "Тест: Чаты";
}

function getRandomItems(arr, count) {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function startTest() {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    renderQuestion();
}

function renderQuestion() {
    const q = selectedQuestions[currentIdx];
    const container = document.getElementById('question-content');
    const optionsBox = document.getElementById('options-list');
    
    container.innerHTML = `
        <h3>Вопрос ${currentIdx + 1}/${selectedQuestions.length}</h3>
        <p><strong>${q.situation}</strong></p>
        <hr>
        <p>${q.text}</p>
    `;
    
    optionsBox.innerHTML = '';
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'menu-btn option-btn';
        btn.style.padding = '15px';
        btn.style.display = 'block';
        btn.style.width = '100%';
        btn.style.marginBottom = '10px';
        btn.style.textAlign = 'left';
        btn.innerText = opt;
        btn.dataset.answerIndex = i;
        optionsBox.appendChild(btn);
    });
}

document.getElementById('options-list').addEventListener('click', function(e) {
    if (e.target.classList.contains('option-btn')) {
        const index = parseInt(e.target.dataset.answerIndex);
        selectedAnswer = index;
        document.querySelectorAll('.option-btn').forEach((el, i) => {
            el.classList.toggle('selected', i === index);
        });
    }
});

function nextQuestion() {
    const q = selectedQuestions[currentIdx];
    
    answersLog.push({
        q: q,
        userAnswer: selectedAnswer,
        wasCorrect: selectedAnswer === q.correct_answer_index
    });
    
    if (selectedAnswer === q.correct_answer_index) {
        score++;
    }
    
    selectedAnswer = null;
    currentIdx++;
    
    if (currentIdx < selectedQuestions.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    
    document.getElementById('score-text').innerText = `Вы ответили правильно на ${score} из ${selectedQuestions.length} вопросов.`;
    
    const explBox = document.getElementById('explanations');
    answersLog.forEach((ans, i) => {
        let optionsHtml = '';
        ans.q.options.forEach((opt, optIdx) => {
            const isCorrect = optIdx === ans.q.correct_answer_index;
            const isUserWrong = !isCorrect && ans.userAnswer === optIdx;
            
            if (isCorrect) {
                optionsHtml += `<div style="color: #10B981; font-weight: 600;">${String.fromCharCode(65 + optIdx)}. ${opt}</div>`;
            } else if (isUserWrong) {
                optionsHtml += `<div style="color: #EF4444;">${String.fromCharCode(65 + optIdx)}. ${opt}<br><span style="color: #6B7280; font-size: 0.875rem;">→ ${ans.q.explanation}</span></div>`;
            } else {
                optionsHtml += `<div>${String.fromCharCode(65 + optIdx)}. ${opt}</div>`;
            }
        });
        
        explBox.innerHTML += `
            <div style="margin-bottom: 16px; padding: 12px; border-left: 4px solid ${ans.wasCorrect ? '#10B981' : '#EF4444'}; background: #F9FAFB; border-radius: 8px;">
                <strong style="color: #1F2937;">Вопрос ${i+1}:</strong>
                <p style="margin: 8px 0; color: #4B5563;">${ans.q.situation}</p>
                <strong style="color: #1F2937;">Варианты:</strong>
                <div style="margin: 8px 0; line-height: 2;">${optionsHtml}</div>
                <strong style="color: #1F2937;">Правильный ответ:</strong>
                <span style="color: #10B981;">${String.fromCharCode(65 + ans.q.correct_answer_index)}. ${ans.q.options[ans.q.correct_answer_index]}</span>
                <p style="color: #6B7280; font-style: italic; margin-top: 8px;">${ans.q.explanation}</p>
            </div>
        `;
    });
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('options-list').addEventListener('click', function(e) {
        if (e.target.classList.contains('option-btn')) {
            const index = parseInt(e.target.dataset.answerIndex);
            selectedAnswer = index;
            document.querySelectorAll('.option-btn').forEach((el, i) => {
                el.classList.toggle('selected', i === index);
            });
        }
    });
    loadTestData();
});