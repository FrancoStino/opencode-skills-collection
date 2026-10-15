# Overlay and toasts

## Intent

Use overlays for transient UI (toasts, banners, loaders) without affecting layout.

## Core patterns

- Use `.overlay(alignment:)` to place global UI without changing the underlying layout.
- Keep overlays lightweight and dismissible.
- Use a dedicated `ToastCenter` (or similar) for global state if multiple features trigger toasts.

## Example: toast overlay

```swift
struct AppRootView: View {
  @State private var toast: Toast?

  var body: some View {
    content
      .overlay(alignment: .top) {
        if let toast {
          ToastView(toast: toast)
            .transition(.move(edge: .top).combined(with: .opacity))
            .task(id: toast.id) {
              do {
                try await Task.sleep(for: .seconds(2))
                try Task.checkCancellation()
                guard self.toast?.id == toast.id else { return }
                withAnimation { self.toast = nil }
              } catch is CancellationError {
                return
              } catch { return }
            }
        }
      }
  }
}
```

## Design choices to keep

- Prefer overlays for transient UI rather than embedding in layout stacks.
- Use transitions and short auto-dismiss timers.
- Keep the overlay aligned to a clear edge (`.top` or `.bottom`).

## Pitfalls

- Avoid overlays that block all interaction unless explicitly needed.
- Don’t stack many overlays; use a queue or replace the current toast.
