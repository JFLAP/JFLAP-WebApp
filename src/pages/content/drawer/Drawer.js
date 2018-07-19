import React from 'react';

import OverviewPanel from './panels/definition/OverviewPanel.js';
import TestingPanel from './panels/testing/TestingPanel.js';
import ExportingPanel from './panels/exporting/ExportingPanel.js';
import OptionsPanel from './panels/options/OptionsPanel.js';

import DrawerExpander from './DrawerExpander.js';

import './Drawer.css';

const TESTING = 0;
const OVERVIEW = 1;
const EXPORTING = 2;
const OPTIONS = 3;

const DEFAULT_TAB_INDEX = TESTING;

const MAX_PANEL_THRESHOLD = 50;
const MIN_PANEL_SIZE = 180;

class Drawer extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state = {
      tabIndex: DEFAULT_TAB_INDEX
    };
  }

  setTab(index)
  {
    //Open drawer if it is closed
    if (!this.props.app.state.isOpen)
    {
      this.props.app.openDrawer();
    }
    //Full drawer if clicked on same one
    /*
    else
    {
      if (this.state.tabIndex === index)
      {
        this.props.app.openDrawer(!this.props.app.state.isFullscreen);
      }
    }
    */

    this.setState((prev, props) => {
      return { tabIndex: index };
    });
  }

  getTab(index)
  {
    switch(index)
    {
      case OVERVIEW:
        return <OverviewPanel />;
      case TESTING:
        return <TestingPanel />;
      case EXPORTING:
        return <ExportingPanel />;
      case OPTIONS:
        return <OptionsPanel />;
      default:
        throw new Error("Unknown tab index \'" + tabIndex + "\'.");
    }
  }

  onStartDraggingDrawerBorder(ev)
  {
    ev.stopPropagation();
    ev.preventDefault();

    const app = this.props.app;

    //Ignore drag move if closed
    if (!app.state.isOpen)
    {
      /*
      //Opens the drawer if dragging, but closed
      this.props.app.openDrawer();
      */
      return;
    }

    //Disable fullscreen if dragging off of it
    if (app.state.isFullscreen)
    {
      app.openDrawer(false);
    }

    //Update panel to current click position
    updatePanelSize(app, ev);

    const onMouseMove = function(ev)
    {
      ev.stopPropagation();
      ev.preventDefault();

      updatePanelSize(app, ev);
    };

    const onMouseUp = function(ev)
    {
      ev.stopPropagation();
      ev.preventDefault();

      updatePanelSize(app, ev);

      //Remove listeners that are no longer needed
      document.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mousemove", onMouseMove);
    };

    //Start listening to move and release events
    document.addEventListener("mouseup", onMouseUp);
    document.addEventListener("mousemove", onMouseMove);
  }

  render()
  {
    const app = this.props.app;

    /*
    //Double click to expand to fullscreen and normal
    onDoubleClick={app.state.isOpen ? app.openDrawer.bind(app, true) : app.openDrawer.bind(app, false)}
    */
    return <div className={"drawer-container"}>
      <div className="drawer-content">
        {this.getTab(this.state.tabIndex)}
      </div>

      <div className="tab-list">
        <DrawerExpander app={app}/>
        <button className={"tab-link" + (this.state.tabIndex == TESTING ? " active" : "")}
          onClick={this.setTab.bind(this, TESTING)}>
          Testing
        </button>
        <button className={"tab-link" + (this.state.tabIndex == OVERVIEW ? " active" : "")}
          onClick={this.setTab.bind(this, OVERVIEW)}>
          <span>Definition</span>
        </button>
        <button className={"tab-link" + (this.state.tabIndex == EXPORTING ? " active" : "")}
          onClick={this.setTab.bind(this, EXPORTING)}>
          Exporting
        </button>
        <button className={"tab-link" + (this.state.tabIndex == OPTIONS ? " active" : "")}
          onClick={this.setTab.bind(this, OPTIONS)}>
          Options
        </button>
      </div>

      <div className="drawer-border"
        onMouseDown={this.onStartDraggingDrawerBorder.bind(this)}>
      </div>
    </div>;
  }
}

function updatePanelSize(app, ev)
{
  const container = app.container;
  let fullscreen = false;
  let size = 0;
  //This is the same criteria as in App.css
  if (window.matchMedia("(max-width: 400px)").matches)
  {
    //Vertical slide
    const viewportOffsetY = app.viewport.ref.getBoundingClientRect().y;
    if (ev.clientY - viewportOffsetY < MAX_PANEL_THRESHOLD)
    {
      //Enable fullscreen
      app.setState((prev, props) => {
        return {
          isFullscreen: true
        };
      });
    }
    else
    {
      size = container.offsetHeight - ev.clientY;

      //Disable fullscreen
      if (app.state.isFullscreen)
      {
        app.setState((prev, props) => {
          return {
            isFullscreen: false
          };
        });
      }
    }
  }
  else
  {
    //Horizontal slide
    if (ev.clientX < MAX_PANEL_THRESHOLD)
    {
      //Enable fullscreen
      app.setState((prev, props) => {
        return {
          isFullscreen: true
        };
      });
    }
    else
    {
      size = container.offsetWidth - ev.clientX;

      //Disable fullscreen
      if (app.state.isFullscreen)
      {
        app.setState((prev, props) => {
          return {
            isFullscreen: false
          };
        });
      }
    }
  }

  //Make sure is greater than minimum size and vice versa
  if (size < MIN_PANEL_SIZE) size = MIN_PANEL_SIZE;

  //Set panel size
  container.style.setProperty("--panel-size", size + "px");
}

export default Drawer;
