import React from "react";
// Style imports
import "@sass/6-components/ButtonCloseNarrative.sass";

const ButtonCloseNarrative = ({ showNarrative, setShowNarrative }) => {
  return (
    <button
      className={[
        "btn-close-details",
        "emoji",
        showNarrative ? "visible" : "hidden"
      ].join(" ")}
      onClick={() => setShowNarrative(false)}
    >
      {window.matchMedia("(max-width: 768px)").matches ? (
        <span>☝️</span>
      ) : (
        <span>👈</span>
      )}
    </button>
  );
};

export default ButtonCloseNarrative;
