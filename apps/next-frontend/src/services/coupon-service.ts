import { api } from '@/lib/api';
import {
  Coupon,
  CreateCouponData,
  RedeemCouponData,
  RedemptionResult,
  CouponStats,
} from '@/types/coupons';

export class CouponService {
  static async getEventCoupons(eventId: string): Promise<Coupon[]> {
    const response = await api.get<Coupon[]>(`/eventos/${eventId}/cupones`);
    return response.data;
  }

  static async createCoupon(
    eventId: string,
    data: Omit<CreateCouponData, 'eventoid'>,
  ): Promise<Coupon> {
    const response = await api.post<Coupon>(`/eventos/${eventId}/cupones`, data);
    return response.data;
  }

  static async deleteCoupon(eventId: string, couponId: string): Promise<void> {
    await api.delete(`/eventos/${eventId}/cupones/${couponId}`);
  }

  static async redeemCoupon(data: Omit<RedeemCouponData, 'usuarioid'>): Promise<RedemptionResult> {
    const response = await api.post<RedemptionResult>('/redimir-cupon', data);
    return response.data;
  }

  static async getCouponStats(eventId: string): Promise<CouponStats> {
    const response = await api.get<CouponStats>(`/eventos/${eventId}/cupones/stats`);
    return response.data;
  }
}
