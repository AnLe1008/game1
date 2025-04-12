/*const titleScreen = document.getElementById('title-screen');*/
const nameEntryScreen = document.getElementById('name-entry-screen');
const characterSelectScreen = document.getElementById('character-select-screen');
/*const gameScreen = document.getElementById('game-screen');*/

const startNewGameButton = document.getElementById('start-new-game-button');
const playerNameInput = document.getElementById('player-name-input');
const confirmNameButton = document.getElementById('confirm-name-button');
const characterCards = document.querySelectorAll('.character-card'); 
const charDetailsWindow = document.getElementById('char-details-window');
const confirmCharButton = document.getElementById('confirm-char-button');

const playerNameDisplay = document.getElementById('player-name-display');
const playerLevelDisplay = document.getElementById('player-level');
const playerHpBar = document.getElementById('player-hp-bar');
const playerHpValue = document.getElementById('player-hp-value');
const playerXpBar = document.getElementById('player-xp-bar');
const playerXpValue = document.getElementById('player-xp-value');
const playerGoldDisplay = document.getElementById('player-gold');
const playerFace = document.getElementById('player-face');
const skillIcon = document.getElementById('skill-icon');
const comboCounterDisplay = document.getElementById('combo-counter');

const logWindowOutput = document.getElementById('log-window');
const questionWindow = document.getElementById('question-window');
const questionTextElement = document.getElementById('question-text');
const answerOptionsElement = document.getElementById('answer-options');
const enemyInfo = document.getElementById('enemy-info');
const enemyNameDisplay = document.getElementById('enemy-name');
const enemyHpBar = document.getElementById('enemy-hp-bar');
const enemyHpValue = document.getElementById('enemy-hp-value');
const enemySprite = document.getElementById('enemy-sprite');


// ========== GAME STATE VARIABLES ==========
let currentScreen = 'title'; // Màn hình hiện tại
let playerName = "Dũng Sĩ"; // Tên người chơi mặc định
let playerCharacter;       // Object chứa thông tin nhân vật đã chọn
let currentCombo = 0;
let currentFloor = 1;
let currentRoomIndex = 0; // Bắt đầu từ index 0 (ứng với phòng null hoặc phòng bắt đầu thực sự)
let currentRoomData; // Thông tin phòng hiện tại
let currentEnemy; // Thông tin quái vật đang đối đầu
let questionsCorrectInRoom = 0; // Đếm số câu đúng trong phòng hiện tại
let questionsAskedInRoom = []; // Lưu id các câu đã hỏi trong phòng tránh lặp lại ngay
// (Thêm các biến trạng thái khác: currentFloor, currentRoom, inventory...)


// ========== CORE DATA (Characters, Skills, Items, Enemies, Questions) ==========
const characterData = {
    'kiem-si': {
        name: "Nữ Kiếm Sĩ Quả Cảm",
        face: "images/chars/kiem_si_face.png", // Sử dụng link imgur
        skillIcon: "images/icons/skill_kiem_si.png", // Bạn cần tạo icon này
        description: "Cân bằng công thủ, kỹ năng tấn công mạnh mẽ.",
        stats: { hp: 110, atk: 15, def: 12, spd: 5, lck: 8 },
        skill: { id: "double_strike", name: "Cú Đánh Chuẩn Xác", description: "Đòn tấn công đúng tiếp theo gây gấp đôi sát thương ATK. (1 lần/trận)" }
    },
    'hoc-gia': {
        name: "Nữ Học Giả Uyên Bác",
        face: "images/chars/hoc_gia_face.png",
        skillIcon: "images/icons/skill_hoc_gia.png",
        description: "ATK cao dựa trên trí tuệ, nhưng mỏng manh. Có thể loại bỏ đáp án sai.",
        stats: { hp: 90, atk: 18, def: 5, spd: 9, lck: 8 },
        skill: { id: "analyze", name: "Phân Tích Sâu Sắc", description: "Loại bỏ 1 đáp án sai trong câu hỏi hiện tại. (1 lần/trận, dùng trước khi chọn)" }
    },
     'trinh-sat': {
        name: "Nam Trinh Sát Lanh Lợi",
        face: "images/chars/trinh_sat_face.png",
        skillIcon: "images/icons/skill_trinh_sat.png",
        description: "Nhanh nhẹn và may mắn, có khả năng né đòn tấn công đầu tiên.",
        stats: { hp: 100, atk: 10, def: 7, spd: 13, lck: 10 },
        skill: { id: "first_dodge", name: "Lẩn Tránh Tức Thời", description: "Tự động né hoàn toàn sát thương từ lần trả lời sai đầu tiên trong trận." }
    },
    'ho-phap': {
        name: "Nam Hộ Pháp Vững Chãi",
        face: "images/chars/ho_phap_face.png",
        skillIcon: "images/icons/skill_ho_phap.png",
        description: "HP và DEF cực cao, khả năng hồi phục khi bị tấn công.",
        stats: { hp: 125, atk: 8, def: 15, spd: 4, lck: 13 },
        skill: { id: "second_wind", name: "Ý Chí Bất Khuất", description: "Hồi lại 25% HP tối đa sau khi bị tấn công (trả lời sai). (1 lần/trận, dùng sau khi bị đánh)" }
    }
};

