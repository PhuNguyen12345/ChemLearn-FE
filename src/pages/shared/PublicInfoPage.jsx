import React from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Atom,
  Beaker,
  BookOpen,
  Building2,
  CircleHelp,
  FlaskConical,
  Handshake,
  LifeBuoy,
  Mail,
  MonitorPlay,
  Scale,
  ShieldCheck,
} from 'lucide-react';

const pages = {
  features: {
    title: 'Tính năng',
    eyebrow: 'Platform features',
    description: 'ChemLearn gom bài học, luyện tập, phòng thí nghiệm ảo và theo dõi tiến độ vào một nền tảng học Hóa học thống nhất cho học sinh THCS.',
    icon: Atom,
    sections: [
      {
        heading: 'Bài học trực quan',
        body: 'Nội dung học tập được chia theo chương, có ví dụ gần gũi và cách trình bày giúp học sinh dễ nắm các khái niệm nền tảng của Hóa học.',
      },
      {
        heading: 'Luyện tập có phản hồi',
        body: 'Học sinh có thể làm câu hỏi trắc nghiệm, nhận kết quả tức thì và tiếp tục ôn lại các phần chưa vững để xây dựng thói quen tự học.',
      },
      {
        heading: 'Theo dõi tiến độ',
        body: 'Giáo viên và phụ huynh có thể quan sát quá trình học, kết quả luyện tập và mức độ hoàn thành để hỗ trợ học sinh đúng thời điểm.',
      },
    ],
  },
  'virtual-lab': {
    title: 'Phòng thí nghiệm ảo',
    eyebrow: 'Virtual lab',
    description: 'Không gian mô phỏng giúp học sinh quan sát, thử nghiệm và ghi nhớ phản ứng hóa học trong môi trường an toàn, sinh động.',
    icon: MonitorPlay,
    sections: [
      {
        heading: 'Thực hành an toàn',
        body: 'Học sinh có thể thao tác với dụng cụ, hóa chất và phản ứng mô phỏng mà không gặp rủi ro về cháy nổ, độc hại hoặc thiếu thiết bị thực tế.',
      },
      {
        heading: 'Mô phỏng dễ quan sát',
        body: 'Các hiện tượng như đổi màu, tạo kết tủa, sinh khí hoặc thay đổi nhiệt độ được trình bày trực quan để học sinh kết nối lý thuyết với hiện tượng.',
      },
      {
        heading: 'Gắn với bài học',
        body: 'Phòng thí nghiệm ảo có thể dùng như hoạt động khám phá trước bài học, minh họa trong giờ học hoặc bài thực hành củng cố sau khi học xong.',
      },
    ],
  },
  simulation: {
    title: 'Mô phỏng hóa học',
    eyebrow: 'Simulation',
    description: 'Các mô phỏng trong ChemLearn giúp học sinh quan sát quá trình hóa học từng bước, từ hiện tượng ban đầu đến kết quả sau phản ứng.',
    icon: MonitorPlay,
    sections: [
      {
        heading: 'Quan sát từng bước',
        body: 'Mô phỏng chia nhỏ quá trình học thành các thao tác dễ theo dõi, giúp học sinh hiểu điều gì đang xảy ra thay vì chỉ ghi nhớ kết quả.',
      },
      {
        heading: 'Kết nối lý thuyết và hiện tượng',
        body: 'Học sinh có thể liên hệ công thức, chất tham gia, sản phẩm và dấu hiệu phản ứng như đổi màu, sinh khí hoặc tạo kết tủa.',
      },
      {
        heading: 'Học qua tương tác',
        body: 'Các hoạt động kéo thả, chọn dụng cụ, phối hợp chất và nhận phản hồi giúp bài học bớt khô khan và dễ ghi nhớ hơn.',
      },
    ],
  },
  experiments: {
    title: 'Thí nghiệm tương tác',
    eyebrow: 'Experiments',
    description: 'Thư viện thí nghiệm giúp học sinh luyện quan sát, dự đoán và rút ra kết luận trong một môi trường an toàn.',
    icon: Beaker,
    sections: [
      {
        heading: 'Thực hành theo nhiệm vụ',
        body: 'Mỗi thí nghiệm có mục tiêu rõ ràng để học sinh biết cần quan sát điều gì, thao tác ra sao và kết luận theo hướng nào.',
      },
      {
        heading: 'Phản hồi tức thì',
        body: 'Sau mỗi bước, học sinh nhận được tín hiệu hoặc kết quả mô phỏng để điều chỉnh cách làm và củng cố kiến thức ngay trong lúc học.',
      },
      {
        heading: 'An toàn và linh hoạt',
        body: 'Giáo viên có thể dùng thí nghiệm tương tác để minh họa trên lớp, giao hoạt động tự học hoặc giúp học sinh ôn lại trước giờ thực hành thật.',
      },
    ],
  },
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
        heading: 'Facebook',
        body: 'https://www.facebook.com/profile.php?id=61590133187859',
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
    description: 'ChemLearn hỗ trợ nhiều mô hình sử dụng cho cá nhân, lớp học và nhà trường. Các gói lớp 6-9 hiện được cấu hình 300.000 VND cho 365 ngày sử dụng.',
    icon: BookOpen,
    sections: [
      {
        heading: 'Gói Lớp 6',
        body: '300.000 VND / 365 ngày. Phù hợp với học sinh bắt đầu làm quen các kiến thức Hóa học nền tảng và hoạt động mô phỏng cơ bản.',
      },
      {
        heading: 'Gói Lớp 7',
        body: '300.000 VND / 365 ngày. Bao gồm bài học, luyện tập và hoạt động tương tác theo cấp độ lớp 7.',
      },
      {
        heading: 'Gói Lớp 8',
        body: '300.000 VND / 365 ngày. Hỗ trợ học sinh luyện tập kiến thức trọng tâm, theo dõi tiến độ và khám phá phòng thí nghiệm ảo.',
      },
      {
        heading: 'Gói Lớp 9',
        body: '300.000 VND / 365 ngày. Phù hợp cho ôn tập, củng cố kiến thức cuối cấp và chuẩn bị nền tảng lên THPT.',
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
  { label: 'Tính năng', slug: 'features' },
  { label: 'Mô phỏng', slug: 'simulation' },
  { label: 'Thí nghiệm', slug: 'experiments' },
  { label: 'Phòng thí nghiệm ảo', slug: 'virtual-lab' },
  { label: 'Bảng giá', slug: 'pricing' },
  { label: 'Dành cho trường học', slug: 'schools' },
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
