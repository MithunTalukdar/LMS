import Course from "../models/Course.js";
import Quiz from "../models/Quiz.js";

const QUIZ_BANK = {
  "Web Development": [
    {
      topic: "HTML & Accessibility",
      question: "Which HTML element is best for the main navigation links?",
      options: ["<section>", "<nav>", "<header>", "<aside>"],
      correctAnswer: 1
    },
    {
      topic: "CSS Layout",
      question: "In Flexbox, which property controls spacing along the main axis?",
      options: ["align-items", "justify-content", "align-content", "place-items"],
      correctAnswer: 1
    },
    {
      topic: "React Basics",
      question: "Which hook is used to store local component state in React?",
      options: ["useEffect", "useMemo", "useRef", "useState"],
      correctAnswer: 3
    },
    {
      topic: "JavaScript Fundamentals",
      question: "Which declaration cannot be reassigned after initialization?",
      options: ["var", "let", "const", "function"],
      correctAnswer: 2
    },
    {
      topic: "Web Performance",
      question: "Lazy loading images primarily helps to:",
      options: [
        "Increase JavaScript bundle size",
        "Improve initial page load performance",
        "Disable browser caching",
        "Prevent responsive layouts"
      ],
      correctAnswer: 1
    }
  ],
  "Backend Development": [
    {
      topic: "Express",
      question: "What does Express middleware mainly do?",
      options: [
        "Compile JavaScript files",
        "Process request and response in a chain",
        "Create MongoDB collections",
        "Encrypt passwords automatically"
      ],
      correctAnswer: 1
    },
    {
      topic: "MongoDB",
      question: "What is the main benefit of creating an index in MongoDB?",
      options: [
        "Reduce document size",
        "Improve query performance",
        "Increase write latency",
        "Disable duplicate keys"
      ],
      correctAnswer: 1
    },
    {
      topic: "Authentication",
      question: "JWT is most commonly used for:",
      options: [
        "Image optimization",
        "Server-side rendering",
        "Stateless user authentication",
        "Relational joins"
      ],
      correctAnswer: 2
    },
    {
      topic: "REST APIs",
      question: "Which HTTP status code is typically returned after creating a new resource?",
      options: ["200", "201", "204", "404"],
      correctAnswer: 1
    },
    {
      topic: "Node.js Runtime",
      question: "The Node.js event loop mainly allows:",
      options: [
        "Synchronous blocking I/O by default",
        "Handling asynchronous callbacks efficiently",
        "Automatic SQL optimization",
        "Browser rendering on server"
      ],
      correctAnswer: 1
    }
  ],
  "Data Structures & Algorithms": [
    {
      topic: "Complexity",
      question: "What is the time complexity of binary search on a sorted array?",
      options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
      correctAnswer: 1
    },
    {
      topic: "Linear Data Structures",
      question: "Which data structure works on the Last In First Out principle?",
      options: ["Queue", "Stack", "Heap", "Graph"],
      correctAnswer: 1
    },
    {
      topic: "Graph Traversal",
      question: "Breadth-first search typically uses which structure internally?",
      options: ["Stack", "Queue", "Hash map", "Tree set"],
      correctAnswer: 1
    },
    {
      topic: "Sorting",
      question: "What is the average time complexity of merge sort?",
      options: ["O(n^2)", "O(log n)", "O(n log n)", "O(n)"],
      correctAnswer: 2
    },
    {
      topic: "Trees",
      question: "In a Binary Search Tree, values in the left subtree are:",
      options: [
        "Always greater than the root",
        "Always less than the root",
        "Randomly ordered",
        "Equal to the root only"
      ],
      correctAnswer: 1
    }
  ],
  "Data Science": [
    {
      topic: "Pandas",
      question: "Which pandas function is used to load a CSV file?",
      options: ["pd.read_json()", "pd.load_csv()", "pd.read_csv()", "pd.open_csv()"],
      correctAnswer: 2
    },
    {
      topic: "Statistics",
      question: "Which metric is most robust to extreme outliers?",
      options: ["Mean", "Median", "Variance", "Range"],
      correctAnswer: 1
    },
    {
      topic: "Visualization",
      question: "Which chart is best to show distribution of one numeric variable?",
      options: ["Histogram", "Pie chart", "Radar chart", "Treemap"],
      correctAnswer: 0
    },
    {
      topic: "Data Cleaning",
      question: "A common approach for handling missing numeric values is:",
      options: [
        "Delete all rows blindly",
        "Imputation using mean/median",
        "Convert all values to strings",
        "Duplicate the dataset"
      ],
      correctAnswer: 1
    },
    {
      topic: "Train/Test Split",
      question: "Why do we split data into training and testing sets?",
      options: [
        "To improve font rendering",
        "To evaluate model performance on unseen data",
        "To reduce storage only",
        "To remove labels"
      ],
      correctAnswer: 1
    }
  ],
  "Machine Learning": [
    {
      topic: "Learning Types",
      question: "Which task is an example of supervised learning?",
      options: [
        "Grouping customers by similarity without labels",
        "Predicting house prices from labeled data",
        "Reducing dimensions with PCA",
        "Finding market baskets with association rules"
      ],
      correctAnswer: 1
    },
    {
      topic: "Model Evaluation",
      question: "What is the main purpose of a test set?",
      options: [
        "Tune hyperparameters",
        "Estimate final generalization performance",
        "Normalize training features",
        "Increase training sample size"
      ],
      correctAnswer: 1
    },
    {
      topic: "Overfitting",
      question: "Which is a common way to reduce overfitting?",
      options: ["More model depth only", "Regularization", "Removing validation data", "Using fewer features always"],
      correctAnswer: 1
    },
    {
      topic: "Classification Metrics",
      question: "Precision is defined as:",
      options: [
        "TP / (TP + FN)",
        "TN / (TN + FP)",
        "TP / (TP + FP)",
        "(TP + TN) / Total"
      ],
      correctAnswer: 2
    },
    {
      topic: "Feature Engineering",
      question: "One-hot encoding is mainly used for:",
      options: [
        "Scaling numeric values",
        "Converting categorical variables into numeric vectors",
        "Reducing model depth",
        "Calculating p-values"
      ],
      correctAnswer: 1
    }
  ],
  "Artificial Intelligence": [
    {
      topic: "Search Algorithms",
      question: "A* search combines path cost with:",
      options: ["Random exploration", "Heuristic estimate to goal", "Only depth level", "Only node degree"],
      correctAnswer: 1
    },
    {
      topic: "NLP",
      question: "Tokenization in NLP means:",
      options: [
        "Encrypting text",
        "Breaking text into smaller units",
        "Removing all punctuation permanently",
        "Converting text to audio"
      ],
      correctAnswer: 1
    },
    {
      topic: "Knowledge Representation",
      question: "Which structure is commonly used to represent relationships between entities?",
      options: ["Graph", "Stack", "Queue", "Array only"],
      correctAnswer: 0
    },
    {
      topic: "Search Strategy",
      question: "With equal edge costs, which algorithm guarantees the shortest path in an unweighted graph?",
      options: ["Depth-first search", "Breadth-first search", "Greedy search only", "Random walk"],
      correctAnswer: 1
    },
    {
      topic: "AI Ethics",
      question: "A key concern in AI model deployment is:",
      options: [
        "Using only one CPU core",
        "Model bias and unfair outcomes",
        "Too many comments in code",
        "Small font size in dashboards"
      ],
      correctAnswer: 1
    }
  ],
  "Python Programming": [
    {
      topic: "Core Python",
      question: "Which keyword is used to define a function in Python?",
      options: ["function", "def", "func", "lambda"],
      correctAnswer: 1
    },
    {
      topic: "OOP",
      question: "What does __init__ represent in a Python class?",
      options: ["Class destructor", "Module import hook", "Constructor method", "Static analyzer"],
      correctAnswer: 2
    },
    {
      topic: "File Handling",
      question: "Why is `with open(...)` preferred for files?",
      options: [
        "It always writes faster",
        "It automatically closes the file safely",
        "It converts files to JSON",
        "It disables exceptions"
      ],
      correctAnswer: 1
    },
    {
      topic: "Python Data Types",
      question: "Which Python data type is mutable?",
      options: ["tuple", "str", "list", "int"],
      correctAnswer: 2
    },
    {
      topic: "Error Handling",
      question: "Which block is used to catch runtime exceptions in Python?",
      options: ["try/except", "catch/finally", "if/else", "switch/case"],
      correctAnswer: 0
    }
  ],
  "Java Programming": [
    {
      topic: "Java Basics",
      question: "Java source code is first compiled into:",
      options: ["Machine code", "Bytecode", "Assembly", "SQL"],
      correctAnswer: 1
    },
    {
      topic: "OOP",
      question: "Which Java keyword is used for class inheritance?",
      options: ["implements", "inherits", "extends", "super"],
      correctAnswer: 2
    },
    {
      topic: "Collections",
      question: "Which collection keeps elements in insertion order and allows duplicates?",
      options: ["HashSet", "ArrayList", "TreeSet", "HashMap"],
      correctAnswer: 1
    },
    {
      topic: "JVM",
      question: "Java bytecode is executed by:",
      options: ["Browser engine", "Java Virtual Machine", "Node.js runtime", "SQL interpreter"],
      correctAnswer: 1
    },
    {
      topic: "Exceptions",
      question: "Checked exceptions in Java are:",
      options: [
        "Ignored by compiler",
        "Required to be handled or declared",
        "Available only in interfaces",
        "The same as syntax errors"
      ],
      correctAnswer: 1
    }
  ],
  "Database Management Systems": [
    {
      topic: "Keys",
      question: "A primary key must be:",
      options: ["Nullable and duplicated", "Unique and not null", "Numeric only", "Foreign only"],
      correctAnswer: 1
    },
    {
      topic: "Normalization",
      question: "Normalization primarily helps to:",
      options: ["Increase data redundancy", "Reduce data redundancy", "Delete indexes", "Disable joins"],
      correctAnswer: 1
    },
    {
      topic: "Transactions",
      question: "In ACID properties, what does Atomicity mean?",
      options: [
        "Transaction parts are all-or-nothing",
        "Data is always encrypted",
        "Queries run in parallel",
        "Tables cannot be altered"
      ],
      correctAnswer: 0
    },
    {
      topic: "SQL Joins",
      question: "An INNER JOIN returns:",
      options: [
        "All rows from left table only",
        "Only rows with matching keys in both tables",
        "All rows from both tables regardless of match",
        "Only unmatched rows"
      ],
      correctAnswer: 1
    },
    {
      topic: "Indexing",
      question: "Adding an index usually:",
      options: [
        "Slows read queries and speeds writes",
        "Speeds read queries but can slow writes",
        "Deletes duplicate rows",
        "Replaces primary keys"
      ],
      correctAnswer: 1
    }
  ],
  "Cloud Computing": [
    {
      topic: "Cloud Services",
      question: "Which AWS service is mainly used for object storage?",
      options: ["EC2", "RDS", "S3", "Lambda"],
      correctAnswer: 2
    },
    {
      topic: "Scalability",
      question: "Auto Scaling helps by:",
      options: [
        "Reducing logs automatically",
        "Adjusting compute capacity based on demand",
        "Converting VMs to containers",
        "Blocking all outbound traffic"
      ],
      correctAnswer: 1
    },
    {
      topic: "Deployment",
      question: "What is a key benefit of cloud deployment?",
      options: ["No internet needed", "Elastic resource usage", "No security controls", "No operational costs"],
      correctAnswer: 1
    },
    {
      topic: "Service Models",
      question: "IaaS primarily provides:",
      options: [
        "Managed business dashboards",
        "Virtualized compute, storage, and networking",
        "Only source code repositories",
        "Email templates"
      ],
      correctAnswer: 1
    },
    {
      topic: "Availability",
      question: "Using multiple availability zones improves:",
      options: ["Single point of failure", "High availability", "Query syntax", "Password complexity"],
      correctAnswer: 1
    }
  ],
  DevOps: [
    {
      topic: "CI/CD",
      question: "Continuous Integration mainly means:",
      options: [
        "Deploying every minute to production without tests",
        "Frequently merging and validating code changes",
        "Only writing infrastructure scripts",
        "Running manual QA only"
      ],
      correctAnswer: 1
    },
    {
      topic: "Docker",
      question: "What is the difference between an image and a container?",
      options: [
        "Container is a running instance of an image",
        "Image is always larger than a container",
        "Container stores source code only",
        "Image can run without runtime"
      ],
      correctAnswer: 0
    },
    {
      topic: "Kubernetes",
      question: "In Kubernetes, a Deployment is used to:",
      options: [
        "Store secret keys only",
        "Manage desired replica state for Pods",
        "Replace container images manually per node",
        "Create cloud VPC networks"
      ],
      correctAnswer: 1
    },
    {
      topic: "Version Control",
      question: "Which command uploads local commits to a remote branch?",
      options: ["git pull", "git push", "git fetch", "git stash"],
      correctAnswer: 1
    },
    {
      topic: "Observability",
      question: "The three core observability pillars are:",
      options: [
        "Code, build, deploy",
        "Logs, metrics, traces",
        "CPU, RAM, disk only",
        "Alerts, tickets, emails"
      ],
      correctAnswer: 1
    }
  ],
  "Cyber Security": [
    {
      topic: "Threats",
      question: "Phishing attacks usually try to:",
      options: [
        "Optimize website SEO",
        "Trick users into revealing sensitive information",
        "Compress network packets",
        "Patch operating systems"
      ],
      correctAnswer: 1
    },
    {
      topic: "Application Security",
      question: "Which is a strong defense against SQL injection?",
      options: ["String concatenation", "Parameterized queries", "Open CORS for all origins", "Disabling logs"],
      correctAnswer: 1
    },
    {
      topic: "Identity Security",
      question: "Multi-factor authentication improves security by:",
      options: [
        "Using longer usernames",
        "Requiring two or more independent verification factors",
        "Disabling password reset",
        "Allowing shared accounts"
      ],
      correctAnswer: 1
    },
    {
      topic: "Web Security",
      question: "HTTPS protects data in transit by using:",
      options: ["Plain text headers", "TLS encryption", "Only base64 encoding", "Browser cache"],
      correctAnswer: 1
    },
    {
      topic: "Password Storage",
      question: "A secure password storage approach is:",
      options: [
        "Store plain text passwords",
        "Store encrypted reversible passwords only",
        "Store salted password hashes",
        "Store passwords in client-side cookies"
      ],
      correctAnswer: 2
    }
  ]
};

