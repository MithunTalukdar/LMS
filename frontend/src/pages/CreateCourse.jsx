import { useState } from "react";
import axios from "axios";

const CreateCourse = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const user = JSON.parse(localStorage.getItem("user"));

  const handleCreate = async (e) => {
    e.preventDefault();

    try {
      await axios.post(
        "http://localhost:5000/api/courses",
        {
          title,
          description,
          instructor: user._id,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      alert("Course created successfully");
      setTitle("");
      setDescription("");
    } catch (error) {
      alert("Failed to create course");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center">
      <form
        onSubmit={handleCreate}
        className="bg-white p-6 rounded shadow-md w-96"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Create New Course
        </h2>

        <input
          type="text"
          placeholder="Course Title"
          className="w-full p-2 border mb-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Course Description"
          className="w-full p-2 border mb-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />

        <button className="w-full bg-purple-600 text-white py-2 rounded">
          Create Course
        </button>
      </form>
    </div>
  );
};

export default CreateCourse;
