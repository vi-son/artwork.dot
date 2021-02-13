import React from "react";
// Style imports
import "@sass/6-components/ButtonOpenNarrative.sass";

const ButtonOpenNarrative = ({ setShowNarrative, showNarrative }) => {
  return (
    <button
      className="emoji btn-open-narrative"
      onClick={() => setShowNarrative(!showNarrative)}
    >
      <span className="emoji">📖</span>
    </button>
  );
};

export default ButtonOpenNarrative;
