# プロジェクトの内容を1つの context.md にまとめる(AIに貼る/添付する用)
# 使い方:
#   make-context.bat                              全ファイル
#   make-context.bat -Include js/content,js/lang  指定した場所だけ(docs/SPEC.md と index.html は常に含む)
#   make-context.bat -Copy                        できたものをクリップボードにも入れる
# 今回の依頼は、プロジェクト直下の task.txt に書いておくと末尾に付きます。
param(
  [string[]]$Include = @(),
  [string]$Out = 'context.md',
  [switch]$Copy
)
$ErrorActionPreference = 'Stop'
$utf8 = New-Object System.Text.UTF8Encoding($false)
$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$outPath = Join-Path $root $Out
$Include = @($Include | ForEach-Object { $_ -split ',' } | ForEach-Object { $_.Trim().Replace('\','/').TrimEnd('/') } | Where-Object { $_ })

$exts = '.html','.css','.js','.md','.json'
$all = Get-ChildItem -Path $root -Recurse -File | Where-Object {
  ($exts -contains $_.Extension.ToLower()) -and ($_.FullName -ne $outPath) -and ($_.FullName -notmatch '\\(\.git|node_modules)\\')
} | ForEach-Object {
  [pscustomobject]@{ Path = $_.FullName; Rel = $_.FullName.Substring($root.Length + 1).Replace('\','/') }
} | Sort-Object Rel

$always = 'docs/SPEC.md','index.html'
function Test-Pick($rel) {
  if ($Include.Count -eq 0) { return $true }
  if ($always -contains $rel) { return $true }
  foreach ($p in $Include) { if ($rel -eq $p -or $rel.StartsWith($p + '/')) { return $true } }
  return $false
}
$lang = @{ '.html'='html'; '.css'='css'; '.js'='javascript'; '.md'='markdown'; '.json'='json' }

$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine('# Project context: coin-mirror')
[void]$sb.AppendLine('generated: ' + (Get-Date -Format 'yyyy-MM-dd HH:mm'))
[void]$sb.AppendLine('')
[void]$sb.AppendLine('## File list  (* = 本文を下に含む)')
foreach ($f in $all) {
  $mark = if (Test-Pick $f.Rel) { '*' } else { ' ' }
  [void]$sb.AppendLine("- [$mark] $($f.Rel)")
}
[void]$sb.AppendLine('')
$count = 0
# docs/SPEC.md を先頭、index.html を次、残りはパス順
$ordered = @($all | Where-Object { $_.Rel -eq 'docs/SPEC.md' }) + @($all | Where-Object { $_.Rel -eq 'index.html' }) + @($all | Where-Object { $always -notcontains $_.Rel })
foreach ($f in $ordered) {
  if (-not (Test-Pick $f.Rel)) { continue }
  $text = [IO.File]::ReadAllText($f.Path, $utf8)
  $ext = [IO.Path]::GetExtension($f.Rel).ToLower()
  [void]$sb.AppendLine("## $($f.Rel)")
  [void]$sb.AppendLine('````' + $lang[$ext])
  [void]$sb.AppendLine($text.TrimEnd())
  [void]$sb.AppendLine('````')
  [void]$sb.AppendLine('')
  $count++
}
$taskPath = Join-Path $root 'task.txt'
if (Test-Path $taskPath) {
  [void]$sb.AppendLine('## 今回の依頼')
  [void]$sb.AppendLine(([IO.File]::ReadAllText($taskPath, $utf8)).Trim())
  [void]$sb.AppendLine('')
}
$result = $sb.ToString()
[IO.File]::WriteAllText($outPath, $result, $utf8)
if ($Copy) { Set-Clipboard -Value $result }
Write-Host "$Out を作成: $count ファイル / $($result.Length) 文字 (目安 約$([int]($result.Length / 3)) トークン)"
if ($Copy) { Write-Host 'クリップボードにもコピーしました' }
if (-not (Test-Path $taskPath)) { Write-Host '(依頼を付けたい場合は task.txt を作ってください)' }
