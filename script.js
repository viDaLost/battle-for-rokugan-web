let currentPlayerIndex = 0;
let players = [];
let phase = "Подготовка";
let round = 1;
const maxRounds = 5;

window.onload = () => {
  initializeGame();
};

function initializeGame() {
  players = [
    { name: "Игрок 1", clan: clans[0], tokens: [], control: [], secretObjective: secretObjectives[0], score: 0 },
    { name: "Игрок 2", clan: clans[1], tokens: [], control: [], secretObjective: secretObjectives[1], score: 0 }
  ];
  shuffle(players);
  renderTokens();
  renderProvinces();
  updatePhase("Размещение");
  updatePlayersPanel();
  logAction(`Первым ходит ${players[currentPlayerIndex].name} (${players[currentPlayerIndex].clan.name})`);
}

function renderTokens() {
  const bar = document.getElementById("token-bar");
  bar.innerHTML = "";
  tokens.forEach((t, i) => {
    const div = document.createElement("div");
    div.className = "token";
    div.textContent = t.type;
    div.draggable = true;
    div.dataset.tokenIndex = i;
    div.ondragstart = e => e.dataTransfer.setData("token", JSON.stringify(t));
    bar.appendChild(div);
  });
}

function renderProvinces() {
  const map = document.getElementById("map");
  map.innerHTML = "";
  provinces.forEach(p => {
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", p.points);
    poly.setAttribute("class", "province");
    poly.setAttribute("id", p.id);
    poly.setAttribute("data-name", p.name);
    poly.ondragover = e => e.preventDefault();
    poly.ondrop = e => {
      const token = JSON.parse(e.dataTransfer.getData("token"));
      processTokenEffect(token, p);
    };
    map.appendChild(poly);
  });
}

function processTokenEffect(token, province) {
  const player = players[currentPlayerIndex];
  let logMsg = `${player.name} использует жетон "${token.type}" в "${province.name}"`;

  switch (token.type) {
    case "армия":
    case "флот":
      if (!player.control.includes(province.id)) {
        player.control.push(province.id);
        logMsg += " и захватывает провинцию.";
      } else {
        logMsg += " но уже контролирует эту провинцию.";
      }
      break;
    case "синоби":
      logMsg += " и получает разведданные (пока без эффекта).";
      break;
    case "налёт":
      removeRandomTokenFromProvince(province.id);
      logMsg += " и уничтожает жетон в провинции.";
      break;
    case "блеф":
      logMsg += " (на самом деле ничего не делает).";
      break;
    case "дипломатия":
      logMsg += " и получает временный союз (пока без эффекта).";
      break;
    case "благословение":
      player.score += 1;
      logMsg += " и получает 1 победное очко.";
      break;
  }

  applyClanBonus(player, token);
  renderTokenInProvince(province.id, token.type, player.clan.name);
  updatePlayersPanel();
  logAction(logMsg);
}

function applyClanBonus(player, token) {
  switch (player.clan.name) {
    case "Crab":
      if (token.type === "армия") {
        player.score += 1;
        logAction(`${player.name} получает 1 очко за оборону (способность клана Крабов).`);
      }
      break;
    case "Crane":
      if (token.type === "дипломатия") {
        player.score += 2;
        logAction(`${player.name} получает 2 очка за дипломатию (Клан Журавля).`);
      }
      break;
    case "Dragon":
      // Для примера: усиливаем жетон
      logAction(`${player.name} усиливает жетон (Клан Дракона).`);
      break;
    case "Lion":
      if (token.type === "армия") {
        player.score += 1;
      }
      break;
    case "Scorpion":
      if (token.type === "синоби") {
        player.score += 2;
        logAction(`${player.name} получает 2 очка за скрытые действия (Клан Скорпиона).`);
      }
      break;
  }
}

function removeRandomTokenFromProvince(provinceId) {
  // Заглушка
  logAction(`Происходит налёт на провинцию ${provinceId}, жетон уничтожен.`);
}

function renderTokenInProvince(provinceId, tokenType, clanName) {
  const map = document.getElementById("map");

  const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
  text.setAttribute("x", getProvinceCenterX(provinceId));
  text.setAttribute("y", getProvinceCenterY(provinceId));
  text.setAttribute("fill", "#3e2f1c");
  text.setAttribute("font-size", "12");
  text.setAttribute("text-anchor", "middle");
  text.style.userSelect = "none";
  text.textContent = `${tokenType} (${clanName[0]})`;
  map.appendChild(text);
}

function getProvinceCenterX(id) {
  const poly = document.getElementById(id);
  const points = poly.getAttribute("points").split(" ").map(p => p.split(",").map(Number));
  const x = points.reduce((sum, p) => sum + p[0], 0) / points.length;
  return x;
}

function getProvinceCenterY(id) {
  const poly = document.getElementById(id);
  const points = poly.getAttribute("points").split(" ").map(p => p.split(",").map(Number));
  const y = points.reduce((sum, p) => sum + p[1], 0) / points.length;
  return y;
}

function logAction(text) {
  const log = document.getElementById("log");
  const line = document.createElement("div");
  line.textContent = text;
  log.appendChild(line);
  log.scrollTop = log.scrollHeight;
}

function endTurn() {
  currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
  round += currentPlayerIndex === 0 ? 1 : 0;
  updatePhase(round > maxRounds ? "Игра окончена" : "Размещение");
  logAction(`Ход переходит к ${players[currentPlayerIndex].name}`);
  updatePlayersPanel();

  if (round > maxRounds) {
    endGame();
  }
}

function updatePhase(newPhase) {
  phase = newPhase;
  document.getElementById("phase").textContent = `Фаза: ${phase}`;
}

function updatePlayersPanel() {
  const panel = document.getElementById("players-panel");
  panel.innerHTML = "";
  players.forEach(p => {
    const div = document.createElement("div");
    div.textContent = `${p.name} (Клан ${p.clan.name}) — Очки: ${p.score} — Контроль: ${p.control.length} провинций — Цель: ${p.secretObjective.text}`;
    panel.appendChild(div);
  });
}

function endGame() {
  logAction("Игра завершена. Подсчёт очков...");

  players.forEach(p => {
    p.score += p.control.length;

    if (checkObjective(p)) {
      p.score += 3;
      logAction(`${p.name} выполнил секретную цель и получает +3 очка`);
    } else {
      logAction(`${p.name} не выполнил секретную цель`);
    }

    logAction(`${p.name} (Клан ${p.clan.name}): ${p.score} очков`);
  });

  const winner = players.reduce((max, p) => (p.score > max.score ? p : max), players[0]);
  logAction(`Победитель: ${winner.name} с ${winner.score} очками`);
}

function checkObjective(player) {
  const obj = player.secretObjective;
  if (obj.id === 1) {
    return player.control.length >= 3;
  }
  if (obj.id === 2) {
    return player.control.includes("prov2");
  }
  return false;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
