Setup
  $ . ${TESTDIR}/../../../../helpers/setup_integration_test.sh single_package

Graph
  $ ${NRZ} run build --graph
  
  digraph {
  \tcompound = "true" (esc)
  \tnewrank = "true" (esc)
  \tsubgraph "root" { (esc)
  \t\t"[root] build" -> "[root] ___ROOT___" (esc)
  \t} (esc)
  }
  
Graph file
  $ ${NRZ} build --graph=graph.dot
   WARNING  `nrz` uses Graphviz to generate an image of your
  graph, but Graphviz isn't installed on this machine.
  
  You can download Graphviz from https://graphviz.org/download.
  
  In the meantime, you can use this string output with an
  online Dot graph viewer.
  
  digraph {
  \tcompound = "true" (esc)
  \tnewrank = "true" (esc)
  \tsubgraph "root" { (esc)
  \t\t"[root] build" -> "[root] ___ROOT___" (esc)
  \t} (esc)
  }
  
  
  \xe2\x9c\x93 Generated task graph in /tmp/prysk-tests-eir4a5ob/graph.t-91/graph.dot (esc)
  $ cat graph.dot | grep -o "\"[^\"]*\" -> \"[^\"]*\""
  cat: graph.dot: No such file or directory
  [1]
