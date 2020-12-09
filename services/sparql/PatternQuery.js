import SPARQLQuery from './SPARQLQuery';

import URIUtil from '../../components/utils/URIUtil';

export default class PatternQuery extends SPARQLQuery {
    constructor() {
        super();
        this.prefixes =
            this.prefixes +
            `
            PREFIX opla: <http://ontologydesignpatterns.org/opla/>
            `;
    }

    /**
     * Function creates query to retrieve all the pattern types in a knowledge base
     * and count every pattern instance
     */
    getPatternList(graphName) {
        let { gStart, gEnd } = this.prepareGraphName(graphName);
        this.query = `SELECT DISTINCT ?pattern (COUNT(DISTINCT ?instance) as ?occurences) WHERE {
            ${gStart}
               ?instance rdf:type ?pattern .
               ?pattern rdf:type opla:Pattern .
            ${gEnd}
        }`;
        return this.query; // TODO: ?pattern rdf:type opla:Pattern (if reasoning available)
    }

    /**
     * Function creates query to retireve tuples of pattern and subà-patterns
     * *******
     * @param {string} graphName name of the graph to query against
     */
    getSpecializationList(graphName) {
        let { gStart, gEnd } = this.prepareGraphName(graphName);
        this.query = `SELECT DISTINCT ?subPattern ?pattern WHERE {
            ${gStart}
                ?subPattern opla:specializationOfPattern ?pattern .
                ${gEnd}
            }
            `;
        return this.query;
    }
    // ?subPattern rdf:type opla:Pattern .
    // ?pattern rdf:type opla:Pattern .

    /**
     * Function creates query to retrieve tuples of pattern and composing patterns
     * ********
     * @param {string} graphName name of the graph to query against
     */
    getCompositionList(graphName) {
        let { gStart, gEnd } = this.prepareGraphName(graphName);
        this.query = `SELECT DISTINCT ?componentPattern ?pattern WHERE {
            ${gStart}
                ?componentPattern opla:componentOfPattern ?pattern .
                ${gEnd}
            }`;
        return this.query;
    }
    // ?componentPattern rdf:type opla:Pattern .
    // ?pattern rdf:type opla:Pattern .

    /**
     * @description returns all the patterns specialized and number of time they've been specialized
     * @author Christian Colonna
     * @date 06-11-2020
     * @param {string} graphName graph to quuery against
     * @returns {string} sparql query as string
     * @memberof PatternQuery
     */
    getSpecializationCountPerPattern(graphName) {
        let { gStart, gEnd } = this.prepareGraphName(graphName);
        this.query = `SELECT DISTINCT ?pattern (COUNT(?subPattern) AS ?count) WHERE {
            ${gStart}
                ?subPattern opla:specializationOfPattern ?pattern .
            ${gEnd}
        }`;
        return this.query;
    }

    /**
     * @description returns all the pattern used as components and the number of time they've been used
     * @author Christian Colonna
     * @date 06-11-2020
     * @param {*} graphName
     * @returns {*}
     * @memberof PatternQuery
     */
    getCompositionCountPerPattern(graphName) {
        let { gStart, gEnd } = this.prepareGraphName(graphName);
        this.query = `SELECT DISTINCT ?pattern (COUNT(?pattern) AS ?count) WHERE {
            ${gStart}
                ?pattern opla:componentOfPattern ?composedPattern .
            ${gEnd}
        }`;
        return this.query;
    }

