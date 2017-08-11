
/**
 * Created by kinneretzin on 05/10/2016.
 */

import Actions from './actions';

let PropTypes = React.PropTypes;

const EMPTY_BLUEPRINT = {id: '', plan: {inputs: {}}};
const DEPLOYMENT_INPUT_CLASSNAME = 'deploymentInput';

export default class DeployModal extends React.Component {

    constructor(props,context) {
        super(props,context);

        this.state = DeployModal.initialState;
    }

    static initialState = {
        errors: {},
        loading: false,
        blueprint: EMPTY_BLUEPRINT,
        deploymentName: '',
        deploymentInputs: [],
        privateResource: false,
        skipPluginsValidation: false
    }

    static propTypes = {
        toolbox: PropTypes.object.isRequired,
        open: PropTypes.bool.isRequired,
        blueprints: PropTypes.object.isRequired,
        onHide: PropTypes.func
    };

    static defaultProps = {
        onHide: ()=>{}
    };

    componentWillReceiveProps(nextProps) {
        if (!this.props.open && nextProps.open) {
            this.setState(DeployModal.initialState);
        }
    }

    onApprove () {
        this._submitDeploy();
        return false;
    }

    onCancel () {
        this.props.onHide();
        return true;
    }

    _selectBlueprint(proxy, data){
        if (!_.isEmpty(data.value)) {
            this.setState({loading: true});

            var actions = new Actions(this.props.toolbox);
            actions.doGetFullBlueprintData(data.value).then((blueprint)=>{
                let deploymentInputs = {};
                _.forEach(blueprint.plan.inputs, (inputObj, inputName) => deploymentInputs[inputName] = '');
                this.setState({deploymentInputs, blueprint, errors: {}, loading: false});
            }).catch((err)=> {
                this.setState({blueprint: EMPTY_BLUEPRINT, loading: false, errors: {error: err.message}});
            });
        } else {
            this.setState({blueprint: EMPTY_BLUEPRINT, errors: {}});
        }
    }

    _handleInputChange(proxy, field) {
        let fieldNameValue = Stage.Basic.Form.fieldNameValue(field);
        if (field.className === DEPLOYMENT_INPUT_CLASSNAME) {
            this.setState({deploymentInputs: {...this.state.deploymentInputs, ...fieldNameValue}});
        } else {
            this.setState(fieldNameValue);
        }
    }

    _stringify(object) {
        if (_.isObject(object) || _.isArray(object) || _.isBoolean(object)) {
            return JSON.stringify(object);
        } else {
            return String(object || '');
        }
    }

    _submitDeploy () {
        let errors = {};
        const EMPTY_STRING = '""';

        if (_.isEmpty(this.state.deploymentName)) {
            errors['deploymentName']=Stage.Lang.WARN_NO_DEPLOYMENT_NAME;
        }

        if (_.isEmpty(this.state.blueprint.id)) {
            errors['blueprintName']=Stage.Lang.WARN_SELECT_BLUEPRINT_FROM_LIST;
        }

        let deploymentInputs = {};
        _.forEach(this.state.blueprint.plan.inputs, (inputObj, inputName) => {
            let inputValue = this.state.deploymentInputs[inputName];
            if (_.isEmpty(inputValue)) {
                if (_.isNil(inputObj.default)) {
                    errors[inputName] = `Please provide ${inputName}`;
                }
            } else if (inputValue === EMPTY_STRING) {
                deploymentInputs[inputName] = '';
            } else {
                deploymentInputs[inputName] = inputValue;
            }
        });

        if (!_.isEmpty(errors)) {
            this.setState({errors});
            return false;
        }

        // Disable the form
        this.setState({loading: true});

        var actions = new Actions(this.props.toolbox);
        actions.doDeploy(this.state.blueprint.id, this.state.deploymentName, deploymentInputs, this.state.privateResource, this.state.skipPluginsValidation)
            .then((/*deployment*/)=> {
                this.setState({loading: false, errors: {}});
                this.props.toolbox.getEventBus().trigger('deployments:refresh');
                this.props.onHide();
            })
            .catch((err)=>{
                this.setState({loading: false, errors: {error: err.message}});
            });
    }

