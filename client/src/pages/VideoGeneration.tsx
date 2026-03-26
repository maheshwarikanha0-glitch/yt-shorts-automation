import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Volume2,
  Video,
  Loader2,
  Download,
  Share2,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

interface VoiceOverSettings {
  voiceType: "male" | "female";
  voiceAccent: string;
  voiceTone: string;
}

interface VideoGenerationState {
  step: "voice-over" | "video-generation" | "complete";
  voiceOverUrl?: string;
  videoUrl?: string;
  isGenerating: boolean;
  progress: number;
}

export default function VideoGeneration() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [state, setState] = useState<VideoGenerationState>({
    step: "voice-over",
    isGenerating: false,
    progress: 0,
  });

  const [voiceSettings, setVoiceSettings] = useState<VoiceOverSettings>({
    voiceType: "female",
    voiceAccent: "American",
    voiceTone: "energetic",
  });

  const handleGenerateVoiceOver = async () => {
    setState((prev) => ({ ...prev, isGenerating: true, progress: 0 }));

    try {
      // Simulate voice-over generation
      for (let i = 0; i <= 100; i += 10) {
        setState((prev) => ({ ...prev, progress: i }));
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      setState((prev) => ({
        ...prev,
        voiceOverUrl: "https://example.com/voice-over.mp3",
        step: "video-generation",
        progress: 100,
      }));

      toast.success("Voice-over generated successfully!");
    } catch (error) {
      toast.error("Failed to generate voice-over");
    } finally {
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const handleGenerateVideo = async () => {
    setState((prev) => ({ ...prev, isGenerating: true, progress: 0 }));

    try {
      // Simulate video generation
      for (let i = 0; i <= 100; i += 5) {
        setState((prev) => ({ ...prev, progress: i }));
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      setState((prev) => ({
        ...prev,
        videoUrl: "https://example.com/short.mp4",
        step: "complete",
        progress: 100,
      }));

      toast.success("Video generated successfully!");
    } catch (error) {
      toast.error("Failed to generate video");
    } finally {
      setState((prev) => ({ ...prev, isGenerating: false }));
    }
  };

  const handleDownload = () => {
    if (state.videoUrl) {
      window.open(state.videoUrl, "_blank");
      toast.success("Download started!");
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ${
        isDarkMode ? "bg-[#0a0a0a] text-zinc-100" : "bg-[#fcfcfc] text-zinc-900"
      }`}
    >
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button className={`flex items-center gap-2 mb-4 font-bold ${isDarkMode ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"}`}>
            <ArrowLeft size={20} />
            Back
          </button>
          <h1 className="text-4xl font-black mb-2">Video Generation</h1>
          <p className={isDarkMode ? "text-zinc-500" : "text-zinc-400"}>
            Generate voice-overs and compile your YouTube Short
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 flex gap-4">
          <div
            className={`flex-1 p-4 rounded-lg text-center font-bold transition-all ${
              state.step === "voice-over" || state.step === "video-generation" || state.step === "complete"
                ? isDarkMode
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-500 text-white"
                : isDarkMode
                  ? "bg-zinc-800 text-zinc-400"
                  : "bg-zinc-200 text-zinc-600"
            }`}
          >
            <Volume2 size={20} className="mx-auto mb-2" />
            Voice-Over
          </div>
          <div
            className={`flex-1 p-4 rounded-lg text-center font-bold transition-all ${
              state.step === "video-generation" || state.step === "complete"
                ? isDarkMode
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-500 text-white"
                : isDarkMode
                  ? "bg-zinc-800 text-zinc-400"
                  : "bg-zinc-200 text-zinc-600"
            }`}
          >
            <Video size={20} className="mx-auto mb-2" />
            Video
          </div>
          <div
            className={`flex-1 p-4 rounded-lg text-center font-bold transition-all ${
              state.step === "complete"
                ? isDarkMode
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-500 text-white"
                : isDarkMode
                  ? "bg-zinc-800 text-zinc-400"
                  : "bg-zinc-200 text-zinc-600"
            }`}
          >
            <CheckCircle size={20} className="mx-auto mb-2" />
            Complete
          </div>
        </div>

        {/* Voice-Over Generation */}
        {state.step === "voice-over" && (
          <Card
            className={`p-8 rounded-2xl mb-8 ${
              isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Volume2 size={24} className="text-indigo-500" />
              Generate Voice-Over
            </h2>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                  Voice Type
                </label>
                <select
                  value={voiceSettings.voiceType}
                  onChange={(e) => setVoiceSettings((prev) => ({ ...prev, voiceType: e.target.value as "male" | "female" }))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? "bg-zinc-800 border-zinc-700 text-white"
                      : "bg-zinc-100 border-zinc-300 text-zinc-900"
                  }`}
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                  Accent
                </label>
                <select
                  value={voiceSettings.voiceAccent}
                  onChange={(e) => setVoiceSettings((prev) => ({ ...prev, voiceAccent: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? "bg-zinc-800 border-zinc-700 text-white"
                      : "bg-zinc-100 border-zinc-300 text-zinc-900"
                  }`}
                >
                  <option value="American">American</option>
                  <option value="British">British</option>
                  <option value="Australian">Australian</option>
                  <option value="Indian">Indian</option>
                </select>
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                  Tone
                </label>
                <select
                  value={voiceSettings.voiceTone}
                  onChange={(e) => setVoiceSettings((prev) => ({ ...prev, voiceTone: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? "bg-zinc-800 border-zinc-700 text-white"
                      : "bg-zinc-100 border-zinc-300 text-zinc-900"
                  }`}
                >
                  <option value="neutral">Neutral</option>
                  <option value="energetic">Energetic</option>
                  <option value="calm">Calm</option>
                  <option value="professional">Professional</option>
                </select>
              </div>

              {state.isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating voice-over...</span>
                    <span>{state.progress}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-zinc-800" : "bg-zinc-200"}`}>
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateVoiceOver}
                disabled={state.isGenerating}
                className="w-full py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                {state.isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Volume2 size={18} className="mr-2" />
                    Generate Voice-Over
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Video Generation */}
        {(state.step === "video-generation" || state.step === "complete") && (
          <Card
            className={`p-8 rounded-2xl mb-8 ${
              isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Video size={24} className="text-indigo-500" />
              Compile Video
            </h2>

            <div className="space-y-6">
              <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"}`}>
                <p className="text-sm font-semibold mb-2">What's included:</p>
                <ul className="space-y-1 text-sm">
                  <li>✓ AI-generated script narration</li>
                  <li>✓ Scene transitions and visual effects</li>
                  <li>✓ Background music (royalty-free)</li>
                  <li>✓ Captions and hashtags overlay</li>
                </ul>
              </div>

              {state.isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Compiling video...</span>
                    <span>{state.progress}%</span>
                  </div>
                  <div className={`w-full h-2 rounded-full overflow-hidden ${isDarkMode ? "bg-zinc-800" : "bg-zinc-200"}`}>
                    <div
                      className="h-full bg-indigo-500 transition-all duration-300"
                      style={{ width: `${state.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateVideo}
                disabled={state.isGenerating || !state.voiceOverUrl}
                className="w-full py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold disabled:opacity-50"
              >
                {state.isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Compiling...
                  </>
                ) : (
                  <>
                    <Video size={18} className="mr-2" />
                    Compile Video
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* Completion */}
        {state.step === "complete" && (
          <Card
            className={`p-8 rounded-2xl mb-8 ${
              isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <div className="text-center">
              <CheckCircle size={48} className="mx-auto mb-4 text-green-500" />
              <h2 className="text-2xl font-bold mb-2">Video Ready!</h2>
              <p className={`mb-6 ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                Your YouTube Short is ready to download and publish
              </p>

              <div className="space-y-3">
                <Button
                  onClick={handleDownload}
                  className="w-full py-3 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white font-bold flex items-center justify-center"
                >
                  <Download size={18} className="mr-2" />
                  Download Video
                </Button>

                <Button
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center ${
                    isDarkMode
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                      : "bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
                  }`}
                >
                  <Share2 size={18} className="mr-2" />
                  Schedule Publishing
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Info Box */}
        <Card
          className={`p-6 rounded-2xl border-l-4 border-l-blue-500 ${
            isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-blue-50 border-zinc-200"
          }`}
        >
          <div className="flex gap-4">
            <AlertCircle size={20} className="text-blue-500 shrink-0 mt-1" />
            <div>
              <h3 className="font-bold mb-2">Pro Tips</h3>
              <ul className="space-y-1 text-sm">
                <li>• Use energetic tones for motivational content</li>
                <li>• Professional tone works best for educational videos</li>
                <li>• Test different accents to find what resonates with your audience</li>
                <li>• Download and review before publishing</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
