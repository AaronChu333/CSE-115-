import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faBars, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
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

  useEffect(() => {
    fetchTasks(projectId);
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
  };

  const addNoteToTask = (taskId) => {
    const note = prompt("Enter a note for this task:");
    if (note) {
      axios.post(`/api/tasks/${taskId}/notes`, { note })
        .then(response => {
          setTaskNotes(prev => ({
            ...prev,
            [taskId]: [...(prev[taskId] || []), note]
          }));
        })
        .catch(error => {
          console.error('Error adding note:', error);
        });
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

  return (
    <div className="project-tasks-container flex">
      <Sidebar />
      <div className="flex-1 bg-gray-100 min-h-screen p-8">
        <h1 className="text-3xl font-bold mb-8">{projectName}</h1>
        <form onSubmit={handleCreateTask} className="mb-4">
          <div className="mb-3 w-1/4">
            <label htmlFor="taskName" className="block mb-1">Task Name</label>
            <input
              type="text"
              id="taskName"
              className="w-full border rounded p-2"
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
                        className="bg-gray-100 p-2 rounded"
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </ul>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
}

export default ProjectTasks;
