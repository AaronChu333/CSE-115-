import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faFolder, faTasks, faChevronDown, faChevronUp, faBars } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectNote, setNewProjectNote] = useState('');
  const [selectedProject, setSelectedProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [taskNotes, setTaskNotes] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInvitationsModalOpen, setIsInvitationsModalOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const navigate = useNavigate();
  const projectNoteRef = useRef(null);

  axios.defaults.withCredentials = true;

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      fetchProjects(storedUserId);
      fetchInvitations(storedUserId);
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

  const fetchProjects = async (userId) => {
    try {
      const response = await axios.get(`/api/projects/${userId}`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchInvitations = async (userId) => {
    try {
      const response = await axios.get(`/api/invitations/${userId}`);
      setInvitations(response.data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const fetchTasks = async (projectId) => {
    try {
      const response = await axios.get(`/api/tasks/${projectId}`);
      setTasks(response.data);
      const notes = {};
      response.data.forEach(task => {
        notes[task._id] = task.notes;
      });
      setTaskNotes(notes);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateProject = (e) => {
    e.preventDefault();
    if (!newProjectName) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No userId found in localStorage');
      return;
    }

    axios.post('/api/projects', { userId, name: newProjectName, note: newProjectNote })
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

    axios.post('/api/tasks', { 
      projectId: selectedProject._id, 
      name: newTaskName,
      userId
    })
      .then(response => {
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
    axios.delete(`/api/projects/${id}`)
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
    axios.delete(`/api/tasks/${id}`)
      .then(() => {
        setTasks(tasks.filter(task => task._id !== id));
      })
      .catch(error => {
        console.error('Error deleting task:', error);
      });
  };

  const toggleTaskCompletion = (taskId) => {
    axios.put(`/api/tasks/${taskId}/toggle`)
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
    if (!expandedTasks[taskId]) {
      fetchTaskNotes(taskId);
    }
  };

  const addNoteToTask = (taskId) => {
    const noteContent = prompt("Enter a note for this task:");
    if (noteContent) {
      axios.post(`/api/tasks/${taskId}/notes`, { content: noteContent })
        .then(response => {
          setTaskNotes(prev => ({
            ...prev,
            [taskId]: [...(prev[taskId] || []), response.data]
          }));
        })
        .catch(error => {
          console.error('Error adding note:', error);
        });
    }
  };

  const fetchTaskNotes = async (taskId) => {
    try {
      const response = await axios.get(`/api/tasks/${taskId}/notes`);
      setTaskNotes(prev => ({
        ...prev,
        [taskId]: response.data
      }));
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleInvite = () => {
    setIsInviteModalOpen(true);
  };

  const handleInviteSubmit = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId || !selectedProject) {
        console.error('User ID or selected project is missing');
        return;
      }
  
      await axios.post('/api/invitations', {
        sender: userId,
        recipient: inviteEmail,
        projectId: selectedProject._id,
      });
      setInviteEmail('');
      setIsInviteModalOpen(false);
    } catch (error) {
      console.error('Error sending invite:', error.response ? error.response.data : error.message);
    }
  };

  const handleAcceptInvitation = async (invitationId) => {
    try {
      await axios.post(`/api/invitations/${invitationId}/accept`);
      fetchInvitations(localStorage.getItem('userId'));
    } catch (error) {
      console.error('Error accepting invitation:', error);
    }
  };

  const handleRejectInvitation = async (invitationId) => {
    try {
      await axios.post(`/api/invitations/${invitationId}/reject`);
      fetchInvitations(localStorage.getItem('userId'));
    } catch (error) {
      console.error('Error rejecting invitation:', error);
    }
  };

  const handleLogout = () => {
    axios.get('/api/logout')
      .then(() => {
        localStorage.removeItem('userId');
        navigate('/login');
      })
      .catch(error => {
        console.error('Error logging out:', error);
      });
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === 'project') {
      const newProjects = Array.from(projects);
      const [reorderedItem] = newProjects.splice(source.index, 1);
      newProjects.splice(destination.index, 0, reorderedItem);

      setProjects(newProjects);
      updateProjectOrder(newProjects);
    } else if (type === 'task') {
      const newTasks = Array.from(tasks);
      const [reorderedItem] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, reorderedItem);

      setTasks(newTasks);
      updateTaskOrder(newTasks);
    }
  };

  const updateProjectOrder = (newProjects) => {
    const userId = localStorage.getItem('userId');
    const projectOrder = newProjects.map(project => project._id);
    axios.put(`http://localhost:8080/users/${userId}/project-order`, { projectOrder })
      .then(response => {
        console.log('Project order updated successfully');
      })
      .catch(error => {
        console.error('Error updating project order:', error);
      });
  };

  const updateTaskOrder = (newTasks) => {
    const projectId = selectedProject._id;
    const taskOrder = newTasks.map(task => task._id);
    axios.put(`http://localhost:8080/projects/${projectId}/task-order`, { taskOrder })
      .then(response => {
        console.log('Task order updated successfully');
      })
      .catch(error => {
        console.error('Error updating task order:', error);
      });
  };

  return (
    <div className="dashboard-container bg-gray-100 min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
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
            <div className="overflow-y-auto" style={{ maxHeight: '400px' }}>
              <Droppable droppableId="projects" type="project">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 gap-4">
                    {projects.map((project, index) => (
                      <Draggable key={project._id} draggableId={project._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-gray-100 p-4 rounded flex flex-col cursor-pointer hover:bg-gray-200"
                            onClick={() => handleProjectSelect(project)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <span {...provided.dragHandleProps} className="mr-2 cursor-move">
                                  <FontAwesomeIcon icon={faBars} />
                                </span>
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
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
  
          {selectedProject && (
            <div className="bg-white p-6 rounded-lg shadow-md relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Tasks for {selectedProject.name}</h2>
                <button onClick={handleInvite} className="bg-blue-500 text-white px-4 py-2 rounded ml-4">Invite</button>
              </div>
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
              <Droppable droppableId="tasks" type="task">
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {tasks.map((task, index) => (
                      <Draggable key={task._id} draggableId={task._id} index={index}>
                        {(provided) => (
                          <li
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-gray-100 p-2 rounded"
                          >
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <span {...provided.dragHandleProps} className="mr-2 cursor-move">
                                  <FontAwesomeIcon icon={faBars} />
                                </span>
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
                                      <li key={index} className="text-sm text-gray-600">{note.content}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-sm text-gray-500">No notes yet.</p>
                                )}
                              </div>
                            )}
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </div>
          )}
        </div>
      </DragDropContext>
  
      {isInviteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Invite Collaborator</h3>
            <input
              type="email"
              className="w-full border rounded p-2 mb-4"
              placeholder="Enter collaborator's email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <div className="flex justify-end">
              <button onClick={handleInviteSubmit} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Send Invite</button>
              <button onClick={() => setIsInviteModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
  
      <button
        onClick={() => setIsInvitationsModalOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white px-4 py-2 rounded shadow-lg"
      >
        Invitations
      </button>
  
      {isInvitationsModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">Project Invitations</h3>
            <div className="space-y-4">
              {invitations.map((invitation) => (
                <div key={invitation._id} className="bg-gray-100 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{invitation.project.name}</span>
                    <div>
                      <button
                        onClick={() => handleAcceptInvitation(invitation._id)}
                        className="bg-green-500 text-white px-4 py-2 rounded mr-2"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectInvitation(invitation._id)}
                        className="bg-red-500 text-white px-4 py-2 rounded"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setIsInvitationsModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;