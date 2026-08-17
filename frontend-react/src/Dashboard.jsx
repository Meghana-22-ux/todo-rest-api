import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api/todos";

function Dashboard() {
  const navigate = useNavigate();

  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Edit states
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const token = localStorage.getItem("token");

  // Check login and fetch todos
  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    fetchTodos();
  }, []);

  // Get all todos
  const fetchTodos = async () => {
    try {
      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setTodos(response.data);
    } catch (error) {
      console.error("Failed to fetch todos:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
      }
    }
  };

  // Add todo
  const addTodo = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    try {
      await axios.post(
        API_URL,
        {
          title,
          description
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setTitle("");
      setDescription("");

      fetchTodos();
    } catch (error) {
      console.error("Failed to create todo:", error);
    }
  };

  // Start editing
  const startEdit = (todo) => {
    setEditingId(todo._id);
    setEditTitle(todo.title);
    setEditDescription(todo.description || "");
  };

  // Update todo
  const updateTodo = async (id) => {
    if (!editTitle.trim()) {
      alert("Title is required");
      return;
    }

    try {
      await axios.put(
        `${API_URL}/${id}`,
        {
          title: editTitle,
          description: editDescription
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setEditingId(null);
      setEditTitle("");
      setEditDescription("");

      fetchTodos();
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  };

  // Complete / pending
  const toggleTodo = async (todo) => {
    try {
      await axios.put(
        `${API_URL}/${todo._id}`,
        {
          completed: !todo.completed
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      fetchTodos();
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  };

  // Delete todo
  const deleteTodo = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this todo?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      fetchTodos();
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      {/* Header */}
      <header>
        <h1>My To-Do Dashboard</h1>

        {user && <p>Welcome, {user.name}!</p>}

        <button onClick={logout}>Logout</button>
      </header>

      <hr />

      {/* Add Todo */}
      <form onSubmit={addTodo}>
        <input
          type="text"
          placeholder="Todo title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />

        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(event) =>
            setDescription(event.target.value)
          }
        />

        <button type="submit">Add Todo</button>
      </form>

      <hr />

      {/* Todo List */}
      <div>
        {todos.length === 0 ? (
          <p>No todos found. Add your first todo!</p>
        ) : (
          todos.map((todo) => (
            <div key={todo._id}>
              {editingId === todo._id ? (
                /* Edit Form */
                <div>
                  <h3>Edit Todo</h3>

                  <input
                    type="text"
                    value={editTitle}
                    onChange={(event) =>
                      setEditTitle(event.target.value)
                    }
                  />

                  <input
                    type="text"
                    value={editDescription}
                    onChange={(event) =>
                      setEditDescription(event.target.value)
                    }
                  />

                  <button
                    onClick={() => updateTodo(todo._id)}
                  >
                    Save
                  </button>

                  <button onClick={cancelEdit}>
                    Cancel
                  </button>
                </div>
              ) : (
                /* Normal Todo */
                <div>
                  <h3>{todo.title}</h3>

                  <p>{todo.description}</p>

                  <p>
                    Status:{" "}
                    {todo.completed
                      ? "Completed"
                      : "Pending"}
                  </p>

                  <button
                    onClick={() => startEdit(todo)}
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => toggleTodo(todo)}
                  >
                    {todo.completed
                      ? "Mark Pending"
                      : "Complete"}
                  </button>

                  <button
                    onClick={() => deleteTodo(todo._id)}
                  >
                    Delete
                  </button>
                </div>
              )}

              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Dashboard;