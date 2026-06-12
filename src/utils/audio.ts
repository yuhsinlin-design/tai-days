import manifest from '../data/audioManifest.json'

// Dates (YYYY-MM-DD) that have a recorded word pronunciation. Bundled at build time
// so both the browser dev server and the packaged Electron app know what exists
// without probing for 404s. Regenerate with scripts that rebuild audioManifest.json.
const wordSet = new Set<string>(manifest.word)
// Subset whose audio is itaigi TTS synthesis — these are markedly quieter than the
// human MOE recordings, so they get a playback gain boost to even out the loudness.
const synthSet = new Set<string>((manifest as { synth?: string[] }).synth ?? [])

// Gain for synthesized clips. The human MOE recordings measure ~4.3x the RMS of the
// itaigi TTS, so ~4x evens the loudness; a limiter after the gain catches any peaks
// the boost pushes past full-scale so they don't distort.
const SYNTH_GAIN = 4

export function hasWordAudio(date: string): boolean {
  return wordSet.has(date)
}

let ctx: AudioContext | null = null
let currentSrc: AudioBufferSourceNode | null = null
// The intermediate nodes (gain / limiter) MUST stay referenced for the whole
// playback. If only the source node is retained, the browser garbage-collects the
// unreferenced gain/limiter mid-graph and the sound cuts out after ~1 second.
let chain: AudioNode[] = []

// Plays the word recording for a date through Web Audio so synthesized clips can be
// amplified (a plain <audio> element caps at the file's own level). Browser serves
// the mp3 from /data/audio; Electron (file://) can't, so it reads it via ipc as a
// data URL. Both forms are fetchable into an ArrayBuffer for decoding.
export async function playWordAudio(date: string): Promise<void> {
  if (!wordSet.has(date)) return
  try {
    const file = `${date}-word.mp3`
    const api = (window as unknown as { electronAPI?: { readAudio?: (f: string) => Promise<string | null> } }).electronAPI
    const src = api?.readAudio ? await api.readAudio(file) : `/data/audio/${file}`
    if (!src) return

    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    ctx = ctx ?? new AC()
    if (ctx.state === 'suspended') await ctx.resume()

    const data = await fetch(src).then(r => r.arrayBuffer())
    const buffer = await ctx.decodeAudioData(data)

    if (currentSrc) { try { currentSrc.stop() } catch { /* already stopped */ } }
    const node = ctx.createBufferSource()
    node.buffer = buffer
    const isSynth = synthSet.has(date)
    const gain = ctx.createGain()
    gain.gain.value = isSynth ? SYNTH_GAIN : 1
    node.connect(gain)
    // Retain every node in the graph for the whole playback; without this the
    // gain/limiter get garbage-collected and the audio cuts off after ~1 second.
    chain = [node, gain]
    if (isSynth) {
      // Brick-wall-ish limiter so the 4x boost can't clip on transients.
      const limiter = ctx.createDynamicsCompressor()
      limiter.threshold.value = -1
      limiter.knee.value = 0
      limiter.ratio.value = 20
      limiter.attack.value = 0.002
      limiter.release.value = 0.1
      gain.connect(limiter)
      limiter.connect(ctx.destination)
      chain.push(limiter)
    } else {
      gain.connect(ctx.destination)
    }
    node.onended = () => { if (currentSrc === node) { chain = []; currentSrc = null } }
    node.start()
    currentSrc = node
  } catch {
    // playback unavailable — fail silently
  }
}
