import { sanitizeInput } from '../security';

describe('sanitizeInput', () => {
  test('should return non-string input as-is', () => {
    expect(sanitizeInput(123)).toBe(123);
    expect(sanitizeInput(null)).toBe(null);
    expect(sanitizeInput(undefined)).toBe(undefined);
    expect(sanitizeInput({ key: 'value' })).toEqual({ key: 'value' });
  });

  test('should remove all HTML tags', () => {
    const input = '<script>alert(\'xss\')</script>Hello';
    expect(sanitizeInput(input)).toBe('');
    
    const input2 = '<div>Test<span>content</span></div>';
    expect(sanitizeInput(input2)).toBe('Testcontent');
  });

  test('should remove dangerous attributes', () => {
    const input = '<a href="javascript:alert(\'xss\')">Click me</a>';
    expect(sanitizeInput(input)).toBe('Click me');
    
    const input2 = '<div onclick="maliciousCode()">Content</div>';
    expect(sanitizeInput(input2)).toBe('Content');
  });

  test('should handle complex XSS attempts', () => {
    const xssAttempts = [
      { 
        input: '<img src="x" onerror="alert(\'XSS\')">',
        expected: ''
      },
      {
        input: '<a href="javascript:evil()">Click</a>',
        expected: 'Click'
      },
      {
        input: '<div style="background: url(javascript:evil())">Test</div>',
        expected: 'Test'
      },
      {
        input: '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4=">Click</a>',
        expected: 'Click'
      },
      {
        input: '<script>evil()</script>',
        expected: 'evil()'
      },
      {
        input: '<img src="x" onerror="evil()">',
        expected: ''
      },
      {
        input: 'Normal text with <b>some</b> HTML',
        expected: 'Normal text with some HTML'
      }
    ];

    xssAttempts.forEach(({ input, expected }) => {
      expect(sanitizeInput(input)).toBe(expected);
    });
  });

  test('should preserve basic text content', () => {
    const input = 'This is a test message with numbers 123 and symbols !@#';
    expect(sanitizeInput(input)).toBe(input);
  });

  test('should handle empty strings', () => {
    expect(sanitizeInput('')).toBe('');
  });

  test('should trim whitespace', () => {
    expect(sanitizeInput('  test  ')).toBe('test');
  });
});
