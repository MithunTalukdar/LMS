import Course from "../models/Course.js";

const seedCourses = async () => {
  const count = await Course.countDocuments();
  if (count > 0) return;

  await Course.insertMany([
    {
      title: "Web Development",
      description: "HTML, CSS, JavaScript, React",
      teacher: "Admin",
      students: []
    },
    {
      title: "Data Structures",
      description: "Arrays, Linked List, Stack, Queue",
      teacher: "Admin",
      students: []
    },
    {
      title: "Backend Development",
      description: "Node.js, Express, MongoDB",
      teacher: "Admin",
      students: []
    }
  ]);

  console.log("✅ Dummy courses added");
};

export default seedCourses;
