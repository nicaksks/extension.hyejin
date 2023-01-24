const userName = document.getElementById('userName');
const level = document.getElementById('level');
const character = document.getElementById('character');
const match = document.getElementById('match');

document.getElementById("logout").addEventListener("click", logout);

const headers = {
  'x-api-key': "key"
  //Get key in https://developer.eternalreturn.io
}

window.onload = function() {
  document.getElementsByClassName('loading')[0].style.display = "none";
  document.getElementsByClassName('logout')[0].style.display = "none";
  document.getElementsByClassName('container')[0].style.display = "block";
  getProfile();
}

const fetchData = async (url) => {
  const response = await fetch(url, { headers });
  return response.json();
}

async function getUserNum() {
  const { user } = await fetchData(`https://open-api.bser.io/v1/user/nickname?query=${localStorage.userName}`);
  return user.userNum;
}

async function getProfile() {
  const userNum = await getUserNum();
  const [history, ranked, matchs] = await Promise.all([getHistory(userNum), getRanked(userNum), getMatchs()]);

  const { userStats } = await fetchData(`https://open-api.bser.io/v1/user/stats/${userNum}/0`);
  const { nickname } = userStats[0];
  userName.innerHTML = nickname;
  level.style.display = "block";

  try {
    level.innerHTML = history[0].accountLevel;
    character.src = `assets/imgs/characters/${history[0].characterNum}.png`;
    document.getElementsByClassName('loading-img')[0].style.display = "none";
    document.getElementsByClassName('logout')[0].style.display = "block";
  } catch(e) {
    localStorage.removeItem("userName");
    alert("Esse jogador está mais de 6 meses sem jogar. \nQuando um jogador fica inativo não é possível recuperar as informações.")
    window.location.href = "/index.html"; 
  }

  match.innerHTML = matchs;
}

async function getRanked(userNum) {
  const seasonId = await season();
  const { userStats } = await fetchData(`https://open-api.bser.io/v1/user/stats/${userNum}/${seasonId}`);
  return userStats;
}

async function getHistory(userNum) {
  const { userGames } = await fetchData(`https://open-api.bser.io/v1/user/games/${userNum}`);
  return userGames;
}

const getMatchs = async () => {
  const userNum = await getUserNum();
  const match = await getHistory(userNum);

  if (!match) {
    return "No info";
  }

  let t;
  match.length >= 3 ? t = 3 : t = match.length;

  let content = "";
  content = getLoop(match, t);

  return content;
}

function getLoop(match , t) {
  let content = "";

  for(let i=0; i < t; i++) {

    let = { 
      gameRank, characterNum, escapeState, matchingMode, gameMode, matchingTeamMode, playerKill, playerAssistant, playerDeaths, 
      monsterKill, serverName, mmrAfter, mmrGain
    } = match[i];

    let pdl = mmrGain;
    let mmr = mmrAfter;

    if (pdl > 1) {
      pdl = `<span style="color: green; font-weight: bold;"> +${pdl}</span>`;
    } else if (pdl === 0) {
      pdl = "";
    } else {
      pdl = `<span style="color: red; font-weight: bold;">${pdl}</span>`;
    }

    //--//
    if(escapeState === 3) {
      gameRank = `Escape Success! <br>${gameModeList()[matchingTeamMode]} ${gameModeName()[matchingMode]} </br>${serverName}`;
    } else if(escapeState === 1 || escapeState === 2) {
      gameRank = `Escape Fail! <br>${gameModeList()[matchingTeamMode]} ${gameModeName()[matchingMode]} </br>${serverName}`;
    } else if(matchingMode === 6 && gameRank === 1) {
      gameRank = `<span style="color: green; font-weight: bold;"> Victory!</span> </br>Cobalt </br>${serverName}`;
    } else if(matchingMode === 6 && gameRank === 2){
      gameRank = `<span style="color: red; font-weight: bold;">Defeat</span> </br>Cobalt </br>${serverName}`;
    } else if (matchingMode === 2) {
      gameRank = `#${gameRank} <br>${gameModeList()[matchingTeamMode]} ${gameModeName()[matchingMode]} </br>${serverName}`;
    } else if (matchingMode === 3) {
      gameRank = `#${gameRank} <br>${gameModeList()[matchingTeamMode]} ${gameModeName()[matchingMode]} </br>${serverName}`;
    };

    //--//
    if(matchingMode === 2) {
      playerInfo = `<td><img src=../../assets/imgs/characters/${characterNum}.png class="tabela-img"></td> <td>${playerKill} / ${playerAssistant} / ${monsterKill} <br>K / A / H</td>`;
    } else if(matchingMode === 6) {
      playerInfo = `<td><img src=../../assets/imgs/characters/${characterNum}.png class="tabela-img"></td> <td>${playerKill} / ${playerDeaths} / ${playerAssistant} <br>K / D / A</td>`;
    } else {
      playerInfo = `<td><img src=../../assets/imgs/characters/${characterNum}.png class="tabela-img"> <img class="elo" src=${elo(mmr)}></td> <td>${playerKill} / ${playerAssistant} / ${monsterKill} <br>K / A / H</td> <td>${mmr} ${pdl} <br>MMR</td></td>`;
    };
    
    content += `
    <table class="tabela">
      <tr>
        <th scope="row">
          <center>
            ${gameRank}
          </center>
          </th>
        ${playerInfo}
      </tr>
    </table>
    `
  };

  return content;
}

async function season() {
  const { data } = await fetchData('https://open-api.bser.io/v1/data/Season', { headers });
  const seasonId = data.slice(-1)[0].seasonID;

  return seasonId;
}

function gameModeList() {
  const list = {
    1: "Solo",
    2: "Duo",
    3: "Squad"
  }

  return list;
}

function gameModeName() {
  const name = {
    2: "Normal",
    3: "Ranked"
  }

  return name;
}

function elo(mmr) {
	
  let elo;
	
	if(mmr > 0 && mmr < 400) {
		elo = "assets/imgs/elo/1.png";
	} else if(mmr >= 400 && mmr < 800) {
		elo = "assets/imgs/elo/2.png";
	} else if(mmr >= 800 && mmr < 1200) {
		elo = "assets/imgs/elo/3.png";
	} else if(mmr >= 1200 && mmr < 1600) {
		elo = "assets/imgs/elo/4.png";
	} else if(mmr >= 1600 && mmr < 2000) {
		elo = "assets/imgs/elo/5.png";
	} else if(mmr >= 2000 && mmr < 2400) {
		elo = "assets/imgs/elo/6.png";
	} else if(mmr >= 2400 && mmr < 2800) {
		elo = "assets/imgs/elo/7.png";
	} else if(mmr >= 2800) {
		elo = "assets/imgs/elo/8.png";
	} else {
		elo = "assets/imgs/elo/0.png";
	}
  return elo;
}

function logout() {
  localStorage.removeItem("userName");
  alert("Você deslogou da sua conta.");
  window.location.href = "/index.html";
}