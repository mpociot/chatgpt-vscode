from langchain import RecursiveCharacterTextSplitter

class ArmTextSplitter(RecursiveCharacterTextSplitter):
    separators = [
        "\nparameters",
        "\nvariables",
        "\nfunctions",
        "\nresources",
        "\noutputs",
        # Split by the normal type of lines
        "\n\n",
        "\n",
        "",
      ];
    
    @classmethod
    def build(
        cls, **kwargs: Any
    ) -> RecursiveCharacterTextSplitter:
        separators = cls.separators
        return cls(separators=separators, **kwargs)