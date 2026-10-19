import { TEST_REQUIREMENTS } from '@/lib/constants'

// Minimal markdown renderer for the trusted, static test brief.
// Supports: headings, hr, tables, (nested) lists, blockquotes, fenced code blocks
// (add `numbered` after the language to show line numbers), bold, inline code, links.

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function applyInline(text: string): string {
  return text
    .split(/(`[^`]+`)/g)
    .map(part => {
      if (part.length > 1 && part.startsWith('`') && part.endsWith('`')) {
        return `<code class="px-1.5 py-0.5 rounded bg-slate-800 text-gold-300 text-xs font-mono">${escapeHtml(part.slice(1, -1))}</code>`
      }
      return escapeHtml(part)
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-200 font-semibold">$1</strong>')
        .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-gold-400 underline underline-offset-4 hover:text-gold-300">$1</a>')
    })
    .join('')
}

function renderCodeBlock(body: string[], numbered: boolean): string {
  const gutterWidth = String(body.length).length + 1
  const lines = body.map((line, i) => {
    const code = line === '' ? ' ' : escapeHtml(line)
    if (!numbered) return code
    return `<span class="block"><span class="select-none inline-block text-right pr-4 text-slate-600" style="width:${gutterWidth + 2}ch">${i + 1}</span>${code}</span>`
  })
  return `<pre class="my-3 overflow-x-auto rounded-xl border border-slate-800 bg-[#0b0f1a] p-4 text-xs leading-relaxed font-mono text-slate-300 whitespace-pre"><code>${lines.join(numbered ? '' : '\n')}</code></pre>`
}

type OpenList = { type: 'ul' | 'ol'; liOpen: boolean }

function renderMarkdown(md: string): string {
  const lines = md.split('\n')
  let html = ''
  let inTable = false
  let isHeaderRow = true
  const listStack: OpenList[] = []

  const closeList = () => {
    const list = listStack.pop()
    if (!list) return
    if (list.liOpen) html += '</li>'
    html += `</${list.type}>`
  }
  const closeAllLists = () => { while (listStack.length) closeList() }
  const closeTable = () => {
    if (!inTable) return
    html += '</tbody></table></div>'
    inTable = false
    isHeaderRow = true
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Fenced code blocks
    if (trimmed.startsWith('```')) {
      closeTable()
      closeAllLists()
      const numbered = trimmed.slice(3).trim().split(/\s+/).includes('numbered')
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        body.push(lines[i])
        i++
      }
      html += renderCodeBlock(body, numbered)
      continue
    }

    // Table rows
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      closeAllLists()
      const cells = line.split('|').slice(1, -1).map(c => c.trim())
      if (cells.every(c => /^[-:]+$/.test(c))) continue

      if (!inTable) {
        html += '<div class="overflow-x-auto my-2"><table class="w-full text-sm border-collapse">'
        inTable = true
        isHeaderRow = true
      }

      if (isHeaderRow) {
        html += '<thead><tr>'
        cells.forEach(c => { html += `<th class="text-left px-3 py-1.5 border-b border-slate-700 text-slate-300 font-medium text-xs uppercase tracking-wider">${applyInline(c)}</th>` })
        html += '</tr></thead><tbody>'
        isHeaderRow = false
      } else {
        html += '<tr class="border-b border-slate-800/50">'
        cells.forEach(c => { html += `<td class="px-3 py-1.5 text-slate-400 align-top">${applyInline(c)}</td>` })
        html += '</tr>'
      }
      continue
    }
    closeTable()

    // List items (two or more leading spaces = nested)
    const listMatch = /^(\s*)(-|\d+\.)\s+(.*)$/.exec(line)
    if (listMatch) {
      const level = listMatch[1].length >= 2 ? 1 : 0
      const type = listMatch[2] === '-' ? 'ul' : 'ol'
      while (listStack.length > level + 1) closeList()
      if (listStack.length === level + 1) {
        if (listStack[level].type !== type) {
          closeList()
        } else if (listStack[level].liOpen) {
          html += '</li>'
          listStack[level].liOpen = false
        }
      }
      while (listStack.length < level + 1) {
        const nested = listStack.length > 0
        const listClass = type === 'ol' ? 'list-decimal' : nested ? 'list-[circle]' : 'list-disc'
        html += `<${type} class="${listClass} ml-5 my-1 space-y-0.5 ${nested ? 'text-slate-500' : 'text-slate-400'} leading-snug">`
        listStack.push({ type, liOpen: false })
      }
      html += `<li>${applyInline(listMatch[3])}`
      listStack[level].liOpen = true
      continue
    }
    closeAllLists()

    // Blockquote callouts (consecutive "> " lines)
    if (trimmed.startsWith('> ') || trimmed === '>') {
      const quote: string[] = []
      while (i < lines.length && (lines[i].trim().startsWith('> ') || lines[i].trim() === '>')) {
        quote.push(lines[i].trim().slice(2))
        i++
      }
      i--
      html += `<div class="my-3 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 space-y-1">${quote.filter(q => q !== '').map(q => `<p class="text-amber-200/90 leading-snug">${applyInline(q)}</p>`).join('')}</div>`
      continue
    }

    // Headings
    if (line.startsWith('#### ')) { html += `<h4 class="text-sm font-semibold mt-3 mb-1 text-slate-300">${applyInline(line.slice(5))}</h4>`; continue }
    if (line.startsWith('### ')) { html += `<h3 class="text-sm font-semibold mt-4 mb-1 text-slate-200">${applyInline(line.slice(4))}</h3>`; continue }
    if (line.startsWith('## ')) { html += `<h2 class="text-base font-bold mt-5 mb-1 text-slate-100">${applyInline(line.slice(3))}</h2>`; continue }
    if (line.startsWith('# ')) { html += `<h1 class="text-lg font-bold mt-5 mb-2 text-gold-400">${applyInline(line.slice(2))}</h1>`; continue }

    // Horizontal rule - the only real visual break
    if (trimmed === '---') { html += '<hr class="my-5 border-slate-800" />'; continue }

    // Empty line - minimal gap, just enough to separate paragraphs
    if (trimmed === '') { continue }

    // Paragraph
    html += `<p class="text-slate-400 leading-snug mt-1">${applyInline(line)}</p>`
  }

  closeTable()
  closeAllLists()

  return html
}

export function TestRequirements() {
  return (
    <div
      className="text-sm"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(TEST_REQUIREMENTS) }}
    />
  )
}
