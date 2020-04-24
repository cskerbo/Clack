const BASE_URL = 'http://localhost:3000';
const WEB_SOCKET_URL = 'ws://localhost:3000/cable';
const siteContainer = document.querySelector('#site-container');
const loginContainer = document.querySelector('#login-container');
const newUserContainer = document.querySelector('#new-user-container');
const channelContainer = document.querySelector('#new-channel-container')
const channelList = document.querySelector('#channel-list');
const newChannel = document.querySelector('#create-channel');
const messageContainer = document.querySelector('#messages');
const messageForm = document.querySelector('#create-message');
const messageText = document.querySelector('#text-area')
const messageInput = document.querySelector('#message-span')
const currentChannel = document.querySelector('#current-channel');
const channelHeader = document.querySelector('#channel-header');
const loginForm = document.querySelector('#login-form');
const newUserForm = document.querySelector('#new-user-form');
const newLink = document.querySelector('#new-user-link');
const addIcon = document.querySelector('#add-icon')
let sockets = []

function isLoggedIn() {
    let userToken = localStorage.getItem('token');
    if (userToken) {
        siteContainer.style = '';
        loginContainer.style = 'display: none';
        setCurrentUser()
        setTimeout(function() { getChannelList(); }, 100)
    }
    else {
        loginContainer.style = '';
        siteContainer.style = 'display: none'
    }
}

function createUser(email, username, password) {
    fetch(`${BASE_URL}/users`,{
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            enctype: 'multipart/form-data'
        },
        body: JSON.stringify({
            user: {email, username, password}
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
        loginContainer.style = '';
        newUserContainer.style = 'display: none';
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

function fetchCurrentUser() {
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
}

function findUserById(id) {
    return fetch(`${BASE_URL}/set_user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
            user: {id}
        })
    })
}

function setCurrentUser() {
    fetchCurrentUser()
        .then(response => response.json())
        .then  (userObject => {
            localStorage.setItem('user_id', `${userObject.id}`);
        })
}

function renderChannel(room) {
        let newLi = document.createElement('li');
        newLi.classList.add('nav-item');
        newLi.dataset.roomId = room.id;
        newLi.innerText = `${room.name}`;
        newLi.addEventListener('click', event => {
            findChannel(event.target.dataset.roomId)
        })
        channelList.appendChild(newLi)
}

function getChannelList() {
    fetch(`${BASE_URL}/rooms`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
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
    findUserById(message.user_id)
        .then(response => response.json())
        .then  (userObject => {
            let newMessageContainer = document.createElement('div')
            newMessageContainer.classList.add('user-message', 'row')
            let pictureContainer = document.createElement('div');
            pictureContainer.classList.add('col-md-1')
            let userPicture = document.createElement('img')
            userPicture.classList.add('user-icon')
            userPicture.setAttribute('src', `images/user_icon.png`)
            userPicture.style = 'height: 40px; width: 40px'
            let textContainer = document.createElement('div')
            textContainer.classList.add('col-md-11')
            let newMessageHeader = document.createElement('h5');
            newMessageHeader.classList.add('message-header')
            newMessageHeader.innerText = `${userObject.username}`
            let newMessageText = document.createElement('P');
            newMessageText.classList.add('message-text')
            newMessageText.innerText = `${message.content}`
            let messageTimestamp = document.createElement('P');
            messageTimestamp.classList.add('timestamp')
            let day = new Date(message.updated_at)
            let timestamp = day.toLocaleString('en-us', {hour: '2-digit', minute:'2-digit'});
            let today = new Date()
            if (day.getDay() === today.getDay()) {
                messageTimestamp.innerText = timestamp
            }
            else {
                messageTimestamp.innerText = day.toLocaleString( 'en-us', { weekday: 'long'} )
            }
            pictureContainer.appendChild(userPicture)
            textContainer.appendChild(newMessageHeader)
            textContainer.appendChild(newMessageText)
            textContainer.appendChild(messageTimestamp)
            newMessageContainer.appendChild(pictureContainer)
            newMessageContainer.appendChild(textContainer)
            newMessageContainer.dataset.messageId = message.id;
            messageContainer.appendChild(newMessageContainer)
            messageText.value = ''
        })
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
}

function checkSocket() {
    console.log()
}

function createWebsocket(roomId) {
    removeAllClients()
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
    sockets.push(socket)
    console.log(sockets)
}

function removeAllClients(){
    sockets.forEach(function(s) {
        s.close();
    });

}

document.addEventListener('DOMContentLoaded',() => {
    isLoggedIn();
    addIcon.addEventListener('click', event => {
        channelContainer.style = ''
    });
    newChannel.addEventListener('submit', event => {
        event.preventDefault();
        createChannel(event.target[0].value)
        channelContainer.style.display = "none";
    });
    messageInput.addEventListener('click', event => {
        createMessage(event.path[3].firstElementChild.value, event.path[3].dataset.roomId)

    });
    messageText.addEventListener("keydown", event => {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13 && !event.shiftKey) {
            console.log(event)
            createMessage(event.path[0].value, event.path[1].dataset.roomId)
        }
    });
    loginForm.addEventListener('submit', event => {
        event.preventDefault();
        userLogin(event.target[0].value, event.target[1].value)

    });
    newUserForm.addEventListener('submit', event => {
        event.preventDefault();
        createUser(event.target[0].value, event.target[1].value, event.target[2].value)
    });
    newLink.addEventListener('click', event => {
        event.preventDefault();
        loginContainer.style = 'display: none';
        newUserContainer.style = ''
    });
    let modal = document.getElementById('id02');
    window.onclick = function(event) {
        if (event.target == modal) {
            channelContainer.style.display = "none";
        }
    }
});



