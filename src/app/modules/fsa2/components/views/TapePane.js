import React from 'react';
import Style from 'experimental/viewport/ViewportView.css';

import TapeWidget from 'experimental/widgets/TapeWidget.js';
import NavbarWidget from 'experimental/widgets/NavbarWidget.js';

class TapePane extends React.Component
{
    constructor(props)
    {
        super(props);
    }

    /** @override */
    componentDidMount()
    {
        const session = this.props.session;
        const currentModule = session.getCurrentModule();
        const inputController = currentModule.getInputController();

        inputController.setDisabled(true);
    }

    /** @override */
    componentWillUnmount()
    {
        const session = this.props.session;
        const currentModule = session.getCurrentModule();
        const inputController = currentModule.getInputController();

        inputController.setDisabled(false);
    }

    /** @override */
    render()
    {
        const session = this.props.session;
        const currentModule = session.getCurrentModule();
        const app = session.getApp();

        const tester = currentModule._tester;

        return (
            <div id={this.props.id}
                className={Style.view_pane +
          ' ' + this.props.className}
                style={this.props.style}>
                <NavbarWidget className={Style.view_widget} style={{right: 0}}
                    viewportAdapter={app.getInputAdapter().getViewportAdapter()}/>
                <div className={Style.view_widget} style={{bottom: 0}}>
                    <TapeWidget value={tester ? tester.getTapeContext() : null}/>
                </div>
            </div>
        );
    }
}

export default TapePane;