const normalize = value => String(value || "").trim().toLowerCase();
const MIN_QUESTIONS_PER_COURSE = 10;
const MAX_QUESTIONS_PER_COURSE = 12;

const parseTopics = description => String(description || "")
  .split(",")
  .map(topic => topic.trim())
  .filter(Boolean);

const pickDistractors = (allTopics, correctTopic, amount, seedOffset = 0) => {
  const pool = allTopics.filter(topic => normalize(topic) !== normalize(correctTopic));
  const selected = [];
  let cursor = seedOffset;

  while (selected.length < amount && pool.length > 0) {
    const item = pool[cursor % pool.length];
    if (!selected.includes(item)) {
      selected.push(item);
    }
    cursor += 3;
    if (cursor > pool.length * 6) break;
  }

  while (selected.length < amount) {
    selected.push(`Related concept ${selected.length + 1}`);
  }

  return selected;
};

const getTargetQuestionCount = courseTitle => {
  const text = String(courseTitle || "");
  let hash = 0;

  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 997;
  }

  const spread = MAX_QUESTIONS_PER_COURSE - MIN_QUESTIONS_PER_COURSE + 1;
  return MIN_QUESTIONS_PER_COURSE + (hash % spread);
};

const buildTopicGeneratedQuestions = (courseTitle, courseTopics, globalTopics, neededCount) => {
  const generated = [];
  if (courseTopics.length === 0 || neededCount <= 0) return generated;

  for (let i = 0; i < neededCount; i += 1) {
    const topic = courseTopics[i % courseTopics.length];
    const distractors = pickDistractors(globalTopics, topic, 3, i + courseTitle.length);
    const correctPosition = i % 4;
    const options = [...distractors];
    options.splice(correctPosition, 0, topic);

    generated.push({
      topic,
      question: `Topic Check ${i + 1}: In "${courseTitle}", which option matches the module "${topic}"?`,
      options,
      correctAnswer: correctPosition
    });
  }

  return generated;
};

