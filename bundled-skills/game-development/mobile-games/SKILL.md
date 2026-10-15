---
name: mobile-games
description: "Mobile game development principles. Touch input, battery, performance, app stores."
risk: safe
source: community
date_added: "2026-02-27"
---

# Mobile Game Development

> Platform constraints and optimization principles.

---

## 1. Platform Considerations

### Key Constraints

| Constraint | Strategy |
|------------|----------|
| **Touch input** | Large hit areas, gestures |
| **Battery** | Limit CPU/GPU usage |
| **Thermal** | Throttle when hot |
| **Screen size** | Responsive UI |
| **Interruptions** | Pause on background |

---

## 2. Touch Input Principles

### Touch vs Controller

| Touch | Desktop/Console |
|-------|-----------------|
| Imprecise | Precise |
| Occludes screen | No occlusion |
| Limited buttons | Many buttons |
| Gestures available | Buttons/sticks |

### Best Practices

- Follow the platform accessibility target size (for example, iOS points and Android dp are different units)
- Visual feedback on touch
- Avoid precise timing requirements
- Support the orientations chosen for the product; test rotation and safe areas where enabled

---

## 3. Performance Targets

### Thermal Management

| Action | Trigger |
|--------|---------|
| Reduce quality | Device warm |
| Limit FPS | Device hot |
| Pause effects | Critical temp |

### Battery Optimization

- 30 FPS often sufficient
- Sleep when paused
- Minimize GPS/network
- Dark mode saves OLED battery

---

## 4. App Store Requirements

### iOS (App Store)

| Requirement | Note |
|-------------|------|
| Privacy labels | Required |
| Account deletion | If account creation exists |
| Screenshots | Required submission sizes for supported devices |

### Android (Google Play)

| Requirement | Note |
|-------------|------|
| Target API | Current Play target-level deadline for this application |
| 64-bit | Required |
| App bundles | Check mandatory format and exceptions for the submission |

---

## 5. Monetization Models

| Model | Best For |
|-------|----------|
| **Premium** | Quality games, loyal audience |
| **Free + IAP** | Casual, progression-based |
| **Ads** | Hyper-casual, high volume |
| **Subscription** | Content updates, multiplayer |

---

## 6. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Desktop controls on mobile | Design for touch |
| Ignore battery drain | Monitor thermals |
| Force landscape | Support player preference |
| Always-on network | Cache and sync |

---

> **Remember:** Mobile is the most constrained platform. Respect battery and attention.

## When to Use
Use when adapting gameplay to touch controls, mobile interruptions, battery and thermal constraints, or preparing a store submission.

## Example

**User request:**

> Use @mobile-games for this task: Mobile game development principles.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.

## Verification

Treat tables as design starting points, not guarantees. Prototype the selected mechanic, test accessibility and recovery paths, and measure frame timing, memory and behavior on target hardware before claiming completion. Store submission and licensing requirements must be checked against current official platform documentation.
