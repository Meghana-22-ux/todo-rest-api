const API_URL = "https://todo-rest-api-47s4.onrender.com/api/todos";

const todoForm = document.getElementById("todoForm");
const todoList = document.getElementById("todoList");

const totalCount = document.getElementById("totalCount");
const pendingCount = document.getElementById("pendingCount");
const completedCount = document.getElementById("completedCount");

let allTodos = [];
let currentFilter = "all";


// ========================================
// LOAD TODOS
// ========================================

async function loadTodos() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Failed to fetch todos");
        }

        allTodos = await response.json();

        updateStatistics();

        displayTodos();

    } catch (error) {

        console.error("Error loading todos:", error);

        todoList.innerHTML = `
            <div class="empty-message">
                ❌ Unable to load tasks.
                Make sure the backend server is running.
            </div>
        `;
    }
}


// ========================================
// DISPLAY TODOS
// ========================================

function displayTodos() {

    todoList.innerHTML = "";

    let filteredTodos = allTodos;

    // Apply filter
    if (currentFilter === "pending") {

        filteredTodos = allTodos.filter(
            todo => !todo.completed
        );

    } else if (currentFilter === "completed") {

        filteredTodos = allTodos.filter(
            todo => todo.completed
        );
    }


    // Empty state
    if (filteredTodos.length === 0) {

        todoList.innerHTML = `
            <div class="empty-message">
                <div class="empty-icon">📋</div>

                <h3>No tasks found</h3>

                <p>
                    Add a new task to get started!
                </p>
            </div>
        `;

        return;
    }


    // Display todos
    filteredTodos.forEach(todo => {

        const todoElement = document.createElement("div");

        todoElement.className = "todo";

        if (todo.completed) {
            todoElement.classList.add("completed");
        }


        todoElement.innerHTML = `

            <div class="todo-content">

                <h3>
                    ${escapeHTML(todo.title)}
                </h3>

                <p>
                    ${escapeHTML(todo.description || "No description")}
                </p>

                <span class="status-badge ${
                    todo.completed
                        ? "completed-status"
                        : "pending-status"
                }">
                    ${
                        todo.completed
                            ? "Completed ✅"
                            : "Pending ⏳"
                    }
                </span>

            </div>


            <div class="todo-actions">

                <button
                    class="complete-btn"
                    onclick="toggleTodo(
                        '${todo._id}',
                        ${todo.completed}
                    )"
                >
                    ${
                        todo.completed
                            ? "↩️ Mark Pending"
                            : "✅ Complete"
                    }
                </button>


                <button
                    class="edit-btn"
                    onclick="editTodo(
                        '${todo._id}',
                        '${escapeForAttribute(todo.title)}',
                        '${escapeForAttribute(todo.description || "")}'
                    )"
                >
                    ✏️ Edit
                </button>


                <button
                    class="delete-btn"
                    onclick="deleteTodo('${todo._id}')"
                >
                    🗑️ Delete
                </button>

            </div>

        `;

        todoList.appendChild(todoElement);

    });
}


// ========================================
// UPDATE STATISTICS
// ========================================

function updateStatistics() {

    const total = allTodos.length;

    const completed = allTodos.filter(
        todo => todo.completed
    ).length;

    const pending = total - completed;


    totalCount.textContent = total;

    pendingCount.textContent = pending;

    completedCount.textContent = completed;
}


// ========================================
// ADD TODO
// ========================================

todoForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const title =
        document.getElementById("title").value.trim();

    const description =
        document.getElementById("description").value.trim();


    if (!title) {

        alert("Please enter a task title.");

        return;
    }


    try {

        const response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                title,
                description
            })

        });


        if (!response.ok) {

            throw new Error("Failed to create todo");

        }


        todoForm.reset();

        await loadTodos();

    } catch (error) {

        console.error("Error adding todo:", error);

        alert("Unable to add task.");

    }

});


// ========================================
// TOGGLE TODO
// ========================================

async function toggleTodo(id, currentStatus) {

    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    completed: !currentStatus
                })

            }
        );


        if (!response.ok) {

            throw new Error("Failed to update todo");

        }


        await loadTodos();

    } catch (error) {

        console.error("Error updating todo:", error);

        alert("Unable to update task.");

    }

}


// ========================================
// EDIT TODO
// ========================================

async function editTodo(id, oldTitle, oldDescription) {

    const newTitle = prompt(
        "Edit task title:",
        oldTitle
    );


    if (newTitle === null) {
        return;
    }


    const trimmedTitle = newTitle.trim();


    if (!trimmedTitle) {

        alert("Task title cannot be empty.");

        return;
    }


    const newDescription = prompt(
        "Edit description:",
        oldDescription
    );


    if (newDescription === null) {
        return;
    }


    try {

        const todo = allTodos.find(
            item => item._id === id
        );


        const response = await fetch(
            `${API_URL}/${id}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    title: trimmedTitle,

                    description: newDescription.trim(),

                    completed: todo
                        ? todo.completed
                        : false

                })

            }
        );


        if (!response.ok) {

            throw new Error("Failed to edit todo");

        }


        await loadTodos();

    } catch (error) {

        console.error("Error editing todo:", error);

        alert("Unable to edit task.");

    }

}


// ========================================
// DELETE TODO
// ========================================

async function deleteTodo(id) {

    const confirmDelete = confirm(
        "Are you sure you want to delete this task?"
    );


    if (!confirmDelete) {
        return;
    }


    try {

        const response = await fetch(
            `${API_URL}/${id}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            throw new Error("Failed to delete todo");

        }


        await loadTodos();

    } catch (error) {

        console.error("Error deleting todo:", error);

        alert("Unable to delete task.");

    }

}


// ========================================
// FILTER TODOS
// ========================================

function filterTodos(filter) {

    currentFilter = filter;


    // Update active button

    const buttons =
        document.querySelectorAll(".filter-btn");


    buttons.forEach(button => {

        button.classList.remove("active");

    });


    event.target.classList.add("active");


    displayTodos();

}


// ========================================
// HTML SECURITY HELPER
// ========================================

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


// ========================================
// ATTRIBUTE SECURITY HELPER
// ========================================

function escapeForAttribute(text) {

    return text
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");

}


// ========================================
// INITIAL LOAD
// ========================================

loadTodos();