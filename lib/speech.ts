let _speakingUtterance: SpeechSynthesisUtterance | null = null;

export function speakText(text: string, onEnd?: () => void) {
  try {
    if (!("speechSynthesis" in window)) return false;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/\n/g, " ... "));
    u.rate = 0.85;
    u.pitch = 0.95;
    u.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find((v) => /male|david|daniel|alex/i.test(v.name)) || voices.find((v) => v.lang?.startsWith("en"));
    if (preferred) u.voice = preferred;
    if (onEnd) u.onend = onEnd;
    _speakingUtterance = u;
    window.speechSynthesis.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis.cancel();
  } catch {}
}
