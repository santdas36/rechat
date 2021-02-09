import './App.css';
import {useEffect, useState} from 'react';
import {Route, Redirect, Switch, useLocation} from "react-router-dom";
import {AnimatePresence, motion} from 'framer-motion';
import {auth, db} from './firebase';
import {useStateValue} from './StateProvider';
import Login from './Components/Login';
import Sidebar from './Components/Sidebar';
import ChatBox from './Components/ChatBox';

function App() {
	
	const [{user}, dispatch] = useStateValue();
	const location = useLocation();
	
	useEffect(()=> {
		document.title = 'Loading...';
		auth.onAuthStateChanged((user) => {
			if (user) {
				dispatch({
					type: "SET_USER",
					user: user,
				});
				db.collection('rooms').orderBy('last_modified', 'desc').onSnapshot((data) => {
					dispatch({
						type: "SET_ROOMS",
						rooms: data.docs,
					});
				});
			} else {
				dispatch({
					type: "SET_USER",
					user: null,
				});
				document.title = 'Login to continue...';
			};
		})
	}, []);
	
  return (
    <div className="app">
      <AnimatePresence>
        {user ? 
          <motion.div initial={{opacity: 0, y: '1rem'}} exit={{opacity: 0, y: '-1rem'}} animate={{opacity: 1, y: 0}} className="app__inner">
          	<Switch location={location} key={location.pathname}>
          		<Route path="/room/:roomId">
          			<Sidebar/>
          			<ChatBox/>
          		</Route>
          		<Route>
          			{()=> {document.title="ReChat App"}}
          			<Sidebar/>
          		</Route>
          	</Switch>
          </motion.div>
        : <Login/>}
      </AnimatePresence>
    </div>
  );
}

export default App;
