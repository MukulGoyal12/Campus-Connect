import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaGraduationCap } from "react-icons/fa";

const Logo = () => {
  const [style, setStyle] = useState({});

  const handleMove = (e) => {
    const { offsetX, offsetY, target } = e.nativeEvent;
    const { offsetWidth, offsetHeight } = target;

    const x = (offsetX / offsetWidth) - 0.5;
    const y = (offsetY / offsetHeight) - 0.5;

    const rotateX = y * -20;  
    const rotateY = x * 20;  

    setStyle({
      transform: `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      transition: "transform 0.1s ease",
    });
  };

  const resetMove = () => {
    setStyle({
      transform: "rotateX(0deg) rotateY(0deg)",
      transition: "transform 0.3s ease",
    });
  };

  return (
    <Link
      to="/home"
      className="flex items-center gap-2 cursor-pointer select-none"
      onMouseMove={handleMove}
      onMouseLeave={resetMove}
      style={style}
    >
      <FaGraduationCap className="text-blue-500 text-3xl" />
      <span className="text-lg font-semibold text-gray-800">
        Campus<span className="text-blue-600">Connect</span>
      </span>
    </Link>
  );
};

export default Logo;
