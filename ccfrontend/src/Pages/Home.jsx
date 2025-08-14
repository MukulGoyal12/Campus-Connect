import axios from "axios";
import { useEffect, useState } from "react";
import HomeRequestCard from "../components/HomeRequestCard";

const Home = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequest = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API}/api/fetchRequest`,
        {
          withCredentials: true,
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
            "Content-Type": "application/json",
          },
        }
      );
      setRequests(res.data.requests.reverse());
    } catch (err) {
      console.error("Fetch request error:", err);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, []);

  return (
    <div className="pb-20 md:pb-0"> {/* ✅ yahan bottom space diya */}
      <HomeRequestCard requests={requests} />
    </div>
  );
};

export default Home;
