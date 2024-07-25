import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronRight,
  faChevronLeft,
  faFolder,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";

function Sidebar({ setIsInvitationsModalOpen }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`sidebar bg-gray-800 text-white ${
        isExpanded ? "w-64" : "w-16"
      } transition-all duration-200`}
    >
      <div className="flex justify-between items-center p-4">
        <button onClick={handleToggle}>
          <FontAwesomeIcon icon={isExpanded ? faChevronLeft : faChevronRight} />
        </button>
        {isExpanded && <h1 className="text-xl font-bold">Project Manager</h1>}
      </div>
      <div className="mt-4">
        <button
          className="flex items-center w-full p-4 hover:bg-gray-700"
          onClick={() => navigate("/dashboard")}
        >
          <FontAwesomeIcon icon={faFolder} className="mr-2" />
          {isExpanded && <span>Dashboard</span>}
        </button>
        <button
          className="flex items-center w-full p-4 hover:bg-gray-700 mt-4"
          onClick={() => setIsInvitationsModalOpen(true)}
        >
          <FontAwesomeIcon icon={faEnvelope} className="mr-2" />
          {isExpanded && <span>Invitations</span>}
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
