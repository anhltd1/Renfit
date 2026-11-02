import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Testimonials } from './Testimonials';
import type { TestimonialsContent } from '../../lib/api/siteContent';

beforeAll(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

const CONTENT: TestimonialsContent = {
  title: 'Khách hàng ở Renfit nói gì',
  subtitle: 'Chia sẻ thật từ hội viên.',
  items: [
    { name: 'Chị Minh Anh', detail: 'Hội viên 6 tháng', message: 'Tiến bộ rõ rệt.', image: 'https://img/1.jpg' },
    { name: 'Anh Long', detail: '', message: 'Lịch tập linh hoạt.', image: '' },
    { name: '', detail: '', message: 'Bỏ qua vì thiếu tên', image: '' },
  ],
};

describe('Testimonials', () => {
  it('renders the section title with the emerald highlight and each complete testimonial', () => {
    render(<Testimonials content={CONTENT} />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Khách hàng ở Renfit nói gì');
    expect(screen.getByText('nói gì')).toHaveClass('text-[#0F6B3E]');
    expect(screen.getByText('Chia sẻ thật từ hội viên.')).toBeInTheDocument();

    const items = screen.getByTestId('testimonials-list').querySelectorAll('li');
    expect(items).toHaveLength(2); // the nameless entry is skipped
    expect(screen.getByText(/Tiến bộ rõ rệt/)).toBeInTheDocument();
    expect(screen.getByAltText('Chị Minh Anh')).toHaveAttribute('src', 'https://img/1.jpg');
    expect(screen.getByText('Hội viên 6 tháng')).toBeInTheDocument();
  });

  it('lays each card out as big photo, then name, then message', () => {
    render(<Testimonials content={CONTENT} />);
    const card = screen.getByTestId('testimonials-list').querySelector('li')!;
    const photo = card.querySelector('img')!;
    const name = screen.getByRole('heading', { level: 3, name: 'Chị Minh Anh' });
    const quote = card.querySelector('blockquote')!;

    expect(photo.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(name.compareDocumentPosition(quote) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(quote).toHaveTextContent('Tiến bộ rõ rệt.');
    expect(photo).toHaveClass('object-cover');
  });

  it('falls back to an initial when there is no photo', () => {
    render(<Testimonials content={CONTENT} />);
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('renders nothing when there are no testimonials', () => {
    const { container } = render(<Testimonials content={{ ...CONTENT, items: [] }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('uses the section id so it can be linked to', () => {
    const { container } = render(<Testimonials content={CONTENT} />);
    expect(container.querySelector('section#testimonials')).not.toBeNull();
  });
});
