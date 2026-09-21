import { useEffect, useState } from "react";
import "./App.css";

const API_URL =
  "https://c9hlc4o82g.execute-api.us-east-2.amazonaws.com/notices";

function App() {
  const [notices, setNotices] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // Stores information for the notice being edited
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");

  // Gets all notices from the backend
  const fetchNotices = async () => {
    const response = await fetch(API_URL);
    const data = await response.json();
    setNotices(data);
  };

  // Runs fetchNotices when the page first loads
  useEffect(() => {
    fetchNotices();
  }, []);

  // Creates a new notice
  const createNotice = async () => {
    await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: title,
        content: content,
      }),
    });

    setTitle("");
    setContent("");

    fetchNotices();
  };

  // Starts editing a notice
  const startEditing = (notice) => {
    setEditingId(notice._id);
    setEditTitle(notice.title);
    setEditContent(notice.content);
  };

  // Updates a notice using its id
  const updateNotice = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: editTitle,
        content: editContent,
      }),
    });

    setEditingId(null);
    fetchNotices();
  };

  // Deletes a notice using its id
  const deleteNotice = async (id) => {
    await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    fetchNotices();
  };

  return (
    <div className="app">
      <header className="top-bar">
        <div className="brand">TraineeHub</div>
        <div className="profile">
          <div className="avatar">AM</div>
          <div>
            <strong>Anish Mande</strong>
            <span>Trainee</span>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="page-heading">
          <p className="label">TRAINING PORTAL</p>
          <h1>Notice Board</h1>
          <p className="subtitle">
            Create and manage training announcements and updates.
          </p>
        </div>

        <div className="notice-counter">
          <span>Total Notices</span>
          <strong>{notices.length}</strong>
        </div>

        <section className="create-card">
          <h2>Create Notice</h2>
          <p className="card-description">
            Add a new announcement to the notice board.
          </p>

          <label>Title</label>
          <input
            type="text"
            placeholder="Enter notice title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <label>Content</label>
          <textarea
            placeholder="Enter notice content"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />

          <button className="create-button" onClick={createNotice}>
            + Create Notice
          </button>
        </section>

        <section className="notices-section">
          <div className="section-heading">
            <div>
              <h2>Notices</h2>
              <p>Current training announcements</p>
            </div>

            <span className="count-badge">{notices.length}</span>
          </div>

          {notices.length === 0 ? (
            <div className="empty-message">
              <h3>No notices yet</h3>
              <p>Create a notice above to get started.</p>
            </div>
          ) : (
            <div className="notice-list">
              {notices.map((notice) => (
                <div className="notice-card" key={notice._id}>
                  {editingId === notice._id ? (
                    <>
                      <label>Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(event) =>
                          setEditTitle(event.target.value)
                        }
                      />

                      <label>Content</label>
                      <textarea
                        value={editContent}
                        onChange={(event) =>
                          setEditContent(event.target.value)
                        }
                      />

                      <div className="button-row">
                        <button
                          className="save-button"
                          onClick={() => updateNotice(notice._id)}
                        >
                          Save
                        </button>

                        <button
                          className="cancel-button"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="announcement-label">ANNOUNCEMENT</p>

                      <h3>{notice.title}</h3>
                      <p className="notice-content">{notice.content}</p>

                      <div className="button-row">
                        <button
                          className="edit-button"
                          onClick={() => startEditing(notice)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-button"
                          onClick={() => deleteNotice(notice._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;