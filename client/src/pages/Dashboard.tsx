import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Zap,
  Sparkles,
  Loader2,
  Type,
  Video,
  Image as ImageIcon,
  AlignLeft,
  Copy,
  Check,
  Moon,
  Sun,
  Plus,
  History,
  Settings,
  MessageSquare,
  Archive,
  Share2,
  Twitter,
  Linkedin,
  Facebook,
  Link2,
  Menu,
  X,
  ChevronRight,
  Volume2,
  Clock,
  BarChart3,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";

interface GenerationResult {
  hook: string;
  script: string;
  title: string;
  hashtags: string[];
  scenes: Array<{ time: string; visual: string }>;
  imagePrompts: string[];
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form state
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("Motivational");
  const [duration, setDuration] = useState("30s");

  // Voice settings state
  const [voiceType, setVoiceType] = useState("female");
  const [voiceAccent, setVoiceAccent] = useState("American");
  const [voiceTone, setVoiceTone] = useState("energetic");

  // Results state
  const [result, setResult] = useState<GenerationResult | null>(null);

  // Queries
  const { data: history } = trpc.history.list.useQuery();
  const { data: voiceSettings } = trpc.voiceSettings.get.useQuery();
  const { data: stockResources } = trpc.generation.getStockResources.useQuery(
    { id: 1 },
    { enabled: false }
  );

  // Mutations
  const generateMutation = trpc.generation.generate.useMutation();
  const updateVoiceSettingsMutation = trpc.voiceSettings.update.useMutation();

