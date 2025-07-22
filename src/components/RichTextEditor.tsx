import React, { useEffect, useRef, useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, List as ListIcon, ListOrdered as ListOrderedIcon, RotateCcw, RotateCw } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const PARAGRAPH_STYLES = [
  {
    label: 'Texto Normal',
    value: 'paragraph',
    className: 'font-normal text-base',
    preview: <span className="font-normal text-base">Texto Normal</span>,
  },
  {
    label: 'Título 1',
    value: 'h1',
    className: 'font-bold text-2xl',
    preview: <span className="font-bold text-2xl">Título 1</span>,
  },
  {
    label: 'Título 2',
    value: 'h2',
    className: 'font-semibold text-xl',
    preview: <span className="font-semibold text-xl">Título 2</span>,
  },
  {
    label: 'Título 3',
    value: 'h3',
    className: 'font-medium text-lg',
    preview: <span className="font-medium text-lg">Título 3</span>,
  },
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, required, placeholder, disabled }) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content: value || '',
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'min-h-[120px] w-full px-4 py-3 rounded-b-lg transition-colors resize-none focus:outline-none',
        placeholder: placeholder || '',
        spellCheck: 'true',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      if (editor.getHTML() !== value) {
        editor.commands.setContent(value || '', { emitUpdate: false });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const [showStyleDropdown, setShowStyleDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha o dropdown ao clicar fora
  useEffect(() => {
    if (!showStyleDropdown) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowStyleDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showStyleDropdown]);

  if (!editor) return <div className="w-full min-h-[120px] bg-gray-100 rounded-lg animate-pulse" />;

  // Helper para dropdown customizado
  const getBlockType = () => {
    if (editor.isActive('heading', { level: 1 })) return 'h1';
    if (editor.isActive('heading', { level: 2 })) return 'h2';
    if (editor.isActive('heading', { level: 3 })) return 'h3';
    return 'paragraph';
  };
  const currentStyle = PARAGRAPH_STYLES.find(s => s.value === getBlockType()) || PARAGRAPH_STYLES[0];

  return (
    <div className="border border-[#DEE2E6] rounded-lg bg-white">
      {/* Toolbar */}
      <div className="flex items-center space-x-2 p-2 rounded-t-lg bg-[#F8F9FA] border-b border-[#DEE2E6]">
        {/* Dropdown customizado de parágrafo */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            className="flex items-center px-2 py-1 rounded border border-[#DEE2E6] text-sm bg-white focus:outline-none min-w-[120px]"
            onClick={() => setShowStyleDropdown(v => !v)}
            disabled={disabled}
            aria-haspopup="listbox"
            aria-expanded={showStyleDropdown}
            tabIndex={0}
          >
            <span className={currentStyle.className}>{currentStyle.label}</span>
            <svg className="ml-2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {showStyleDropdown && (
            <div className="absolute left-0 mt-1 w-44 bg-white border border-[#DEE2E6] rounded-lg shadow-lg z-30" role="listbox">
              {PARAGRAPH_STYLES.map(style => (
                <button
                  key={style.value}
                  type="button"
                  className={`w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 ${getBlockType() === style.value ? 'bg-gray-100' : ''}`}
                  onClick={() => {
                    setShowStyleDropdown(false);
                    if (style.value === 'paragraph') editor.chain().focus().setParagraph().run();
                    else if (style.value === 'h1') editor.chain().focus().toggleHeading({ level: 1 }).run();
                    else if (style.value === 'h2') editor.chain().focus().toggleHeading({ level: 2 }).run();
                    else if (style.value === 'h3') editor.chain().focus().toggleHeading({ level: 3 }).run();
                  }}
                  role="option"
                  aria-selected={getBlockType() === style.value}
                  tabIndex={0}
                  disabled={disabled}
                >
                  {style.preview}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* Bold */}
        <button
          type="button"
          className={`p-2 rounded transition-colors hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-200' : ''}`}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          title="Negrito"
        >
          <BoldIcon size={16} />
        </button>
        {/* Italic */}
        <button
          type="button"
          className={`p-2 rounded transition-colors hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-200' : ''}`}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          title="Itálico"
        >
          <ItalicIcon size={16} />
        </button>
        {/* Underline */}
        <button
          type="button"
          className={`p-2 rounded transition-colors hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-200' : ''}`}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
          title="Sublinhado"
        >
          <UnderlineIcon size={16} />
        </button>
        {/* Bullet List */}
        <button
          type="button"
          className={`p-2 rounded transition-colors hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-200' : ''}`}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          title="Lista com Marcadores"
        >
          <ListIcon size={16} />
        </button>
        {/* Ordered List */}
        <button
          type="button"
          className={`p-2 rounded transition-colors hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-200' : ''}`}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          title="Lista Numerada"
        >
          <ListOrderedIcon size={16} />
        </button>
        {/* Undo */}
        <button
          type="button"
          className="p-2 rounded transition-colors hover:bg-gray-200"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().undo()}
          title="Desfazer"
        >
          <RotateCcw size={16} />
        </button>
        {/* Redo */}
        <button
          type="button"
          className="p-2 rounded transition-colors hover:bg-gray-200"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().redo()}
          title="Refazer"
        >
          <RotateCw size={16} />
        </button>
      </div>
      {/* Editor Content */}
      <EditorContent editor={editor} />
      {/* Required field message */}
      {required && !value && (
        <div className="text-xs text-[#E76F51] px-4 py-1">Este campo é obrigatório.</div>
      )}
    </div>
  );
};

export default RichTextEditor; 