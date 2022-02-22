import './App.css';
import React, { useRef, useEffect } from 'react';
import campfireBackground from './assets/campfire-background-mac.png';
import thefire1 from './assets/thefire.png';
import thefire2 from './assets/thefire_2.png';
import io from 'socket.io-client';

function App() {
  const [inputValue, setInputValue] = React.useState("");
  const [showInstruct, setShowInstruct] = React.useState(false);
  const [inFire, setInFire] = React.useState(false);
  const [socket, setSocket] = React.useState(null);
  const [currMessageAuthor, setCurrMessageAuthor] = React.useState("");
  const [currMessage, setCurrMessage] = React.useState("");
  const [campName, setCampName] = React.useState(null);
  const [frameNum, setFrameNum] = React.useState(1);
  const [currFire, setCurrFire] = React.useState(thefire1);
  const [timeWhenLastUpdate, setTimeWhenLastUpdate] = React.useState(null);
  const [timeSinceLastUpdate, setTimeSinceLastUpdate] = React.useState(null);
  const requestRef = React.useRef();

  const handleInputChange = (event) => {
    if (event.target.value.length > 0) {
      setShowInstruct(true);
    } else {
      setShowInstruct(false);
    }
    setInputValue(event.target.value);
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      setCampName(inputValue);
      setInFire(true)
      const newSocket = io(`http://localhost:8080/api`);
      setSocket(newSocket);
    }
  }

  const handleTyping = (event) => {
    socket.emit('message', `${campName}:${event.key}`);
  }

  useEffect(() => {
    if (socket) {
      socket.on('message', (message) => {
        setCurrMessage(message.value)
        setCurrMessageAuthor(message.user)
      })
      socket.on('deleteMessage', (message) => {
        console.log('deleting message');
        if (message.value === currMessage) {
          setCurrMessage("")
          setCurrMessageAuthor("")
        }
      })
    }
  })

  const animate = (startTime) => {
    if (!timeWhenLastUpdate) setTimeWhenLastUpdate(startTime);
    setTimeSinceLastUpdate(startTime - timeWhenLastUpdate);
    if (timeSinceLastUpdate > 4000) {
      console.log('happening');
      setTimeWhenLastUpdate(startTime);
      if (frameNum >= 2) {
        setFrameNum(1);
      } else {
        setFrameNum(frameNum + 1);
      }
      if (frameNum === 1) {
        setCurrFire(thefire1);
      } else {
        setCurrFire(thefire2);
      }
    }

    requestAnimationFrame(animate);
  }

  // useEffect(() => {
  //     requestRef.current = requestAnimationFrame(animate);
  //     return () => cancelAnimationFrame(requestRef.current);
  // }, []);

  return (
    <>
      {inFire 
        ? <div className="App"
          style={{
            backgroundImage: `url(${campfireBackground})`,
            backgroundSize: 'cover',
          }} tabIndex="0" onKeyPress={handleTyping} >
            <div className="text-body">
              <div className="campfire-welcome-title">Welcome<span style={{fontSize: 30}}> </span>to<span style={{fontSize: 30}}> </span><span style={{ color: "#F35B22", fontFamily: "'Space Mono', monospace", fontSize: '60px' }}>The<span style={{fontSize: 25}}> </span>Campfire</span></div>
              {currMessage ? <div className="campfire-message"><span className="message-author">{currMessageAuthor}</span>:<span style={{fontSize: 25}}> </span>{currMessage}</div> : <div className="campfire-message"> </div>}
              <img src={currFire} className="the-fire" />
              <footer className="footer">A Liam Kronman + Jason Seo Production</footer>
            </div>
          </div>
        : <div className="App"
          style={{
            backgroundImage: `url(${campfireBackground})`,
            backgroundSize: 'cover',
          }}>
            <div className="text-body">
              <div className="campfire-title">The<span style={{fontSize: 25}}> </span>Campfire</div>
              <div className="campfire-subtitle">Type like you talk.</div>
              <div className="input-container">
                <input className="campname-input" type="text" value={inputValue} placeholder="Enter a camp name..." onChange={handleInputChange} onKeyDown={handleKeyDown} />
                {showInstruct 
                  ? <div className="campfire-input-instruction">Press enter to join the fire...</div> 
                  : null}
              </div>
              <footer className="footer">A Liam Kronman + Jason Seo Production</footer>
            </div>
          </div>}
    </>
  );
}

export default App;