const questions = [
    {
        id: "gk_e_001",
        questionText: "Mặt trời mọc ở hướng nào?",
        options: ["Tây", "Đông", "Nam", "Bắc"],
        correctAnswer: "Đông",
        difficulty: "easy",
        theme: "gk" // General Knowledge
    },
    {
        id: "gk_e_002",
        questionText: "Thủ đô của Việt Nam là thành phố nào?",
        options: ["Hà Nội", "Đà Nẵng", "Huế", "TP. Hồ Chí Minh"],
        correctAnswer: "Hà Nội",
        difficulty: "easy",
        theme: "gk"
    },
    {
        id: "gk_e_003",
        questionText: "Loài vật nào sau đây thường được gọi là 'chúa sơn lâm'?",
        options: ["Gấu", "Sói", "Hổ", "Voi"],
        correctAnswer: "Hổ",
        difficulty: "easy",
        theme: "gk"
    },

    // ---- Câu Hỏi Toán Dễ (math_easy) ----
     {
        id: "math_e_001",
        questionText: "Trong một tuần lễ có bao nhiêu ngày?",
        options: ["5", "7", "8", "10"],
        correctAnswer: "7",
        difficulty: "easy",
        theme: "math"
    },
    {
        id: "math_e_002",
        questionText: "Số lớn nhất trong các số sau: 12, 8, 15, 9?",
        options: ["12", "8", "15", "9"],
        correctAnswer: "15",
        difficulty: "easy",
        theme: "math"
    },
     {
        id: "math_e_003",
        questionText: "Một tá bút chì có bao nhiêu cái?",
        options: ["10", "11", "12", "14"],
        correctAnswer: "12",
        difficulty: "easy",
        theme: "math"
    },

     // ---- Câu Hỏi Logic Rất Dễ (logic_very_easy) ----
      {
        id: "log_ve_001",
        questionText: "Nếu hôm qua là thứ Hai, thì ngày mai là thứ mấy?",
        options: ["Thứ Ba", "Thứ Tư", "Thứ Năm", "Chủ Nhật"],
        correctAnswer: "Thứ Tư", // Hôm nay T3 -> Mai T4
        difficulty: "very_easy",
        theme: "logic"
    },
     {
         id: "log_ve_002",
         questionText: "Cái gì luôn đi tới mà không bao giờ đến?", // Dùng cho rương hoặc câu đố
         options: ["Thời gian", "Con đường", "Cơn gió", "Ngày mai"],
         correctAnswer: "Ngày mai",
         difficulty: "very_easy", // Độ khó này có thể tăng nếu làm câu đố
         theme: "logic" // Hoặc theme: "puzzle"
     }

    // ---- Bạn cần thêm RẤT NHIỀU câu hỏi khác vào đây cho các theme và độ khó khác nhau ----
    // Ví dụ: math_medium, gk_medium, logic_easy cho Boss T1
];

// ---- Dữ Liệu Quái Vật (Tạm thời cho T1) ----
const enemyData = {
    'silly_slime': {
        id: 'silly_slime', // Thêm id để dễ tham chiếu
        name: "Nhầy Nhụa Ngớ Ngẩn",
        maxHp: 35,
        baseDamage: 18, // Sát thương khi người chơi sai
        sprite: 'images/monsters/slime.png' // << Bạn cần tạo ảnh này trong images/monsters/
    },
    'clumsy_bat': {
        id: 'clumsy_bat',
        name: "Dơi Đêm Lúng Túng",
        maxHp: 45,
        baseDamage: 20,
        sprite: 'images/monsters/bat.png' // << Bạn cần tạo ảnh này trong images/monsters/
    },
    'stone_sentinel': {
        id: 'stone_sentinel',
        name: "Giám Ngục Đá Cổ Đại",
        maxHp: 200,
        baseDamage: 30,
        sprite: 'images/monsters/golem.png' // << Bạn cần tạo ảnh này trong images/monsters/
    }
};

