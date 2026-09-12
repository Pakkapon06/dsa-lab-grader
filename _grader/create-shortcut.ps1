# สร้าง shortcut "Lab Grader.lnk" (มี icon) ที่ root ของโปรเจกต์
# ดับเบิลคลิก shortcut แทนการรัน run-grader.cmd ตรง ๆ
$here = Split-Path -Parent $MyInvocation.MyCommand.Path      # _grader
$root = Split-Path -Parent $here                             # Lab (project root)
$lnkPath = Join-Path $root "Lab Grader.lnk"
$ws = New-Object -ComObject WScript.Shell
$lnk = $ws.CreateShortcut($lnkPath)
$lnk.TargetPath = Join-Path $here "run-grader.cmd"
$lnk.WorkingDirectory = $here
$lnk.IconLocation = (Join-Path $here "icon.ico") + ",0"
$lnk.Description = "Open the Lab Grader"
$lnk.Save()
Write-Host "Created shortcut with icon: $lnkPath" -ForegroundColor Green
