import './ChatBox.css';
import {useEffect, useState, useRef} from 'react';
import {useParams, useHistory} from "react-router-dom";
import {motion} from 'framer-motion';
import {db, storage} from '../firebase';
import firebase from 'firebase/app';
import {useStateValue} from '../StateProvider';
import {ReactComponent as LoadingIcon} from '../assets/loading.svg';
import Message from './Message';

function ChatBox({setSidebarOpen}) {
	
	const {roomId} = useParams();
	const history = useHistory();
	const fileElem = useRef(null);
	const scroller = useRef(null);
	const [{user}, dispatch] = useStateValue();
	const [optionsOpen, setOptionsOpen] = useState(false);
	const [messages, setMessages] = useState([]);
	const [prevMessages, setPrevMessages] = useState([]);
	const [roomDetails, setRoomDetails] = useState(null);
	const [fileSelected, setFileSelected] = useState(false);
	const [userInp, setUserInp] = useState('');
	const [error, setError] = useState(null);
	const [loading, setLoading] = useState(false);
	const [notFound, setNotFound] = useState(false);
	const [delOpt, setDelOpt] = useState(false);
	const [firstLoad, setFirstLoad] = useState(true);
	
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
			const deleted = tempMsgs.every((msg) => {
				db.collection('rooms').doc(roomId).collection('messages').doc(msg.msgId).delete().then(() => {return true}).catch((e) => {setError(e.code); return false});
			});
			if (deleted) {
      db.collection('rooms').doc(roomId).set({
				lastMsg: {}
			}, {merge: true}).then(()=> {
				setDelOpt(null);
				setOptionsOpen(false);
		  });
      }
		}	
	}
	
	const deleteRoom = () => {
		db.collection('rooms').doc(roomId).delete().then(()=> history.push('/')).catch((e) => setError(e.code));
	}
	
	useEffect(()=> {
		if(!notFound) {
			if (prevMessages.length !== messages.length) {
				if (firstLoad) {
					scroller.current.scrollIntoView();
					setFirstLoad(false);
				} else {
					scroller.current.scrollIntoView({behavior: 'smooth'});
				}
				setPrevMessages(messages);
			}
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
					setFileSelected(false);
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
			timestamp: firebase.firestore.FieldValue.serverTimestamp(),
			likes: [],
		}).then((docRef)=> {
			if (!fileSelected) {
				setUserInp('');
				setLoading(false);
			}
			db.collection('rooms').doc(roomId).set({
				last_modified: firebase.firestore.FieldValue.serverTimestamp(),
				lastMsg: {
					message: userInp ? userInp : (fileSelected ? 'sent a picture.' : ''),
					from: user.displayName,
				}
			}, {merge: true}).then(() => {
				if (fileSelected) {
					uploadImage(docRef.id);
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
    		<svg onClick={()=>setSidebarOpen(true)} class="openSidebar" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16"></path></svg>
			<img src={`https://api.dicebear.com/8.x/shapes/svg?seed=${roomDetails?.name}`}/>
			<h2>{roomDetails?.name}</h2>
			<div className="chat__options">
				<button onClick={()=> {setOptionsOpen(!optionsOpen); setDelOpt(null)}}><svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path></svg></button>
				{optionsOpen && <motion.div layout initial={{y: '-1rem', opacity: 0}} exit={{y: '-1rem', opacity: 0}} animate={{y: 0, opacity: 1}} className="chat__buttons">
				{delOpt ?

(error ? <><span className="error">You do not have sufficient permissions to perform this action. [{error}]</span>
<button onClick={()=> {setDelOpt(null); setError(null); setOptionsOpen(false)}}>Ok, I understand.</button></>
:
					<><span>Are you sure?</span>
					{delOpt==='chat' && <button className="red" onClick={clearChat}>Clear Chat</button>}
					{delOpt==='room' && <button className="red" onClick={deleteRoom}>Delete Room</button>}
					<button onClick={()=> {setDelOpt(null);setTimeout(()=>setOptionsOpen(false), 300);}}>Cancel</button></>)
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
			<button type="submit" disabled={loading} className="submit">{loading? <LoadingIcon/> : <><span>Send</span><svg class="sendSvg" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg></>}</button>
		</form>
		</>)
	}
    </motion.div>
  );
}

export default ChatBox;
