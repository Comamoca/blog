-- org emphasis/verbatim は CJK 文字に隣接すると解析されないため、
-- マーカー両側に ZWSP(U+200B) を挿す。脚注は pandoc が同一内容を複製するため
-- 内容で重複排除し、定義を文末へ一度だけ出力する。
local Z = '\u{200b}'

local inline = {}

local function wrap(marker, content)
  local out = { pandoc.RawInline('org', Z .. marker) }
  for _, i in ipairs(content) do out[#out + 1] = i end
  out[#out + 1] = pandoc.RawInline('org', marker .. Z)
  return out
end

function inline.Strong(el) return wrap('*', el.content) end
function inline.Emph(el) return wrap('/', el.content) end
function inline.Strikeout(el) return wrap('+', el.content) end
function inline.Code(el)
  local d = el.text:find('~', 1, true) and '=' or '~'
  return pandoc.RawInline('org', Z .. d .. el.text .. d .. Z)
end

local defs = {}
local labels = {}
local counter = 0

local F = {}
F.Strong = inline.Strong
F.Emph = inline.Emph
F.Strikeout = inline.Strikeout
F.Code = inline.Code

function F.Note(el)
  local blocks = pandoc.Pandoc(el.content):walk(inline).blocks
  local key = pandoc.utils.stringify(blocks)
  local label = labels[key]
  if not label then
    counter = counter + 1
    label = tostring(counter)
    labels[key] = label
    local body = pandoc.write(pandoc.Pandoc(blocks), 'org'):gsub('%s+$', '')
    defs[#defs + 1] = '[fn:' .. label .. '] ' .. body
  end
  return pandoc.RawInline('org', '[fn:' .. label .. ']')
end

function F.Pandoc(doc)
  if #defs > 0 then
    doc.blocks:insert(pandoc.RawBlock('org', table.concat(defs, '\n\n')))
  end
  return doc
end

return F
