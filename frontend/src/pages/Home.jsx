import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-160px)] bg-gray-50">
      <section className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="inline-block text-sm font-semibold uppercase tracking-wide text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Learning Management System
            </p>
            <h1 className="mt-5 text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              Learn smarter and track every step.
            </h1>
            <p className="mt-5 text-gray-600 text-base md:text-lg">
              Manage courses, complete tasks, and monitor progress from one
              clean dashboard.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-white text-gray-700 border border-gray-300 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Login
              </Link>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-900">
              What you can do
            </h2>
            <ul className="mt-5 space-y-3 text-gray-600">
              <li>Browse available courses</li>
              <li>Take quizzes and submit tasks</li>
              <li>Track learning progress</li>
              <li>Access certificates after completion</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
