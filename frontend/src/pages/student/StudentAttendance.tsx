import { PageHeader, Card, CardHeader, CardContent } from '../../components/ui';
import { CalendarClock } from 'lucide-react';

export default function StudentAttendance() {
  return (
    <div>
      <PageHeader
        title="Attendance & Engagement"
        subtitle="Monitor your academic attendance and engagement indicators"
      />

      <Card>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <CalendarClock className="h-8 w-8" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">Attendance integration unavailable</h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Attendance data will appear here once university attendance services are connected.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title="About this section" />
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">
              This area is reserved for semester-wise attendance percentages, engagement scores and participation
              records. Once the university attendance service is integrated, your records will be displayed here
              automatically.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader title="What to expect" />
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Semester-wise attendance percentage</li>
              <li>• Subject-wise presence summary</li>
              <li>• Engagement and participation indicators</li>
              <li>• Attendance alerts and thresholds</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
