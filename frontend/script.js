document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = 'http://localhost:5000';

    // Fetch and display notes
    function fetchNotes() {
        fetch(`${apiUrl}/notes`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(notes => {
                const notesContainer = document.getElementById('notes-container');
                notesContainer.innerHTML = '';
                notes.forEach(note => {
                    const noteElement = document.createElement('div');
                    noteElement.classList.add('card', 'mb-3', 'note');
                    noteElement.style.borderLeftColor = note.backgroundColor;
                    noteElement.style.borderLeftWidth = "5px";
                    noteElement.innerHTML = `
                    <div class="card-body">
                        <h3 class="card-title">${note.title}</h3>
                        <p class="card-text">${note.content}</p>
                        <div class="tags mb-3">
                            <span class="badge badge-secondary px-3 py-2">${note.tags.split(',').join('</span> <span class="px-3 py-2 badge badge-secondary">')}</span>
                        </div>
                        <button class="btn btn-outline-primary edit-note-button" data-id="${note.id}">Edit</button>
                        <button class="btn btn-outline-primary archive-note-button" data-id="${note.id}">Archeive</button>
                        <button class="btn btn-outline-danger delete-note-button" data-id="${note.id}"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="25" viewBox="0 0 16 16">
                        <path d="M 6.496094 1 C 5.675781 1 5 1.675781 5 2.496094 L 5 3 L 2 3 L 2 4 L 3 4 L 3 12.5 C 3 13.328125 3.671875 14 4.5 14 L 10.5 14 C 11.328125 14 12 13.328125 12 12.5 L 12 4 L 13 4 L 13 3 L 10 3 L 10 2.496094 C 10 1.675781 9.324219 1 8.503906 1 Z M 6.496094 2 L 8.503906 2 C 8.785156 2 9 2.214844 9 2.496094 L 9 3 L 6 3 L 6 2.496094 C 6 2.214844 6.214844 2 6.496094 2 Z M 5 5 L 6 5 L 6 12 L 5 12 Z M 7 5 L 8 5 L 8 12 L 7 12 Z M 9 5 L 10 5 L 10 12 L 9 12 Z"></path>
                        </svg></button>
                    </div>
                    `;
                    notesContainer.appendChild(noteElement);
                });
            })
            .catch(error => {
                console.error('Error fetching notes:', error);
            });
    }

    // Handle search
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', function () {
            const query = searchBar.value.toLowerCase();
            document.querySelectorAll('.note').forEach(note => {
                const title = note.querySelector('h3').textContent.toLowerCase();
                const content = note.querySelector('p').textContent.toLowerCase();
                note.style.display = title.includes(query) || content.includes(query) ? 'block' : 'none';
            });
        });
    }

    // Open note modal for creating or editing
    const noteModal = document.getElementById('note-modal');
    const noteForm = document.getElementById('note-form');

    document.getElementById('create-note-button').addEventListener('click', function () {
        noteModal.style.display = 'block';
        noteForm.reset(); // Ensure this element is found
        noteForm.dataset.action = 'create';
    });

    document.querySelector('.close-button').addEventListener('click', function () {
        noteModal.style.display = 'none';
    });

    // Handle logout
    document.getElementById('logout-button').addEventListener('click', function () {
        localStorage.removeItem('token');
        window.location.href = 'login.html';
    });

    // Fetch archived notes
    document.getElementById('view-archive-button').addEventListener('click', function () {
        fetch(`${apiUrl}/notes/archived`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(notes => {
                const notesContainer = document.getElementById('notes-container');
                notesContainer.innerHTML = '';
                notes.forEach(note => {
                    const noteElement = document.createElement('div');
                    noteElement.classList.add('card', 'mb-3', 'note');
                    noteElement.style.borderLeftColor = note.backgroundColor;
                    noteElement.style.borderLeftWidth = "5px";
                    noteElement.innerHTML = `
                    <div class="card-body">
                        <h3 class="card-title">${note.title}</h3>
                        <p class="card-text">${note.content}</p>
                        <div class="tags mb-3">
                            <span class="badge badge-secondary px-3 py-2">${note.tags.split(',').join('</span> <span class="px-3 py-2 badge badge-secondary">')}</span>
                        </div>
                        <button class="btn btn-outline-primary edit-note-button" data-id="${note.id}">Edit</button>
                        <button class="btn btn-outline-primary restore-archeive-note-button" data-id="${note.id}">Remove Archive</button>
                        <button class="btn btn-outline-danger delete-note-button" data-id="${note.id}"><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="25" viewBox="0 0 16 16">
                        <path d="M 6.496094 1 C 5.675781 1 5 1.675781 5 2.496094 L 5 3 L 2 3 L 2 4 L 3 4 L 3 12.5 C 3 13.328125 3.671875 14 4.5 14 L 10.5 14 C 11.328125 14 12 13.328125 12 12.5 L 12 4 L 13 4 L 13 3 L 10 3 L 10 2.496094 C 10 1.675781 9.324219 1 8.503906 1 Z M 6.496094 2 L 8.503906 2 C 8.785156 2 9 2.214844 9 2.496094 L 9 3 L 6 3 L 6 2.496094 C 6 2.214844 6.214844 2 6.496094 2 Z M 5 5 L 6 5 L 6 12 L 5 12 Z M 7 5 L 8 5 L 8 12 L 7 12 Z M 9 5 L 10 5 L 10 12 L 9 12 Z"></path>
                        </svg></button>
                    </div>
                    `;
                    notesContainer.appendChild(noteElement);
                });
            })
            .catch(error => {
                console.error('Error fetching archived notes:', error);
            });
    });

    // Fetch trashed notes
    document.getElementById('view-trash-button').addEventListener('click', function () {
        fetch(`${apiUrl}/notes/trash`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(notes => {
                const notesContainer = document.getElementById('notes-container');
                notesContainer.innerHTML = '';
                notes.forEach(note => {
                    const noteElement = document.createElement('div');
                    noteElement.classList.add('card', 'mb-3', 'note');
                    noteElement.style.borderLeftColor = note.backgroundColor;
                    noteElement.style.borderLeftWidth = "5px";
                    noteElement.innerHTML = `
                    <div class="card-body">
                        <h3 class="card-title">${note.title}</h3>
                        <p class="card-text">${note.content}</p>
                        <div class="tags mb-3">
                            <span class="badge badge-secondary px-3 py-2">${note.tags.split(',').join('</span> <span class="px-3 py-2 badge badge-secondary">')}</span>
                        </div>
                        <button class="btn btn-outline-danger restore-note-button" data-id="${note.id}">Restore</button>
                    </div>
                    `;
                    notesContainer.appendChild(noteElement);
                });
            })
            .catch(error => {
                console.error('Error fetching trashed notes:', error);
            });
    });

    // Handle form submission for creating and editing notes
    noteForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const action = noteForm.dataset.action;
        const noteId = noteForm.dataset.id;
        const note = {
            title: document.getElementById('note-title').value,
            content: document.getElementById('note-content').value,
            tags: document.getElementById('note-tags').value.split(','),
            backgroundColor: document.getElementById('note-color').value,
            reminderDate: document.getElementById('note-reminder').value
        };

        if (action === 'create') {
            createNote(note);
        } else if (action === 'edit') {
            updateNote(noteId, note);
        }
    });

    // Create a new note
    function createNote(note) {
        fetch(`${apiUrl}/notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(note)
        })
            .then(response => response.json())
            .then(() => {
                noteModal.style.display = 'none';
                fetchNotes(); // Refresh notes list
            })
            .catch(error => {
                console.error('Error creating note:', error);
            });
    }

    // Update an existing note
    function updateNote(noteId, note) {
        fetch(`${apiUrl}/notes/${noteId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(note)
        })
            .then(response => response.json())
            .then(() => {
                noteModal.style.display = 'none';
                fetchNotes(); // Refresh notes list
            })
            .catch(error => {
                console.error('Error updating note:', error);
            });
    }

    // Restore a trashed Note
    function RestoreNoteById(noteId) {
        fetch(`${apiUrl}/notes/${noteId}/restore`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(() => {
                fetchNotes();
            })
            .catch(error => {
                console.error('Error restoring note:', error);
            });
    }

    // Fetch note by ID for editing
    function fetchNoteById(noteId) {
        fetch(`${apiUrl}/notes/${noteId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(note => {
                noteModal.style.display = 'block';
                document.getElementById('note-title').value = note.title;
                document.getElementById('note-content').value = note.content;
                let tagsArray = [];
                let strTags;
                if (note.tags) {
                    if (typeof note.tags === 'string') {
                        tagsArray = note.tags.split(',');
                        strTags = tagsArray.join(',')
                        console.log(tagsArray.join(','))
                    } else if (Array.isArray(note.tags)) {
                        tagsArray = note.tags;
                    } else {
                        console.error('Error: note.tags is not a string or array:', note.tags);
                    }
                }
                document.getElementById('note-tags').value = strTags;
                document.getElementById('note-color').value = note.backgroundColor;
                document.getElementById('note-reminder').value = note.reminderDate;
                noteForm.dataset.action = 'edit';
                noteForm.dataset.id = note.id;
            })
            .catch(error => {
                console.error('Error fetching note:', error);
            });
    }

    // Delete note by ID
    function deleteNoteById(noteId) {
        fetch(`${apiUrl}/notes/${noteId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(() => {
                fetchNotes();
            })
            .catch(error => {
                console.error('Error deleting note:', error);
            });
    }

    //Archeive note by ID
    function archiveNoteById(noteId) {
        fetch(`${apiUrl}/notes/${noteId}/archive`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Note archived:', data);
                fetchNotes();
            })
            .catch(error => {
                console.error('Error archiving note:', error);
            });
    }

    // Restore archived note
    function restoreArchiveNoteById(noteId) {
        fetch(`${apiUrl}/notes/${noteId}/archive/restore`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log('Note archived:', data);
                fetchNotes();
            })
            .catch(error => {
                console.error('Error archiving note:', error);
            });
    }


    // Initial fetch of notes
    document.getElementById("view-notes-button").addEventListener("click", () => {
        fetchNotes()
    })
    fetchNotes();

    // Event listeners for edit and delete note buttons
    document.getElementById('notes-container').addEventListener('click', function (event) {
        if (event.target.classList.contains('edit-note-button')) {
            const noteId = event.target.dataset.id;
            fetchNoteById(noteId);
        }

        if (event.target.classList.contains('delete-note-button')) {
            const noteId = event.target.dataset.id;
            deleteNoteById(noteId);
        }

        if (event.target.classList.contains('archive-note-button')) {
            const noteId = event.target.dataset.id;
            archiveNoteById(noteId);
        }

        if (event.target.classList.contains('restore-note-button')) {
            const noteId = event.target.dataset.id;
            RestoreNoteById(noteId);
        }

        if (event.target.classList.contains('restore-archeive-note-button')) {
            const noteId = event.target.dataset.id;
            restoreArchiveNoteById(noteId);
        }

        if (event.target.classList.contains('restore-archeive-note-button')) {
            const noteId = event.target.dataset.id;
            restoreArchiveNoteById(noteId);
        }
    });
});
