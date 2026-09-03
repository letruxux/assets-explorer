import { createElement } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Description({ description }: { description: string }): React.JSX.Element {
  return (
    <div className="prose w-full block max-w-full my-4 text-base-content/70 border border-base-content/5 bg-base-100 p-2 px-4 rounded-box prose-p:my-1 prose-img:my-2 prose-ul:mt-2 prose-li:my-1 prose-ul:mb-4">
      <details className="w-full">
        <summary className="cursor-pointer">Show description</summary>
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            a(props) {
              return createElement("a", { ...props, target: "_blank" });
            },
            img(props) {
              return createElement("img", {
                ...props,
                className: "w-full max-w-xl rounded-box"
              });
            }
          }}
        >
          {description}
        </Markdown>
      </details>
    </div>
  );
}
