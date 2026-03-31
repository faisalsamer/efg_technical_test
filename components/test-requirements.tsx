import { TEST_REQUIREMENTS } from '@/lib/constants'

function renderMarkdown(md: string): string {
  const lines = md.split('\n')
  let html = ''
  let inTable = false
  let isHeaderRow = true

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Table rows
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
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
        cells.forEach(c => { html += `<td class="px-3 py-1.5 text-slate-400">${applyInline(c)}</td>` })
        html += '</tr>'
      }
      continue
    }

    if (inTable) {
      html += '</tbody></table></div>'
      inTable = false
      isHeaderRow = true
    }

    // Headings
    if (line.startsWith('### ')) { html += `<h3 class="text-sm font-semibold mt-4 mb-1 text-slate-200">${applyInline(line.slice(4))}</h3>`; continue }
    if (line.startsWith('## ')) { html += `<h2 class="text-base font-bold mt-5 mb-1 text-slate-100">${applyInline(line.slice(3))}</h2>`; continue }
    if (line.startsWith('# ')) { html += `<h1 class="text-lg font-bold mt-5 mb-2 text-indigo-400">${applyInline(line.slice(2))}</h1>`; continue }

    // Horizontal rule - the only real visual break
    if (line.trim() === '---') { html += '<hr class="my-5 border-slate-800" />'; continue }

    // List items
    if (/^\d+\.\s/.test(line.trim())) { html += `<li class="ml-5 list-decimal text-slate-400 leading-snug">${applyInline(line.trim().replace(/^\d+\.\s/, ''))}</li>`; continue }
    if (line.trim().startsWith('- ')) { html += `<li class="ml-5 list-disc text-slate-400 leading-snug">${applyInline(line.trim().slice(2))}</li>`; continue }
    if (line.trim().startsWith('  - ')) { html += `<li class="ml-9 list-disc text-slate-500 leading-snug text-xs">${applyInline(line.trim().slice(2))}</li>`; continue }

    // Empty line - minimal gap, just enough to separate paragraphs
    if (line.trim() === '') { continue }

    // Paragraph
    html += `<p class="text-slate-400 leading-snug mt-1">${applyInline(line)}</p>`
  }

  if (inTable) html += '</tbody></table></div>'

  return html
}

function applyInline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-200 font-semibold">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 text-xs font-mono">$1</code>')
}

export function TestRequirements() {
  return (
    <div
      className="text-sm"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(TEST_REQUIREMENTS) }}
    />
  )
}
