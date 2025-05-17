import { useState } from 'react'
import {
    MDXEditor,
    headingsPlugin,
    listsPlugin,
    quotePlugin,
    markdownShortcutPlugin,
    toolbarPlugin,
    UndoRedo,
    BoldItalicUnderlineToggles,
    CodeToggle,
    InsertCodeBlock,
    InsertImage,
    InsertTable,
    InsertThematicBreak,
    CreateLink,
    linkPlugin,
    imagePlugin,
    tablePlugin,
    thematicBreakPlugin,
    codeBlockPlugin,
    diffSourcePlugin,
    DiffSourceToggleWrapper,
    linkDialogPlugin,
    codeMirrorPlugin,
    directivesPlugin,
    AdmonitionDirectiveDescriptor,
    ListsToggle,
    Separator,
    BlockTypeSelect,
    InsertAdmonition,
    InsertFrontmatter,
    frontmatterPlugin,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

export default function FullMDXEditor({
    initialMarkdown = '# Hello World',
    onChange
}: {
    initialMarkdown?: string
    onChange?: (markdown: string) => void
}) {
    const [markdown, setMarkdown] = useState(initialMarkdown)

    const handleChange = (newMarkdown: string) => {
        setMarkdown(newMarkdown)
        onChange?.(newMarkdown)
    }

    return (
        <div className={`border rounded-lg overflow-hidden`}>
            <MDXEditor
                className='bg-gray-200'
                markdown={markdown}
                onChange={handleChange}
                contentEditableClassName="prose max-w-none font-sans dark:prose-invert"
                plugins={[
                    // Plugin Setup
                    headingsPlugin(),
                    listsPlugin(),
                    quotePlugin(),
                    markdownShortcutPlugin(),
                    linkPlugin(),
                    imagePlugin(),
                    tablePlugin(),
                    thematicBreakPlugin(),
                    codeBlockPlugin({ defaultCodeBlockLanguage: 'js' }),
                    diffSourcePlugin({ viewMode: 'rich-text', diffMarkdown: 'boo' }),
                    linkDialogPlugin(),
                    directivesPlugin({ directiveDescriptors: [AdmonitionDirectiveDescriptor] }),
                    codeMirrorPlugin({
                        autoLoadLanguageSupport: true,
                        codeBlockLanguages: {
                            js: 'JavaScript',
                            ts: 'TypeScript',
                            css: 'CSS',
                            html: 'HTML',
                            md: 'Markdown',
                            json: 'JSON',
                            python: 'Python',
                            java: 'Java',
                            c: 'C',
                            cpp: 'C++',
                            cs: 'C#',
                            php: 'PHP',
                            ruby: 'Ruby',
                            go: 'Go',
                            rust: 'Rust',
                            sql: 'SQL'
                        }
                    }),
                    frontmatterPlugin(),

                    // Toolbar Setup
                    toolbarPlugin({
                        toolbarPosition: "bottom",
                        toolbarContents: () => (
                            <DiffSourceToggleWrapper>
                                <UndoRedo />
                                <Separator />
                                <BoldItalicUnderlineToggles />
                                <CodeToggle />
                                <Separator />
                                <ListsToggle />
                                <Separator />
                                <BlockTypeSelect />
                                <Separator />
                                <CreateLink />
                                <InsertImage />
                                <InsertTable />
                                <InsertCodeBlock />
                                <InsertThematicBreak />
                                <InsertAdmonition />
                                <InsertFrontmatter />
                            </DiffSourceToggleWrapper>
                        )
                    })
                ]}
            />
        </div>
    )
}
