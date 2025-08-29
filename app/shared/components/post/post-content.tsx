import { useState, type FC } from "react";
import { Link } from "react-router";
import type { PostType } from "~/shared/types/post-types";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import { MediaScrollArea } from "./media-scroll-area";
import { usePost } from "~/features/feed/hooks/use-post";
import "highlight.js/styles/github-dark.css";

const MAX_CONTENT_LENGTH = 300;

const isValidString = (value: unknown): value is string => {
    return typeof value === "string" && value.trim().length > 0;
};

const markdownComponents: Components = {
    // Headings
    h1: ({ children }) => (
        <h1 className="text-3xl font-bold mt-8 mb-4 text-foreground">{children}</h1>
    ),
    h2: ({ children }) => (
        <h2 className="text-2xl font-semibold mt-7 mb-3 text-foreground">{children}</h2>
    ),
    h3: ({ children }) => (
        <h3 className="text-xl font-semibold mt-6 mb-2 text-foreground">{children}</h3>
    ),
    h4: ({ children }) => (
        <h4 className="text-lg font-semibold mt-5 mb-2 text-foreground">{children}</h4>
    ),
    h5: ({ children }) => (
        <h5 className="text-base font-semibold mt-4 mb-2 text-foreground">{children}</h5>
    ),
    h6: ({ children }) => (
        <h6 className="text-sm font-semibold mt-3 mb-1 text-foreground">{children}</h6>
    ),

    // Paragraph
    p: ({ children }) => (
        <p className="mb-3 leading-relaxed text-muted-foreground">{children}</p>
    ),

    // Links
    a: (props) => {
        const { href = "#", children, ...rest } = props;
        const safeHref = href.startsWith("http") || href.startsWith("/") ? href : "#";

        return (
            <Link
                to={safeHref}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="text-blue-600 underline break-all hover:text-blue-400"
                {...rest}
            >
                {children}
            </Link>
        );
    },

    // Images
    img: (props) => (
        <img
            {...props}
            loading="lazy"
            className="max-w-full rounded-md my-4"
            alt={props.alt || ""}
        />
    ),

    // Lists
    ul: ({ children }) => (
        <ul className="list-disc list-inside mb-4">{children}</ul>
    ),
    ol: ({ children }) => (
        <ol className="list-decimal list-inside mb-4">{children}</ol>
    ),
    li: ({ children }) => <li className="mb-1">{children}</li>,

    // Blockquotes
    blockquote: ({ children }) => (
        <blockquote className="border-l-4 border-blue-500 pl-4 italic text-muted-foreground my-4">
            {children}
        </blockquote>
    ),

    // Inline code
    code: ({ className, children, ...props }) => (
        <code
            className={`bg-muted px-1 py-0.5 rounded font-mono text-sm ${className ?? ""}`}
            {...props}
        >
            {children}
        </code>
    ),

    // Code block
    pre: ({ children }) => (
        <pre className="bg-[#0d1117] text-white p-4 rounded-lg overflow-auto text-sm my-4 font-mono">
            {children}
        </pre>
    ),

    // Horizontal rule
    hr: () => <hr className="my-6 border-t border-muted" />,

    // Tables
    table: ({ children }) => (
        <table className="table-auto border-collapse border border-muted w-full mb-4">
            {children}
        </table>
    ),
    thead: ({ children }) => (
        <thead className="bg-muted text-foreground">{children}</thead>
    ),
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
        <tr className="border-b border-muted last:border-0">{children}</tr>
    ),
    th: ({ children }) => (
        <th className="border border-muted px-3 py-1 text-left font-semibold">{children}</th>
    ),
    td: ({ children }) => (
        <td className="border border-muted px-3 py-1">{children}</td>
    ),

    // Details and summary
    details: ({ children }) => (
        <details className="mb-4 bg-muted p-3 rounded">{children}</details>
    ),
    summary: ({ children }) => (
        <summary className="cursor-pointer font-semibold">{children}</summary>
    ),

    // Emphasis and strong
    em: ({ children }) => <em className="italic">{children}</em>,
    strong: ({ children }) => <strong className="font-semibold">{children}</strong>,

    // Line breaks
    br: () => <br />,

    // Delete (strikethrough)
    del: ({ children }) => (
        <del className="line-through text-muted-foreground">{children}</del>
    ),

    // Div wrapper
    div: ({ children }) => <div className="my-2">{children}</div>,

    // Mark (highlight)
    mark: ({ children }) => (
        <mark className="bg-yellow-300 text-black">{children}</mark>
    ),

    // Superscript and Subscript
    sup: ({ children }) => <sup className="align-super text-xs">{children}</sup>,
    sub: ({ children }) => <sub className="align-sub text-xs">{children}</sub>,

    // Keyboard input
    kbd: ({ children }) => (
        <kbd className="bg-gray-700 text-white px-1 rounded font-mono text-xs">{children}</kbd>
    ),

    // Address
    address: ({ children }) => (
        <address className="not-italic mb-3 text-muted-foreground">{children}</address>
    ),

    // Figure and figcaption
    figure: ({ children }) => <figure className="my-4">{children}</figure>,
    figcaption: ({ children }) => (
        <figcaption className="text-sm text-muted-foreground text-center mt-1">
            {children}
        </figcaption>
    ),

    // Time
    time: ({ children }) => <time className="text-muted-foreground">{children}</time>,

    // Small text
    small: ({ children }) => <small className="text-xs text-muted-foreground">{children}</small>,
};

const PostContent: FC<{ post?: PostType }> = ({ post: _post }) => {
    const { post } = _post ? { post: _post } : usePost();
    const [showFullContent, setShowFullContent] = useState(false);

    const title: string = isValidString(post?.title) ? post?.title : "";
    const content: string = isValidString(post?.content) ? post?.content : "";

    const contentIsLong = content.length > MAX_CONTENT_LENGTH;
    const displayedContent =
        showFullContent || !contentIsLong
            ? content
            : content.slice(0, MAX_CONTENT_LENGTH) + "...";

    const markdownPlugins = {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSanitize, rehypeHighlight],
    };

    return (
        <div
        // className="space-y-4 p-4"
        >
            {/* Title */}
            {title && (
                <div className="space-y-2 font-semibold text-lg text-foreground leading-tight break-words">
                    <Markdown {...markdownPlugins} components={markdownComponents}>
                        {title}
                    </Markdown>
                </div>
            )}

            {/* Content */}
            {content && (
                <div className="space-y-2 text-sm text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none break-words">
                    <Markdown {...markdownPlugins} components={markdownComponents}>
                        {displayedContent}
                    </Markdown>

                    {contentIsLong && (
                        <button
                            onClick={() => setShowFullContent((prev) => !prev)}
                            className="mt-2 text-sm text-blue-500 hover:underline"
                        >
                            {showFullContent ? "Show less" : "Show more"}
                        </button>
                    )}
                </div>
            )}


            {/* Media */}
            {Array.isArray(post?.media) && post?.media.length > 0 && (
                <div className="space-y-2 pt-2">
                    <MediaScrollArea media={post?.media} />
                </div>
            )}
        </div>
    );
};

export default PostContent;

