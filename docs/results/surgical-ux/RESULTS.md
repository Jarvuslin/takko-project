# Surgical UX verification

Final result: full repository check and actual packaged executable verification passed. Detailed implementation, root causes, failures and limits: [report](../../surgical-ux-corrections.md).

| Evidence | Result |
| --- | --- |
| `before/reproduction.json` | Actual prior executable reproduced beige mouse focus,853px dialog clipping3571px content, missing preview selection and manual question opening |
| `full2.log` | 1409 unit/API tests in 89 files,6 Luau scenarios plus4 compiles,14 plugin groups plus plugin/8 injected compiles,6 guards,TS/Vite,14 desktop tests,production smoke,143 browser passes and1 intentional mobile resizer skip |
| `native3/report.json` | Actual final executable,live 60-result paging in both browsers,real votes and loaded thumbnails,visible primitive dummy geometry,preview selection,keyboard/pointer focus,question/custom/Back/receipt,maximize/restore/minimum,animation choice,zero uncaught renderer errors |
| `native-short-question2/report.json` | 20 options and 2600-character custom answer at minimum native window size,accessible header/actions,scroll lock released |
| `renderer3/report.json` | Offline retained real dummy geometry,480 visible triangles,focus/questions/short-preview flows |
| `package-hashes.json` | All 34 resource hashes match build output,package metadata matches |
| `shortcut.json` | Desktop shortcut points at the verified final package |
| `source-manifest.json` | Shared renderer,Marketplace and desktop source hashes |

Actual cost $0. Paid inference calls 0. Reservations $0. Balance not refreshed, last known $4.994992 at2026-09-20T23:34:36.757Z.

Native model responses used offline fixtures. Marketplace search and dummy extraction were live. Full meshes/textures and audio audition remain Creator Store features. These tests do not establish a working generated game. User app was not restarted. Owned test apps/services closed and Studio remained in Edit mode.
