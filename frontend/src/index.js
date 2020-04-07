const BASE_URL = 'http://localhost:3000'
const WEB_SOCKET_URL = 'ws://localhost:3000/cable'
const channelList = document.querySelector('channel-list')
const messageForm = document.querySelector('create-message')
const messageContainer = document.querySelector('messages')

function renderChannels(allRooms) {
    allRooms.forEach(room => {
        let newDiv = document.createElement('div');
        newDiv.classList.add('channel')
        let newP = document.createElement('p');
        newP.innerText = room.name
        newDiv.appendChild(p)
        channelList.appendChild(newDiv)
    })
}

