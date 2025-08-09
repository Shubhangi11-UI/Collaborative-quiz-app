// Utility to generate UUID
    function generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    // Initialize localStorage data
    if (!localStorage.getItem('users')) localStorage.setItem('users', JSON.stringify([]));
    if (!localStorage.getItem('quizzes')) localStorage.setItem('quizzes', JSON.stringify([]));
    if (!localStorage.getItem('scores')) localStorage.setItem('scores', JSON.stringify([]));

    // Navigation
    const sections = ['loginSection', 'registerSection', 'createQuizSection', 'takeQuizSection', 'dashboardSection'];
    function showSection(sectionId) {
        sections.forEach(id => document.getElementById(id).style.display = id === sectionId ? 'block' : 'none');
    }

    document.getElementById('homeLink').addEventListener('click', () => showSection('loginSection'));
    document.getElementById('createQuizLink').addEventListener('click', () => showSection('createQuizSection'));
    document.getElementById('dashboardLink').addEventListener('click', () => {
        populateQuizSelect();
        showSection('dashboardSection');
    });
    document.getElementById('logoutLink').addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        showSection('loginSection');
    });
    document.getElementById('showRegister').addEventListener('click', () => showSection('registerSection'));
    document.getElementById('showLogin').addEventListener('click', () => showSection('loginSection'));

    // Registration
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const users = JSON.parse(localStorage.getItem('users'));
        if (users.find(user => user.email === email)) {
            alert('Email already registered!');
            return;
        }
        users.push({ username, email, password });
        localStorage.setItem('users', JSON.stringify(users));
        alert('Registration successful! Please login.');
        showSection('loginSection');
    });

    // Login
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const users = JSON.parse(localStorage.getItem('users'));
        const user = users.find(user => user.email === email && user.password === password);
        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            showSection('createQuizSection');
        } else {
            alert('Invalid email or password!');
        }
    });

    // Create Quiz
    let questionCount = 1;
    document.getElementById('addQuestion').addEventListener('click', () => {
        questionCount++;
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        questionDiv.innerHTML = `
            <h4>Question ${questionCount}</h4>
            <div class="form-group">
                <label>Question Text</label>
                <input type="text" class="form-control question-text" required>
            </div>
            <div class="form-group">
                <label>Option 1</label>
                <input type="text" class="form-control option" required>
            </div>
            <div class="form-group">
                <label>Option 2</label>
                <input type="text" class="form-control option" required>
            </div>
            <div class="form-group">
                <label>Option 3</label>
                <input type="text" class="form-control option" required>
            </div>
            <div class="form-group">
                <label>Option 4</label>
                <input type="text" class="form-control option" required>
            </div>
            <div class="form-group">
                <label>Correct Option</label>
                <select class="form-control correct-option" required>
                    <option value="0">Option 1</option>
                    <option value="1">Option 2</option>
                    <option value="2">Option 3</option>
                    <option value="3">Option 4</option>
                </select>
            </div>
        `;
        document.getElementById('questionsContainer').appendChild(questionDiv);
    });

    document.getElementById('quizForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('quizTitle').value;
        const questions = [];
        document.querySelectorAll('.quiz-question').forEach((q, index) => {
            const questionText = q.querySelector('.question-text').value;
            const options = Array.from(q.querySelectorAll('.option')).map(opt => opt.value);
            const correctOption = parseInt(q.querySelector('.correct-option').value);
            questions.push({ questionText, options, correctOption });
        });
        const quizId = generateUUID();
        const quizzes = JSON.parse(localStorage.getItem('quizzes'));
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        quizzes.push({ id: quizId, title, questions, creator: currentUser.email });
        localStorage.setItem('quizzes', JSON.stringify(quizzes));
        const quizLink = `${window.location.origin}?quizId=${quizId}`;
        document.getElementById('quizLink').innerHTML = `Share this link: <a href="${quizLink}">${quizLink}</a>`;
        document.getElementById('quizLink').style.display = 'block';
    });

    // Take Quiz
    function loadQuiz() {
        const urlParams = new URLSearchParams(window.location.search);
        const quizId = urlParams.get('quizId');
        if (quizId) {
            const quizzes = JSON.parse(localStorage.getItem('quizzes'));
            const quiz = quizzes.find(q => q.id === quizId);
            if (quiz) {
                showSection('takeQuizSection');
                document.getElementById('takeQuizTitle').textContent = quiz.title;
                const questionsContainer = document.getElementById('quizQuestions');
                questionsContainer.innerHTML = '';
                quiz.questions.forEach((q, index) => {
                    const questionDiv = document.createElement('div');
                    questionDiv.className = `question-container ${index === 0 ? 'active' : ''}`;
                    questionDiv.innerHTML = `
                        <h4>${q.questionText}</h4>
                        ${q.options.map((opt, i) => `
                            <div class="form-check">
                                <input class="form-check-input" type="radio" name="q${index}" value="${i}" required>
                                <label class="form-check-label">${opt}</label>
                            </div>
                        `).join('')}
                    `;
                    questionsContainer.appendChild(questionDiv);
                });
                document.getElementById('nextQuestion').style.display = quiz.questions.length > 1 ? 'block' : 'none';
                document.getElementById('submitQuiz').style.display = quiz.questions.length === 1 ? 'block' : 'none';
            }
        }
    }

    let currentQuestion = 0;
    document.getElementById('nextQuestion').addEventListener('click', () => {
        const questions = document.querySelectorAll('.question-container');
        if (currentQuestion < questions.length - 1) {
            questions[currentQuestion].classList.remove('active');
            currentQuestion++;
            questions[currentQuestion].classList.add('active');
            document.getElementById('nextQuestion').style.display = currentQuestion < questions.length - 1 ? 'block' : 'none';
            document.getElementById('submitQuiz').style.display = currentQuestion === questions.length - 1 ? 'block' : 'none';
        }
    });

    document.getElementById('submitQuiz').addEventListener('click', () => {
        const urlParams = new URLSearchParams(window.location.search);
        const quizId = urlParams.get('quizId');
        const quizzes = JSON.parse(localStorage.getItem('quizzes'));
        const quiz = quizzes.find(q => q.id === quizId);
        let score = 0;
        quiz.questions.forEach((q, index) => {
            const selected = document.querySelector(`input[name="q${index}"]:checked`);
            if (selected && parseInt(selected.value) === q.correctOption) score++;
        });
        const scores = JSON.parse(localStorage.getItem('scores'));
        const participant = prompt('Enter your name:') || 'Anonymous';
        scores.push({ quizId, participant, score, date: new Date().toISOString() });
        localStorage.setItem('scores', JSON.stringify(scores));
        alert(`Your score: ${score}/${quiz.questions.length}`);
        showSection('loginSection');
        window.history.replaceState({}, document.title, window.location.pathname);
    });

    // Dashboard
    function populateQuizSelect() {
        const quizSelect = document.getElementById('quizSelect');
        quizSelect.innerHTML = '';
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const quizzes = JSON.parse(localStorage.getItem('quizzes')).filter(q => q.creator === currentUser.email);
        quizzes.forEach(quiz => {
            const option = document.createElement('option');
            option.value = quiz.id;
            option.textContent = quiz.title;
            quizSelect.appendChild(option);
        });
        quizSelect.addEventListener('change', () => {
            const scores = JSON.parse(localStorage.getItem('scores')).filter(s => s.quizId === quizSelect.value);
            const scoresTable = document.getElementById('scoresTable');
            scoresTable.innerHTML = scores.map(s => `
                <tr>
                    <td>${s.participant}</td>
                    <td>${s.score}</td>
                    <td>${new Date(s.date).toLocaleString()}</td>
                </tr>
            `).join('');
        });
        if (quizzes.length > 0) quizSelect.dispatchEvent(new Event('change'));
    }

    // Check if user is logged in or quiz link is accessed
    if (localStorage.getItem('currentUser')) {
        showSection('createQuizSection');
    } else {
        showSection('loginSection');
    }
    loadQuiz();