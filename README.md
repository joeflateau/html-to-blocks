# html-to-blocks

## Stackblitz

<https://stackblitz.com/edit/angular-html-to-blocks>

## Summary

Use this package when you have a need to accept html from a CMS and parse/transform it into components. For example, if you need to extract videos, images, photo galleries, or other functionality from html a content manager enters in a CMS.

You provide the input html and a list of blocks to extract and how to extract them (selectors/factories). The html is parsed into a DOM and transformed into a list of blocks based on the selectors/factories you provide. Elements not matched by the selector are, by default, transformed into html blocks. Elements matched by the selectors are extracted from wherever deep in the DOM they may be to be children of the root element. So, for example, if you have a video deep within nested html elements, the surrounding content will be split into 3 blocks: 1 html block, 1 video block then 1 more html block. This process of splitting a deeply nested html to lift the video to the top level requires recursive cloning of the video's parent elements, so you will end up with more container elements in your html blocks than the input html, but you should not have duplicated content, as siblings will not be duplicated in that process.

This library does not implement the way to format/display these blocks. The scope of this project is to accept html and parse it into a list of blocks. However, once you have your list of blocks, formatting/displaying is trivial (see example).

## Usage (Angular)

```typescript
import { Component, Input } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { Block, BlockParser } from "html-to-blocks";

@Component({
  selector: "app-blocks",
  template: `
    <ng-container *ngFor="let block of blocks">
      <div *ngIf="block.html" [innerHTML]="block.html"></div>
      <iframe *ngIf="block.youtubeUrl" [src]="block.youtubeUrl"></iframe>
    </ng-container>
  `,
})
export class BlocksComponent {
  blocks: Block[] = [];
  blockParser: BlockParser = new BlockParser();

  constructor(private domSanitizer: DomSanitizer) {}

  @Input()
  set html(html: string) {
    this.blocks = this.blockParser.parseHtmlToBlocks(html, [
      {
        selector: "iframe[src*='youtube.com'],iframe[src*='youtu.be']",
        factory: (iframe: HTMLIFrameElement) => {
          const youtubeUrl = this.domSanitizer.bypassSecurityTrustResourceUrl(
            "https://www.youtube.com/embed/" + parseYoutubeIdFromUrl(iframe.src),
          );
          return { youtubeUrl };
        },
      },
    ]);
  }
}
```
