/**
 * Created by aleksander laktionow on 19/10/2017.
 */
import React from 'react';

export default class ResetViewsModal extends React.Component {

    constructor(props,context) {
        super(props,context);

        this.state = ResetViewsModal.initialState;
        this.state.tenants = props.tenants.items.map((entry) => entry.name);
    }

    static initialState = {
        loading: false,
        tenants: [],
        errors: {}
    }

    toggleCheckbox(event, elem){
        let clickedTenant = elem.name;
        let newTenants = this.state.tenants;

        if (_.includes(this.state.tenants, clickedTenant)) {
            newTenants = _.pull(newTenants, clickedTenant);
        } else {
            newTenants.push(clickedTenant);
        }

        this.setState({tenants: newTenants});
    }

    onApprove () {
        this.props.onConfirm(this.state.tenants);
        return false;
    }

    onCancel () {
        this.props.onHide();
        return true;
    }

    render() {
        var {Modal, Icon, Form, ApproveButton, CancelButton, Checkbox, Table} = Stage.Basic;

        return (
            <Modal size="small" open={this.props.open} onClose={()=>this.props.onHide()}>
                <Modal.Header>
                    <Icon name="user"/> Reset view for tenants
                </Modal.Header>

                <Modal.Content>
                        Please select tenants you would like to reset views for:
                        <Table celled padded>
                            <Table.Body>
                                {this.props.tenants.items.map((tenant) => {
                                    return (
                                        <Table.Row key={tenant.name}>
                                            <Table.Cell textAlign="right">
                                                <Checkbox
                                                    name={tenant.name}
                                                    defaultChecked
                                                    onChange={this.toggleCheckbox.bind(this)} />
                                            </Table.Cell>
                                            <Table.Cell>
                                                {tenant.name}
                                            </Table.Cell>
                                        </Table.Row>
                                    );
                                })}
                            </Table.Body>
                        </Table>
                </Modal.Content>

                <Modal.Actions>
                    <CancelButton onClick={this.onCancel.bind(this)} disabled={this.state.loading} />
                    <ApproveButton onClick={this.onApprove.bind(this)} disabled={this.state.loading} icon="undo" color="green" content="Reset"/>
                </Modal.Actions>
            </Modal>
        );
    }
};
