export default class extends React.Component {

    constructor(props, context) {
        super(props, context);
        this.state = {
            error: null
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return !_.isEqual(this.props.widget, nextProps.widget)
            || !_.isEqual(this.state, nextState)
            || !_.isEqual(this.props.data, nextProps.data);
    }

    _refreshData() {
        this.props.toolbox.refresh();
    }

    componentDidMount() {
        this.props.toolbox.getEventBus().on('outputs:refresh',this._refreshData,this);
    }

    componentWillUnmount() {
        this.props.toolbox.getEventBus().off('outputs:refresh',this._refreshData);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.data.deploymentId !== prevProps.data.deploymentId ||
            this.props.data.blueprintId !== prevProps.data.blueprintId) {
            this._refreshData();
        }
    }

    render() {
        const NO_DATA_MESSAGE = 'There are no Outputs available. Probably there\'s no deployment created, yet.';
        let {CopyToClipboardButton, DataTable, ErrorMessage, Header, HighlightText, Popup} = Stage.Basic;
        let {JsonUtils} = Stage.Common;
        let outputs = this.props.data.items;
        let compareNames = (a,b) => (a.name > b.name) ? 1 : ((b.name > a.name) ? -1 : 0);

        return (
            <div>
                <ErrorMessage error={this.state.error} onDismiss={() => this.setState({error: null})} autoHide={true}/>

                <DataTable className="outputsTable" noDataAvailable={_.isEmpty(outputs)} noDataMessage={NO_DATA_MESSAGE}>

                    <DataTable.Column label="Name" width="35%"/>
                    <DataTable.Column label="Value" width="65%"/>
                    {
                        outputs.sort(compareNames).map((output) =>
                            <DataTable.Row key={output.name}>
                                <DataTable.Data>
                                    <Header size="tiny">
                                        {output.name}
                                        <Header.Subheader>
                                            {output.description}
                                        </Header.Subheader>
                                    </Header>
                                </DataTable.Data>
                                <DataTable.Data>
                                    {!_.isNil(output.value) &&
                                        <Popup position='top left' wide>
                                            <Popup.Trigger>
                                                <div>
                                                    {JsonUtils.getStringValue(output.value)}
                                                    <CopyToClipboardButton text={JsonUtils.getStringValue(output.value)}
                                                                           className='rightFloated' />
                                                </div>
                                            </Popup.Trigger>
                                            <Popup.Content>
                                                <HighlightText className='json'>
                                                    {JsonUtils.stringify(output.value, true)}
                                                </HighlightText>
                                            </Popup.Content>
                                        </Popup>
                                    }
                                </DataTable.Data>
                            </DataTable.Row>
                        )
                    }
                </DataTable>
            </div>
        );
    }
};
