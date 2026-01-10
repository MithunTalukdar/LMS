export default function Topbar({ name, logout }) {
  return (
    <div className="flex justify-between items-center bg-white shadow px-6 py-3">
      <h2 className="font-semibold text-lg">Welcome, {name}</h2>
      <button
        onClick={logout}
        className="bg-red-500 text-white px-4 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );
}
