import type Site from "lume/core/site.ts";
import { is } from "jsr:@core/unknownutil";

export default function () {
  return (site: Site) => {
    console.log("footer plugin");

    site.process([".html"], (pages) => {
      for (const page of pages) {
        const { document } = page;
        if (!document) {
          continue;
        }

        // Remove all styles at footnote label.
        const footerLabel = document.getElementById("footnote-label");
        if (!is.Null(footerLabel)) {
          footerLabel.removeAttribute("class");
          footerLabel.innerText = "脚注";
        }

        // Change footnote backref text
        const footnotesBackref = document.querySelectorAll(
          "[data-footnote-backref]",
        );
        footnotesBackref.forEach((a) => {
          console.log("==> Change textContent");
          a.textContent = "↩︎";
        });

        // Add style to footnote list.
        const footnotesElements = document.querySelectorAll(".footnotes ol");
        footnotesElements.forEach((ol) => {
          const li = ol.querySelectorAll("li");
          li.forEach((node) => {
            node.setAttribute(
              "style",
              "margin-top: 0.25rem; margin-bottom: 0.25rem;",
            );
          });

          const p = ol.querySelectorAll("p");
          p.forEach((node) => {
            node.setAttribute(
              "style",
              "margin-top: 0.25rem; margin-bottom: 0.25rem;",
            );
          });
        });
      }
    });
  };
}
