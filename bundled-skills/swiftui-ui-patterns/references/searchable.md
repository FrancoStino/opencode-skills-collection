# Searchable

## Intent

Use `searchable` to add native search UI with optional scopes and async results.

## Core patterns

- Bind `searchable(text:)` to local state.
- Use `.searchScopes` for multiple search modes.
- Use `.task(id: searchQuery)` or debounced tasks to avoid overfetching.
- Show placeholders or progress states while results load.

## Example: searchable with scopes

```swift
@MainActor
struct ExploreView: View {
  @State private var searchQuery = ""
  @State private var searchScope: SearchScope = .all
  @State private var isSearching = false
  @State private var results: [SearchResult] = []

  var body: some View {
    List {
      if isSearching {
        ProgressView()
      } else {
        ForEach(results) { result in
          SearchRow(result: result)
        }
      }
    }
    .searchable(
      text: $searchQuery,
      placement: .navigationBarDrawer(displayMode: .always),
      prompt: Text("Search")
    )
    .searchScopes($searchScope) {
      ForEach(SearchScope.allCases, id: \.self) { scope in
        Text(scope.title)
      }
    }
    .task(id: [searchQuery, String(describing: searchScope)]) {
      await runSearch(query: searchQuery, scope: searchScope)
    }
  }

  private func runSearch(query requestedQuery: String, scope requestedScope: SearchScope) async {
    guard !requestedQuery.isEmpty else {
      results = []
      isSearching = false
      return
    }
    isSearching = true
    defer {
      if !Task.isCancelled && searchQuery == requestedQuery && searchScope == requestedScope {
        isSearching = false
      }
    }
    do {
      try await Task.sleep(for: .milliseconds(250))
      try Task.checkCancellation()
      let fetched = await fetchResults(query: requestedQuery, scope: requestedScope)
      try Task.checkCancellation()
      guard searchQuery == requestedQuery && searchScope == requestedScope else { return }
      results = fetched
    } catch is CancellationError {
      return
    } catch {
      guard !Task.isCancelled else { return }
      results = []
    }
  }
}
```

## Design choices to keep

- Show a placeholder when search is empty or has no results.
- Debounce input to avoid spamming the network.
- Keep search state local to the view.

## Pitfalls

- Avoid running searches for empty strings.
- Don’t block the main thread during fetch.
