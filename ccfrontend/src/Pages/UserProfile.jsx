import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ProfilePage from "./ProfilePage";

export default function UserProfile() {
  const [user, setUser] = useState(null);
  const { id } = useParams();

  const fetchUser = async () => {
    const res = await axios.get(`http://localhost:3000/api/user/${id}`, { withCredentials: true });
    setUser(res.data.user);
  };

  useEffect(() => { fetchUser(); }, [id]);

  return user ? (
    <ProfilePage
      user={{ user }}
      fetchUser={fetchUser}
      showAddRequest={false}
      showDelete={false}
      showChangePhoto={false}
    />
  ) : (
    <p className="text-center mt-10 text-gray-500">Loading user profile...</p>
  );
}
