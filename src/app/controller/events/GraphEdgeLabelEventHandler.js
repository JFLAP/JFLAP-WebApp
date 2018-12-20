import EventHandler from './EventHandler.js';

class GraphEdgeLabelEventHandler extends EventHandler
{
  constructor(eventLogger, graphController)
  {
    super(eventLogger, graphController, "edgeLabel");
  }

  //Override
  captureEvent(graph, targetEdge, nextLabel, prevLabel)
  {
    return {
      graph: graph,
      edgeID: targetEdge.getGraphElementID(),
      nextLabel: nextLabel,
      prevLabel: prevLabel
    };
  }

  //Override - this = event
  applyUndo(e)
  {
    const graph = this.controller.getGraph();
    const edgeIndex = graph.getEdgeIndexByID(e.eventData.edgeID);
    if (edgeIndex < 0) throw new Error("Unable to find target in graph");
    const edge = graph.getEdges()[edgeIndex];

    edge.setEdgeLabel(e.eventData.prevLabel);
  }

  //Override - this = event
  applyRedo(e)
  {
    const graph = this.controller.getGraph();
    const edgeIndex = graph.getEdgeIndexByID(e.eventData.edgeID);
    if (edgeIndex < 0) throw new Error("Unable to find target in graph");
    const edge = graph.getEdges()[edgeIndex];

    edge.setEdgeLabel(e.eventData.nextLabel);
  }
}
export default GraphEdgeLabelEventHandler;
