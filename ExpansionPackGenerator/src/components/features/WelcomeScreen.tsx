import React from 'react';
import { Package, Sparkles, Code, FolderOpen, Rocket, ExternalLink } from 'lucide-react';
import { Button } from '../ui/button';
import { useExpansionPackStore } from '../../store/expansionPackStore';

interface WelcomeScreenProps {
  onDismiss: () => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onDismiss }) => {
  const addItem = useExpansionPackStore(state => state.addItem);

  const handleGetStarted = () => {
    // Add a sample item to get started
    addItem({
      itemName: "My First Item",
      description: "A custom decorative item",
      baseCost: 100
    });
    onDismiss();
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-4 sm:p-8 max-w-6xl mx-auto overflow-y-auto">
      <div className="text-center mb-6 sm:mb-8">
        <Package className="w-12 h-12 sm:w-16 sm:h-16 text-blue-600 mx-auto mb-4" />
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Welcome to Super Decor Pack Creator</h1>
        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Create custom expansion packs for Super Decor without writing a single line of code!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8 w-full max-w-4xl">
        <FeatureCard
          icon={<Sparkles className="w-6 h-6 sm:w-8 sm:h-8" />}
          title="Visual Editor"
          description="Design items with an intuitive interface. Set properties, configure physics, and define placement rules."
        />
        <FeatureCard
          icon={<Code className="w-6 h-6 sm:w-8 sm:h-8" />}
          title="Automatic Code Generation"
          description="Watch your C# code update in real-time as you make changes. No coding experience required!"
        />
        <FeatureCard
          icon={<FolderOpen className="w-6 h-6 sm:w-8 sm:h-8" />}
          title="Complete Project Export"
          description="Download a ready-to-compile Visual Studio project with all necessary files and build scripts."
        />
        <FeatureCard
          icon={<Rocket className="w-6 h-6 sm:w-8 sm:h-8" />}
          title="Easy Deployment"
          description="Build your pack with one click and copy to BepInEx. Your items appear instantly in-game!"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Button size="lg" onClick={handleGetStarted} className="w-full sm:w-auto">
          <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Get Started
        </Button>
        <Button size="lg" variant="outline" onClick={onDismiss} className="w-full sm:w-auto">
          Start Empty
        </Button>
      </div>

      <div className="p-4 sm:p-6 bg-blue-50 rounded-lg text-sm text-blue-800 max-w-2xl w-full">
        <p className="font-medium mb-2">🎯 Quick Start Tip:</p>
        <p className="text-sm leading-relaxed">
          First, configure your pack settings (bottom left). Then add items and customize their properties. 
          When ready, export the full project and build it with Visual Studio or the included build scripts!
        </p>
      </div>

      <div className="mt-4 text-xs sm:text-sm text-gray-500 text-center">
        <p>
          Compatible with Super Decor API v1.2.0 • 
          <a 
            href="https://github.com/leptoon/superdecormod" 
            className="text-blue-600 hover:underline inline-flex items-center ml-1 sm:ml-2"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </p>
      </div>
    </div>
  );
};

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => {
  return (
    <div className="p-4 sm:p-6 bg-gray-50 rounded-lg">
      <div className="text-blue-600 mb-3">{icon}</div>
      <h3 className="font-semibold text-base sm:text-lg mb-2">{title}</h3>
      <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
};
