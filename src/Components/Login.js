import {useState, useEffect} from "react";
import "./Login.css";
import {auth, provider, analytics} from '../firebase';
import {motion} from 'framer-motion';
import Icon from '../assets/icon.png';

function Login() {
	
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [signup, setSignup] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	
	const googleSignIn = (e) => {
		e.preventDefault();
		setLoading(true);
	    auth.signInWithPopup(provider).then((result) => {
			setLoading(false);
		}).catch((error) => {setError(error.message); setLoading(false)});
	};
	
	useEffect(()=> {
		if (error) {
			setTimeout(()=> {
				setError(null);
			}, 10000);
		}
	}, [error]);
	
	const handleSubmit = (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);
		if (signup) {
			auth.createUserWithEmailAndPassword(email, password).then(() => {
      		auth.currentUser.updateProfile({
              		displayName: name,
              		photoURL: `https://avatars.dicebear.com/4.5/api/gridy/${email}.svg`,
            	});
              analytics.logEvent('sign_up');
            }).catch((error) => {setError(error.message); setLoading(false)});
		} else {
			auth.signInWithEmailAndPassword(email, password).then(()=> {
				setLoading(false);
				analytics.logEvent('log_in');
			}).catch((error) => {setError(error.message); setLoading(false)});
		}
	}
		
  return (
    <div className="login">
    	<img src={Icon} className="app__icon"/>
    	<motion.form initial={{opacity: 0, y: '5rem'}} exit={{opacity: 0, y: '5rem'}} animate={{opacity: 1, y: 0}} layout onSubmit={handleSubmit}>
			<h3>{signup ? 'Sign Up' : 'Login'}</h3>
			{error && <p className="error">{error}</p>}
			{signup &&
			<div className="input">
				<label>Full Name</label>
				<input type="text" required={signup} value={name} onChange={(e)=>setName(e.target.value)} placeholder="John Doe" />
			</div>
			}
			<div className="input">
				<label>Email Address</label>
				<input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="johndoe@gmail.com" />
			</div>
			<div className="input">
				<label>Password</label>
				<input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required placeholder="••••••••" />
			</div>
			<button style={signup ? {backgroundColor: '#f0cf65'} : {backgroundColor: '#5887ff'}} disabled={loading}>{loading ? (signup ? 'Signing up...' : 'Logging In...') : (signup ? 'Create Account' : 'Log In')}</button>
			<button onClick={googleSignIn} className="google">Sign In with Google</button>
			<p><span>{signup ? 'Already have an account?' : "Don't have an account?"}{' '}</span><b style={signup ? {color: '#5887ff'} : {color: '#f0cf65'}} onClick={()=>{if(!loading){setSignup(!signup)}}}>Sign Up Now.</b></p>
		</motion.form>
    </div>
  )
}
export default Login;