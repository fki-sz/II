/* ----------------------------------
   タイマー
---------------------------------- */

// 初期値：25分
let totalSeconds = 25 * 60;
let timeLeft = totalSeconds;
let timerInterval = null;
let isRunning = false;

// 表示更新
function updateDisplay(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  document.getElementById("timeDisplay").textContent = `${m}:${s}`;
}

// カウントダウン処理（ゼロになったら5分にセット）
let breakUsed = false;  // ← 休憩（5分）をもう使ったかどうか

function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    updateDisplay(timeLeft);
    return;
  }

  // ===== 0秒になった時の処理 =====

  // ★ 1回目のゼロ → 5分に自動切替
  if (!breakUsed) {
    breakUsed = true;
    pauseTimer();// ← ★ タイマー停止
    timeLeft = 5 * 60;  // 5分にセット
    updateDisplay(timeLeft);
    playPauseBtn.textContent = "▶"; // ボタンも再生表示に戻す
    return;
  }

  // ★ 2回目のゼロ → 初期設定値に戻して停止
  pauseTimer();
  breakUsed = false;

  // 初期設定の値へ戻す
  timeLeft = totalSeconds; 
  updateDisplay(timeLeft);

  // ▶ ボタンに戻す
  playPauseBtn.textContent = "▶";
}


// ▶⏸ ボタン
const playPauseBtn = document.getElementById("playPauseBtn");
playPauseBtn.addEventListener("click", () => {
  if (!isRunning) {
    startTimer();
    playPauseBtn.textContent = "⏸";
  } else {
    pauseTimer();
    playPauseBtn.textContent = "▶";
  }
});

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  timerInterval = setInterval(tick, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
}

// リセットボタン
document.getElementById("resetBtn").addEventListener("click", () => {
  pauseTimer();
  timeLeft = totalSeconds;
  updateDisplay(timeLeft);
  playPauseBtn.textContent = "▶";
});

// ▼ 分・秒 調整
const minLabel = document.getElementById("minLabel");
const secLabel = document.getElementById("secLabel");

function updateTime() {
  totalSeconds =
    parseInt(minLabel.textContent, 10) * 60 +
    parseInt(secLabel.textContent, 10);
  timeLeft = totalSeconds;
  updateDisplay(timeLeft);
}

document.getElementById("minUp").onclick = () => {
  minLabel.textContent = parseInt(minLabel.textContent) + 1;
  updateTime();
};

document.getElementById("minDown").onclick = () => {
  let m = parseInt(minLabel.textContent);
  if (m > 0) minLabel.textContent = m - 1;
  updateTime();
};

document.getElementById("secUp").onclick = () => {
  let s = parseInt(secLabel.textContent);
  if (s < 59) secLabel.textContent = String(s + 1).padStart(2, "0");
  updateTime();
};

document.getElementById("secDown").onclick = () => {
  let s = parseInt(secLabel.textContent);
  if (s > 0) secLabel.textContent = String(s - 1).padStart(2, "0");
  updateTime();
};

// 初期表示
updateDisplay(timeLeft);


/* ----------------------------------
   サウンド（ループ & 長押し停止）
---------------------------------- */
const sounds = {
  sound1: new Audio("sound/sample.mp3"),
  sound2: new Audio("sound/sample1.mp3"),
  sound3: new Audio("sound/sample2.mp3"),
  sound4: new Audio("sound/sample3.mp3")
};

Object.values(sounds).forEach(a => (a.loop = true));

