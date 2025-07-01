import { FaGraduationCap } from "react-icons/fa";
import { Link } from "react-router-dom";

const HeaderSimple = () => {
  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center">
        <Link
          to="/"
          className="flex items-center gap-2 text-3xl font-extrabold text-gray-800 hover:text-blue-600 transition-all duration-300"
        >
          <FaGraduationCap className="text-blue-600 text-4xl" />
          Campus<span className="text-blue-500">Connect</span>
        </Link>
      </div>
    </header>
  );
};

export default HeaderSimple;