// ---- Cấu Trúc Tầng 1 (Dựa trên Bước 5 Lần 9) ----
const floor1Data = [
    // room 0 (không dùng, để index khớp số phòng)
    null,
    // Phòng 1: Câu hỏi mở đường
    { roomNumber: 1, type: 'question', questionsToComplete: 1, questionPool: [{ theme: 'gk', difficulty: 'easy' }], reward: { xp: 15, gold: 10 } },
    // Phòng 2: Đánh Slime
    { roomNumber: 2, type: 'encounter', questionsToComplete: 2, monsterId: 'silly_slime', questionPool: [{ theme: 'math', difficulty: 'easy' }, { theme: 'gk', difficulty: 'easy' }], reward: { xp: 30, gold: 20 } },
    // Phòng 3: Rương
    { roomNumber: 3, type: 'chest', questionsToComplete: 1, questionPool: [{ theme: 'logic', difficulty: 'very_easy' }], reward: { items: [{ id: 'potion_small', qty: 1 }], gold: 70 } },
    // Phòng 4: Đánh 2 Slime
    { roomNumber: 4, type: 'encounter', questionsToComplete: 3, monsterId: 'silly_slime', numMonsters: 2, questionPool: [{ theme: 'math', difficulty: 'easy' }, { theme: 'gk', difficulty: 'easy' }], reward: { xp: 45, gold: 30 } },
    // Phòng 5: Đánh Bat
    { roomNumber: 5, type: 'encounter', questionsToComplete: 2, monsterId: 'clumsy_bat', questionPool: [{ theme: 'gk', difficulty: 'easy' }, { theme: 'logic', difficulty: 'very_easy' }], reward: { xp: 40, gold: 35 } },
    // Phòng 6: Câu đố
    { roomNumber: 6, type: 'puzzle', questionsToComplete: 1, questionPool: [{ theme: 'puzzle', difficulty: 'easy' }], reward: { xp: 20, gold: 15 } }, // Cần tạo theme 'puzzle' hoặc dùng 'logic'
    // Phòng 7: Đánh hỗn hợp
    { roomNumber: 7, type: 'encounter', questionsToComplete: 4, monsterId: ['silly_slime', 'clumsy_bat'], numMonsters: 3, questionPool: [{ theme: 'math', difficulty: 'easy' }, { theme: 'gk', difficulty: 'easy' }, { theme: 'logic', difficulty: 'very_easy' }], reward: { xp: 60, gold: 40 } },
    // Phòng 8: An toàn
    { roomNumber: 8, type: 'safe_room' },
    // Phòng 9: Boss
    { roomNumber: 9, type: 'boss', questionsToComplete: 8, monsterId: 'stone_sentinel', questionPool: [{ theme: 'math', difficulty: 'medium' }, { theme: 'gk', difficulty: 'medium' }, { theme: 'logic', difficulty: 'easy' }], reward: { xp: 200, goldRange: [250, 350] } }
];

// ========== HELPER FUNCTIONS ==========
function switchScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
        currentScreen = screenId;
        console.log("Switched to screen:", screenId); 
    } else {
        console.error("Screen not found:", screenId);
    }
}

function updateCharacterDetails(charId) {
    console.log("--- updateCharacterDetails START with charId:", charId); 
    const charInfo = characterData[charId];
    if (!charInfo) {
        charDetailsWindow.innerHTML = `<p class="pixel-font">Lỗi: Không tìm thấy dữ liệu nhân vật.</p>`;
        console.log("--- updateCharacterDetails END (char not found)");
        return;
    }

    const skillIconPath = charInfo.skillIcon || 'images/icons/skill_placeholder.png';

    charDetailsWindow.innerHTML = `
        <img src="${charInfo.face}" alt="${charInfo.name}" class="face-graphic" style="float: left; margin-right: 10px; width: 64px; height: 64px;">
        <p class="pixel-font"><strong>${charInfo.name}</strong></p>
        <p class="pixel-font" style="font-size: 0.8em;">${charInfo.description}</p>
        <p class="pixel-font stats-line">HP:${charInfo.stats.hp} ATK:${charInfo.stats.atk} DEF:${charInfo.stats.def} SPD:${charInfo.stats.spd} LCK:${charInfo.stats.lck}</p>
        <div style="display: flex; align-items: center; margin-top: 8px; clear: left;">
        <img src="${skillIconPath}" alt="Skill Icon" style="width: 24px; height: 24px; margin-right: 8px;">
        <p class="pixel-font skill-line" style="margin: 0;"><strong>Kỹ năng: ${charInfo.skill.name}</strong></p>
        </div>
        <p class="pixel-font skill-desc" style="font-size: 0.7em; margin-left: 32px;">${charInfo.skill.description}</p> 
    `;
    confirmCharButton.disabled = false;
    characterSelectScreen.dataset.selectedCharId = charId;
    console.log("--- updateCharacterDetails END (Success)");
}

startNewGameButton.addEventListener('click', () => {
    console.log("Start New Game button clicked");
    switchScreen('name-entry-screen');
});

confirmNameButton.addEventListener('click', () => {
    const name = playerNameInput.value.trim();
    if (name.length > 0 && name.length <= 12) {
        playerName = name; // Lưu tên người chơi
        console.log("Player name set to:", playerName);
        switchScreen('character-select-screen');
    } else {
        // Có thể thêm thông báo lỗi nếu tên không hợp lệ
        playerNameInput.style.border = '2px solid red'; // Đổi viền input thành đỏ
        console.log("Invalid player name.");
        // Reset viền sau một thời gian
         setTimeout(() => { playerNameInput.style.border = '2px solid #888'; }, 1500);

    }
});

let previouslySelectedCard = null;
characterCards.forEach(card => {
    card.addEventListener('click', () => {
        const charId = card.dataset.charId;
        console.log("Character card clicked:", charId);

         // Bỏ chọn thẻ cũ (nếu có)
         if (previouslySelectedCard) {
             previouslySelectedCard.classList.remove('selected');
         }
         // Chọn thẻ mới
         card.classList.add('selected');
         previouslySelectedCard = card; // Lưu thẻ vừa chọn


        updateCharacterDetails(charId);
    });
});

