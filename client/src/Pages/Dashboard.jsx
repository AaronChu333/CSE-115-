import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFolder, faTasks, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectNote, setNewProjectNote] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [taskNotes, setTaskNotes] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});
  
  const projectNoteRef = useRef(null);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    console.log('Stored userId:', storedUserId);
    if (storedUserId) {
        fetchProjects(storedUserId);
    } else {
        console.error('No userId found in localStorage');
    }
  }, []);

  useEffect(() => {
    if (projectNoteRef.current) {
      projectNoteRef.current.style.height = 'auto';
      projectNoteRef.current.style.height = projectNoteRef.current.scrollHeight + 'px';
    }
  }, [newProjectNote]);

  const fetchProjects = (userId) => {
    console.log('Fetching projects for userId:', userId);
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
        response.data.forEach(task => {
          fetchTaskNotes(task._id);
        });
      })
      .catch(error => {
        console.error('Error fetching tasks:', error);
      });
  };

  const fetchTaskNotes = (taskId) => {
    axios.get(`http://localhost:8080/tasks/${taskId}/notes`)
      .then(response => {
        setTaskNotes(prev => ({
          ...prev,
          [taskId]: response.data
        }));
      })
      .catch(error => {
        console.error('Error fetching task notes:', error);
      });
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectName) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No userId found in localStorage');
      return;
    }

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
    if (!newTaskName || !selectedProject) {
      console.error('Task name or selected project is missing');
      return;
    }
  
    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No userId found in localStorage');
      return;
    }
  
    console.log('Creating task:', { projectId: selectedProject._id, name: newTaskName, userId });
  
    axios.post('http://localhost:8080/tasks', { 
      projectId: selectedProject._id, 
      name: newTaskName,
      userId
    })
      .then(response => {
        console.log('Task created:', response.data);
        setTasks([...tasks, response.data]);
        setNewTaskName('');
      })
      .catch(error => {
        console.error('Error creating task:', error.response ? error.response.data : error.message);
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

  const toggleTaskCompletion = (taskId) => {
    axios.put(`http://localhost:8080/tasks/${taskId}/toggle`)
      .then(response => {
        setTasks(tasks.map(task => 
          task._id === taskId ? response.data : task
        ));
      })
      .catch(error => {
        console.error('Error toggling task completion:', error);
      });
  };

  const toggleTaskNotes = (e, taskId) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const addNoteToTask = (taskId) => {
    const note = prompt("Enter a note for this task:");
    if (note) {
      axios.post(`http://localhost:8080/tasks/${taskId}/notes`, { note })
        .then(response => {
          setTaskNotes(prev => ({
            ...prev,
            [taskId]: [...(prev[taskId] || []), note]
          }));
          console.log('Note added successfully');
        })
        .catch(error => {
          console.error('Error adding note:', error);
        });
    }
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
                <li key={task._id} className="bg-gray-100 p-2 rounded">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTaskCompletion(task._id)}
                        className="mr-2"
                      />
                      <span className={task.completed ? 'line-through text-gray-500' : ''}>
                        {task.name}
                      </span>
                    </div>
                    <div>
                      <button
                        onClick={() => addNoteToTask(task._id)}
                        className="bg-blue-500 text-white px-2 py-1 rounded mr-2 text-xs"
                      >
                        +Notes
                      </button>
                      <button
                        onClick={(e) => toggleTaskNotes(e, task._id)}
                        className="bg-green-500 text-white px-2 py-1 rounded mr-2 text-xs"
                      >
                        {expandedTasks[task._id] ? (
                          <FontAwesomeIcon icon={faChevronUp} />
                        ) : (
                          <FontAwesomeIcon icon={faChevronDown} />
                        )}
                      </button>
                      <button
                        onClick={() => deleteTask(task._id)}
                        className="text-red-500 font-bold px-2 py-1 rounded hover:bg-red-100"
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                  {expandedTasks[task._id] && (
                    <div className="mt-2 pl-6 bg-white p-2 rounded shadow">
                      <h4 className="font-semibold">Notes:</h4>
                      {taskNotes[task._id] && taskNotes[task._id].length > 0 ? (
                        <ul className="list-disc pl-4">
                          {taskNotes[task._id].map((note, index) => (
                            <li key={index} className="text-sm text-gray-600">{note}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-500">No notes yet.</p>
                      )}
                    </div>
                  )}
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