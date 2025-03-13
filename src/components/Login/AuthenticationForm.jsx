import React, { useState, useEffect } from 'react';
import './AuthenticationForm.css';
import bg from './bg.jpg';
import {auth, googleProvider} from "../../config/firebase.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signInWithPopup} from 'firebase/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from "../../config/firebase.js";
import { Filter } from 'bad-words';


const filter = new Filter();


const GoogleIcon = () => (
  <div style={{ 
    width: 24, 
    height: 24, 
    backgroundColor: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  }}>
    <svg viewBox="0 0 24 24" width="18" height="18">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  </div>
);


export function AuthenticationForm() {
  
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from || '/';
  
  const handleLoginSuccess = () => {
    navigate(from);
  };
  
  const [type, setType] = useState('register');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    terms: false,
  });
  const [errors, setErrors] = useState({});
  const toggleType = () => {
    setType(type === 'login' ? 'register' : 'login');
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!/^\S+@\S+$/.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }
    

    if (formData.password.length <= 6) {
      newErrors.password = 'Password should include at least 6 characters';
    }

    if (type === 'register' && !formData.terms) {
      newErrors.terms = 'You must accept the terms and conditions';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, type: inputType, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: inputType === 'checkbox' ? checked : value,
    });
  };

  const handleChangeEmail=(e)=>{
    setFormData({...formData,email:e.target.value})
  }
  const handleChangePassword=(e)=>{
    setFormData({...formData,password:e.target.value})
  }

  const containsProfanity = (text) => {
    if (!text) return false;
    return filter.isProfane(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (type === 'register' && formData.username && containsProfanity(formData.username)) {
      window.location.href = "https://www.youtube.com/watch?v=l60MnDJklnM&ab_channel=as"; 
      return;
    }
    
    if (!validateForm()) return;
    
    try {
      if (type === 'register') {
        const userCredential = await createUserWithEmailAndPassword(
          auth, 
          formData.email, 
          formData.password
        );
        
        await setDoc(doc(db, "users", userCredential.user.uid), {
          username: formData.username || formData.email.split('@')[0],
          totalScore: 0,
          highScore: [0, 0, 0, 0],
          email: formData.email,
          createdAt: new Date()
        });
        
        handleLoginSuccess();
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
        handleLoginSuccess();
      }
    } 
    catch (error) {
      console.error("Authentication error:", error.code, error.message);

      const newErrors = { ...errors };
      if (error.code === 'auth/email-already-in-use') {
        newErrors.email = 'Email is already registered';
      } else if (error.code === 'auth/invalid-email') {
        newErrors.email = 'Invalid email format';
      } else if (error.code === 'auth/weak-password') {
        newErrors.password = 'Password is too weak';
      } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        newErrors.general = 'Invalid email or password';
      } else {
        newErrors.general = 'An error occurred. Please try again.';
      }
      setErrors(newErrors);
    }
  };

  const SignInGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
     
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        
        await setDoc(userDocRef, {
          username: user.displayName || user.email.split('@')[0],
          email: user.email,
          totalScore: 0,
          highScore: [0, 0, 0, 0],
          createdAt: new Date()
        });
        console.log("Created new user document in Firestore");
      }
      
      handleLoginSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  const GoogleButton = ({ children }) => (
    <button className="social-button" onClick={SignInGoogle}>
      <GoogleIcon />
      <span>{children}</span>
    </button>
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        navigate('/');
      }
    });
    
    return () => unsubscribe();
  }, [navigate]);
  return (
    <div 
      className="auth-wrapper"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="auth-paper">
        <h3 className="auth-title">
          Welcome to MiniGames, {type} with
        </h3>

        <div className="social-buttons">
          <GoogleButton>Continue with Google</GoogleButton>
        </div>

        <div className="divider">
          <span className="divider-text">Or continue with email</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-stack">
            {type === 'register' && (
              <div className="form-group">
                <label htmlFor="name">User Name</label>
                <input
                  id="name"
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="hello@example.com"
                value={formData.email}
                onChange={handleChangeEmail}
                required
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && <div className="error-text">{errors.email}</div>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Your password"
                value={formData.password}
                onChange={handleChangePassword}
                required
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && <div className="error-text">{errors.password}</div>}
            </div>

            {type === 'register' && (
            <div className="form-checkbox-container">
              <div className="checkbox-row">
                <input
                  id="terms"
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleChange}
                />
                <label htmlFor="terms">I accept terms and conditions</label>
              </div>
              {errors.terms && <div className="error-text terms-error">{errors.terms}</div>}
            </div>
          )}
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="text-button" 
              onClick={toggleType}
            >
              {type === 'register'
                ? <>Already have an account? <span className="highlight-link">Login now</span></>
                : <>Don't have an account? <span className="highlight-link">Register now</span></>}
            </button>
          </div>

          <button type="submit" className="submit-button">
            {type === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AuthenticationForm;