import React from 'react';
import PropTypes from 'prop-types';
import PropertyReactor from '../reactors/PropertyReactor';
import { NavLink } from 'fluxible-router';
import URIUtil from '../utils/URIUtil';
import { connectToStores } from 'fluxible-addons-react';
import cloneResource from '../../actions/cloneResource';
import createJSONLD from '../../actions/createJSONLD';
import importCSV from '../../actions/importCSV';
import ImportStore from '../../stores/ImportStore';
import WaitAMoment from '../WaitAMoment';
import { scrollToTop } from '../utils/scrollToTop';

const PUBLIC_URL = process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '';

class CSVMappingResource extends React.Component {
    constructor(props) {
        super(props);
        this.state = { status: 0 };
    }
    componentDidMount() {
        console.log('CSV MAPPING RESORU');
        //scroll to top of the page
        if (this.props.config && this.props.config.readOnly) {
            scrollToTop();
        }
    }
    handleCloneResource(datasetURI, resourceURI, e) {
        this.context.executeAction(cloneResource, {
            dataset: datasetURI,
            resourceURI: resourceURI
        });
        e.stopPropagation();
    }
    handleCreateJSONLD(resourceURI, e) {
        this.setState({ status: 1 });
        this.context.executeAction(createJSONLD, {
            resourceURI: resourceURI
        });
        e.stopPropagation();
    }
    handleImportCSV(resourceURI, e) {
        this.setState({ status: 2 });
        this.context.executeAction(importCSV, {
            resourceURI: resourceURI,
            importMethod: 'batchInsert'
        });
        e.stopPropagation();
    }
    render() {
        //check erros first
        if (this.props.error) {
            return (
                <div
                    className="ui fluid container ldr-padding-more"
                    ref="resource"
                >
                    <div className="ui grid">
                        <div className="ui column">
                            <div className="ui warning message">
                                <h2>{this.props.error}</h2>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }
        let fileURL = '',
            allowJSONLD = 0;
        //continue
        let readOnly = 1;
        let createdByDIV,
            createdOnDIV,
            csvFileDIV,
            delimiterDIV,
            labelDIV,
            rpDIV,
            vpDIV,
            cmDIV;
        let isUserTheCreator = 0;
        let user = this.context.getUser();
        let self = this;
        let accessLevel,
            isWriteable,
            configReadOnly,
            creatorDIV,
            dateDIV,
            annotationMetaDIV,
            annotationDIV;
        if (typeof self.props.readOnly !== 'undefined') {
            readOnly = self.props.readOnly;
        } else {
            //check the config for resource
            if (
                self.props.config &&
                typeof self.props.config.readOnly !== 'undefined'
            ) {
                readOnly = self.props.config.readOnly;
            }
        }
        //create a list of properties
        let list = this.props.properties.map(function(node, index) {
            //if there was no config at all or it is hidden, do not render the property
            if (!node.config || !node.config.isHidden) {
                //for readOnly, we first check the defautl value then we check readOnly value of each property if exists
                //this is what comes from the config
                if (readOnly) {
                    configReadOnly = true;
                } else {
                    if (node.config) {
                        if (node.config.readOnly) {
                            configReadOnly = true;
                        } else {
                            configReadOnly = false;
                        }
                    }
                }

                if (
                    node.propertyURI ===
                    'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#createdOn'
                ) {
                    dateDIV = (
                        <PropertyReactor
                            key={index}
                            enableAuthentication={
                                self.props.enableAuthentication
                            }
                            spec={node}
                            readOnly={configReadOnly}
                            config={node.config}
                            datasetURI={self.props.datasetURI}
                            resource={self.props.resource}
                            property={node.propertyURI}
                            propertyPath={self.props.propertyPath}
                        />
                    );
                } else if (
                    node.propertyURI ===
                    'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#createdBy'
                ) {
                    creatorDIV = (
                        <PropertyReactor
                            key={index}
                            enableAuthentication={
                                self.props.enableAuthentication
                            }
                            spec={node}
                            readOnly={configReadOnly}
                            config={node.config}
                            datasetURI={self.props.datasetURI}
                            resource={self.props.resource}
                            property={node.propertyURI}
                            propertyPath={self.props.propertyPath}
                        />
                    );
                } else if (
                    node.propertyURI ===
                    'http://www.w3.org/2000/01/rdf-schema#label'
                ) {
                    labelDIV = (
                        <PropertyReactor
                            key={index}
                            enableAuthentication={
                                self.props.enableAuthentication
                            }
                            spec={node}
                            readOnly={configReadOnly}
                            config={node.config}
                            datasetURI={self.props.datasetURI}
                            resource={self.props.resource}
                            property={node.propertyURI}
                            propertyPath={self.props.propertyPath}
                        />
                    );
                } else if (
                    node.propertyURI ===
                    'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#resourcePrefix'
                ) {
                    rpDIV = (
                        <PropertyReactor
                            key={index}
                            enableAuthentication={
                                self.props.enableAuthentication
                            }
                            spec={node}
                            readOnly={configReadOnly}
                            config={node.config}
                            datasetURI={self.props.datasetURI}
                            resource={self.props.resource}
                            property={node.propertyURI}
                            propertyPath={self.props.propertyPath}
                        />
                    );
                } else if (
                    node.propertyURI ===
                    'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#customMappings'
                ) {
                    cmDIV = (
                        <PropertyReactor
                            key={index}
                            enableAuthentication={
                                self.props.enableAuthentication
                            }
                            spec={node}
                            readOnly={configReadOnly}
                            config={node.config}
                            datasetURI={self.props.datasetURI}
                            resource={self.props.resource}
                            property={node.propertyURI}
                            propertyPath={self.props.propertyPath}
                        />
                    );
                } else if (
                    node.propertyURI ===
                    'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#vocabPrefix'
                ) {
                    vpDIV = (
                        <PropertyReactor
                            key={index}
                            enableAuthentication={
                                self.props.enableAuthentication
                            }
                            spec={node}
                            readOnly={configReadOnly}
                            config={node.config}
                            datasetURI={self.props.datasetURI}
                            resource={self.props.resource}
                            property={node.propertyURI}
                            propertyPath={self.props.propertyPath}
                        />
                    );
                } else if (
                    node.propertyURI ===
                    'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#delimiter'
                ) {
                    allowJSONLD = !configReadOnly;
                    delimiterDIV = (
                        <PropertyReactor
                            key={index}
                            enableAuthentication={
                                self.props.enableAuthentication
                            }
                            spec={node}
                            readOnly={configReadOnly}
                            config={node.config}
                            datasetURI={self.props.datasetURI}
                            resource={self.props.resource}
                            property={node.propertyURI}
                            propertyPath={self.props.propertyPath}
                        />
                    );
                } else if (
                    node.propertyURI ===
                    'https://github.com/ali1k/ld-reactor/blob/master/vocabulary/index.ttl#csvFile'
                ) {
                    fileURL = node.instances[0].value;
                    csvFileDIV = (
                        <PropertyReactor
                            key={index}
                            enableAuthentication={
                                self.props.enableAuthentication
                            }
                            spec={node}
                            readOnly={configReadOnly}
                            config={node.config}
                            datasetURI={self.props.datasetURI}
                            resource={self.props.resource}
                            property={node.propertyURI}
                            propertyPath={self.props.propertyPath}
                        />
                    );
                } else {
                    return (
                        <PropertyReactor
                            key={index}
                            enableAuthentication={
                                self.props.enableAuthentication
                            }
                            spec={node}
                            readOnly={configReadOnly}
                            config={node.config}
                            datasetURI={self.props.datasetURI}
                            resource={self.props.resource}
                            property={node.propertyURI}
                            propertyPath={self.props.propertyPath}
                        />
                    );
                }
            }
        });
        let currentCategory, mainDIV, tabsDIV, tabsContentDIV;
        //categorize properties in different tabs
        if (this.props.config.usePropertyCategories) {
            currentCategory = this.props.currentCategory;
            if (!currentCategory) {
                currentCategory = this.props.config.propertyCategories[0];
            }
            tabsDIV = this.props.config.propertyCategories.map(function(
                node,
                index
            ) {
                return (
                    <NavLink
                        className={
                            node === currentCategory
                                ? 'item link active'
                                : 'item link'
                        }
                        key={index}
                        routeName="resource"
                        href={
                            '/dataset/' +
                            encodeURIComponent(self.props.datasetURI) +
                            '/resource/' +
                            encodeURIComponent(self.props.resource) +
                            '/' +
                            node +
                            '/' +
                            encodeURIComponent(self.props.propertyPath)
                        }
                    >
                        {node}
                    </NavLink>
                );
            });
            tabsContentDIV = this.props.config.propertyCategories.map(function(
                node,
                index
            ) {
                return (
                    <div
                        key={index}
                        className={
                            node === currentCategory
                                ? 'ui bottom attached tab segment active'
                                : 'ui bottom attached tab segment'
                        }
                    >
                        <div className="ui grid">
                            <div className="column ui list">
                                {node === currentCategory ? list : ''}
                            </div>
                        </div>
                    </div>
                );
            });
            mainDIV = (
                <div>
                    <div className="ui top attached tabular menu">
                        {tabsDIV}
                    </div>
                    {tabsContentDIV}
                </div>
            );
        } else {
            mainDIV = (
                <div className="ui segment">
                    <div className="ui grid">
                        <div className="column ui list">
                            <h2 className="ui dividing header orange">
                                {' '}
                                File Info
                            </h2>
                            {csvFileDIV}
                            {delimiterDIV}
                            <h2 className="ui dividing header orange">
                                {' '}
                                Mapping Configurations
                            </h2>
                            {vpDIV}
                            {rpDIV}
                            {list}
                            {cmDIV}
                            <h2 className="ui dividing header orange">
                                {' '}
                                Metadata
                            </h2>
                            {labelDIV}
                            {annotationDIV}
                            {annotationMetaDIV}
                            {dateDIV}
                            {creatorDIV}
                        </div>
                    </div>
                </div>
            );
        }
        let datasetTitle = this.props.datasetURI;
        if (this.props.config && this.props.config.datasetLabel) {
            datasetTitle = this.props.config.datasetLabel;
        }
        let breadcrumb;
        if (self.props.propertyPath.length > 1) {
            breadcrumb = (
                <div className="ui large breadcrumb">
                    <a
                        className="section"
                        href={
                            '/dataset/1/' +
                            encodeURIComponent(self.props.datasetURI)
                        }
                    >
                        <i className="cubes icon"></i>
                        {datasetTitle}
                    </a>
                    <i className="big right chevron icon divider"></i>
                    <a
                        className="section"
                        href={
                            '/dataset/' +
                            encodeURIComponent(self.props.datasetURI) +
                            '/resource/' +
                            encodeURIComponent(self.props.propertyPath[0])
                        }
                    >
                        <i className="cube icon"></i>
                        {URIUtil.getURILabel(self.props.propertyPath[0])}
                    </a>
                    <i className="big right arrow icon divider"></i>
                    <div className="active section">
                        {URIUtil.getURILabel(self.props.propertyPath[1])}
                    </div>
                </div>
            );
        } else {
            breadcrumb = (
                <div className="ui large breadcrumb">
                    <a
                        className="section"
                        href={
                            '/dataset/1/' +
                            encodeURIComponent(self.props.datasetURI)
                        }
                    >
                        <i className="cubes icon"></i>
                        {datasetTitle}
                    </a>
                    <i className="big right chevron icon divider"></i>
                </div>
            );
        }
        let cloneable = 0;
        if (
            self.props.config &&
            !this.props.readOnly &&
            typeof self.props.config.allowResourceClone !== 'undefined' &&
            parseInt(self.props.config.allowResourceClone)
        ) {
            cloneable = 1;
        }
        return (
            <div className="ui fluid container ldr-padding-more" ref="resource">
                <div className="ui grid">
                    {!this.state.status ? (
                        <div className="ui column">
                            {breadcrumb}
                            <h2>
                                <a
                                    target="_blank"
                                    href={
                                        '/export/NTriples/' +
                                        encodeURIComponent(
                                            this.props.datasetURI
                                        ) +
                                        '/' +
                                        encodeURIComponent(this.props.resource)
                                    }
                                >
                                    <i className="blue icon cube"></i>
                                </a>{' '}
                                <a href={this.props.resource} target="_blank">
                                    {this.props.title}
                                </a>
                                &nbsp;&nbsp;
                                {cloneable ? (
                                    <a
                                        className="medium ui circular basic icon button"
                                        onClick={this.handleCloneResource.bind(
                                            this,
                                            this.props.datasetURI,
                                            decodeURIComponent(
                                                this.props.resource
                                            )
                                        )}
                                        title="clone this resource"
                                    >
                                        <i className="icon teal superscript"></i>
                                    </a>
                                ) : (
                                    ''
                                )}
                            </h2>
                            {mainDIV}
                            {allowJSONLD ? (
                                <div
                                    className="ui big primary button"
                                    onClick={this.handleImportCSV.bind(
                                        this,
                                        decodeURIComponent(this.props.resource)
                                    )}
                                >
                                    Import Data
                                </div>
                            ) : null}
                            {allowJSONLD ? (
                                <div
                                    className="ui big button"
                                    onClick={this.handleCreateJSONLD.bind(
                                        this,
                                        decodeURIComponent(this.props.resource)
                                    )}
                                >
                                    Export Data as JSON-LD
                                </div>
                            ) : null}
                        </div>
                    ) : null}
                    {this.state.status === 1 ? (
                        <div className="ui column">
                            {this.props.ImportStore.output ? (
                                <div>
                                    The JSON-LD file is ready. You can download
                                    it from{' '}
                                    <a href={this.props.ImportStore.output}>
                                        here
                                    </a>
                                    .
                                </div>
                            ) : (
                                <div>
                                    <WaitAMoment msg="Generating the JSON-LD output. This might take a few seconds. Please be patient..." />{' '}
                                    <center>
                                        Check{' '}
                                        <a
                                            href={fileURL.replace(
                                                '.csv',
                                                '.json'
                                            )}
                                            target="_blank"
                                        >
                                            here
                                        </a>{' '}
                                        to see the current status of the output.
                                    </center>
                                </div>
                            )}
                        </div>
                    ) : null}
                    {this.state.status === 2 ? (
                        <div className="ui column">
                            <WaitAMoment msg="Importing the Data. This might take a few seconds. Please be patient until you are redirected to the database page..." />
                        </div>
                    ) : null}
                </div>
            </div>
        );
    }
}
CSVMappingResource.contextTypes = {
    executeAction: PropTypes.func.isRequired,
    getUser: PropTypes.func
};
CSVMappingResource = connectToStores(
    CSVMappingResource,
    [ImportStore],
    function(context, props) {
        return { ImportStore: context.getStore(ImportStore).getState() };
    }
);
export default CSVMappingResource;
