import Course from "../models/Course.js";

const seedCourses = async () => {
  const courses = [
    {
      title: "Web Development",
      description: "HTML, CSS, JavaScript, React",
      teacher: "Admin",
      students: []
    },
    {
      title: "Backend Development",
      description: "Node.js, Express, MongoDB",
      teacher: "Admin",
      students: []
    },
    {
      title: "Data Structures & Algorithms",
      description: "Arrays, Linked List, Stack, Queue, Trees, Graphs",
      teacher: "Admin",
      students: []
    },
    {
      title: "Data Science",
      description: "Python, NumPy, Pandas, Data Analysis, Visualization",
      teacher: "Admin",
      students: []
    },
    {
      title: "Machine Learning",
      description: "Supervised & Unsupervised Learning, Scikit-Learn",
      teacher: "Admin",
      students: []
    },
    {
      title: "Artificial Intelligence",
      description: "AI Concepts, Search Algorithms, NLP Basics",
      teacher: "Admin",
      students: []
    },
    {
      title: "Python Programming",
      description: "Core Python, OOP, File Handling, Libraries",
      teacher: "Admin",
      students: []
    },
    {
      title: "Java Programming",
      description: "Core Java, OOP, Collections, Multithreading",
      teacher: "Admin",
      students: []
    },
    {
      title: "Database Management Systems",
      description: "SQL, MySQL, Normalization, Indexing",
      teacher: "Admin",
      students: []
    },
    {
      title: "Cloud Computing",
      description: "AWS Basics, EC2, S3, Deployment Concepts",
      teacher: "Admin",
      students: []
    },
    {
      title: "DevOps",
      description: "Git, Docker, CI/CD, Kubernetes Basics",
      teacher: "Admin",
      students: []
    },
    {
      title: "Cyber Security",
      description: "Network Security, OWASP, Ethical Hacking Basics",
      teacher: "Admin",
      students: []
    }
  ];

  for (const course of courses) {
    const exists = await Course.findOne({ title: course.title });
    if (!exists) {
      await Course.create(course);
    }
  }

  console.log("✅ Dummy courses checked/added successfully");
};

export default seedCourses;
