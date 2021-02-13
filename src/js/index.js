import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
// Local imports
import { get } from "./api.js";
import Narrative from "./components/Narrative.js";
import Dot from "./artwork/Dot.js";
import ButtonCloseNarrative from "./components/ButtonCloseNarrative.js";
import ButtonOpenNarrative from "./components/ButtonOpenNarrative.js";
import ButtonToExhibition from "./components/ButtonToExhibition.js";
// Style imports
import "../sass/index.sass";

const Artwork = () => {
  const [showNarrative, setShowNarrative] = useState(false);
  const [content, setContent] = useState({});

  useEffect(() => {
    console.group("Version");
    console.log(process.env.VERSION);
    console.groupEnd();
    get(`/pages/logo`).then((d) => {
      setContent(d.content);
    });
  }, []);

  return (
    <>
      <div className="canvas-wrapper">
        <Dot />
        <ButtonOpenNarrative
          showNarrative={showNarrative}
          setShowNarrative={setShowNarrative}
        />
      </div>
      <ButtonToExhibition />
      <ButtonCloseNarrative
        showNarrative={showNarrative}
        setShowNarrative={setShowNarrative}
      />
      <Narrative show={showNarrative} content={content} />
    </>
  );
};

const mount = document.querySelector("#mount");
ReactDOM.render(<Artwork />, mount);
