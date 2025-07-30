let questions = [];
let words = [];

// DOM が読み込まれてから実行
document.addEventListener("DOMContentLoaded", () => {
  const titleScreen = document.getElementById("title-screen");
  const quizContainer = document.getElementById("quiz-container");
  const startButton = document.getElementById("start-button");
  const form = document.getElementById("quizForm");
  const gradeButton = document.getElementById("grade-button");

  // JSONファイルから単語リストを取得
  fetch("words.json")
    .then(res => res.json())
    .then(data => {
      words = data;

      startButton.addEventListener("click", () => {
        const countSelector = document.getElementById("question-count");
        const numQuestions = parseInt(countSelector.value, 10);

        titleScreen.style.display = "none";
        quizContainer.style.display = "block";

        questions = shuffle(words).slice(0, numQuestions);
        renderQuiz();
      });
    })
    .catch(err => {
      console.error("単語リストの読み込みに失敗しました:", err);
      alert("単語データの読み込みに失敗しました。words.json が正しい場所にあるか確認してください。");
    });

  // 採点ボタンにイベントリスナーを登録
  gradeButton.addEventListener("click", gradeQuiz);
});

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function generateChoices(correct, allWords) {
  const otherChoices = shuffle(allWords.filter(w => w.japanese !== correct)).slice(0, 3).map(w => w.japanese);
  return shuffle([correct, ...otherChoices]);
}

function renderQuiz() {
  const form = document.getElementById("quizForm");
  form.innerHTML = "";
  questions.forEach((q, index) => {
    const choices = generateChoices(q.japanese, words);
    const block = document.createElement("div");
    block.className = "question-block";
    block.id = `question-${index}`;
    block.innerHTML = `
      <div><strong>Q${index + 1}:</strong> ${q.english} の意味は？</div>
      <div class="choices">
        ${choices.map(choice => `
          <label><input type="radio" name="q${index}" value="${choice}"> ${choice}</label>
        `).join("")}
      </div>
    `;
    form.appendChild(block);
  });
}

function gradeQuiz(event) {
  event.preventDefault();
  const form = document.getElementById("quizForm");
  let score = 0;
  let resultHTML = "";
  const unanswered = [];

  questions.forEach((q, index) => {
    const userAnswer = document.querySelector(`input[name=q${index}]:checked`);
    const questionDiv = document.getElementById(`question-${index}`);
    questionDiv.classList.remove("unanswered");
    if (!userAnswer) {
      unanswered.push(index + 1);
      questionDiv.classList.add("unanswered");
    }
  });

  if (unanswered.length > 0) {
    alert(`Q.${unanswered.join(', ')} が回答できていません。すべての問題に答えてください。`);
    return;
  }

  questions.forEach((q, index) => {
    const userAnswer = document.querySelector(`input[name=q${index}]:checked`);
    const correct = q.japanese;
    const userText = userAnswer.value;
    const isCorrect = userText === correct;
    if (isCorrect) score++;
    resultHTML += `
      <div class="question-block">
        <div><strong>Q${index + 1}:</strong> ${q.english} の意味は？</div>
        <div>あなたの回答：${userText} ${isCorrect ? "<span class='correct'>〇正解</span>" : "<span class='incorrect'>✖不正解</span>"}</div>
        <div>正解：${correct}</div>
      </div>
    `;
  });

  form.style.display = "none";
  const markButton = document.querySelector(".mark-button");
  if (markButton) markButton.style.display = "none";

  document.getElementById("result").innerHTML = resultHTML + `
    <div class="result">スコア：${score} / ${questions.length}</div>
    <button class="retry-button" onclick="retryQuiz()">再挑戦する</button>
  `;
}

function retryQuiz() {
  document.getElementById("quiz-container").style.display = "none";
  document.getElementById("title-screen").style.display = "block";
  document.getElementById("result").innerHTML = "";

  const startButton = document.getElementById("start-button");
  if (startButton) startButton.style.display = "inline-block";

  const form = document.getElementById("quizForm");
  form.style.display = "block";
  const markButton = document.querySelector(".mark-button");
  if (markButton) markButton.style.display = "flex";
}
