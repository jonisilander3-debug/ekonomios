const mojibakePattern = /[\u00c3\u00c2\ufffd]/;

const directBrokenFragments: Array<[string, string]> = [
  ['ÃƒÆ’Ã‚Â¥', '\u00e5'],
  ['ÃƒÆ’Ã‚Â¤', '\u00e4'],
  ['ÃƒÆ’Ã‚Â¶', '\u00f6'],
  ['ÃƒÆ’Ã¢â‚¬â€œ', '\u00d6'],
  ['ÃƒÂ¥', '\u00e5'],
  ['ÃƒÂ¤', '\u00e4'],
  ['ÃƒÂ¶', '\u00f6'],
  ['Ãƒâ€“', '\u00d6'],
  ['fï¿½fÂ¶r', 'f\u00f6r'],
  ['fï¿½fÂ¶lj', 'f\u00f6lj'],
  ['fï¿½fÂ¥', 'f\u00e5'],
  ['nï¿½fÂ¤sta', 'n\u00e4sta'],
  ['pï¿½fÂ¥', 'p\u00e5'],
  ['gï¿½fÂ¥', 'g\u00e5'],
  ['lï¿½fÂ¶n', 'l\u00f6n'],
  ['Bokfï¿½fÂ¶r', 'Bokf\u00f6r'],
  ['flï¿½fÂ¶d', 'fl\u00f6d'],
  ['ï¿½-ppna', '\u00d6ppna'],
  ['ï¿½fÂ¶ppna', '\u00f6ppna'],
  ['ï¿½fÂ¶versikt', '\u00f6versikt'],
  ['avstï¿½fÂ¤m', 'avst\u00e4m'],
  ['fortsï¿½fÂ¤tt', 'forts\u00e4tt'],
  ['lï¿½fÂ¤gg', 'l\u00e4gg'],
  ['rï¿½fÂ¶relse', 'r\u00f6relse'],
  ['tillhï¿½fÂ¶r', 'tillh\u00f6r'],
  ['sï¿½fÂ¥', 's\u00e5'],
  ['ï¿½fÂ¤nnu', '\u00e4nnu'],
  ['Begrï¿½fÂ¤nsad', 'Begr\u00e4nsad'],
  ['Kï¿½fÂ¶r', 'K\u00f6r'],
  ['nï¿½fÂ¤rmar', 'n\u00e4rmar'],
  ['lï¿½fÂ¤ge', 'l\u00e4ge'],
  ['ï¿½fï¿½?"versikt', '\u00d6versikt'],
  ['ï¿½,Â·', ' \u00b7 '],
  ['Â·', '·']
];

const knownBrokenFragments: Array<[RegExp, string]> = [
  [/f\ufffdf\u00b6r/g, 'f\u00f6r'],
  [/f\ufffdf\u00b6lj/g, 'f\u00f6lj'],
  [/f\ufffdf\u00a5/g, 'f\u00e5'],
  [/n\ufffdf\u00a4sta/g, 'n\u00e4sta'],
  [/p\ufffdf\u00a5/g, 'p\u00e5'],
  [/g\ufffdf\u00a5/g, 'g\u00e5'],
  [/l\ufffdf\u00b6n/g, 'l\u00f6n'],
  [/Bokf\ufffdf\u00b6r/g, 'Bokf\u00f6r'],
  [/fl\ufffdf\u00b6d/g, 'fl\u00f6d'],
  [/\ufffd-ppna/g, '\u00d6ppna'],
  [/\ufffdf\u00b6ppna/g, '\u00f6ppna'],
  [/\ufffdf\u00b6versikt/g, '\u00f6versikt'],
  [/avst\ufffdf\u00a4m/g, 'avst\u00e4m'],
  [/forts\ufffdf\u00a4tt/g, 'forts\u00e4tt'],
  [/l\ufffdf\u00a4gg/g, 'l\u00e4gg'],
  [/r\ufffdf\u00b6relse/g, 'r\u00f6relse'],
  [/tillh\ufffdf\u00b6r/g, 'tillh\u00f6r'],
  [/s\ufffdf\u00a5/g, 's\u00e5'],
  [/\ufffdf\u00a4nnu/g, '\u00e4nnu'],
  [/Begr\ufffdf\u00a4nsad/g, 'Begr\u00e4nsad'],
  [/K\ufffdf\u00b6r/g, 'K\u00f6r'],
  [/n\ufffdf\u00a4rmar/g, 'n\u00e4rmar'],
  [/l\ufffdf\u00a4ge/g, 'l\u00e4ge']
];

export function repairTextEncoding(value: string): string {
  let current = value;

  for (const [from, to] of directBrokenFragments) {
    current = current.split(from).join(to);
  }

  for (let index = 0; index < 4; index += 1) {
    if (!mojibakePattern.test(current)) {
      break;
    }

    try {
      const bytes = Uint8Array.from(current, (character) => character.charCodeAt(0) & 0xff);
      const decoded = new TextDecoder('utf-8').decode(bytes);

      if (!decoded || decoded === current) {
        break;
      }

      current = decoded;
    } catch {
      break;
    }
  }

  for (const [from, to] of directBrokenFragments) {
    current = current.split(from).join(to);
  }

  return knownBrokenFragments.reduce(
    (result, [pattern, replacement]) => result.replace(pattern, replacement),
    current.replace(/\u00ad/g, '')
  );
}

export function sanitizeNestedStrings<T>(value: T): T {
  if (typeof value === 'string') {
    return repairTextEncoding(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeNestedStrings(item)) as T;
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeNestedStrings(nestedValue)])
    ) as T;
  }

  return value;
}