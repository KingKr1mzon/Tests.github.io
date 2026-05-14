let questions = [];
let selectedQuestions = [];
let currentIdx = 0;
let userAnswers = [];

function loadQuiz() {
    fetch("news-data.json")
        .then(res => res.json())
        .then(data => {
            questions = data.questions.map((q, i) => ({
                id: i + 1,
                block: q.block,
                situation: q.situation,
                text: q.text,
                options: q.options,
                correct_answer_index: q.correct_answer_index,
                explanation: q.explanation
            }));
            selectQuestions();
            renderQuestion();
        })
        .catch(err => {
            console.error("Failed to load news-data.json:", err);
            document.getElementById("question-text-news").textContent = "Ошибка загрузки вопросов. Проверьте подключение к news-data.json";
        });
}

function selectQuestions() {
    const block1 = questions.filter(q => q.block === "Блок 1. Обычные новости (Без манипуляции)");
    const block2 = questions.filter(q => q.block === "Блок 2. Очевидная манипуляция (Легко определить)");
    const block3 = questions.filter(q => q.block === "Блок 3. Скрытая манипуляция (Трудно определить)");

    selectedQuestions = [
        ...getRandomItems(block1, 2),
        ...getRandomItems(block2, 4),
        ...getRandomItems(block3, 4)
    ];
    shuffleArray(selectedQuestions);
    userAnswers = Array(selectedQuestions.length).fill(null);
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
    
    // Ситуация не отображается во время теста, только в результатах
    document.getElementById("question-text-news").textContent = q.text;
    
    const container = document.getElementById("options-container-news");
    container.innerHTML = "";
    q.options.forEach((opt, i) => {
        const div = document.createElement("button");
        div.className = "option";
        div.innerHTML = `<span class="option-marker">${String.fromCharCode(65 + i)}</span><span>${opt}</span>`;
        div.onclick = () => selectAnswer(i);
        if (userAnswers[currentIdx] === i) div.classList.add("selected");
        container.appendChild(div);
    });
    
    document.getElementById("next-btn-news").disabled = userAnswers[currentIdx] === null;
    updateProgress();
}

function selectAnswer(index) {
    userAnswers[currentIdx] = index;
    document.querySelectorAll("#options-container-news .option").forEach((el, i) => {
        el.classList.toggle("selected", i === index);
    });
    document.getElementById("next-btn-news").disabled = false;
}

function updateProgress() {
    const pct = ((currentIdx + 1) / selectedQuestions.length) * 100;
    document.getElementById("progress-fill-news").style.width = pct + "%";
    document.getElementById("current-question-news").textContent = currentIdx + 1;
    document.getElementById("total-questions-news").textContent = selectedQuestions.length;
}

function nextQuestion() {
    if (currentIdx < selectedQuestions.length - 1) {
        currentIdx++;
        renderQuestion();
    } else {
        showResults();
    }
}

function showResults() {
    document.getElementById("quiz-screen-news").style.display = "none";
    document.getElementById("results-screen-news").style.display = "block";

    let score = 0;
    selectedQuestions.forEach((q, i) => {
        if (userAnswers[i] === q.correct_answer_index) score++;
    });

    if (typeof window.updateGlobalStats === "function") {
        window.updateGlobalStats(score, selectedQuestions.length);
    }

    document.getElementById("score-percent-news").textContent = Math.round((score / selectedQuestions.length) * 100);
    document.getElementById("score-summary-news").textContent = `Вы набрали ${score} из ${selectedQuestions.length} баллов`;

    const review = document.getElementById("review-container-news");
    review.innerHTML = "";
    selectedQuestions.forEach((q, i) => {
        const isCorrect = userAnswers[i] === q.correct_answer_index;
        const div = document.createElement("div");
        div.className = "review-item";

        let optionsHtml = "";
        q.options.forEach((opt, optIdx) => {
            const isCorrectOpt = optIdx === q.correct_answer_index;
            const isUserWrong = !isCorrectOpt && userAnswers[i] === optIdx;

            let colorStyle = "";
            let explanation = "";
            if (isCorrectOpt) {
                colorStyle = "style=\"color: #10B981; font-weight: 600;\"";
            } else if (isUserWrong) {
                colorStyle = "style=\"color: #EF4444;\"";
                            }
            optionsHtml += `<div ${colorStyle}>${String.fromCharCode(65 + optIdx)}. ${opt}${explanation}</div>`;
        });

        div.innerHTML = `
            <div style="margin-bottom: 16px;">
                <strong style="color: #1F2937;">Ситуация:</strong>
                <p style="color: #4B5563; margin: 8px 0;">${q.situation}</p>
                <strong style="color: #1F2937;">Вопрос:</strong>
                <p style="color: #4B5563; margin: 8px 0;">${q.text}</p>
                <strong style="color: #1F2937;">Варианты ответов:</strong>
                <div style="margin: 12px 0; line-height: 2;">${optionsHtml}</div>
            </div>
            <div style="background: #F3F4F6; padding: 12px; border-radius: 8px; border-left: 4px solid #10B981;">
                <strong style="color: #1F2937;">Правильный ответ:</strong>
                <span style="color: #10B981; font-weight: 600;">${String.fromCharCode(65 + q.correct_answer_index)}</span> - ${q.options[q.correct_answer_index]}
                <p style="color: #4B5563; margin-top: 8px; font-style: italic;">${q.explanation}</p>
            </div>
        `;
        review.appendChild(div);
    });

    const circle = document.getElementById("score-progress-news");
    const pct = (score / selectedQuestions.length) * 283;
    circle.style.strokeDashoffset = 283 - pct;
}

function restartQuiz() {
    currentIdx = 0;
    selectQuestions();
    document.getElementById("results-screen-news").style.display = "none";
    document.getElementById("quiz-screen-news").style.display = "block";
    renderQuestion();
}

function initEventListeners() {
    document.getElementById("next-btn-news").addEventListener("click", nextQuestion);
    document.getElementById("restart-btn-news").addEventListener("click", restartQuiz);
}

document.addEventListener("DOMContentLoaded", function() {
    initEventListeners();
    loadQuiz();
});
