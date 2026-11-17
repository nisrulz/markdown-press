# Markdown Press

This page turns markdown into a PDF inside your browser. Nothing is uploaded. Nothing is saved.

## How to export

1. Write or paste markdown in the left pane.
2. Set the page format under **Format**.
3. Click **Save PDF**, then choose **Save as PDF** as the destination.

## Text

Use **bold**, *italic*, ***both at once***, ~~strikethrough~~, `inline code`, and
[links](https://example.com). The typographer adds “smart quotes” and em dashes — like this.

### Inline marks

Delete the ~~old line~~ and keep the **new** one. Press `Tab` to indent.

## Lists

1. Ordered item
2. Ordered item
   - Nested bullet
   - Another nested bullet

- [x] Parse the markdown
- [x] Render the preview
- [ ] Export the PDF

## Quote

> The draft lives in this tab only. A refresh clears it.

## Code

```js
const words = source.trim().split(/\s+/);
console.log(`${words.length} words`);
```

## Table

| Setting | Default |
| ------- | ------- |
| Page    | A4      |
| Margin  | 20 mm   |
| Text    | 11 pt   |

## Footnotes and rules

Footnotes collect at the end of the document.[^1]

---

[^1]: A footnote. The superscript links to this note.
