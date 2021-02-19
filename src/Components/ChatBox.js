import './ChatBox.css';
import {useEffect, useState, useRef} from 'react';
import {useParams, useHistory} from "react-router-dom";
import {motion} from 'framer-motion';
import {db, timestamp, storage} from '../firebase';
import {useStateValue} from '../StateProvider';
import Message from './Message';

function ChatBox() {
	
	const {roomId} = useParams();
	const history = useHistory();
	const fileElem = useRef(null);
	const scroller = useRef(null);
	const [{user}, dispatch] = useStateValue();
	const [optionsOpen, setOptionsOpen] = useState(false);
	const [messages, setMessages] = useState([]);
	const [roomDetails, setRoomDetails] = useState(null);
	const [fileSelected, setFileSelected] = useState(false);
	const [userInp, setUserInp] = useState('');
	const [loading, setLoading] = useState(false);
	const [notFound, setNotFound] = useState(false);
	const [delOpt, setDelOpt] =useState(false);
	
	useEffect(()=> {
		db.collection('rooms').doc(roomId).get().then((data)=> {
			if (data.exists) {
				setRoomDetails(data.data());
				document.title = `${data.data().name} Chat Room`;
			} else {
				setNotFound(true);
			}
		});
		const unsubscribe = db.collection('rooms').doc(roomId).collection('messages').orderBy('timestamp').onSnapshot((snap) => {
			setMessages(snap.docs.map((msg) => ({msgId: msg.id, msgData: msg.data()})));
		});
		
		return unsubscribe;
	}, []);
	
	const clearChat = () => {
		if(messages) {
			const tempMsgs = messages;
			tempMsgs.forEach((msg) => {
				db.collection('rooms').doc(roomId).collection('messages').doc(msg.msgId).delete();
			});
			db.collection('rooms').doc(roomId).set({
				lastMsg: {}
			}, {merge: true}).then(()=> {
				setDelOpt(null);
				setOptionsOpen(false);
			});
		}	
	}
	
	const deleteRoom = () => {
		db.collection('rooms').doc(roomId).delete().then(()=> history.push('/'));
	}
	
	useEffect(()=> {
		if(!notFound) {
			scroller.current.scrollIntoView({behavior: 'smooth'});
		}
	}, [messages]);
	
	const addImage = () => {
		if (fileElem.current.files.length > 0) {
			setFileSelected(true);
		}
	}
	
	const uploadImage = (messageId) => {
		const selectedImage = fileElem.current.files[0];
		const uploadTask = storage.ref(`images/${selectedImage.name}`).put(selectedImage);
		uploadTask.on("state_changed", null, null, ()=> {
			storage.ref("images").child(selectedImage.name).getDownloadURL().then((url)=> {
				db.collection('rooms').doc(roomId).collection('messages').doc(messageId).set({
					img: {src: url}
				}, {merge: true}).then(()=> {
					fileElem.current.value = null;
					setUserInp('');
					setLoading(false);
				});
			});
		});
	}
	
	const sendMessage = (e) => {
		e.preventDefault();
		setLoading(true);
		db.collection('rooms').doc(roomId).collection('messages').add({
			user: {
				name: user.displayName,
				email: user.email,
				photoURL: user.photoURL,
			},
			message: userInp,
			timestamp: timestamp,
			likes: {
				value: 0,
				liked_by: [],
			}
		}).then((docRef)=> {
			db.collection('rooms').doc(roomId).set({
				last_modified: timestamp,
				lastMsg: {
					message: userInp,
					from: user.displayName,
				}
			}, {merge: true}).then(() => {
				if (fileSelected) {
					uploadImage(docRef.id);
				} else {
					setUserInp('');
					setLoading(false);
				}
			});
		});
	}
	
  return (
    <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="chatbox">
    {notFound ? 
    	(<div className="notfound">
    		<h3>Uh! Room Not Found!</h3>
    	</div>)
    	:
    	(<><div className="chat__header">
			<img src={`https://avatars.dicebear.com/4.5/api/gridy/${roomDetails?.name}.svg`}/>
			<h2>{roomDetails?.name}</h2>
			<div className="chat__options">
				<button onClick={()=> {setOptionsOpen(!optionsOpen); setDelOpt(null)}}><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg></button>
				{optionsOpen && <motion.div layout initial={{y: '-1rem', opacity: 0}} exit={{y: '-1rem', opacity: 0}} animate={{y: 0, opacity: 1}} className="chat__buttons">
				{delOpt ?
					<><span>Are you sure?</span>
					{delOpt==='chat' && <button className="red" onClick={clearChat}>Clear Chat</button>}
					{delOpt==='room' && <button className="red" onClick={deleteRoom}>Delete Room</button>}
					<button onClick={()=> {setDelOpt(null);setTimeout(()=>setOptionsOpen(false), 300);}}>Cancel</button></>
					:
					<><button className="red" onClick={()=> setDelOpt('chat')}>Clear Chat</button>
					<button className="red" onClick={()=> setDelOpt('room')}>Delete Room</button></>
					}
				</motion.div>}
			</div>
		</div>
		<div className="chat__messages">
			{messages?.map((msg, index, arr) => <Message msg={msg} userDet={index === 0 || msg.msgData.user.email !== arr[index-1].msgData.user.email}/>)}
			<div ref={scroller} className="scroller"></div>
		</div>
		<form onSubmit={sendMessage} className="chat__input">
			<input onChange={addImage} type="file" ref={fileElem} accept="image/*" style={{display:'none'}} />
			<button type="button" onClick={(e)=> {e.preventDefault(); fileElem.current.click();}} className={`addImg ${fileSelected ? 'green' : ''}`}><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg></button>
			<input value={userInp} onChange={(e)=>setUserInp(e.target.value)} type="text" required={!fileSelected} placeholder="Type Here..."/>
			<button type="submit" disabled={loading} className="submit">{loading? '...' : 'Send'}</button>
		</form>
		</>)
	}
    </motion.div>
  );
}

export default ChatBox;
