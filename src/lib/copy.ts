import { toast } from '../components/ds/Toast';

export async function copyText(text: string, label = 'Copied') {
  try {
    await navigator.clipboard.writeText(text);
    toast(`${label}: ${text.length > 48 ? text.slice(0, 45) + '…' : text}`);
  } catch {
    toast("Couldn't copy: clipboard access blocked", { tone: 'error' });
  }
}