// Gán sự kiện cho nút xác nhận nhân vật
confirmCharButton.addEventListener('click', () => {
    const selectedCharId = characterSelectScreen.dataset.selectedCharId;
    if (selectedCharId && characterData[selectedCharId]) {
        playerCharacter = JSON.parse(JSON.stringify(characterData[selectedCharId])); // Tạo bản sao sâu dữ liệu nhân vật
        // Thêm các thông tin người chơi vào object
        playerCharacter.name = playerName; // Dùng tên người chơi đặt
        playerCharacter.level = 1;
        playerCharacter.xp = 0;
        playerCharacter.xpToNextLevel = 50; // Mốc XP đầu tiên từ Bước 4
        playerCharacter.gold = 0;
        // Thêm trang bị ban đầu nếu cần (Ví dụ: level 1)
        playerCharacter.equipment = { weapon: { name: "Vũ Khí Cơ Bản", level: 1, type: "..." }, };

        console.log("Character selected:", playerCharacter);
        initializeGame(); // Gọi hàm bắt đầu game chính
    } else {
        console.error("No character selected or data not found.");
    }
});

function displayQuestion() {
    console.log("Attempting to display question for room:", currentRoomData?.roomNumber);
    if (!currentRoomData || !currentRoomData.questionPool || currentRoomData.questionPool.length === 0) {
        console.error("No valid question pool found for the current room!");
        addToLog("Lỗi: Không tìm thấy câu hỏi phù hợp!");
        // Có thể xử lý chuyển phòng lỗi hoặc kết thúc encounter ở đây
        return;
    }

    // --- Logic Chọn Câu Hỏi ---
    // 1. Lọc ra các câu hỏi phù hợp với theme/difficulty của phòng hiện tại
    let potentialQuestions = questions.filter(q => {
        // Kiểm tra xem câu hỏi có theme và difficulty nằm trong pool của phòng không
        return currentRoomData.questionPool.some(poolItem =>
            poolItem.theme === q.theme && poolItem.difficulty === q.difficulty
        );
    });

    // 2. Lọc bỏ các câu đã hỏi trong phòng này
    potentialQuestions = potentialQuestions.filter(q => !questionsAskedInRoom.includes(q.id));

    // 3. Nếu hết câu hỏi chưa hỏi phù hợp -> Lấy tạm từ pool gốc (cho phép lặp lại)
    if (potentialQuestions.length === 0) {
         console.warn("No new questions available in pool, allowing repeats.");
         potentialQuestions = questions.filter(q => {
            return currentRoomData.questionPool.some(poolItem =>
                poolItem.theme === q.theme && poolItem.difficulty === q.difficulty
             );
         });
        // Nếu vẫn không có câu nào (lỗi data?) -> thoát
         if (potentialQuestions.length === 0) {
             console.error("CRITICAL: No questions found for the pool even after allowing repeats!");
             addToLog("LỖI HỆ THỐNG: Không thể tải câu hỏi!");
             // Nên có xử lý dừng game an toàn ở đây
             return;
         }
    }

     // 4. Chọn ngẫu nhiên 1 câu hỏi từ danh sách còn lại
     const randomIndex = Math.floor(Math.random() * potentialQuestions.length);
     const selectedQuestion = potentialQuestions[randomIndex];
     questionsAskedInRoom.push(selectedQuestion.id); // Đánh dấu đã hỏi

     console.log("Selected Question:", selectedQuestion.id);

     // --- Hiển Thị Lên Giao Diện ---
     questionTextElement.textContent = selectedQuestion.questionText; // Hiển thị nội dung câu hỏi

     // Xóa các nút đáp án cũ
     answerOptionsElement.innerHTML = '';

     // Tạo và thêm các nút đáp án mới
     selectedQuestion.options.forEach(option => {
         const button = document.createElement('button');
         button.textContent = option;
         // Lưu đáp án đúng vào data-* để dễ kiểm tra sau này
         button.dataset.correct = option === selectedQuestion.correctAnswer;
          button.dataset.correctAnswerText = selectedQuestion.correctAnswer; // Lưu text đáp án đúng
         button.onclick = () => handleAnswer(option, selectedQuestion.correctAnswer, button); // Gọi handleAnswer khi click
         answerOptionsElement.appendChild(button);
     });

     // Hiện cửa sổ câu hỏi
     questionWindow.style.display = 'block'; // Hiện lại cửa sổ
     questionWindow.classList.add('active'); // Thêm class active nếu CSS cần
     console.log("Question window displayed");
}

