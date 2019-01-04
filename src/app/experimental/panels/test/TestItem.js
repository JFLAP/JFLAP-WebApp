import React from 'react';
import Style from './TestItem.css';

import IconButton from 'experimental/components/IconButton.js';
import SubtractIcon from 'experimental/iconset/SubtractIcon.js';
import CheckCircleIcon from 'experimental/iconset/CheckCircleIcon.js';
import CrossCircleIcon from 'experimental/iconset/CrossCircleIcon.js';
import RunningManIcon from 'experimental/iconset/RunningManIcon.js';

export const DEFAULT_MODE = "default";
export const SUCCESS_MODE = "success";
export const FAILURE_MODE = "failure";

class TestItem extends React.Component
{
  constructor(props)
  {
    super(props);

    this.inputElement = null;

    this.state = {
      value: "",
      status: DEFAULT_MODE
    };

    this.onChange = this.onChange.bind(this);
  }

  focus()
  {
    if (this.inputElement)
    {
      this.inputElement.focus();
    }
  }

  onChange(e)
  {
    const nextValue = e.target.value;
    this.setState({value: nextValue});
  }

  //Override
  render()
  {
    const onDelete = this.props.onDelete;
    const showDelete = true;

    const onTest = this.props.onTest;
    const showTest = true;

    const name = this.props.name;
    const active = this.props.active;
    const subtitle = this.props.subtitle;
    const placeholder = this.props.placeholder;
    const status = this.state.status;

    return (
      <div id={this.props.id}
        className={Style.test_item_container +
          (active ? " active " : "") +
          " " + status +
          " " + this.props.className}
        style={this.props.style}>
        {showTest &&
          <IconButton className={Style.test_button}
            title={"Test"}
            disabled={!onTest}
            onClick={(e) => onTest(e, this)}>
            {status === SUCCESS_MODE ?
              <CheckCircleIcon/> :
              status === FAILURE_MODE ?
              <CrossCircleIcon/> :
              <RunningManIcon/>}
          </IconButton>}
        <div className={Style.test_input}>
          <input ref={ref=>this.inputElement=ref} type="text"
            placeholder={placeholder}
            value={this.state.value}
            onChange={this.onChange}/>
          <label>{this.props.subtitle}</label>
        </div>
        {showDelete &&
          <IconButton className={Style.delete_button}
            title={"Delete"}
            disabled={!onDelete}
            onClick={(e) => onDelete(e, this)}>
            <SubtractIcon/>
          </IconButton>}
      </div>
    );
  }
}

export default TestItem;
