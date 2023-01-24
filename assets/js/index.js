const form = document.querySelector('form');

const headers = {
  'x-api-key': "key"
  //Get key in https://developer.eternalreturn.io
}

window.onload = function() {

  document.getElementsByClassName('loading')[0].style.display = "none";
  document.getElementsByClassName('content')[0].style.display = "block"
  
  if(localStorage.userName)
  window.location.href = "/profile.html"; 
};

form.addEventListener("submit", async function(event) {
  event.preventDefault();

  const userName = document.querySelector("#userName");
  localStorage.userName = userName.value;

  const userNum = await fetch(`https://open-api.bser.io/v1/user/nickname?query=${localStorage.userName}`, { headers })
  .then((response) => response.json())
  .then((data) => data.code);

  if(userNum === 404) {
    localStorage.removeItem("userName");
    alert("Esse conta não existe.");
  } else {
    alert("Nome salvo com sucesso!");
    window.location.href = "/profile.html";
  }
});