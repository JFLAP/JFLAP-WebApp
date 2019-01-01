import React from 'react';
import './App.css';

import DrawerView, { DRAWER_SIDE_RIGHT, DRAWER_SIDE_BOTTOM, DRAWER_BAR_DIRECTION_VERTICAL, DRAWER_BAR_DIRECTION_HORIZONTAL } from './drawer/DrawerView.js';
import ToolbarView from './toolbar/ToolbarView.js';
import WorkspaceView from './workspace/WorkspaceView.js';
import TooltipView from './workspace/TooltipView.js';
import ViewportView from './viewport/ViewportView.js';
import UploadDropZone from './components/UploadDropZone.js';

import EditPane from './EditPane.js';
import TapePane from './TapePane.js';

import ToolbarButton, {TOOLBAR_CONTAINER_TOOLBAR} from './toolbar/ToolbarButton.js';
import ToolbarDivider from './toolbar/ToolbarDivider.js';
import ToolbarUploadButton from './toolbar/ToolbarUploadButton.js';
import PageEmptyIcon from './iconset/PageEmptyIcon.js';
import UndoIcon from './iconset/UndoIcon.js';
import RedoIcon from './iconset/RedoIcon.js';
import UploadIcon from './iconset/UploadIcon.js';
import DownloadIcon from './iconset/DownloadIcon.js';
import BugIcon from './iconset/BugIcon.js';
import WorldIcon from './iconset/WorldIcon.js';
import HelpIcon from './iconset/HelpIcon.js';

import HotKeyManager, {CTRL_KEY, ALT_KEY, SHIFT_KEY} from './hotkey/HotKeyManager.js';
import HotKeyView from './hotkey/HotKeyView.js';

import Notifications from 'system/notification/Notifications.js';
import NotificationView from 'system/notification/components/NotificationView.js';

import InputAdapter from 'system/inputadapter/InputAdapter.js';
import UndoManager from 'system/undomanager/UndoManager.js';

import FSAModule from 'modules/fsa/FSAModule.js';

const HELP_URL = "https://github.com/flapjs/FLAPJS-WebApp/blob/master/docs/HELP.md";

class App extends React.Component
{
  constructor(props)
  {
    super(props);

    this._workspace = null;
    this._toolbar = null;
    this._drawer = null;
    this._viewport = null;

    //These need to be initialized before module
    this._inputAdapter = new InputAdapter();
    this._inputAdapter.getViewport()
      .setMinScale(0.1)
      .setMaxScale(10)
      .setOffsetDamping(0.4);
    this._undoManager = new UndoManager();

    this._hotKeyManager = new HotKeyManager();
    this._hotKeyManager.registerHotKey("Export to PNG", [CTRL_KEY, 'KeyP'], () => {console.log("Export!")});
    this._hotKeyManager.registerHotKey("Save as JSON", [CTRL_KEY, 'KeyS'], () => {console.log("Save!")});
    this._hotKeyManager.registerHotKey("New", [CTRL_KEY, 'KeyN'], () => {console.log("New!")});
    this._hotKeyManager.registerHotKey("Undo", [CTRL_KEY, 'KeyZ'], () => {console.log("Undo!")});
    this._hotKeyManager.registerHotKey("Redo", [CTRL_KEY, SHIFT_KEY, 'KeyZ'], () => {console.log("Redo!")});

    this._module = new FSAModule(this);

    this._init = false;

    this.state = {
      hide: false
    };

    this._mediaQuerySmallWidthList = window.matchMedia("only screen and (max-width: 400px)");
    this._mediaQuerySmallHeightList = window.matchMedia("only screen and (min-height: 400px)");

    //Notifications.addMessage("Welcome to Flap.js");
  }

  //Override
  componentDidMount()
  {
    const workspaceDOM = this._workspace.ref;
    this._inputAdapter.initialize(workspaceDOM);
    this._module.initialize(this);
    this._hotKeyManager.initialize();

    this._init = true;
  }

  //Override
  componentWillUnmount()
  {
    this._init = false;

    this._hotKeyManager.destroy();
    this._module.destroy(this);
    this._inputAdapter.destroy();
  }

  get workspace() { return this._workspace; }
  get viewport() { return this._inputAdapter.getViewport(); }
  getCurrentModule() { return this._module; }
  getInputAdapter() { return this._inputAdapter; }
  getUndoManager() { return this._undoManager; }
  getHotKeyManager() { return this._hotKeyManager; }

