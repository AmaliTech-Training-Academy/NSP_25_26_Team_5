import React, { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { postAPI, categoryAPI, type Category } from "../services/api";
import { useAuth } from "../context/AuthContext";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    categoryAPI.getAll().then((res) => setCategories(res.data)).catch(() => {});
  }, []);

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await postAPI.create({ title, content, categoryId: categoryId || null });
      navigate("/");
    } catch {
      setError("Failed to create post");
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "60px auto" }}>
      <h1>Create New Post</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Post Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Select Category (optional)</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <textarea rows={8} placeholder="Write your post content..." value={content} onChange={(e) => setContent(e.target.value)} required />
        <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>Publish Post</button>
      </form>
    </div>
  );
};

export default CreatePost;
