import axios from "axios";
import { useEffect, useState } from "react";

const APICalling = () => {
  const [user, setUser] = useState(null);
  useEffect(() => {
    async function calling() {
      const api = "http://localhost:3000/api/user";
      const user = await axios.get(api, {
        withCredentials: true,
      });
      setUser(user.data);
    }
    calling();
  }, []);
  return user;
};

export default APICalling;