// Auto-generated from stacker schedule 16-07-22.xer
import { Project, WBSNode, Activity, Relationship, Calendar } from '../types/p6';

export const stackerProject: Project = {
  "id": "5265",
  "shortId": "LE21MA13",
  "name": "NMDC Kirandul-Stacker & reclaimer",
  "startDate": "2023-02-18",
  "finishDate": "2023-10-21",
  "dataDate": "2023-02-18",
  "defaultCalendarId": "7393",
  "activityCount": 41
};
export const stackerWbsNodes: WBSNode[] = [
  {
    "wbsId": "29082",
    "parentWbsId": null,
    "shortCode": "LE21MA13",
    "name": "NMDC Kirandul-Stacker & reclaimer",
    "level": 1,
    "projectId": "5265",
    "expanded": true
  },
  {
    "wbsId": "29085",
    "parentWbsId": "29082",
    "shortCode": "3",
    "name": "ERECTION",
    "level": 2,
    "projectId": "5265",
    "expanded": true
  },
  {
    "wbsId": "29092",
    "parentWbsId": "29085",
    "shortCode": "2",
    "name": "Mechanical Installation",
    "level": 3,
    "projectId": "5265",
    "expanded": true
  },
  {
    "wbsId": "29093",
    "parentWbsId": "29085",
    "shortCode": "4",
    "name": "COMMISSIONING",
    "level": 3,
    "projectId": "5265",
    "expanded": true
  },
  {
    "wbsId": "29094",
    "parentWbsId": "29085",
    "shortCode": "3",
    "name": "E&I Installation",
    "level": 3,
    "projectId": "5265",
    "expanded": true
  },
  {
    "wbsId": "29095",
    "parentWbsId": "29085",
    "shortCode": "1",
    "name": "Inspection of Spare Items of BWSR #9",
    "level": 3,
    "projectId": "5265",
    "expanded": true
  }
];
export const stackerActivities: Activity[] = [
  {
    "activityId": "A1000",
    "name": "SOP",
    "wbsId": "29082",
    "projectId": "5265",
    "activityType": "Start Milestone",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-02-20",
      "earlyFinish": "2023-02-20",
      "lateStart": "2023-02-20",
      "lateFinish": "2023-02-20",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 0,
      "remainingDuration": 0,
      "actualDuration": 0,
      "atCompletionDuration": 0,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A1010",
    "name": "EOP",
    "wbsId": "29082",
    "projectId": "5265",
    "activityType": "Start Milestone",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-10-21",
      "earlyFinish": "2023-10-21",
      "lateStart": "2023-10-20",
      "lateFinish": "2023-10-20",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 0,
      "remainingDuration": 0,
      "actualDuration": 0,
      "atCompletionDuration": 0,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4500",
    "name": "Inspection by OEM",
    "wbsId": "29095",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-07-15",
      "earlyFinish": "2023-07-26",
      "lateStart": "2023-07-15",
      "lateFinish": "2023-07-26",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 90,
      "remainingDuration": 90,
      "actualDuration": 0,
      "atCompletionDuration": 90,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4510",
    "name": "Travelling Bogie Assembly & Installation",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-07-27",
      "earlyFinish": "2023-08-07",
      "lateStart": "2023-07-27",
      "lateFinish": "2023-08-07",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 90,
      "remainingDuration": 90,
      "actualDuration": 0,
      "atCompletionDuration": 90,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4520",
    "name": "Base Frame assembly & erection along with access",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-07-27",
      "earlyFinish": "2023-08-12",
      "lateStart": "2023-07-27",
      "lateFinish": "2023-08-12",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 135,
      "remainingDuration": 135,
      "actualDuration": 0,
      "atCompletionDuration": 135,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4530",
    "name": "E-Ganrty assembly & Erection along with E Gantry Access",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-02-20",
      "earlyFinish": "2023-03-14",
      "lateStart": "2023-08-22",
      "lateFinish": "2023-09-14",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 180,
      "remainingDuration": 180,
      "actualDuration": 0,
      "atCompletionDuration": 180,
      "totalFloat": 1418,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4540",
    "name": "Slew Ring Erection Alignment & Torquing",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-08-14",
      "earlyFinish": "2023-08-19",
      "lateStart": "2023-08-18",
      "lateFinish": "2023-08-25",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 54,
      "remainingDuration": 54,
      "actualDuration": 0,
      "atCompletionDuration": 54,
      "totalFloat": 45,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4550",
    "name": "Slew Deck Assembly Erection and torquing along with Access",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-08-02",
      "earlyFinish": "2023-08-24",
      "lateStart": "2023-08-08",
      "lateFinish": "2023-08-30",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 180,
      "remainingDuration": 180,
      "actualDuration": 0,
      "atCompletionDuration": 180,
      "totalFloat": 45,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4560",
    "name": "Assembly & Erection of Slew Deck and Base Frame Chute",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-08-25",
      "earlyFinish": "2023-08-29",
      "lateStart": "2023-08-30",
      "lateFinish": "2023-09-04",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 36,
      "remainingDuration": 36,
      "actualDuration": 0,
      "atCompletionDuration": 36,
      "totalFloat": 45,
      "freeSlack": 45
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4570",
    "name": "Temp Str For Boom Installation (including PCC)",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-08-14",
      "earlyFinish": "2023-08-30",
      "lateStart": "2023-08-14",
      "lateFinish": "2023-08-30",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 135,
      "remainingDuration": 135,
      "actualDuration": 0,
      "atCompletionDuration": 135,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4580",
    "name": "Inner boom assembly & Erection along with pulley and tech-structures",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-08-31",
      "earlyFinish": "2023-09-07",
      "lateStart": "2023-08-30",
      "lateFinish": "2023-09-07",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 63,
      "remainingDuration": 63,
      "actualDuration": 0,
      "atCompletionDuration": 63,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4590",
    "name": "Mast Assembly & Erection Along With Access",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-08-25",
      "earlyFinish": "2023-09-05",
      "lateStart": "2023-08-25",
      "lateFinish": "2023-09-05",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 90,
      "remainingDuration": 90,
      "actualDuration": 0,
      "atCompletionDuration": 90,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4600",
    "name": "Boom Assembly Erection along with all access and Takeup",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-06",
      "earlyFinish": "2023-09-11",
      "lateStart": "2023-09-06",
      "lateFinish": "2023-09-11",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 45,
      "remainingDuration": 45,
      "actualDuration": 0,
      "atCompletionDuration": 45,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4610",
    "name": "Boom link assembly and erection",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-15",
      "earlyFinish": "2023-09-20",
      "lateStart": "2023-09-16",
      "lateFinish": "2023-09-21",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 40,
      "remainingDuration": 40,
      "actualDuration": 0,
      "atCompletionDuration": 40,
      "totalFloat": 14,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4620",
    "name": "Tail boom with access assembly and Erection",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-15",
      "earlyFinish": "2023-09-20",
      "lateStart": "2023-09-16",
      "lateFinish": "2023-09-22",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 45,
      "remainingDuration": 45,
      "actualDuration": 0,
      "atCompletionDuration": 45,
      "totalFloat": 14,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4630",
    "name": "Tail link assembly and erection",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-25",
      "earlyFinish": "2023-09-26",
      "lateStart": "2023-09-26",
      "lateFinish": "2023-09-28",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 18,
      "remainingDuration": 18,
      "actualDuration": 0,
      "atCompletionDuration": 18,
      "totalFloat": 14,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4640",
    "name": "Bucket Wheel Assembly and Erection along with Plummer Block Installation",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-27",
      "earlyFinish": "2023-09-30",
      "lateStart": "2023-09-28",
      "lateFinish": "2023-10-03",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 36,
      "remainingDuration": 36,
      "actualDuration": 0,
      "atCompletionDuration": 36,
      "totalFloat": 14,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4650",
    "name": "Bucket wheel chute assembly and erection",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-27",
      "earlyFinish": "2023-09-28",
      "lateStart": "2023-09-28",
      "lateFinish": "2023-09-30",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 18,
      "remainingDuration": 18,
      "actualDuration": 0,
      "atCompletionDuration": 18,
      "totalFloat": 14,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4660",
    "name": "Operator Cabin with support structure Assembly & Erection",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-20",
      "earlyFinish": "2023-09-27",
      "lateStart": "2023-09-29",
      "lateFinish": "2023-10-06",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 63,
      "remainingDuration": 63,
      "actualDuration": 0,
      "atCompletionDuration": 63,
      "totalFloat": 72,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4670",
    "name": "Boom tech structure installation and allignment",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-27",
      "earlyFinish": "2023-10-02",
      "lateStart": "2023-09-28",
      "lateFinish": "2023-10-04",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 45,
      "remainingDuration": 45,
      "actualDuration": 0,
      "atCompletionDuration": 45,
      "totalFloat": 14,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4680",
    "name": "Boom conveyor belt installation and Joining",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-10-03",
      "earlyFinish": "2023-10-05",
      "lateStart": "2023-10-04",
      "lateFinish": "2023-10-07",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 27,
      "remainingDuration": 27,
      "actualDuration": 0,
      "atCompletionDuration": 27,
      "totalFloat": 14,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4690",
    "name": "Hydraulic Works(Power Pack, Cylinder & Drive) for complete readiness with pipe laying, NDT & Teasting",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-08-25",
      "earlyFinish": "2023-09-16",
      "lateStart": "2023-09-08",
      "lateFinish": "2023-09-30",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 180,
      "remainingDuration": 180,
      "actualDuration": 0,
      "atCompletionDuration": 180,
      "totalFloat": 108,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4700",
    "name": "Lubrication system(Panel & Piping) Installation",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-06",
      "earlyFinish": "2023-09-28",
      "lateStart": "2023-09-20",
      "lateFinish": "2023-10-12",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 180,
      "remainingDuration": 180,
      "actualDuration": 0,
      "atCompletionDuration": 180,
      "totalFloat": 108,
      "freeSlack": 108
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4710",
    "name": "Belt scale installation",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-10-03",
      "earlyFinish": "2023-10-05",
      "lateStart": "2023-10-04",
      "lateFinish": "2023-10-07",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 27,
      "remainingDuration": 27,
      "actualDuration": 0,
      "atCompletionDuration": 27,
      "totalFloat": 14,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4720",
    "name": "Machine balancing and counter weight erection",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-10-06",
      "earlyFinish": "2023-10-11",
      "lateStart": "2023-10-07",
      "lateFinish": "2023-10-12",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 40,
      "remainingDuration": 40,
      "actualDuration": 0,
      "atCompletionDuration": 40,
      "totalFloat": 14,
      "freeSlack": 14
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4730",
    "name": "Cylinder locking",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-18",
      "earlyFinish": "2023-09-19",
      "lateStart": "2023-10-11",
      "lateFinish": "2023-10-12",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 18,
      "remainingDuration": 18,
      "actualDuration": 0,
      "atCompletionDuration": 18,
      "totalFloat": 180,
      "freeSlack": 180
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4740",
    "name": "Other misc items",
    "wbsId": "29092",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-18",
      "earlyFinish": "2023-09-25",
      "lateStart": "2023-10-05",
      "lateFinish": "2023-10-12",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 63,
      "remainingDuration": 63,
      "actualDuration": 0,
      "atCompletionDuration": 63,
      "totalFloat": 135,
      "freeSlack": 135
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4750",
    "name": "E-House Installation",
    "wbsId": "29094",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-03-15",
      "earlyFinish": "2023-03-17",
      "lateStart": "2023-09-14",
      "lateFinish": "2023-09-18",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 27,
      "remainingDuration": 27,
      "actualDuration": 0,
      "atCompletionDuration": 27,
      "totalFloat": 1418,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4760",
    "name": "Transformer and VCB panel installation",
    "wbsId": "29094",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-03-18",
      "earlyFinish": "2023-03-20",
      "lateStart": "2023-09-18",
      "lateFinish": "2023-09-20",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 18,
      "remainingDuration": 18,
      "actualDuration": 0,
      "atCompletionDuration": 18,
      "totalFloat": 1418,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4770",
    "name": "CRD base and wheel assembly",
    "wbsId": "29094",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-03-21",
      "earlyFinish": "2023-03-25",
      "lateStart": "2023-09-20",
      "lateFinish": "2023-09-25",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 40,
      "remainingDuration": 40,
      "actualDuration": 0,
      "atCompletionDuration": 40,
      "totalFloat": 1418,
      "freeSlack": 1310
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4780",
    "name": "Field instrument erection",
    "wbsId": "29094",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-12",
      "earlyFinish": "2023-09-28",
      "lateStart": "2023-09-26",
      "lateFinish": "2023-10-12",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 135,
      "remainingDuration": 135,
      "actualDuration": 0,
      "atCompletionDuration": 135,
      "totalFloat": 108,
      "freeSlack": 108
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4790",
    "name": "Operator cabin equipments erection",
    "wbsId": "29094",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-28",
      "earlyFinish": "2023-10-03",
      "lateStart": "2023-10-07",
      "lateFinish": "2023-10-12",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 45,
      "remainingDuration": 45,
      "actualDuration": 0,
      "atCompletionDuration": 45,
      "totalFloat": 72,
      "freeSlack": 72
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4800",
    "name": "Cable tray installation",
    "wbsId": "29094",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-12",
      "earlyFinish": "2023-09-28",
      "lateStart": "2023-09-12",
      "lateFinish": "2023-09-28",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 135,
      "remainingDuration": 135,
      "actualDuration": 0,
      "atCompletionDuration": 135,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4810",
    "name": "Cabling works",
    "wbsId": "29094",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-09-23",
      "earlyFinish": "2023-10-06",
      "lateStart": "2023-09-23",
      "lateFinish": "2023-10-06",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 108,
      "remainingDuration": 108,
      "actualDuration": 0,
      "atCompletionDuration": 108,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4820",
    "name": "Cable dressing and tagging",
    "wbsId": "29094",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-10-05",
      "earlyFinish": "2023-10-12",
      "lateStart": "2023-10-09",
      "lateFinish": "2023-10-16",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 63,
      "remainingDuration": 63,
      "actualDuration": 0,
      "atCompletionDuration": 63,
      "totalFloat": 27,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4830",
    "name": "loop testing and termination",
    "wbsId": "29094",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": false,
    "isLongestPath": false,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-10-10",
      "earlyFinish": "2023-10-14",
      "lateStart": "2023-10-13",
      "lateFinish": "2023-10-18",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 45,
      "remainingDuration": 45,
      "actualDuration": 0,
      "atCompletionDuration": 45,
      "totalFloat": 27,
      "freeSlack": 27
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4840",
    "name": "Mid JB and TRD erection",
    "wbsId": "29094",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-10-07",
      "earlyFinish": "2023-10-09",
      "lateStart": "2023-10-07",
      "lateFinish": "2023-10-09",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 18,
      "remainingDuration": 18,
      "actualDuration": 0,
      "atCompletionDuration": 18,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4850",
    "name": "CRD cable laying and termination with Mid JB",
    "wbsId": "29094",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-10-10",
      "earlyFinish": "2023-10-12",
      "lateStart": "2023-10-10",
      "lateFinish": "2023-10-12",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 27,
      "remainingDuration": 27,
      "actualDuration": 0,
      "atCompletionDuration": 27,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4860",
    "name": "Cold Commissioning",
    "wbsId": "29093",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-10-13",
      "earlyFinish": "2023-10-20",
      "lateStart": "2023-10-13",
      "lateFinish": "2023-10-20",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 63,
      "remainingDuration": 63,
      "actualDuration": 0,
      "atCompletionDuration": 63,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4870",
    "name": "Hot Commissioning",
    "wbsId": "29093",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-10-21",
      "earlyFinish": "2023-10-21",
      "lateStart": "2023-10-20",
      "lateFinish": "2023-10-20",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 0,
      "remainingDuration": 0,
      "actualDuration": 0,
      "atCompletionDuration": 0,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  },
  {
    "activityId": "A4880",
    "name": "Ramp up and PG Test",
    "wbsId": "29093",
    "projectId": "5265",
    "activityType": "Task Dependent",
    "status": "Not Started",
    "isCritical": true,
    "isLongestPath": true,
    "calendarId": "7393",
    "dates": {
      "earlyStart": "2023-10-21",
      "earlyFinish": "2023-10-21",
      "lateStart": "2023-10-20",
      "lateFinish": "2023-10-20",
      "actualStart": null,
      "actualFinish": null
    },
    "duration": {
      "plannedDuration": 0,
      "remainingDuration": 0,
      "actualDuration": 0,
      "atCompletionDuration": 0,
      "totalFloat": 0,
      "freeSlack": 0
    },
    "progress": {
      "activityPctComplete": 0,
      "pctCompleteType": "Duration"
    }
  }
];
export const stackerRelationships: Relationship[] = [
  {
    "id": "REL-1",
    "predActivityId": "A1000",
    "succActivityId": "A4500",
    "type": "SS",
    "lagHours": 1125,
    "isDriving": true
  },
  {
    "id": "REL-2",
    "predActivityId": "A4520",
    "succActivityId": "A4540",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-3",
    "predActivityId": "A4540",
    "succActivityId": "A4550",
    "type": "SS",
    "lagHours": -90,
    "isDriving": true
  },
  {
    "id": "REL-4",
    "predActivityId": "A4550",
    "succActivityId": "A4560",
    "type": "SS",
    "lagHours": 180,
    "isDriving": true
  },
  {
    "id": "REL-5",
    "predActivityId": "A4520",
    "succActivityId": "A4560",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-6",
    "predActivityId": "A4520",
    "succActivityId": "A4570",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-7",
    "predActivityId": "A4560",
    "succActivityId": "A4580",
    "type": "SS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-8",
    "predActivityId": "A4580",
    "succActivityId": "A4590",
    "type": "SS",
    "lagHours": -45,
    "isDriving": true
  },
  {
    "id": "REL-9",
    "predActivityId": "A4590",
    "succActivityId": "A4600",
    "type": "SS",
    "lagHours": 90,
    "isDriving": true
  },
  {
    "id": "REL-10",
    "predActivityId": "A4600",
    "succActivityId": "A4610",
    "type": "SS",
    "lagHours": 72,
    "isDriving": true
  },
  {
    "id": "REL-11",
    "predActivityId": "A4600",
    "succActivityId": "A4620",
    "type": "SS",
    "lagHours": 72,
    "isDriving": true
  },
  {
    "id": "REL-12",
    "predActivityId": "A4620",
    "succActivityId": "A4630",
    "type": "FS",
    "lagHours": 27,
    "isDriving": true
  },
  {
    "id": "REL-13",
    "predActivityId": "A4630",
    "succActivityId": "A4640",
    "type": "SS",
    "lagHours": 18,
    "isDriving": true
  },
  {
    "id": "REL-14",
    "predActivityId": "A4640",
    "succActivityId": "A4650",
    "type": "SS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-15",
    "predActivityId": "A4600",
    "succActivityId": "A4660",
    "type": "FS",
    "lagHours": 63,
    "isDriving": true
  },
  {
    "id": "REL-16",
    "predActivityId": "A4600",
    "succActivityId": "A4670",
    "type": "FS",
    "lagHours": 90,
    "isDriving": true
  },
  {
    "id": "REL-17",
    "predActivityId": "A4670",
    "succActivityId": "A4680",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-18",
    "predActivityId": "A4550",
    "succActivityId": "A4690",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-19",
    "predActivityId": "A4690",
    "succActivityId": "A4700",
    "type": "SS",
    "lagHours": 90,
    "isDriving": true
  },
  {
    "id": "REL-20",
    "predActivityId": "A4670",
    "succActivityId": "A4710",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-21",
    "predActivityId": "A4710",
    "succActivityId": "A4720",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-22",
    "predActivityId": "A4690",
    "succActivityId": "A4730",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-23",
    "predActivityId": "A4690",
    "succActivityId": "A4740",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-24",
    "predActivityId": "A4530",
    "succActivityId": "A4750",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-25",
    "predActivityId": "A4750",
    "succActivityId": "A4760",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-26",
    "predActivityId": "A4760",
    "succActivityId": "A4770",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-27",
    "predActivityId": "A4600",
    "succActivityId": "A4780",
    "type": "SS",
    "lagHours": 45,
    "isDriving": true
  },
  {
    "id": "REL-28",
    "predActivityId": "A4660",
    "succActivityId": "A4790",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-29",
    "predActivityId": "A4600",
    "succActivityId": "A4800",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-30",
    "predActivityId": "A4800",
    "succActivityId": "A4810",
    "type": "SS",
    "lagHours": 90,
    "isDriving": true
  },
  {
    "id": "REL-31",
    "predActivityId": "A4810",
    "succActivityId": "A4820",
    "type": "SS",
    "lagHours": 90,
    "isDriving": true
  },
  {
    "id": "REL-32",
    "predActivityId": "A4820",
    "succActivityId": "A4830",
    "type": "SS",
    "lagHours": 36,
    "isDriving": true
  },
  {
    "id": "REL-33",
    "predActivityId": "A4810",
    "succActivityId": "A4840",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-34",
    "predActivityId": "A4840",
    "succActivityId": "A4850",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-35",
    "predActivityId": "A4850",
    "succActivityId": "A4860",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-36",
    "predActivityId": "A4730",
    "succActivityId": "A4860",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-37",
    "predActivityId": "A4860",
    "succActivityId": "A4870",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-38",
    "predActivityId": "A4870",
    "succActivityId": "A4880",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-39",
    "predActivityId": "A4880",
    "succActivityId": "A1010",
    "type": "FF",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-40",
    "predActivityId": "A4570",
    "succActivityId": "A4580",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-41",
    "predActivityId": "A4610",
    "succActivityId": "A4620",
    "type": "SS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-42",
    "predActivityId": "A4680",
    "succActivityId": "A4710",
    "type": "SS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-43",
    "predActivityId": "A4500",
    "succActivityId": "A4510",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-44",
    "predActivityId": "A4510",
    "succActivityId": "A4520",
    "type": "SS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-45",
    "predActivityId": "A4650",
    "succActivityId": "A4670",
    "type": "SS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-46",
    "predActivityId": "A4700",
    "succActivityId": "A4860",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-47",
    "predActivityId": "A4720",
    "succActivityId": "A4860",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-48",
    "predActivityId": "A4740",
    "succActivityId": "A4860",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-49",
    "predActivityId": "A4770",
    "succActivityId": "A4780",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-50",
    "predActivityId": "A4780",
    "succActivityId": "A4860",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-51",
    "predActivityId": "A4790",
    "succActivityId": "A4860",
    "type": "FS",
    "lagHours": 0,
    "isDriving": true
  },
  {
    "id": "REL-52",
    "predActivityId": "A4830",
    "succActivityId": "A4860",
    "type": "SS",
    "lagHours": 0,
    "isDriving": true
  }
];
export const stackerCalendars: Calendar[] = [
  {
    "id": "7393",
    "name": "SAMPLE PROJ CAL",
    "workHoursPerDay": 9,
    "workDaysPerWeek": 6,
    "daysPerMonth": 26,
    "holidays": [
      "2010-01-01",
      "2010-05-31",
      "2010-07-05",
      "2010-09-06",
      "2010-11-25",
      "2010-12-24",
      "2010-12-31",
      "2011-05-30",
      "2011-07-04",
      "2011-09-05",
      "2011-11-24",
      "2011-12-26",
      "2012-01-02",
      "2012-05-28",
      "2012-07-04",
      "2012-09-03",
      "2012-11-22",
      "2012-12-25",
      "2013-01-01",
      "2013-05-27",
      "2013-07-04",
      "2013-09-02",
      "2013-11-28",
      "2013-12-25"
    ]
  }
];
