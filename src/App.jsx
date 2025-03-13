import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import Home from './components/Home/Home';
import Games from './components/Games/Games';
import About from './components/About/About';
import Layout from './Layout';
import AuthenticationForm from './components/Login/AuthenticationForm';
import ProtectedRoute from './ProtectedRoute';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config/firebase';
import { setUser } from './store/userSlice';
import TicTacToe from './components/Games/TicTacToe/TicTacToe';
import UltimateTicTacToe from './components/Games/UltimateTicTacToe/UltimateTicTacToe';
import ThreeMoveTicTacToe from './components/Games/ThreeMoveTicTacToe/ThreeMoveTicTacToe';
import PixelRush from './components/Games/PixelRush/PixelRush';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const userData = docSnap.data();
            dispatch(setUser({
              userId: user.uid,
              username: userData.username || user.displayName || 'User',
              highScore: userData.highScore || [0, 0, 0, 0],
              totalScore: userData.totalScore || 0
            }));
          } else {
            const username = user.displayName || user.email.split('@')[0];
            dispatch(setUser({
              userId: user.uid,
              username: username,
              highScore: [0, 0, 0, 0],
              totalScore: 0
            }));
          }
          
          console.log("done auth");
        } catch (error) {
          console.error("Error auth", error);
        }
      }
    });
    
    return () => unsubscribe();
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthenticationForm />} />

        <Route path="/games/tictactoe" element={
          <ProtectedRoute>
            <TicTacToe />
          </ProtectedRoute>
        } />
        <Route path="/games/ultimatettt" element={
          <ProtectedRoute>
            <UltimateTicTacToe />
          </ProtectedRoute>
        } />
        <Route path="/games/threemove" element={
          <ProtectedRoute>
            <ThreeMoveTicTacToe />
          </ProtectedRoute>
        } />
        <Route path="/games/pixelrush" element={
          <ProtectedRoute>
            <PixelRush />
          </ProtectedRoute>
        } />

        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Home />} />
          <Route path="games" element={<Games />} />
          <Route path="about" element={<About />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
