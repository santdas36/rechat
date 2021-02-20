import './Message.css';
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';
import {motion} from 'framer-motion';
import {db, auth} from '../firebase';
import {useStateValue} from '../StateProvider';
import firebase from 'firebase/app';
import formatTime from '../formatTime';

function Message({msg, userDet}) {
	
	const {roomId} = useParams();
	const msgId = msg.msgId;
	const msgData = msg.msgData;
	const [{user}, dispatch] = useStateValue();	
	const msgRef = db.collection('rooms').doc(roomId).collection('messages').doc(msgId);
	
	const addLike = () => {
		if (!msgData.likes.includes(user.email)) {
			msgRef.set({
				likes: firebase.firestore.FieldValue.arrayUnion(user.email),
			}, {merge: true});
		}
	}
	
	const toggleLike = () => {
		if (!msgData.likes.includes(user.email)) {
			msgRef.set({
				likes: firebase.firestore.FieldValue.arrayUnion(user.email),
			}, {merge: true});
		} else {
			msgRef.set({
				likes: firebase.firestore.FieldValue.arrayRemove(user.email),
			}, {merge: true});
		}
	}
	
  return (
    	<div onDoubleClick={addLike} className={`message ${userDet ? 'uudet' : ''} ${msgData.likes.length > 0 ? 'likeAvailable' : ''} ${msgData.img ? 'hasImage' : ''} ${user.email === msgData.user.email ? 'sent' : ''}`}>
			{userDet && <div className="udet">
				<img src={msgData.user.photoURL}/>
				<span>{msgData.user.name.split(' ')[0]}</span>
			</div>}
			{msgData.img && <div className="img"><img src={msgData.img.src}/></div>}
			{msgData.message && <p className="text">{msgData.message}</p>}
			{msgData.timestamp && <p className="time">{formatTime('%e %b, %l:%M%P', new Date(msgData.timestamp.seconds + new Date().getTimezoneOffset()*60))}</p>}
			{msgData.likes.length > 0 && (<motion.span initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}} transition={{duartion: 0.5, type: 'tween'}} exit={{opacity: 0, scale: 0.8}} className="like" onClick={toggleLike}>
				<svg fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>
				<span>{msgData.likes.length}</span>
			</motion.span>)}
		</div>
  );
}

export default Message;