    /**
     * @description Creates a query retrieving:
     *              - all the occurrences for a pattern
     *              - nodes of the pattern
     *              - type of every node
     *              - pattern the instance is of
     *              - OPTIONAL : if pattern hasComponent TimeInterval, startDate and endDate of the interval
     *
     * @author Christian Colonna
     * @date 09-11-2020
     * @param {string} graphName the graph to query against
     * @param {string} id the pattern IRI
     * @memberof PatternQuery
     */
    getInstancesByPattern(graphName, id) {
        let { gStart, gEnd } = this.prepareGraphName(graphName);
        this.query = `SELECT DISTINCT ?instance ?node ?type ?pattern ?locationType ?startTime ?endTime ?siteAddress ?lat ?long 
?value
        WHERE {
            ${gStart}
            ?instance rdf:type <${id}> .
            
            ?node opla:belongsToPatternInstance ?instance ;
                  rdf:type ?type .

            OPTIONAL {  ?node <https://w3id.org/arco/ontology/arco/startTime> ?startTime2B ;
                              <https://w3id.org/arco/ontology/arco/endTime> ?endTime2B .
                       }

            OPTIONAL {  ?node <https://w3id.org/arco/ontology/location/hasLocationType> ?locationType2B .
                      }
            OPTIONAL { ?node 
                        <https://w3id.org/arco/ontology/denotative-description/hasValue> ?val2B .
                        ?val2B <https://w3id.org/italia/onto/MU/value> ?value2B . }

            OPTIONAL { ?node <https://w3id.org/arco/ontology/location/atSite> ?site .
                        ?site <http://dati.beniculturali.it/cis/siteAddress> ?siteAddr .
                        ?siteAddr <http://www.w3.org/2000/01/rdf-schema#label> ?siteAddress2B . }
            
            OPTIONAL { ?node <https://w3id.org/arco/ontology/location/atSite> ?site .
                              ?site <https://w3id.org/italia/onto/CLV/hasGeometry> ?geometry .
                              ?geometry <https://w3id.org/italia/onto/CLV/lat>     ?lat2B .
                              ?geometry <https://w3id.org/italia/onto/CLV/long>    ?long2B .   }
                       
            OPTIONAL {?pattern2B a rdf:HackToAssignType . }
            BIND ( IF (BOUND  (?pattern2B), <${id}>, <${id}> ) as ?pattern) .

            BIND ( IF ( BOUND (?startTime2B), ?startTime2B, "" ) as ?startTime ) .
            BIND ( IF ( BOUND (?endTime2B), ?endTime2B, "" ) as ?endTime ) .
            BIND ( IF ( BOUND (?locationType2B), ?locationType2B, "" ) as ?locationType ) .
            BIND ( IF ( BOUND (?siteAddress2B), ?siteAddress2B, "" ) as ?siteAddress ) .
            BIND ( IF (BOUND (?lat2B),  ?lat2B,  '')  as ?lat) . 
            BIND ( IF (BOUND (?long2B), ?long2B, '')  as ?long) . 
            BIND ( IF (BOUND (?val2B),  ?val2B,  '')   as ?val) . 
            BIND ( IF (BOUND (?value2B), ?value2B, '')  as ?value) . 
            ${gEnd}
        }`;
        return this.query;
    }

    /**
     * @description Creates a query returning data of a pattern instance
     *              It needs one or more pattern instance nodes as entry resources.
     *              The SPARQL matching pattern are created around this entry resource.
     *              Example: pattern Collection the entry resource may be the node of type Collection
     *
     *              The query will have an uppercase special variable of type ?Collection which will
     *              be replaced by uri of the resource of type Collection
     *
     * @author Christian Colonna
     * @date 15-11-2020
     * @param {string} graphName graph to query against
     * @param {Object[]} instanceResources an array of instance nodes [{ uri: uri, type: type } ... ]
     * @param {string[]} args an array of the types the resource of this type will be bind to query
     * @param {string} selectStatement query select statement
     * @param {string} queryBody query body, it contains special uppercase variables that may be replaced by resources, ex. ?Collection
     * @param {string} [aggregatesBlock]
     * @returns {string} query
     * @memberof PatternQuery
     */
    getInstanceDataByInstanceResources(
        graphName,
        instanceResources,
        args,
        selectStatement,
        queryBody,
        aggregatesBlock
    ) {
        let { gStart, gEnd } = this.prepareGraphName(graphName);
        let resourcesToBind = [];
        args.forEach(resourceType => {
            let resourceToBind = this.getResourceByType(
                instanceResources,
                resourceType
            );
            if (resourceToBind) {
                resourcesToBind.push(resourceToBind);
            }
        });

        let cleanedQueryBody = queryBody;
        resourcesToBind.forEach(resource => {
            let placeholder = `\\?${URIUtil.getURILabel(resource.type)}`;
            cleanedQueryBody = this.prepareQueryBody(
                resource.node,
                placeholder,
                cleanedQueryBody
            );
        });
        this.query = `
            ${selectStatement} {
                ${gStart}
                    ${cleanedQueryBody}
                ${gEnd}
            } ${aggregatesBlock ? aggregatesBlock : ''}
            `;
        return this.query;
    }

    /**
     * @description Returns the URI and TYPE of a resource of type TYPE in a list of resources.
     *              A resource is an object { uri: <uri>, type: <type> }
     * @author Christian Colonna
     * @date 15-11-2020
     * @param {Object[]} resources
     * @param {string} resource.uri the uri of a resource
     * @param {string} resource.type the type of a resource
     * @param {string} type resource of this type will be returned
     * @returns {Object} the resource of type TYPE in a list of resources
     * @memberof PatternQuery
     */
    getResourceByType(resources, type) {
        const resourceURI = resources.find(resource => {
            return URIUtil.getURILabel(resource.type) == type;
        });
        return resourceURI ? resourceURI : undefined;
    }
}
