import { useState } from 'react';
import { PageHeader, Card, CardHeader, CardContent } from '../../components/ui';
import { ChevronDown, HelpCircle, BookOpen, Briefcase, Building2, FolderKanban, Lock, Shield, Phone, Mail } from 'lucide-react';
import { cn } from '../../utils/cn';

const FAQ_GROUPS = [
  {
    title: 'Academic Records',
    icon: BookOpen,
    items: [
      { q: 'How do I view my CGPA and semester results?', a: 'Open Academics under the ACADEMICS menu, or Academic Progress for the CGPA/SGPA trend and backlog summary.' },
      { q: 'Where can I submit a new semester record?', a: 'On the Academics page, use the "Add Semester" button to record your SGPA, CGPA and credits.' },
    ],
  },
  {
    title: 'Placements',
    icon: Briefcase,
    items: [
      { q: 'How do I track my placement applications?', a: 'Visit the Placement Tracker to follow drives, rounds and your current placement status.' },
      { q: 'What does my placement status mean?', a: 'Statuses such as Applied, In Progress, Selected and Offered reflect where you stand in the placement process.' },
    ],
  },
  {
    title: 'Internships',
    icon: Building2,
    items: [
      { q: 'How do I add an internship to my profile?', a: 'Open Internships under the CAREER menu and add your internship with company, role, dates and stipend.' },
    ],
  },
  {
    title: 'Documents',
    icon: FolderKanban,
    items: [
      { q: 'Where are my uploaded documents stored?', a: 'Use the Document Center to upload, preview and manage documents such as certificates and offer letters.' },
    ],
  },
  {
    title: 'Account & Login',
    icon: Lock,
    items: [
      { q: 'I forgot my password. What should I do?', a: 'Contact the Academic Office or your administrator to reset your account password securely.' },
      { q: 'Why can I not access certain pages?', a: 'Access is controlled by your role. If you believe this is an error, contact the Placement Office or administrator.' },
    ],
  },
  {
    title: 'University SSO',
    icon: Shield,
    items: [
      { q: 'Can I sign in with my university account?', a: 'University SSO is being configured. Once available, use "Continue with University SSO" on the login page to authenticate via your university identity provider.' },
    ],
  },
];

function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={item.q} className="rounded-md border border-border">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            aria-expanded={openIndex === i}
            className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium text-foreground hover:bg-accent"
          >
            {item.q}
            <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', openIndex === i && 'rotate-180')} />
          </button>
          {openIndex === i && <p className="border-t border-border px-4 py-3 text-sm text-muted-foreground">{item.a}</p>}
        </div>
      ))}
    </div>
  );
}

export default function StudentSupport() {
  const [category, setCategory] = useState(FAQ_GROUPS[0].title);

  const active = FAQ_GROUPS.find((g) => g.title === category) ?? FAQ_GROUPS[0];

  return (
    <div>
      <PageHeader title="Help & Support" subtitle="Frequently asked questions and how to reach us" />

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title={<span className="flex items-center gap-2"><HelpCircle className="h-4 w-4 text-primary" /> Frequently Asked Questions</span>} />
          <CardContent>
            <div className="mb-4 flex flex-wrap gap-2">
              {FAQ_GROUPS.map((g) => (
                <button
                  key={g.title}
                  type="button"
                  onClick={() => setCategory(g.title)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs font-medium transition-colors',
                    category === g.title ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:bg-accent'
                  )}
                >
                  <g.icon className="h-3.5 w-3.5" /> {g.title}
                </button>
              ))}
            </div>
            <FaqAccordion items={active.items} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Contact Support" subtitle="Reach the right office" />
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 rounded-md border border-border p-3">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Placement Office</p>
                  <p className="text-xs text-muted-foreground">placement@university.edu · +91-00000-00000</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">For placement drives, applications and offers.</p>
                </div>
              </li>
              <li className="flex items-start gap-3 rounded-md border border-border p-3">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Academic Office</p>
                  <p className="text-xs text-muted-foreground">academics@university.edu · +91-00000-00000</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">For records, CGPA and backlog queries.</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
