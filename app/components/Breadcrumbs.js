/**
 * Created by kinneretzin on 18/09/2016.
 */

import React, { Component,PropTypes } from 'react';
import InlineEdit from 'react-edit-inline';

export default class Breadcrumbs extends Component {
    static propTypes = {
        pagesList: PropTypes.array.isRequired,
        onPageNameChange: PropTypes.func.isRequired,
        onPageSelected: PropTypes.func.isRequired
    };

    render() {
        var elements = [];
        _.each(_(this.props.pagesList).reverse().value(),(p,index)=>{
            if (index !== this.props.pagesList.length-1) {
                elements.push(<div key={p.id} className='section' onClick={()=>{this.props.onPageSelected(p);} }>{p.name}</div>);
                elements.push(<span key={'d_'+p.id} className="divider">/</span>);
            } else {
                if (this.props.isEditMode) {
                    elements.push(
                        <span key={p.id} className='section active'>
                            <InlineEdit
                                text={p.name}
                                change={data=>this.props.onPageNameChange(p.id,data.name)}
                                paramName="name"
                                />
                        </span>
                        );
                }
                else
                {
                    elements.push(
                        <span key={p.id} className='section active'>
                            <label> {p.name} </label>
                        </span>
                        );
                }
                //elements.push(<span key={p.id} className='section active'>{p.name}</span>);
            }

        });
        return (
            <div className='ui breadcrumb'>
                {elements}
            </div>
        );
    }
}