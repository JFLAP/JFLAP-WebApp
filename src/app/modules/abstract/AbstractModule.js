import GraphImporter from './exporter/GraphImporter.js';
import GraphImageExporter from './exporter/GraphImageExporter.js';

import ExportingPanel from './panels/exporting/ExportingPanel.js';
import OptionsPanel from './panels/options/OptionsPanel.js';

import { FILE_TYPE_PNG, FILE_TYPE_JPG, FILE_TYPE_SVG } from 'util/Downloader.js';

//TODO: This is inserted by Drawer.js, not used here. (which is weird)
export const DEFAULT_PANELS = [ExportingPanel, OptionsPanel];

class AbstractModule
{
  constructor(app)
  {
    if (!app) throw new Error("Missing app for module class");
  }

  initialize(app)
  {
    if (!app) throw new Error("Missing app for module initialize");

    const inputController = this.getInputController();
    const graphController = this.getGraphController();
    const machineController = this.getMachineController();
    inputController.initialize(this);
    graphController.initialize(this);
    machineController.initialize(this);
  }

  destroy(app)
  {
    if (!app) throw new Error("Missing app for module destroy");

    const inputController = this.getInputController();
    const graphController = this.getGraphController();
    const machineController = this.getMachineController();
    machineController.destroy(this);
    graphController.destroy(this);
    inputController.destroy(this);
  }

  update(app)
  {
    if (!app) throw new Error("Missing app for module update");

    const inputController = this.getInputController();
    const graphController = this.getGraphController();
    const machineController = this.getMachineController();
    inputController.update(this);
    graphController.update(this);
    machineController.update(this);
  }

  getRenderer(renderLayer) { return null; }
  getInputController() { throw new Error("Missing input controller for module \'" + this.getModuleName() + "\'"); }
  getGraphController() { throw new Error("Missing graph controller for module \'" + this.getModuleName() + "\'"); }
  getMachineController() { throw new Error("Missing machine controller for module \'" + this.getModuleName() + "\'"); }
  getModulePanels() { return []; }
  getModuleViews() { return []; }
  getModuleMenus() { return []; }
  getModuleVersion() { return '0.0.0'; }
  getModuleName() { throw new Error("Missing module name"); }
  getLocalizedModuleName() { return "Module"; }
}

export default AbstractModule;
