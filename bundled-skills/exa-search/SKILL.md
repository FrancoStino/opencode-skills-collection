---
name: exa-search
description: "Semantic search, similar content discovery, and structured research using Exa API. Use when you need semantic/embeddings-based search, finding similar content, or searching by category (company, people, research papers, etc.)."
risk: critical
source: community
date_added: "2026-02-27"
---

# exa-search

## Overview
Semantic search, similar content discovery, and structured research using Exa API

## When to Use
- When you need semantic/embeddings-based search
- When finding similar content
- When searching by category (company, people, research papers, etc.)

## Installation
```bash
npx skills add -g BenedictKing/exa-search
```

## Step-by-Step Guide
1. Prefer an already configured Exa connector; this entrypoint does not bundle an API client or authorize a global installation.
2. Configure Exa API key
3. Define query, date range and source type. Run the smallest authorized search through the actual available tool, inspect primary sources, and return cited findings with uncertainties. Do not claim returned search snippets establish facts by themselves.

## Examples
See [GitHub Repository](https://github.com/BenedictKing/exa-search) for examples.

## Best Practices
- Configure API keys via environment variables

## Troubleshooting
See the GitHub repository for troubleshooting guides.

## Related Skills
- context7-auto-research, tavily-web, firecrawl-scraper, codex-review

## Limitations
- Query and retrieved content may be sent to an external service. Do not include secrets or private customer information without authorization; confirm paid usage scope.
- Search ranking is not evidence quality. Verify material claims at the linked source and report incomplete or unavailable retrieval honestly.
- Use this skill only when the task clearly matches the scope described above.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.
