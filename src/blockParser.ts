export interface Block {
  html?: string;
  [key: string]: any;
}

export type BlockFactory = (node: Element) => Block;

export interface BlockExtractor {
  selector: string;
  factory: BlockFactory;
}

export interface BlockParserOptions {
  defaultFactory?: BlockFactory;
}

export class BlockParser {
  constructor(private options: BlockParserOptions = {}) {}

  parseHtmlToBlocks(html: string, blockExtractors: BlockExtractor[]): Block[] {
    const doc = document.implementation.createHTMLDocument("");
    doc.documentElement.innerHTML = html;
    const { body } = doc;

    const blockElementToBlockFactory = new Map<Element, BlockFactory>();
    blockExtractors.forEach(extractor => {
      Array.from(body.querySelectorAll(extractor.selector)).forEach(blockElement => {
        splitWith(body, blockElement);
        blockElementToBlockFactory.set(blockElement, extractor.factory);
      });
    });

    const nodes = Array.from(body.childNodes);
    const elements = nodes.filter(nodeIsElement);
    const blocks = elements.map(this.nodeToBlock(blockElementToBlockFactory));
    return blocks;
  }

  nodeToBlock(blockElementToBlockFactory: Map<Element, BlockFactory>): BlockFactory {
    return node => {
      const factory = blockElementToBlockFactory.get(node);
      if (factory != null) {
        return factory(node);
      }
      return this.options.defaultFactory?.(node) ?? { html: node.outerHTML };
    };
  }
}

function splitWith(container: Element, splitElement: Element) {
  if (!getAncestors(splitElement).includes(container)) {
    throw new Error("'splitElement' must be a descendant of 'container'");
  }
  while (splitElement.parentElement?.parentElement != null && splitElement.parentElement !== container) {
    const parent = splitElement.parentElement;
    const parentChildren = Array.from(parent.childNodes);
    const lowerSiblings = parentChildren.slice(parentChildren.indexOf(splitElement) + 1);
    const stepParent = parent.cloneNode() as HTMLElement;
    delete stepParent.id; // ensure we don't get duplicated ids if a parent has one
    const grandparent = parent.parentElement!;
    grandparent.appendChild(splitElement);
    grandparent.appendChild(stepParent);
    lowerSiblings.forEach(sibling => {
      stepParent.appendChild(sibling);
    });
  }
}

function getAncestors(el: Element) {
  const list: Element[] = [];
  while (el.parentElement != null) {
    list.push(el.parentElement);
    el = el.parentElement;
  }
  return list;
}

function nodeIsElement(node: Node): node is Element {
  return node.nodeType === 1;
}
