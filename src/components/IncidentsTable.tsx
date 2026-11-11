'use client';

import React, { useState } from 'react';
import { HousekeepingTicket, TicketState } from '@/types';
import { AlertCircle, Clock, UserCheck, CheckCircle2, Send, ExternalLink } from 'lucide-react';

interface IncidentsTableProps {
  tickets: HousekeepingTicket[];
  onAssignTicket: (id: string) => void;
  onResolveTicket: (id: string) => void;
}

export const IncidentsTable: React.FC<IncidentsTableProps> = ({
  tickets,
  onAssignTicket,
  onResolveTicket,
}) => {
  const [filter, setFilter] = useState<'all' | TicketState>('all');

  const filteredTickets = tickets.filter(
    (t) => filter === 'all' || t.status === filter
  );

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-400 font-medium';
      case 'high':
        return 'text-amber-400 font-medium';
      case 'medium':
        return 'text-blue-400';
      default:
        return 'text-zinc-400';
    }
  };

  const getStatusBadge = (status: TicketState) => {
    switch (status) {
      case 'open':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'assigned':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'resolved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="border border-zinc-800 rounded-lg bg-zinc-950 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-xs font-semibold text-zinc-100 uppercase tracking-wider">
            Housekeeping incident log
          </h2>
          <p className="text-[11px] text-zinc-400 mt-0.5">
            Automated maintenance tickets created from vision dwell triggers
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-zinc-900 border border-zinc-800 rounded-md p-0.5 text-xs">
          {(['all', 'open', 'assigned', 'resolved'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                filter === st
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/40 text-[11px] text-zinc-400 font-medium">
              <th className="py-2.5 px-4 font-normal">Ticket</th>
              <th className="py-2.5 px-4 font-normal">Description</th>
              <th className="py-2.5 px-4 font-normal">Zone</th>
              <th className="py-2.5 px-4 font-normal">Severity</th>
              <th className="py-2.5 px-4 font-normal">Status</th>
              <th className="py-2.5 px-4 font-normal">Elapsed</th>
              <th className="py-2.5 px-4 font-normal">Assigned staff</th>
              <th className="py-2.5 px-4 font-normal text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80">
            {filteredTickets.map((ticket) => {
              const isBreached = ticket.status !== 'resolved' && ticket.elapsedSeconds >= ticket.slaLimitSeconds;

              return (
                <tr key={ticket.id} className="hover:bg-zinc-900/40 transition-colors">
                  {/* Ticket Number */}
                  <td className="py-3 px-4 font-mono font-medium text-zinc-200 whitespace-nowrap">
                    {ticket.ticketNumber}
                  </td>

                  {/* Description */}
                  <td className="py-3 px-4 text-zinc-300 font-medium max-w-xs truncate">
                    {ticket.title}
                  </td>

                  {/* Zone */}
                  <td className="py-3 px-4 text-zinc-400 whitespace-nowrap">
                    {ticket.zoneName}
                  </td>

                  {/* Severity */}
                  <td className={`py-3 px-4 capitalize whitespace-nowrap ${getPriorityStyle(ticket.priority)}`}>
                    {ticket.priority}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border capitalize ${getStatusBadge(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>

                  {/* Elapsed / SLA */}
                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 tabular-nums whitespace-nowrap">
                    <span className={isBreached ? 'text-red-400 font-medium' : ''}>
                      {Math.floor(ticket.elapsedSeconds / 60)}m {ticket.elapsedSeconds % 60}s
                    </span>{' '}
                    / {Math.floor(ticket.slaLimitSeconds / 60)}m
                  </td>

                  {/* Staff */}
                  <td className="py-3 px-4 text-zinc-300 whitespace-nowrap">
                    {ticket.assignedStaff ? (
                      <span className="font-medium text-zinc-200">
                        {ticket.assignedStaff.name} ({ticket.assignedStaff.badgeId})
                      </span>
                    ) : (
                      <span className="text-zinc-400 italic">Unassigned</span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {ticket.status === 'open' && (
                      <button
                        onClick={() => onAssignTicket(ticket.id)}
                        className="h-7 px-2.5 rounded text-xs font-medium bg-zinc-100 text-zinc-900 hover:bg-white transition-colors"
                      >
                        Dispatch
                      </button>
                    )}

                    {ticket.status === 'assigned' && (
                      <button
                        onClick={() => onResolveTicket(ticket.id)}
                        className="h-7 px-2.5 rounded text-xs font-medium border border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 transition-colors"
                      >
                        Verify clean
                      </button>
                    )}

                    {ticket.status === 'resolved' && (
                      <span className="text-xs text-zinc-400 font-mono">
                        Resolved
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

