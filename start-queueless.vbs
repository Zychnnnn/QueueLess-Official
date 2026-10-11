Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\zychn\QueueLess"

' Check if already running on port 5173
Dim http
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
On Error Resume Next
http.Open "GET", "http://localhost:5173", False
http.setTimeouts 1000, 1000, 1000, 1000
http.Send

If Err.Number <> 0 Then
    Err.Clear
    ' Launch dev server completely hidden (0 = hide window)
    WshShell.Run "cmd /c npm run dev", 0, False
    WScript.Sleep 4000
End If

' Open browser directly to student page without any terminal
WshShell.Run "http://localhost:5173", 1, False
