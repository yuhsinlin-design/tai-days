/**
 * electron-builder afterPack hook: ad-hoc sign the whole .app bundle.
 *
 * Without an Apple Developer identity, electron only applies a minimal
 * linker-signed signature whose bundle resource seal is incomplete, so a
 * downloaded (quarantined) copy is rejected by Gatekeeper as "damaged".
 * A proper `codesign --force --deep --sign -` rebuilds a coherent ad-hoc
 * signature, downgrading that to the milder "unidentified developer" prompt
 * which the user can bypass via right-click → Open.
 *
 * This is NOT notarization — it removes the "damaged" error, not the warning.
 * Real zero-warning distribution still needs an Apple Developer certificate.
 */
const { execFileSync } = require('child_process')
const path = require('path')

exports.default = async function adhocSign(context) {
  if (context.electronPlatformName !== 'darwin') return

  const appName = context.packager.appInfo.productFilename
  const appPath = path.join(context.appOutDir, `${appName}.app`)

  // Strip extended attributes / resource forks first — codesign refuses to
  // sign a bundle that still carries them ("resource fork ... not allowed").
  execFileSync('xattr', ['-cr', appPath], { stdio: 'inherit' })

  execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], {
    stdio: 'inherit',
  })

  // Plain (non-strict) verify — this is the level Gatekeeper applies to decide
  // "damaged" vs "unidentified developer". We intentionally do NOT use
  // --deep --strict: it rejects the benign com.apple.FinderInfo that ships on
  // Electron's bundled frameworks (custom folder icons), which does not affect
  // whether a quarantined copy opens.
  execFileSync('codesign', ['--verify', appPath], { stdio: 'inherit' })

  console.log(`✓ ad-hoc signed & verified: ${appPath}`)
}
