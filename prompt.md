# Project Prompts History

This document logs all user prompts provided during the development of this project.

---

### Prompt 1: Initial App Design & Specification
**Date**: 2026-10-06  
**Prompt**:
```text
Build me an app with screens that look like this. You can hotlink images from the html
```
*Accompanying PulseTransit System Design Tokens & Guidelines:*
- **Design Concept**: Modern municipal wayfinding and precision transit telematics inspired by mid-century Swiss transit signage (Massimo Vignelli, Josef Müller-Brockmann).
- **Colors**:
  - Primary (`#006948` / `#059669` Transit Emerald)
  - Secondary (`#855300` / `#F59E0B` Signal Amber)
  - Tertiary (`#0051d5` / `#2563EB` Metro Blue)
  - Neutral / Surface (`#FAF8FF` canvas, `#FFFFFF` cards, `#131B2E` text, `#E2E8F0` borders)
- **Typography**:
  - `Space Grotesk` (Wayfinding Headlines)
  - `Public Sans` (Interface & Legibility)
  - `JetBrains Mono` (Telemetry & Timetable Glyphs, tabular-nums)
- **Component Specifications**:
  - Top Bar: Strict 3-zone contract (Wordmark, Nav links, Live clock/actions)
  - Arrival & Countdown Cards: 3-zone layout (Badge/direction, Occupancy/features, Live countdowns with strikethroughs)
  - Tactile Search: 52px height, 1.5px border, transit glyph, "Near Me" locator
  - Stop Progression: 3px neutral track, 8px hollow rings, 14px emerald node with concentric ping

---

### Prompt 2: Git Remote Setup & Initial Push
**Date**: 2026-10-06  
**Prompt**:
```text
git push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@https://github.com/SauChing/mcp-bus.git
```

---

### Prompt 3: Backend API Structure & Singapore LTA Integration
**Date**: 2026-10-06  
**Prompt**:
```text
1) create a /api folder under the project name to store all the APIs
2) cretae a /api/health.js to monitor if the APIs are working
3) Integrate the LTA bus information using the following GET https://datamall2.mytransport.sg/ltaodataservice/v3/BusArrival?BusStopCode=04121
Header:  AccountKey: [your key from the email]

# BusStopCode is the only required parameter.
# Add &ServiceNo=7 to ask about one service only.
# Refreshes every 20 seconds. JSON comes back by default.

I will add the LTA_ACCOUNT_KEY in vercel environment variables later
```

---

### Prompt 4: Streamline to Singapore LTA Only
**Date**: 2026-10-06  
**Prompt**:
```text
Can you remove anything that is not related to Singapore LTA data from the website
```

---

### Prompt 5: Synchronize Git Repository
**Date**: 2026-10-06  
**Prompt**:
```text
git push
```

---

### Prompt 6: Export Prompt History
**Date**: 2026-10-06  
**Prompt**:
```text
create a prompt.md containing all my prompts located at project main
```
