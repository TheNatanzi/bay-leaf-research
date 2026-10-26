# Shared coffee worksheet

The coffee worksheet now saves to shared cloud storage. The existing [worksheet link](https://thenatanzi.github.io/bay-leaf-research/coffee-worksheet.html) and the [hosted copy](https://bay-leaf-coffee.workspace-025208.chatgpt.site/coffee-worksheet.html) use the same answers.

- Fill it in a little at a time, on different devices. Open pages check for updates about every four seconds.
- Before switching devices, look for **Saved for both of you**. **Save / refresh now** also saves pending edits and fetches the latest answers.
- Offline edits remain on the current device until they sync. Download answers for an additional backup.
- If both people change different answers, the edits merge. If they change the same answer, the worksheet asks which version to keep.
- If you already filled in the earlier device-only worksheet, use **Import previous device answers** on that original browser/device. You can also load a previously downloaded answer file. Imports ask before replacing shared values.
- **Copy shared link** now points to the shared worksheet, not a separate snapshot of answers.

The worksheet remains public: anyone with its URL can view and edit it. It sends no emails and does not book venues or change the research database.

## Maintenance

The backend is a dedicated Sites deployment with Cloudflare D1, separate from the venue research files. Source and migrations are maintained in the sibling `bay-leaf-coffee-cloud` checkout. Project ID is recorded in that checkout's `.openai/hosting.json`. No cloud secrets or Gmail contents are in this public repository. Browser-local backups are retained as a fallback; they are not a substitute for a confirmed shared save.
