import Course from "../models/Course.js";
import Task from "../models/Task.js";
import Progress from "../models/Progress.js";

const TASK_BANK = {
  "Web Development": [
    {
      title: "Semantic Landing Page",
      description: "Build a single-page layout using semantic HTML tags and accessibility-friendly structure.",
      deadlineDays: 7
    },
    {
      title: "Responsive Flex/Grid Challenge",
      description: "Create a responsive section using Flexbox and CSS Grid with mobile and desktop breakpoints.",
      deadlineDays: 10
    },
    {
      title: "DOM Form Validator",
      description: "Implement client-side validation for a signup form using JavaScript DOM events.",
      deadlineDays: 14
    },
    {
      title: "Mini React Components",
      description: "Build reusable card and button components in React with props and state.",
      deadlineDays: 18
    }
  ],
  "Backend Development": [
    {
      title: "Express Route Setup",
      description: "Create CRUD routes for a sample resource using Express router and controllers.",
      deadlineDays: 7
    },
    {
      title: "JWT Auth Middleware",
      description: "Implement login token generation and protect private API endpoints with middleware.",
      deadlineDays: 11
    },
    {
      title: "MongoDB Model Design",
      description: "Design Mongoose schemas for users and courses with validation rules.",
      deadlineDays: 15
    },
    {
      title: "Paginated API Endpoint",
      description: "Build a paginated endpoint with query filters and sorted response output.",
      deadlineDays: 20
    }
  ],
  "Data Structures & Algorithms": [
    {
      title: "Array and String Practice",
      description: "Solve five array and string problems with clean time complexity notes.",
      deadlineDays: 7
    },
    {
      title: "Linked List Operations",
      description: "Implement insertion, deletion, and traversal operations for a singly linked list.",
      deadlineDays: 11
    },
    {
      title: "Stack and Queue Simulator",
      description: "Build stack and queue classes and demonstrate push/pop/enqueue/dequeue operations.",
      deadlineDays: 15
    },
    {
      title: "Tree Traversal Set",
      description: "Implement DFS and BFS tree traversals and compare their use cases.",
      deadlineDays: 19
    }
  ],
  "Data Science": [
    {
      title: "Dataset Cleaning Notebook",
      description: "Clean missing values, duplicates, and inconsistent fields in a CSV dataset.",
      deadlineDays: 7
    },
    {
      title: "Exploratory Data Analysis",
      description: "Create summary statistics and visual insights from a business dataset.",
      deadlineDays: 11
    },
    {
      title: "Feature Engineering Task",
      description: "Prepare meaningful features from raw columns for downstream modeling.",
      deadlineDays: 15
    },
    {
      title: "Visualization Storyboard",
      description: "Build charts and a short narrative explaining trends and anomalies.",
      deadlineDays: 20
    }
  ],
  "Machine Learning": [
    {
      title: "Train/Test Pipeline",
      description: "Split data and build a baseline model with reproducible preprocessing steps.",
      deadlineDays: 7
    },
    {
      title: "Classification Model Comparison",
      description: "Compare at least two models using precision, recall, and F1 metrics.",
      deadlineDays: 12
    },
    {
      title: "Cross Validation Workflow",
      description: "Use k-fold cross-validation and document observed stability of scores.",
      deadlineDays: 16
    },
    {
      title: "Overfitting Reduction Task",
      description: "Apply regularization or pruning and report improvement on validation data.",
      deadlineDays: 21
    }
  ],
  "Artificial Intelligence": [
    {
      title: "Search Problem Modeling",
      description: "Model a real-world problem as state space and define goal and transitions.",
      deadlineDays: 7
    },
    {
      title: "A* Heuristic Exercise",
      description: "Implement A* search with an admissible heuristic and explain path choices.",
      deadlineDays: 12
    },
    {
      title: "NLP Tokenization Task",
      description: "Tokenize sample text and perform basic preprocessing for analysis.",
      deadlineDays: 16
    },
    {
      title: "Knowledge Graph Mini Task",
      description: "Represent entity relationships using a graph structure and simple queries.",
      deadlineDays: 21
    }
  ],
  "Python Programming": [
    {
      title: "Function Practice Sheet",
      description: "Write reusable Python functions with argument validation and docstrings.",
      deadlineDays: 7
    },
    {
      title: "OOP Class Design",
      description: "Create classes with inheritance and method overriding for a sample domain.",
      deadlineDays: 11
    },
    {
      title: "File Parsing Task",
      description: "Read structured text/CSV files and generate summarized output.",
      deadlineDays: 15
    },
    {
      title: "Mini Automation Script",
      description: "Build a script that automates one repetitive local workflow.",
      deadlineDays: 19
    }
  ],
  "Java Programming": [
    {
      title: "Core Java Syntax Task",
      description: "Implement basic control flow and methods in a simple Java program.",
      deadlineDays: 7
    },
    {
      title: "Collections Practice",
      description: "Use List, Set, and Map with practical insertion and lookup operations.",
      deadlineDays: 11
    },
    {
      title: "Exception Handling Exercise",
      description: "Handle checked and unchecked exceptions with clear recovery paths.",
      deadlineDays: 15
    },
    {
      title: "Multithreading Intro",
      description: "Create two threads and demonstrate synchronized shared resource access.",
      deadlineDays: 20
    }
  ],
  "Database Management Systems": [
    {
      title: "SQL Query Fundamentals",
      description: "Write SELECT, WHERE, ORDER BY, and GROUP BY queries on sample tables.",
      deadlineDays: 7
    },
    {
      title: "Normalization Worksheet",
      description: "Normalize a sample schema up to 3NF and justify each transformation.",
      deadlineDays: 11
    },
    {
      title: "Join Operations Task",
      description: "Solve INNER, LEFT, and RIGHT JOIN tasks on relational data.",
      deadlineDays: 15
    },
    {
      title: "Indexing and Performance",
      description: "Create indexes and compare execution speed before and after indexing.",
      deadlineDays: 20
    }
  ],
  "Cloud Computing": [
    {
      title: "Cloud Service Mapping",
      description: "Map common app needs to cloud services (compute, storage, database, networking).",
      deadlineDays: 7
    },
    {
      title: "Deploy Static App",
      description: "Deploy a static frontend to a cloud bucket/CDN and share endpoint details.",
      deadlineDays: 11
    },
    {
      title: "Scalability Plan",
      description: "Design an auto-scaling setup for expected peak traffic.",
      deadlineDays: 15
    },
    {
      title: "Cloud Cost Estimation",
      description: "Prepare an estimated monthly cost table for a small app architecture.",
      deadlineDays: 20
    }
  ],
  DevOps: [
    {
      title: "Git Workflow Task",
      description: "Create a branch-based workflow with clear commit and PR-style history.",
      deadlineDays: 7
    },
    {
      title: "Dockerize App",
      description: "Containerize an app and verify it runs with environment-based config.",
      deadlineDays: 11
    },
    {
      title: "CI Pipeline Setup",
      description: "Set up a CI job for linting, tests, and build checks.",
      deadlineDays: 15
    },
    {
      title: "Kubernetes Deployment",
      description: "Deploy a containerized app to Kubernetes with replicas and rolling updates.",
      deadlineDays: 20
    }
  ],
  "Cyber Security": [
    {
      title: "OWASP Risk Review",
      description: "Analyze a sample app for top OWASP risks and propose mitigations.",
      deadlineDays: 7
    },
    {
      title: "Secure Auth Checklist",
      description: "Implement and validate password policy, MFA, and account lockout rules.",
      deadlineDays: 11
    },
    {
      title: "Input Validation Task",
      description: "Harden API inputs against common injection and malformed payloads.",
      deadlineDays: 15
    },
    {
      title: "Security Incident Playbook",
      description: "Draft a response flow for detection, containment, and post-incident review.",
      deadlineDays: 20
    }
  ]
};

