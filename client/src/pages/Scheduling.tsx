import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Clock,
  Calendar,
  CheckCircle,
  AlertCircle,
  Trash2,
  ArrowLeft,
  BarChart3,
  Send,
  Loader2,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface ScheduledShort {
  id: number;
  title?: string;
  scheduledTime: Date;
  status: "scheduled" | "published" | "failed" | null;
  youtubeVideoId?: string | null;
  views?: number;
  likes?: number;
}

export default function Scheduling() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const [scheduled, setScheduled] = useState<ScheduledShort[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    scheduledTime: new Date().toISOString().slice(0, 16),
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Queries
  const { data: scheduledShorts } = trpc.scheduling.list.useQuery();

  // Mutations
  const scheduleMutation = trpc.scheduling.schedule.useMutation();
  const updateStatusMutation = trpc.scheduling.updateStatus.useMutation();

  const handleSchedule = async () => {
    if (!formData.title || !formData.scheduledTime) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await scheduleMutation.mutateAsync({
        generationId: 1, // In real app, this would be the selected generation
        scheduledTime: new Date(formData.scheduledTime),
      });

      toast.success("Short scheduled successfully!");
      setShowForm(false);
      setFormData({ title: "", scheduledTime: new Date().toISOString().slice(0, 16) });
    } catch (error) {
      toast.error("Failed to schedule short");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublishNow = async (id: number) => {
    try {
      await updateStatusMutation.mutateAsync({
        id,
        status: "published",
      });
      toast.success("Short published to YouTube!");
    } catch (error) {
      toast.error("Failed to publish short");
    }
  };

  const handleDelete = (id: number) => {
    toast.info("Delete functionality coming soon");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "text-green-500";
      case "scheduled":
        return "text-blue-500";
      case "failed":
        return "text-red-500";
      default:
        return "text-zinc-500";
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case "published":
        return isDarkMode ? "bg-green-500/10" : "bg-green-50";
      case "scheduled":
        return isDarkMode ? "bg-blue-500/10" : "bg-blue-50";
      case "failed":
        return isDarkMode ? "bg-red-500/10" : "bg-red-50";
      default:
        return isDarkMode ? "bg-zinc-800" : "bg-zinc-100";
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-700 ${
        isDarkMode ? "bg-[#0a0a0a] text-zinc-100" : "bg-[#fcfcfc] text-zinc-900"
      }`}
    >
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <button className={`flex items-center gap-2 mb-4 font-bold ${isDarkMode ? "text-zinc-400 hover:text-white" : "text-zinc-600 hover:text-zinc-900"}`}>
            <ArrowLeft size={20} />
            Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black mb-2">Publishing Schedule</h1>
              <p className={isDarkMode ? "text-zinc-500" : "text-zinc-400"}>
                Schedule and manage your YouTube Shorts publishing
              </p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-6 py-3 rounded-lg"
            >
              <Clock size={18} className="mr-2" />
              Schedule New
            </Button>
          </div>
        </div>

        {/* Schedule Form */}
        {showForm && (
          <Card
            className={`p-8 rounded-2xl mb-8 ${
              isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
            }`}
          >
            <h2 className="text-2xl font-bold mb-6">Schedule a Short</h2>

            <div className="space-y-6">
              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                  Short Title
                </label>
                <input
                  type="text"
                  placeholder="Enter short title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? "bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
                      : "bg-zinc-100 border-zinc-300 text-zinc-900 placeholder-zinc-400"
                  }`}
                />
              </div>

              <div>
                <label className={`block text-sm font-bold mb-2 ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                  Publish Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData((prev) => ({ ...prev, scheduledTime: e.target.value }))}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    isDarkMode
                      ? "bg-zinc-800 border-zinc-700 text-white"
                      : "bg-zinc-100 border-zinc-300 text-zinc-900"
                  }`}
                />
              </div>

              <div className={`p-4 rounded-lg border ${isDarkMode ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200"}`}>
                <div className="flex gap-2">
                  <AlertCircle size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold mb-1">Best times to publish:</p>
                    <p className="opacity-80">
                      Monday-Friday 8-10 AM and 6-8 PM are optimal for YouTube Shorts engagement.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSchedule}
                  disabled={isSubmitting}
                  className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin mr-2" />
                      Scheduling...
                    </>
                  ) : (
                    <>
                      <Calendar size={18} className="mr-2" />
                      Schedule Short
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowForm(false)}
                  className={`flex-1 font-bold py-3 rounded-lg ${
                    isDarkMode
                      ? "bg-zinc-800 hover:bg-zinc-700 text-white"
                      : "bg-zinc-200 hover:bg-zinc-300 text-zinc-900"
                  }`}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Scheduled Shorts */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Scheduled Shorts</h2>

          {scheduledShorts && scheduledShorts.length > 0 ? (
            scheduledShorts.map((short) => (
              <Card
                key={short.id}
                className={`p-6 rounded-2xl ${
                  isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold">{(short as any).title || "Untitled Short"}</h3>
                      <span
                        className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${getStatusBg(
                          short.status || "scheduled"
                        )} ${getStatusColor(short.status || "scheduled")}`}
                      >
                        {short.status || "scheduled"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="opacity-50" />
                        {new Date(short.scheduledTime).toLocaleString()}
                      </div>

                      {short.status === "published" && (
                        <>
                          <div className="flex items-center gap-2">
                            <BarChart3 size={16} className="opacity-50" />
                            {((short as any).views as number) || 0} views
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} className="opacity-50" />
                            {((short as any).likes as number) || 0} likes
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {short.status === "scheduled" && (
                      <Button
                        onClick={() => handlePublishNow(short.id)}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded-lg"
                      >
                        <Send size={16} className="mr-2" />
                        Publish Now
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(short.id)}
                      className={`font-bold px-4 py-2 rounded-lg ${
                        isDarkMode
                          ? "bg-red-500/10 hover:bg-red-500/20 text-red-400"
                          : "bg-red-50 hover:bg-red-100 text-red-600"
                      }`}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card
              className={`p-12 rounded-2xl text-center ${
                isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
              }`}
            >
              <Clock size={48} className="mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-bold mb-2">No Scheduled Shorts</h3>
              <p className={isDarkMode ? "text-zinc-500" : "text-zinc-400"}>
                Schedule your first YouTube Short to get started
              </p>
            </Card>
          )}
        </div>

        {/* Analytics Preview */}
        <Card
          className={`mt-8 p-8 rounded-2xl ${
            isDarkMode ? "bg-[#1a1a1a] border-zinc-800" : "bg-white border-zinc-200"
          }`}
        >
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 size={24} className="text-indigo-500" />
            Performance Analytics
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-lg ${isDarkMode ? "bg-zinc-800" : "bg-zinc-100"}`}>
              <p className={`text-sm font-bold mb-2 ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                Total Views
              </p>
              <p className="text-3xl font-black">0</p>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? "bg-zinc-800" : "bg-zinc-100"}`}>
              <p className={`text-sm font-bold mb-2 ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                Total Engagement
              </p>
              <p className="text-3xl font-black">0</p>
            </div>

            <div className={`p-4 rounded-lg ${isDarkMode ? "bg-zinc-800" : "bg-zinc-100"}`}>
              <p className={`text-sm font-bold mb-2 ${isDarkMode ? "text-zinc-400" : "text-zinc-600"}`}>
                Avg. Watch Time
              </p>
              <p className="text-3xl font-black">0s</p>
            </div>
          </div>

          <div className={`mt-6 p-4 rounded-lg border ${isDarkMode ? "bg-blue-500/10 border-blue-500/20" : "bg-blue-50 border-blue-200"}`}>
            <p className="text-sm">
              <span className="font-bold">💡 Tip:</span> Analytics update every 24 hours after publishing. Check YouTube Studio for real-time data.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
