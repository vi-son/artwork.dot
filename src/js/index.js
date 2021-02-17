import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { Narrative } from "@vi.son/components";
import { ButtonCloseNarrative } from "@vi.son/components";
import { ButtonOpenNarrative } from "@vi.son/components";
import { ButtonToExhibition } from "@vi.son/components";
// Local imports
import { get } from "./api.js";
import Dot from "./artwork/Dot.js";
// Style imports
import "../sass/index.sass";

const Artwork = () => {
  const [showNarrative, setShowNarrative] = useState(false);
  const [content, setContent] = useState({});

  useEffect(() => {
    console.group("Version");
    console.log(process.env.VERSION);
    console.groupEnd();
    get(`/pages/dot`).then((d) => {
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
      <Narrative
        show={showNarrative}
        content={content}
        version={process.env.VERSION}
      />
    </>
  );
};

const mount = document.querySelector("#mount");
ReactDOM.render(<Artwork />, mount);
