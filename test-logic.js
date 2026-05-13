let questions = [];
let currentIdx = 0;
let userAnswers = [];
let score = 0;

// Загрузка и перемешивание (Пункт 2)
async function loadTestData(file) {
    const response = await fetch(file);
    const data = await response.json();
    questions = data.sort(() => Math.random() - 0.5); // Рандом
    
    document.getElementById('q-count').innerText = questions.length;
    document.getElementById('test-title').innerText = "Тест: " + (file.includes('news') ? 'Новости' : 'Чаты');
}

function startTest() {
    document.getElementById('intro-screen').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    renderQuestion();
}

function renderQuestion() {
    const q = questions[currentIdx];
    const container = document.getElementById('question-content');
    const optionsBox = document.getElementById('options-list');
    
    // Пункт 5: Поддержка фото и длинного текста
    container.innerHTML = `
        <h3>Вопрос ${currentIdx + 1}/${questions.length}</h3>
        ${q.image ? `<img src="${q.image}" style="width:100%; border-radius:12px; margin-bottom:15px;">` : ''}
        <p>${q.text}</p>
        <hr>
        <p><strong>${q.step1.question}</strong></p>
    `;

    optionsBox.innerHTML = '';
    q.step1.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'menu-btn';
        btn.style.padding = '15px';
        btn.innerText = opt;
        btn.onclick = () => handleStep1(i);
        optionsBox.appendChild(btn);
    });
}

// Логика для "вопросов с подвохом" (Пункт 6)
function handleStep1(choiceIdx) {
    const q = questions[currentIdx];
    const isYes = choiceIdx === 0; // Предположим 0 - это "Да"
    const nextStep = isYes ? q.step2.ifYes : q.step2.ifNo;

    const optionsBox = document.getElementById('options-list');
    document.querySelector('#question-content p:last-child').innerHTML = `<strong>${nextStep.question}</strong>`;
    
    optionsBox.innerHTML = '';
    nextStep.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = 'menu-btn';
        btn.innerText = opt;
        btn.onclick = () => saveAndNext(choiceIdx, i, nextStep.correct.includes(i));
        optionsBox.appendChild(btn);
    });
}

function saveAndNext(s1, s2, isCorrect) {
    if(isCorrect) score++;
    
    userAnswers.push({
        qIdx: currentIdx,
        wasCorrect: isCorrect,
        explanation: questions[currentIdx].explanation
    });

    currentIdx++;
    if (currentIdx < questions.length) {
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results-screen').style.display = 'block';
    
    document.getElementById('score-text').innerText = `Вы ответили правильно на ${score} из ${questions.length} вопросов.`;
    
    // Пункт 4: Пояснения в конце
    const explBox = document.getElementById('explanations');
    userAnswers.forEach((ans, i) => {
        explBox.innerHTML += `
            <div style="margin-bottom: 15px; padding: 10px; border-left: 4px solid ${ans.wasCorrect ? '#26af5a' : '#ff4757'}; background: rgba(255,255,255,0.3); border-radius: 8px;">
                <strong>Вопрос ${i+1}:</strong> ${ans.wasCorrect ? '✅ Верно' : '❌ Ошибка'}<br>
                <small>${ans.explanation}</small>
            </div>
        `;
    });

    // Сохранение для админа (Пункт 3)
    saveToAdminStats();
}