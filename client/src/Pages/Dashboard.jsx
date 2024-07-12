import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard({ userId }) {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectNote, setNewProjectNote] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskNote, setNewTaskNote] = useState('');

  useEffect(() => {
    // Fetch the user's projects from the backend
    axios.get(`http://localhost:8080/projects/${userId}`)
      .then(response => {
        setProjects(response.data);
      })
      .catch(error => {
        console.error('Error fetching projects:', error);
      });
  }, [userId]);

  useEffect(() => {
    if (selectedProjectId) {
      // Fetch tasks for the selected project
      axios.get(`http://localhost:8080/tasks/${selectedProjectId}`)
        .then(response => {
          setTasks(response.data);
        })
        .catch(error => {
          console.error('Error fetching tasks:', error);
        });
    }
  }, [selectedProjectId]);

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
    if (!newTaskName || !selectedProjectId) return;

    axios.post('http://localhost:8080/tasks', { projectId: selectedProjectId, name: newTaskName, note: newTaskNote })
      .then(response => {
        setTasks([...tasks, response.data]);
        setNewTaskName('');
        setNewTaskNote('');
      })
      .catch(error => {
        console.error('Error creating task:', error);
      });
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProjectId(projectId);
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <form onSubmit={handleCreateProject}>
        <div className="mb-3">
          <label htmlFor="projectName" className="form-label">
            Project Name
          </label>
          <input
            type="text"
            id="projectName"
            className="form-control"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="projectNote" className="form-label">
            Project Note
          </label>
          <input
            type="text"
            id="projectNote"
            className="form-control"
            value={newProjectNote}
            onChange={(e) => setNewProjectNote(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary">Create Project</button>
      </form>
      <h2>Your Projects</h2>
      <ul className="list-group">
        {projects.map((project) => (
          <li 
            key={project._id} 
            className="list-group-item"
            onClick={() => handleProjectSelect(project._id)}
          >
            <strong>{project.name}</strong><br />
            <small>{project.note}</small>
          </li>
        ))}
      </ul>

      {selectedProjectId && (
        <>
          <h2>Tasks for Selected Project</h2>
          <form onSubmit={handleCreateTask}>
            <div className="mb-3">
              <label htmlFor="taskName" className="form-label">
                Task Name
              </label>
              <input
                type="text"
                id="taskName"
                className="form-control"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="taskNote" className="form-label">
                Task Note
              </label>
              <input
                type="text"
                id="taskNote"
                className="form-control"
                value={newTaskNote}
                onChange={(e) => setNewTaskNote(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">Create Task</button>
          </form>
          <ul className="list-group">
            {tasks.map((task) => (
              <li key={task._id} className="list-group-item">
                <strong>{task.name}</strong><br />
                <small>{task.note}</small>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default Dashboard;
