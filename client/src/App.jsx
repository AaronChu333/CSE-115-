import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Signup from './Pages/Register';
import Login from './Pages/Login';
import Dashboard from './Pages/Dashboard';
import ProjectTasks from './Pages/ProjectTasks'; // Import the ProjectTasks component

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/register' element={<Signup />} />
        <Route path='/' element={<Login />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/projects/:projectId' element={<ProjectTasks />} /> {/* Add the new ProjectTasks route */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
