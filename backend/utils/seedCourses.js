import Course from "../models/Course.js";

const COURSE_SEED = [
  {
    title: "Web Development",
    description: "HTML, CSS, JavaScript, React",
    level: "Beginner",
    duration: "6 weeks",
    topics: ["HTML Basics", "CSS Layouts", "JavaScript Fundamentals", "React Components"],
    tasks: ["Build a static landing page", "Make a responsive navbar", "Create a React todo app"],
    teacher: "Admin",
    students: [],
  },
  {
    title: "Backend Development",
    description: "Node.js, Express, MongoDB",
    level: "Intermediate",
    duration: "7 weeks",
    topics: ["REST API design", "Express middleware", "MongoDB modeling", "JWT authentication"],
    tasks: ["Create auth API", "Build CRUD endpoints", "Deploy backend to cloud"],
    teacher: "Admin",
    students: [],
  },
  {
    title: "Data Structures & Algorithms",
    description: "Arrays, Linked List, Stack, Queue, Trees, Graphs",
    level: "Advanced",
    duration: "8 weeks",
    topics: ["Complexity analysis", "Tree traversals", "Graph algorithms", "Dynamic programming"],
    tasks: ["Solve 10 DSA problems", "Implement BFS/DFS", "Optimize a real coding challenge"],
    teacher: "Admin",
    students: [],
  },
  {
    title: "Data Science",
    description: "Python, NumPy, Pandas, Data Analysis, Visualization",
    level: "Intermediate",
    duration: "6 weeks",
    topics: ["Data cleaning", "Exploratory analysis", "Visualization basics"],
    tasks: ["Clean dataset", "Build dashboard", "Write insight report"],
    teacher: "Admin",
    students: [],
  },
  {
    title: "Machine Learning",
    description: "Supervised & Unsupervised Learning, Scikit-Learn",
    level: "Advanced",
    duration: "8 weeks",
    topics: ["Regression", "Classification", "Clustering", "Model evaluation"],
    tasks: ["Train a prediction model", "Compare model metrics", "Tune hyperparameters"],
    teacher: "Admin",
    students: [],
  },
  {
    title: "Artificial Intelligence",
    description: "AI Concepts, Search Algorithms, NLP Basics",
    level: "Advanced",
    duration: "7 weeks",
    topics: ["Heuristic search", "Knowledge representation", "NLP foundations"],
    tasks: ["Build mini chatbot", "Search algorithm simulation", "AI ethics summary"],
    teacher: "Admin",
    students: [],
  },
  {
    title: "Python Programming",
    description: "Core Python, OOP, File Handling, Libraries",
    level: "Beginner",
    duration: "5 weeks",
    topics: ["Syntax and loops", "Functions", "OOP basics", "File I/O"],
    tasks: ["Console calculator", "OOP mini project", "CSV parser script"],
    teacher: "Admin",
    students: [],
  },
  {
    title: "Java Programming",
    description: "Core Java, OOP, Collections, Multithreading",
    level: "Intermediate",
    duration: "6 weeks",
    topics: ["Class design", "Collections framework", "Exception handling", "Threads"],
    tasks: ["Library management app", "Collections challenge", "Threaded task runner"],
    teacher: "Admin",
    students: [],
  },
  {
    title: "Database Management Systems",
    description: "SQL, MySQL, Normalization, Indexing",
    level: "Intermediate",
    duration: "6 weeks",
    topics: ["SQL queries", "Normalization", "Indexes", "Transactions"],
    tasks: ["Design schema", "Write complex joins", "Optimize query speed"],
    teacher: "Admin",
    students: [],
  },
  {
    title: "Cloud Computing",
    description: "AWS Basics, EC2, S3, Deployment Concepts",
    level: "Intermediate",
    duration: "6 weeks",
    topics: ["Cloud fundamentals", "Compute and storage", "Deployment basics"],
    tasks: ["Launch VM", "Deploy backend", "Configure storage and access"],
    teacher: "Admin",
    students: [],
  },
  {
    title: "DevOps",
    description: "Git, Docker, CI/CD, Kubernetes Basics",
    level: "Advanced",
    duration: "7 weeks",
    topics: ["Version control strategy", "Containerization", "CI/CD workflows"],
    tasks: ["Dockerize app", "Create CI pipeline", "Deploy with container orchestration"],
    teacher: "Admin",
    students: [],
  },
  {
    title: "Cyber Security",
    description: "Network Security, OWASP, Ethical Hacking Basics",
    level: "Advanced",
    duration: "7 weeks",
    topics: ["Threat modeling", "OWASP Top 10", "Security testing basics"],
    tasks: ["Security audit checklist", "Fix vulnerable endpoint", "Incident response draft"],
    teacher: "Admin",
    students: [],
  },
];

const shouldBackfillList = (value) => !Array.isArray(value) || value.length === 0;

const seedCourses = async () => {
  for (const seed of COURSE_SEED) {
    const existing = await Course.findOne({ title: seed.title });

    if (!existing) {
      await Course.create(seed);
      continue;
    }

    let changed = false;

    if (!existing.level) {
      existing.level = seed.level;
      changed = true;
    }

    if (!existing.duration) {
      existing.duration = seed.duration;
      changed = true;
    }

    if (shouldBackfillList(existing.topics)) {
      existing.topics = seed.topics;
      changed = true;
    }

    if (shouldBackfillList(existing.tasks)) {
      existing.tasks = seed.tasks;
      changed = true;
    }

    if (changed) {
      await existing.save();
    }
  }

  console.log("Seed courses checked and updated successfully");
};

export default seedCourses;
