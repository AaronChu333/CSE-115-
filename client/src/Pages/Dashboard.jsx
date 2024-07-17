import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFolder, faTasks } from '@fortawesome/free-solid-svg-icons';

function Dashboard({ userId }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectNote, setNewProjectNote] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  
  const projectNoteRef = useRef(null);

  useEffect(() => {
    fetchProjects();
  }, [userId]);

  useEffect(() => {
    if (projectNoteRef.current) {
      projectNoteRef.current.style.height = 'auto';
      projectNoteRef.current.style.height = projectNoteRef.current.scrollHeight + 'px';
    }
  }, [newProjectNote]);

  const fetchProjects = () => {
    axios.get(`http://localhost:8080/projects/${userId}`)
      .then(response => {
        setProjects(response.data);
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
      });
  };

  const fetchTasks = (projectId) => {
    axios.get(`http://localhost:8080/tasks/${projectId}`)
      .then(response => {
        setTasks(response.data);
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      });
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectName) return;

    axios.post('http://localhost:8080/projects', { userId, name: newProjectName, note: newProjectNote })
      .then(response => {
        setProjects([...projects, response.data]);
        setNewProjectName('');
        setNewProjectNote('');
      })
      .catch(error => {
        console.error('Error creating project:', error);
      });
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskName || !selectedProject) return;

    axios.post('http://localhost:8080/tasks', { projectId: selectedProject._id, name: newTaskName })
      .then(response => {
        setTasks([...tasks, response.data]);
        setNewTaskName('');
      })
      .catch(error => {
        console.error('Error creating task:', error);
      });
  };

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    fetchTasks(project._id);
  };

  const deleteProject = (e, id) => {
    e.stopPropagation();
    axios.delete(`http://localhost:8080/projects/${id}`)
      .then(() => {
        setProjects(projects.filter(project => project._id !== id));
        if (selectedProject && selectedProject._id === id) {
          setSelectedProject(null);
          setTasks([]);
        }
      })
      .catch(error => {
        console.error('Error deleting project:', error);
      });
  };

  const deleteTask = (id) => {
    axios.delete(`http://localhost:8080/tasks/${id}`)
      .then(() => {
        setTasks(tasks.filter(task => task._id !== id));
      })
      .catch(error => {
        console.error('Error deleting task:', error);
      });
  };

  return (
    <div className="dashboard-container bg-gray-100 min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Projects</h2>
          <form onSubmit={handleCreateProject} className="mb-4">
            <div className="mb-3">
              <label htmlFor="projectName" className="block mb-1">Project Name</label>
              <input
                type="text"
                id="projectName"
                className={`w-full border rounded p-2 transition-colors duration-200 ${
                  newProjectName ? 'bg-blue-50' : 'bg-white'
                }`}
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="projectNote" className="block mb-1">Project Note</label>
              <textarea
                ref={projectNoteRef}
                id="projectNote"
                className={`w-full border rounded p-2 overflow-hidden resize-none transition-colors duration-200 ${
                  newProjectNote ? 'bg-blue-50' : 'bg-white'
                }`}
                value={newProjectNote}
                onChange={(e) => setNewProjectNote(e.target.value)}
                rows="1"
                style={{ minHeight: '2.5rem' }}
              ></textarea>
            </div>
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create Project</button>
          </form>
          <div className="grid grid-cols-1 gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                className="bg-gray-100 p-4 rounded flex flex-col cursor-pointer hover:bg-gray-200"
                onClick={() => handleProjectSelect(project)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <FontAwesomeIcon icon={faFolder} className="mr-2" />
                    <span className="font-semibold">{project.name}</span>
                  </div>
                  <button 
                    onClick={(e) => deleteProject(e, project._id)}
                    className="text-red-500 font-bold px-2 py-1 rounded hover:bg-red-100"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </div>
                {project.note && (
                  <p className="mt-2 text-sm text-gray-600">{project.note}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {selectedProject && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Tasks for {selectedProject.name}</h2>
            <form onSubmit={handleCreateTask} className="mb-4">
              <div className="mb-3">
                <label htmlFor="taskName" className="block mb-1">Task Name</label>
                <input
                  type="text"
                  id="taskName"
                  className={`w-full border rounded p-2 transition-colors duration-200 ${
                    newTaskName ? 'bg-blue-50' : 'bg-white'
                  }`}
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                />
              </div>
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Create Task</button>
            </form>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li key={task._id} className="bg-gray-100 p-2 rounded flex justify-between items-center">
                  <span>{task.name}</span>
                  <button
                    onClick={() => deleteTask(task._id)}
                    className="text-red-500 font-bold px-2 py-1 rounded hover:bg-red-100"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;