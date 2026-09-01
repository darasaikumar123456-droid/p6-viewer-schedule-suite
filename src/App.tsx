import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { ScheduleViewer } from './components/viewer/ScheduleViewer';
import { AIDraftingAssistant } from './components/drafter/AIDraftingAssistant';
import {
  stackerProject,
  stackerWbsNodes,
  stackerActivities,
  stackerRelationships,
  stackerCalendars,
} from './data/stackerData';
import {
  adityaProject,
  adityaWbsNodes,
  adityaActivities,
  adityaRelationships,
  adityaCalendars,
} from './data/adityaData';
import {
  sampleProject,
  sampleWBSNodes,
  sampleActivities,
  sampleRelationships,
  defaultCalendars,
} from './data/sampleSchedule';
import { Project, WBSNode, Activity, Relationship, Calendar } from './types/p6';

export const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<'viewer' | 'drafter'>('viewer');

  // Default directly to Stacker & Reclaimer production schedule
  const [project, setProject] = useState<Project>(stackerProject);
  const [wbsNodes, setWbsNodes] = useState<WBSNode[]>(stackerWbsNodes);
  const [activities, setActivities] = useState<Activity[]>(stackerActivities);
  const [relationships, setRelationships] = useState<Relationship[]>(stackerRelationships);
  const [calendars, setCalendars] = useState<Calendar[]>(stackerCalendars);

  const handleMergeFragmentIntoViewer = (
    mergedWbs: WBSNode[],
    mergedActs: Activity[],
    mergedRels: Relationship[]
  ) => {
    setWbsNodes(mergedWbs);
    setActivities(mergedActs);
    setRelationships(mergedRels);
    setActiveModule('viewer');
  };

  const handleScheduleChange = (
    newProj: Project,
    newWbs: WBSNode[],
    newActs: Activity[],
    newRels: Relationship[],
    newCals: Calendar[]
  ) => {
    setProject(newProj);
    setWbsNodes(newWbs);
    setActivities(newActs);
    setRelationships(newRels);
    setCalendars(newCals);
  };

  const handleSwitchSchedule = (type: 'aditya' | 'sample') => {
    if (type === 'aditya') {
      setProject(adityaProject);
      setWbsNodes(adityaWbsNodes);
      setActivities(adityaActivities);
      setRelationships(adityaRelationships);
      setCalendars(adityaCalendars);
    } else {
      setProject(sampleProject);
      setWbsNodes(sampleWBSNodes);
      setActivities(sampleActivities);
      setRelationships(sampleRelationships);
      setCalendars(defaultCalendars);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-slate-100">
      <Header
        activeModule={activeModule}
        onSelectModule={setActiveModule}
        projectName={project.name}
      />

      <main className="flex-1 flex overflow-hidden">
        {activeModule === 'viewer' ? (
          <ScheduleViewer
            key={project.id}
            initialProject={project}
            initialWbsNodes={wbsNodes}
            initialActivities={activities}
            initialRelationships={relationships}
            initialCalendars={calendars}
            onScheduleChange={handleScheduleChange}
          />
        ) : (
          <AIDraftingAssistant
            currentProject={project}
            currentWbsNodes={wbsNodes}
            currentActivities={activities}
            currentRelationships={relationships}
            onMergeIntoViewer={handleMergeFragmentIntoViewer}
          />
        )}
      </main>
    </div>
  );
};
export default App;
