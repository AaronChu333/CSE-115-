import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Sidebar from './Sidebar';

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectNote, setNewProjectNote] = useState('');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInvitationsModalOpen, setIsInvitationsModalOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      fetchProjects(storedUserId);
      fetchInvitations(storedUserId);
    } else {
      console.error('No userId found in localStorage');
    }
  }, []);

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
        setIsModalOpen(false);
      })
      .catch(error => {
        console.error('Error creating project:', error);
      });
  };

  const deleteProject = (e, id) => {
    e.stopPropagation();
    axios.delete(`/api/projects/${id}`)
      .then(() => {
        setProjects(projects.filter(project => project._id !== id));
      })
      .catch(error => {
        console.error('Error deleting project:', error);
      });
  };

  const handleInviteSubmit = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No userId found in localStorage');
        return;
      }
  
      await axios.post('/api/invitations', {
        sender: userId,
        recipient: inviteEmail,
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
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    const newProjects = Array.from(projects);
    const [movedProject] = newProjects.splice(source.index, 1);
    newProjects.splice(destination.index, 0, movedProject);

    setProjects(newProjects);
    updateProjectOrder(newProjects);
  };

  const updateProjectOrder = (newProjects) => {
    const userId = localStorage.getItem('userId');
    const projectOrder = newProjects.map(project => project._id);
    axios.put(`/users/${userId}/project-order`, { projectOrder })
      .then(response => {
        console.log('Project order updated successfully');
      })
      .catch(error => {
        console.error('Error updating project order:', error);
      });
  };

  return (
    <div className="dashboard-container flex">
      <Sidebar setIsInvitationsModalOpen={setIsInvitationsModalOpen} />
      <div className="flex-1 bg-gray-100 min-h-screen p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Projects</h1>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
        </div>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="projects" direction="horizontal">
            {(provided) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12"
              >
                {projects.map((project, index) => (
                  <Draggable key={project._id} draggableId={project._id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`bg-white p-4 rounded-lg shadow-md cursor-pointer hover:bg-gray-200 ${
                          snapshot.isDragging ? 'dragging' : ''
                        }`}
                        style={{
                          height: '250px',
                          width: '250px',
                          ...provided.draggableProps.style,
                        }}
                        onClick={() => navigate(`/projects/${project._id}`, { state: { projectName: project.name } })}
                      >
                        <div className="flex justify-between items-center">
                          <h2 className="text-lg font-semibold">{project.name}</h2>
                          <button
                            onClick={(e) => deleteProject(e, project._id)}
                            className="text-red-500 font-bold px-2 py-1 rounded hover:bg-red-100"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                        {project.note && <p className="mt-2 text-sm text-gray-600">{project.note}</p>}
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <div
                  className="bg-gray-200 p-4 rounded-lg shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-300"
                  style={{
                    height: '250px',
                    width: '250px',
                  }}
                  onClick={() => setIsModalOpen(true)}
                >
                  <FontAwesomeIcon icon={faPlus} className="text-3xl text-gray-500" />
                </div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-lg w-1/3">
              <h3 className="text-xl font-semibold mb-4">Create Project</h3>
              <form onSubmit={handleCreateProject}>
                <div className="mb-3">
                  <label htmlFor="projectName" className="block mb-1">Project Name</label>
                  <input
                    type="text"
                    id="projectName"
                    className="w-full border rounded p-2"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="projectNote" className="block mb-1">Project Note</label>
                  <textarea
                    id="projectNote"
                    className="w-full border rounded p-2"
                    value={newProjectNote}
                    onChange={(e) => setNewProjectNote(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Create</button>
                  <button onClick={() => setIsModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
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
    </div>
  );
}

export default Dashboard;
