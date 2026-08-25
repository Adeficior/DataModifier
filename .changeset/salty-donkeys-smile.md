---
"@adeficior/data-modifier-core": minor
"@adeficior/data-modifier-ingredients": patch
"@adeficior/data-modifier-tags": patch
---

moved ID Filter -> Predicate logic into tags module. Other modules should use it via `Predicates.id(...)`, which now also validates a given filter against the registry lookup.
