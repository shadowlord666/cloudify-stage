/**
 * Created by aleksander.laktionow on 09/11/17.
 */

import TestDataTable from './TestDataTable';
import CreateControls from './CreateControls';

export default class DatabaseServiceDemo extends React.Component {

    constructor(props,context) {
        super(props,context);

        this.state = {
            widgetBackend: props.widgetBackend,
            data: '',
            error: '',
            loading: false
        };

        this._loadData();
    };

    _loadData(){
        this.state.widgetBackend.doGet('dbGetAll')
            .then((data) => this.setState({data}));
    }

    _dbCreate(key, value) {
        this.state.widgetBackend
            .doPost('dbCreate', {key, value})
            .then(this._loadData())
            .catch((error) => {
                this.setState({error: 'Create failed: '+error.message});
            });
    };

    _dbDelete(id) {
        this.state.widgetBackend
            .doDelete('dbDelete', {id})
            .then(this._loadData())
            .catch((error) => {
                this.setState({error: 'Delete failed: '+error.message});
            });
    };

    render() {
        let {Message, ErrorMessage} = Stage.Basic;

        return (
            <div>
                <CreateControls onCreate={this._dbCreate.bind(this)}/>
                {
                    _.isEmpty(this.state.error) ? <div /> : <ErrorMessage error={this.state.error} onDismiss={() => this.setState({error: ''})} />
                }
                {
                    _.isEmpty(this.state.data.items)
                        ?
                        <Message>No data available</Message>
                        :
                        <TestDataTable data={this.state.data} onDelete={this._dbDelete.bind(this)}/>
                }
            </div>
        );
    }
}
