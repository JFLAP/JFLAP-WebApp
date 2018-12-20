import EventHandler from './EventHandler.js';

class GraphEdgeDestinationEventHandler extends EventHandler
{
  constructor(eventLogger, graphController)
  {
    super(eventLogger, graphController, "edgeDestination");
  }

  //Override
  captureEvent(graph, targetEdge, nextDestination, prevDestination, prevQuad)
  {
    return {
      graph: graph,
      edgeID: targetEdge.getGraphElementID(),
      nextDestination: nextDestination,
      prevDestination: prevDestination,
      nextQuad: Object.assign({}, targetEdge.getQuadratic()),
      prevQuad: Object.assign({}, prevQuad),
    };
  }

  //Override - this = event
  applyUndo(e)
  {
    const graph = this.controller.getGraph();
    const edgeIndex = graph.getEdgeIndexByID(e.eventData.edgeID);
    if (edgeIndex < 0) throw new Error("Unable to find target in graph");
    const edge = graph.getEdges()[edgeIndex];

    let radians = e.eventData.prevQuad.radians;
    const length = e.eventData.prevQuad.length;

    edge.changeDestinationNode(e.eventData.prevDestination);
    //Flip them, since self loops are upside down
    if (edge.isSelfLoop()) radians = -radians;
    edge.setQuadratic(radians, length);
  }

  //Override - this = event
  applyRedo(e)
  {
    const graph = this.controller.getGraph();
    const edgeIndex = graph.getEdgeIndexByID(e.eventData.edgeID);
    if (edgeIndex < 0) throw new Error("Unable to find target in graph");
    const edge = graph.getEdges()[edgeIndex];

    let radians = e.eventData.nextQuad.radians;
    const length = e.eventData.nextQuad.length;

    edge.changeDestinationNode(e.eventData.nextDestination);
    edge.setQuadratic(radians, length);
  }
}
export default GraphEdgeDestinationEventHandler;
