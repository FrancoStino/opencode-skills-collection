---
name: bevy-ecs-expert
description: "Master Bevy's Entity Component System (ECS) in Rust, covering Systems, Queries, Resources, and parallel scheduling."
risk: safe
source: community
date_added: "2026-02-27"
---

# Bevy ECS Expert

## Overview

A guide to building high-performance game logic using Bevy's data-oriented ECS architecture. Learn how to structure systems, optimize queries, manage resources, and leverage parallel execution.

## When to Use This Skill

- Use when developing games with the Bevy engine in Rust.
- Use when designing game systems that need to run in parallel.
- Use when optimizing game performance by minimizing cache misses.
- Use when refactoring object-oriented logic into data-oriented ECS patterns.

## Step-by-Step Guide

### 1. Defining Components

Use simple structs for data. Import `bevy::prelude::*`; add Reflect only when reflection/inspection is needed. The snippets are alternatives and do not duplicate Player/Velocity definitions in one scope.

```rust
#[derive(Component, Reflect, Default)]
#[reflect(Component)]
struct Velocity {
    x: f32,
    y: f32,
}

#[derive(Component)]
struct Player;
```

### 2. Writing Systems

Systems are regular Rust functions that query components.

```rust
fn movement_system(
    time: Res<Time>,
    mut query: Query<(&mut Transform, &Velocity), With<Player>>,
) {
    for (mut transform, velocity) in &mut query {
        transform.translation.x += velocity.x * time.delta_secs();
        transform.translation.y += velocity.y * time.delta_secs();
    }
}
```

### 3. Managing Resources

Use `Resource` for global data (score, game state).

```rust
#[derive(Resource, Default)]
struct GameState {
    score: u32,
}

fn score_system(mut game_state: ResMut<GameState>) {
    game_state.score += 10;
}
```

The toy score_system increments each Update; use gameplay events or an explicit timer for meaningful scoring, rather than implying frame-rate-independent score behavior.

### 4. Scheduling Systems

Add systems to the `App` builder, defining execution order if needed.

```rust
fn main() {
    App::new()
        .add_plugins(DefaultPlugins)
        .init_resource::<GameState>()
        .add_systems(Update, (movement_system, score_system).chain())
        .run();
}
```

## Examples

### Example 1: Spawning Entities with Require Component

```rust
use bevy::prelude::*;

#[derive(Component, Reflect, Default)]
#[require(Velocity, Sprite)]
struct Player;

#[derive(Component, Default)]
struct Velocity {
    x: f32,
    y: f32,
}

fn setup(mut commands: Commands, asset_server: Res<AssetServer>) {
    commands.spawn((
        Player,
        Velocity { x: 10.0, y: 0.0 },
        Sprite::from_image(asset_server.load("player.png")), 
    ));
}
```

### Example 2: Query Filters

Use `With` and `Without` to filter entities efficiently.

```rust
fn enemy_behavior(
    query: Query<&Transform, (With<Enemy>, Without<Dead>)>,
) {
    for transform in &query {
        // Only active enemies processed here
    }
}
```

## Best Practices

- ✅ **Do:** Use `Query` filters (`With`, `Without`, `Changed`) to reduce iteration count.
- ✅ **Do:** Prefer `Res` over `ResMut` when read-only access is sufficient to allow parallel execution.
- ✅ **Do:** Use `Bundle` to spawn complex entities atomically.
- ❌ **Don't:** Store heavy logic inside Components; keep them as pure data.
- ❌ **Don't:** Use `RefCell` or interior mutability inside components; prefer normal ECS borrowing; any interior-mutability design still needs valid Send/Sync and a clear synchronization reason.

## Troubleshooting

**Problem:** System panic with "Conflict" error.
**Solution:** The scheduler normally orders conflicting systems. Bevy B0001 often concerns incompatible queries inside one system; use disjoint With/Without filters or ParamSet as appropriate. Chaining two systems does not repair conflicting parameters inside a system. See [Bevy B0001](https://bevy.org/learn/errors/b0001/).

## Limitations
- Pin the project’s Bevy version and check its migration/API guide. Current examples use delta_secs and required components; older Bevy versions may differ. Enemy/Dead are application-owned component markers and player.png is an application asset, not a bundled file. No engine compilation/performance benchmark is claimed here.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
