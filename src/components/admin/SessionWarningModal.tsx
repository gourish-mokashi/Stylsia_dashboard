import { AlertTriangle, X } from "lucide-react";
import Button from "../ui/Button";

interface SessionWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeLeft: number;
  onExtend: () => void;
}

export default function SessionWarningModal({
  isOpen,
  onClose,
  timeLeft,
  onExtend,
}: SessionWarningModalProps) {
  if (!isOpen) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-full p-4 text-center">
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" />

        <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 max-w-md w-full p-6 transform transition-all">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                Session Expiring Soon
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Your admin session will expire in{" "}
                <span className="font-semibold text-amber-600">
                  {minutes}:{seconds.toString().padStart(2, "0")}
                </span>
                . Would you like to extend your session?
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={onExtend}
                  size="sm"
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 text-white"
                >
                  Extend Session
                </Button>
                <Button
                  onClick={onClose}
                  variant="outline"
                  size="sm"
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  Sign Out
                </Button>
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
