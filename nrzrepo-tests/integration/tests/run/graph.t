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
  
  .*Generated task graph in .*graph\.dot.* (re)
  $ cat graph.dot | grep -o "\"[^\"]*\" -> \"[^\"]*\""
  "[root] my-app#build" -> "[root] util#build"
  "[root] util#build" -> "[root] ___ROOT___"

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

