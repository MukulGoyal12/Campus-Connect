import { useEffect, useState } from "react";
import axios from "axios";
import AddRequest from "../components/AddRequest";
import ProfilePage from "./ProfilePage";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [active, setActive] = useState(false);

  const fetchUser = async () => {
    const res = await axios.get("http://localhost:3000/api/user", { withCredentials: true });
    setUser(res.data);
  };

  useEffect(() => { fetchUser(); }, []);

  return (
    <>
      {user && (
        <ProfilePage
          user={user}
          fetchUser={fetchUser}
          showAddRequest={true}
          showDelete={true}
          showChangePhoto={true}
          onAddRequestClick={() => setActive(true)}
        />
      )}

      {active && (
        <AddRequest
          onClose={() => setActive(false)}
          onRequestAdded={() => {
            fetchUser();
            setActive(false);
          }}
        />
      )}
    </>
  );
}
