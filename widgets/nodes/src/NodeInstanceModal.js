/**
 * Created by jakubniezgoda on 10/01/2017.
 */


export default class extends React.Component {

    constructor(props,context) {
        super(props,context);

        this.state = {
        }
    }

    render() {
        const NO_DATA_MESSAGE_RELATIONSHIPS = 'There are no Relationships defined for that Node Instance.';
        const NO_DATA_MESSAGE_RUNTIME_PROPERTIES = 'There are no Runtime Properties defined for that Node Instance.';
        let {CancelButton, CopyToClipboardButton, DataTable, HighlightText, Modal} = Stage.Basic;
        let {JsonUtils} = Stage.Common;

        let instance = this.props.instance;

        // Setting totalSize on DataTable components to:
        // 1. Show no-data message when there's no elements
        // 2. Don't show pagination
        const runtimePropertiesTotalSize = _.size(instance.runtime_properties) > 0 ? undefined : 0;
        const relationshipsTotalSize = _.size(instance.relationships) > 0 ? undefined : 0;

        return (
            <div>
                <Modal open={this.props.open} onClose={()=>this.props.onClose()} className='nodeInstanceModal'>
                    <Modal.Header>
                        Node instance {instance.id}
                    </Modal.Header>

                    <Modal.Content>
                        <div>
                            <h3>
                                Relationships&nbsp;&nbsp;
                                <CopyToClipboardButton content='Copy'
                                                       text={JsonUtils.stringify(instance.relationships, true)} />
                            </h3>
                            <DataTable className="nodeInstanceRelationshipsTable"
                                       totalSize={relationshipsTotalSize}
                                       noDataMessage={NO_DATA_MESSAGE_RELATIONSHIPS}>

                                <DataTable.Column label="Target node" name="target" width="30%"/>
                                <DataTable.Column label="Relationship type" name="relationship" width="40%"/>
                                <DataTable.Column label="Source node" name="source" width="30%"/>

                                {
                                    instance.relationships.map((r) => {
                                        return (
                                            <DataTable.Row key={r.target_name + r.type + instance.node_id}>
                                                <DataTable.Data>{r.target_name}</DataTable.Data>
                                                <DataTable.Data>{r.type}</DataTable.Data>
                                                <DataTable.Data>{instance.node_id}</DataTable.Data>
                                            </DataTable.Row>
                                        );
                                    })
                                }
                            </DataTable>


                            <h3>
                                Runtime properties&nbsp;&nbsp;
                                <CopyToClipboardButton content='Copy'
                                                       text={JsonUtils.stringify(instance.runtime_properties, true)} />
                            </h3>
                            <DataTable className="nodeInstanceRuntimePropertiesTable"
                                       totalSize={runtimePropertiesTotalSize}
                                       noDataMessage={NO_DATA_MESSAGE_RUNTIME_PROPERTIES}>

                                <DataTable.Column label="Key" name="key" />
                                <DataTable.Column label="Value" name="value" />

                                {
                                    Object.keys(instance.runtime_properties).map(function (key) {
                                        let value = instance.runtime_properties[key];
                                        return (
                                            <DataTable.Row key={key}>
                                                <DataTable.Data>{key}</DataTable.Data>
                                                <DataTable.Data>
                                                    {
                                                        _.isObject(value)
                                                        ?
                                                            <HighlightText className='json'>
                                                                {JsonUtils.stringify(value, true)}
                                                            </HighlightText>
                                                        :
                                                            value
                                                    }
                                                </DataTable.Data>
                                            </DataTable.Row>
                                        );
                                    })
                                }

                            </DataTable>

                        </div>
                    </Modal.Content>

                    <Modal.Actions>
                        <CancelButton onClick={this.props.onClose} content="Close" />
                    </Modal.Actions>
                </Modal>
            </div>

        );
    }
};
