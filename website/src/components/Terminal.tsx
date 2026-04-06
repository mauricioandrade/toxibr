import { useState, useMemo, useEffect } from 'react'
import { filterContent as scanWord, normalize } from 'toxibr'
import type { ScanResult } from '../App'
import './Terminal.css'

interface TerminalProps {
  result: ScanResult | null
}

interface WordScan {
  word: string
  allowed: boolean
  reason?: string
  matched?: string
}

const reasonLabels: Record<string, string> = {
  hard_block: 'HARD_BLOCK',
  directed_insult: 'DIRECTED_INSULT',
  fuzzy_match: 'FUZZY_MATCH',
  link: 'LINK_DETECTED',
  phone: 'PHONE_DETECTED',
  digits_only: 'DIGITS_ONLY',
  offensive_emoji: 'OFFENSIVE_EMOJI',
}

export default function Terminal({ result }: TerminalProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  // Reset selection when result changes
  useEffect(() => {
    setSelectedIndex(null)
  }, [result])

  // Scan each word individually
  // Ignore digits_only and phone for individual words — those only make sense for the full message
  const wordScans = useMemo<WordScan[]>(() => {
    if (!result) return []
    const tokens = result.input.split(/(\s+)/).filter(t => t.trim())
    return tokens.map(word => {
      const res = scanWord(word)
      const ignoreReasons = ['digits_only', 'phone']
      const effectiveAllowed = res.allowed || (!res.allowed && ignoreReasons.includes(res.reason as string))
      return {
        word,
        allowed: effectiveAllowed,
        reason: effectiveAllowed ? undefined : res.reason,
        matched: effectiveAllowed ? undefined : res.matched,
      }
    })
  }, [result])

  const blockedWords = wordScans.filter(w => !w.allowed)
  const blockedCount = blockedWords.length

  // The active detail: either the clicked word, or null (shows overall result)
  const activeDetail = selectedIndex !== null ? wordScans[selectedIndex] : null

  // What to show in Scan Results
  const displayResult = activeDetail
    ? { allowed: false, reason: activeDetail.reason, matched: activeDetail.matched, word: activeDetail.word }
    : result
    ? { allowed: result.allowed, reason: result.reason, matched: result.matched, word: null }
    : null

  return (
    <div className="terminal">
      <div className="terminal-bar">
        <div className="terminal-dots">
          <span className="dot-red" />
          <span className="dot-yellow" />
          <span className="dot-green" />
        </div>
        <span className="terminal-title">toxibr — Terminal</span>
        <div className="terminal-bar-right">
          {result && (
            <>
              <span className="terminal-tag">L33T</span>
              <span className="terminal-tag">UTF</span>
              <span className={`terminal-status-dot ${result.allowed ? 'green' : 'red'}`} />
              <span className="terminal-time">
                {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="terminal-body">
        <div className="term-line">
          <span className="term-icon">&#9632;</span>
          <span className="term-white">ToxiBR Content Filter Engine</span>
        </div>

        <div className="term-spacer" />

        {!result ? (
          <>
            <div className="term-line">
              <span className="term-muted"># ToxiBR Engine v1.0.0</span>
            </div>
            <div className="term-line">
              <span className="term-muted"># Aguardando mensagem para analise...</span>
            </div>
            <div className="term-spacer" />
            <div className="term-line">
              <span className="term-prompt">$</span>
              <span className="term-muted">toxibr scan --awaiting-input</span>
            </div>
            <div className="term-spacer" />
            <div className="term-line">
              <span className="term-muted"># Layers: hard_block, context_aware, fuzzy, prefix, phone, link</span>
            </div>
            <div className="term-line">
              <span className="term-muted"># Status: </span>
              <span className="term-green">READY</span>
            </div>
            <div className="term-spacer" />
            <div className="term-line">
              <span className="term-prompt">$</span>
              <span className="cursor" />
            </div>
          </>
        ) : (
          <>
            <div className="term-line">
              <span className="term-muted"># ToxiBR Engine v1.0.0</span>
            </div>
            <div className="term-line">
              <span className="term-prompt">$</span>
              <span className="term-white">
                toxibr scan --lang=pt-br --obfuscation --leetspeak=moderate --unicode
              </span>
            </div>

            <div className="term-spacer" />

            {/* Input with highlighted blocked words */}
            <div className="term-line">
              <span className="term-muted"># Input text ({result.input.length} chars, {blockedCount} flagged):</span>
            </div>
            <div className="term-line term-line-wrap">
              <span className="term-muted">"</span>
              {wordScans.map((ws, i) => (
                <span key={i}>
                  {ws.allowed ? (
                    <span className="term-accent">{ws.word}</span>
                  ) : (
                    <span
                      className={`term-word-blocked ${selectedIndex === i ? 'active' : ''}`}
                      onClick={() => setSelectedIndex(selectedIndex === i ? null : i)}
                      title={`Clique para ver detalhes`}
                    >
                      {ws.word}
                    </span>
                  )}
                  {i < wordScans.length - 1 && <span className="term-accent"> </span>}
                </span>
              ))}
              <span className="term-muted">"</span>
            </div>

            {blockedCount > 0 && (
              <div className="term-line">
                <span className="term-muted">
                  # {selectedIndex !== null ? 'Clique em outra palavra ou na mesma para desselecionar' : 'Clique numa palavra vermelha para inspecionar'}
                </span>
              </div>
            )}

            <div className="term-spacer" />

            {/* Normalized */}
            <div className="term-line">
              <span className="term-muted"># Normalized:</span>
            </div>
            <div className="term-line term-line-wrap">
              {activeDetail ? (
                <span className="term-purple">"{normalize(activeDetail.word)}"</span>
              ) : (
                <span className="term-purple">"{result.normalized}"</span>
              )}
            </div>

            <div className="term-spacer" />

            {/* Scan Results — updates based on selected word */}
            <div className="term-line">
              <span className="term-muted">
                # Scan Results{activeDetail ? ` — "${activeDetail.word}"` : ''}:
              </span>
            </div>

            {displayResult && (
              <>
                <div className="term-line">
                  <span className="term-arrow">&#8594;</span>
                  <span className="term-muted">Status: </span>
                  {displayResult.allowed ? (
                    <span className="term-result-badge allowed">CONTENT CLEAN</span>
                  ) : (
                    <span className="term-result-badge blocked">BLOCKED</span>
                  )}
                </div>

                {!displayResult.allowed && displayResult.reason && (
                  <>
                    {displayResult.word && (
                      <div className="term-line">
                        <span className="term-arrow">&#8594;</span>
                        <span className="term-muted">Word: </span>
                        <span className="term-red">"{displayResult.word}"</span>
                      </div>
                    )}
                    <div className="term-line">
                      <span className="term-arrow">&#8594;</span>
                      <span className="term-muted">Reason: </span>
                      <span className="term-yellow">{reasonLabels[displayResult.reason] || displayResult.reason}</span>
                    </div>
                    <div className="term-line">
                      <span className="term-arrow">&#8594;</span>
                      <span className="term-muted">Matched: </span>
                      <span className="term-red">"{displayResult.matched}"</span>
                    </div>
                  </>
                )}

                <div className="term-line">
                  <span className="term-arrow">&#8594;</span>
                  <span className="term-muted">Time: </span>
                  <span className="term-white">{result.time.toFixed(2)}ms</span>
                </div>
              </>
            )}

            <div className="term-spacer" />

            <div className="term-line">
              <span className="term-muted"># Scan completed</span>
            </div>

            <div className="term-spacer" />

            <div className="term-line">
              <span className="term-prompt">$</span>
              <span className="cursor" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
