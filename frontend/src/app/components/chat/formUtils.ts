import type { ChatResponse } from '../../../lib/api/chat';
import type { ChatFormType } from './types';

/** Detect when AI asks for customer/booking info but forgot form_request type */
export function inferFormFromResponse(res: ChatResponse): ChatFormType | undefined {
  const form = res.form;
  if (
    form === 'intake' ||
    form === 'customer' ||
    form === 'booking' ||
    form === 'customer_profile' ||
    form === 'body_metrics'
  ) {
    return form === 'body_metrics' ? 'customer_profile' : form;
  }
  if (res.type === 'booking_success' && (form === 'body_metrics' || form === 'customer_profile')) {
    return 'customer_profile';
  }

  const text = res.message.toLowerCase();

  const asksName =
    text.includes('họ tên') ||
    text.includes('họ và tên') ||
    (text.includes('tên') && (text.includes('bạn') || text.includes('của bạn')));

  const asksPhone =
    text.includes('điện thoại') ||
    text.includes('số điện thoại') ||
    text.includes('sđt');

  const asksCustomer = asksName && asksPhone;

  const asksDateTime =
    text.includes('ngày và giờ') ||
    (text.includes('ngày') && text.includes('giờ'));

  const asksBooking = asksDateTime;

  if (asksCustomer && asksDateTime) return 'intake';
  if (asksCustomer) return 'customer';
  if (asksBooking) return 'booking';

  return undefined;
}

/** Short intro above inline form — skip long numbered lists in markdown */
export function introForForm(content: string, form: ChatFormType): string {
  const beforeList = content.split(/\n\s*\d+[\.\)]/)[0].trim();
  const firstSentence = beforeList.split(/\n\n/)[0]?.trim() || beforeList;

  if (firstSentence.length > 0 && firstSentence.length < 200) {
    return firstSentence;
  }

  if (form === 'intake') {
    return 'Để đặt lịch tập, bạn điền thông tin ngay tại đây nhé:';
  }
  if (form === 'customer_profile' || form === 'body_metrics') {
    return (
      'Chúng tôi đã ghi nhận thông tin của bạn và sẽ liên hệ với bạn sớm nhất. ' +
      'Trước mắt, bạn hãy cho chúng tôi biết thêm một chút về bản thân và mục tiêu tập luyện của bạn nhé!'
    );
  }
  return form === 'customer'
    ? 'Để lưu thông tin, bạn điền ngay tại đây nhé:'
    : 'Bạn điền thông tin đặt lịch ngay tại đây nhé:';
}
