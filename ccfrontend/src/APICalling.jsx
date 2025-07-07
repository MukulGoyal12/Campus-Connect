import axios from "axios";
import { useEffect, useState } from "react";

const APICalling = () => {
  const [user, setUser] = useState(null);
  
  const fetchUser = async ()=> {
    const api = "http://localhost:3000/api/user";
    const user = await axios.get(api, {
      withCredentials: true,
    });
    setUser(user.data);
  }

  useEffect(() => {
    
    fetchUser();
  }, []);

  return {user, fetchUser};
};

export default APICalling;