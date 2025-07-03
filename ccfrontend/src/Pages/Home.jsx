import axios from "axios";
import { useEffect, useState } from "react";
import HomeRequestCard from "../components/HomeRequestCard";

const Home = () => {
  const [requests, setRequests] = useState([]);

  const fetchRequest = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/fetchRequest", {
        withCredentials: true,
      });
      setRequests(res.data.requests.reverse());
      // console.log(res.data.requests[0].requester.profilepic);
    } catch (err) {
      console.error("Fetch request error:", err);
    }
  };

  useEffect(() => {
    fetchRequest();
  }, []);

  return(
    <>
      <HomeRequestCard requests={requests} />
    </>
  );

};

export default Home;
