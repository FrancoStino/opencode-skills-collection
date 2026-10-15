# Form

## Intent

Use `Form` for structured settings, grouped inputs, and action rows. This pattern keeps layout, spacing, and accessibility consistent for data entry screens.

## Core patterns

- Wrap the form in a `NavigationStack` only when it is presented in a sheet or standalone view without an existing navigation context.
- Group related controls into `Section` blocks.
- Use `.scrollContentBackground(.hidden)` plus a custom background color when you need design-system colors.
- Apply `.formStyle(.grouped)` for grouped styling when appropriate.
- Use `@FocusState` to manage keyboard focus in input-heavy forms.

## Example: settings-style form

```swift
@MainActor
struct SettingsView: View {
  @Environment(Theme.self) private var theme

  var body: some View {
    NavigationStack {
      Form {
        Section("General") {
          NavigationLink("Display") { DisplaySettingsView() }
          NavigationLink("Haptics") { HapticsSettingsView() }
        }

        Section("Account") {
          Button("Edit profile") { /* open sheet */ }
            .buttonStyle(.plain)
        }
        .listRowBackground(theme.primaryBackgroundColor)
      }
      .navigationTitle("Settings")
      .navigationBarTitleDisplayMode(.inline)
      .scrollContentBackground(.hidden)
      .background(theme.secondaryBackgroundColor)
    }
  }
}
```

## Example: modal form with validation

```swift
@MainActor
struct AddRemoteServerView: View {
  @Environment(\.dismiss) private var dismiss
  @Environment(Theme.self) private var theme

  @State private var server: String = ""
  let onAdd: (URL) async throws -> Void // Existing authorized project operation.
  @State private var isSaving = false
  @State private var saveError: String?
  private var validatedURL: URL? {
    guard let url = URL(string: server.trimmingCharacters(in: .whitespacesAndNewlines)),
          url.scheme == "https", let host = url.host, !host.isEmpty,
          url.user == nil, url.password == nil else { return nil }
    return url
  }
  @FocusState private var isServerFieldFocused: Bool

  var body: some View {
    NavigationStack {
      Form {
        TextField("Server URL", text: $server)
          .keyboardType(.URL)
          .textInputAutocapitalization(.never)
          .autocorrectionDisabled()
          .focused($isServerFieldFocused)
          .listRowBackground(theme.primaryBackgroundColor)

        Button("Add") {
          guard !isSaving, let url = validatedURL else { return }
          isSaving = true
          Task {
            defer { isSaving = false }
            do {
              try await onAdd(url)
              dismiss()
            } catch { saveError = "Could not add the server. Please try again." }
          }
        }
        .disabled(validatedURL == nil || isSaving)
        .listRowBackground(theme.primaryBackgroundColor)
        if let saveError { Text(saveError) }
      }
      .formStyle(.grouped)
      .navigationTitle("Add Server")
      .navigationBarTitleDisplayMode(.inline)
      .scrollContentBackground(.hidden)
      .background(theme.secondaryBackgroundColor)
      .scrollDismissesKeyboard(.immediately)
      .toolbar { CancelToolbarItem() }
      .onAppear { isServerFieldFocused = true }
    }
  }
}
```

The URL check is form validation, not an SSRF boundary. The injected operation must independently verify the authorized server, identity, redirects, network policy and actual persistence before returning success.

## Design choices to keep

- Prefer `Form` over custom stacks for settings and input screens.
- Keep rows tappable by using `.contentShape(Rectangle())` and `.buttonStyle(.plain)` on row buttons.
- Use list row backgrounds to keep section styling consistent with your theme.

## Pitfalls

- Avoid heavy custom layouts inside a `Form`; it can lead to spacing issues.
- If you need highly custom layouts, prefer `ScrollView` + `VStack`.
- Don’t mix multiple background strategies; pick either default Form styling or custom colors.
