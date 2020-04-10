const BASE_URL = 'http://localhost:3000';
const WEB_SOCKET_URL = 'ws://localhost:3000/cable';
const siteContainer = document.querySelector('#site-container');
const loginContainer = document.querySelector('#login-container');
const channelList = document.querySelector('#channel-list');
const newChannel = document.querySelector('#create-channel');
const messageContainer = document.querySelector('#messages');
const messageForm = document.querySelector('#create-message');
const currentChannel = document.querySelector('#current-channel');
const channelHeader = document.querySelector('#channel-header');
const loginForm = document.querySelector('#login-form');


function isLoggedIn() {
    let userToken = localStorage.getItem('token');
    if (userToken) {
        siteContainer.style = '';
        loginContainer.style = 'display: none';
        findCurrentUser()
            .then  (userObject => {
                localStorage.setItem('user_id', `${userObject.id}`)
            })
        getChannelList()
    }
    else {
        loginContainer.style = '';
        siteContainer.style = 'display: none'
    }
}

function createUser(email, password) {
    fetch(`${BASE_URL}/users`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            user: {email, password}
        })
    })
        .then(response => response.json())
        .then(responseHandler)
}

function responseHandler(response) {
    if (response.exception) {
        alert("Oh Clack! There was an error: " + response.exception);
    }
    else {
        alert("Success! Your account has been created! You may now login.");
    }
}


function userLogin(email, password) {
    fetch(`${BASE_URL}/user_token`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            auth: {email, password}
        })
    })
        .then(response => response.json())
        .then(userObject => {
            localStorage.setItem('token', `${userObject.jwt}`);
            localStorage.setItem('email', `${email}`);
            isLoggedIn()
        })
}

function findCurrentUser() {
    let email = localStorage.getItem('email')
    return fetch(`${BASE_URL}/find_user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            user: {email}
        })
    })
        .then(response => response.json())
}

function renderChannel(room) {
        let newDiv = document.createElement('div');
        newDiv.classList.add('channel');
        newDiv.dataset.roomId = room.id;
        newDiv.innerText = `${room.name}`;
        newDiv.addEventListener('click', event => {
            findChannel(event.target.dataset.roomId)
        })
        channelList.appendChild(newDiv)
}

function getChannelList() {
    fetch(`${BASE_URL}/user_rooms`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
        room: {user_id: `${localStorage.getItem('user_id')}`}
    })
    })
        .then(response => response.json())
        .then(allRooms => {
            allRooms.forEach( room => {
                renderChannel(room)
            })
        })
}

function createChannel(channelName) {
    fetch(`${BASE_URL}/rooms`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            name: channelName
        })
    })
        .then(handleErrors)
        .then(response => response.json())
        .then(room => {renderChannel(room)})
        .catch(err => alert('Oh Clack! It looks like there was an error: ' + err.message + ". Make sure you entered a name."));
    newChannel.reset();
}

function handleErrors(response) {
    if (!response.ok) throw Error(response.statusText);
    return response;
}

function findChannel(roomId) {
    fetch(`${BASE_URL}/rooms/${roomId}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
    })
        .then(handleErrors)
        .then(response => response.json())
        .then(room => {
            renderCurrentChannel(room)
        })
        .catch(err => alert('Oh Clack! It looks like there was an error: ' + err.message ));
}

function renderCurrentChannel(room) {
    checkSocket()
    currentChannel.style = '';
    messageContainer.innerHTML = '';
    messageContainer.setAttribute('id', 'messages');
    channelHeader.innerText = room.name;
    messageForm.style = '';
    messageForm.dataset.roomId = room.id;

    room.messages.forEach( message => {
        renderMessage(message)
    });
    createWebsocket(room.id)
}

function renderMessage(message) {
    let newMessage = document.createElement('P');
    newMessage.innerText = `${message.content}`;
    newMessage.dataset.messageId = message.id;
    messageContainer.appendChild(newMessage)
}

function createMessage(content, roomId) {
    fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            content: content,
            room_id: roomId,
            user_id: `${localStorage.getItem('user_id')}`
        })
    })
        .then(handleErrors)
        .catch(err => alert('Oh Clack! It looks like there was an error: ' + err.message ));
    messageForm.reset();
}

function checkSocket() {
    console.log()
}

function createWebsocket(roomId) {
    let socket = new WebSocket(WEB_SOCKET_URL);
    socket.onopen = function(event) {
        console.log('Socket is open');
        const newMessage = {
            command: 'subscribe',
            identifier: JSON.stringify({
                id: roomId,
                channel: 'RoomChannel'
            }),
        };
        socket.send(JSON.stringify(newMessage));
    };
    socket.onclose = function(event) {
        console.log('Socket is closed')
    };
    socket.onmessage = function(event) {
        const response = event.data;
        const newMessage = JSON.parse(response);
        if (newMessage.type === "ping") {
            return;
        }
        if (newMessage.message) {
            renderMessage(newMessage.message)
        }
    };
    socket.onerror = function(error) {
        console.log(error)
    }
}

document.addEventListener('DOMContentLoaded',() => {
    isLoggedIn();
    newChannel.addEventListener('submit', event => {
        event.preventDefault();
        createChannel(event.target[0].value)
    });
    messageForm.addEventListener('submit', event => {
        event.preventDefault();
        createMessage(event.target[0].value, event.target.dataset.roomId)
    });
    loginForm.addEventListener('submit', event => {
        event.preventDefault();
        userLogin(event.target[0].value, event.target[1].value)
    });
});



