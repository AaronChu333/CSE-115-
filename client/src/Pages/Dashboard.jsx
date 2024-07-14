import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

function Dashboard() {
    // Seperate states for projects and tasks
    const [projects, setProjects] = useState([]);
    const [tasks, setTasks] = useState([]);

    // States for new item creation
    const [newProject, setNewProject] = useState('');
    const [newTask, setNewTask] = useState('');

    // This function is to create new projects
    const addProject = (e) => {
        e.preventDefault(); // Prevents from submission from refreshing page
        if (newProject.trim()) { // This just makes sure the name field isn't empty
            setProjects([...projects, { id: Date.now(), name: newProject }]);
            setNewProject('');
        }
    };

    // Function to create new tasks
    const addTask = (e) => {
        e.preventDefault();
        if (newTask.trim()) {
            setTasks([...tasks, { id: Date.now(), name: newTask, completed: false }]);
            setNewTask('');
        }
    };

    const toggleTaskCompletion = (id) => {
        setTasks(tasks.map(task => 
            task.id === id ? { ...task, completed: !task.completed } : task
        ));
    };

    const deleteProject = (id) => {
        setProjects(projects.filter(project => project.id !== id));
    };

    const deleteTask = (id) => {
        setTasks(tasks.filter(task => task.id !== id));
    };

    return (
        <div className="dashboard-container bg-gray-100 min-h-screen p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold">Your Dashboard</h1>
            </header>
            
            {/*Projects*/}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Projects</h2>
                    <form onSubmit={addProject} className="mb-4">
                        <input
                            type="text"
                            value={newProject}
                            onChange={(e) => setNewProject(e.target.value)}
                            placeholder="New project name"
                            className="border p-2 mr-2"
                        />
                        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Add Project</button>
                    </form>
                    <ul className="space-y-2">
                        {projects.map(project => (
                            <li key={project.id} className="bg-gray-100 p-2 rounded flex justify-between items-center">
                            <span>{project.name}</span>
                            
                            {/* Button needs to be fixed. It showed up for a second but went away after server restart.*/}
                            <button 
                                onClick={() => deleteProject(project.id)}
                                className='text-red-500 font-bold px-2 py-1 rounded hover:bg-red-100'
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </button>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/*Tasks*/}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Tasks</h2>
                    <form onSubmit={addTask} className="mb-4">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="New task name"
                            className="border p-2 mr-2"
                        />
                        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">Add Task</button>
                    </form>
                    <ul className="space-y-2">
                        {tasks.map(task => (
                            <li key={task.id} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => toggleTaskCompletion(task.id)}
                                        className="mr-2"
                                    />
                                    <span className={task.completed ? 'line-through' : ''}>{task.name}</span>
                                </div>
                                {/* Button needs to be fixed. It showed up for a second but went away after server restart.*/}
                                <button
                                    onClick={() => deleteTask(task.id)}
                                    className="text-red-500 font-bold px-2 py-1 rounded hover:bg-red-100"
                                >
                                    <FontAwesomeIcon icon={faTrash} />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;