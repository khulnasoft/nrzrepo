Setup
  $ . ${TESTDIR}/../../../helpers/setup_integration_test.sh task_dependencies/topological

Graph to stdout
  $ ${NRZ} build -F my-app --graph
  
  digraph {
  \tcompound = "true" (esc)
  \tnewrank = "true" (esc)
  \tsubgraph "root" { (esc)
  \t\t"[root] my-app#build" -> "[root] util#build" (esc)
  \t\t"[root] util#build" -> "[root] ___ROOT___" (esc)
  \t} (esc)
  }
  
  $ ${NRZ} build -F my-app --graph=graph.dot
   WARNING  `nrz` uses Graphviz to generate an image of your
  graph, but Graphviz isn't installed on this machine.
  
  You can download Graphviz from https://graphviz.org/download.
  
  In the meantime, you can use this string output with an
  online Dot graph viewer.
  
  digraph {
  \tcompound = "true" (esc)
  \tnewrank = "true" (esc)
  \tsubgraph "root" { (esc)
  \t\t"[root] my-app#build" -> "[root] util#build" (esc)
  \t\t"[root] util#build" -> "[root] ___ROOT___" (esc)
  \t} (esc)
  }
  
  
  \xe2\x9c\x93 Generated task graph in /tmp/prysk-tests-ebsr4nd1/graph.t/graph.dot (esc)
  $ cat graph.dot | grep -o "\"[^\"]*\" -> \"[^\"]*\""
  cat: graph.dot: No such file or directory
  [1]

  $ ${NRZ} build -F my-app --graph=graph.html
  
  .*Generated task graph in .*graph\.html.* (re)
  $ cat graph.html | grep --quiet "DOCTYPE"

  $ ${NRZ} build -F my-app --graph=graph.mermaid
  
  .*Generated task graph in .*graph\.mermaid.* (re)

  $ cat graph.mermaid
  graph TD
  \\t[A-Z]{4}\("my-app#build"\) --> [A-Z]{4}\("util#build"\).* (re)
  \\t[A-Z]{4}\("util#build"\) --> [A-Z]{4}\("___ROOT___"\).* (re)

  $ ${NRZ} build -F my-app --graph=graph.mdx
   ERROR  invalid value 'graph.mdx' for '--graph [<GRAPH>]': Invalid file extension: 'mdx'. Allowed extensions are: ["svg", "png", "jpg", "pdf", "json", "html", "mermaid", "dot"]
  
  For more information, try '--help'.
  
  [1]

