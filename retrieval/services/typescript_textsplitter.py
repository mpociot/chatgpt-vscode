from langchain import RecursiveCharacterTextSplitter

class TypescriptTextSplitter(RecursiveCharacterTextSplitter):
    separators = [
        # typescript
        "\ntype ",
        "\ninterface ",
        "\namespace ",
        # javascript
        # Split along function definitions
        "\nfunction ",
        "\nconst ",
        "\nlet ",
        "\nvar ",
        "\nclass ",
        # Split along control flow statements
        "\nif ",
        "\nfor ",
        "\nwhile ",
        "\nswitch ",
        "\ncase ",
        "\ndefault ",
        # Split by the normal type of lines
        "\n\n",
        "\n",
        " ",
        "",
      ];
    
    @classmethod
    def build(
        cls, **kwargs: Any
    ) -> RecursiveCharacterTextSplitter:
        separators = cls.separators
        return cls(separators=separators, **kwargs)