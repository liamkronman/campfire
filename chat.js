const uuidv4 = require('uuid').v4;

const users = new Map();

const defaultUser = ''

let campers = [];

let lastMessage = [defaultUser, ''];

const messageExpirationTimeMS = 10000;

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;

    socket.on('getMessages', () => this.getMessages());
    socket.on('message', (resp) => this.handleMessage(resp));
    socket.on('disconnect', () => this.disconnect());
    socket.on('connect_error', (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }
  
  sendMessage(message) {
    console.log(users)
    console.log(message.value)
    this.io.sockets.emit('message', message);
  }
  
  getMessages() {
    messages.forEach((message) => this.sendMessage(message));
  }

  handleMessage(resp) {
    let value = resp[resp.length - 1]
    let campName = resp.slice(0, resp.length - 2)
    const message = {
      id: uuidv4(),
      user: campName,
      value,
      time: Date.now()
    };

    if (lastMessage[0] === campName) {
        message.value = lastMessage[1] + value
    } else {
        lastMessage[0] = campName
    }
    lastMessage[1] = message.value;
    console.log(message)
    this.sendMessage(message);

    // setTimeout(
    //   () => {
    //     this.io.sockets.emit('deleteMessage', message);
    //     lastMessage[0] = "";
    //     lastMessage[1] = "";
    //   },
    //   messageExpirationTimeMS,
    // );
  }

  disconnect() {
    users.delete(this.socket);
  }
}

function chat(io) {
  io.on('connection', (socket) => {
    // users.add(socket);
    new Connection(io, socket);   
  });
};

module.exports = chat;