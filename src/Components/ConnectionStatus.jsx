import React from 'react';
import { Loader2 } from 'lucide-react';

const ConnectionStatus = ({ isOnline, pendingCount, syncing }) => {
  return (
    <div className="flex items-center gap-3 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            isOnline
              ? 'animate-pulse bg-green-500 shadow-[0_0_6px_#22c55e]'
              : 'bg-red-500 shadow-[0_0_6px_#ef4444]'
          }`}
        />
        <span className="font-medium">{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      {pendingCount > 0 && (
        <div className="flex items-center gap-1.5 rounded-full bg-orange-500 px-2 py-0.5 text-xs font-semibold text-white">
          {syncing && <Loader2 size={11} className="animate-spin" />}
          {syncing ? 'Syncing...' : `${pendingCount} pending`}
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;