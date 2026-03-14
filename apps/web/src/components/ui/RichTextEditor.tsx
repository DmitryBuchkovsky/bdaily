import type { Editor } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Link from "@tiptap/extension-link";
import Mention from "@tiptap/extension-mention";
import Placeholder from "@tiptap/extension-placeholder";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import { computePosition, flip, shift } from "@floating-ui/dom";
import { EditorContent, useEditor, posToDOMRect } from "@tiptap/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { EditorToolbar } from "./EditorToolbar";
import { MentionList, type MentionListRef } from "./MentionList";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minimal?: boolean;
  mentionsEnabled?: boolean;
}

const MOCK_MENTIONS = [
  { id: "1", name: "Alice" },
  { id: "2", name: "Bob" },
  { id: "3", name: "Charlie" },
];

function positionPopup(editor: Editor, el: HTMLElement) {
  const rect = () =>
    posToDOMRect(editor.view, editor.state.selection.from, editor.state.selection.to);
  computePosition({ getBoundingClientRect: rect }, el, {
    placement: "bottom-start",
    strategy: "absolute",
    middleware: [shift(), flip()],
  }).then(({ x, y, strategy }) => {
    el.style.position = strategy;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  });
}

export function RichTextEditor({
  value,
  onChange,
  placeholder,
  className,
  minimal,
  mentionsEnabled,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? "Write something…" }),
      Link.configure({ openOnClick: false, autolink: true }),
      Underline,
      ...(mentionsEnabled
        ? [
            Mention.configure({
              HTMLAttributes: { "data-type": "mention" },
              suggestion: {
                char: "@",
                items: ({ query }) =>
                  MOCK_MENTIONS.filter((m) =>
                    m.name.toLowerCase().startsWith(query.toLowerCase()),
                  ).slice(0, 5),
                render: () => {
                  let comp: ReactRenderer<MentionListRef>;
                  return {
                    onStart: (p) => {
                      comp = new ReactRenderer(MentionList, {
                        props: { items: p.items, command: p.command },
                        editor: p.editor,
                      });
                      comp.element.style.position = "absolute";
                      document.body.appendChild(comp.element);
                      positionPopup(p.editor, comp.element);
                    },
                    onUpdate: (p) => {
                      comp.updateProps({ items: p.items, command: p.command });
                      positionPopup(p.editor, comp.element);
                    },
                    onKeyDown: (p) =>
                      p.event.key === "Escape"
                        ? (comp.destroy(), true)
                        : (comp.ref?.onKeyDown(p) ?? false),
                    onExit: () => {
                      comp.element.remove();
                      comp.destroy();
                    },
                  };
                },
              },
            }),
          ]
        : []),
    ],
    content: value,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) editor.commands.setContent(value, { emitUpdate: false });
  }, [value, editor]);

  if (!editor) return null;

  return (
    <div className={cn("w-full rounded-lg border border-input bg-background", className)}>
      <EditorToolbar editor={editor} minimal={minimal} />
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-3 py-2 [&_.ProseMirror]:min-h-[80px] [&_.ProseMirror]:outline-none [&_.ProseMirror-p.is-editor-empty:first-child]:text-muted-foreground"
      />
    </div>
  );
}
