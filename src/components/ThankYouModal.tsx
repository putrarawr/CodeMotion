import React from 'react';
import { X, Coffee, Share2, Sparkles, CheckCircle2 } from 'lucide-react';
import { SiGithub } from 'react-icons/si';
import { toast } from 'sonner';

interface ThankYouModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
}

export const ThankYouModal: React.FC<ThankYouModalProps> = ({
  isOpen,
  onClose,
  isDark = true,
}) => {
  if (!isOpen) return null;

  const handleShareApp = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'CodeMotion',
          text: 'Check out CodeMotion - Create beautiful animated code snippet videos & graphics instantly!',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('CodeMotion link copied to clipboard!');
      }
    } catch {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('CodeMotion link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-12 sm:pt-16 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md p-6 sm:p-8 mt-6 rounded-3xl border shadow-2xl transition-all animate-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-zinc-950/95 border-zinc-800 text-zinc-100 shadow-purple-950/20'
            : 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-400/30'
        }`}
      >
        {/* Top Close Button */}
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full border transition-all cursor-pointer ${
            isDark
              ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'
              : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-black hover:bg-zinc-200'
          }`}
          title="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4 flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-purple-500/20 to-sky-500/20 border border-amber-500/30 shadow-inner">
            <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 text-black rounded-full shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" />
            </div>
          </div>

          <h3 className="text-xl sm:text-2xl font-bold tracking-tight mb-1.5 font-sans">
            Thank You for Using CodeMotion!
          </h3>
          <p
            className={`text-xs sm:text-sm leading-relaxed mb-6 ${
              isDark ? 'text-zinc-400' : 'text-zinc-600'
            }`}
          >
            Your code snippet has been exported successfully. If CodeMotion helps your workflow, consider supporting the project to keep it 100% free & ad-free!
          </p>

          {/* Action Cards Grid */}
          <div className="w-full flex flex-col gap-2.5 mb-6">
            {/* Primary Saweria / Buy me a coffee link */}
            <a
              href="https://saweria.co/codemotion"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-2 w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all no-underline cursor-pointer"
            >
              <Coffee className="w-4 h-4 text-zinc-950 group-hover:scale-110 transition-transform" />
              <span>Buy me a coffee via Saweria</span>
            </a>

            {/* Grid of GitHub & Share */}
            <div className="grid grid-cols-2 gap-2 w-full">
              <a
                href="https://github.com/putrarawr/CodeMotion"
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all no-underline cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                    : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
                }`}
              >
                <SiGithub className="w-3.5 h-3.5" />
                <span>Star on GitHub</span>
              </a>

              <button
                onClick={handleShareApp}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                  isDark
                    ? 'bg-zinc-900 border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-white'
                    : 'bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200'
                }`}
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Share App</span>
              </button>
            </div>
          </div>

          {/* Dismiss Button */}
          <button
            onClick={onClose}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isDark
                ? 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                : 'bg-zinc-100 border-zinc-200 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
            }`}
          >
            Continue Creating
          </button>
        </div>
      </div>
    </div>
  );
};
