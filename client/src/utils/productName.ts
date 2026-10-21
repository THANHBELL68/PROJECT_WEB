export function formatProductName(name: string): string {
  const normalized = name.toLocaleLowerCase('vi-VN');
  const [first = '', ...rest] = [...normalized];
  return first.toLocaleUpperCase('vi-VN') + rest.join('');
}
