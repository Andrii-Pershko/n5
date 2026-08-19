import { messages, type Locale, type MessageTree } from './messages';

type Vars = Record<string, string | number>;

export function translate(
  locale: Locale,
  path: string,
  vars?: Vars,
): string {
  const tree: unknown = messages[locale];
  const value = path.split('.').reduce<unknown>((node, key) => {
    if (!node || typeof node !== 'object') {
      return undefined;
    }
    return (node as Record<string, unknown>)[key];
  }, tree);

  if (typeof value !== 'string') {
    return path;
  }
  if (!vars) {
    return value;
  }
  return value.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] === undefined ? `{${key}}` : String(vars[key]),
  );
}

export function getMessages(locale: Locale): MessageTree {
  return messages[locale] as MessageTree;
}
