import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";

export class TypescriptTextSplitter {
    separators = [
        // typescript
        "\ntype ",
        "\ninterface ",
        "\namespace ",
        // javascript
        // Split along function definitions
        "\nfunction ",
        "\nconst ",
        "\nlet ",
        "\nvar ",
        "\nclass ",
        // Split along control flow statements
        "\nif ",
        "\nfor ",
        "\nwhile ",
        "\nswitch ",
        "\ncase ",
        "\ndefault ",
        // Split by the normal type of lines
        "\n\n",
        "\n",
        " ",
        "",
      ];

      static build(opts: any = {}) {
        return new TypescriptTextSplitter().build({
            ...opts
        }); 
      }

      build(opts: any = {}) {
        return new RecursiveCharacterTextSplitter({
            ...opts,
            separators: this.separators
        });          
      }
  }