// Hàm khởi tạo khi vào game chính
function initializeGame() {
     console.log("Initializing game screen...");
    // Cập nhật giao diện người chơi ban đầu
    playerNameDisplay.textContent = playerCharacter.name;
    playerLevelDisplay.textContent = playerCharacter.level;
    updatePlayerStatsUI(); // Hàm cập nhật HP, XP, Gold sẽ tạo sau
    playerFace.src = playerCharacter.face || 'images/ui/placeholder_face.png';
    skillIcon.src = playerCharacter.skillIcon || 'images/icons/skill_placeholder.png'; // Lấy icon kỹ năng
    console.log("Set skillIcon.src to:", skillIcon.src);
    // Reset combo
    currentCombo = 0;
    updateComboUI(); // Hàm cập nhật combo UI

    // (Tạm thời chỉ chuyển màn hình, logic Tầng 1 sẽ thêm sau)
    switchScreen('game-screen');

    // Bắt đầu Tầng 1, Phòng 1
    startFloor(1); // Sẽ tạo hàm này sau
    addToLog(`Chào mừng ${playerCharacter.name} đến với Cuộc Phiêu Lưu!`);
     // Ví dụ: Hiển thị câu hỏi đầu tiên ngay
     // startEncounter(...); // Sẽ tạo hàm này sau
}

// Hàm cập nhật UI trạng thái người chơi (Sẽ cần gọi thường xuyên)
function updatePlayerStatsUI() {
    // Giả sử playerCharacter đã có các thuộc tính: hp, maxHp, xp, xpToNextLevel, gold
    if (!playerCharacter) return; // Chưa chọn nhân vật thì thôi

     // HP Bar & Value
    const maxHp = playerCharacter.stats.hp; // Lấy max HP từ stats gốc (hoặc tính toán nếu có trang bị/buff)
    const currentHp = playerCharacter.currentHp || maxHp; // Cần thêm currentHp khi bắt đầu trận đấu
    playerCharacter.maxHp = playerCharacter.stats.hp; // Lưu lại maxHp để tiện dùng
    playerCharacter.currentHp = playerCharacter.currentHp === undefined ? playerCharacter.maxHp : playerCharacter.currentHp; // Đảm bảo currentHp được khởi tạo

    const hpPercent = Math.max(0, (playerCharacter.currentHp / playerCharacter.maxHp) * 100);
    playerHpBar.style.width = `${hpPercent}%`;
    playerHpValue.textContent = `${Math.max(0, playerCharacter.currentHp)}/${playerCharacter.maxHp}`;

    // XP Bar & Value
    const xpPercent = Math.max(0, (playerCharacter.xp / playerCharacter.xpToNextLevel) * 100);
    playerXpBar.style.width = `${xpPercent}%`;
    playerXpValue.textContent = `${playerCharacter.xp}/${playerCharacter.xpToNextLevel}`;

     // Gold
     playerGoldDisplay.textContent = playerCharacter.gold;

     // Level
     playerLevelDisplay.textContent = playerCharacter.level;

     playerFace.src = playerCharacter.face || 'images/ui/placeholder_face.png';
     skillIcon.src = playerCharacter.skillIcon || 'images/icons/skill_placeholder.png'; // Lấy icon kỹ năng
}

function updateEnemyStatsUI(enemy) { // Thêm hàm này hoặc tích hợp vào nơi xử lý địch
    if (!enemy) {
        enemyInfo.style.display = 'none'; // Ẩn nếu không có địch
        return;
    };
     enemyInfo.style.display = 'block'; // Hiện khi có địch
    enemyNameDisplay.textContent = enemy.name;
    const enemyHpPercent = Math.max(0, (enemy.currentHp / enemy.maxHp) * 100);
    enemyHpBar.style.width = `${enemyHpPercent}%`;
    enemyHpValue.textContent = `${Math.max(0, enemy.currentHp)}/${enemy.maxHp}`;
}

// Hàm cập nhật UI Combo
function updateComboUI() {
    comboCounterDisplay.textContent = currentCombo;
}

// Hàm thêm tin nhắn vào Log
function addToLog(message) {
    const newMessage = document.createElement('p');
    newMessage.textContent = message;
    logWindowOutput.appendChild(newMessage);
    // Tự động cuộn xuống dưới cùng
    logWindowOutput.scrollTop = logWindowOutput.scrollHeight;
}

