import { JSDOM } from "jsdom";

const document = new JSDOM("<html><body></body></html>");

declare global {
  namespace NodeJS {
    interface Global {
      document: Document;
    }
  }
}

global.document = document.window.document;