const seedQuizzes = async () => {
  const courseTitles = Object.keys(QUIZ_BANK);
  const courses = await Course.find({ title: { $in: courseTitles } })
    .select("_id title description")
    .lean();

  const coursesByTitle = new Map(courses.map(course => [course.title, course]));
  const globalTopics = Array.from(
    new Set(
      courses.flatMap(course => parseTopics(course.description))
    )
  );
  let insertedCount = 0;

  for (const courseTitle of courseTitles) {
    const course = coursesByTitle.get(courseTitle);
    if (!course) continue;
    const courseTopics = parseTopics(course.description);
    const baseQuestions = QUIZ_BANK[courseTitle] || [];
    const targetCount = getTargetQuestionCount(courseTitle);
    const neededGenerated = Math.max(targetCount - baseQuestions.length, 0);
    const generatedQuestions = buildTopicGeneratedQuestions(
      courseTitle,
      courseTopics,
      globalTopics,
      neededGenerated
    );
    const fullQuestionSet = [...baseQuestions, ...generatedQuestions];

    const existing = await Quiz.find({ courseId: course._id })
      .select("question")
      .lean();
    const existingQuestions = new Set(existing.map(item => normalize(item.question)));

    const pending = fullQuestionSet
      .filter(item => !existingQuestions.has(normalize(item.question)))
      .map(item => ({
        courseId: course._id,
        topic: item.topic || "General",
        question: item.question,
        options: item.options,
        correctAnswer: item.correctAnswer
      }));

    if (pending.length > 0) {
      await Quiz.insertMany(pending);
      insertedCount += pending.length;
    }
  }

  console.log(`Topic-wise quizzes checked/added successfully (${insertedCount} inserted)`);
};

export default seedQuizzes;
