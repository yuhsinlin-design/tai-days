#!/usr/bin/env node
// Generates TTS audio files for all entries in a content CSV.
// Usage: node scripts/generate-audio.js 2026-06
// Output: public/data/audio/YYYY-MM-DD-word.mp3 and YYYY-MM-DD-sentence.mp3

const fs = require('fs')
const path = require('path')
const https = require('https')

const API_KEY = process.env.GOOGLE_TTS_API_KEY
if (!API_KEY) {
  console.error('Missing GOOGLE_TTS_API_KEY env var')
  process.exit(1)
}

const MONTH = process.argv[2]
if (!MONTH) {
  console.error('Usage: node scripts/generate-audio.js YYYY-MM')
  process.exit(1)
}

const csvPath = path.join(__dirname, '..', 'content', `${MONTH}.csv`)
if (!fs.existsSync(csvPath)) {
  console.error(`CSV not found: ${csvPath}`)
  process.exit(1)
}

const outputDir = path.join(__dirname, '..', 'public', 'data', 'audio')
fs.mkdirSync(outputDir, { recursive: true })

function parseCSV(content) {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const values = line.split(',')
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

function tts(text, outputPath) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(outputPath)) {
      console.log(`  skip (exists): ${path.basename(outputPath)}`)
      return resolve()
    }

    const body = JSON.stringify({
      input: { text },
      voice: { languageCode: 'nan-TW', name: 'nan-TW-Standard-A' },
      audioConfig: { audioEncoding: 'MP3' }
    })

    const req = https.request({
      hostname: 'texttospeech.googleapis.com',
      path: `/v1/text:synthesize?key=${API_KEY}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) }
    }, res => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        const json = JSON.parse(data)
        if (!json.audioContent) {
          return reject(new Error(`TTS failed for "${text}": ${JSON.stringify(json)}`))
        }
        fs.writeFileSync(outputPath, Buffer.from(json.audioContent, 'base64'))
        console.log(`  created: ${path.basename(outputPath)}`)
        resolve()
      })
    })
    req.on('error', reject)
    req.write(body)
    req.end()
  })
}

async function main() {
  const csv = fs.readFileSync(csvPath, 'utf8')
  const rows = parseCSV(csv)

  for (const row of rows) {
    const { date, word_hanji, sentence_hanji } = row
    if (!date || !word_hanji) continue
    console.log(`${date}: ${word_hanji}`)

    await tts(word_hanji, path.join(outputDir, `${date}-word.mp3`))
    await tts(sentence_hanji, path.join(outputDir, `${date}-sentence.mp3`))

    // avoid rate limiting
    await new Promise(r => setTimeout(r, 200))
  }

  console.log('Done.')
}

main().catch(err => { console.error(err); process.exit(1) })
