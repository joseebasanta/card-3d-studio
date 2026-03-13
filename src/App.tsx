import { ImageUploader } from './components/LeftPanel/ImageUploader';
import { ShotPresets } from './components/LeftPanel/ShotPresets';
import { BackgroundPicker } from './components/LeftPanel/BackgroundPicker';
import { Scene } from './components/Viewport/Scene';
import { MaterialControls } from './components/RightPanel/MaterialControls';
import { LightingControls } from './components/RightPanel/LightingControls';
import { KeyDirectionPad } from './components/RightPanel/KeyDirectionPad';
import { EffectsToggles } from './components/RightPanel/EffectsToggles';
import { ExportControls } from './components/RightPanel/ExportControls';

function Divider() {
  return <div className="h-px bg-white/[0.06] mx-1" />;
}

export default function App() {
  return (
    <div className="h-screen w-screen flex bg-[#080808] text-white overflow-hidden">
      {/* Left Panel */}
      <aside className="w-[248px] min-w-[248px] border-r border-white/[0.08] panel-glass flex flex-col">
        <div className="px-5 py-4 border-b border-white/[0.08]">
          <h1 className="text-[13px] font-semibold tracking-[0.15em] uppercase text-white">
            Card Studio
          </h1>
          <p className="text-[10px] text-white/30 mt-0.5 tracking-wide">3D render engine</p>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6 scrollbar-thin">
          <ImageUploader />
          <Divider />
          <ShotPresets />
          <Divider />
          <BackgroundPicker />
        </div>
      </aside>

      {/* Center Viewport */}
      <main className="flex-1 relative">
        <Scene />
      </main>

      {/* Right Panel */}
      <aside className="w-[280px] min-w-[280px] border-l border-white/[0.08] panel-glass flex flex-col">
        <div className="px-5 py-4 border-b border-white/[0.08]">
          <h2 className="text-[11px] font-semibold tracking-[0.15em] uppercase text-white/60">
            Controls
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6 scrollbar-thin">
          <MaterialControls />
          <Divider />
          <LightingControls />
          <Divider />
          <KeyDirectionPad />
          <Divider />
          <EffectsToggles />
          <Divider />
          <ExportControls />
        </div>
      </aside>
    </div>
  );
}