function levelUpCheck() {
    if (!playerCharacter) return; // Thoát nếu chưa có nhân vật

    let leveledUp = false; // Biến cờ để biết có lên cấp hay không

    // Dùng vòng lặp while phòng trường hợp lên nhiều cấp 1 lúc
    while (playerCharacter.xp >= playerCharacter.xpToNextLevel) {
        leveledUp = true;
        // Trừ XP cần thiết cho cấp vừa đạt
        playerCharacter.xp -= playerCharacter.xpToNextLevel;

        // Tăng Level
        playerCharacter.level++;
        addToLog(`✨ CHÚC MỪNG! Đạt Cấp Độ ${playerCharacter.level}! ✨`);

        // Tính mốc XP mới cho cấp tiếp theo (Dựa trên bảng cân bằng ở Bước 4)
        // Đây là một cách tính ví dụ, bạn có thể dùng bảng tra cứu nếu muốn chính xác hơn
        const milestones = [0, 50, 100, 180, 300, 450, 650, 900, 1200, 1600]; // Mốc XP CẦN THÊM cho mỗi cấp (index 1 là từ lv1->2)
        if (playerCharacter.level <= 10) { // Giới hạn level 10
             let xpNeeded = milestones[playerCharacter.level-1]; // XP cần cho cấp VỪA LÊN TỚI
             if (playerCharacter.level > 1) {
                  // Tính XP tích lũy cần để đạt level HIỆN TẠI
                 let previousMilestoneXpNeeded = milestones[playerCharacter.level - 2];
                 // XP cần cho cấp TIẾP THEO sẽ phức tạp hơn nếu dựa vào bảng, đơn giản hóa:
                  playerCharacter.xpToNextLevel = playerCharacter.xpToNextLevel + Math.floor(playerCharacter.xpToNextLevel * 0.6 + 80) ; // Tăng dần theo công thức ví dụ
                 // HOẶC dùng bảng mốc XP yêu cầu đã có sẵn
                 // playerCharacter.xpToNextLevel = GET_XP_NEEDED_FOR_LEVEL(playerCharacter.level + 1); // Cần hàm này
             } else { // Khi vừa lên lv 2
                 playerCharacter.xpToNextLevel = milestones[playerCharacter.level]; // XP lên cấp 3
             }
        } else {
             playerCharacter.xpToNextLevel = Infinity; // Đã max level
             playerCharacter.xp = 0; // Có thể reset XP dư về 0
        }


        // Tăng Chỉ Số Cơ Bản (Đồng đều theo Bước 4)
        playerCharacter.stats.hp += 20;
        playerCharacter.stats.atk += 2;
        playerCharacter.stats.def += 1;
        playerCharacter.stats.spd += 1;
        playerCharacter.stats.lck += 1;

        addToLog(`Chỉ số tăng: HP+20, ATK+2, DEF+1, SPD+1, LCK+1`);

        // Cập nhật Max HP thực tế (quan trọng!)
        playerCharacter.maxHp = playerCharacter.stats.hp; // Hoặc tính toán dựa trên cả trang bị nếu có sau
        // Hồi Đầy Máu
        playerCharacter.currentHp = playerCharacter.maxHp;
        addToLog("HP đã được hồi đầy!");

    } // Kết thúc vòng lặp while

    // Chỉ cập nhật UI một lần sau khi đã xử lý xong việc lên cấp (nếu có)
    if (leveledUp) {
        // Có thể thêm hiệu ứng hình ảnh/âm thanh ở đây
        updatePlayerStatsUI(); // Cập nhật lại toàn bộ thanh trạng thái
    }
}

// --- Game Flow Functions ---
function startFloor(floorNumber) {
    console.log(`Starting Floor ${floorNumber}`);
    currentFloor = floorNumber;
    currentRoomIndex = 1; // Bắt đầu từ phòng số 1 (index 1 trong mảng floorXData)
    startRoom(currentRoomIndex);
}

function startRoom(roomIndex) {
    console.log(`Entering Room ${roomIndex} of Floor ${currentFloor}`);
    // Lấy dữ liệu phòng hiện tại (cần xử lý nếu floorNumber khác 1 sau này)
    const floorData = (currentFloor === 1) ? floor1Data : null; // Sẽ mở rộng sau
    if (!floorData || roomIndex >= floorData.length || !floorData[roomIndex]) {
        console.error(`Invalid room index ${roomIndex} for floor ${currentFloor}`);
        // Có thể xử lý kết thúc tầng hoặc báo lỗi
        return;
    }

    currentRoomData = floorData[roomIndex];
    currentRoomIndex = roomIndex; // Cập nhật index phòng hiện tại
    questionsCorrectInRoom = 0; // Reset số câu đúng
    questionsAskedInRoom = []; // Reset danh sách câu đã hỏi
    currentEnemy = null; // Reset kẻ địch
    enemyInfo.style.display = 'none'; // Ẩn thông tin địch ban đầu
    questionWindow.style.display = 'none'; // Ẩn cửa sổ câu hỏi ban đầu

    addToLog(`--- Bước vào Phòng ${currentRoomData.roomNumber} ---`);

    // Xử lý theo loại phòng
    switch (currentRoomData.type) {
        case 'question':
        case 'encounter':
        case 'puzzle': // Các loại này đều cần hỏi câu hỏi
        case 'boss':
            startEncounter(currentRoomData);
            break;
        case 'chest':
            // Logic mở rương (hiện câu hỏi đặc biệt?)
             startEncounter(currentRoomData); // Tạm thời cũng dùng câu hỏi
            // addToLog("Bạn thấy một chiếc rương!");
             break;
        case 'safe_room':
            showSafeRoomUI(); // Sẽ tạo hàm này sau
            break;
        default:
            console.warn("Unknown room type:", currentRoomData.type);
            // Có thể tự động chuyển phòng tiếp theo nếu là phòng không xác định
             // nextRoom();
            break;
    }
    updatePlayerStatsUI(); // Cập nhật UI khi vào phòng mới
    updateComboUI(); // Reset combo UI
}

