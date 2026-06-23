import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Building2,
  CircleHelp,
  FlaskConical,
  Handshake,
  LifeBuoy,
  Mail,
  Scale,
  ShieldCheck,
} from 'lucide-react';

const pages = {
  about: {
    title: 'Về ChemLearn',
    eyebrow: 'About us',
    description: 'ChemLearn giúp học sinh THCS tiếp cận Hóa học bằng bài học trực quan, phòng thí nghiệm ảo và hoạt động luyện tập có phản hồi tức thì.',
    icon: FlaskConical,
    sections: [
      {
        heading: 'Sứ mệnh',
        body: 'Chúng tôi xây dựng ChemLearn để biến các khái niệm trừu tượng như nguyên tử, phân tử và phản ứng hóa học thành trải nghiệm dễ quan sát, dễ thử nghiệm và dễ ghi nhớ.',
      },
      {
        heading: 'Dành cho ai',
        body: 'Nền tảng phục vụ học sinh, giáo viên, phụ huynh và nhà trường cần một môi trường học Hóa học an toàn, có cấu trúc và theo dõi được tiến độ.',
      },
      {
        heading: 'Cách tiếp cận',
        body: 'ChemLearn kết hợp nội dung bài học, mô phỏng tương tác, câu hỏi luyện tập và bảng tiến độ để hỗ trợ cả tự học lẫn giảng dạy trên lớp.',
      },
    ],
  },
  contact: {
    title: 'Liên hệ',
    eyebrow: 'Contact',
    description: 'Gửi câu hỏi về tài khoản, triển khai lớp học, hợp tác hoặc phản hồi sản phẩm cho đội ngũ ChemLearn.',
    icon: Mail,
    sections: [
      {
        heading: 'Email hỗ trợ',
        body: 'support@chemlearn.edu.vn',
      },
      {
        heading: 'Hợp tác trường học',
        body: 'schools@chemlearn.edu.vn',
      },
      {
        heading: 'Thời gian phản hồi',
        body: 'Chúng tôi thường phản hồi trong vòng 1-2 ngày làm việc. Với vấn đề đăng nhập hoặc truy cập lớp học, hãy gửi kèm email tài khoản và vai trò người dùng.',
      },
    ],
  },
  support: {
    title: 'Hỗ trợ',
    eyebrow: 'Support',
    description: 'Tìm hướng dẫn xử lý các vấn đề thường gặp khi đăng nhập, vào lớp, mở bài học hoặc sử dụng phòng thí nghiệm ảo.',
    icon: LifeBuoy,
    sections: [
      {
        heading: 'Không đăng nhập được',
        body: 'Kiểm tra lại email, mật khẩu và vai trò tài khoản. Nếu tài khoản do trường cấp, hãy liên hệ giáo viên hoặc quản trị viên lớp học.',
      },
      {
        heading: 'Không thấy bài học',
        body: 'Bài học có thể chưa được giáo viên xuất bản hoặc lớp học chưa được gán chương. Hãy kiểm tra lại lớp đang tham gia.',
      },
      {
        heading: 'Phòng thí nghiệm ảo bị chậm',
        body: 'Đóng các tab không cần thiết, dùng trình duyệt hiện đại và đảm bảo thiết bị có kết nối mạng ổn định.',
      },
    ],
  },
  faq: {
    title: 'Câu hỏi thường gặp',
    eyebrow: 'FAQ',
    description: 'Các câu hỏi phổ biến về tài khoản, bài học, lớp học và tính năng của ChemLearn.',
    icon: CircleHelp,
    sections: [
      {
        heading: 'ChemLearn có miễn phí không?',
        body: 'Một số nội dung có thể được mở miễn phí. Tính năng lớp học, quản lý tiến độ và triển khai cho trường có thể cần gói phù hợp.',
      },
      {
        heading: 'Học sinh có cần giáo viên mời vào lớp không?',
        body: 'Tùy cách triển khai. Học sinh có thể tự học nội dung công khai hoặc tham gia lớp bằng lời mời từ giáo viên, phụ huynh hoặc nhà trường.',
      },
      {
        heading: 'Dữ liệu học tập được dùng như thế nào?',
        body: 'Dữ liệu tiến độ được dùng để hiển thị kết quả học tập, gợi ý hoạt động phù hợp và hỗ trợ giáo viên theo dõi lớp.',
      },
    ],
  },
  terms: {
    title: 'Điều khoản sử dụng',
    eyebrow: 'Terms of service',
    description: 'Các điều khoản cơ bản khi sử dụng ChemLearn. Nội dung này là thông tin sản phẩm, không thay thế tư vấn pháp lý.',
    icon: Scale,
    sections: [
      {
        heading: 'Sử dụng tài khoản',
        body: 'Người dùng chịu trách nhiệm bảo mật thông tin đăng nhập và chỉ sử dụng tài khoản theo đúng vai trò được cấp.',
      },
      {
        heading: 'Hành vi được phép',
        body: 'Không được phá hoại hệ thống, truy cập trái phép dữ liệu, chia sẻ nội dung có hại hoặc sử dụng nền tảng cho mục đích gian lận học tập.',
      },
      {
        heading: 'Thay đổi dịch vụ',
        body: 'ChemLearn có thể cập nhật tính năng, giao diện hoặc nội dung học tập để cải thiện chất lượng dịch vụ.',
      },
    ],
  },
  privacy: {
    title: 'Chính sách bảo mật',
    eyebrow: 'Privacy policy',
    description: 'Tóm tắt cách ChemLearn xử lý thông tin tài khoản và dữ liệu học tập. Nội dung này là thông tin sản phẩm, không thay thế tư vấn pháp lý.',
    icon: ShieldCheck,
    sections: [
      {
        heading: 'Thông tin được thu thập',
        body: 'ChemLearn có thể lưu thông tin tài khoản, vai trò người dùng, lớp học, tiến độ học tập, câu trả lời bài luyện tập và nhật ký hoạt động cần thiết.',
      },
      {
        heading: 'Mục đích sử dụng',
        body: 'Dữ liệu được dùng để vận hành lớp học, cá nhân hóa trải nghiệm học tập, hỗ trợ kỹ thuật và cải thiện chất lượng sản phẩm.',
      },
      {
        heading: 'Bảo vệ dữ liệu',
        body: 'Chúng tôi áp dụng kiểm soát truy cập theo vai trò và chỉ hiển thị dữ liệu học tập cho những người có quyền phù hợp như học sinh, giáo viên, phụ huynh hoặc quản trị viên.',
      },
    ],
  },
  pricing: {
    title: 'Bảng giá',
    eyebrow: 'Pricing',
    description: 'ChemLearn hỗ trợ nhiều mô hình sử dụng cho cá nhân, lớp học và nhà trường.',
    icon: BookOpen,
    sections: [
      {
        heading: 'Học cá nhân',
        body: 'Phù hợp với học sinh muốn tự học, luyện tập và khám phá phòng thí nghiệm ảo.',
      },
      {
        heading: 'Lớp học',
        body: 'Phù hợp với giáo viên cần quản lý học sinh, giao nội dung và theo dõi tiến độ.',
      },
      {
        heading: 'Trường học',
        body: 'Phù hợp với nhà trường cần triển khai nhiều lớp, phân quyền tài khoản và hỗ trợ vận hành.',
      },
    ],
  },
  schools: {
    title: 'Dành cho trường học',
    eyebrow: 'For schools',
    description: 'ChemLearn có thể được triển khai cho tổ bộ môn, lớp học hoặc toàn trường với tài khoản theo vai trò.',
    icon: Building2,
    sections: [
      {
        heading: 'Triển khai lớp học',
        body: 'Giáo viên có thể tạo lớp, thêm học sinh, gán chương học và theo dõi tiến độ học tập.',
      },
      {
        heading: 'Quản trị nội dung',
        body: 'Nhà trường có thể chuẩn hóa tài liệu, bài học và hoạt động luyện tập theo chương trình giảng dạy.',
      },
      {
        heading: 'Yêu cầu tư vấn',
        body: 'Liên hệ schools@chemlearn.edu.vn để trao đổi về quy mô triển khai, nhu cầu tài khoản và hỗ trợ kỹ thuật.',
      },
    ],
  },
};

