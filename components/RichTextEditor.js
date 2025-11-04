"use client";

import { useState, useRef, useEffect } from "react";

export default function RichTextEditor({
  initialContent = "",
  onSave,
  onClose,
  title = "Rich Text Editor",
  policyType = null,
}) {
  const [content, setContent] = useState(initialContent);
  const [showHTML, setShowHTML] = useState(false);
  const [htmlContent, setHtmlContent] = useState(initialContent);
  const [selectedFormat, setSelectedFormat] = useState("p");
  const [forceRender, setForceRender] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [tableSize, setTableSize] = useState({ rows: 2, cols: 2 });
  const [isSelecting, setIsSelecting] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(null);
  const editorRef = useRef(null);

  const formatOptions = [
    { value: "p", label: "Paragraph" },
    { value: "h1", label: "Heading 1" },
    { value: "h2", label: "Heading 2" },
    { value: "h3", label: "Heading 3" },
    { value: "h4", label: "Heading 4" },
    { value: "h5", label: "Heading 5" },
    { value: "h6", label: "Heading 6" },
  ];

  useEffect(() => {
    try {
      if (editorRef.current && !showHTML && isClient) {
        // Only update if content is different to avoid cursor jumping
        if (editorRef.current.innerHTML !== htmlContent) {
          const selection = window.getSelection();
          const range =
            selection && selection.rangeCount > 0
              ? selection.getRangeAt(0)
              : null;

          editorRef.current.innerHTML = htmlContent;

          // Restore cursor position if possible
          if (range && selection) {
            try {
              selection.removeAllRanges();
              selection.addRange(range);
            } catch (e) {
              // Ignore cursor restoration errors
              console.warn("Could not restore cursor position:", e);
            }
          }
        }
        // Ensure the editor is focusable and editable
        editorRef.current.setAttribute("contenteditable", "true");
      }
    } catch (error) {
      console.error("Error in content sync useEffect:", error);
    }
  }, [showHTML, htmlContent, content, forceRender, isClient]);

  useEffect(() => {
    // Set isClient to true after hydration
    setIsClient(true);
  }, []);

  useEffect(() => {
    try {
      // Initialize editor content on mount (only on client)
      if (isClient && editorRef.current) {
        if (initialContent) {
          editorRef.current.innerHTML = initialContent;
        } else {
          // Add some default content if none provided
          editorRef.current.innerHTML =
            "<p>Start writing your content here...</p>";
        }
        setHtmlContent(editorRef.current.innerHTML);
      }
    } catch (error) {
      console.error("Error initializing editor content:", error);
    }
  }, [isClient, initialContent]);

  // Inject CSS styles for proper heading display
  useEffect(() => {
    if (!isClient) return;

    const styleId = "rich-text-editor-styles";
    let styleElement = document.getElementById(styleId);

    if (!styleElement) {
      styleElement = document.createElement("style");
      styleElement.id = styleId;
      styleElement.textContent = `
        .editor-content h1 { 
          font-size: 2rem !important; 
          font-weight: bold !important; 
          margin: 0.5em 0 !important; 
          line-height: 1.2 !important; 
          display: block !important;
        }
        .editor-content h2 { 
          font-size: 1.75rem !important; 
          font-weight: bold !important; 
          margin: 0.5em 0 !important; 
          line-height: 1.2 !important; 
          display: block !important;
        }
        .editor-content h3 { 
          font-size: 1.5rem !important; 
          font-weight: bold !important; 
          margin: 0.5em 0 !important; 
          line-height: 1.2 !important; 
          display: block !important;
        }
        .editor-content h4 { 
          font-size: 1.25rem !important; 
          font-weight: bold !important; 
          margin: 0.5em 0 !important; 
          line-height: 1.2 !important; 
          display: block !important;
        }
        .editor-content h5 { 
          font-size: 1.1rem !important; 
          font-weight: bold !important; 
          margin: 0.5em 0 !important; 
          line-height: 1.2 !important; 
          display: block !important;
        }
        .editor-content h6 { 
          font-size: 1rem !important; 
          font-weight: bold !important; 
          margin: 0.5em 0 !important; 
          line-height: 1.2 !important; 
          display: block !important;
        }
        .editor-content p { 
          margin: 0.5em 0 !important; 
          line-height: 1.4 !important; 
          display: block !important;
        }
        .editor-content strong { 
          font-weight: bold !important; 
        }
        .editor-content em { 
          font-style: italic !important; 
        }
        .editor-content ul, .editor-content ol {
          margin: 0.5em 0 !important;
          padding-left: 1.5em !important;
        }
        .editor-content li {
          margin: 0.25em 0 !important;
        }
        .editor-content span {
          display: inline !important;
        }
        .editor-content font {
          display: inline !important;
        }
      `;
      document.head.appendChild(styleElement);
    }

    return () => {
      // Clean up on unmount
      const element = document.getElementById(styleId);
      if (element) {
        element.remove();
      }
    };
  }, [isClient]);

  const executeCommand = (command, value = null) => {
    // Focus the editor first
    if (editorRef.current) {
      editorRef.current.focus();
    }

    if (command === "bold") {
      // Use strong tag instead of b tag
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        if (selectedText) {
          const strongElement = document.createElement("strong");
          strongElement.textContent = selectedText;
          range.deleteContents();
          range.insertNode(strongElement);
          selection.removeAllRanges();
          updateContent();
          return;
        }
      }
    }

    // Handle formatBlock command specially
    if (command === "formatBlock" && value) {
      try {
        document.execCommand(command, false, value);
      } catch (e) {
        // Fallback for browsers that might have issues
        console.warn("formatBlock failed, trying alternative approach", e);
      }
    } else {
      document.execCommand(command, false, value);
    }

    updateContent();
  };

  const updateContent = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;

      // Update state only if content actually changed
      if (newContent !== content) {
        setContent(newContent);
        setHtmlContent(newContent);
      }
    }
  };

  const handleFormatChange = (format) => {
    try {
      setSelectedFormat(format);

      if (!editorRef.current || !isClient) {
        return;
      }

      // Focus the editor first
      editorRef.current.focus();

      // Get current selection
      const selection = window.getSelection();
      let selectedText = "";
      let hasSelection = false;

      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        selectedText = range.toString();
        hasSelection = !range.collapsed && selectedText.length > 0;
      }

      if (hasSelection) {
        // Text is selected - wrap selected text in new format
        const range = selection.getRangeAt(0);
        const newElement = document.createElement(format);
        newElement.textContent = selectedText;
        range.deleteContents();
        range.insertNode(newElement);

        // Clear selection and place cursor after the new element
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.setStartAfter(newElement);
        newRange.collapse(true);
        selection.addRange(newRange);
      } else {
        // No selection - convert entire content or current block
        let currentText =
          editorRef.current.textContent ||
          editorRef.current.innerText ||
          "Sample text";
        let newHTML = `<${format}>${currentText}</${format}>`;
        editorRef.current.innerHTML = newHTML;

        // Place cursor at the end
        setTimeout(() => {
          if (editorRef.current && editorRef.current.firstChild) {
            const range = document.createRange();
            const selection = window.getSelection();
            const textNode =
              editorRef.current.firstChild.firstChild ||
              editorRef.current.firstChild;

            if (textNode && textNode.textContent) {
              range.setStart(textNode, textNode.textContent.length);
              range.collapse(true);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }, 0);
      }

      // Force complete UI update using same approach as color changes
      setForceRender((prev) => prev + 1);

      // Update content states
      const newContent = editorRef.current.innerHTML;
      setContent(newContent);
      setHtmlContent(newContent);

      // Force DOM reflow to ensure visual update
      editorRef.current.style.display = "none";
      editorRef.current.offsetHeight; // Trigger reflow
      editorRef.current.style.display = "";

      // Use requestAnimationFrame for additional UI updates
      requestAnimationFrame(() => {
        if (editorRef.current) {
          // Trigger input event
          editorRef.current.dispatchEvent(
            new Event("input", { bubbles: true })
          );
          editorRef.current.dispatchEvent(
            new Event("change", { bubbles: true })
          );

          // Force another reflow with GPU layer
          editorRef.current.style.transform = "translateZ(0)";
          requestAnimationFrame(() => {
            if (editorRef.current) {
              editorRef.current.style.transform = "";
            }
          });
        }
      });
    } catch (error) {
      console.error("Error in handleFormatChange:", error);
      setSelectedFormat(format);
    }
  };

  const toggleHTMLView = () => {
    if (showHTML) {
      // Switching from HTML to Editor view - apply HTML changes to editor
      if (editorRef.current && isClient) {
        // Update editor with the HTML content
        editorRef.current.innerHTML = htmlContent;

        // Force UI update using same aggressive approach
        setForceRender((prev) => prev + 1);

        // Update content state
        setContent(htmlContent);

        // Force DOM reflow to ensure visual update
        editorRef.current.style.display = "none";
        editorRef.current.offsetHeight; // Trigger reflow
        editorRef.current.style.display = "";

        // Use requestAnimationFrame for additional UI updates
        requestAnimationFrame(() => {
          if (editorRef.current) {
            // Trigger input event
            editorRef.current.dispatchEvent(
              new Event("input", { bubbles: true })
            );

            // Force style recalculation for all elements
            const allElements = editorRef.current.querySelectorAll("*");
            allElements.forEach((el) => {
              el.style.display = el.style.display || "";
            });

            // Force refresh of all inline styles by temporarily removing and re-adding them
            const styledElements =
              editorRef.current.querySelectorAll("[style]");
            styledElements.forEach((el) => {
              const originalStyle = el.getAttribute("style");
              el.removeAttribute("style");
              el.offsetHeight; // Force reflow
              el.setAttribute("style", originalStyle);
            });

            // Force another reflow with GPU layer
            editorRef.current.style.transform = "translateZ(0)";
            requestAnimationFrame(() => {
              if (editorRef.current) {
                editorRef.current.style.transform = "";

                // Final force refresh
                editorRef.current.style.visibility = "hidden";
                editorRef.current.offsetHeight; // Force reflow
                editorRef.current.style.visibility = "visible";
              }
            });
          }
        });

        // Focus the editor
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
          }
        }, 100);
      }
    } else {
      // Switching from Editor to HTML view - sync current editor content
      updateContent();
    }
    setShowHTML(!showHTML);
  };

  const handleHTMLChange = (e) => {
    const newHtmlContent = e.target.value;
    setHtmlContent(newHtmlContent);
    // Also update content state to keep them in sync
    setContent(newHtmlContent);
  };

  const copyHTML = () => {
    navigator.clipboard.writeText(htmlContent);
    // You could add a toast notification here
  };

  const handleSave = () => {
    onSave && onSave(htmlContent);
  };

  const generateTable = (rows, cols) => {
    let tableHTML =
      '<table style="border-collapse: collapse; width: 100%; margin: 10px 0;">';

    for (let i = 0; i < rows; i++) {
      tableHTML += "<tr>";
      for (let j = 0; j < cols; j++) {
        tableHTML += `<td style="border: 1px solid #ccc; padding: 8px; min-width: 100px; min-height: 30px;">${
          i === 0 && j === 0 ? "Click to edit" : ""
        }</td>`;
      }
      tableHTML += "</tr>";
    }

    tableHTML += "</table>";
    return tableHTML;
  };

  const insertTable = () => {
    const tableHTML = generateTable(tableSize.rows, tableSize.cols);
    executeCommand("insertHTML", tableHTML);
    setShowTableSelector(false);
    setTableSize({ rows: 2, cols: 2 });
  };

  const handleTableSelectorMouseEnter = (row, col) => {
    if (isSelecting) {
      setTableSize({ rows: row + 1, cols: col + 1 });
    }
  };

  const handleTableSelectorMouseDown = (row, col) => {
    setIsSelecting(true);
    setTableSize({ rows: row + 1, cols: col + 1 });
  };

  const handleTableSelectorMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false);
      insertTable();
    }
  };

  // Handle mouse up for table selector
  useEffect(() => {
    if (isClient) {
      document.addEventListener("mouseup", handleTableSelectorMouseUp);
      return () => {
        document.removeEventListener("mouseup", handleTableSelectorMouseUp);
      };
    }
  }, [isClient, isSelecting]);

  // Close AI prompt modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAIPrompt && !event.target.closest('.ai-prompt-container')) {
        setShowAIPrompt(false);
        setAiPrompt("");
        setGenerationError(null);
      }
    };
    if (isClient) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showAIPrompt, isClient]);

  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      setGenerationError("Please enter a prompt describing what you want to generate.");
      return;
    }
    if (!policyType) {
      setGenerationError("Policy type is required for AI generation.");
      return;
    }
    setIsGenerating(true);
    setGenerationError(null);
    try {
      const response = await fetch('/api/generate-policy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          policyType,
          userPrompt: aiPrompt,
          businessInfo: {
            name: "[YOUR BUSINESS NAME]",
            type: "E-commerce",
            email: "[CONTACT EMAIL]",
            website: "[YOUR WEBSITE]",
          },
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate policy content');
      }
      const data = await response.json();
      const generatedContent = data.content;
      if (editorRef.current && isClient) {
        editorRef.current.innerHTML = generatedContent;
        setContent(generatedContent);
        setHtmlContent(generatedContent);
        setForceRender((prev) => prev + 1);
      }
      setShowAIPrompt(false);
      setAiPrompt("");
    } catch (error) {
      console.error('AI Generation Error:', error);
      setGenerationError(error.message || "Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-lg shadow-xl"
        style={{ backgroundColor: "var(--shopify-surface)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--shopify-border)" }}
        >
          <div>
            <h2
              className="text-xl font-semibold"
              style={{ color: "var(--shopify-text-primary)" }}
            >
              {title}
            </h2>
            <p
              className="text-sm mt-1"
              style={{ color: "var(--shopify-text-secondary)" }}
            >
              Create beautifully formatted content with full HTML export support
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-opacity-80 transition-all duration-200"
            style={{ color: "var(--shopify-text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "var(--shopify-surface-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* Editor Controls */}
          <div
            className="p-4 border-b"
            style={{ borderColor: "var(--shopify-border)" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3
                className="font-medium"
                style={{ color: "var(--shopify-text-primary)" }}
              >
                Editor
              </h3>
              <div className="flex gap-2">
                {policyType && (
                  <button
                    onClick={() => setShowAIPrompt(true)}
                    className="px-3 py-1.5 text-sm rounded-lg transition-all duration-200 font-medium flex items-center gap-2"
                    style={{ color: "white", backgroundColor: "#7C3AED", border: "none" }}
                    title="Generate content with AI"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M5 12c2.5-.5 4-2 4.5-4.5C10 10 11.5 11.5 14 12c-2.5.5-4 2-4.5 4.5C9 14 7.5 12.5 5 12z" />
                      <path d="M17 5l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
                    </svg>
                    AI Generate
                  </button>
                )}
                <button
                  onClick={toggleHTMLView}
                  className="px-3 py-1.5 text-sm rounded-lg transition-all duration-200"
                  style={{
                    color: "var(--shopify-text-primary)",
                    backgroundColor: showHTML
                      ? "var(--shopify-action-primary)"
                      : "var(--shopify-surface-hover)",
                  }}
                >
                  {showHTML ? "Show Editor" : "Show HTML"}
                </button>
                <button
                  onClick={copyHTML}
                  className="px-3 py-1.5 text-sm rounded-lg text-white transition-all duration-200"
                  style={{ backgroundColor: "var(--shopify-action-primary)" }}
                >
                  Copy HTML
                </button>
              </div>
            </div>

            {!showHTML && isClient && (
              <div
                className="flex items-center gap-2 overflow-x-auto pb-2"
                style={{ scrollbarWidth: "thin", minWidth: "800px" }}
              >
                {/* Undo/Redo */}
                <button
                  onClick={() => executeCommand("undo")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200 flex-shrink-0"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Undo"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => executeCommand("redo")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Redo"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 10h-10a8 8 0 00-8 8v2m18-10l-6 6m6-6l-6-6"
                    />
                  </svg>
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Format Dropdown */}
                <select
                  value={selectedFormat}
                  onChange={(e) => handleFormatChange(e.target.value)}
                  className="px-3 py-1.5 text-sm rounded border flex-shrink-0"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    borderColor: "var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                  }}
                >
                  {formatOptions.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      style={{
                        fontSize:
                          option.value === "h1"
                            ? "24px"
                            : option.value === "h2"
                            ? "20px"
                            : option.value === "h3"
                            ? "18px"
                            : option.value === "h4"
                            ? "16px"
                            : option.value === "h5"
                            ? "14px"
                            : option.value === "h6"
                            ? "12px"
                            : "14px",
                        fontWeight: option.value.startsWith("h")
                          ? "bold"
                          : "normal",
                        padding: "4px 8px",
                      }}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Text Formatting */}
                <button
                  onClick={() => executeCommand("bold")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200 font-bold"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Bold"
                >
                  B
                </button>
                <button
                  onClick={() => executeCommand("italic")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200 italic"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Italic"
                >
                  I
                </button>
                <button
                  onClick={() => executeCommand("underline")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200 underline"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Underline"
                >
                  U
                </button>
                <button
                  onClick={() => executeCommand("strikeThrough")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200 line-through"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Strikethrough"
                >
                  S
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Alignment */}
                <button
                  onClick={() => executeCommand("justifyLeft")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Align Left"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h8m-8 6h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => executeCommand("justifyCenter")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Align Center"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M8 12h8M6 18h12"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => executeCommand("justifyRight")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Align Right"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M12 12h8M10 18h10"
                    />
                  </svg>
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Lists */}
                <button
                  onClick={() => executeCommand("insertUnorderedList")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Bullet List"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 10h16M4 14h16M4 18h16"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => executeCommand("insertOrderedList")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Numbered List"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>

                <div className="w-px h-6 bg-gray-300 mx-1"></div>

                {/* Code and Quote */}
                <button
                  onClick={() => executeCommand("formatBlock", "pre")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Code Block"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                </button>

                {/* Link */}
                <button
                  onClick={() => {
                    const url = prompt("Enter URL:");
                    if (url) executeCommand("createLink", url);
                  }}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Insert Link"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                </button>

                {/* Image */}
                <button
                  onClick={() => {
                    const url = prompt("Enter image URL:");
                    if (url) executeCommand("insertImage", url);
                  }}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Insert Image"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </button>

                {/* Table */}
                <button
                  onClick={() => setShowTableSelector(!showTableSelector)}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Insert Table"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H4a1 1 0 01-1-1V10z"
                    />
                  </svg>
                </button>

                {/* HR */}
                <button
                  onClick={() => executeCommand("insertHorizontalRule")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Horizontal Rule"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>

                {/* Clear Formatting */}
                <button
                  onClick={() => executeCommand("removeFormat")}
                  className="p-2 rounded hover:bg-opacity-80 transition-all duration-200"
                  style={{ color: "var(--shopify-text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      "var(--shopify-surface-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "transparent")
                  }
                  title="Clear Formatting"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Editor Content */}
          <div
            className="flex-1 overflow-y-auto min-h-0"
            style={{ position: "relative" }}
          >
            {showHTML ? (
              <textarea
                value={htmlContent}
                onChange={handleHTMLChange}
                className="w-full h-96 p-4 font-mono text-sm resize-none border-none outline-none"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  color: "var(--shopify-text-primary)",
                  lineHeight: "1.5",
                  tabSize: "2",
                }}
                placeholder="Edit HTML directly here... Changes will appear in the editor when you switch back."
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
              />
            ) : isClient ? (
              <div
                key={forceRender}
                ref={editorRef}
                contentEditable
                onInput={updateContent}
                className="w-full h-96 p-4 outline-none overflow-y-auto editor-content"
                dir="ltr"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  color: "var(--shopify-text-primary)",
                  minHeight: "300px",
                  direction: "ltr",
                  textAlign: "left",
                  unicodeBidi: "normal",
                }}
                suppressContentEditableWarning={true}
                onFocus={(e) => {
                  if (
                    e.target.innerHTML === "" ||
                    e.target.innerHTML === "<br>"
                  ) {
                    e.target.innerHTML = "";
                  }
                }}
                onBlur={(e) => {
                  if (
                    e.target.innerHTML === "" ||
                    e.target.innerHTML === "<br>"
                  ) {
                    e.target.innerHTML =
                      '<p style="color: #9ca3af; font-style: italic;">Start writing your content here...</p>';
                  }
                }}
              />
            ) : (
              <div
                className="w-full h-96 p-4 outline-none overflow-y-auto editor-content"
                style={{
                  backgroundColor: "var(--shopify-surface)",
                  color: "var(--shopify-text-primary)",
                  minHeight: "300px",
                }}
              >
                <p style={{ color: "#9ca3af", fontStyle: "italic" }}>
                  Loading editor...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Table Size Selector Modal - Centered */}
        {showTableSelector && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center table-selector-container"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowTableSelector(false);
                setTableSize({ rows: 2, cols: 2 });
              }
            }}
          >
            <div
              className="p-6 rounded-lg shadow-xl border bg-white max-w-sm w-full mx-4"
              style={{
                backgroundColor: "var(--shopify-surface)",
                borderColor: "var(--shopify-border)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              }}
              onMouseLeave={() => {
                if (!isSelecting) {
                  setTableSize({ rows: 2, cols: 2 });
                }
              }}
            >
              <div className="text-center mb-4">
                <h3
                  className="text-lg font-semibold mb-1"
                  style={{ color: "var(--shopify-text-primary)" }}
                >
                  Insert Table
                </h3>
                <div
                  className="text-sm font-medium"
                  style={{ color: "var(--shopify-text-secondary)" }}
                >
                  Select Table Size: {tableSize.rows} × {tableSize.cols}
                </div>
              </div>

              {/* Table Grid Selector */}
              <div className="grid grid-cols-8 gap-1 mb-4 justify-center">
                {Array.from({ length: 64 }, (_, index) => {
                  const row = Math.floor(index / 8);
                  const col = index % 8;
                  const isSelected =
                    row < tableSize.rows && col < tableSize.cols;

                  return (
                    <div
                      key={index}
                      className="w-5 h-5 border cursor-pointer transition-all duration-150 rounded-sm"
                      style={{
                        backgroundColor: isSelected
                          ? "var(--shopify-action-primary)"
                          : "#f3f4f6",
                        borderColor: isSelected
                          ? "var(--shopify-action-primary)"
                          : "#d1d5db",
                        opacity: 1,
                      }}
                      onMouseEnter={() =>
                        handleTableSelectorMouseEnter(row, col)
                      }
                      onMouseDown={() => handleTableSelectorMouseDown(row, col)}
                    />
                  );
                })}
              </div>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={insertTable}
                  className="px-4 py-2 text-sm rounded-lg text-white transition-all duration-200 font-medium"
                  style={{ backgroundColor: "var(--shopify-action-primary)" }}
                >
                  Insert Table
                </button>
                <button
                  onClick={() => {
                    setShowTableSelector(false);
                    setTableSize({ rows: 2, cols: 2 });
                  }}
                  className="px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium"
                  style={{
                    color: "var(--shopify-text-secondary)",
                    backgroundColor: "var(--shopify-surface-hover)",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* AI Prompt Modal */}
        {showAIPrompt && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center ai-prompt-container"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.6)" }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowAIPrompt(false);
                setAiPrompt("");
                setGenerationError(null);
              }
            }}
          >
            <div
              className="p-6 rounded-lg shadow-xl border bg-white max-w-md w-full mx-4"
              style={{
                backgroundColor: "var(--shopify-surface)",
                borderColor: "var(--shopify-border)",
                boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              }}
            >
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M5 12c2.5-.5 4-2 4.5-4.5C10 10 11.5 11.5 14 12c-2.5.5-4 2-4.5 4.5C9 14 7.5 12.5 5 12z" />
                    <path d="M17 5l1 3 3 1-3 1-1 3-1-3-3-1 3-1 1-3z" />
                  </svg>
                  <h3 className="text-lg font-semibold" style={{ color: "var(--shopify-text-primary)" }}>
                    AI Policy Generator
                  </h3>
                </div>
                {policyType && (
                  <div className="text-sm" style={{ color: "var(--shopify-text-secondary)" }}>
                    Generating: <strong>{policyType}</strong>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2" style={{ color: "var(--shopify-text-primary)" }}>
                  Describe what you want in your policy:
                </label>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g., Include 30-day return window, require original packaging, exclude sale items..."
                  className="w-full p-3 border rounded-lg resize-none text-sm"
                  style={{
                    backgroundColor: "var(--shopify-surface)",
                    borderColor: "var(--shopify-border)",
                    color: "var(--shopify-text-primary)",
                    minHeight: "100px",
                  }}
                  rows={4}
                  disabled={isGenerating}
                />
              </div>

              {generationError && (
                <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm" style={{ color: "#B91C1C" }}>{generationError}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowAIPrompt(false);
                    setAiPrompt("");
                    setGenerationError(null);
                  }}
                  className="px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium"
                  style={{ color: "var(--shopify-text-secondary)", backgroundColor: "var(--shopify-surface-hover)" }}
                  disabled={isGenerating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAIGenerate}
                  className="px-4 py-2 text-sm rounded-lg text-white transition-all duration-200 font-medium flex items-center gap-2"
                  style={{ backgroundColor: "#7C3AED" }}
                  disabled={isGenerating || !aiPrompt.trim()}
                >
                  {isGenerating ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>Generate Policy</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div
          className="flex items-center justify-between p-4 border-t flex-shrink-0"
          style={{ borderColor: "var(--shopify-border)" }}
        >
          <div className="flex items-center gap-2">
            <span
              className="text-sm"
              style={{ color: "var(--shopify-text-secondary)" }}
            >
              Characters: {htmlContent.length}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg transition-all duration-200"
              style={{
                color: "var(--shopify-text-secondary)",
                backgroundColor: "var(--shopify-surface-hover)",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm rounded-lg text-white transition-all duration-200"
              style={{ backgroundColor: "var(--shopify-action-primary)" }}
            >
              Save Policy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
