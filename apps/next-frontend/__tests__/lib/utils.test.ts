import { cn } from '../../lib/utils';

describe('Utils', () => {
  describe('cn function', () => {
    test('should combine class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    test('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'not-shown')).toBe('base conditional');
    });

    test('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'valid')).toBe('base valid');
    });

    test('should handle empty strings', () => {
      expect(cn('base', '', 'valid')).toBe('base valid');
    });
  });
});
