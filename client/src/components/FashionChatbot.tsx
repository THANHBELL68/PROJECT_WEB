'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type ChatMessage = { id: number; sender: 'assistant' | 'user'; text: string; action?: { label: string; href: string } };

const quickQuestions = ['Gợi ý phối đồ', 'Tư vấn chọn size', 'Hỗ trợ đơn hàng'];

function replyFor(message: string): Pick<ChatMessage, 'text' | 'action'> {
  const question = message.toLocaleLowerCase('vi');
  if (/phối|mix|mặc gì|đi làm|dạo phố/.test(question)) {
    return { text: 'Bạn có thể thử áo polo hoặc áo thun basic cùng quần chinos cho vẻ ngoài gọn gàng hằng ngày. Nếu muốn nữ tính hơn, áo thun sáng màu phối cùng chân váy hoặc quần ống rộng là lựa chọn dễ mặc.', action: { label: 'Khám phá sản phẩm', href: '/products' } };
  }
  if (/size|kích cỡ|cỡ|vừa không/.test(question)) {
    return { text: 'Mình có thể giúp bạn chọn size. Bạn gửi chiều cao, cân nặng và sản phẩm đang quan tâm nhé. Nếu muốn nhân viên tư vấn trực tiếp, gọi hotline AETHER từ 8:00 đến 21:30.', action: { label: 'Gọi 1900989898', href: 'tel:1900989898' } };
  }
  if (/đơn hàng|vận chuyển|giao hàng|ship|đổi trả|đổi size/.test(question)) {
    return { text: 'Thời gian giao hàng dự kiến: nội thành khoảng 2 giờ, các tỉnh từ 2–4 ngày. AETHER hỗ trợ đổi size trong 7 ngày kể từ khi nhận hàng. Để kiểm tra đơn cụ thể, bạn có thể vào hồ sơ hoặc liên hệ CSKH.', action: { label: 'Xem hồ sơ', href: '/profile' } };
  }
  if (/nhân viên|hotline|liên hệ|tư vấn viên|email/.test(question)) {
    return { text: 'Đội ngũ CSKH AETHER hỗ trợ mỗi ngày. Hotline: 1900989898 (8:00–21:30), email: AETHER.Corporation@gmail.com.', action: { label: 'Gọi hotline 1900989898', href: 'tel:1900989898' } };
  }
  return { text: 'Mình sẵn sàng hỗ trợ bạn chọn đồ, phối trang phục, chọn size hoặc giải đáp về giao hàng và đổi size. Bạn muốn tìm hiểu phần nào?', action: { label: 'Xem thời trang Nam', href: '/products?category=thoi-trang-nam' } };
}

export function FashionChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, sender: 'assistant', text: 'Xin chào! Mình là trợ lý AETHER. Bạn cần tư vấn phối đồ, chọn size hay hỗ trợ đơn hàng?' },
  ]);
  const nextId = useRef(1);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, open]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const response = replyFor(trimmed);
    setMessages((current) => [...current,
      { id: nextId.current++, sender: 'user', text: trimmed },
      { id: nextId.current++, sender: 'assistant', ...response },
    ]);
    setInput('');
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(input);
  }

  return <div className="fashion-chatbot">
    {open && <section className="fashion-chat-panel" aria-label="Tư vấn thời trang và chăm sóc khách hàng">
      <header className="fashion-chat-header"><div><span className="fashion-chat-status" /><div><strong>AETHER Assistant</strong><small>Tư vấn thời trang · CSKH</small></div></div><button type="button" onClick={() => setOpen(false)} aria-label="Đóng cửa sổ chat">×</button></header>
      <a className="fashion-chat-hotline" href="tel:1900989898"><span>Hotline chăm sóc khách hàng</span><strong>1900989898</strong></a>
      <div className="fashion-chat-messages" aria-live="polite">
        {messages.map((message) => <div className={`fashion-chat-message ${message.sender}`} key={message.id}><p>{message.text}</p>{message.action && <Link href={message.action.href}>{message.action.label} ↗</Link>}</div>)}
        {messages.length === 1 && <div className="fashion-chat-quick-questions">{quickQuestions.map((question) => <button key={question} type="button" onClick={() => send(question)}>{question}</button>)}</div>}
        <div ref={endRef} />
      </div>
      <form className="fashion-chat-form" onSubmit={submit}><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Nhập câu hỏi của bạn…" aria-label="Nhập câu hỏi cho AETHER" /><button type="submit" aria-label="Gửi tin nhắn" disabled={!input.trim()}>Gửi</button></form>
    </section>}
    <button className={`fashion-chat-launcher ${open ? 'is-open' : ''}`} type="button" onClick={() => setOpen((value) => !value)} aria-label={open ? 'Đóng tư vấn AETHER' : 'Mở tư vấn AETHER'} aria-expanded={open}>
      {open ? <span aria-hidden="true">×</span> : <><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H11l-5.5 4v-4.1A2.5 2.5 0 0 1 4 13.5v-8Z"/><path d="M8 8h8M8 11.5h5"/></svg><span>Chat</span></>}
    </button>
  </div>;
}
