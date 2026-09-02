import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { API_BASE_URL, api } from '../../api/client';
import { PageHeader, Card, CardContent, Button, StatusBadge, Loading, Modal, FormField, Input, Select, Toast, EmptyState } from '../../components/ui';
import { FileText, Upload, ExternalLink, Download, Award, Building2 } from 'lucide-react';
import { asArray, formatLpa } from '../../utils/cn';
import type { Student, Certification, Internship, Placement } from '../../types';

interface DocItem {
  id: string;
  kind: string;
  title: string;
  subtitle: string;
  url: string | null | undefined;
  meta: string;
}

export default function StudentDocumentCenter() {
  const { isLoading } = useApi<Student>(['student-me', 'docs'], '/api/students/me');
  const { data: certs } = useApi<Certification[]>(['certs-doc'], '/api/certifications');
  const { data: internships } = useApi<Internship[]>(['internships-doc'], '/api/internships');
  const { data: placements } = useApi<Placement[]>(['placements-doc'], '/api/placements');

  const [showForm, setShowForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState('certification');
  const [title, setTitle] = useState('');
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  const notify = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3000);
  };

  const docs: (DocItem & { url: string })[] = [
    ...asArray<Certification>(certs).map((c) => ({ id: `cert-${c.id}`, kind: 'Certification', title: c.certificationName, subtitle: c.issuingOrganisation, url: c.certificationUrl, meta: c.certificationUrl ? 'Viewable' : 'No document attached' })),
    ...asArray<Internship>(internships).map((i) => ({ id: `intern-${i.id}`, kind: 'Internship', title: `Internship — ${i.companyName}`, subtitle: i.role, url: i.certificateUrl, meta: i.certificateUrl ? 'Viewable' : 'No document attached' })),
    ...asArray<Placement>(placements)
      .filter((p) => p.offerLetter?.documentUrl)
      .map((p) => ({ id: `offer-${p.id}`, kind: 'Offer Letter', title: `Offer — ${p.offerLetter?.companyName}`, subtitle: p.jobRole, url: p.offerLetter?.documentUrl, meta: formatLpa(p.offerLetter?.packageLpa) })),
  ].filter((d): d is DocItem & { url: string } => !!d.url);

  const handleUpload = async () => {
    if (!file) {
      notify('Select a file to upload');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const uploadBody = await uploadRes.json();
      if (!uploadRes.ok || uploadBody.success === false) {
        throw new Error(uploadBody.message || 'Upload failed');
      }
      const url = uploadBody.url ?? uploadBody.data?.url;
      if (!url) throw new Error('Upload succeeded but no URL returned');
      const today = new Date().toISOString().slice(0, 10);
      if (kind === 'certification') {
        await api.post('/api/certifications', {
          certificationName: title || file.name,
          issuingOrganisation: 'Self-uploaded',
          issuingDate: today,
          certificationUrl: url,
        });
      } else if (kind === 'internship') {
        await api.post('/api/internships', {
          companyName: title || file.name,
          role: 'Document',
          startDate: today,
          certificateUrl: url,
        });
      }
      notify('Document uploaded');
      setShowForm(false);
      setFile(null);
      setTitle('');
    } catch (e: any) {
      notify(e.message);
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) return <Loading label="Loading documents…" />;

  return (
    <div>
      {msg && <Toast message={msg} type={msg.toLowerCase().includes('error') || msg.toLowerCase().includes('select') ? 'error' : 'success'} onClose={() => setMsg('')} />}
      <PageHeader
        title="Document Center"
        subtitle="View and download your uploaded documents"
        action={<Button onClick={() => setShowForm(true)}><Upload className="h-4 w-4" />Upload Document</Button>}
      />

      {docs.length === 0 ? (
        <Card>
          <EmptyState title="No documents yet" message="Upload resumes, certificates, internship documents or offer letters to keep them in one place." action={<Button size="sm" onClick={() => setShowForm(true)}><Upload className="h-4 w-4" />Upload Document</Button>} />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {docs.map((d) => (
            <Card key={d.id}>
              <CardContent className="flex items-start gap-3 py-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  {d.kind === 'Certification' ? <Award className="h-5 w-5" /> : d.kind === 'Internship' ? <Building2 className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium text-foreground">{d.title}</span>
                    <StatusBadge status={d.kind} />
                  </div>
                  {d.subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{d.subtitle}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">{d.meta}</p>
                  <div className="mt-2 flex gap-2">
                    <a href={d.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </a>
                    <a href={d.url} download className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:underline">
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Upload Document"
        description="Upload a file (PDF, image or DOCX, max 5MB). It will be attached to one of your records."
        size="md"
        footer={
          <>
            <Button variant="outline" type="button" onClick={() => setShowForm(false)} disabled={uploading}>Cancel</Button>
            <Button onClick={handleUpload} disabled={uploading}>{uploading ? 'Uploading…' : 'Upload'}</Button>
          </>
        }
      >
        <form className="grid gap-3" onSubmit={(e) => { e.preventDefault(); handleUpload(); }}>
          <FormField label="Document type" required>
            <Select value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="certification">Certification / Certificate</option>
              <option value="internship">Internship document</option>
            </Select>
          </FormField>
          <FormField label="Title (optional)">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder={`e.g. ${kind === 'certification' ? 'AWS Certification' : 'Internship certificate'}`} />
          </FormField>
          <FormField label="File" required hint="PDF, JPEG, PNG, WEBP, DOC, DOCX · max 5MB">
            <input
              type="file"
              accept=".pdf,image/jpeg,image/png,image/webp,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-foreground file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-primary-foreground file:hover:bg-primary/90"
            />
          </FormField>
          {msg && msg.toLowerCase().includes('error') && <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{msg}</p>}
        </form>
      </Modal>
    </div>
  );
}
