import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { api } from '../../api/client';
import { useAuth } from '../../hooks/useAuth';
import { PageHeader, Card, Button, Badge, Select, Loading, ConfirmDialog, ActionMenu, Toast } from '../../components/ui';
import { Plus, X } from 'lucide-react';
import type { StudentSkill, Skill } from '../../types';
import { asArray } from '../../utils/cn';

export default function StudentSkills() {
  const { data, refetch, isLoading } = useApi<StudentSkill[]>(['student-skills'], '/api/student-skills');
  const { data: allSkills } = useApi<Skill[]>(['skills'], '/api/skills');
  const { user } = useAuth();
  const [msg, setMsg] = useState('');
  const [skillId, setSkillId] = useState('');
  const [removeTarget, setRemoveTarget] = useState<{ sid: number; skid: number; name: string } | null>(null);

  const items = asArray<any>(data);
  const skillList = Array.isArray(allSkills) ? allSkills : (allSkills as any)?.items ?? [];

  const assign = async () => {
    if (!skillId || !user?.studentId) return;
    try {
      await api.post('/api/student-skills', { studentId: user.studentId, skillId: Number(skillId) });
      setMsg('Skill added');
      setSkillId('');
      refetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.message);
    }
  };

  const remove = async () => {
    if (!removeTarget) return;
    try {
      await api.delete(`/api/student-skills/${removeTarget.sid}/${removeTarget.skid}`);
      setMsg('Skill removed');
      refetch();
      setTimeout(() => setMsg(''), 3000);
    } catch (e: any) {
      setMsg(e.message);
    }
    setRemoveTarget(null);
  };

  const ownIds = new Set(items.map((ss) => ss.skillId));
  const available = skillList.filter((s: any) => !ownIds.has(s.id));

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('error') ? 'error' : 'success'} onClose={() => setMsg('')} />}
      <PageHeader title="My Skills" subtitle={`${items.length} skills on your profile`} />

      <Card className="mb-4">
        <div className="flex flex-col gap-2 p-4 sm:flex-row">
          <div className="flex-1">
            <Select value={skillId} onChange={(e) => setSkillId(e.target.value)} aria-label="Select a skill to add">
              <option value="">Select a skill to add…</option>
              {available.length === 0 && <option value="" disabled>No more skills available</option>}
              {available.map((s: any) => <option key={s.id} value={s.id}>{s.skillName}{s.category ? ` (${s.category})` : ''}</option>)}
            </Select>
          </div>
          <Button onClick={assign} disabled={!skillId}>
            <Plus className="h-4 w-4" />
            Add Skill
          </Button>
        </div>
      </Card>

      {isLoading && !items.length ? (
        <Loading label="Loading skills…" />
      ) : (
        <Card>
          <div className="p-4">
            {items.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No skills added yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {items.map((ss) => ss.skill && (
                  <div key={`${ss.studentId}-${ss.skillId}`} className="flex items-center gap-2 rounded-full border border-border bg-muted/40 pl-3 pr-1.5 py-1 text-sm">
                    <span className="font-medium text-foreground">{ss.skill.skillName}</span>
                    {ss.skill.category && <Badge tone="purple">{ss.skill.category}</Badge>}
                    <ActionMenu
                      a11yLabel={`Remove ${ss.skill.skillName}`}
                      trigger={<X className="h-3.5 w-3.5" />}
                      size="icon"
                      items={[{ label: 'Remove', icon: <X className="h-4 w-4" />, destructive: true, onClick: () => setRemoveTarget({ sid: ss.studentId, skid: ss.skillId, name: ss.skill.skillName }) }]}
                      buttonClassName="h-6 w-6 rounded-full text-muted-foreground hover:text-red-600"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove skill?"
        message={`Remove "${removeTarget?.name}" from your profile?`}
        confirmLabel="Remove"
        destructive
        onConfirm={remove}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  );
}