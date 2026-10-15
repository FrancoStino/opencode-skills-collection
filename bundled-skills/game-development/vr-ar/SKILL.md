---
name: vr-ar
description: "VR/AR development principles. Comfort, interaction, performance requirements."
risk: none
source: community
date_added: "2026-02-27"
---

# VR/AR Development

> Immersive experience principles.

---

## 1. Platform Selection

### VR Platforms

| Platform | Use Case |
|----------|----------|
| **Quest** | Standalone, wireless |
| **PCVR** | High fidelity |
| **PSVR** | Console market |
| **WebXR** | Browser-based |

### AR Platforms

| Platform | Use Case |
|----------|----------|
| **ARKit** | iOS devices |
| **ARCore** | Android devices |
| **WebXR** | Browser AR |
| **HoloLens** | Enterprise |

---

## 2. Comfort Principles

### Motion Sickness Prevention

| Cause | Solution |
|-------|----------|
| **Locomotion** | Teleport, snap turn |
| **Low FPS** | Meet the selected headset refresh rate consistently |
| **Camera shake** | Avoid or minimize |
| **Rapid acceleration** | Gradual movement |

### Comfort Settings

- Vignette during movement
- Snap vs smooth turning
- Seated vs standing modes
- Height calibration

---

## 3. Performance Requirements

### Historical hardware examples

Panel resolution is not the recommended render-target resolution. Verify supported refresh modes, runtime scaling and device support before setting a budget.

| Platform | FPS | Resolution |
|----------|-----|------------|
| Quest 2 | 72-90 | 1832x1920 |
| Quest 3 | 90-120 | 2064x2208 |
| PCVR | 90 | 2160x2160+ |
| PSVR2 | 90-120 | 2000x2040 |

### Frame Budget

- VR requires consistent frame times
- Dropped frames can produce judder; reprojection does not remove the need for stable timing
- 90 FPS = 11.11ms budget

---

## 4. Interaction Principles

### Controller Interaction

| Type | Use |
|------|-----|
| **Point + click** | UI, distant objects |
| **Grab** | Manipulation |
| **Gesture** | Magic, special actions |
| **Physical** | Throwing, swinging |

### Hand Tracking

- More immersive but less precise
- Good for: social, casual
- Challenging for: action, precision

---

## 5. Spatial Design

### World Scale

- Calibrate engine world scale against real meters; engine unit conventions differ
- Objects must feel right size
- Test with real measurements

### Depth Cues

| Cue | Importance |
|-----|------------|
| Stereo | Primary depth |
| Motion parallax | Secondary |
| Shadows | Grounding |
| Occlusion | Layering |

---

## 6. Anti-Patterns

| ❌ Don't | ✅ Do |
|----------|-------|
| Move camera without player | Player controls camera |
| Miss the selected refresh budget | Profile frame timing on the target headset |
| Use tiny UI text | Large, readable text |
| Ignore arm length | Scale to player reach |

---

> **Remember:** Comfort is not optional. Sick players don't play.

## When to Use
Use when designing immersive locomotion, spatial interaction and comfort settings, or measuring frame times on a target headset.

## Example

**User request:**

> Use @vr-ar for this task: VR/AR development principles.

## Limitations
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.

## Verification

Treat tables as design starting points, not guarantees. Prototype the selected mechanic, test accessibility and recovery paths, and measure frame timing, memory and behavior on target hardware before claiming completion. Store submission and licensing requirements must be checked against current official platform documentation.
