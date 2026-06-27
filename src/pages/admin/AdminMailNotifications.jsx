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
  targetRoles: ['ROLE_STUDENT'],
};

const DEFAULT_CTA_LABEL = 'Mở ChemLearn';
const DEFAULT_CTA_URL = '/student/home';
const previewIcons = ['🔔', '🧪', '🔥', '⭐', '💬'];

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
      const highlights = form.highlights
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
      const payload = {
        ...form,
        highlights,
        ctaLabel: DEFAULT_CTA_LABEL,
        ctaUrl: DEFAULT_CTA_URL,
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

  const previewHighlights = form.highlights
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 5);
  const displayHighlights = previewHighlights.length
    ? previewHighlights
    : [
      'Mở ChemLearn để tiếp tục hành trình học hôm nay.',
      'Bi sẽ nhắc bạn từng bước nhỏ để việc học nhẹ hơn.',
    ];

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
              Nội dung ở đây sẽ được backend đưa vào template mail có ảnh header và danh sách điểm nổi bật.
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
            <CardDescription>Preview mô phỏng layout mail thật, gồm ảnh header, nội dung, danh sách điểm nổi bật và nút mặc định.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden border border-[#e3ddf5] bg-[#f4f2fb]">
              <div className="mx-auto max-w-[640px] bg-white">
                <img
                  src="/chemlearn-mail-header.png"
                  alt="ChemLearn"
                  className="block h-auto w-full"
                />

                <div className="px-7 py-7 text-left">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#1f7a2e]">
                    {form.category || 'Thông báo ChemLearn'}
                  </p>
                  <h2 className="mt-4 text-3xl font-black leading-tight text-[#2b2835]">
                    {form.title || 'Tiêu đề email'}
                  </h2>
                  <p className="mt-5 text-[17px] font-extrabold leading-7 text-[#34303d]">
                    Xin chào người nhận,
                  </p>
                  <p className="mt-2 whitespace-pre-line text-base leading-7 text-[#665f7c]">
                    {form.message || 'Nội dung email sẽ hiển thị tại đây.'}
                  </p>
                </div>

                <div className="mx-7 h-px bg-[#e6e0f4]" />

                <div className="px-7 py-7 text-left">
                  <h3 className="text-2xl font-black leading-tight text-[#2b2835]">
                    Cùng Bi làm ngay nhé
                  </h3>
                  <div className="mt-6 space-y-5">
                    {displayHighlights.map((item, index) => (
                      <div key={`${item}-${index}`} className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#efe7ff] text-2xl">
                          {previewIcons[index % previewIcons.length]}
                        </div>
                        <div>
                          <p className="text-base font-extrabold leading-6 text-[#1f2937]">{item}</p>
                          <p className="mt-1 text-sm leading-6 text-[#6b6280]">Bi sẽ đồng hành cùng bạn từng bước.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-7">
                    <div className="inline-flex rounded-[10px] border-b-4 border-[#48ad09] bg-[#78f51d] px-8 py-3 text-sm font-black uppercase tracking-wide text-[#07120d]">
                      {DEFAULT_CTA_LABEL}
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#e6e0f4] bg-[#f7f5fc] px-7 py-6 text-left">
                  <p className="text-sm leading-6 text-[#746c87]">
                    ChemLearn gửi email này để bạn không bỏ lỡ hoạt động học tập quan trọng.
                  </p>
                  <p className="mt-4 text-xs leading-5 text-[#8a8399]">
                    ChemLearn - Học hóa dễ hiểu, nhớ lâu, đạt điểm cao
                  </p>
                </div>
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

