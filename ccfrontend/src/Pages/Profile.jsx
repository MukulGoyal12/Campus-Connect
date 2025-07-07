import { useEffect, useState } from "react";
import axios from "axios";
import AddRequest from "../components/AddRequest";
import ProfilePage from "./ProfilePage";
import APICalling from "../APICalling";

export default function Profile() {
  const {user, fetchUser} = APICalling();
  const [active, setActive] = useState(false);

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
