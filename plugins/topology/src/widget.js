/**
 * Created by kinneretzin on 07/09/2016.
 */

import Topology from './Topology';
import DataFetcher from './DataFetcher';

let getConfig = (widgetConfig,id) =>{
    var conf = widgetConfig ? _.find(widgetConfig,{id:id}) : {};
    return (conf && conf.value === 'true');
};

Stage.addPlugin({
    id: 'topology',
    name: "Topology",
    description: 'Shows topology (blueprint or deployment)',
    initialWidth: 8,
    initialHeight: 4,
    color: "yellow",
    isReact: true,
    hasTemplate: true,
    initialConfiguration: [
        {id: 'enableNodeClick', name: 'Enable node click' ,placeHolder:"true of false", default:"true"},
        {id: 'enableGroupClick', name: 'Enable group click' ,placeHolder:"true of false", default:"true"},
        {id: 'enableZoom', name: 'Enable zoom' ,placeHolder:"true of false", default:"true"},
        {id: 'enableDrag', name: 'Enable drag' ,placeHolder:"true of false", default:"true"},
        {id: 'showToolbar', name: 'Show toolbar' ,placeHolder:"true of false", default:"true"}
    ],

    fetchData: function(plugin,context,pluginUtils) {
        var deploymentId = context.getValue('deploymentId');
        var blueprintId = context.getValue('blueprintId');

        return DataFetcher.fetch(context,blueprintId,deploymentId);
    },

    render: function(widget,data,error,context,pluginUtils) {
        if (!widget.plugin.template) {
            return 'Topology: missing template';
        }

        var topologyConfig = {
            enableNodeClick: getConfig(widget.configuration,'enableNodeClick'),
            enableGroupClick: getConfig(widget.configuration,'enableGroupClick'),
            enableZoom: getConfig(widget.configuration,'enableZoom'),
            enableDrag: getConfig(widget.configuration,'enableDrag'),
            showToolbar: getConfig(widget.configuration,'showToolbar')
        };

        var topologyTemplate = _.template(widget.plugin.template)(topologyConfig);
        var deploymentId = context.getValue('deploymentId');
        var blueprintId = context.getValue('blueprintId');

        var formattedData = Object.assign({},data,{
            deploymentId,
            blueprintId,
            topologyConfig
        });
        return <Topology template={topologyTemplate}
                         widget={widget} data={formattedData} context={context} utils={pluginUtils}/>;

    }

});