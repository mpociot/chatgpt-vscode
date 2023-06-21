# Mermaid diagrams

We can simply ask Chat GPT to create Mermaid ERD code for a specific use case.
We can also specify a specific diagram type:

Mermaid supports the following types of diagrams:

- Flowchart
- Sequence
- Class
- State
- Entity Relationship
- User Journey
- Gantt
- Pie
- Requirement

See [how to include diagrams in github project/](https://www.makeuseof.com/how-to-include-diagrams-in-github-project/)

## Export diagrams to PNG

We can export a mermaid diagram to PNG very simply using the official Mermaid CLI Tool.

Installation via npm

`npm i -g mermaid.cli`

Usage:

`mmdc -i ${input_file_location} -o ${output_file_location}`

Example

```bash
echo 'sequenceDiagram\nAlice ->> Bob: Hey, Bob!\nBob ->> Alice: Hey there, Alice!' > /tmp/alice-bob.mmd
mmdc -i /tmp/alice-bob.mmd -o /tmp/alice-bob.png
open /tmp/alice-bob.png
```