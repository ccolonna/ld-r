import React from 'react';
import PartWholeView from './viewer/PartWholeView';
import TimeIndexedTypedLocationView from './viewer/TimeIndexedTypedLocationView';
import CollectionView from './viewer/CollectionView';

import PatternService from '../../services/clientside-services/PatternService';
import DbContext from '../../services/base/DbContext';
import { clone, chunk } from 'lodash';
import { Grid, Segment } from 'semantic-ui-react';

export default class PatternViewsMosaic extends React.Component {
    constructor(props) {
        super(props);
        const sparqlEndpoint = 'https://arco.istc.cnr.it/visualPatterns/sparql';
        this.patternService = new PatternService(new DbContext(sparqlEndpoint));
        //
        this.state = {
            patternInstances: []
        };
    }
    componentDidMount() {
        console.log('Mount start querying');

        if (this.props.patternInstancesUris) {
            console.log('Mount start querying');
            this.props.patternInstancesUris.forEach(patternInstanceUri => {
                this.patternService
                    .findPattern(patternInstanceUri)
                    .then(pattern => {
                        console.log('Pattern result from query:', pattern);
                        let newPatternInstances = clone(
                            this.state.patternInstances
                        );
                        newPatternInstances.push({
                            uri: patternInstanceUri,
                            type: pattern.type,
                            typeLabel: pattern.typeLabel
                        });
                        this.setState({
                            patternInstances: newPatternInstances
                        });
                    });
            });
        }
    }
    render() {
        console.log('MOSAIC RENDERED');
        console.log(this.props);
        console.log(this.state);
        if (this.props.patternInstancesUris.length === 0) {
            return null;
        }
        if (this.state.patternInstances.length === 0) {
            return null;
        }
        let titlCount = 0;
        let rowCount = 0;

        const viewTitleStyle = {
            fontSize: 20,
            color: 'rgb(98, 91, 95)',
            marginBottom: 40
        };

        const cellStyle = {
            borderBottom: '1px solid rgba(34,36,38,.15)',
            marginBottom: 50
        };

        const viewsContent = this.state.patternInstances.map(
            (patternInstance, index) => {
                if (
                    patternInstance.type ===
                    'https://w3id.org/arco/ontology/location/cultural-property-component-of'
                ) {
                    return (
                        <div
                            key={index}
                            style={index % 2 === 0 ? cellStyle : {}}
                        >
                            <div
                                class="mosaic-view-title"
                                style={viewTitleStyle}
                            >
                                {patternInstance.typeLabel}
                            </div>
                            <PartWholeView
                                pattern={patternInstance.type}
                                dataset={this.props.datasetURI}
                                patternInstanceUri={patternInstance.uri}
                                showPropertyValueList={true}
                                styles={{
                                    partWhole: {
                                        containerStyle: {
                                            width: 450
                                        },
                                        littleItemStyle: {
                                            width: 100
                                        },
                                        centerItemStyle: {
                                            width: 300
                                        }
                                    }
                                }}
                            />
                        </div>
                    );
                }
                if (
                    patternInstance.type ===
                    'https://w3id.org/arco/ontology/denotative-description/measurement-collection'
                ) {
                    return (
                        <div
                            key={index}
                            style={index % 2 === 0 ? cellStyle : {}}
                        >
                            <div
                                class="mosaic-view-title"
                                style={viewTitleStyle}
                            >
                                {patternInstance.typeLabel}
                            </div>
                            <CollectionView
                                pattern={patternInstance.type}
                                dataset={this.props.datasetURI}
                                patternInstanceUri={patternInstance.uri}
                                showPropertyValueList={true}
                                hideCulturalProperty={true}
                                styles={{
                                    depiction: {
                                        width: '100%',
                                        margin: 'auto'
                                    },
                                    collection: {
                                        collectionContainerWidth: {
                                            width: '120%' // set this width to 120, 130, 140% to increase padding between items
                                        }
                                    }
                                }}
                            />
                        </div>
                    );
                }
                if (
                    patternInstance.type ===
                        'https://w3id.org/arco/ontology/location/time-indexed-typed-location' &&
                    titlCount === 0
                ) {
                    titlCount++;
                    return (
                        <div
                            key={index}
                            style={index % 2 === 0 ? cellStyle : {}}
                        >
                            <div
                                class="mosaic-view-title"
                                style={viewTitleStyle}
                            >
                                {patternInstance.typeLabel}
                            </div>
                            <TimeIndexedTypedLocationView
                                pattern={patternInstance.type}
                                dataset={this.props.datasetURI}
                                patternInstanceUri={patternInstance.uri}
                                showPropertyValueList={true}
                                hideCulturalProperty={true}
                            />
                        </div>
                    );
                }
            }
        );
        const viewsRowsAndColumns = chunk(viewsContent, 2).map(function(group) {
            return <Grid.Column>{group}</Grid.Column>;
        });

        return (
            // <div
            //     style={{
            //         /* display: flex; */
            //         display: "grid",
            //         /* grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); */
            //         gridAutoFlow: "column",
            //         gridGap: 20,
            //         gridTemplateRows: "50% 50%",
            //         gridTemplateColumns: "50% 50%",
            //         padding: 10,
            //         rowGap: 80
            //     }}
            // >
            <Grid
                container
                stackable
                columns={2}
                celled
                divided="vertically"
                // verticalAlign="middle"
            >
                <Grid.Row>{viewsRowsAndColumns}</Grid.Row>
            </Grid>
        );
        // return this.props.patternViews.map(viewKey => {
        //     if (viewKey === "partWhole") return <PartWholeView />;
        //     if (viewKey === "collection") return <CollectionView />;
        //     if (viewKey === "timeIndexedTypedLocation")
        //         return <TimeIndexedTypedLocationView />;
        // });
    }
}