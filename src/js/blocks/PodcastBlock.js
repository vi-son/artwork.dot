import React from "react";

const Podcastblock = ({ content }) => {
  return (
    <section className="block podcast">
      <iframe className="player" src={content.src}></iframe>
    </section>
  );
};

export default Podcastblock;
