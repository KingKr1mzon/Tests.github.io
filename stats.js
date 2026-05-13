function saveToAdminStats() {
    let allHistory = JSON.parse(localStorage.getItem('adminStats') || '[]');
    const newResult = {
        date: new Date().toLocaleString(),
        score: score,
        total: questions.length,
        testType: document.getElementById('test-title').innerText
    };
    allHistory.push(newResult);
    localStorage.setItem('adminStats', JSON.stringify(allHistory));
}

// Функцию вызова админ-панели можно сделать скрытой (например, при клике на заголовок 5 раз)
function showAdminPanel() {
    const stats = JSON.parse(localStorage.getItem('adminStats') || '[]');
    console.table(stats); // Пока что выводим в консоль для простоты
    alert("Статистика выведена в консоль разработчика (F12)");
}