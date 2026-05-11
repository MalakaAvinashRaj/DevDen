# Reference Docs
DevDen · Software Engineer · Third-party documentation for in-context use

---

## What Goes Here

This folder contains curated reference documentation for third-party libraries, tools,
and services used in DevDen products. Files here are formatted for efficient LLM
consumption (`-llms.txt` suffix or condensed markdown).

The goal: give the agent the knowledge it needs for a specific library without
having to search the web. Repository-local knowledge only.

---

## Current References

| File | Library / Tool | Version | Last Updated |
|------|----------------|---------|-------------|
| — | — | — | — |

---

## How to Add a Reference

When adding a new library to the project:
1. Find or create a condensed reference for that library (key APIs, common patterns, gotchas)
2. Save as `[library-name]-llms.txt` or `[library-name]-reference.md`
3. Add a row to the table above
4. Keep it focused — common use cases only, not the full API docs

Good reference files include:
- The 20 most common function signatures
- Required patterns for this project (e.g., "always set timeout when using this client")
- Common gotchas and error messages
- How this library is initialized in this project specifically

---

## File Format Example

```
# [Library Name] — DevDen Reference
Version: [x.y.z]
Project usage: [how we use it — initialization path, patterns]

## Core API

[function signature]
[one-line description]
[usage example]

## Common Patterns

[pattern name]
[example code]

## Gotchas

[known issues or non-obvious behaviors]
```
