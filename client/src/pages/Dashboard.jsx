import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="p-10 ">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <p className="mt-4">Welcome {user.name}</p>

      <button
        onClick={logout}
        className="mt-6 bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
