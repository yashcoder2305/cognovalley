'use client';

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_ZONES, 
  INITIAL_BOUNDING_BOXES, 
  INITIAL_TICKETS, 
  INITIAL_VERIFICATIONS 
} from '@/data/mockData';
import { Zone, BoundingBox, HousekeepingTicket, VerificationPair } from '@/types';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { MetricsBar } from '@/components/MetricsBar';
import { ZoneList } from '@/components/ZoneList';
import { VisionFeed } from '@/components/VisionFeed';
import { IncidentsTable } from '@/components/IncidentsTable';
import { VerificationPanel } from '@/components/VerificationPanel';
import { DemoModal } from '@/components/DemoModal';
import { Toast, ToastMessage } from '@/components/Toast';

export default function Home() {
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-1');
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>(INITIAL_BOUNDING_BOXES);
  const [tickets, setTickets] = useState<HousekeepingTicket[]>(INITIAL_TICKETS);
  const [verifications, setVerifications] = useState<VerificationPair[]>(INITIAL_VERIFICATIONS);
  const [persistenceThresholdSec, setPersistenceThresholdSec] = useState<number>(180);

  // Demo modal state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [isSimulatingSpill, setIsSimulatingSpill] = useState<boolean>(false);

  // Toast notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (title: string, description: string, type: 'info' | 'warning' | 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  // Dynamic Overall Facility Cleanliness Score calculation
  const overallCleanlinessScore = Number(
    (zones.reduce((acc, curr) => acc + curr.cleanlinessScore, 0) / zones.length).toFixed(1)
  );

  const criticalZonesCount = zones.filter((z) => z.cleanlinessScore < 70).length;
  const activeIncidentsCount = tickets.filter((t) => t.status !== 'resolved').length;

  // Real-time ticking effect for persistence dwell timers
  useEffect(() => {
    const timer = setInterval(() => {
      setBoundingBoxes((prev) =>
        prev.map((box) => ({
          ...box,
          persistenceSeconds: box.persistenceSeconds + 1,
        }))
      );

      setTickets((prev) =>
        prev.map((t) =>
          t.status !== 'resolved'
            ? { ...t, elapsedSeconds: t.elapsedSeconds + 1 }
            : t
        )
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Action: Operator dispatches housekeeping staff
  const handleAssignTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'assigned',
              assignedStaff: {
                name: 'Anand Kumar',
                role: 'Area Custodian',
                badgeId: 'HK-772',
                etaMinutes: 3,
              },
            }
          : t
      )
    );
    addToast('Staff dispatched', 'Anand Kumar (HK-772) assigned. ETA 3 mins.', 'info');
  };

  // Action: Mark cleaned & verified
  const handleResolveTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'resolved',
              resolvedAt: 'Just now',
              afterImageUrl: 'https://images.unsplash.com/photo-1584824486509-112e4181ff6b?auto=format&fit=crop&w=800&q=80',
            }
          : t
      )
    );

    // Boost zone cleanliness score back up
    setZones((prev) =>
      prev.map((z) =>
        z.id === selectedZoneId
          ? {
              ...z,
              cleanlinessScore: Math.min(98, z.cleanlinessScore + 25),
              history: [...z.history.slice(1), Math.min(98, z.cleanlinessScore + 25)],
              status: 'optimal',
              activeIncidents: Math.max(0, z.activeIncidents - 1),
            }
          : z
      )
    );

    addToast('Incident resolved', `${currentZone.name} verified clean. Cleanliness score restored.`, 'success');
  };

  // Action: Trigger ticket manually from a bounding box
  const handleTriggerTicketFromBox = (box: BoundingBox) => {
    const newTicket: HousekeepingTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: `TKT-${Math.floor(1085 + Math.random() * 40)}`,
      title: `${box.label} exceeds persistence threshold`,
      zoneId: currentZone.id,
      zoneName: currentZone.name,
      type: box.type,
      priority: 'critical',
      status: 'open',
      createdAt: 'Just now',
      elapsedSeconds: box.persistenceSeconds,
      slaLimitSeconds: 300,
      beforeImageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    };

    setTickets((prev) => [newTicket, ...prev]);
    addToast('Maintenance ticket opened', `${newTicket.ticketNumber} generated for ${currentZone.name}.`, 'warning');
  };

  // Action: Simulate a spill incident
  const handleTriggerSimulatedWaste = () => {
    setIsSimulatingSpill(true);

    const newBox: BoundingBox = {
      id: `box-${Date.now()}`,
      type: 'overflowing_bin',
      label: 'Overflowing recycle bin',
      confidence: 0.95,
      coordinates: { x: 38, y: 44, width: 20, height: 36 },
      persistenceSeconds: 195,
      thresholdSeconds: persistenceThresholdSec,
      detectedAt: 'Just now',
      status: 'breached',
    };

    setBoundingBoxes((prev) => [newBox, ...prev]);

    // Lower zone cleanliness
    setZones((prev) =>
      prev.map((z) =>
        z.id === selectedZoneId
          ? {
              ...z,
              cleanlinessScore: Math.max(38, z.cleanlinessScore - 20),
              history: [...z.history.slice(1), Math.max(38, z.cleanlinessScore - 20)],
              status: 'critical',
              activeIncidents: z.activeIncidents + 1,
            }
          : z
      )
    );

    setTimeout(() => {
      handleTriggerTicketFromBox(newBox);
      setIsSimulatingSpill(false);
    }, 1200);
  };

  // Action: Automated Demo Sequence for Cogno Valley Review Panel
  const handleRunFullDemoStory = () => {
    setIsDemoRunning(true);
    setDemoStep(1);

    setTimeout(() => {
      setDemoStep(2);
    }, 2000);

    setTimeout(() => {
      setDemoStep(3);
      const demoTicket: HousekeepingTicket = {
        id: `demo-${Date.now()}`,
        ticketNumber: 'TKT-1090',
        title: 'Food waste and cup overflow',
        zoneId: 'zone-1',
        zoneName: 'Food Court - West Dining',
        type: 'overflowing_bin',
        priority: 'critical',
        status: 'open',
        createdAt: 'Just now',
        elapsedSeconds: 185,
        slaLimitSeconds: 300,
        beforeImageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
      };
      setTickets((prev) => [demoTicket, ...prev]);
      addToast('Ticket TKT-1090 created', 'Dwell threshold exceeded in Food Court.', 'warning');
    }, 4000);

    setTimeout(() => {
      setDemoStep(4);
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketNumber === 'TKT-1090'
            ? {
                ...t,
                status: 'assigned',
                assignedStaff: {
                  name: 'Priya Sharma',
                  role: 'Rapid Response Lead',
                  badgeId: 'HK-201',
                  etaMinutes: 2,
                },
              }
            : t
        )
      );
      addToast('Housekeeper dispatched', 'Priya Sharma assigned to TKT-1090.', 'info');
    }, 6000);

    setTimeout(() => {
      setDemoStep(5);
      setTickets((prev) =>
        prev.map((t) =>
          t.ticketNumber === 'TKT-1090'
            ? {
                ...t,
                status: 'resolved',
                resolvedAt: 'Just now',
                afterImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
              }
            : t
        )
      );

      setZones((prev) =>
        prev.map((z) =>
          z.id === 'zone-1'
            ? {
                ...z,
                cleanlinessScore: 96,
                history: [...z.history.slice(1), 96],
                status: 'optimal',
                activeIncidents: 0,
              }
            : z
        )
      );

      addToast('Demo completed', 'Verification verified. Cleanliness restored to 96%.', 'success');
      setIsDemoRunning(false);
    }, 8500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex text-zinc-100 antialiased selection:bg-zinc-800">
      {/* Left Sidebar */}
      <Sidebar activeIncidentsCount={activeIncidentsCount} />

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <Header
          onOpenDemoModal={() => setIsDemoModalOpen(true)}
          onTriggerSimulatedWaste={handleTriggerSimulatedWaste}
          isSimulating={isSimulatingSpill}
        />

        {/* KPI Strip */}
        <MetricsBar
          score={overallCleanlinessScore}
          criticalZonesCount={criticalZonesCount}
          totalZones={zones.length}
          openIncidentsCount={activeIncidentsCount}
          averageResponseMinutes={4.2}
        />

        {/* Dashboard Content Container */}
        <main className="p-4 sm:p-6 space-y-6 max-w-7xl">
          {/* Row 1: Two Column Layout (Zones List + Hero Vision Feed) */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Zone List (4 cols) */}
            <div className="lg:col-span-4">
              <ZoneList
                zones={zones}
                selectedZoneId={selectedZoneId}
                onSelectZone={(id) => setSelectedZoneId(id)}
              />
            </div>

            {/* Right Column: Hero Live Vision Feed (8 cols) */}
            <div className="lg:col-span-8">
              <VisionFeed
                currentZone={currentZone}
                boundingBoxes={boundingBoxes}
                onTriggerTicketFromBox={handleTriggerTicketFromBox}
                persistenceThresholdSec={persistenceThresholdSec}
                onUpdateThreshold={(val) => setPersistenceThresholdSec(val)}
              />
            </div>
          </section>

          {/* Row 2: Housekeeping Incidents Table & Visual Verification */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Real Incidents Table (7 cols) */}
            <div className="lg:col-span-7">
              <IncidentsTable
                tickets={tickets}
                onAssignTicket={handleAssignTicket}
                onResolveTicket={handleResolveTicket}
              />
            </div>

            {/* Right: Visual Verification Split-Slider (5 cols) */}
            <div className="lg:col-span-5">
              <VerificationPanel verifications={verifications} />
            </div>
          </section>
        </main>
      </div>

      {/* Demo Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onRunFullDemoStory={handleRunFullDemoStory}
        demoStep={demoStep}
        isDemoRunning={isDemoRunning}
      />

      {/* Floating Operational Toast Notifications */}
      <Toast toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
