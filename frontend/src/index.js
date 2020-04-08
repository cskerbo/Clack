const BASE_URL = 'http://localhost:3000'
const WEB_SOCKET_URL = 'ws://localhost:3000/cable'
const channelList = document.querySelector('#channel-list')
const newChannel = document.querySelector('#create-channel')
const messageForm = document.querySelector('#create-message')
const messageContainer = document.querySelector('#messages')
const currentChannel = document.querySelector('#current-channel')

function renderChannel(room) {
        let newDiv = document.createElement('div');
        newDiv.classList.add('channel')
        newDiv.dataset.roomId = room.id
        newDiv.innerText = `${room.name}`
        newDiv.addEventListener('click', event => {
            renderCurrentChannel(event.target.dataset.roomId)
        })
        channelList.appendChild(newDiv)
}

function getChannelList() {
    fetch(`${BASE_URL}/rooms`)
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
            'Accept': 'application/json'
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
    fetch(`${BASE_URL}/rooms/${roomId}`)
        .then(response => response.json())
        .then(room => {
            console.log(room)
        })
}

function renderCurrentChannel(roomId) {
    const room  = findChannel(roomId)
    console.log(room)
    let roomHeader = document.createElement('h2');
    roomHeader.innerText = room.name;
    currentChannel.appendChild(roomHeader)

    messageForm.style = '';
    messageForm.dataset.roomId = room.id
}

document.addEventListener('DOMContentLoaded',() => {
    getChannelList();
    newChannel.addEventListener('submit', event => {
        event.preventDefault();
        createChannel(event.target[0].value)
    })
})


