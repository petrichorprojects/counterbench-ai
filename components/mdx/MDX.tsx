import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export function MDX({ source }: { source: string }) {
  return (
    <div style={{ maxWidth: 860 }}>
      <MDXRemote
        source={source}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm]
          }
        }}
      />
    </div>
  );
}

