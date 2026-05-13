let questions = [];
let selectedQuestions = [];
let currentIdx = 0;
let selectedAnswer = null;
let answersLog = [];
let score = 0;

async function loadQuiz() {
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
    score = 0;
    
    document.getElementById('progress-fill').style.width = '0%';
    renderQuestion();
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

function renderQuestion() {
    const q = selectedQuestions[currentIdx];
    
    document.getElementById('quiz-title').textContent = 'Общение в сети';
    document.getElementById('question-number').textContent = `Вопрос ${currentIdx + 1} из ${selectedQuestions.length}`;
    document.getElementById('situation-text').textContent = `Ситуация: ${q.situation}`;
    document.getElementById('question-text').textContent = q.text;
    
    const container = document.getElementById('options-container');
    container.innerHTML = '';
    
    q.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-btn';
        btn.dataset.index = i;
        btn.innerHTML = `
            <span class="marker">${String.fromCharCode(65 + i)}</span>
            <span class="text">${opt}</span>
        `;
        if (selectedAnswer === i) btn.classList.add('selected');
        container.appendChild(btn);
    });
    
    const pct = ((currentIdx + 1) / selectedQuestions.length) * 100;
    document.getElementById('progress-fill').style.width = pct + '%';
    document.getElementById('next-btn').disabled = selectedAnswer === null;
}

document.getElementById('options-container').addEventListener('click', function(e) {
    const btn = e.target.closest('.option-btn');
    if (!btn) return;
    
    selectedAnswer = parseInt(btn.dataset.index);
    
    document.querySelectorAll('.option-btn').forEach((el, i) => {
        el.classList.toggle('selected', i === selectedAnswer);
        if (i === selectedAnswer) {
            el.animate([
                { transform: 'scale(1)' },
                { transform: 'scale(0.95)' },
                { transform: 'scale(1)' }
            ], {
                duration: 200,
                easing: 'ease-out'
            });
        }
    });
    
    document.getElementById('next-btn').disabled = false;
});

function nextQuestion() {
    const q = selectedQuestions[currentIdx];
    
    answersLog.push({
        q: q,
        userAnswer: selectedAnswer,
        wasCorrect: selectedAnswer === q.correct_answer_index
    });
    
    if (selectedAnswer === q.correct_answer_index) score++;
    selectedAnswer = null;
    currentIdx++;
    
    if (currentIdx < selectedQuestions.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.querySelector('.quiz-overlay').style.display = 'none';
    document.getElementById('results-modal').style.display = 'flex';
    
    const percentage = Math.round((score / selectedQuestions.length) * 100);
    
    // Create chart
    const ctx = document.getElementById('score-chart').getContext('2d');
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Правильно', 'Ошибки'],
            datasets: [{
                data: [score, selectedQuestions.length - score],
                backgroundColor: ['#10B981', '#E5E7EB'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            cutout: '75%',
            plugins: {
                legend: { display: false }
            }
        }
    });
    
    document.getElementById('score-text').textContent = `Вы набрали ${score} из ${selectedQuestions.length} баллов (${percentage}%)`;
    
    const review = document.getElementById('review-container');
    review.innerHTML = '';
    answersLog.forEach((ans, i) => {
        const div = document.createElement('div');
        div.className = 'review-item-modal';
        
        let optionsHtml = '';
        ans.q.options.forEach((opt, optIdx) => {
            const isCorrect = optIdx === ans.q.correct_answer_index;
            const isUserWrong = !isCorrect && ans.userAnswer === optIdx;
            
            if (isCorrect) {
                optionsHtml += `
                    <div class="option-correct">
                        <strong>${String.fromCharCode(65 + optIdx)}. ${opt}</strong>
                        <span class="correct-badge">Правильный ответ</span>
                    </div>
                    <div class="explanation-text">Почему правильно: ${ans.q.explanation}</div>
                `;
            } else if (isUserWrong) {
                optionsHtml += `
                    <div class="option-wrong">
                        <strong>${String.fromCharCode(65 + optIdx)}. ${opt}</strong>
                        <span class="wrong-badge">Ваш ответ</span>
                    </div>
                    <div class="explanation-text wrong-expl">Почему неправильно: ${ans.q.explanation}</div>
                `;
            } else {
                optionsHtml += `<div class="option-neutral">${String.fromCharCode(65 + optIdx)}. ${opt}</div>`;
            }
        });
        
        div.innerHTML = `
            <div class="review-question-header">
                <span class="question-num">Вопрос ${i + 1}</span>
                <span class="status-badge ${ans.wasCorrect ? 'correct' : 'wrong'}">${ans.wasCorrect ? '✓ Верно' : '✗ Ошибка'}</span>
            </div>
            <div class="question-desc"><strong>Ситуация:</strong> ${ans.q.situation}</div>
            <div class="question-desc"><strong>Вопрос:</strong> ${ans.q.text}</div>
            <div class="options-review">${optionsHtml}</div>
        `;
        review.appendChild(div);
    });
}

function confirmExit() {
    if (confirm('Вы уверены, что хотите вернуться на главную страницу? Ваши результаты будут потеряны.')) {
        window.location.href = 'index.html';
    }
}

document.getElementById('next-btn').addEventListener('click', nextQuestion);
document.addEventListener('DOMContentLoaded', loadQuiz);