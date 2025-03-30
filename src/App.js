import React, { useState, useEffect } from "react";
import "./App.css";

const API_URL = "http://localhost:5000/users";

function User({ firstName, lastName, email, onDelete, onEdit, id }) {
  return (
    <li>
      <strong>{firstName} {lastName}</strong> - {email}
      <button onClick={() => onEdit(id)}>Edit</button>
      <button onClick={() => onDelete(id)}>Delete</button>
    </li>
  );
}

function App() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "" });
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetch(API_URL)
      .then(res => res.json())
      .then(data => setUsers(data))
      .catch(err => console.error("Error fetching users:", err));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Add new user
  const addUser = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) return;
    
    fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(res => res.json())
      .then(newUser => setUsers([...users, newUser]))
      .catch(err => console.error("Error adding user:", err));

    setFormData({ firstName: "", lastName: "", email: "" });
  };

  // Edit user and save edited user
  const editUser = (id) => {
    const userToEdit = users.find(user => user.id === id);
    setEditingUser(userToEdit);
    setFormData(userToEdit);
  };

  const saveEditedUser = () => {
    if (!formData.firstName || !formData.lastName || !formData.email) return;

    fetch(`${API_URL}/${editingUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then(() => {
        setUsers(users.map(user => (user.id === editingUser.id ? { ...formData, id: user.id } : user)));
        setEditingUser(null);
        setFormData({ firstName: "", lastName: "", email: "" });
      })
      .catch(err => console.error("Error updating user:", err));
  };

  // Delete user
  const deleteUser = (id) => {
    fetch(`${API_URL}/${id}`, { method: "DELETE" })
      .then(() => setUsers(users.filter(user => user.id !== id)))
      .catch(err => console.error("Error deleting user:", err));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>User List</h1>

        <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" required />
        <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" required />
        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Email Address" required />

        {editingUser ? <button onClick={saveEditedUser}>Save Edit</button> : <button onClick={addUser}>Add User</button>}

        <h2>Users</h2>
        <ul>
          {users.map(user => (
            <User key={user.id} id={user.id} {...user} onDelete={deleteUser} onEdit={editUser} />
          ))}
        </ul>
      </header>
    </div>
  );
}

export default App;
