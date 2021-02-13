import React from "react";

const Referencesblock = ({ content }) => {
  return (
    <section className="block references">
      <ul>
        <h3 className="heading">Quellen</h3>
        {content.referencesruct.map((ref, i) => {
          return (
            <li key={i} className="reference">
              <span className="number">{ref.footnote}</span>
              <small className="text">{ref.labeltext}</small>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default Referencesblock;
