import { describe, it } from "mocha";
import { expect } from "chai";
import { BlockParser } from "./blockParser";
import "./test/jsdom-shims";

describe("blockParser", function () {
  it("should parse block simple", function () {
    const parser = new BlockParser();
    const blocks = parser.parseHtmlToBlocks(
      `<div>
    <div>1</div>
    <div>2</div>
    <div>
      <div class="special">3 (nested order lost)</div>
    </div>
    <div>4</div>
    <div class="special">5 (works)</div>
    <div>6</div>
    </div>
  `,
      [
        {
          selector: "div.special",
          factory: (div: Element) => {
            return { weirdChamp: (div as HTMLElement).innerHTML };
          },
        },
      ],
    );
    expect(blocks.length).to.eq(5);
    expect(blocks[0].html?.includes("<div>4</div>")).to.be.false;
    expect(blocks[2].html?.includes("<div>4</div>")).to.be.true;
    console.log({ blocks });
  });
});
