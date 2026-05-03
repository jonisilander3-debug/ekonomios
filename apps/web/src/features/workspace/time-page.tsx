'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ekonomi/ui';

import { getTimeTrackingData } from '@/features/platform-data/selectors';
import { usePlatformState } from '@/features/platform-data/use-platform-state';

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function TimePage() {
  const {
    onboardingData,
    currentCompanyId,
    mutations,
    startTimeEntry,
    stopTimeEntry,
    createManualTimeEntry
  } = usePlatformState();
  const timeData = getTimeTrackingData({
    onboarding: onboardingData,
    currentCompanyId,
    mutations
  });
  const [selectedProjectId, setSelectedProjectId] = useState(timeData.projectOptions[0]?.id || '');
  const [manualProjectId, setManualProjectId] = useState(timeData.projectOptions[0]?.id || '');
  const [manualDate, setManualDate] = useState(formatDateInput(new Date('2026-04-14T12:00:00')));
  const [manualStartTime, setManualStartTime] = useState('08:00');
  const [manualEndTime, setManualEndTime] = useState('16:00');
  const [manualNote, setManualNote] = useState('');
  const [confirmationText, setConfirmationText] = useState('');

  const selectedProject = useMemo(
    () => timeData.projectOptions.find((project) => project.id === selectedProjectId),
    [selectedProjectId, timeData.projectOptions]
  );

  const manualProject = useMemo(
    () => timeData.projectOptions.find((project) => project.id === manualProjectId),
    [manualProjectId, timeData.projectOptions]
  );

  const handleStart = () => {
    if (!selectedProject) {
      setConfirmationText('Välj ett projekt först.');
      return;
    }

    startTimeEntry(selectedProject.id, selectedProject.companyId);
    setConfirmationText(`Du är nu instämplad på ${selectedProject.name}.`);
  };

  const handleStop = () => {
    if (!timeData.activeEntryId) {
      setConfirmationText('Det finns ingen aktiv instämpling just nu.');
      return;
    }

    stopTimeEntry(timeData.activeEntryId);
    setConfirmationText('Instämplingen är avslutad och tiden är sparad.');
  };

  const handleManualSave = () => {
    if (!manualProject) {
      setConfirmationText('Välj ett projekt först.');
      return;
    }

    if (!manualDate || !manualStartTime || !manualEndTime) {
      setConfirmationText('Fyll i datum, starttid och sluttid.');
      return;
    }

    if (`${manualDate}T${manualEndTime}:00` <= `${manualDate}T${manualStartTime}:00`) {
      setConfirmationText('Sluttiden behöver vara senare än starttiden.');
      return;
    }

    createManualTimeEntry({
      companyId: manualProject.companyId,
      projectId: manualProject.id,
      date: manualDate,
      startTime: manualStartTime,
      endTime: manualEndTime,
      note: manualNote
    });
    setManualNote('');
    setConfirmationText('Tiden är nu sparad.');
  };

  return (
    <main className="flex flex-col gap-6 px-1 py-2 sm:px-0">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/80 bg-white/78 p-6 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-semibold tracking-tight text-stone-950">{timeData.title}</h1>
              <p className="max-w-2xl text-base leading-7 text-stone-600">{timeData.description}</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/fakturaunderlag">
                <Button variant="secondary" className="h-12 min-w-44">
                  Se fakturaunderlag
                </Button>
              </Link>
              <Link href="/loneunderlag">
                <Button variant="secondary" className="h-12 min-w-44">
                  Se löneunderlag
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {confirmationText ? (
          <div className="rounded-[1.25rem] bg-[#f5f1ea] px-4 py-3 text-sm text-stone-600">{confirmationText}</div>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-3">
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Timmar idag</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-950">{timeData.summary.totalHoursLabel}</p>
              <p className="text-sm leading-6 text-stone-500">Summan för dagens sparade tid.</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Aktiv instämpling</p>
              <p className="text-2xl font-semibold tracking-tight text-stone-950">{timeData.summary.activeEntryLabel}</p>
              <p className="text-sm leading-6 text-stone-500">Visar om någon tid pågår just nu.</p>
            </CardContent>
          </Card>
          <Card className="border-stone-200/80 bg-white/95">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm text-stone-500">Registreringar idag</p>
              <p className="text-3xl font-semibold tracking-tight text-stone-950">{timeData.summary.registrationsLabel}</p>
              <p className="text-sm leading-6 text-stone-500">Antal tidposter för dagens arbete.</p>
            </CardContent>
          </Card>
        </section>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Stämpling</CardDescription>
                <CardTitle className="text-2xl">Börja eller avsluta arbete</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-stone-900">Projekt</span>
                  <select
                    value={selectedProjectId}
                    onChange={(event) => setSelectedProjectId(event.target.value)}
                    className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  >
                    <option value="">Välj projekt</option>
                    {timeData.projectOptions.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button className="h-12 min-w-44" onClick={handleStart}>
                    Stämpla in
                  </Button>
                  <Button variant="secondary" className="h-12 min-w-44" onClick={handleStop}>
                    Stämpla ut
                  </Button>
                </div>

                {timeData.activeProjectName ? (
                  <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-600">
                    Aktivt just nu: {timeData.activeProjectName}
                  </div>
                ) : null}
              </CardContent>
            </Card>

            <Card className="border-stone-200/80 bg-white/95">
              <CardHeader>
                <CardDescription>Idag</CardDescription>
                <CardTitle className="text-2xl">Dagens tidsposter</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {timeData.todayEntries.length > 0 ? (
                    timeData.todayEntries.map((entry) => (
                      <div key={entry.id} className="rounded-[1.5rem] bg-[#fbfaf7] p-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="space-y-1">
                            <p className="font-medium text-stone-900">{entry.projectName}</p>
                            <p className="text-sm text-stone-500">{entry.employeeName}</p>
                            <p className="text-sm text-stone-500">{entry.timeLabel}</p>
                            {entry.note ? <p className="text-sm leading-6 text-stone-500">{entry.note}</p> : null}
                          </div>
                          <div className="space-y-2 sm:text-right">
                            <div className="text-sm font-medium text-stone-900">{entry.hoursLabel}</div>
                            <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-stone-700">
                              {entry.statusLabel}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] bg-[#fbfaf7] p-4 text-sm leading-7 text-stone-500">
                      Inga tidsposter ännu idag.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-stone-200/80 bg-white/95">
            <CardHeader>
              <CardDescription>Manuell registrering</CardDescription>
              <CardTitle className="text-2xl">Spara tid i efterhand</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="space-y-2 block">
                <span className="text-sm font-medium text-stone-900">Projekt</span>
                <select
                  value={manualProjectId}
                  onChange={(event) => setManualProjectId(event.target.value)}
                  className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                >
                  <option value="">Välj projekt</option>
                  {timeData.projectOptions.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-stone-900">Datum</span>
                <input
                  type="date"
                  value={manualDate}
                  onChange={(event) => setManualDate(event.target.value)}
                  className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-stone-900">Starttid</span>
                  <input
                    type="time"
                    value={manualStartTime}
                    onChange={(event) => setManualStartTime(event.target.value)}
                    className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  />
                </label>

                <label className="space-y-2 block">
                  <span className="text-sm font-medium text-stone-900">Sluttid</span>
                  <input
                    type="time"
                    value={manualEndTime}
                    onChange={(event) => setManualEndTime(event.target.value)}
                    className="h-12 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 text-sm text-stone-700 outline-none transition focus:border-stone-400"
                  />
                </label>
              </div>

              <label className="space-y-2 block">
                <span className="text-sm font-medium text-stone-900">Notering</span>
                <textarea
                  value={manualNote}
                  onChange={(event) => setManualNote(event.target.value)}
                  placeholder="Skriv en kort notering om arbetet."
                  className="min-h-28 w-full rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3 text-sm leading-7 text-stone-700 outline-none transition focus:border-stone-400"
                />
              </label>

              <Button className="h-12 w-full" onClick={handleManualSave}>
                Spara tid
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