function startEncounter(roomData) {
    console.log("Starting encounter/question for Room:", roomData.roomNumber);
    // Chuẩn bị kẻ địch (nếu có)
    if (roomData.monsterId) {
        const enemyId = Array.isArray(roomData.monsterId) ? roomData.monsterId[0] : roomData.monsterId; // Lấy ID địch (xử lý mảng/đơn giản)
        if (enemyData[enemyId]) {
            // Tạo bản sao dữ liệu địch cho trận đấu
            currentEnemy = JSON.parse(JSON.stringify(enemyData[enemyId]));
            currentEnemy.currentHp = currentEnemy.maxHp; // Đặt HP đầy
            console.log("Encountering:", currentEnemy.name);
             enemySprite.src = currentEnemy.sprite || ''; // Đặt ảnh địch
             enemySprite.alt = currentEnemy.name;
            updateEnemyStatsUI(currentEnemy); // Cập nhật UI địch
        } else {
            console.error("Enemy data not found for ID:", enemyId);
             enemySprite.src = ''; // Xóa ảnh địch cũ nếu không tìm thấy
        }
    } else {
         enemySprite.src = ''; // Không có địch thì không hiện ảnh
         updateEnemyStatsUI(null); // Ẩn UI địch
    }

    // Hiển thị câu hỏi đầu tiên
    displayQuestion();
}

function nextRoom() {
    currentRoomIndex++;
    startRoom(currentRoomIndex);
}

// Hàm hiển thị giao diện phòng an toàn (sẽ làm sau)
function showSafeRoomUI() {
     console.log("Entered Safe Room");
     addToLog("Bạn đã đến khu vực an toàn. Hãy chuẩn bị cho thử thách tiếp theo!");
     // Hiện các nút/tùy chọn cho Shop, Nâng cấp, Lưu game (nếu thủ công), Đi tiếp...
     // Tạm thời thêm nút đi tiếp:
     const nextButton = document.createElement('button');
     nextButton.textContent = "Rời Phòng An Toàn";
     nextButton.className = 'menu-button'; // Tái sử dụng class nút
     nextButton.onclick = () => {
          logWindowOutput.removeChild(nextButton); // Xóa nút sau khi bấm
          nextRoom();
     };
     logWindowOutput.appendChild(nextButton); // Thêm nút vào log tạm
}

// >>> THÊM HÀM MỚI NÀY VÀO <<<

function handleAnswer(selectedOption, correctAnswer, buttonElement) {
    console.log(`Answer selected: "${selectedOption}". Correct answer: "${correctAnswer}"`);

    // Ngăn chặn click nhiều lần hoặc sau khi đã xử lý
    const allAnswerButtons = answerOptionsElement.querySelectorAll('button');
    allAnswerButtons.forEach(btn => btn.disabled = true); // Vô hiệu hóa tất cả các nút

    // Biến để kiểm tra đúng sai
    const isCorrect = selectedOption === correctAnswer;

    // Hiển thị phản hồi trực quan trên nút
    buttonElement.classList.add(isCorrect ? 'correct' : 'incorrect');
    if (!isCorrect) {
        // Tìm và highlight nút đúng (nếu chọn sai)
        allAnswerButtons.forEach(btn => {
             // Sử dụng dataset đã lưu hoặc so sánh text
             // Cách 1: Dùng dataset (nếu đã lưu text đáp án đúng vào data-correct-answer-text)
             if (btn.textContent === buttonElement.dataset.correctAnswerText) {
                 btn.classList.add('reveal-correct'); // Highlight nút đúng
             }
             // ... tính toán thưởng ...
    playerCharacter.xp += xpReward;
    playerCharacter.gold += goldReward;
    levelUpCheck(); 
    // ... cập nhật địch ...
    checkEncounterEnd(true);
        });
    }


    // --- Xử Lý Logic Đúng/Sai ---
    if (isCorrect) {
        // *** XỬ LÝ KHI TRẢ LỜI ĐÚNG ***
        addToLog(`Chính xác!`);
        currentCombo++;
        questionsCorrectInRoom++;

        // Tính toán phần thưởng/sát thương
        let baseDamage = playerCharacter.stats.atk;
        let bonusDamage = currentCombo >= 2 ? currentCombo : 0;
        let bonusGold = currentCombo >= 2 ? Math.floor(currentCombo / 2) : 0;
        let xpReward = 2; // XP thưởng mỗi câu đúng
        let goldReward = 1 + bonusGold; // Vàng thưởng mỗi câu đúng + bonus

        // TODO: Xử lý kỹ năng "Cú Đánh Chuẩn Xác" nếu active (baseDamage *= 2)

        let totalDamage = baseDamage + bonusDamage;

        addToLog(`Combo ${currentCombo}! Gây ${totalDamage} sát thương. +${xpReward} XP, +${goldReward} Vàng.`);

        // Cập nhật chỉ số Player
        playerCharacter.xp += xpReward;
        playerCharacter.gold += goldReward;
        // TODO: Gọi hàm kiểm tra lên cấp (levelUpCheck())

        // Cập nhật chỉ số Enemy (nếu có)
        if (currentEnemy) {
            currentEnemy.currentHp -= totalDamage;
            updateEnemyStatsUI(currentEnemy); // Cập nhật HP bar địch
        }

        // Kiểm tra kết thúc encounter/phòng
        checkEncounterEnd(true); // true vì trả lời đúng


    } else {
        // *** XỬ LÝ KHI TRẢ LỜI SAI ***
        addToLog(`Sai rồi! Đáp án đúng là: ${correctAnswer}`);
        currentCombo = 0; // Reset combo

        // Tính sát thương nhận vào
        let damageTaken = 0;
        if (currentEnemy && currentEnemy.baseDamage) {
             // TODO: Kiểm tra kỹ năng né tránh "Lẩn Tránh Tức Thời" của Trinh Sát
             let actualBaseDamage = currentEnemy.baseDamage; // Sát thương gốc của quái
             let playerDefense = playerCharacter.stats.def || 0; // Lấy DEF người chơi
             damageTaken = Math.max(1, actualBaseDamage - playerDefense); // Ít nhất mất 1 HP

             addToLog(`${currentEnemy.name} tấn công! Bạn mất ${damageTaken} HP.`);
             playerCharacter.currentHp -= damageTaken;

             // TODO: Xử lý kỹ năng hồi máu "Ý Chí Bất Khuất" của Hộ Pháp (kích hoạt sau khi bị đánh)

        } else {
             addToLog("May mắn là không có gì nguy hiểm xảy ra."); // Trường hợp trả lời sai câu hỏi/puzzle không có địch
        }

         // Kiểm tra Game Over
         if (playerCharacter.currentHp <= 0) {
              gameOver(); // Sẽ tạo hàm này sau
              return; // Dừng xử lý nếu đã thua
         }

         // Kiểm tra kết thúc encounter/phòng (vẫn gọi để có thể chuyển nếu hết câu hỏi)
         checkEncounterEnd(false); // false vì trả lời sai
    }

    // --- Cập Nhật UI Chung ---
    updatePlayerStatsUI(); // Cập nhật HP, XP, Vàng player
    updateComboUI();     // Cập nhật hiển thị combo
}

