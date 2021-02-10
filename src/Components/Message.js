import './Message.css';
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {motion} from 'framer-motion';
import {db, auth, timestamp} from '../firebase';
import {useStateValue} from '../StateProvider';
import firebase from 'firebase/app';

function Message({msg, userDet}) {
	
	const {roomId} = useParams();
	const msgId = msg.msgId;
	const msgData = msg.msgData;
	const [{user}, dispatch] = useStateValue();	
	
	const addLike = () => {
		if (!msgData.likes.liked_by.includes(user.email)) {
			db.collection('rooms').doc(roomId).collection('messages').doc(msgId).set({
				likes: {
					value: firebase.firestore.FieldValue.increment(1),
					liked_by: firebase.firestore.FieldValue.arrayUnion(user.email),
				}
			}, {merge: true});
		}
	}
	
  return (
    	<div onDoubleClick={addLike} className={`message ${userDet ? 'uudet' : ''} ${msgData.likes.value > 0 ? 'likeAvailable' : ''} ${user.email === msgData.user.email ? 'sent' : ''}`}>
			{userDet && <div className="udet">
				<img src={msgData.user.photoURL}/>
				<span>{msgData.user.name.split(' ')[0]}</span>
			</div>}
			{msgData.img && <div className="img"><img src={msgData.img.src}/></div>}
			<p className="text">{msgData.message}</p>
			{msgData.likes.value > 0 && (<span className="like">
				<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>
				<span>{msgData.likes.value}</span>
			</span>)}
		</div>
  );
}

export default Message;