const normalize = value => String(value || "").trim().toLowerCase();
const plusDays = days => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const seedTasks = async () => {
  const courseTitles = Object.keys(TASK_BANK);
  const courses = await Course.find({ title: { $in: courseTitles } })
    .select("_id title")
    .lean();

  const courseByTitle = new Map(courses.map(course => [course.title, course]));
  let insertedCount = 0;

  for (const courseTitle of courseTitles) {
    const course = courseByTitle.get(courseTitle);
    if (!course) continue;

    const existingTasks = await Task.find({ courseId: course._id })
      .select("title")
      .lean();
    const existingTitles = new Set(existingTasks.map(task => normalize(task.title)));

    const pending = TASK_BANK[courseTitle]
      .filter(item => !existingTitles.has(normalize(item.title)))
      .map(item => ({
        courseId: course._id,
        title: item.title,
        description: item.description,
        deadline: plusDays(item.deadlineDays || 14)
      }));

    if (pending.length > 0) {
      await Task.insertMany(pending);
      insertedCount += pending.length;
    }

    const totalTasks = await Task.countDocuments({ courseId: course._id });
    await Progress.updateMany({ courseId: course._id }, { $set: { totalTasks } });
  }

  console.log(`Course tasks checked/added successfully (${insertedCount} inserted)`);
};

export default seedTasks;