const quickLinks = [
  { label: 'Về chúng tôi', slug: 'about' },
  { label: 'Liên hệ', slug: 'contact' },
  { label: 'Hỗ trợ', slug: 'support' },
  { label: 'FAQ', slug: 'faq' },
  { label: 'Điều khoản', slug: 'terms' },
  { label: 'Bảo mật', slug: 'privacy' },
];

const PublicInfoPage = () => {
  const { pageSlug } = useParams();
  const page = pages[pageSlug];

  if (!page) {
    return <Navigate to="/info/about" replace />;
  }

  const Icon = page.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-2xl bg-cyan-400 p-2 text-white shadow-md shadow-cyan-500/30">
              <FlaskConical className="h-6 w-6" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight">
              Chem<span className="text-cyan-400">Learn</span>
            </span>
          </Link>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Trang chủ
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-14">
        <section className="grid gap-10 lg:grid-cols-[1fr_18rem]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-black text-cyan-200">
              <Icon className="h-4 w-4" />
              {page.eyebrow}
            </div>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">{page.title}</h1>
            <p className="mt-5 max-w-3xl text-lg font-medium leading-8 text-slate-300">{page.description}</p>

            <div className="mt-10 grid gap-4">
              {page.sections.map((section) => (
                <article key={section.heading} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <h2 className="text-xl font-black text-white">{section.heading}</h2>
                  <p className="mt-3 leading-7 text-slate-300">{section.body}</p>
                </article>
              ))}
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="mb-4 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
              <Handshake className="h-4 w-4" />
              Trang liên quan
            </div>
            <nav className="grid gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.slug}
                  to={`/info/${link.slug}`}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition ${
                    link.slug === pageSlug
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>
        </section>
      </main>
    </div>
  );
};

export default PublicInfoPage;
