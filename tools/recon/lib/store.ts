import { mkdirSync, renameSync, writeFileSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { BankTxn, Match, Snapshot } from './types'

const DATA_DIR = join(import.meta.dir, '..', 'data')

function load<T>(name: string, fallback: T): T {
  const path = join(DATA_DIR, name)
  if (!existsSync(path)) return fallback
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function save(name: string, value: unknown) {
  mkdirSync(DATA_DIR, { recursive: true })
  const path = join(DATA_DIR, name)
  const tmp = path + '.tmp'
  writeFileSync(tmp, JSON.stringify(value, null, 1))
  renameSync(tmp, path)
}

export const store = {
  loadBankTxns: () => load<BankTxn[]>('bank-txns.json', []),
  saveBankTxns: (v: BankTxn[]) => save('bank-txns.json', v),
  loadMatches: () => load<Match[]>('matches.json', []),
  saveMatches: (v: Match[]) => save('matches.json', v),
  loadSnapshots: () => load<Snapshot[]>('snapshots.json', []),
  saveSnapshots: (v: Snapshot[]) => save('snapshots.json', v),
  loadPlatformCache: <T>() => load<T | null>('platform-cache.json', null),
  savePlatformCache: (v: unknown) => save('platform-cache.json', v),
}
