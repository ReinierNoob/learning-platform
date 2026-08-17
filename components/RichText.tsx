import React from "react";

function inline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.endsWith("*")) return <em key={index}>{part.slice(1, -1)}</em>;
    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

export default function RichText({ text }: { text: string }) {
  const blocks = text.split(/\n\n+/).map((item) => item.trim()).filter(Boolean);
  return (
    <div className="content">
      {blocks.map((block, index) => {
        if (block.startsWith("> ")) return <blockquote key={index}>{inline(block.slice(2))}</blockquote>;
        const lines = block.split("\n");
        if (lines.every((line) => /^\d+\.\s/.test(line.trim()))) {
          return <ol key={index}>{lines.map((line, lineIndex) => <li key={lineIndex}>{inline(line.replace(/^\d+\.\s*/, ""))}</li>)}</ol>;
        }
        return (
          <p key={index}>
            {lines.map((line, lineIndex) => (
              <React.Fragment key={lineIndex}>
                {lineIndex ? <br /> : null}
                {inline(line.replace(/^\s*[a-d]\.\s/i, (match) => `${match.trim()} `))}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