  //Override
  render()
  {
    if (this._init)
    {
      this._inputAdapter.update();
      this._module.update(this);
    }

    const hasSmallWidth = this._mediaQuerySmallWidthList.matches;
    const hasSmallHeight = this._mediaQuerySmallHeightList.matches;
    const isFullscreen = this.state.hide;

    const undoManager = this._undoManager;
    const viewport = this._inputAdapter.getViewport();
    const inputController = this._module.getInputController();
    const graphController = this._module.getGraphController();
    const machineController = this._module.getMachineController();
    const graphImporter = this._module.getGraphImporter();
    const inputActionMode = inputController.isActionMode(graphController);

    const GRAPH_RENDER_LAYER = "graph";
    const GRAPH_OVERLAY_RENDER_LAYER = "graphoverlay";
    const VIEWPORT_RENDER_LAYER = "viewport";
    const GraphRenderer = this._module.getRenderer(GRAPH_RENDER_LAYER);
    const GraphOverlayRenderer = this._module.getRenderer(GRAPH_OVERLAY_RENDER_LAYER);
    const ViewportRenderer = this._module.getRenderer(VIEWPORT_RENDER_LAYER);

    return (
      <div className="app-container">
        <ToolbarView ref={ref=>this._toolbar=ref} className="app-bar"
          hide={isFullscreen}>
          <ToolbarButton title="New" icon={PageEmptyIcon}
            onClick={() => {
              if (window.confirm(I18N.toString("alert.graph.clear")))
              {
                graphController.getGraph().clear();
                undoManager.clear();
                machineController.setMachineName(null);

                this._toolbar.closeBar();
              }
            }}/>
          <ToolbarButton title="Undo" icon={UndoIcon} containerOnly={TOOLBAR_CONTAINER_TOOLBAR}
            disabled={!undoManager.canUndo()}
            onClick={()=>undoManager.undo()}/>
          <ToolbarButton title="Redo" icon={RedoIcon} containerOnly={TOOLBAR_CONTAINER_TOOLBAR}
            disabled={!undoManager.canRedo()}
            onClick={()=>undoManager.redo()}/>
          <ToolbarUploadButton title="Upload" icon={UploadIcon} accept={graphImporter.getImportFileTypes().join(",")}
            onUpload={file => {
              graphImporter.importFile(file, this._module)
                .catch((e) => {
                  Notifications.addErrorMessage("ERROR: Unable to load invalid JSON file.", "errorUpload");
                  console.error(e);
                })
                .finally(() => {
                  this._toolbar.closeBar();
                });
            }}/>
          <ToolbarButton title="Export" icon={DownloadIcon}
            onClick={()=>{
              this._drawer.setCurrentTab(0);
              this._toolbar.closeBar();
            }}
            disabled={graphController.getGraph().isEmpty()}/>
          <ToolbarDivider/>
          <ToolbarButton title="Report a Bug" icon={BugIcon}/>
          <ToolbarButton title="Language" icon={WorldIcon}/>
          <ToolbarButton title="Help" icon={HelpIcon}
            onClick={()=>window.open(HELP_URL, '_blank')}/>
        </ToolbarView>
        <DrawerView ref={ref=>this._drawer=ref} className="app-content"
          panels={this._module.getModulePanels()}
          panelProps={{currentModule: this._module}}
          side={hasSmallWidth ? DRAWER_SIDE_BOTTOM : DRAWER_SIDE_RIGHT}
          direction={hasSmallHeight ? DRAWER_BAR_DIRECTION_VERTICAL : DRAWER_BAR_DIRECTION_HORIZONTAL}
          hide={isFullscreen}>
          <UploadDropZone>
            <div className="viewport">
              <TooltipView visible={/* For the initial fade-in animation */this._init && graphController.getGraph().isEmpty()}>
                <label>{I18N.toString("message.workspace.empty")}</label>
                <label>{"Hello?"}</label>
                <label>{"If you need help, try the \'?\' at the top."}</label>
              </TooltipView>

              <WorkspaceView ref={ref=>this._workspace=ref} viewport={viewport}>
                {/* Graph origin crosshair */
                  !graphController.getGraph().isEmpty() &&
                  <React.Fragment>
                    <line className="graph-ui" x1="0" y1="-5" x2="0" y2="5" stroke="var(--color-viewport-back-detail)"/>
                    <line className="graph-ui" x1="-5" y1="0" x2="5" y2="0" stroke="var(--color-viewport-back-detail)"/>
                  </React.Fragment>}
                {/* Graph objects */
                  GraphRenderer &&
                  <GraphRenderer currentModule={this._module} parent={this._workspace}/>}
                {/* Graph overlays */
                  GraphOverlayRenderer &&
                  <GraphOverlayRenderer currentModule={this._module} parent={this._workspace}/>}
              </WorkspaceView>

              <NotificationView notificationManager={Notifications}>
              </NotificationView>

              <HotKeyView hotKeyManager={this._hotKeyManager}/>

              <ViewportView ref={ref=>this._viewport=ref}>
                <EditPane app={this} module={this._module} viewport={viewport}/>
                <TapePane app={this} module={this._module} viewport={viewport}/>
              </ViewportView>
            </div>
          </UploadDropZone>
        </DrawerView>
      </div>
    );
  }
}

export default App;
