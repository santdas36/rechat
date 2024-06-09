import './Sidebar.css';
import {useEffect, useState} from 'react';
import {NavLink, useHistory} from "react-router-dom";
import {motion} from 'framer-motion';
import {db, auth} from '../firebase';
import firebase from 'firebase/app';
import {useStateValue} from '../StateProvider';

function Sidebar({sidebarOpen, setSidebarOpen}) {
	
	const [{user, rooms}, dispatch] = useStateValue();
	const history = useHistory();
	const [newOpen, setNewOpen] = useState(false);
	const [roomName, setRoomName] = useState('');
	
	const createRoom = (e) => {
		e.preventDefault();
		setNewOpen(false);
		db.collection('rooms').add({
			name: roomName,
			last_modified: firebase.firestore.FieldValue.serverTimestamp(),
			createdBy: user.uid,
		}).then((doc)=> {
			setRoomName('');
			history.push(`/room/${doc.id}`);
		});
	}
	
  return (
    <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
    	<div className="sidebar__header">
			<img src={user?.photoURL}/>
			<span>
				<h3>Hi, {user?.displayName?.split(' ')[0]}!</h3>
				<p><span className="logout" onClick={()=> auth.signOut()}>LogOut</span></p>
			</span>
			<svg onClick={()=>setSidebarOpen(false)} class="closeSidebar" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
		</div>
		<div className="sidebar__rooms">
			<form onSubmit={(e)=>createRoom(e)} className={`sidebar__new ${newOpen ? 'active' : ''}`} onClick={()=>setNewOpen(true)}>
				<input placeholder="Room Name" required value={roomName} onChange={(e)=> setRoomName(e.target.value)} />
				<button type="submit">+</button>
			</form>
			{rooms?.map((room) => (
				<motion.li layout layoutId={room.id} key={room.id}><NavLink onClick={()=>setSidebarOpen(false)} to={`/room/${room.id}`} className="navlink" activeClassName="active">
					<img src={`https://api.dicebear.com/8.x/shapes/svg?seed=${room.data().name}`} />
					<span>
						<p className="name">{room.data().name}</p>
						<p className="msg"><b>{room.data().lastMsg?.from?.split(' ')[0]} </b>{room.data().lastMsg?.message || 'No new messages'}</p>
					</span>
				</NavLink></motion.li>
			))}
		</div>
    </div>
  );
}

export default Sidebar;
