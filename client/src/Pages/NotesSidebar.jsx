import React, { useState } from 'react';

function NotesSidebar({ item, notes, onAddNote, onClose }) {
    const [newNote, setNewNote] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newNote.trim()) {
            onAddNote(newNote);
            setNewNote('');
        }
    };

    return (
        <div className="fixed right-0 top-0 h-full w-64 bg-white shadow-lg p-4 overflow-y-auto">
            <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">
                X
            </button>
            <h2 className="text-xl font-bold mb-4">Notes for {item.name}</h2>
            <ul className="mb-4">
                {notes.map((note, index) => (
                    <li key={index} className="bg-gray-100 p-2 mb-2 rounded">{note}</li>
                ))}
            </ul>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="w-full p-2 border rounded mb-2"
                    placeholder="Add a new note..."
                ></textarea>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded w-full">
                    Add Note
                </button>
            </form>
        </div>
    );
}

export default NotesSidebar;