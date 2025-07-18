import axios from "axios";
import { useEffect, useState } from "react";

const APICalling = () => {
  const [user, setUser] = useState(null);

  const fetchUser = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API}/api/user`, {
        withCredentials: true,
        headers: {
          Authorization: "Bearer " + document.cookie.substring(6),
          "Content-Type": "application/json",
        },
      });
      setUser(res.data);
    } catch (err) {
      console.error("Fetch user error:", err);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return { user, fetchUser };
};

export default APICalling;
