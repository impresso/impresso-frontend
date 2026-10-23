# Search Images: explicit random-page action

## Goal

In `src/pages/SearchImages.vue`, load a predictable results page at startup. Load a
random page only when the user clicks **Load random page**, and enable that button
only when the main image search has a known, positive total.

## Current behavior

- `paginationCurrentPage` defaults to `0` when the route has no `p` parameter.
- The immediate `serviceQuery` watcher calls `fetchSearchResults()` on startup.
- `fetchSearchResults()` omits `offset` for page `0`, allowing the image service to
  return a random page even though the user has not requested one.
- `loadRandomPage()` sets `p: 0`; the response supplies the actual page through
  `pagination.offset` and `pagination.limit`.
- The random-page button is always enabled.

## Required behavior

### Deterministic startup and normal navigation

- Without a valid positive `p` parameter, start at page `1` and explicitly send
  `offset: 0` to `imagesService.find()`.
- Treat missing, malformed, zero, and negative startup page values as page `1`.
  Opening or reloading a URL containing `p=0` must not itself request randomness.
- Preserve valid positive page links and calculate their offset as
  `(page - 1) * limit`.
- Initial searches, filter changes, sorting, similarity searches, and ordinary
  pagination must not implicitly request a random page. Preserve their existing
  filter, sorting, similarity, and page-reset behavior otherwise.
- Keep the normal startup search and facets request; this change does not mean
  showing an empty view until the user interacts.

### Explicit random-page action

- Keep the existing button and translated label.
- Only an enabled button click may initiate a random-page request using the
  service's existing omitted-offset behavior.
- Preserve the active filters, sort order, similarity target, and page size.
- After the response, update the displayed page from the returned pagination
  metadata and keep the URL and pagination controls consistent with that page.
- Random selection is one-shot: subsequent ordinary requests must use an explicit
  offset. Do not let a random-request marker become the default startup state.
- Clicking again after completion must request another random page, even if the
  previous response happened to select the same page. A different page is not
  guaranteed.

### Button availability

Use the main results total (`paginationTotalRows`, populated from
`imagesRes.pagination.total`), not facet counts or the current page's item count.

The button is enabled only when:

```text
isLoading === false && paginationTotalRows > 0
```

- Disable it before the initial total is available, during result requests, and
  when the current search has zero results.
- Keep it disabled while new filters or another search are loading, even if a
  previous search had results.
- Guard the action handler with the same eligibility condition so an ineligible
  invocation cannot navigate or issue a random request.
- A positive total smaller than or equal to one page still enables the action.

## Implementation notes

- Separate the normal page-1 fallback from the explicit random-request intent;
  changing the fallback alone must not disable the click action.
- Check the interaction between the immediate `serviceQuery` watcher and writing
  the resolved page back to the route. Do not introduce request loops or extra
  random requests through that synchronization.
- No backend, translation, or unrelated search-component changes are required.

## Acceptance tests

1. Mount without `p`: the initial image request includes `offset: 0`; no random
   request is made, and the button is initially disabled.
2. Mount with `p=3` and `limit=12`: the initial request includes `offset: 24`.
3. Mount with missing, malformed, zero, or negative `p`: use page `1` and
   `offset: 0`, never a random request.
4. Resolve a search with a positive total: enable the button after loading ends,
   including when the total fits on one page.
5. Resolve a search with total `0`: keep the button disabled; invoking its handler
   does not navigate or request a random page.
6. While a new search is pending after a previous positive total: disable the
   button and prevent random requests.
7. Click the enabled button: request a random page without `offset`, retaining all
   other active search inputs. Disable the button until loading completes.
8. Resolve that random request: display its results and synchronize the returned
   page with the URL and pagination controls without another random request.
9. Click again after completion: issue a new random request, including when the
   previous random page was page `1` or the same page as before.
10. After a random selection, use ordinary pagination or change search inputs:
    subsequent non-random requests include the appropriate explicit offset.

## Scope

Implemented in `src/pages/SearchImages.vue`, with regression tests in
`src/pages/SearchImages.test.ts`.
