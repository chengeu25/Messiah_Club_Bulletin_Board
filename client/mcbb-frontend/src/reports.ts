export interface Report {
  name: string;
  query: string;
}

interface ReportObject {
  SCHOOL_WIDE: Report[];
  CLUB: Report[];
  USER: Report[];
  EVENT: Report[];
}

const REPORTS: ReportObject = {
  SCHOOL_WIDE: [],
  CLUB: [],
  USER: [],
  EVENT: []
};

export default REPORTS;
