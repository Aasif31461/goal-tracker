import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';
import html2pdf from 'html2pdf.js';
import {
    Bold, Italic, List, Image, Code, Eye, Edit3, Link as LinkIcon,
    Heading1, Heading2, Quote, Sun, Moon, Table, Strikethrough,
    CheckSquare, Undo, Redo, Download
} from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

export default function MarkdownEditor({ value, onChange, placeholder, minHeight = "200px", maxHeight = "80vh", className = "", pdfFilename = "notes" }) {
    // Default to 'preview' and 'light' theme as requested
    const [mode, setMode] = useState('preview');
    const [previewTheme, setPreviewTheme] = useState('light');

    // ... (rest of state)

    // ...



    // History for Undo/Redo
    const [history, setHistory] = useState([value]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const isInternalChange = useRef(false);

    // Ref for PDF generation
    const previewRef = useRef(null);

    // Sync external value changes to history if not internal
    useEffect(() => {
        if (!isInternalChange.current && value !== history[historyIndex]) {
            if (value !== history[historyIndex]) {
                const newHistory = history.slice(0, historyIndex + 1);
                newHistory.push(value);
                setHistory(newHistory);
                setHistoryIndex(newHistory.length - 1);
            }
        }
        isInternalChange.current = false;
    }, [value]);

    const handleChange = (newValue) => {
        isInternalChange.current = true;
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newValue);
        if (newHistory.length > 50) newHistory.shift();
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        onChange(newValue);
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            isInternalChange.current = true;
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            onChange(history[newIndex]);
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            isInternalChange.current = true;
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            onChange(history[newIndex]);
        }
    };

    const handleDownloadPDF = () => {
        if (!previewRef.current) return;

        // Ensure we are in preview mode to capture the content
        if (mode !== 'preview') {
            setMode('preview');
            // Allow state update to render preview before capturing
            setTimeout(() => generatePDF(), 100);
        } else {
            generatePDF();
        }
    };

    const generatePDF = () => {
        const element = previewRef.current;
        if (!element) return;

        // Clone the element to manipulate it without affecting the UI
        const clone = element.cloneNode(true);

        // Sanitize the clone to remove incompatible styles (oklch)
        // 1. Sanitize the clone by converting computed styles to explicit hex values
        // This is crucial because html2canvas uses computed styles, and if Tailwind v4 or a theme employs oklch, it will crash.
        const descendants = clone.getElementsByTagName('*');
        for (let i = 0; i < descendants.length; i++) {
            const el = descendants[i];

            // Get computed style of the ORIGINAL element if possible? 
            // Actually, we can just enforce safe defaults for the clone since it's for print.

            // Force text color to black
            el.style.color = '#000000';

            // Force background to transparent unless it's a code block or specific element
            // We want to avoid capturing complex gradient backgrounds that might use modern css features
            const tagName = el.tagName;
            if (!['PRE', 'CODE', 'TH', 'TD', 'TR', 'TABLE'].includes(tagName)) {
                el.style.backgroundColor = 'transparent';
                el.style.backgroundImage = 'none';
                el.style.borderColor = '#e2e8f0'; // Safe slate-200 for borders
            } else if (tagName === 'PRE' || tagName === 'CODE') {
                el.style.backgroundColor = '#f1f5f9'; // Safe slate-100 for code
                el.style.color = '#000000';
            }

            // Remove all classes that might trigger Tailwind's modern color vars
            el.removeAttribute('class');
            // We stripped all classes! We rely on the prose styles injected below.
        }

        // 2. Inject Style Override for Prose Variables
        // This forces specific hex values for the typography plugin variables
        const style = document.createElement('style');
        style.textContent = `
            .prose {
                --tw-prose-body: #334155 !important;
                --tw-prose-headings: #0f172a !important;
                --tw-prose-lead: #475569 !important;
                --tw-prose-links: #2563eb !important;
                --tw-prose-bold: #0f172a !important;
                --tw-prose-counters: #64748b !important;
                --tw-prose-bullets: #d1d5db !important;
                --tw-prose-hr: #e2e8f0 !important;
                --tw-prose-quotes: #0f172a !important;
                --tw-prose-quote-borders: #e2e8f0 !important;
                --tw-prose-captions: #64748b !important;
                --tw-prose-code: #0f172a !important;
                --tw-prose-pre-code: #e2e8f0 !important;
                --tw-prose-pre-bg: #1e293b !important;
                --tw-prose-th-borders: #d1d5db !important;
                --tw-prose-td-borders: #e2e8f0 !important;
                color: #000000 !important;
            }
            table, th, td { border-color: #d1d5db !important; }
        `;
        clone.appendChild(style);

        // 3. Set Container Styles
        clone.style.backgroundColor = '#ffffff';
        clone.style.color = '#000000';
        clone.style.padding = '20px';
        clone.style.maxWidth = '100%';
        clone.style.height = 'auto';
        clone.style.maxHeight = 'none';
        clone.style.overflow = 'visible';

        // Wrap in hidden container
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        // Slightly wider virtual page for better base resolution before scaling
        container.style.width = '1024px';
        container.appendChild(clone);
        document.body.appendChild(container);

        const opt = {
            margin: 10,
            filename: `${pdfFilename}.pdf`,
            // Use high‑quality JPEG to keep text reasonably sharp without huge files
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: {
                // Balanced scale: good sharpness with much smaller size than the previous PNG/3x setup
                scale: 2,
                useCORS: true,
                logging: false
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Use .then().catch() instead of .always()
        html2pdf()
            .from(clone)
            .set(opt)
            .save()
            .then(() => {
                document.body.removeChild(container);
            })
            .catch((err) => {
                console.error("PDF Generate Error:", err);
                document.body.removeChild(container);
            });
    };

    const insertText = (before, after = "") => {
        const textarea = document.getElementById('markdown-textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = value || "";
        const beforeText = text.substring(0, start);
        const selectedText = text.substring(start, end);
        const afterText = text.substring(end);

        const newText = `${beforeText}${before}${selectedText}${after}${afterText}`;
        handleChange(newText);

        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    const handlePaste = (e) => {
        // Only handle paste in write mode
        if (mode !== 'write') return;

        const clipboardData = e.clipboardData || window.clipboardData;
        if (!clipboardData) return;

        const html = clipboardData.getData('text/html');

        // If no HTML, let default behavior happen (text paste)
        if (!html) return;

        // If HTML exists, try to convert it
        try {
            e.preventDefault();

            // Lazy load or use TurndownService
            // Note: Since we need it sync, we assume it's imported.
            // If it's heavy, we could dynamic import, but for now top-level import is fine.
            const TurndownService = require('turndown').default || require('turndown');
            const { gfm } = require('turndown-plugin-gfm');

            const turndownService = new TurndownService({
                headingStyle: 'atx',
                codeBlockStyle: 'fenced',
                bulletListMarker: '-'
            });

            turndownService.use(gfm);

            // Custom rule to retain basic line breaks if needed, usually default is fine

            const markdown = turndownService.turndown(html);

            // Insert the converted markdown
            insertText(markdown);

        } catch (err) {
            console.error("Paste conversion failed:", err);
            // Fallback to text
            // We prevented default, so we must manually insert text if html failed but text exists
            const text = clipboardData.getData('text/plain');
            if (text) insertText(text);
        }
    };

    return (
        <div className={`flex flex-col border border-slate-700 rounded-xl overflow-hidden bg-slate-900/50 ${className}`}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-2 py-2 bg-slate-900 border-b border-slate-700 overflow-x-auto">
                <div className="flex items-center gap-1">
                    {/* Preview First */}
                    <button onClick={() => setMode('preview')} className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors ${mode === 'preview' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-white'}`}>
                        <Eye size={14} /> Preview
                    </button>
                    <button onClick={() => setMode('write')} className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs font-bold transition-colors ${mode === 'write' ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-500 hover:text-white'}`}>
                        <Edit3 size={14} /> Write
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {/* Always show Download button if in Preview, or general toolbar */}
                    {mode === 'preview' && (
                        <>
                            <button
                                onClick={handleDownloadPDF}
                                className="p-1.5 rounded-lg transition-colors text-slate-400 hover:text-white hover:bg-slate-700/50"
                                title="Download as PDF"
                            >
                                <Download size={14} />
                            </button>
                            <div className="w-px h-4 bg-slate-700" />
                            <button
                                onClick={() => setPreviewTheme(previewTheme === 'dark' ? 'light' : 'dark')}
                                className={`p-1.5 rounded-lg transition-colors ${previewTheme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-amber-500 bg-amber-500/10'}`}
                                title="Toggle Preview Theme"
                            >
                                {previewTheme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                            </button>
                        </>
                    )}

                    {mode === 'write' && (
                        <div className="flex items-center gap-0.5 border-l border-slate-700 pl-2">
                            <ToolbarButton icon={Undo} onClick={handleUndo} title="Undo" disabled={historyIndex <= 0} />
                            <ToolbarButton icon={Redo} onClick={handleRedo} title="Redo" disabled={historyIndex >= history.length - 1} />
                            <div className="w-px h-4 bg-slate-700 mx-1" />

                            <ToolbarButton icon={Bold} onClick={() => insertText('**', '**')} title="Bold" />
                            <ToolbarButton icon={Italic} onClick={() => insertText('*', '*')} title="Italic" />
                            <ToolbarButton icon={Strikethrough} onClick={() => insertText('~', '~')} title="Strikethrough" />

                            <div className="w-px h-4 bg-slate-700 mx-1" />

                            <ToolbarButton icon={Heading1} onClick={() => insertText('# ')} title="Heading 1" />
                            <ToolbarButton icon={Heading2} onClick={() => insertText('## ')} title="Heading 2" />

                            <div className="w-px h-4 bg-slate-700 mx-1" />

                            <ToolbarButton icon={List} onClick={() => insertText('- ')} title="List" />
                            <ToolbarButton icon={CheckSquare} onClick={() => insertText('- [ ] ')} title="Task List" />
                            <ToolbarButton icon={Quote} onClick={() => insertText('> ')} title="Quote" />
                            <ToolbarButton icon={Code} onClick={() => insertText('```javascript\n', '\n```')} title="Code Block" />
                            <ToolbarButton icon={Table} onClick={() => insertText('| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |')} title="Table" />

                            <div className="w-px h-4 bg-slate-700 mx-1" />

                            <ToolbarButton icon={LinkIcon} onClick={() => insertText('[', '](url)')} title="Link" />
                            <ToolbarButton icon={Image} onClick={() => insertText('![Alt text](', ')')} title="Image" />
                        </div>
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className="relative flex-1" style={{ minHeight }}>
                {mode === 'write' ? (
                    <textarea
                        id="markdown-textarea"
                        value={value}
                        onChange={(e) => handleChange(e.target.value)}
                        onPaste={handlePaste}
                        placeholder={placeholder || "Type your markdown here..."}
                        className="w-full h-full p-4 bg-transparent text-slate-200 placeholder:text-slate-600 outline-none resize-none font-mono text-sm leading-relaxed custom-scrollbar"
                        style={{ minHeight, maxHeight }}
                    />
                ) : (
                    <div
                        ref={previewRef}
                        className={`p-6 overflow-y-auto custom-scrollbar transition-colors duration-300 max-w-none ${previewTheme === 'dark'
                            ? 'bg-slate-950/30 prose prose-invert prose-sm'
                            : 'bg-white text-slate-900 prose prose-slate prose-sm shadow-inner'
                            }`}
                        style={{ minHeight, maxHeight }}
                    >
                        {value ? (
                            <ReactMarkdown
                                rehypePlugins={[rehypeHighlight]}
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    table: ({ node, ...props }) => <table className="border-collapse border border-slate-500 w-full my-4" {...props} />,
                                    th: ({ node, ...props }) => <th className={`border border-slate-500 px-3 py-1 ${previewTheme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`} {...props} />,
                                    td: ({ node, ...props }) => <td className="border border-slate-500 px-3 py-1" {...props} />
                                }}
                            >
                                {value}
                            </ReactMarkdown>
                        ) : (
                            <div className={`italic ${previewTheme === 'dark' ? 'text-slate-600' : 'text-slate-400'}`}>Nothing to preview</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ToolbarButton({ icon: Icon, onClick, title, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-1.5 rounded-lg transition-colors ${disabled
                ? 'text-slate-700 cursor-not-allowed'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }`}
            title={title}
        >
            <Icon size={14} />
        </button>
    );
}
