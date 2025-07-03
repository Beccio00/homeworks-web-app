import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DefaultLayout from "./components/DefaultLayout";
import Dashboard from "./components/Dashboard";
import CreateTasks from "./components/CreateTasks";
import Evaluation from "./components/Evaluation";
import TaskDatails from "./components/TaskDetails";
import { LoginForm } from "./components/AuthComponents";
import NotFound from "./components/NotFound";
import { API } from "./API/API.mjs";

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await API.getUserInfo();
        if (userData) {
          setLoggedIn(true);
          setUser(userData);
        }
      } catch (err) {
        setLoggedIn(false);
        setUser(null);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (credentials) => {
    try {
      const userData = await API.login(credentials);
      setLoggedIn(true);
      setMessage({ msg: `Benvenuto, ${userData.name}!`, type: 'success' });
      setUser(userData);
    } catch (err) {
      setMessage({ msg: err.message, type: 'danger' });
    }
  };

  const handleLogout = async () => {
    try {
      await API.logout();
      setLoggedIn(false);
      setUser(null);
      setMessage('');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <Routes>
      <Route element={<DefaultLayout loggedIn={loggedIn} handleLogout={handleLogout} message={message} setMessage={setMessage} />}>
        <Route path="/" element={loggedIn ? <Navigate replace to='/dashboard' /> : <Navigate replace to='/login' />} />
        <Route path="/dashboard" element={loggedIn ? <Dashboard user={user} /> : <Navigate replace to='/login' />} />
        <Route path='/login' element={loggedIn ? <Navigate replace to='/' /> : <LoginForm handleLogin={handleLogin} />} />
        <Route path="/tasks" element={loggedIn && user?.role === 'teacher' ? <CreateTasks user={user} /> : <Navigate replace to='/login' />} />
        <Route path="/evaluation" element={loggedIn && user?.role === 'teacher' ? <Evaluation user={user} /> : <Navigate replace to='/login' />} />
        <Route path="/progress" element={loggedIn && user?.role === 'teacher' ? <TaskDatails user={user} /> : <Navigate replace to='/login' />} />
        
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;