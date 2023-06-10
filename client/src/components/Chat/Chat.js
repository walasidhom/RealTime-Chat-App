import React, { useEffect, useState } from 'react'
import queryString from 'query-string'
import { useLocation } from 'react-router'
import io from 'socket.io-client';
import './chat.css'
import InfoBar from '../InfoBar/InfoBar';
import Input from '../Input/Input';
import Messages from '../Messages/Messages';

let socket;
const Chat = () => {

  const location = useLocation();
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const ENDPOINT = 'localhost:5000';
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const { name, room } = queryString.parse(location.search);

    socket = io(ENDPOINT);

    setName(name);
    setRoom(room);

    socket.emit('join', { name, room }, () => {
      
    });

    //return statement in useEffect is for unmounting 
    return () => {
      //socket.emit('disconnect');
      socket.disconnect();

      //turn off this instance of io (socket)
      socket.off();
    }

  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on('message', (message) => {
      setMessages([ ...messages, message ]);
    })
  }, [messages]);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message) {
      socket.emit('sendMessage', message, () => {
        setMessage('')
      })
    }
  }

  console.log(message, messages);
  
  return (
    <div className="outerContainer">
        <div className="container">
          <InfoBar room={room} />
          <Messages messages={messages} name={name} />
          <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
      </div>
  )
}

export default Chat