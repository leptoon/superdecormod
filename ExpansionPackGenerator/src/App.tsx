import React, { useState } from 'react';
import { useExpansionPackStore } from './store/expansionPackStore';
import { Header } from './components/layout/Header';
import { ItemList } from './components/features/ItemList';
import { ItemEditor } from './components/editor/ItemEditor';
import { CodePreview } from './components/preview/CodePreview';
import { WelcomeScreen } from './components/features/WelcomeScreen';
import { Toaster } from './components/ui/toaster';
import { Button } from './components/ui/button';
import { ChevronLeft, ChevronRight, Code } from 'lucide-react';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isCodePreviewOpen, setIsCodePreviewOpen] = useState(false);
  const selectedItemId = useExpansionPackStore(state => state.selectedItemId);
  const itemCount = useExpansionPackStore(state => state.pack.items.length);

  // Hide welcome screen once user has items
  React.useEffect(() => {
    if (itemCount > 0) {
      setShowWelcome(false);
    }
  }, [itemCount]);

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Item List - Responsive width */}
        <div className="w-80 lg:w-80 md:w-72 sm:w-64 bg-white border-r border-gray-200 flex flex-col flex-shrink-0">
          <ItemList />
        </div>

        {/* Center Panel - Editor or Welcome - Responsive flex */}
        <div className="flex-1 bg-white overflow-hidden min-w-0">
          {showWelcome && itemCount === 0 ? (
            <WelcomeScreen onDismiss={() => setShowWelcome(false)} />
          ) : selectedItemId ? (
            <ItemEditor />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500 p-4">
              <div className="text-center">
                <p className="text-lg mb-2">No item selected</p>
                <p className="text-sm">Select an item from the list or create a new one</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Panel - Code Preview - Collapsible */}
        <div className="relative">
          {/* Toggle Button - Always visible */}
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 z-20">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsCodePreviewOpen(!isCodePreviewOpen)}
              className="rounded-l-md rounded-r-none h-16 w-8 p-0 shadow-lg"
            >
              {isCodePreviewOpen ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <ChevronLeft className="w-4 h-4" />
                  <Code className="w-3 h-3" />
                </div>
              )}
            </Button>
          </div>

          {/* Code Preview Panel */}
          <div className={`bg-gray-900 border-l border-gray-200 flex-shrink-0 transition-all duration-300 ${
            isCodePreviewOpen ? 'w-[500px] lg:w-[500px] md:w-[400px] sm:w-[350px]' : 'w-0'
          }`}>
            <div className={`h-full overflow-hidden ${isCodePreviewOpen ? 'block' : 'hidden'}`}>
              <CodePreview />
            </div>
          </div>
        </div>
      </div>

      <Toaster />
    </div>
  );
}

export default App;
