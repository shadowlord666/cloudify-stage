/**
 * Created by jakub.niezgoda on 14/09/2018.
 */
import PropTypes from 'prop-types';

import React, { Component } from 'react';
import { Icon, Popup } from './index';


/**
 * RevertToDefaultIcon is a component showing undo icon. It is desired to be used in input fields.
 *
 * ## Access
 * `Stage.Basic.RevertToDefaultIcon`
 *
 * ## Usage
 * ![RevertToDefaultIcon](manual/asset/RevertToDefaultIcon_0.png)
 *
 * ```
 * <Form.Input icon={<RevertToDefaultIcon value={this.state.value} defaultValue={param.default}
 *             onClick={() => this.revertToDefault(param.name)} />} value={this.state.value} />
 * ```
 */
export default class RevertToDefaultIcon extends Component {

    /**
     * propTypes
     * @property {string} value field value
     * @property {string} defaultValue field default value
     * @property {function} onClick function to be called on revert icon click
     */
    static propTypes = {
        value: PropTypes.string.isRequired,
        defaultValue: PropTypes.string.isRequired,
        onClick: PropTypes.func.isRequired,
    };

    render() {
        let {Icon, Popup} = Stage.Basic;

        return !_.isNil(this.props.defaultValue) && !_.isEqual(this.props.value, this.props.defaultValue)
            ?
            <Popup trigger={<Icon name='undo' link onClick={this.props.onClick} />}>
                Revert to default value
            </Popup>
            : null;
    }
}