import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faChevronDown, faChevronUp, faBars, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Sidebar from './Sidebar';
import { useParams, useLocation } from 'react-router-dom';

function ProjectTasks() {
  const { projectId } = useParams();
  const location = useLocation();
  const { projectName } = location.state || {};
  const [tasks, setTasks] = useState([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [taskNotes, setTaskNotes] = useState({});
  const [expandedTasks, setExpandedTasks] = useState({});
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInvitationsModalOpen, setIsInvitationsModalOpen] = useState(false);
  const [invitations, setInvitations] = useState([]);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    fetchTasks(projectId);
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      fetchInvitations(storedUserId);
    } else {
      console.error('No userId found in localStorage');
    }
  }, [projectId]);

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

  const fetchInvitations = async (userId) => {
    try {
      const response = await axios.get(`/api/invitations/${userId}`);
      setInvitations(response.data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskName) return;

    const userId = localStorage.getItem('userId');
    if (!userId) {
      console.error('No userId found in localStorage');
      return;
    }

    axios.post('/api/tasks', {
      projectId,
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

  const openNoteModal = (taskId) => {
    setCurrentTaskId(taskId);
    setIsNoteModalOpen(true);
  };

  const addNoteToTask = () => {
    if (noteContent) {
      axios.post(`/api/tasks/${currentTaskId}/notes`, { content: noteContent })
        .then(response => {
          setTaskNotes(prev => ({
            ...prev,
            [currentTaskId]: [...(prev[currentTaskId] || []), response.data]
          }));
          setNoteContent('');
          setIsNoteModalOpen(false);
        })
        .catch(error => {
          console.error('Error adding note:', error);
        });
    }
  };

  const deleteNote = (noteId, taskId) => {
    axios.delete(`/api/notes/${noteId}`)
      .then(() => {
        setTaskNotes(prev => ({
          ...prev,
          [taskId]: prev[taskId].filter(note => note._id !== noteId)
        }));
      })
      .catch(error => {
        console.error('Error deleting note:', error);
      });
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

  const onDragEnd = (result) => {
    const { destination, source } = result;

    if (!destination) {
      return;
    }

    const newTasks = Array.from(tasks);
    const [reorderedItem] = newTasks.splice(source.index, 1);
    newTasks.splice(destination.index, 0, reorderedItem);

    setTasks(newTasks);
    updateTaskOrder(newTasks);
  };

  const updateTaskOrder = (newTasks) => {
    const taskOrder = newTasks.map(task => task._id);
    axios.put(`/api/projects/${projectId}/task-order`, { taskOrder })
      .then(response => {
        console.log('Task order updated successfully');
      })
      .catch(error => {
        console.error('Error updating task order:', error);
      });
  };

  const handleInvite = () => {
    setIsInviteModalOpen(true);
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
        projectId: projectId
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

  return (
    <div className="project-tasks-container flex">
      <Sidebar setIsInvitationsModalOpen={setIsInvitationsModalOpen} />
      <div className="flex-1 bg-gray-900 min-h-screen p-8 text-white">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{projectName}</h1>
          <button
            onClick={handleInvite}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
          >
            <FontAwesomeIcon icon={faUserPlus} className="mr-2" />
            Invite
          </button>
        </div>
        <form onSubmit={handleCreateTask} className="mb-4">
          <div className="mb-3 w-1/4">
            <label htmlFor="taskName" className="block mb-1">Task Name</label>
            <input
              type="text"
              id="taskName"
              className="w-full border rounded p-2 text-black"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Create Task</button>
        </form>
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="tasks">
            {(provided) => (
              <ul
                {...provided.droppableProps}
                ref={provided.innerRef}
                className="space-y-2 w-1/2"
              >
                {tasks.map((task, index) => (
                  <Draggable key={task._id} draggableId={task._id} index={index}>
                    {(provided) => (
                      <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="bg-gray-800 p-2 rounded"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <span className="mr-2 cursor-move">
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
                              onClick={() => openNoteModal(task._id)}
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
                          <div className="mt-2 pl-6 bg-gray-700 p-2 rounded shadow">
                            <h4 className="font-semibold">Notes:</h4>
                            {taskNotes[task._id] && taskNotes[task._id].length > 0 ? (
                              <ul className="list-disc pl-4">
                                {taskNotes[task._id].map((note, index) => (
                                  <li key={note._id} className="text-sm text-gray-300 flex justify-between">
                                    {note.content}
                                    <button
                                      onClick={() => deleteNote(note._id, task._id)}
                                      className="text-red-500 font-bold px-2 py-1 rounded hover:bg-red-100"
                                    >
                                      <FontAwesomeIcon icon={faTrash} />
                                    </button>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-400">No notes yet.</p>
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
        </DragDropContext>
        {isInvitationsModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-1/3">
              <h3 className="text-xl font-semibold mb-4 text-white">Project Invitations</h3>
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div key={invitation._id} className="bg-gray-900 p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-white">{invitation.project.name}</span>
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

        {isInviteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-1/3">
              <h3 className="text-xl font-semibold mb-4 text-white">Invite Collaborator</h3>
              <form onSubmit={handleInviteSubmit}>
                <div className="mb-3">
                  <label htmlFor="inviteEmail" className="block mb-1 text-white">Email</label>
                  <input
                    type="email"
                    id="inviteEmail"
                    className="w-full border rounded p-2 bg-gray-900 text-white"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Send Invite</button>
                  <button onClick={() => setIsInviteModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {isNoteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-1/3">
              <h3 className="text-xl font-semibold mb-4 text-white">Add Note</h3>
              <form onSubmit={(e) => { e.preventDefault(); addNoteToTask(); }}>
                <div className="mb-3">
                  <label htmlFor="noteContent" className="block mb-1 text-white">Note</label>
                  <textarea
                    id="noteContent"
                    className="w-full border rounded p-2 bg-gray-900 text-white"
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                  ></textarea>
                </div>
                <div className="flex justify-end">
                  <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded mr-2">Add Note</button>
                  <button onClick={() => setIsNoteModalOpen(false)} className="bg-gray-500 text-white px-4 py-2 rounded">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ProjectTasks;
