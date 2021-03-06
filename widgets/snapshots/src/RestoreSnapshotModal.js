/**
 * Created by kinneretzin on 03/21/2017.
 */

import Actions from './actions';
import PropTypes from 'prop-types';

export default class RestoreSnapshotModal extends React.Component {

    constructor(props,context) {
        super(props, context);

        this.state = {...RestoreSnapshotModal.initialState, open: false}
    }

    static initialState = {
        loading: false,
        errors: {},
        isFromTenantlessEnv : false,
        shouldForceRestore: false,
        ignorePluginFailure: false
    };

    static propTypes = {
        snapshot: PropTypes.object.isRequired,
        toolbox: PropTypes.object.isRequired,
    };

    static defaultProps = {
        onHide: _.noop
    };

    onApprove () {
        this._submitRestore();
        return false;
    }

    onCancel () {
        this.props.onHide();
        return true;
    }


    componentWillUpdate(prevProps, prevState) {
        if (!prevState.open && this.state.open) {
            this.setState(RestoreSnapshotModal.initialState);
        }
    }

    _submitRestore() {
        let errors = {};

        if (!_.isEmpty(errors)) {
            this.setState({errors});
            return false;
        }

        // Disable the form
        this.setState({loading: true});

        var actions = new Actions(this.props.toolbox);
        actions.doRestore(this.props.snapshot, this.state.shouldForceRestore, this.state.ignorePluginFailure).then(()=>{
            this.setState({errors: {}, loading: false});
            this.props.toolbox.refresh();
            this.props.toolbox.getEventBus().trigger('snapshots:refresh');
            this.props.toolbox.getEventBus().trigger('menu.tenants:refresh');
            this.props.onHide();
        }).catch((err)=>{
            this.setState({errors: {error: err.message}, loading: false});
        });
    }

    _handleFieldChange(proxy, field) {
        this.setState(Stage.Basic.Form.fieldNameValue(field));
    }

    render() {
        var {Modal, ApproveButton, CancelButton, Icon, Form, Message} = Stage.Basic;

        return (
            <Modal open={this.props.open} onClose={()=>this.props.onHide()}>
                <Modal.Header>
                    <Icon name="undo"/> Restore snapshot
                </Modal.Header>

                <Modal.Content>
                    <Form loading={this.state.loading} errors={this.state.errors}
                          onErrorsDismiss={() => this.setState({errors: {}})}>

                        <Form.Field>
                            <Form.Checkbox toggle
                                           label="Snapshot from a tenant-less environment"
                                           name='isFromTenantlessEnv'
                                           checked={this.state.isFromTenantlessEnv}
                                           onChange={this._handleFieldChange.bind(this)}/>
                        </Form.Field>

                        {
                            this.state.isFromTenantlessEnv &&
                            <Message>
                                When restoring from a tenant-less environment, make sure you uploaded the snapshot to
                                a "clean" tenant that does not contain any other resources.
                            </Message>

                        }
                        <Form.Field>
                            <Form.Checkbox toggle
                                           label="Force restore even if manager is non-empty (it will delete all data)"
                                           name='shouldForceRestore'
                                           checked={this.state.shouldForceRestore}
                                           onChange={this._handleFieldChange.bind(this)}/>
                        </Form.Field>
                        <Form.Field help='Ignore plugin installation failures and deployment environment creation failures due to missing plugins'>
                            <Form.Checkbox toggle
                                           label='Ignore plugin failures'
                                           name='ignorePluginFailure'
                                           checked={this.state.ignorePluginFailure}
                                           onChange={this._handleFieldChange.bind(this)}/>
                        </Form.Field>

                    </Form>
                </Modal.Content>

                <Modal.Actions>
                    <CancelButton onClick={this.onCancel.bind(this)} disabled={this.state.loading} />
                    <ApproveButton onClick={this.onApprove.bind(this)} disabled={this.state.loading} content="Restore" icon="undo" color="green"/>
                </Modal.Actions>
            </Modal>
        );
    }
};
