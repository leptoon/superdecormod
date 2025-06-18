import React, { useEffect, useState, useRef } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { useExpansionPackStore } from '../../store/expansionPackStore';
import { CodeGenerator } from '../../services/codeGenerator';
import { Button } from '../ui/button';
import hljs from 'highlight.js/lib/core';
import csharp from 'highlight.js/lib/languages/csharp';
import 'highlight.js/styles/github-dark.css';

// Register C# language
hljs.registerLanguage('csharp', csharp);

export const CodePreview: React.FC = () => {
  const pack = useExpansionPackStore(state => state.pack);
  const [code, setCode] = useState('');
  const [highlightedCode, setHighlightedCode] = useState('');
  const [copied, setCopied] = useState(false);
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generator = new CodeGenerator();
    generator.setCurrentPack(pack);
    const generatedCode = generator.generateExpansionPack(pack);
    setCode(generatedCode);

    // Highlight the code
    const highlighted = hljs.highlight(generatedCode, { language: 'csharp' }).value;
    setHighlightedCode(highlighted);
  }, [pack]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${pack.pluginId.replace(/\./g, '_')}.cs`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  const lines = code.split('\n');

  return (
    <div 
      style={{ 
        height: 'calc(100vh - 64px)', // Account for header height
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#111827'
      }}
    >
      {/* Header */}
      <div 
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px',
          borderBottom: '1px solid #374151',
          backgroundColor: '#111827',
          flexShrink: 0,
          height: '64px'
        }}
      >
        <h3 style={{ color: 'white', margin: 0, fontWeight: 500 }}>Generated Code</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExport}
            className="text-gray-300 hover:text-white hover:bg-gray-800"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Code Content */}
      <div 
        style={{
          height: 'calc(100vh - 128px)', // Fixed height calculation
          display: 'flex',
          overflow: 'hidden'
        }}
      >
        {/* Line Numbers */}
        <div
          ref={lineNumbersRef}
          style={{
            width: '60px',
            backgroundColor: '#0f172a',
            color: '#6b7280',
            fontSize: '14px',
            fontFamily: 'ui-monospace, SFMono-Regular, Monaco, Consolas, monospace',
            padding: '16px 8px',
            textAlign: 'right',
            borderRight: '1px solid #374151',
            overflow: 'hidden',
            userSelect: 'none',
            flexShrink: 0
          }}
        >
          {lines.map((_, index) => (
            <div 
              key={index + 1}
              style={{ 
                lineHeight: '21px',
                height: '21px'
              }}
            >
              {index + 1}
            </div>
          ))}
        </div>

        {/* Code Area */}
        <div
          ref={codeRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowX: 'scroll',
            overflowY: 'scroll',
            backgroundColor: '#1f2937'
          }}
        >
          <pre
            style={{
              margin: 0,
              padding: '16px',
              fontSize: '14px',
              lineHeight: '21px',
              fontFamily: 'ui-monospace, SFMono-Regular, Monaco, Consolas, monospace',
              color: 'white',
              backgroundColor: 'transparent',
              whiteSpace: 'pre',
              minWidth: '1000px',
              minHeight: '100%'
            }}
          >
            <code
              className="hljs language-csharp"
              style={{
                backgroundColor: 'transparent',
                color: 'inherit'
              }}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </div>
      </div>
    </div>
  );
};