  // Initialize voice settings
  useEffect(() => {
    if (voiceSettings) {
      setVoiceType(voiceSettings.defaultVoiceType || "female");
      setVoiceAccent(voiceSettings.defaultVoiceAccent || "American");
      setVoiceTone(voiceSettings.defaultVoiceTone || "energetic");
    }
  }, [voiceSettings]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await generateMutation.mutateAsync({
        topic,
        tone: tone as "Motivational" | "Educational" | "Storytelling",
        duration: duration as "30s" | "60s",
      });
      setResult(response);
      toast.success("Content generated successfully!");
    } catch (error) {
      toast.error("Failed to generate content");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewChat = () => {
    setTopic("");
    setResult(null);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const copyToClipboard = (text: string, field: string) => {
    const el = document.createElement("textarea");
    el.value = typeof text === "object" ? JSON.stringify(text, null, 2) : text;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    setCopiedField(field);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = (platform: string) => {
    setShowShareMenu(false);
    toast.info(`Share to ${platform} coming soon!`);
  };

  const handleUpdateVoiceSettings = async () => {
    try {
      await updateVoiceSettingsMutation.mutateAsync({
        defaultVoiceType: voiceType as "male" | "female",
        defaultVoiceAccent: voiceAccent,
        defaultVoiceTone: voiceTone,
      });
      toast.success("Voice settings updated!");
    } catch (error) {
      toast.error("Failed to update voice settings");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className={`flex h-screen overflow-hidden transition-colors duration-700 ${
        isDarkMode ? "bg-[#0a0a0a] text-zinc-100" : "bg-[#fcfcfc] text-zinc-900"
      }`}
    >
      {/* SIDEBAR */}
      <aside
        className={`flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out z-20 ${
          isSidebarOpen ? "w-[280px] lg:w-[320px] opacity-100" : "w-0 opacity-0 pointer-events-none"
        } ${isDarkMode ? "bg-[#111111] border-zinc-800" : "bg-[#f5f5f5] border-zinc-200"} border-r`}
      >
        <div className="w-[280px] lg:w-[320px] h-full flex flex-col p-4">
          {/* New Generation Button */}
          <div className="mb-6 pt-2 px-2">
            <button
              onClick={handleNewChat}
              className={`w-full py-3.5 px-4 rounded-full flex items-center gap-3 transition-all active:scale-95 ${
                isDarkMode
                  ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                  : "bg-white hover:bg-zinc-100 text-zinc-900 shadow-sm border border-zinc-200"
              }`}
            >
              <Zap size={18} className="text-indigo-500" />
              <span className="font-bold text-sm tracking-wide">New Generation</span>
              <Plus size={18} className="ml-auto opacity-50" />
            </button>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-1 px-2">
              <h4
                className={`text-xs font-black px-3 mb-2 uppercase tracking-wider ${
                  isDarkMode ? "text-zinc-600" : "text-zinc-400"
                }`}
              >
                Recent Generations
              </h4>
              {history && history.length > 0 ? (
                history.slice(0, 10).map((item, i) => (
                  <button
                    key={i}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium truncate transition-colors ${
                      isDarkMode ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-zinc-200 text-zinc-700"
                    }`}
                  >
                    <MessageSquare size={14} className="inline mr-2 opacity-40" />
                    {item.title}
                  </button>
                ))
              ) : (
                <p className={`text-xs px-3 py-2 ${isDarkMode ? "text-zinc-600" : "text-zinc-400"}`}>
                  No generations yet
                </p>
              )}
            </div>
          </div>

          {/* Bottom Actions */}
          <div
            className={`mt-auto pt-4 space-y-1 px-2 border-t ${
              isDarkMode ? "border-zinc-800" : "border-zinc-200"
            }`}
          >
            <button
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                isDarkMode ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-zinc-200 text-zinc-700"
              }`}
            >
              <Archive size={18} className="opacity-70" />
              <span className="text-sm font-bold">My Generations</span>
            </button>
            <div
              className={`flex items-center gap-3 px-3 py-3 rounded-xl cursor-pointer ${
                isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-200"
              }`}
            >
              <div className="w-7 h-7 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-black text-white">
                {user?.name?.charAt(0) || "U"}
              </div>
              <p className="text-sm font-bold truncate flex-1">{user?.name || "User"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen min-w-0 relative">
        {/* HEADER */}
        <header
          className={`h-16 shrink-0 flex items-center justify-between px-4 lg:px-8 transition-colors duration-700 ${
            isDarkMode ? "bg-[#0a0a0a]" : "bg-[#fcfcfc]"
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-200 text-zinc-600"
              }`}
            >
              <Menu size={22} />
            </button>
            <span className={`text-lg font-black tracking-tight hidden sm:block ${isDarkMode ? "text-zinc-200" : "text-zinc-800"}`}>
              CreatorOS
            </span>
          </div>

          <div className="flex items-center gap-2 lg:gap-4 relative">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors ${
                isDarkMode ? "hover:bg-zinc-800 text-zinc-400" : "hover:bg-zinc-200 text-zinc-600"
              }`}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Share Menu */}
            <div className="relative">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm border ${
                  isDarkMode
                    ? "bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200"
                    : "bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-800"
                }`}
              >
                <Share2 size={16} />
                <span className="hidden sm:block">Share</span>
              </button>

              {showShareMenu && (
                <div
                  className={`absolute right-0 top-full mt-2 w-56 rounded-2xl shadow-2xl border overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ${
                    isDarkMode ? "bg-zinc-900 border-zinc-800" : "bg-white border-zinc-100"
                  }`}
                >
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => handleShare("X")}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                      }`}
                    >
                      <Twitter size={16} />
                      Share on X
                    </button>
                    <button
                      onClick={() => handleShare("LinkedIn")}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                      }`}
                    >
                      <Linkedin size={16} />
                      Share on LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare("Facebook")}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                      }`}
                    >
                      <Facebook size={16} />
                      Share on Facebook
                    </button>
                    <div className={`my-1 border-t ${isDarkMode ? "border-zinc-800" : "border-zinc-100"}`}></div>
                    <button
                      onClick={() => handleShare("Link")}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                        isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                      }`}
                    >
                      <Link2 size={16} />
                      Copy public link
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            <button className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white shadow-sm bg-indigo-500">
              {user?.name?.charAt(0) || "U"}
            </button>
          </div>
        </header>

        {/* WORKSPACE CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8 relative">
          <div className={`mx-auto transition-all duration-300 ${isSidebarOpen ? "max-w-3xl" : "max-w-4xl"}`}>
            {/* Empty State */}
            {!result && (
              <div className="text-center mb-16 mt-10 lg:mt-20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
                  <Sparkles size={28} className="text-white" />
                </div>
                <h1
                  className={`text-4xl lg:text-5xl font-black tracking-tight mb-4 ${
                    isDarkMode ? "text-white" : "text-zinc-900"
                  }`}
                >
                  Hello, {user?.name?.split(" ")[0] || "Creator"}
                </h1>
                <p
                  className={`text-xl font-medium max-w-xl mx-auto leading-relaxed ${
                    isDarkMode ? "text-zinc-500" : "text-zinc-400"
                  }`}
                >
                  What viral content are we building today?
                </p>
              </div>
            )}

            {/* Input Section */}
            <div
              className={`mx-auto mb-16 rounded-[2rem] p-3 transition-all duration-500 ${
                isDarkMode ? "bg-[#1a1a1a] border border-zinc-800 shadow-2xl" : "bg-white border border-zinc-200 shadow-xl shadow-zinc-200/50"
              }`}
            >
              <div className="px-4 py-2">
                <textarea
                  rows={result ? 2 : 3}
                  placeholder="Enter a topic (e.g. 'Philosophy for modern life')..."
                  className={`w-full bg-transparent border-none resize-none focus:ring-0 text-lg lg:text-xl font-semibold placeholder:text-zinc-400 ${
                    isDarkMode ? "text-white" : "text-zinc-900"
                  }`}
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />

                {/* Options */}
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 mt-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-bold border ${
                        isDarkMode
                          ? "bg-zinc-800 border-zinc-700 text-white"
                          : "bg-zinc-100 border-zinc-300 text-zinc-900"
                      }`}
                    >
                      <option>Motivational</option>
                      <option>Educational</option>
                      <option>Storytelling</option>
                    </select>

                    <select
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className={`px-3 py-2 rounded-lg text-sm font-bold border ${
                        isDarkMode
                          ? "bg-zinc-800 border-zinc-700 text-white"
                          : "bg-zinc-100 border-zinc-300 text-zinc-900"
                      }`}
                    >
                      <option>30s</option>
                      <option>60s</option>
                    </select>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating || !topic.trim()}
                    className={`rounded-full w-12 h-12 flex items-center justify-center transition-all active:scale-95 disabled:opacity-30 ${
                      topic.trim()
                        ? isDarkMode
                          ? "bg-white text-black hover:bg-zinc-100"
                          : "bg-zinc-900 text-white hover:bg-black"
                        : isDarkMode
                          ? "bg-zinc-800 text-zinc-600"
                          : "bg-zinc-200 text-zinc-400"
                    }`}
                  >
                    {isGenerating ? <Loader2 size={20} className="animate-spin" /> : <Zap size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Settings Section */}
            {!result && (
              <Card
                className={`mb-8 p-6 rounded-2xl ${
                  isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Volume2 size={20} className="text-indigo-500" />
                  <h3 className="text-lg font-bold">Voice Settings</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                      Voice Type
                    </label>
                    <select
                      value={voiceType}
                      onChange={(e) => setVoiceType(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
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
                      value={voiceAccent}
                      onChange={(e) => setVoiceAccent(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
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
                      value={voiceTone}
                      onChange={(e) => setVoiceTone(e.target.value)}
                      className={`w-full px-3 py-2 rounded-lg border ${
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
                </div>

                <button
                  onClick={handleUpdateVoiceSettings}
                  className="mt-4 px-4 py-2 rounded-lg bg-indigo-500 text-white font-bold hover:bg-indigo-600 transition-colors"
                >
                  Save Voice Settings
                </button>
              </Card>
            )}

            {/* Results Section */}
            {result && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 pb-32">
                {/* Hook Card */}
                <Card
                  className={`p-6 rounded-2xl ${
                    isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Zap size={18} className="text-indigo-500" />
                      <h3 className="text-sm font-black uppercase tracking-wider">Master Hook</h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.hook, "hook")}
                      className={`p-2 rounded-lg transition-colors ${
                        copiedField === "hook"
                          ? "bg-green-500 text-white"
                          : isDarkMode
                            ? "hover:bg-zinc-800"
                            : "hover:bg-zinc-100"
                      }`}
                    >
                      {copiedField === "hook" ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-2xl font-black italic leading-tight">"{result.hook}"</p>
                </Card>

                {/* Title & SEO Card */}
                <Card
                  className={`p-6 rounded-2xl ${
                    isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Type size={18} className="text-indigo-500" />
                      <h3 className="text-sm font-black uppercase tracking-wider">Title & SEO</h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.title, "title")}
                      className={`p-2 rounded-lg transition-colors ${
                        copiedField === "title"
                          ? "bg-green-500 text-white"
                          : isDarkMode
                            ? "hover:bg-zinc-800"
                            : "hover:bg-zinc-100"
                      }`}
                    >
                      {copiedField === "title" ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-xl font-bold mb-4">{result.title}</p>
                  <div className="flex flex-wrap gap-2">
                    {result.hashtags.map((h, i) => (
                      <span
                        key={i}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-widest ${
                          isDarkMode ? "bg-zinc-800 border-zinc-700" : "bg-zinc-50 border-zinc-200"
                        }`}
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </Card>

                {/* Script Card */}
                <Card
                  className={`p-6 rounded-2xl ${
                    isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <AlignLeft size={18} className="text-indigo-500" />
                      <h3 className="text-sm font-black uppercase tracking-wider">Narrative Script</h3>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.script, "script")}
                      className={`p-2 rounded-lg transition-colors ${
                        copiedField === "script"
                          ? "bg-green-500 text-white"
                          : isDarkMode
                            ? "hover:bg-zinc-800"
                            : "hover:bg-zinc-100"
                      }`}
                    >
                      {copiedField === "script" ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                  <p className="text-lg leading-relaxed whitespace-pre-wrap font-medium">{result.script}</p>
                </Card>

                {/* Scenes & Prompts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Scenes Card */}
                  <Card
                    className={`p-6 rounded-2xl ${
                      isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Video size={18} className="text-indigo-500" />
                        <h3 className="text-sm font-black uppercase tracking-wider">Visual Breakdown</h3>
                      </div>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(result.scenes), "scenes")}
                        className={`p-2 rounded-lg transition-colors ${
                          copiedField === "scenes"
                            ? "bg-green-500 text-white"
                            : isDarkMode
                              ? "hover:bg-zinc-800"
                              : "hover:bg-zinc-100"
                        }`}
                      >
                        {copiedField === "scenes" ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="space-y-4">
                      {result.scenes.map((s, i) => (
                        <div
                          key={i}
                          className={`flex gap-4 p-3 rounded-xl ${
                            isDarkMode ? "bg-black/5" : "bg-white/5"
                          }`}
                        >
                          <span className="text-[11px] font-black text-indigo-500 shrink-0 pt-0.5 tracking-tighter">
                            {s.time}
                          </span>
                          <p className="text-sm font-semibold leading-relaxed">{s.visual}</p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Image Prompts Card */}
                  <Card
                    className={`p-6 rounded-2xl ${
                      isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <ImageIcon size={18} className="text-indigo-500" />
                        <h3 className="text-sm font-black uppercase tracking-wider">AI Image Prompts</h3>
                      </div>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(result.imagePrompts), "prompts")}
                        className={`p-2 rounded-lg transition-colors ${
                          copiedField === "prompts"
                            ? "bg-green-500 text-white"
                            : isDarkMode
                              ? "hover:bg-zinc-800"
                              : "hover:bg-zinc-100"
                        }`}
                      >
                        {copiedField === "prompts" ? <Check size={16} /> : <Copy size={16} />}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {result.imagePrompts.map((p, i) => (
                        <div
                          key={i}
                          className={`p-4 rounded-xl border text-[12px] font-semibold italic ${
                            isDarkMode ? "bg-[#111] border-zinc-800 text-zinc-400" : "bg-zinc-50 border-zinc-200 text-zinc-600"
                          }`}
                        >
                          {p}
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Free Stock Resources */}
                <Card
                  className={`p-6 rounded-2xl ${
                    isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <ImageIcon size={18} className="text-indigo-500" />
                    <h3 className="text-sm font-black uppercase tracking-wider">Free Stock Resources</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Video Resources */}
                    <div>
                      <h4 className="font-bold mb-3 text-indigo-500">Free Videos</h4>
                      <div className="space-y-2">
                        <a
                          href="https://www.pexels.com/videos"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-2 rounded-lg text-sm font-semibold hover:underline ${
                            isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                          }`}
                        >
                          Pexels Videos
                        </a>
                        <a
                          href="https://pixabay.com/videos"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-2 rounded-lg text-sm font-semibold hover:underline ${
                            isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                          }`}
                        >
                          Pixabay Videos
                        </a>
                        <a
                          href="https://unsplash.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-2 rounded-lg text-sm font-semibold hover:underline ${
                            isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                          }`}
                        >
                          Unsplash
                        </a>
                      </div>
                    </div>

                    {/* Image Resources */}
                    <div>
                      <h4 className="font-bold mb-3 text-indigo-500">Free Images</h4>
                      <div className="space-y-2">
                        <a
                          href="https://www.pexels.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-2 rounded-lg text-sm font-semibold hover:underline ${
                            isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                          }`}
                        >
                          Pexels
                        </a>
                        <a
                          href="https://pixabay.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-2 rounded-lg text-sm font-semibold hover:underline ${
                            isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                          }`}
                        >
                          Pixabay
                        </a>
                        <a
                          href="https://unsplash.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-2 rounded-lg text-sm font-semibold hover:underline ${
                            isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                          }`}
                        >
                          Unsplash
                        </a>
                      </div>
                    </div>

                    {/* Music Resources */}
                    <div>
                      <h4 className="font-bold mb-3 text-indigo-500">Free Music</h4>
                      <div className="space-y-2">
                        <a
                          href="https://pixabay.com/music"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-2 rounded-lg text-sm font-semibold hover:underline ${
                            isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                          }`}
                        >
                          Pixabay Music
                        </a>
                        <a
                          href="https://www.pexels.com/search/music"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-2 rounded-lg text-sm font-semibold hover:underline ${
                            isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                          }`}
                        >
                          Pexels Music
                        </a>
                        <a
                          href="https://www.youtube.com/audiolibrary"
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`block p-2 rounded-lg text-sm font-semibold hover:underline ${
                            isDarkMode ? "hover:bg-zinc-800" : "hover:bg-zinc-100"
                          }`}
                        >
                          YouTube Audio
                        </a>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleNewChat}
                    className={`px-6 py-3 rounded-lg font-bold transition-colors ${
                      isDarkMode
                        ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                        : "bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
                    }`}
                  >
                    Generate Another
                  </button>
                  <button
                    className={`px-6 py-3 rounded-lg font-bold transition-colors flex items-center gap-2 ${
                      isDarkMode
                        ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : "bg-indigo-500 hover:bg-indigo-600 text-white"
                    }`}
                  >
                    <Volume2 size={18} />
                    Generate Voice-Over
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
