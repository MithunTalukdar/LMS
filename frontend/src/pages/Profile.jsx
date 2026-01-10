import api from "../utils/axios";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
  const { user } = useContext(AuthContext);
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");

  const changePassword = async () => {
    await api.post("/users/change-password", {
      userId: user._id,
      oldPassword: oldPass,
      newPassword: newPass
    });
    alert("Password updated");
  };

  return (
    <div className="bg-white p-6 rounded shadow w-96">
      <h2 className="font-bold text-xl mb-4">Profile</h2>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>

      <input className="border p-2 mt-3 w-full" placeholder="Old Password" type="password" onChange={e=>setOldPass(e.target.value)} />
      <input className="border p-2 mt-2 w-full" placeholder="New Password" type="password" onChange={e=>setNewPass(e.target.value)} />

      <button onClick={changePassword} className="bg-blue-600 text-white w-full mt-3 p-2 rounded">
        Change Password
      </button>
    </div>
  );
}
