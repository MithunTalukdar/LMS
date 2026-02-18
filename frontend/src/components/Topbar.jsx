export default function Topbar({ name, logout }) {
  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-3">
      <h2 className="font-semibold text-lg">Welcome, {name}</h2>
      <button
        onClick={logout}
        className="rounded-lg border border-red-700 bg-red-600 px-4 py-1.5 font-semibold text-white shadow-sm transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
      >
        Logout
      </button>
    </div>
  );
}
