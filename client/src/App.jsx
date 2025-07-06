import "bootstrap/dist/css/bootstrap.min.css";
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import DefaultLayout from "./components/DefaultLayout";
import Dashboard from "./components/Dashboard";
import CreateTasks from "./components/CreateTasks";
import TaskManagement from "./components/TaskManagement";
import TaskDatails from "./components/TaskDetails";
import { LoginForm } from "./components/AuthComponents";
import NotFound from "./components/NotFound";
import { API } from "./API/API.mjs";


function App() {
  const [user, setUser] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = await API.getUserInfo();
        if (userData) {
          setUser(userData);
          setLoggedIn(true);
        }
      } catch (err) {
        setUser(null);
        setLoggedIn(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (message && message.msg) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleLogin = async (credentials) => {
    try {
      const userData = await API.login(credentials);
      setUser(userData);
      setLoggedIn(true);
      setMessage({ msg: `Benvenuto/a ${userData.name}!`, type: 'success' });
      return { success: true };
    } catch (err) {
      if (err.status == 401) {
        setMessage({ msg: 'Password o username errati', type: 'danger' });
      } else {
        setMessage({ msg: err.message, type: 'danger' });
      }
      return { success: false, error: err.message };
    }
  };

  const handleLogout = async () => {
    try {
      await API.logout();
      setUser(null);
      setLoggedIn(false);

    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loggedIn,
        handleLogin,
        handleLogout,
        message,
        setMessage
      }}
    >
      <Routes>
        <Route element={<DefaultLayout />}>
          <Route path="/" element={loggedIn ? <Navigate replace to='/dashboard' /> : <Navigate replace to='/login' />} />
          <Route path="/dashboard" element={loggedIn ? <Dashboard /> : <Navigate replace to='/login' />} />
          <Route path="/login" element={loggedIn ? <Navigate replace to='/' /> : <LoginForm />} />
          <Route path="/tasks" element={loggedIn ? <TaskManagement /> : <Navigate replace to='/login' />} />
          <Route
            path="/tasks/new"
            element={
              loggedIn
                ? (user?.role === 'teacher' ? <CreateTasks /> : <Navigate replace to='/tasks' />)
                : <Navigate replace to='/login' />
            }
          />
          <Route
            path="/progress"
            element={
              loggedIn
                ? (user?.role === 'teacher' ? <TaskDatails /> : <Navigate replace to='/dashboard'/>)
                : <Navigate replace to='/login' />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthContext.Provider>
  );
}

export default App;