    render() {
        var {Modal, Icon, Form, Message, Popup, ApproveButton, CancelButton, PrivateField, Header} = Stage.Basic;

        let blueprints = Object.assign({},{items:[]}, this.props.blueprints);
        let options = _.map(blueprints.items, blueprint => { return { text: blueprint.id, value: blueprint.id } });

        let deploymentInputs = _.sortBy(_.map(this.state.blueprint.plan.inputs, (input, name) => ({'name': name, ...input})),
                                        [(input => !_.isNil(input.default)), 'name']);

        return (
            <Modal open={this.props.open}>
                <Modal.Header>
                    <Icon name="rocket"/> {Stage.Lang.CREATE_DEPLOYMENT}
                    <PrivateField lock={this.state.privateResource} title={Stage.Lang.PRIVATE_RESOURCE} className="rightFloated"
                             onClick={()=>this.setState({privateResource:!this.state.privateResource})}/>
                </Modal.Header>

                <Modal.Content>
                    <Form loading={this.state.loading} errors={this.state.errors}
                          onErrorsDismiss={() => this.setState({errors: {}})}>

                        <Form.Field error={this.state.errors.deploymentName}>
                            <Form.Input name='deploymentName' placeholder={Stage.Lang.DEPLOYMENT_ID_NAME}
                                        value={this.state.deploymentName} onChange={this._handleInputChange.bind(this)}/>
                        </Form.Field>

                        <Form.Field error={this.state.errors.blueprintName}>
                            <Form.Dropdown search selection value={this.state.blueprint.id} placeholder={Stage.Lang.BLUEPRINT_NAME}
                                           name="blueprintName" options={options} onChange={this._selectBlueprint.bind(this)}/>
                        </Form.Field>

                        {
                            this.state.blueprint.id
                            &&
                            <Form.Divider>
                                <Header size="tiny">
                                    Deployment inputs
                                    <Header.Subheader>
                                        {Stage.Lang.USE_PAR_FOR_EMPTY_STRING}
                                    </Header.Subheader>
                                </Header>
                            </Form.Divider>
                        }

                        {
                            this.state.blueprint.id && _.isEmpty(this.state.blueprint.plan.inputs)
                            &&
                            <Message content={Stage.Lang.WARN_NO_INPUTS_AVAILABLE}/>
                        }

                        {
                            _.map(deploymentInputs, (input) => {
                                let formInput = () =>
                                    <Form.Input name={input.name} placeholder={input.description}
                                                value={this.state.deploymentInputs[input.name]}
                                                onChange={this._handleInputChange.bind(this)}
                                                className={DEPLOYMENT_INPUT_CLASSNAME} />
                                return (
                                    <Form.Field key={input.name} error={this.state.errors[input.name]}>
                                        <label>
                                            {input.name}&nbsp;
                                            {
                                                _.isNil(input.default)
                                                    ? <Icon name='asterisk' color='red' size='tiny' className='superscripted' />
                                                    : null
                                            }
                                        </label>
                                        {
                                            !_.isNil(input.default)
                                                ? <Popup trigger={formInput()} header={Stage.Lang.DEFAULT_VALUE}
                                                         content={this._stringify(input.default)}
                                                         position='top right' wide />
                                                : formInput()
                                        }
                                    </Form.Field>
                                );
                            })
                        }
                        <Form.Field>
                            <Form.Checkbox toggle
                                           label={Stage.Lang.SKIP_PLUGIN_VALIDATION}
                                           name='skipPluginsValidation'
                                           checked={this.state.skipPluginsValidation}
                                           onChange={this._handleInputChange.bind(this)}/>
                        </Form.Field>
                        {
                            this.state.skipPluginsValidation && <Message>{Stage.Lang.WARN_PLUGIN_ADVANCED_USERS}</Message>
                        }
                    </Form>
                </Modal.Content>

                <Modal.Actions>
                    <CancelButton onClick={this.onCancel.bind(this)} disabled={this.state.loading} />
                    <ApproveButton onClick={this.onApprove.bind(this)} disabled={this.state.loading} content={Stage.Lang.DEPLOY} icon="rocket" className="green"/>
                </Modal.Actions>
            </Modal>
        );
    }
};
