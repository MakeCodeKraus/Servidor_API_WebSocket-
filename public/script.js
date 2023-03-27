let socket;
let searching = false;
let searchAnimationInterval;

const divUsers = document.getElementById('divUsers');
const lblOnlineUsersCount = document.getElementById('lblOnlineUsersCount');
const lblSeatching = document.getElementById('lblSeatching');
const divLobby = document.getElementById('divLobby');
const divGame = document.getElementById('divGame')

CheckToken();

function goToRegister() {
  document.getElementById("panelLogin").classList.add("animate__fadeOutLeft");
  setTimeout(() => {
    document.getElementById("panelLogin").classList.add("hide");
    document
      .getElementById("panelRegistro")
      .classList.remove("hide", "animate__fadeOutRight");
    document
      .getElementById("panelRegistro")
      .classList.add("animate__fadeInRight");
  }, 550);
}

function goToLogin() {
  document
    .getElementById("panelRegistro")
    .classList.add("animate__fadeOutRight");
  setTimeout(() => {
    document.getElementById("panelRegistro").classList.add("hide");
    document
      .getElementById("panelLogin")
      .classList.remove("hide", "animate__fadeOutLeft");
    document.getElementById("panelLogin").classList.add("animate__fadeInLeft");
  }, 550);
}
async function CheckToken() {
  const token = localStorage.getItem("token");

  if (!token) {
    return;
  }
  const resp = await fetch('/auth/check', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-token': token
    },
  })
  if (resp.ok) {
    goToLobby(token);
  }
}
function ConnectWebSocket(token) {
  socket = io(window.location.host, {
    auth: { token }
  });

  socket.on("welcome", (data) => {
    console.log("Server: " + data.message);
    setOnlineUsers(data.onlineUsers);
    lblOnlineUsersCount.innerHTML = data.onlineUsers.length;
  })

  socket.on("userConnected", (data) => {
    console.log(data.username + " se ha conectado");
    addOnlineUser(data.username);
    lblOnlineUsersCount.innerHTML = Number(lblOnlineUsersCount.innerHTML) + 1;

  })

  socket.on("userDisconnected", (data) => {
    console.log(data.username + " se ha desconectado");
    lblOnlineUsersCount.innerHTML = Number(lblOnlineUsersCount.innerHTML) - 1;
    removeOnlineUser(data.username);
  })

  socket.on("matchReady", function (data) {
    divLobby.style.visibility = "hidden";
    divGame.style.visibility = "visible";
  });

  socket.on("connectionRejected", function (resp) {
    console.log("Desconectado", resp);
    window.location = "index.html";
  });
  socket.on("disconnected", function (reason) {
    console.log(reason);
  });
  socket.on("error", function (reason) {
    console.log(reason);
  });
}

function goToLobby(token) {
  document.getElementById("divAutenticacion").style.display = "none";
  document.getElementById("divLobby").style.display = "block";
  ConnectWebSocket(token);

}

document.getElementById('formRegistro').onsubmit = async (e) => {
  e.preventDefault();

  let data = {
    email: document.formRegistro.email.value,
    password: document.formRegistro.password.value
  }

  const resp = await fetch('http://localhost:3000/auth/signup', {
    method: "POST",
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data)
  })

  const { token, user } = await resp.json();
  localStorage.setItem("token", token);
  goToLobby(token);
};

document.getElementById('formLogin').onsubmit = async (e) => {
  e.preventDefault();

  let data = {
    email: document.formLogin.username.value,
    password: document.formLogin.password.value
  }

  const resp = await fetch('http://localhost:3000/auth/login', {
    method: "POST",
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (resp.ok) {
    const { token, user } = await resp.json();
    localStorage.setItem("token", token);
    goToLobby(token);
  }

}

document.getElementById('btnSearchMatch').onclick = function () {
  if (!searching) {
      this.innerHTML = 'Cancelar';
      matchSearchStart();
  } else {
      this.innerHTML = 'Buscar Partida';
      matchSearchStart();
  }
}

function matchSearchStart() {
  socket.emit('searchMatch');
  searching = true;
  searchAnimationInterval = setInterval(searchingAnimation, 400);
}

function matchSearchEnd() {
  socket.emit('stopSearchMatch');
  searching = false;
  clearInterval(searchAnimationInterval);
  lblSeatching.innerHTML = "";
}

function searchingAnimation() {
  let searchText = lblSeatching.innerHTML;
  if (searchText == '') {
      lblSeatching.innerHTML = ' ';
  } else if (searchText.split('.').length < 4) {
      lblSeatching.innerHTML += '.'; 
  }else{
      lblSeatching.innerHTML = ' ';
  }
}

function setOnlineUsers(onlineUsers) {
  divUsers.innerHTML = "";
  onlineUsers.forEach((user) => {
      divUsers.innerHTML +=
          `<div id="${user.username}"> ${user.username} </div>`;
  });

}

function addOnlineUser(username) {
  let userElement = document.createElement('div'); userElement.id = username;
  userElement.innerHTML = username;
  divUsers.append(userElement);
}

function removeOnlineUser(username) {
  document.getElementById(username)?.remove();
}