function setupSoundButton(btnId, soundObj) {
  let pressTimer;
  let longPress = false;
  const btn = document.getElementById(btnId);

  function updateButtonState() {
    if (!soundObj.paused) btn.classList.add("sound-active");
    else btn.classList.remove("sound-active");
 }

  btn.addEventListener("mousedown", () => {
    longPress = false;

    pressTimer = setTimeout(() => {
      longPress = true;

      // 🔥 長押し：音源停止
      soundObj.pause();
      soundObj.currentTime = 0;

      // 🔥 長押し：ハイライト解除
      btn.classList.remove("sound-active");

      // 🔥 長押し：音量バー削除（ここが今回の追加！）
      const row = document.getElementById(`row-${btnId}`);
      if (row) row.remove();

    }, 600);
  });

  btn.addEventListener("mouseup", () => clearTimeout(pressTimer));

  btn.addEventListener("click", () => {
  if (longPress) return; // ← 長押し後は通常クリック無効

  if (soundObj.paused) {
    // --- 再生 ---
    soundObj.play();
    createVolumeControl(btnId, soundObj);
  } else {
    // --- 停止（短いクリック）---
    soundObj.pause();
    soundObj.currentTime = 0;

    // 🔥 追加：バーも消す
    const row = document.getElementById(`row-${btnId}`);
    if (row) row.remove();

    // 🔥 ボタンのハイライトも消す
    btn.classList.remove("sound-active");
  }

  updateButtonState();
});

}




setupSoundButton("sound1btn", sounds.sound1);
setupSoundButton("sound2btn", sounds.sound2);
setupSoundButton("sound3btn", sounds.sound3);
setupSoundButton("sound4btn", sounds.sound4);


/* ----------------------------------
   音量調整（ここが修正点！）
---------------------------------- */
const vol1 = document.getElementById("vol1");
const vol2 = document.getElementById("vol2");
const vol3 = document.getElementById("vol3");
const vol4 = document.getElementById("vol4");

vol1.oninput = () => (sounds.sound1.volume = vol1.value);
vol2.oninput = () => (sounds.sound2.volume = vol2.value);
vol3.oninput = () => (sounds.sound3.volume = vol3.value);
vol4.oninput = () => (sounds.sound4.volume = vol4.value);

function createVolumeControl(id, soundObj) {
  if (document.getElementById(`row-${id}`)) return;

  const btn = document.getElementById(id);
  const displayName = btn?.dataset.name || id;

  const row = document.createElement("div");
  row.className = "volume-row";
  row.id = `row-${id}`;

  row.innerHTML = `
    <span>${displayName}</span>
    <input type="range" min="0" max="1" step="0.01" value="${soundObj.volume}" class="vol-range" />
    <button class="stop-btn">×</button>
  `;

  document.getElementById("volumePanel").appendChild(row);


  // 音量変更
  row.querySelector(".vol-range").oninput = (e) => {
    soundObj.volume = e.target.value;
  };

  // ×ボタン → 停止してバー削除 + ボタンの色も戻す（完全版）
row.querySelector(".stop-btn").onclick = () => {
  // 音停止
  soundObj.pause();
  soundObj.currentTime = 0;

  // バー削除
  const rowElm = document.getElementById(`row-${id}`);
  if (rowElm) rowElm.remove();

  // ボタンのハイライト解除（id のズレを完全にケア）
  const btn = document.getElementById(id);
  if (btn) btn.classList.remove("sound-active");

  // 念のため：全 sound-btn の中から該当ボタンを探して解除
  document.querySelectorAll(".sound-btn").forEach(b => {
    if (b.id === id) b.classList.remove("sound-active");
  });
};


}



/* ----------------------------------
   ツールチップ（アイコン吹き出し）
---------------------------------- */
document.querySelectorAll(".sound-btn").forEach(btn => {
  const tooltip = document.createElement("div");
  tooltip.className = "tooltip";
  tooltip.textContent = btn.dataset.title;
  document.body.appendChild(tooltip);

  btn.addEventListener("mouseenter", () => {
    const rect = btn.getBoundingClientRect();
    tooltip.style.left = rect.left + rect.width / 2 + "px";
    tooltip.style.top = rect.top - 10 + "px";
    tooltip.classList.add("show");
  });

  btn.addEventListener("mouseleave", () => {
    tooltip.classList.remove("show");
  });
});
