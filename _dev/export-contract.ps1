# Export only our generated document with a dedicated, invisible Word instance.
# Does not attach to, edit, or close any existing user document.
$ErrorActionPreference = 'Stop'
$contractRoot = Split-Path -Parent $PSScriptRoot
$docxPath = Join-Path $contractRoot 'assets\documents\bonesaver-smlouva-hudebni-produkce-vzor.docx'
$pdfPath = Join-Path $contractRoot 'assets\documents\bonesaver-smlouva-hudebni-produkce-vzor.pdf'
$contractWord = $null
$contractDocument = $null
try {
    $contractWord = New-Object -ComObject Word.Application
    $contractWord.Visible = $false
    $contractWord.DisplayAlerts = 0
    $contractWord.AutomationSecurity = 3
    $contractDocument = $contractWord.Documents.Open($docxPath, $false, $true, $false)
    $contractDocument.Repaginate()
    $contractDocument.ExportAsFixedFormat($pdfPath, 17)
    Write-Output "Exported PDF from Word: $pdfPath"
} finally {
    if ($null -ne $contractDocument) {
        $contractDocument.Close(0)
        [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($contractDocument)
    }
    if ($null -ne $contractWord) {
        $contractWord.Quit(0)
        [void][Runtime.InteropServices.Marshal]::FinalReleaseComObject($contractWord)
    }
}
