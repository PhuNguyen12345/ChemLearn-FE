import React from 'react';
import { MailPlus, Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import MailDeliveryReminder from '@/components/shared/MailDeliveryReminder';
import { sendAdminMailBroadcast } from '@/lib/api';

const roleOptions = [
  { value: 'ROLE_STUDENT', label: 'Học sinh' },
  { value: 'ROLE_PARENT', label: 'Phụ huynh' },
  { value: 'ROLE_TEACHER', label: 'Giáo viên' },
  { value: 'ROLE_ADMIN', label: 'Admin' },
];

const initialForm = {
  subject: '',
  category: 'Thông báo ChemLearn',
  title: '',
  message: '',
  highlights: '',
  ctaLabel: 'Mở ChemLearn',
  ctaUrl: '/student/home',
  targetRoles: ['ROLE_STUDENT'],
};

export default function AdminMailNotifications() {
  const [form, setForm] = React.useState(initialForm);
  const [sending, setSending] = React.useState(false);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleRole = (role) => {
    setForm((current) => {
      const exists = current.targetRoles.includes(role);
      const targetRoles = exists
        ? current.targetRoles.filter((item) => item !== role)
        : [...current.targetRoles, role];
      return { ...current, targetRoles };
    });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.targetRoles.length) {
      toast.error('Vui lòng chọn ít nhất một nhóm người nhận.');
      return;
    }

    setSending(true);
    try {
      const payload = {
        ...form,
        highlights: form.highlights
          .split('\n')
          .map((item) => item.trim())
          .filter(Boolean),
      };
      const response = await sendAdminMailBroadcast(payload);
      toast.success(`Đã đưa ${response.queuedEmails || 0} email vào hàng gửi.`);
      setForm(initialForm);
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không gửi được mail thông báo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Mail thông báo</h1>
          <p className="text-sm text-muted-foreground">
            Soạn nội dung thông báo, hệ thống sẽ gửi bằng template ChemLearn thống nhất.
          </p>
        </div>
        <Badge className="w-fit bg-cyan-100 text-cyan-700 hover:bg-cyan-100">
          <Sparkles className="mr-1 h-3.5 w-3.5" /> HTML template
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailPlus className="h-5 w-5 text-cyan-700" /> Soạn mail
            </CardTitle>
            <CardDescription>
              Nội dung ở đây sẽ được backend đưa vào template mail có mascot, CTA và danh sách điểm nổi bật.
            </CardDescription>
            <MailDeliveryReminder className="mt-3" />
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Subject">
                  <Input value={form.subject} onChange={(event) => setField('subject', event.target.value)} maxLength={140} required />
                </Field>
                <Field label="Nhãn mail">
                  <Input value={form.category} onChange={(event) => setField('category', event.target.value)} maxLength={60} />
                </Field>
              </div>

              <Field label="Tiêu đề hiển thị">
                <Input value={form.title} onChange={(event) => setField('title', event.target.value)} maxLength={160} required />
              </Field>

              <Field label="Nội dung chính">
                <textarea
                  value={form.message}
                  onChange={(event) => setField('message', event.target.value)}
                  maxLength={1200}
                  required
                  rows={6}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Field>

              <Field label="Điểm nổi bật">
                <textarea
                  value={form.highlights}
                  onChange={(event) => setField('highlights', event.target.value)}
                  rows={4}
                  placeholder="Mỗi dòng là một ý trong email"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Nút CTA">
                  <Input value={form.ctaLabel} onChange={(event) => setField('ctaLabel', event.target.value)} maxLength={60} />
                </Field>
                <Field label="Đường dẫn CTA">
                  <Input value={form.ctaUrl} onChange={(event) => setField('ctaUrl', event.target.value)} maxLength={500} />
                </Field>
              </div>

              <div className="space-y-2">
                <Label>Người nhận</Label>
                <div className="grid gap-2 sm:grid-cols-2">
                  {roleOptions.map((role) => (
                    <label
                      key={role.value}
                      className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={form.targetRoles.includes(role.value)}
                        onChange={() => toggleRole(role.value)}
                      />
                      {role.label}
                    </label>
                  ))}
                </div>
              </div>

              <Button type="submit" disabled={sending} className="w-full sm:w-auto">
                <Send className="mr-2 h-4 w-4" />
                {sending ? 'Đang gửi...' : 'Gửi mail thông báo'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Xem trước nội dung</CardTitle>
            <CardDescription>Phần template màu sắc/ảnh mascot sẽ do backend render khi gửi thật.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-cyan-100 bg-cyan-50 p-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-700">{form.category || 'Thông báo ChemLearn'}</p>
              <h2 className="mt-3 text-2xl font-bold leading-snug text-slate-950">{form.title || 'Tiêu đề email'}</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-700">
                {form.message || 'Nội dung email sẽ hiển thị tại đây.'}
              </p>
              <div className="mt-4 space-y-2">
                {form.highlights
                  .split('\n')
                  .map((item) => item.trim())
                  .filter(Boolean)
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item} className="rounded-md bg-white px-3 py-2 text-sm text-slate-700">
                      {item}
                    </div>
                  ))}
              </div>
              <div className="mt-5 inline-flex rounded-full bg-cyan-700 px-4 py-2 text-sm font-bold text-white">
                {form.ctaLabel || 'Mở ChemLearn'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
