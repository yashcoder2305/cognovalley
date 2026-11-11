'use client';

import React, { useState } from 'react';
import { HousekeepingTicket, TicketState } from '@/types';
import { 
  ClipboardList, 
  Clock, 
  UserCheck, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

interface HousekeepingTrackerProps {
  tickets: HousekeepingTicket[];
  onAssignTicket: (ticketId: string) => void;
  onResolveTicket: (ticketId: string) => void;
}

export const HousekeepingTracker: React.FC<HousekeepingTrackerProps> = ({
  tickets,
  onAssignTicket,
  onResolveTicket,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | TicketState>('ALL');

  const filteredTickets = tickets.filter(
    (t) => activeFilter === 'ALL' || t.status === activeFilter
  );

  const getStatusBadge = (status: TicketState) => {
    switch (status) {
      case 'OPEN':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'ASSIGNED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'CLEANED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'text-rose-400 font-bold';
      case 'HIGH':
        return 'text-amber-400 font-semibold';
      case 'MEDIUM':
        return 'text-cyan-400';
      default:
        return 'text-slate-400';
    }
  };

  return (
    <div className="rounded-2xl border border-tactical-800 bg-tactical-900/60 p-5 backdrop-blur-sm flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <ClipboardList className="w-4 h-4 text-buzz-cyan" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Housekeeping Dispatch Tracker
            </h3>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-tactical-800 text-slate-300 border border-tactical-700">
              {tickets.filter(t => t.status === 'OPEN').length} PENDING ACTION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Automated ticket lifecycle triggered by vision dwell-time threshold breach
          </p>
        </div>

        {/* State filter buttons */}
        <div className="flex items-center space-x-1.5 bg-tactical-950 p-1 rounded-lg border border-tactical-800 text-xs font-mono">
          {(['ALL', 'OPEN', 'ASSIGNED', 'CLEANED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setActiveFilter(st)}
              className={`px-2.5 py-1 rounded transition-all ${
                activeFilter === st
                  ? 'bg-tactical-800 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {filteredTickets.map((ticket) => {
          const isBreachedSLA = ticket.status !== 'CLEANED' && ticket.elapsedSeconds >= ticket.slaLimitSeconds;

          return (
            <div
              key={ticket.id}
              className="p-4 rounded-xl border border-tactical-800 bg-tactical-950/70 hover:border-tactical-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-buzz-cyan">
                      {ticket.code}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className={`text-[10px] font-mono uppercase tracking-wider ${getPriorityBadge(ticket.priority)}`}>
                      {ticket.priority} PRIORITY
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-[11px] text-slate-400">
                      {ticket.zoneName}
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-white mt-1">
                    {ticket.title}
                  </h4>
                </div>

                {/* Status Badge */}
                <div className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-bold border ${getStatusBadge(ticket.status)}`}>
                  {ticket.status}
                </div>
              </div>

              {/* Middle row: Assigned Staff & SLA countdown */}
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono py-2 px-3 rounded-lg bg-tactical-900/60 border border-tactical-800/80">
                <div className="flex items-center space-x-2 text-slate-300">
                  <UserCheck className="w-3.5 h-3.5 text-buzz-cyan" />
                  <span>
                    Staff:{' '}
                    {ticket.assignedStaff ? (
                      <span className="text-white font-medium">{ticket.assignedStaff.name}</span>
                    ) : (
                      <span className="text-rose-400 font-semibold animate-pulse">Unassigned</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-slate-300">
                  <Clock className={`w-3.5 h-3.5 ${isBreachedSLA ? 'text-rose-400' : 'text-slate-400'}`} />
                  <span>
                    Elapsed:{' '}
                    <span className={isBreachedSLA ? 'text-rose-400 font-bold' : 'text-slate-200'}>
                      {Math.floor(ticket.elapsedSeconds / 60)}m {ticket.elapsedSeconds % 60}s
                    </span>{' '}
                    / {Math.floor(ticket.slaLimitSeconds / 60)}m SLA
                  </span>
                </div>
              </div>

              {/* Action Buttons for Operator Workflow */}
              <div className="mt-3 flex items-center justify-between pt-2 border-t border-tactical-800/60">
                <div className="text-[11px] text-slate-500 font-mono">
                  Triggered {ticket.createdAt}
                </div>

                <div className="flex items-center space-x-2">
                  {ticket.status === 'OPEN' && (
                    <button
                      onClick={() => onAssignTicket(ticket.id)}
                      className="px-3 py-1.5 rounded-lg bg-buzz-cyan/10 hover:bg-buzz-cyan/20 border border-buzz-cyan/40 text-buzz-cyan text-xs font-medium flex items-center space-x-1.5 transition-all active:scale-95"
                    >
                      <Send className="w-3 h-3" />
                      <span>Dispatch Housekeeper</span>
                    </button>
                  )}

                  {ticket.status === 'ASSIGNED' && (
                    <button
                      onClick={() => onResolveTicket(ticket.id)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-medium flex items-center space-x-1.5 transition-all active:scale-95"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verify Cleaned (Upload Proof)</span>
                    </button>
                  )}

                  {ticket.status === 'CLEANED' && (
                    <span className="text-xs font-mono text-emerald-400 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Verified Cleaned</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

