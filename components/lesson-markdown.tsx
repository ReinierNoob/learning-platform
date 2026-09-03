import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function LessonMarkdown({ text }: { text: string }) {
  return <div className="markdownBody"><ReactMarkdown remarkPlugins={[remarkGfm]} components={{
    table: ({ children }) => <div className="lessonTable" role="region" aria-label="Tabel in de les" tabIndex={0}><table>{children}</table></div>,
  }}>{text}</ReactMarkdown></div>;
}
