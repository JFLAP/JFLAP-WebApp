import React from 'react';
import Style from './AnalysisPanel.css';

import PanelContainer from 'experimental/panels/PanelContainer.js';
import PanelSection from 'experimental/panels/PanelSection.js';
import PanelCheckbox from 'experimental/panels/PanelCheckbox.js';

class AnalysisPanel extends React.Component
{
  constructor(props)
  {
    super(props);

    this.optimizeUnreachOption = null;
    this.optimizeRedundOption = null;

    this.onOptimizeMachine = this.onOptimizeMachine.bind(this);
  }

  onDeleteAllUnreachable(e)
  {
    const currentModule = this.props.currentModule;
    const graphController = currentModule.getGraphController();
    const machineController = currentModule.getMachineController();
    const unreachableArray = machineController.getUnreachableNodes();
    graphController.deleteTargetNodes(unreachableArray);
  }

  onOptimizeMachine(e)
  {
    if (this.optimizeUnreachOption.isChecked())
    {
      this.onDeleteAllUnreachable(e);
    }
  }

  canOptimize()
  {
    return (this.optimizeRedundOption && this.optimizeRedundOption.isChecked()) ||
    (this.optimizeUnreachOption && this.optimizeUnreachOption.isChecked());
  }

  //Override
  render()
  {
    const currentModule = this.props.currentModule;
    const graphController = currentModule.getGraphController();
    const machineController = currentModule.getMachineController();

    return (
      <PanelContainer id={this.props.id}
        className={this.props.className}
        style={this.props.style}
        title={AnalysisPanel.TITLE}>
        <PanelSection title={"Optimizations"} initial={true}>
          <PanelCheckbox ref={ref=>this.optimizeUnreachOption=ref}
            id="opt-unreach" title="Unreachables" value="unreach"/>
          <PanelCheckbox ref={ref=>this.optimizeRedundOption=ref} disabled={true}
            id="opt-redund" title="Redundant States" value="redund"/>
          <button className={Style.analysis_button} onClick={this.onOptimizeMachine} disabled={!this.canOptimize()}>Optimize</button>
        </PanelSection>
      </PanelContainer>
    );
  }
}
Object.defineProperty(AnalysisPanel, 'TITLE', {
  get: function() { return I18N.toString("component.analysis.title"); }
});

export default AnalysisPanel;