// Hàm kiểm tra kết thúc Encounter/Phòng (Cần tạo hàm này)
function checkEncounterEnd(answeredCorrectly) {
    let encounterOver = false;
    let allAnswerButtons = answerOptionsElement.querySelectorAll('button'); 

    allAnswerButtons.forEach(btn => btn.disabled = true);
     // Kiểm tra nếu hết HP địch
     if (currentEnemy && currentEnemy.currentHp <= 0) {
          addToLog(`Bạn đã đánh bại ${currentEnemy.name}!`);
          encounterOver = true;
          // TODO: Thêm logic nhận thưởng cuối trận (nếu có riêng)
          currentEnemy = null; // Xóa địch hiện tại
          updateEnemyStatsUI(null); // Ẩn UI địch
     }

     // Kiểm tra nếu hoàn thành số câu hỏi yêu cầu (cho cả có địch và không)
     if (questionsCorrectInRoom >= (currentRoomData?.questionsToComplete || 1) ) {
         addToLog(`Hoàn thành thử thách phòng ${currentRoomData?.roomNumber}!`);
         encounterOver = true;
         // Nhận thưởng phòng
         if (currentRoomData?.reward) {
             let rewardXP = currentRoomData.reward.xp || 0;
             let rewardGold = currentRoomData.reward.gold || 0;
             if(currentRoomData.reward.goldRange) { // Xử lý gold range cho boss
                  rewardGold = Math.floor(Math.random() * (currentRoomData.reward.goldRange[1] - currentRoomData.reward.goldRange[0] + 1)) + currentRoomData.reward.goldRange[0];
             }
             // TODO: Xử lý thưởng vật phẩm currentRoomData.reward.items
             addToLog(`Nhận thưởng: +${rewardXP} XP, +${rewardGold} Vàng!`);
             playerCharacter.xp += rewardXP;
             playerCharacter.gold += rewardGold;
             updatePlayerStatsUI();
             levelUpCheck();
         }
     }

     if (encounterOver) {
        addToLog(`Hoàn thành thử thách phòng ${currentRoomData?.roomNumber}!`);
         // Nếu kết thúc, chờ một chút rồi chuyển phòng
          questionWindow.style.display = 'none'; // Ẩn câu hỏi đi
          questionWindow.classList.remove('active'); // Gỡ active nếu dùng class
         setTimeout(() => {
            console.log("Moving to next room...");
            nextRoom();
        }, 1500);
    } else {
        console.log("Encounter not over, preparing next question...");
        questionWindow.style.display = 'none';
         questionWindow.classList.remove('active');
         setTimeout(() => {
            console.log("Displaying next question...");
            displayQuestion(); // Hiển thị câu hỏi tiếp theo
         }, 1000);
     }
}

// Hàm xử lý Game Over (Cần tạo hàm này)
function gameOver() {
    console.error("GAME OVER!");
    addToLog("----- GAME OVER -----");
    alert("Bạn đã thất bại! Hãy cố gắng hơn lần sau.");
    // TODO: Hiển thị màn hình Game Over và nút Chơi lại
    // switchScreen('game-over-screen');
     // Tạm thời reset về title
     // location.reload(); // Cách đơn giản nhất để chơi lại là tải lại trang
}

// Hàm kiểm tra Lên cấp (Cần tạo hàm này)
// function levelUpCheck() { ... }

// >>> KẾT THÚC THÊM HÀM <<<

// --- End Game Flow Functions ---



console.log("Game script loaded. Initializing title screen...");
