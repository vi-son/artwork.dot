import React from "react";
// Style imports
import "@sass/6-components/ButtonToExhibition.sass";

const ButtonToExhibition = () => {
  return (
    <a
      className="btn-to-exhibition"
      href="https://exhibition.mixing-senses.art"
    >
      <span className="emoji">🏛️</span>
      <span className="description">Zum Foyer</span>
    </a>
  );
};

export default ButtonToExhibition;
