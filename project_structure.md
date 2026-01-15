# 📁 LMS - Project Structure

*Generated on: 1/10/2026, 10:07:23 PM*

## 📋 Quick Overview

| Metric | Value |
|--------|-------|
| 📄 Total Files | 71 |
| 📁 Total Folders | 15 |
| 🌳 Max Depth | 3 levels |
| 🛠️ Tech Stack | React, CSS, Tailwind CSS, Node.js |

## ⭐ Important Files

- 🟡 🚫 **.gitignore** - Git ignore rules
- 🟡 🔒 **package-lock.json** - Dependency lock
- 🔴 📦 **package.json** - Package configuration
- 🟡 🚫 **.gitignore** - Git ignore rules
- 🟡 🔒 **package-lock.json** - Dependency lock
- 🔴 📦 **package.json** - Package configuration
- 🔴 📖 **README.md** - Project documentation
- 🟡 🎨 **tailwind.config.js** - Tailwind config

## 📊 File Statistics

### By File Type

- 📜 **.js** (JavaScript files): 35 files (49.3%)
- ⚛️ **.jsx** (React JSX files): 24 files (33.8%)
- ⚙️ **.json** (JSON files): 4 files (5.6%)
- 🚫 **.gitignore** (Git ignore): 2 files (2.8%)
- 🎨 **.svg** (SVG images): 2 files (2.8%)
- 🎨 **.css** (Stylesheets): 2 files (2.8%)
- 🌐 **.html** (HTML files): 1 files (1.4%)
- 📖 **.md** (Markdown files): 1 files (1.4%)

### By Category

- **JavaScript**: 35 files (49.3%)
- **React**: 24 files (33.8%)
- **Config**: 4 files (5.6%)
- **DevOps**: 2 files (2.8%)
- **Assets**: 2 files (2.8%)
- **Styles**: 2 files (2.8%)
- **Web**: 1 files (1.4%)
- **Docs**: 1 files (1.4%)

### 📁 Largest Directories

- **root**: 71 files
- **frontend**: 38 files
- **backend**: 33 files
- **frontend\src**: 28 files
- **frontend\src\pages**: 15 files

## 🌳 Directory Structure

```
LMS/
├── 📂 backend/
│   ├── 🟡 🚫 **.gitignore**
│   ├── ⚙️ config/
│   │   └── 📜 db.js
│   ├── 📂 controllers/
│   │   ├── 📜 admin.controller.js
│   │   ├── 📜 auth.controller.js
│   │   ├── 📜 certificate.controller.js
│   │   ├── 📜 course.controller.js
│   │   ├── 📜 progress.controller.js
│   │   ├── 📜 quiz.controller.js
│   │   ├── 📜 task.controller.js
│   │   └── 📜 user.controller.js
│   ├── 📂 middleware/
│   │   └── 📜 auth.middleware.js
│   ├── 📂 models/
│   │   ├── 📜 Certificate.js
│   │   ├── 📜 Course.js
│   │   ├── 📜 Progress.js
│   │   ├── 📜 Quiz.js
│   │   ├── 📜 QuizAttempt.js
│   │   ├── 📜 QuizResult.js
│   │   ├── 📜 Task.js
│   │   ├── 📜 TaskSubmission.js
│   │   └── 📜 User.js
│   ├── 🟡 🔒 **package-lock.json**
│   ├── 🔴 📦 **package.json**
│   ├── 📂 routes/
│   │   ├── 📜 admin.routes.js
│   │   ├── 📜 auth.routes.js
│   │   ├── 📜 certificate.routes.js
│   │   ├── 📜 course.routes.js
│   │   ├── 📜 progress.routes.js
│   │   ├── 📜 quiz.routes.js
│   │   ├── 📜 task.routes.js
│   │   ├── 📜 teacher.routes.js
│   │   └── 📜 user.routes.js
│   ├── 📜 server.js
│   └── 🔧 utils/
│   │   └── 📜 seedCourses.js
└── 📂 frontend/
│   ├── 🟡 🚫 **.gitignore**
│   ├── 📜 eslint.config.js
│   ├── 🌐 index.html
│   ├── 🟡 🔒 **package-lock.json**
│   ├── 🔴 📦 **package.json**
│   ├── 📜 postcss.config.js
│   ├── 🌐 public/
│   │   └── 🎨 vite.svg
│   ├── 🔴 📖 **README.md**
│   ├── 📁 src/
│   │   ├── 🎨 App.css
│   │   ├── ⚛️ App.jsx
│   │   ├── 📦 assets/
│   │   │   └── 🎨 react.svg
│   │   ├── 🧩 components/
│   │   │   ├── ⚛️ PrivateRoute.jsx
│   │   │   ├── ⚛️ ProgressBar.jsx
│   │   │   ├── ⚛️ ProtectedRoute.jsx
│   │   │   ├── ⚛️ RoleRoute.jsx
│   │   │   ├── ⚛️ Sidebar.jsx
│   │   │   └── ⚛️ Topbar.jsx
│   │   ├── 📂 context/
│   │   │   └── ⚛️ AuthContext.jsx
│   │   ├── 🎨 index.css
│   │   ├── ⚛️ main.jsx
│   │   ├── 📄 pages/
│   │   │   ├── ⚛️ AdminPanel.jsx
│   │   │   ├── ⚛️ Certificate.jsx
│   │   │   ├── ⚛️ Courses.jsx
│   │   │   ├── ⚛️ CreateCourse.jsx
│   │   │   ├── ⚛️ Dashboard.jsx
│   │   │   ├── ⚛️ Login.jsx
│   │   │   ├── ⚛️ Profile.jsx
│   │   │   ├── ⚛️ Progress.jsx
│   │   │   ├── ⚛️ Quiz.jsx
│   │   │   ├── ⚛️ Register.jsx
│   │   │   ├── ⚛️ StudentDashboard.jsx
│   │   │   ├── ⚛️ StudentTasks.jsx
│   │   │   ├── ⚛️ TeacherAnalytics.jsx
│   │   │   ├── ⚛️ TeacherDashboard.jsx
│   │   │   └── ⚛️ TeacherTasks.jsx
│   │   └── 🔧 utils/
│   │   │   └── 📜 axios.js
│   ├── 🟡 🎨 **tailwind.config.js**
│   └── 📜 vite.config.js
```

## 📖 Legend

### File Types
- 🚫 DevOps: Git ignore
- 📜 JavaScript: JavaScript files
- ⚙️ Config: JSON files
- 🌐 Web: HTML files
- 🎨 Assets: SVG images
- 📖 Docs: Markdown files
- 🎨 Styles: Stylesheets
- ⚛️ React: React JSX files

### Importance Levels
- 🔴 Critical: Essential project files
- 🟡 High: Important configuration files
- 🔵 Medium: Helpful but not essential files
