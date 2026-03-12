import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { slugify } from "@/lib/slug";

function textFromNode(node: ReactNode): string {
  if (node == null) return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textFromNode).join("");
  if (typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return textFromNode(props?.children);
  }
  return "";
}

export function MDX({ source }: { source: string }) {
  return (
    <div style={{ maxWidth: 860 }}>
      <MDXRemote
        source={source}
        components={{
          h2: (props: ComponentPropsWithoutRef<"h2">) => {
            const id = props.id ?? slugify(textFromNode(props.children));
            // eslint-disable-next-line react/jsx-props-no-spreading
            return <h2 {...props} id={id} />;
          },
          h3: (props: ComponentPropsWithoutRef<"h3">) => {
            const id = props.id ?? slugify(textFromNode(props.children));
            // eslint-disable-next-line react/jsx-props-no-spreading
            return <h3 {...props} id={id} />;
          }
        }}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm]
          }
        }}
      />
    </div>
  );
}
