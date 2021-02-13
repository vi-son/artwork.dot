import React from "react";

function kirbytext(text, page) {
  if (!text) return "";

  let html = text;

  const pattern = /\((\w+)\:[^\)]*\)/;

  function parseKirbytag(kirbytag) {
    const tag = kirbytag.match(/^\((\w+)\:/)[1];
    const stripped = kirbytag.replace(/^\(/, "").replace(/\)$/, "");
    const values = stripped
      .split(/\w+\: /)
      .slice(1)
      .map(v => v.trim());
    const keys = stripped.match(/(\w+)\: /g).map(m => m.replace(/\: $/, ""));

    const attrs = keys.reduce((acc, key, i) => {
      acc[key] = values[i];
      return acc;
    }, {});

    if (tag === "link") {
      attrs.link = `${attrs.link}`;
    }

    return {
      tag,
      attrs
    };
  }

  function nextKirbytag() {
    const matches = html.match(pattern);

    if (matches && matches.length) {
      const match = matches[0];

      let replacement = "";
      const { tag, attrs } = parseKirbytag(match);

      if (tag === "link") {
        replacement = `<a href="${attrs.link}">${attrs.text}</a>`;
      }

      if (tag === "image") {
        replacement = `<figure${
          attrs.class ? ` class="${attrs.class}"` : ""
        }><img src="${attrs.image}" />${
          attrs.caption ? `<figcaption>${attrs.caption}</figcaption>` : ""
        }</figure>`;
      }

      html = html.replace(pattern, replacement);
      nextKirbytag();
    }

    return html;
  }

  nextKirbytag();

  return html;
}

function bold(text) {
  const findBold = /(\*+\w+ \w+\*+)/;
  return text.split(findBold).map((substr, i) => {
    if (substr.includes("**")) {
      return <b key={i}>{substr.replaceAll("**", "")}</b>;
    } else {
      return substr;
    }
  });
}

function italic(text) {
  const findItalic = /( \*\w+ \w+\* )/;
  return text.split(findItalic).map((substr, i) => {
    if (substr[1] === "*") {
      return <i key={i}>{substr.replaceAll("*", "")}</i>;
    } else {
      return bold(substr);
    }
  });
}

function kt(text) {
  const res = kirbytext(text);
  return <div dangerouslySetInnerHTML={{ __html: res }} />;
}

export { kt };
