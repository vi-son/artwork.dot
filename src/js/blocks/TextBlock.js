import React, { useState } from "react";
// Local imports
import { kt } from "../utils/kirbytext.js";
// Style imports
import "@sass/6-components/Blocks.sass";

const TextBlock = ({ content }) => {
  const [foldOut, setFoldout] = useState(false);

  return (
    <section className="block text">
      {content.headline !== undefined ? (
        <h2 className="heading" onClick={() => setFoldout(!foldOut)}>
          {content.headline}
        </h2>
      ) : (
        <></>
      )}
      <div className={["foldout", foldOut ? "open" : "close"].join(" ")}>
        {content.preheadline !== undefined ? (
          <h4 className="preheading">{content.preheadline}</h4>
        ) : (
          <></>
        )}
        {content.text !== undefined ? (
          <article className="text">{kt(content.text)}</article>
        ) : (
          <></>
        )}
      </div>
    </section>
  );
};

export default TextBlock;
