#!/usr/bin/env node
// Downloads Taiwanese audio files from sutian.moe.edu.tw based on audio-map.json
// Usage: node scripts/download-audio.cjs

const fs = require('fs')
const path = require('path')
const https = require('https')

const audioMap = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'audio-map.json'), 'utf8')
)

// Read all CSV files to get date->word mapping
const contentDir = path.join(__dirname, '..', 'content')
// Download into public/ (dev server) and mirror into resources/ (Electron prod).
const outputDir = path.join(__dirname, '..', 'public', 'data', 'audio')
const mirrorDir = path.join(__dirname, '..', 'resources', 'data', 'audio')
fs.mkdirSync(outputDir, { recursive: true })
fs.mkdirSync(mirrorDir, { recursive: true })

function parseCSV(content) {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',')
  return lines.slice(1).map(line => {
    const values = line.split(',')
    return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? '']))
  })
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      console.log(`  skip (exists): ${path.basename(dest)}`)
      return resolve()
    }
    const file = fs.createWriteStream(dest)
    https.get(url, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close()
        fs.unlinkSync(dest)
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        file.close()
        fs.unlinkSync(dest)
        return reject(new Error(`HTTP ${res.statusCode} for ${url}`))
      }
      res.pipe(file)
      file.on('finish', () => { file.close(); resolve() })
    }).on('error', err => {
      fs.existsSync(dest) && fs.unlinkSync(dest)
      reject(err)
    })
  })
}

async function main() {
  const months = fs.readdirSync(contentDir).filter(f => f.endsWith('.csv'))
  const rows = []
  for (const m of months) {
    const csv = fs.readFileSync(path.join(contentDir, m), 'utf8')
    rows.push(...parseCSV(csv))
  }

  let downloaded = 0, skipped = 0, missing = 0

  for (const row of rows) {
    const { date, word_hanji } = row
    if (!date || !word_hanji) continue

    const audioUrl = audioMap[word_hanji]
    if (!audioUrl) {
      console.log(`  no audio: ${date} ${word_hanji}`)
      missing++
      continue
    }

    const fileName = `${date}-word.mp3`
    const dest = path.join(outputDir, fileName)
    console.log(`${date}: ${word_hanji}`)
    try {
      await download(audioUrl, dest)
      fs.copyFileSync(dest, path.join(mirrorDir, fileName))
      downloaded++
    } catch (err) {
      console.error(`  ERROR: ${err.message}`)
      missing++
    }

    await new Promise(r => setTimeout(r, 100))
  }

  console.log(`\nDone: ${downloaded} downloaded, ${missing} missing/failed, skipped existing`)
}

main().catch(err => { console.error(err); process.exit(1) })
