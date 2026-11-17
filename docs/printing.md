# Printing

The browser print engine writes the PDF. The app generates a stylesheet for each export.

## Why the print engine

| Option | Text layer | File size | Extra dependency | Pagination |
| ------ | ---------- | --------- | ---------------- | ---------- |
| Browser print | Real text | Small | None | CSS rules |
| Canvas to image | None | Large | A rasterizer and a PDF writer | Manual |
| PDF layout library | Real text | Small | A full layout engine | Manual |

A canvas converter turns a page into one image. The result has no text layer. You cannot select the
text, search it, or read it with a screen reader. The print engine keeps the text, the links, and the
bookmarks. It is already installed.

The cost is one dialog. Chrome and Safari remember the last destination. The second export takes one
click and **Save**.

## What the generated stylesheet does

`buildPrintCss()` returns these parts:

```css
@page { size: 210mm 297mm; margin: 20mm; }

/* flatten the app containers */
.app, .workspace, .preview-pane, .doc-scroll,
.sheet-wrap, .sheet-scale { display: block; width: auto; height: auto; ... }

/* hide the chrome */
.appbar, .editor-pane, .splitter, .pane-head,
.statusbar, .settings, .toast, .guides { display: none; }

/* the page */
.sheet { font-family: <chosen>; font-size: 11pt; line-height: 1.55; padding: 0; }
```

A rule uses `!important` where an inline style from the preview can win. The preview sets a pixel
width, a pixel height, and a scale on the wrapper and the layer. Print clears all three.

The scale reset is important. Without it the PDF prints at the preview scale, and the page count does
not match.

## Page sizes

| Name | Width | Height |
| ---- | ----- | ------ |
| A4 | 210 mm | 297 mm |
| US Letter | 215.9 mm | 279.4 mm |
| US Legal | 215.9 mm | 355.6 mm |
| A5 | 148 mm | 210 mm |

The margin is one value from 5 to 40 mm. It applies to all 4 sides.

## Break rules

```
h1, h2, h3, h4      break-after: avoid      no heading alone at the foot of a page
pre, blockquote,    break-inside: avoid     keep the block together
figure, tr, img,
.toc
thead               table-header-group      repeat the header on a new page
p, li               orphans: 3, widows: 3  no single stranded line
pre                 white-space: pre-wrap  a long code line wraps at the page edge
```

A code block longer than one page cannot stay together. The browser breaks it. The wrap rule keeps
the text readable.

## Browser notes

- Chrome and Edge honor `@page size`. The dialog shows the chosen paper.
- Safari uses the same CSS. Check the paper size in the dialog the first time.
- Firefox prints too. Check the page count in the preview before you send the file.
- Turn off **Headers and footers** in the dialog. If you do not, the browser adds the page URL, the
  date, and a page number in its own font.
- The stylesheet sets `print-color-adjust: exact`. Table headers, code blocks, and the contents box
  keep their shading. If the shading is still missing, enable **Background graphics** in the dialog.
- Chrome ignores `@page` margin boxes. This app does not draw page numbers. Use the headers in the
  dialog if you need them.

## Check a change to the print path

1. Run `make dev`.
2. Load the sample with **Sample**.
3. Click **Save PDF** and save the file.
4. Check 4 things: the page size, the margin, the table header on page 2, and the code block near the
   page break.
5. Add a long table and a long code block. Export again.

The unit tests cover the generated CSS and the title swap. They cannot see a bad page break. That
check needs a layout engine.
