# Shopping List Exporter

A small Chrome/Edge extension that exports visible basket or shopping-list items into a copyable text list.

## What it does

- Runs only when you click the extension button.
- Reads the currently open Asda page.
- Looks for product-like elements in the visible DOM.
- Extracts item name, quantity and price where possible.
- Outputs a clean copyable list.

## What it does not do

- It does not log in for you.
- It does not call any API.
- It does not place orders.
- It does not recreate someone else's basket automatically.

## Install locally

1. Open Chrome or Edge.
2. Go to `chrome://extensions`.
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select this folder: `asda-list-exporter`.
6. Open your groceries basket/list page.
7. Click the extension icon.
8. Click **Export visible list**.

## Development notes

Currently only coded for Asda, they may change their page structure, so `content.js` uses several fallback selectors rather than one perfect selector.

If the extension misses items, inspect the product card HTML and add a more specific selector to:

```js
candidateSelectors