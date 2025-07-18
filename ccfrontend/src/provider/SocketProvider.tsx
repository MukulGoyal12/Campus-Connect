import { useContext,createContext } from "react";
import {io, Socket} from "socket.io-client"
const SocketContext = createContext(null);
export default function SocketProvider({ children }) {
  
    const socket = io(`${import.meta.env.VITE_API}`);    
    
    if (!socket) {
        throw new Error("Socket connection failed");
    }
    return (
        <SocketContext.Provider value={socket}>
        {children}
        </SocketContext.Provider>
    );
    }
export const useSocket = () => {
  const socket = useContext(SocketContext);
  if (!socket) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return socket;
};