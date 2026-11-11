'use client';

import React, { useState, useEffect } from 'react';
import { 
  INITIAL_ZONES, 
  INITIAL_BOUNDING_BOXES, 
  INITIAL_TICKETS, 
  INITIAL_VERIFICATIONS 
} from '@/data/mockData';
import { Zone, BoundingBox, HousekeepingTicket, VerificationPair } from '@/types';
import { Navbar } from '@/components/Navbar';
import { CleanlinessGauge } from '@/components/CleanlinessGauge';
import { ZoneScorecards } from '@/components/ZoneScorecards';
import { VisionStreamHUD } from '@/components/VisionStreamHUD';
import { VisualVerificationSlider } from '@/components/VisualVerificationSlider';
import { HousekeepingTracker } from '@/components/HousekeepingTracker';
import { DemoControlPanel } from '@/components/DemoControlPanel';

export default function Home() {
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('zone-1');
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>(INITIAL_BOUNDING_BOXES);
  const [tickets, setTickets] = useState<HousekeepingTicket[]>(INITIAL_TICKETS);
  const [verifications, setVerifications] = useState<VerificationPair[]>(INITIAL_VERIFICATIONS);
  const [persistenceThresholdSec, setPersistenceThresholdSec] = useState<number>(180); // 3 minutes

  // Demo panel state
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [demoStep, setDemoStep] = useState<number>(0);
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);
  const [isSimulatingSpill, setIsSimulatingSpill] = useState<boolean>(false);

  // Selected Zone object
  const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  // Dynamic Overall Facility Cleanliness Score calculation
  const overallCleanlinessScore = Math.round(
    zones.reduce((acc, curr) => acc + curr.cleanlinessScore, 0) / zones.length
  );

  const criticalZonesCount = zones.filter((z) => z.cleanlinessScore < 70).length;
  const activeIncidentsCount = tickets.filter((t) => t.status !== 'CLEANED').length;

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
          t.status !== 'CLEANED'
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
              status: 'ASSIGNED',
              assignedStaff: {
                name: 'Anand Kumar (Attendant)',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
                badgeId: 'HK-772',
                etaMinutes: 3,
              },
            }
          : t
      )
    );
  };

  // Action: Mark cleaned & verified
  const handleResolveTicket = (ticketId: string) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: 'CLEANED',
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
              status: 'pristine',
              activeIncidents: Math.max(0, z.activeIncidents - 1),
            }
          : z
      )
    );
  };

  // Action: Trigger ticket manually from a bounding box
  const handleTriggerTicketFromBox = (box: BoundingBox) => {
    const newTicket: HousekeepingTicket = {
      id: `tkt-${Date.now()}`,
      code: `BB-TKT-${Math.floor(100 + Math.random() * 900)}`,
      title: `${box.label} persistent breach`,
      zoneId: currentZone.id,
      zoneName: currentZone.name,
      type: box.type,
      priority: 'CRITICAL',
      status: 'OPEN',
      createdAt: 'Just now',
      elapsedSeconds: box.persistenceSeconds,
      slaLimitSeconds: 300,
      beforeImageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
    };

    setTickets((prev) => [newTicket, ...prev]);
  };

  // Action: Simulate a spill incident
  const handleTriggerSimulatedWaste = () => {
    setIsSimulatingSpill(true);

    const newBox: BoundingBox = {
      id: `box-${Date.now()}`,
      type: 'overflowing_bin',
      label: 'OVERFLOWING_BIN [BIN-09]',
      confidence: 0.954,
      coordinates: { x: 35, y: 45, width: 20, height: 35 },
      persistenceSeconds: 195, // already breached threshold!
      thresholdSeconds: persistenceThresholdSec,
      status: 'breached',
      color: '#ef4444',
    };

    setBoundingBoxes((prev) => [newBox, ...prev]);

    // Lower zone cleanliness
    setZones((prev) =>
      prev.map((z) =>
        z.id === selectedZoneId
          ? {
              ...z,
              cleanlinessScore: Math.max(35, z.cleanlinessScore - 22),
              status: 'critical',
              activeIncidents: z.activeIncidents + 1,
            }
          : z
      )
    );

    // Auto generate ticket after 1.5s
    setTimeout(() => {
      handleTriggerTicketFromBox(newBox);
      setIsSimulatingSpill(false);
    }, 1500);
  };

  // Action: Automated Demo Sequence for Cogno Valley Review Panel
  const handleRunFullDemoStory = () => {
    setIsDemoRunning(true);
    setDemoStep(1);

    // Step 1: Detect Waste
    setTimeout(() => {
      setDemoStep(2); // Dwell threshold breach
    }, 2000);

    // Step 2: Auto Generate Ticket
    setTimeout(() => {
      setDemoStep(3);
      const demoTicket: HousekeepingTicket = {
        id: `demo-${Date.now()}`,
        code: 'BB-TKT-990',
        title: 'Litter Overflow - Food Court Station 1',
        zoneId: 'zone-1',
        zoneName: 'Food Court & Dining Plaza',
        type: 'overflowing_bin',
        priority: 'CRITICAL',
        status: 'OPEN',
        createdAt: 'Just now',
        elapsedSeconds: 185,
        slaLimitSeconds: 300,
        beforeImageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
      };
      setTickets((prev) => [demoTicket, ...prev]);
    }, 4000);

    // Step 3: Dispatch Housekeeper
    setTimeout(() => {
      setDemoStep(4);
      setTickets((prev) =>
        prev.map((t) =>
          t.code === 'BB-TKT-990'
            ? {
                ...t,
                status: 'ASSIGNED',
                assignedStaff: {
                  name: 'Priya Sharma (Specialist)',
                  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
                  badgeId: 'HK-201',
                  etaMinutes: 1,
                },
              }
            : t
        )
      );
    }, 6000);

    // Step 4: Visual Verification & Cleanliness Recovery
    setTimeout(() => {
      setDemoStep(5);
      setTickets((prev) =>
        prev.map((t) =>
          t.code === 'BB-TKT-990'
            ? {
                ...t,
                status: 'CLEANED',
                resolvedAt: 'Just now',
                afterImageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80',
              }
            : t
        )
      );

      // Rebound score
      setZones((prev) =>
        prev.map((z) =>
          z.id === 'zone-1'
            ? { ...z, cleanlinessScore: 96, status: 'pristine', activeIncidents: 0 }
            : z
        )
      );

      setIsDemoRunning(false);
    }, 8500);
  };

  return (
    <div className="min-h-screen bg-tactical-950 flex flex-col text-slate-100">
      {/* Top Navbar */}
      <Navbar
        overallScore={overallCleanlinessScore}
        activeIncidentsCount={activeIncidentsCount}
        onOpenDemoModal={() => setIsDemoModalOpen(true)}
        onTriggerSimulatedWaste={handleTriggerSimulatedWaste}
        isSimulating={isSimulatingSpill}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Row 1: Executive KPI Gauge & Telemetry */}
        <section>
          <CleanlinessGauge
            score={overallCleanlinessScore}
            zonesCount={zones.length}
            criticalZonesCount={criticalZonesCount}
            averageResponseMinutes={6.4}
          />
        </section>

        {/* Row 2: Two Column Operational Hub */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Column: Zone Scorecards & Map Telemetry (4 cols) */}
          <div className="lg:col-span-4 h-full min-h-[500px]">
            <ZoneScorecards
              zones={zones}
              selectedZoneId={selectedZoneId}
              onSelectZone={(id) => setSelectedZoneId(id)}
            />
          </div>

          {/* Right Column: Real-time Vision Stream HUD (8 cols) */}
          <div className="lg:col-span-8 h-full min-h-[500px]">
            <VisionStreamHUD
              currentZone={currentZone}
              boundingBoxes={boundingBoxes}
              onTriggerTicketFromBox={handleTriggerTicketFromBox}
              persistenceThresholdSec={persistenceThresholdSec}
              onUpdateThreshold={(val) => setPersistenceThresholdSec(val)}
            />
          </div>
        </section>

        {/* Row 3: Housekeeping Dispatch Tracker & Visual Verification Slider */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Housekeeping Triage Board (6 cols) */}
          <div className="lg:col-span-6 h-full min-h-[460px]">
            <HousekeepingTracker
              tickets={tickets}
              onAssignTicket={handleAssignTicket}
              onResolveTicket={handleResolveTicket}
            />
          </div>

          {/* Right: Visual Verification Slider (6 cols) */}
          <div className="lg:col-span-6 h-full min-h-[460px]">
            <VisualVerificationSlider verifications={verifications} />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-tactical-800/80 bg-tactical-950 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        BIN BUZZ // FACILITY HYGIENE PLATFORM • COGNO VALLEY LABS × CHRIST UNIVERSITY INTERNSHIP • TRACK E
      </footer>

      {/* Demo Modal Walkthrough */}
      <DemoControlPanel
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onRunFullDemoStory={handleRunFullDemoStory}
        demoStep={demoStep}
        isDemoRunning={isDemoRunning}
      />
    </div>
  );
}

