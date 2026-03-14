import type { Editor } from "@tiptap/react";
import {
  Bold,
  Code,
  Heading2,
  Heading3,
  Italic,
  Link,
  List,
  ListOrdered,
  Quote,
  Strikethrough,
  Underline,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EditorToolbarProps {
  editor: Editor;
  minimal?: boolean;
}

const btn =
  "rounded p-1.5 hover:bg-muted transition-colors disabled:opacity-50 disabled:pointer-events-none";

type BtnConfig = {
  name: string;
  Icon: typeof Bold;
  toggle: (e: Editor) => void;
  can: (e: Editor) => boolean;
};

const MINIMAL_BTNS: BtnConfig[] = [
  {
    name: "bold",
    Icon: Bold,
    toggle: (e) => e.chain().focus().toggleBold().run(),
    can: (e) => e.can().chain().focus().toggleBold().run(),
  },
  {
    name: "italic",
    Icon: Italic,
    toggle: (e) => e.chain().focus().toggleItalic().run(),
    can: (e) => e.can().chain().focus().toggleItalic().run(),
  },
  {
    name: "underline",
    Icon: Underline,
    toggle: (e) => e.chain().focus().toggleUnderline().run(),
    can: (e) => e.can().chain().focus().toggleUnderline().run(),
  },
  {
    name: "link",
    Icon: Link,
    toggle: (e) => {
      if (e.isActive("link")) e.chain().focus().unsetLink().run();
      else {
        const href = window.prompt("URL");
        if (href) e.chain().focus().setLink({ href }).run();
      }
    },
    can: (e) => e.can().chain().focus().setLink({ href: "" }).run(),
  },
  {
    name: "code",
    Icon: Code,
    toggle: (e) => e.chain().focus().toggleCode().run(),
    can: (e) => e.can().chain().focus().toggleCode().run(),
  },
];

const FULL_BTNS: BtnConfig[] = [
  {
    name: "heading",
    Icon: Heading2,
    toggle: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
    can: (e) => e.can().chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    name: "heading",
    Icon: Heading3,
    toggle: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
    can: (e) => e.can().chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    name: "bulletList",
    Icon: List,
    toggle: (e) => e.chain().focus().toggleBulletList().run(),
    can: (e) => e.can().chain().focus().toggleBulletList().run(),
  },
  {
    name: "orderedList",
    Icon: ListOrdered,
    toggle: (e) => e.chain().focus().toggleOrderedList().run(),
    can: (e) => e.can().chain().focus().toggleOrderedList().run(),
  },
  {
    name: "blockquote",
    Icon: Quote,
    toggle: (e) => e.chain().focus().toggleBlockquote().run(),
    can: (e) => e.can().chain().focus().toggleBlockquote().run(),
  },
  {
    name: "strike",
    Icon: Strikethrough,
    toggle: (e) => e.chain().focus().toggleStrike().run(),
    can: (e) => e.can().chain().focus().toggleStrike().run(),
  },
];

export function EditorToolbar({ editor, minimal }: EditorToolbarProps) {
  const active = (name: string) =>
    editor.isActive(name) ? "bg-primary/10 text-primary" : "text-muted-foreground";

  return (
    <div className="flex flex-wrap gap-1 border-b border-border p-1.5">
      {MINIMAL_BTNS.map(({ name, Icon, toggle, can }) => (
        <button
          key={name}
          type="button"
          onClick={() => toggle(editor)}
          disabled={!can(editor)}
          className={cn(btn, active(name))}
          aria-label={name}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
      {!minimal &&
        FULL_BTNS.map(({ name, Icon, toggle, can }, i) => (
          <button
            key={`${name}-${i}`}
            type="button"
            onClick={() => toggle(editor)}
            disabled={!can(editor)}
            className={cn(btn, active(name))}
            aria-label={name}
          >
            <Icon className="h-4 w-4" />
          </button>
        ))}
    </div>
  );
}
