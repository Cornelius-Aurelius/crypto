import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

/**
 * A lightweight markdown renderer. 
 * Note: In a production environment with full package access, 
 * using 'react-markdown' or 'marked' would be preferred.
 * This implementation handles basics: Headers, Bold, Lists, Tables, Links.
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  
  // Helper to process line-based markdown
  const renderContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    
    let inTable = false;
    let tableRows: string[][] = [];
    let inList = false;
    let listItems: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Headers
      if (line.startsWith('# ')) {
        elements.push(<h1 key={i}>{parseInline(line.slice(2))}</h1>);
        continue;
      }
      if (line.startsWith('## ')) {
        elements.push(<h2 key={i}>{parseInline(line.slice(3))}</h2>);
        continue;
      }
      if (line.startsWith('### ')) {
        elements.push(<h3 key={i}>{parseInline(line.slice(4))}</h3>);
        continue;
      }

      // Tables
      if (line.trim().startsWith('|')) {
        if (!inTable) {
          inTable = true;
          tableRows = [];
        }
        tableRows.push(line.split('|').filter(c => c.trim() !== '').map(c => c.trim()));
        
        // Check if next line is not a table line
        if (i + 1 >= lines.length || !lines[i + 1].trim().startsWith('|')) {
          inTable = false;
          elements.push(renderTable(tableRows, i));
          tableRows = [];
        }
        continue;
      }

      // Lists (Unordered)
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        inList = true;
        listItems.push(<li key={`li-${i}`}>{parseInline(line.trim().substring(2))}</li>);
         // Check if next line is not a list item
         if (i + 1 >= lines.length || (!lines[i + 1].trim().startsWith('- ') && !lines[i + 1].trim().startsWith('* '))) {
            inList = false;
            elements.push(<ul key={`ul-${i}`}>{listItems}</ul>);
            listItems = [];
         }
         continue;
      }

      // Default Paragraph (skip empty lines unless they are spacers)
      if (line.trim() !== '') {
        elements.push(<p key={i}>{parseInline(line)}</p>);
      }
    }

    return elements;
  };

  const renderTable = (rows: string[][], key: number) => {
    if (rows.length < 2) return null;
    const header = rows[0];
    const body = rows.slice(2); // Skip separator row
    
    return (
      <div key={key} className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              {header.map((h, idx) => <th key={idx}>{parseInline(h)}</th>)}
            </tr>
          </thead>
          <tbody>
            {body.map((row, rIdx) => (
              <tr key={rIdx}>
                {row.map((cell, cIdx) => <td key={cIdx}>{parseInline(cell)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const parseInline = (text: string): React.ReactNode => {
    // Very basic inline parsing: Bold and Link
    // Split by ** for bold
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>;
      }
      return <span key={index}>{part}</span>;
    });
  };

  return <div className="markdown-content">{renderContent(content)}</div>;
};

export default MarkdownRenderer;
