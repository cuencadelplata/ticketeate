export interface CategorySettings {
  id: string;
  name: string;
  price: number;
  maxPerUser: number;
  maxTotal: number;
  description: string;
  benefits: string[];
  type: 'general' | 'vip' | 'premium' | 'custom';
  isEnabled: boolean;
}
