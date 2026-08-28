export interface Session {
  day: string;
  start: string;
  end: string;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  professor: string;
  units: number;
  exam_date: string | null;
  exam_time: string | null;
  sessions: Session[];
}
