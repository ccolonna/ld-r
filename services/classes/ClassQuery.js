export default class ClassQuery {
    // here graphql let's you combine the two queries!!!!!!!!!!!!!!
    getClassesWithCentralityScore() {
        return `PREFIX arco-gm: <https://w3id.org/arco/graph.measures/>
            select distinct  ?uri ?pd {
            ?uri arco-gm:percentageDegree ?pd .
             } ORDER BY DESC(?pd)
        `;
    }
    getClassesWithPatternsTheyBelongsTo() {
        return `PREFIX opla: <http://ontologydesignpatterns.org/opla/>
                SELECT ?uri ?pattern WHERE {
                ?uri opla:isNativeTo ?pattern
    }`;
    }
    getClassesWithPatternsAndScores() {
        return `PREFIX opla: <http://ontologydesignpatterns.org/opla/>
                PREFIX arco-gm: <https://w3id.org/arco/graph.measures/>
                SELECT ?uri (SAMPLE(?label) as ?label) ?description ?pattern ?pd WHERE {
                    ?uri opla:isNativeTo ?pattern .
                    ?uri arco-gm:numberOfIncidentEdges ?pd .
                    ?uri rdfs:label ?label .
                    ?uri rdfs:comment ?description .
                    FILTER(LANG(?label) = "" || LANGMATCHES(LANG(?label), "en"))
                    FILTER(LANG(?description) = "" || LANGMATCHES(LANG(?description), "en"))
                 } ORDER BY DESC(?pd)
        `;
    }
    getResourcesByClass(classUri) {
        return `
            SELECT DISTINCT ?uri (SAMPLE(?label) as ?label) WHERE {
                ?uri a ?sc .
                ?sc rdfs:subClassOf* <${classUri}> .
                ?uri rdfs:label ?label .
            }
        `;
    }
    getPatternsByClass(classUri) {
        return `
        PREFIX opla: <http://ontologydesignpatterns.org/opla/>
            SELECT DISTINCT ?uri ?label WHERE {
                <${classUri}> opla:isNativeTo ?uri .
                ?uri rdfs:label ?label .
            }
        `;
    }
    getPatternInstancesWithTypeByResource(resourceUri) {
        return `
        PREFIX opla: <http://ontologydesignpatterns.org/opla/>
            SELECT DISTINCT ?uri ?type WHERE {
                <${resourceUri}> opla:belongsToPatternInstance ?uri .
                ?uri opla:isPatternInstanceOf ?type .
            }
        `;
    }
}
