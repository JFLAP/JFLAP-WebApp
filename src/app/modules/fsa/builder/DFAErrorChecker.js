import Config from 'config.js';
import { EMPTY } from 'machine/Symbols.js';

import Notifications from 'system/notification/Notifications.js';
import StateUnreachableWarningMessage from 'modules/fsa/notifications/StateUnreachableWarningMessage.js';
import StateMissingTransitionErrorMessage from 'modules/fsa/notifications/StateMissingTransitionErrorMessage.js';
import TransitionErrorMessage from 'modules/fsa/notifications/TransitionErrorMessage.js';
import StateErrorMessage from 'modules/fsa/notifications/StateErrorMessage.js';

const EDGE_SYMBOL_SEPARATOR = Config.EDGE_SYMBOL_SEPARATOR;

class DFAErrorChecker
{
  constructor(machineBuilder, graph)
  {
    this.machineBuilder = machineBuilder;
    this.graph = graph;

    this.errorNodes = [];
    this.errorEdges = [];
    this.warningNodes = [];
    this.warningEdges = [];
  }

  clear()
  {
    this.errorNodes.length = 0;
    this.errorEdges.length = 0;
    this.warningNodes.length = 0;
    this.warningEdges.length = 0;
  }

  checkErrors(shouldNotifyErrors=false, graphController=null, machineController=null)
  {
    //This should only run for "DFA" machine types...
    if (this.machineBuilder.getMachineType() != "DFA")
    {
      throw new Error("Invalid machine type to check for DFA errors");
    }

    const machine = this.machineBuilder.getMachine();
    const graph = this.graph;
    const alphabet = machine.getAlphabet();
    const errorNodes = this.errorNodes;
    const errorEdges = this.errorEdges;
    const warnNodes = this.warningNodes;
    const warnEdges = this.warningEdges;
    this.clear();

    let nodeTransitionMap = new Map();
    let startNode = graph.getStartNode();

    const placeholderEdges = [];
    const emptyEdges = [];
    const dupeEdges = [];
    for(const edge of graph.edges)
    {
      //check incomplete edges
      if (edge.isPlaceholder())
      {
        //Update cached error targets
        placeholderEdges.push(edge);
        if (errorEdges.indexOf(edge) == -1) errorEdges.push(edge);
      }
      else
      {
        const from = edge.getSourceNode();
        const to = edge.getDestinationNode();
        const labels = edge.getEdgeLabel().split(EDGE_SYMBOL_SEPARATOR);

        for(const label of labels)
        {
          //check for empty transitions
          if(label == EMPTY)
          {
            //Update cached error targets
            emptyEdges.push(edge);
            if (errorEdges.indexOf(edge) == -1) errorEdges.push(edge);
          }
          else
          {
            if(!nodeTransitionMap.has(from))
            {
              nodeTransitionMap.set(from, [label]);
            }
            else
            {
              //check for duplicate transitions
              const currentAlphabet = nodeTransitionMap.get(from);
              if(currentAlphabet.includes(label))
              {
                //Update cached error targets
                dupeEdges.push(edge);
                if (errorEdges.indexOf(edge) == -1) errorEdges.push(edge);
              }
              else
              {
                currentAlphabet.push(label);
              }
            }
          }
        }
      }
    }

    const missingNodes = [];
    //Check for missing transitions
    for(const node of graph.nodes)
    {
      const nodeTransitions = nodeTransitionMap.get(node);
      if (!nodeTransitions && alphabet.length != 0 ||
        nodeTransitions && nodeTransitions.length < alphabet.length)
      {
        //Get the required missing symbols
        /*
        let array;
        if (nodeTransitions)
        {
          array = [];
          for(const symbol of alphabet)
          {
            if (!nodeTransitions.includes(symbol))
            {
              array.push(symbol);
            }
          }
        }
        else
        {
          array = alphabet.slice();
        }
        */

        //Update cached error targets
        missingNodes.push(node);
        if (errorNodes.indexOf(node) == -1) errorNodes.push(node);
      }
    }

    const result = !(errorNodes.length == 0 && errorEdges.length == 0 &&
      warnNodes.length == 0 && warnEdges.length == 0);

    //Callbacks for all collected errors
    if (shouldNotifyErrors)
    {
      const messageTag = Config.MACHINE_ERRORS_MESSAGE_TAG;
      //Clear the existing messages
      Notifications.clearMessages(messageTag);

      //No errors!
      if (!result)
      {
        Notifications.addMessage(I18N.toString("message.error.none"), "success", messageTag, null, null, false);
      }
      //There are some errors/warnings...
      else
      {
        const props = {graphController: graphController, machineController: machineController};
        //Add new warning messages
        const unReachedNodes = getUnreachableNodes();
        if (unReachedNodes.length > 0)
        {
          Notifications.addMessage(unReachedNodes,
            "warning", messageTag, StateUnreachableWarningMessage, props, false);
        }

        //Add new error messages
        if (placeholderEdges.length > 0)
        {
          Notifications.addMessage({text: I18N.toString("message.error.incomplete"), targets: placeholderEdges},
            "error", messageTag, TransitionErrorMessage, props, false);
        }
        if (emptyEdges.length > 0)
        {
          Notifications.addMessage({text: I18N.toString("message.error.empty"), targets: emptyEdges},
            "error", messageTag, TransitionErrorMessage, props, false);
        }
        if (dupeEdges.length > 0)
        {
          Notifications.addMessage({text: I18N.toString("message.error.dupe"), targets: dupeEdges},
            "error", messageTag, TransitionErrorMessage, props, false);
        }
        if (missingNodes.length > 0)
        {
          Notifications.addMessage({targets: missingNodes},
            "error", messageTag, StateMissingTransitionErrorMessage, props, false);
        }
      }
    }

    return result;
  }

  getUnreachableNodes() {
    const graph = this.graph;
    const machine = this.machineBuilder.getMachine();

    const states = graph.nodes.slice();
    const nextStates = [];
    nextStates.push(states[0]);
    states.splice(0, 1);

    while(nextStates.length > 0)
    {
      const state = nextStates.pop();
      const i = states.indexOf(state);
      if (i >= 0)
      {
        states.splice(i, 1);
        const result = machine.getOutgoingTransitions(state);
        for(const state of result)
        {
          nextStates.push(state);
        }
      }
    }

    return states;
  }
}

export default DFAErrorChecker;
